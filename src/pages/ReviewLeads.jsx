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
import { hasRealOwnerName, deepGet } from '../utils/contactUtils';

// Modularized Components
import ReviewLeadsHeader from '../components/reviewLeads/ReviewLeadsHeader';
import ReviewLeadsStats from '../components/reviewLeads/ReviewLeadsStats';
import ReviewLeadsFilters from '../components/reviewLeads/ReviewLeadsFilters';
import ReviewLeadsTable from '../components/reviewLeads/ReviewLeadsTable';
import EnrichmentProgressModal from '../components/reviewLeads/EnrichmentProgressModal';

const ReviewLeads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { leads, adminToken, user } = useContext(AppContext);
    
    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);
    const [isEnriching, setIsEnriching] = useState(false);
    const [selectedLeads, setSelectedLeads] = useState(location.state?.selectedLeads || []);
    const [originalLeads, setOriginalLeads] = useState([]);
    const [leadsToEnrich, setLeadsToEnrich] = useState(location.state?.leadsToEnrich || []);
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
    
    // Synchronize local state with history state for robust back-navigation preservation
    useEffect(() => {
        const historyPage = location.state?.currentPage;
        const historySelectedCount = location.state?.selectedLeads?.length || 0;
        const historySearch = location.state?.searchTerm;
        const historyStatus = location.state?.statusFilter;
        const historyCategory = location.state?.categoryFilter;
        
        const needsSync = (currentPage !== historyPage) || 
                          (selectedLeads.length !== historySelectedCount) ||
                          (searchTerm !== historySearch) ||
                          (statusFilter !== historyStatus) ||
                          (categoryFilter !== historyCategory);

        if (needsSync) {
            console.log("🔄 [ReviewLeads] Syncing filters/pagination to history:", { currentPage, selected: selectedLeads.length });
            navigate(location.pathname, {
                replace: true,
                state: {
                    ...location.state,
                    currentPage,
                    selectedLeads,
                    searchTerm,
                    statusFilter,
                    categoryFilter
                }
            });
        }
    }, [currentPage, selectedLeads, searchTerm, statusFilter, categoryFilter, location.pathname, location.state, navigate]);

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
        if (!lead) return;

        // 1. Check if we already have the info we need
        if (hasRealOwnerName(lead)) {
            navigate('/lead-details', { 
                state: { singleLead: lead, results: originalLeads, queryInfo, backUrl: '/review-leads' } 
            });
            return;
        }

        // 2. Extract lead ID
        const leadId = deepGet(lead, ['id', 'result_id', 'business_information_id', 'lead_id', 'search_id']);
        
        if (!leadId) {
            navigate('/lead-details', { 
                state: { 
                    ...location.state,
                    singleLead: lead, 
                    results: originalLeads, 
                    queryInfo, 
                    selectedLeads,
                    currentPage,
                    searchTerm,
                    categoryFilter,
                    statusFilter,
                    backUrl: '/review-leads' 
                } 
            });
            return;
        }

        // SYNCHRONOUS guard: prevent concurrent calls using useRef
        if (loadingLeadIdRef.current === leadId) return;

        loadingLeadIdRef.current = leadId;
        
        try {
            // Fetch with cache bypass
            const freshLeadData = await Api.getLeadById(leadId, adminToken, true);
            const dataToUse = freshLeadData?.data || freshLeadData;
            
            if (loadingLeadIdRef.current === leadId) {
                navigate('/lead-details', { 
                    state: { 
                        ...location.state,
                        selectedLead: dataToUse ? { ...lead, ...dataToUse } : lead, 
                        results: originalLeads, 
                        queryInfo,
                        selectedLeads,
                        currentPage,
                        searchTerm,
                        categoryFilter,
                        statusFilter,
                        backUrl: '/review-leads'
                    } 
                });
            }
        } catch (error) {
            console.error('❌ [ReviewLeads] Error:', error);
            if (loadingLeadIdRef.current === leadId) {
                navigate('/lead-details', { 
                    state: { 
                        ...location.state,
                        singleLead: lead, 
                        results: originalLeads, 
                        queryInfo, 
                        selectedLeads,
                        currentPage,
                        searchTerm,
                        categoryFilter,
                        statusFilter,
                        backUrl: '/review-leads' 
                    } 
                });
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

        try {
            // Trigger enrichment (starts the background tasks)
            Api.enrichLeads(leadsToPass, adminToken); // Fire and forget, we'll listen on the next page
            
            // Clear from Pending Jobs
            const jobId = queryInfo.job_id;
            if (jobId) {
                const pendingJobs = JSON.parse(localStorage.getItem('lead_gen_pending_jobs') || '[]');
                const updatedPending = pendingJobs.filter(j => j.job_id !== jobId);
                localStorage.setItem('lead_gen_pending_jobs', JSON.stringify(updatedPending));
            }

            navigate("/final-leads", {
                state: {
                    leadsToEnrich: leadsToPass,
                    queryInfo
                }
            });

        } catch (error) {
            console.error("Enrich API Error:", error);
        }
    };

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-10">

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <ReviewLeadsHeader leads={originalLeads} queryInfo={queryInfo} location={location} />
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

            <div className="flex justify-between items-center">
                <Button
                    variant="outline"
                    className="px-8 py-3 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl font-bold transition-all active:scale-95"
                    onClick={() => navigate('/enrich', { 
                        state: { 
                            ...location.state,
                            results: originalLeads, 
                            queryInfo,
                            selectedLeads
                        } 
                    })}
                >
                    Back
                </Button>

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
