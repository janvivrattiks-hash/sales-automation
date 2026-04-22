import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, Zap, Loader2, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import { AppContext } from '../context/AppContext';
import Api from '../../scripts/Api';
import { toast } from 'react-toastify';

// Utilities
import { exportLeadsCSV } from '../utils/exportCsvHelper';

// Modular Components
import EnrichedStatsRow from '../components/finalEnrichedLeads/EnrichedStatsRow';
import EnrichedLeadsTable from '../components/finalEnrichedLeads/EnrichedLeadsTable';
import SaveAudienceModal from '../components/finalEnrichedLeads/SaveAudienceModal';
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal';

const FinalEnrichedLeads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { leads: contextLeads, adminToken } = useContext(AppContext);

    // ── Helper to extract the core Business/POI ID ────────────────────────────
    const extractBusinessId = (lead) => {
        if (!lead) return null;
        
        // 1. Prioritize the main 'id' field as it holds the verified business ID 
        // after enrichment (verified by DB schema).
        if (lead.id) return lead.id;

        // 2. Fallback to specialized fields (preserved from pre-enrichment search results)
        const knownId = lead.poi_id || lead.business_id || lead.result_id;
        if (knownId) return knownId;

        // 3. Robust scan for ANY UUID field (Last resort fallback)
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        for (const [key, value] of Object.entries(lead)) {
            if (typeof value === 'string' && uuidPattern.test(value)) return value;
        }

        return null;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [audienceData, setAudienceData] = useState({
        audiance_name: '',
        discription: '',
        icp: '',
        tag: 'High Priority'
    });
    const [uiTags, setUiTags] = useState(['High Priority']);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // Audience Save Additions
    const [saveMode, setSaveMode] = useState('new');
    const [selectedAudienceId, setSelectedAudienceId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [audiences, setAudiences] = useState([]);

    useEffect(() => {
        if (adminToken) {
            Api.getAudiences(adminToken).then(res => {
                if (res) {
                    setAudiences(Array.isArray(res) ? res : (res.data || res.results || []));
                }
            }).catch(err => console.error("Error fetching audiences:", err));
        }
    }, [adminToken]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const timer = setTimeout(() => window.scrollTo(0, 0), 10);
        return () => clearTimeout(timer);
    }, []);

    // ── Delete Modal State ───────────────────────────────────────────────────
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ── Data Ingestion ────────────────────────────────────────────────────────
    const locationLeads = location.state?.results || [];
    const leadsToEnrich = location.state?.leadsToEnrich || [];
    const [leadsData, setLeadsData] = useState(locationLeads);
    // Initialize count: check history first, then fallback to (Total - Already showing)
    const [inProgressCount, setInProgressCount] = useState(
        location.state?.inProgressCount ?? Math.max(0, leadsToEnrich.length - locationLeads.length)
    );
    const queryInfo = location.state?.queryInfo || {};
    const { user } = useContext(AppContext);

    // ── Real-time WebSocket Enrichment ──────────────────────────────────────────
    useEffect(() => {
        if (!user?.admin_id || leadsToEnrich.length === 0) return;

        const baseUrl = import.meta.env.VITE_BASE_URL_DEVELOPMENT || "http://192.168.1.39:8000";
        const wsUrl = baseUrl.replace('http', 'ws') + `/ws/notifications/${user.admin_id}`;
        
        console.log("🔌 [FinalEnrichedLeads] Connecting to Data Stream:", wsUrl);
        const ws = new WebSocket(wsUrl);

        ws.onmessage = async (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.status === "completed") {
                    toast.success(`${data.business_name} Enriched!`);
                    
                    // 1. Fetch the enrichment JSON to get the business ID (id)
                    const enrichmentResponse = await Api.getEnrichmentJson(data.job_id, adminToken);
                    
                    if (enrichmentResponse && enrichmentResponse.id) {
                        const businessId = enrichmentResponse.id;
                        console.log(`🔍 [FinalEnrichedLeads] Fetching full POI details for business: ${businessId}`);
                        
                        // 2. Fetch full POI details using the business ID
                        const fullPoiDetails = await Api.getPoiDetails(businessId, adminToken);
                        
                        if (fullPoiDetails) {
                            // Extract email and website from enrichmentResponse and add it to fullPoiDetails
                            const aiData = enrichmentResponse?.ai_enrichment_data;
                            
                            // Email extraction
                            const decEmail = aiData?.decision_maker_intelligence?.email_address;
                            const ownerEmails = aiData?.owner_phone_verification?.business_emails;
                            const finalEmails = [...(Array.isArray(ownerEmails) ? ownerEmails : []), (decEmail ? decEmail : null)].filter(Boolean);
                            
                            // Website extraction (fix for "yes")
                            const aiWebsite = aiData?.digital_presence_audit?.website?.url;
                            
                            // 3. Add the fully detailed object to the table, merging the data
                            setLeadsData(prev => [...prev, { 
                                ...fullPoiDetails, 
                                email: finalEmails.length > 0 ? finalEmails.join(', ') : fullPoiDetails.email,
                                website: aiWebsite || fullPoiDetails.website,
                                status: 'Enriched' 
                            }]);
                            setInProgressCount(prev => {
                                const nextVal = Math.max(0, prev - 1);
                                console.log(`📉 [FinalEnrichedLeads] Count decremented: ${prev} -> ${nextVal}`);
                                return nextVal;
                            });
                        } else {
                            // Fallback to enrichment response if POI details fail
                            setLeadsData(prev => [...prev, { ...enrichmentResponse, status: 'Enriched' }]);
                            setInProgressCount(prev => Math.max(0, prev - 1));
                        }
                    } else if (enrichmentResponse) {
                        // Fallback if no ID found
                        setLeadsData(prev => [...prev, { ...enrichmentResponse, status: 'Enriched' }]);
                        setInProgressCount(prev => Math.max(0, prev - 1));
                    }
                } else if (data.status === "failed") {
                    toast.error(`${data.business_name} Failed: ${data.error}`);
                    setInProgressCount(prev => Math.max(0, prev - 1));
                }
            } catch (err) {
                console.error("❌ WS Parsing Error:", err);
            }
        };

        return () => ws.close();
    }, [user?.admin_id, leadsToEnrich.length, adminToken]);

    // ── Aggressive State Synchronization ──────────────────────────────────────
    useEffect(() => {
        const historyResultsLength = location.state?.results?.length || 0;
        const historyInProgressCount = location.state?.inProgressCount ?? -1;
        const historyPage = location.state?.currentPage;

        // Sync local state to history if results, progress count, or page changed
        const needsUpdate = (leadsData.length !== historyResultsLength) || 
                            (inProgressCount !== historyInProgressCount) ||
                            (currentPage !== historyPage);

        if (needsUpdate) {
            console.log("🔄 [FinalEnrichedLeads] Syncing progress to history state:", { 
                results: leadsData.length, 
                inProgress: inProgressCount,
                page: currentPage
            });
            navigate(location.pathname, {
                replace: true,
                state: {
                    ...location.state,
                    leadsToEnrich: inProgressCount === 0 ? [] : (location.state?.leadsToEnrich || []),
                    results: leadsData,
                    inProgressCount: inProgressCount,
                    currentPage: currentPage
                }
            });
        }
    }, [leadsData, inProgressCount, currentPage, location.pathname, location.state, navigate]);

    // ── Multi-tier De-duplication ─────────────────────────────────────────────
    const uniqueLeads = [];
    const seenLeadKeys = new Set();
    (leadsData || []).forEach(lead => {
        if (!lead) return;
        const id = extractBusinessId(lead);
        const rawName = lead.name || lead.BusinessName || lead.business_name || '';
        const rawAddr = lead.address || lead.Address || lead.full_address || lead.location || '';
        const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normAddr = rawAddr.toLowerCase().replace(/[^a-z0-9]/g, '');
        const nameAddrKey = (normName && normAddr) ? `na-${normName}-${normAddr}` : null;
        const rawPhone = String(lead.mobile || lead.MobileNumber || lead.phone || '');
        const normPhone = rawPhone.replace(/\D/g, '');
        const phoneKey = (normPhone && normPhone.length >= 8) ? `ph-${normPhone}` : null;
        const rawEmail = lead.email || lead.Email || '';
        const emailKey = rawEmail ? `em-${rawEmail.toLowerCase().trim()}` : null;

        const isDup = (id && seenLeadKeys.has(id)) ||
            (nameAddrKey && seenLeadKeys.has(nameAddrKey)) ||
            (phoneKey && seenLeadKeys.has(phoneKey)) ||
            (emailKey && seenLeadKeys.has(emailKey));

        if (!isDup) {
            if (id) seenLeadKeys.add(id);
            if (nameAddrKey) seenLeadKeys.add(nameAddrKey);
            if (phoneKey) seenLeadKeys.add(phoneKey);
            if (emailKey) seenLeadKeys.add(emailKey);
            uniqueLeads.push(lead);
        }
    });

    const leads = uniqueLeads;
    const totalLeads = leads.length;
    const verifiedEmails = leads.filter(l => l.email || l.Email || l.verified_email).length;
    const enrichmentRate = totalLeads > 0
        ? Math.round((leads.filter(l => l.is_enriched || l.email || l.instagram || l.facebook).length / totalLeads) * 100)
        : 0;

    const stats = [
        { label: 'Total Contact Leads', value: totalLeads.toLocaleString(), change: '', icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50' },
        { label: 'Verified Emails', value: verifiedEmails.toLocaleString(), change: '', icon: CheckCircle2, color: 'text-green-500', bgColor: 'bg-green-50' },
        { label: 'Enrichment Rate', value: `${enrichmentRate}%`, change: '', icon: Zap, color: 'text-purple-500', bgColor: 'bg-purple-50' },
    ];

    // ── Search Filter ──────────────────────────────────────────────────────────
    const filteredLeads = leads.filter(lead => {
        const search = searchTerm.toLowerCase();
        return (
            (lead.name || lead.BusinessName || '').toLowerCase().includes(search) ||
            (lead.email || lead.Email || '').toLowerCase().includes(search) ||
            (lead.category || lead.industry || '').toLowerCase().includes(search)
        );
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

    // ── Save Audience ─────────────────────────────────────────────────────────
    const handleSaveAudience = async () => {
        const ids = (filteredLeads || []).map(l => {
            const bizId = extractBusinessId(l);
            console.log(`📍 [Audience] Mapping lead '${l.name || 'N/A'}' to ID: ${bizId}`, l);
            return bizId;
        }).filter(Boolean);
        
        if (ids.length === 0) {
            toast.error("No contacts available to save.");
            return;
        }

        setIsSaving(true);
        try {
            if (saveMode === 'existing') {
                if (!selectedAudienceId) {
                    toast.error("Please select an existing audience.");
                    setIsSaving(false);
                    return;
                }
                const response = await Api.addLeadsToExistingAudience(selectedAudienceId, ids, adminToken);
                if (response) {
                    setIsModalOpen(false);
                    setSaveMode('new');
                    setSelectedAudienceId('');
                    navigate('/audience-list');
                }
            } else {
                if (!audienceData.audiance_name) {
                    toast.error("Audience name is required.");
                    setIsSaving(false);
                    return;
                }
                const payload = {
                    audiance_name: audienceData.audiance_name,
                    discription: audienceData.discription,
                    icp: audienceData.icp,
                    tag: uiTags.join(', '),
                    business_ids: ids
                };
                const response = await Api.saveAudience(payload, adminToken);
                console.log("Audience saved successfully with IDs:", ids.length);
                if (response) {
                    setIsModalOpen(false);
                    setAudienceData({ audiance_name: '', discription: '', icp: '', tag: '' });
                    setUiTags(['High Priority']);
                    navigate('/audience-list');
                }
            }
        } catch (error) {
            console.error('Error saving audience:', error);
            toast.error("Failed to save audience");
        } finally {
            setIsSaving(false);
        }
    };

    // ── Delete Functionality ──────────────────────────────────────────────────
    const handleDeleteClick = (lead) => {
        setLeadToDelete(lead);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!leadToDelete) return;
        
        const backendId = extractBusinessId(leadToDelete);
        if (!backendId) {
            console.error("No ID found for deletion");
            return;
        }

        setIsDeleting(true);
        try {
            console.log(`📡 Deleting enriched lead: ${backendId}`);
            const success = await Api.deleteEnrichedLead(backendId, adminToken);
            if (success) {
                // Update local state
                setLeadsData(prev => prev.filter(l => extractBusinessId(l) !== backendId));
                setIsDeleteModalOpen(false);
                setLeadToDelete(null);
            }
        } catch (error) {
            console.error("Delete Error:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-10">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">Final Enriched Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and export your data</p>
                </div>
            </div>

            <EnrichedStatsRow stats={stats} />

            <EnrichedLeadsTable
                filteredLeads={filteredLeads}
                currentLeads={currentLeads}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onExportCSV={() => exportLeadsCSV(leads)}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                navigate={navigate}
                queryInfo={queryInfo}
                leads={leads}
                onDeleteLead={handleDeleteClick}
            />

            {/* Action Bar */}
            <div className="flex justify-end pt-4">
                <Button
                    className="px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold py-3 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    onClick={() => setIsModalOpen(true)}
                >
                    Save Audience
                </Button>
            </div>

            <SaveAudienceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                audienceData={audienceData}
                setAudienceData={setAudienceData}
                uiTags={uiTags}
                setUiTags={setUiTags}
                onSave={handleSaveAudience}
                audiences={audiences}
                saveMode={saveMode}
                setSaveMode={setSaveMode}
                selectedAudienceId={selectedAudienceId}
                setSelectedAudienceId={setSelectedAudienceId}
                isSaving={isSaving}
                leadsCount={filteredLeads.length}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title="Delete Enriched Lead?"
                description={`Are you sure you want to delete ${leadToDelete?.name || 'this lead'}? This action cannot be undone.`}
            />

            {/* Enrichment Progress UI */}
            {inProgressCount > 0 && (
                leadsData.length === 0 ? (
                    /* Stage 1: Initial Centered Modal before first result */
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-md transition-opacity duration-300"></div>
                        <div className="relative bg-white border border-blue-100 p-10 rounded-[2.5rem] shadow-2xl shadow-blue-900/10 flex flex-col items-center text-center max-w-sm w-full animate-in zoom-in-95 duration-500">
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-[1.5] animate-pulse"></div>
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-500/20 relative z-10">
                                    <Loader2 size={40} className="animate-spin" />
                                </div>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles size={16} className="text-blue-600" />
                                <p className="text-xs font-black text-blue-600 uppercase tracking-widest leading-none">AI Engine Triggered</p>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2">Analyzing Intelligence...</h3>
                            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
                                We are scouring profiles, websites, and databases. First result arriving shortly.
                            </p>
                            <div className="bg-blue-50 text-blue-700 font-bold text-sm px-6 py-3 rounded-xl border border-blue-100 w-full">
                                {inProgressCount} businesses in queue
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Stage 2: Mini Progress Overlay after first result */
                    <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
                        <div className="bg-white/80 backdrop-blur-xl border border-blue-100 p-6 rounded-[2rem] shadow-2xl shadow-blue-900/10 flex items-center gap-6 min-w-[320px]">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-full scale-150 animate-pulse"></div>
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg relative z-10">
                                    <Loader2 size={28} className="animate-spin" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles size={14} className="text-blue-600" />
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">AI Engine Active</p>
                                </div>
                                <h4 className="text-lg font-black text-gray-900 leading-tight">Enriching Leads...</h4>
                                <div className="mt-1 flex items-end gap-2">
                                    <div className="text-xl font-black text-blue-600">{inProgressCount}</div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-1">Remaining in queue</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            )}
        </div>
    );
};

export default FinalEnrichedLeads;
