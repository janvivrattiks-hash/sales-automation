import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronRight,
    Loader2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import { AppContext } from '../context/AppContext';
import Api from '../../scripts/Api';

// Modularized Components
import ReviewLeadsHeader from '../components/reviewLeads/ReviewLeadsHeader';
import ReviewLeadsStats from '../components/reviewLeads/ReviewLeadsStats';
import ReviewLeadsFilters from '../components/reviewLeads/ReviewLeadsFilters';
import ReviewLeadsTable from '../components/reviewLeads/ReviewLeadsTable';
import EnrichingOverlay from '../components/reviewLeads/EnrichingOverlay';

const ReviewLeads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { leads, adminToken } = useContext(AppContext);
    
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [isEnriching, setIsEnriching] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [originalLeads, setOriginalLeads] = useState([]);
    const loadingLeadIdRef = useRef(null); // Synchronous ref to prevent concurrent calls
    
    const itemsPerPage = 5;

    useEffect(() => {
        const rawResults = location.state?.results;
        if (rawResults) {
            let leadsArray = [];
            if (Array.isArray(rawResults)) {
                leadsArray = rawResults;
            } else {
                leadsArray = rawResults.results || rawResults.data || rawResults.leads || [];
                // If it's still not an array but an object with a data property that's an array
                if (!Array.isArray(leadsArray) && leadsArray.data && Array.isArray(leadsArray.data)) {
                    leadsArray = leadsArray.data;
                }
            }
            setOriginalLeads(Array.isArray(leadsArray) ? leadsArray : []);
        } else if (leads && leads.length > 0) {
            setOriginalLeads(Array.isArray(leads) ? leads : (leads.results || leads.data || []));
        } else {
            setOriginalLeads([]);
        }
    }, [location.state, leads]);

    const queryInfo = location.state?.queryInfo ?? {};

    // Robust search and filtering logic
    const filteredLeads = React.useMemo(() => {
        let results = Array.isArray(originalLeads) ? [...originalLeads] : [];

        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            results = results.filter(lead => {
                const name = (lead?.name || lead?.BusinessName || lead?.business_name || "").toLowerCase();
                const email = (lead?.email || "").toLowerCase();
                return name.includes(searchLower) || email.includes(searchLower);
            });
        }

        if (categoryFilter !== "All") {
            results = results.filter(lead => {
                const cat = lead?.category || lead?.Category || lead?.business_category || lead?.business_category_name || "";
                return cat?.toLowerCase().includes(categoryFilter.toLowerCase());
            });
        }

        if (statusFilter !== "All") {
            results = results.filter(lead => {
                const status = (lead?.status || "Pending").toLowerCase();
                return status === statusFilter.toLowerCase();
            });
        }

        return results;
    }, [originalLeads, searchTerm, categoryFilter, statusFilter]);

    // Reset to first page when leads or filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [originalLeads, searchTerm, categoryFilter, statusFilter]);

    // Extract unique categories for the filter
    const categories = React.useMemo(() => {
        const cats = originalLeads
            .map(l => l?.category || l?.Category || l?.business_category || l?.business_category_name)
            .filter(Boolean);
        return ["All", ...Array.from(new Set(cats))];
    }, [originalLeads]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        document.body.style.overflow = 'unset';
        window.scrollTo(0, 0);
        const timer = setTimeout(() => window.scrollTo(0, 0), 10);
        return () => clearTimeout(timer);
    }, []);

    const handleSelectAll = useCallback((checked) => {
        const currentIds = currentLeads.map(l => l.id || l.MobileNumber || l.mobile_number);
        if (checked) {
            setSelectedLeads(prev => [...new Set([...prev, ...currentIds])]);
        } else {
            setSelectedLeads(prev => prev.filter(id => !currentIds.includes(id)));
        }
    }, [currentLeads]);

    const handleSelectOne = useCallback((id) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const handleViewLead = useCallback(async (lead) => {
        // Extract lead ID from various possible field names
        const leadId = lead.id || lead.result_id || lead.MobileNumber || lead.mobile_number || lead.search_id;
        
        if (!leadId) {
            navigate('/lead-details', { state: { singleLead: lead, results: originalLeads, queryInfo } });
            return;
        }

        // SYNCHRONOUS guard: prevent concurrent calls using useRef
        if (loadingLeadIdRef.current === leadId) {
            console.log("⏳ [ReviewLeads] Already loading lead:", leadId);
            return;
        }

        loadingLeadIdRef.current = leadId;
        console.log("📡 [ReviewLeads] Starting API call for ID:", leadId);
        
        try {
            const freshLeadData = await Api.getLeadById(leadId, adminToken);
            console.log("✅ [ReviewLeads] API Response received for ID:", leadId);
            
            if (loadingLeadIdRef.current === leadId) {
                if (freshLeadData) {
                    const leadDataToUse = freshLeadData?.data || freshLeadData;
                    navigate('/lead-details', { 
                        state: { 
                            singleLead: { ...lead, ...leadDataToUse }, 
                            results: originalLeads, 
                            queryInfo 
                        } 
                    });
                } else {
                    navigate('/lead-details', { state: { singleLead: lead, results: originalLeads, queryInfo } });
                }
            }
        } catch (error) {
            console.error('❌ [ReviewLeads] Error:', error);
            if (loadingLeadIdRef.current === leadId) {
                navigate('/lead-details', { state: { singleLead: lead, results: originalLeads, queryInfo } });
            }
        } finally {
            loadingLeadIdRef.current = null;
        }
    }, [adminToken, originalLeads, queryInfo, navigate]);

    const handleDeleteLead = useCallback((id) => {
        console.log("Delete lead:", id);
    }, []);

    const enrichLeads = async () => {
        const leadsToPass = selectedLeads.length
            ? filteredLeads.filter((lead) => {
                const id = lead.id || lead.MobileNumber || lead.mobile_number;
                return selectedLeads.includes(id);
            })
            : filteredLeads;

        if (!leadsToPass.length) {
            return;
        }

        setIsEnriching(true);
        try {
            const enrichedResults = await Api.enrichLeads(leadsToPass, adminToken);
            if (enrichedResults) {
                navigate("/final-leads", {
                    state: {
                        results: enrichedResults,
                        queryInfo
                    }
                });
            }
        } catch (error) {
            console.error("Enrich API Error:", error);
        } finally {
            setIsEnriching(false);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-10">
            {isEnriching && <EnrichingOverlay />}

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <ReviewLeadsHeader />
                    {queryInfo && (queryInfo.niche || queryInfo.city) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg uppercase tracking-wider">Target: {queryInfo.niche || 'N/A'}</span>
                            <span className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg uppercase tracking-wider">Location: {queryInfo.city || 'Any'} {queryInfo.area ? `(${queryInfo.area})` : ''}</span>
                        </div>
                    )}
                </div>
                <ReviewLeadsStats totalLeads={filteredLeads.length} />
            </div>

            <Card noPadding className="border-none shadow-xl shadow-black/[0.02]">
                <ReviewLeadsFilters 
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    categories={categories}
                />

                <ReviewLeadsTable 
                    currentLeads={currentLeads}
                    selectedLeads={selectedLeads}
                    onSelectAll={handleSelectAll}
                    onSelectOne={handleSelectOne}
                    onViewLead={handleViewLead}
                    onDeleteLead={handleDeleteLead}
                    isEnriching={isEnriching}
                />

                <Pagination
                    currentPage={currentPage}
                    totalItems={filteredLeads.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <div className="flex justify-end">
                <Button
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isEnriching}
                    onClick={enrichLeads}
                >
                    {isEnriching ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Enriching...
                        </>
                    ) : (
                        <>
                            Next
                            <ChevronRight size={18} />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
};

export default ReviewLeads;
