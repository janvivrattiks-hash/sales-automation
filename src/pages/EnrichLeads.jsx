import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import { AppContext } from '../context/AppContext';
import Api from '../../scripts/Api';
import { hasRealOwnerName, deepGet } from '../utils/contactUtils';

// Modular Components
import EnrichLeadsHeader from '../components/enrichLeads/EnrichLeadsHeader';
import FilterModal from '../components/enrichLeads/FilterModal';
import EnrichLeadsTable from '../components/enrichLeads/EnrichLeadsTable';
import DeleteConfirmModal from '../components/ui/DeleteConfirmModal';

const EnrichLeads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useContext(AppContext);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [leadData, setLeadData] = useState(() => {
        const results = location.state?.results;
        if (!results) return null;
        
        const leadsArray = Array.isArray(results) 
            ? results 
            : (results.leads || results.data || results.results || []);
            
        return {
            leads: leadsArray,
            ...location.state.queryInfo,
            ...(typeof results === 'object' && !Array.isArray(results) ? results : {})
        };
    });

    const [filters, setFilters] = useState(() => {
        const savedDraft = localStorage.getItem('lead_gen_draft_filters');
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                return { ...parsed, ...location.state?.filters };
            } catch (e) {
                console.error("Failed to parse saved filters", e);
            }
        }
        return location.state?.filters || {
            website: 'Any',
            minRating: '',
            category: '',
            reviews: '',
        };
    });

    // Save filter drafts whenever they change
    useEffect(() => {
        localStorage.setItem('lead_gen_draft_filters', JSON.stringify(filters));
    }, [filters]);


    const [selectedLeads, setSelectedLeads] = useState(location.state?.selectedLeads || []);
    const [currentPage, setCurrentPage] = useState(location.state?.currentPage || 1);
    const [searchTerm, setSearchTerm] = useState(location.state?.searchTerm || '');
    const [originalLeads, setOriginalLeads] = useState(() => {
        const results = location.state?.results;
        if (!results) return [];
        return Array.isArray(results) 
            ? results 
            : (results.leads || results.data || results.results || []);
    });

    const [isFiltering, setIsFiltering] = useState(false);
    const [filteredLeads, setFilteredLeads] = useState(location.state?.filteredLeads || []);
    const [isFiltered, setIsFiltered] = useState(location.state?.isFiltered || false);
    
    // Deletion State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [processingLeadId, setProcessingLeadId] = useState(null);

    const itemsPerPage = 5;

    useEffect(() => {
        console.log("📍 [EnrichLeads] Received location state:", location.state);
        console.log("📊 [EnrichLeads] leadData state:", leadData);
        
        // Sync niche to category filter if coming from generic navigation
        if (location.state?.queryInfo?.niche && !location.state?.filters) {
            setFilters(prev => ({ ...prev, category: location.state.queryInfo.niche }));
        }
    }, [location.state, leadData]);

    // Synchronize local state with history state for robust back-navigation preservation
    useEffect(() => {
        const historyPage = location.state?.currentPage;
        const historySelectedCount = location.state?.selectedLeads?.length || 0;
        const historySearch = location.state?.searchTerm;
        
        const needsSync = (currentPage !== historyPage) || 
                          (selectedLeads.length !== historySelectedCount) ||
                          (searchTerm !== historySearch);

        if (needsSync) {
            console.log("🔄 [EnrichLeads] Syncing pagination/selection to history:", { currentPage, selectedLeads: selectedLeads.length });
            navigate(location.pathname, {
                replace: true,
                state: {
                    ...location.state,
                    currentPage,
                    selectedLeads,
                    searchTerm
                }
            });
        }
    }, [currentPage, selectedLeads, searchTerm, location.pathname, location.state, navigate]);

    const handleFilter = async () => {
        setIsFiltering(true);
        // Robust Job ID extraction
        const jobId = leadData?.job_id || 
                      location.state?.queryInfo?.job_id || 
                      location.state?.job_id;
        
        console.log("🔍 [EnrichLeads] Attempting filter with Job ID:", jobId);
        
        if (!jobId) {
            console.error("❌ No Job ID found for filtering. State keys:", Object.keys(location.state || {}), "leadData keys:", Object.keys(leadData || {}));
            setIsFiltering(false);
            return;
        }

        const filterParams = {
            website: filters.website || 'Any',
            ratings: filters.ratings || filters.minRating || 0,
            reviews: filters.reviews || 0,
            category: filters.category || ''
        };

        try {
            // Use the new job-specific filter API
            const response = await Api.filterByJob(jobId, filterParams, adminToken);
            let filteredData = [];

            if (Array.isArray(response)) {
                filteredData = response;
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) filteredData = response.data;
                else if (Array.isArray(response.results)) filteredData = response.results;
                else if (Array.isArray(response.leads)) filteredData = response.leads;
                else {
                    const possibleArrays = Object.values(response).filter(Array.isArray);
                    if (possibleArrays.length > 0) {
                        filteredData = possibleArrays.sort((a, b) => b.length - a.length)[0];
                    }
                }
            }

            console.log("✅ Filtered Results:", filteredData);
            
            // Automatically navigate to Review page after filtering
            navigate('/review-leads', {
                state: {
                    results: filteredData,
                    queryInfo: { 
                        niche: queryValue, 
                        city: cityValue, 
                        area: areaValue,
                        ...leadData,
                        job_id: jobId 
                    },
                    filters: filterParams,
                    isFiltered: true,
                    filteredLeads: filteredData
                }
            });

            // Track as Pending Job
            const pendingJobs = JSON.parse(localStorage.getItem('lead_gen_pending_jobs') || '[]');
            const newPendingJob = {
                job_id: jobId,
                filters: filterParams,
                queryInfo: { niche: queryValue, city: cityValue, area: areaValue, ...leadData },
                timestamp: new Date().toISOString()
            };
            
            // Avoid duplicates
            const filteredPending = pendingJobs.filter(j => j.job_id !== jobId);
            localStorage.setItem('lead_gen_pending_jobs', JSON.stringify([...filteredPending, newPendingJob]));

        } catch (error) {
            console.error("Filter failed:", error);
        } finally {
            setIsFiltering(false);
        }
    };

    const toggleLeadSelection = (leadId) => {
        setSelectedLeads(prev =>
            prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]
        );
    };

    const toggleSelectAll = () => {
        const currentLeadIds = currentLeads.map(l => l.id || l.MobileNumber || l.result_id || l.business_information_id);
        const allSelected = currentLeadIds.every(id => selectedLeads.includes(id));
        if (allSelected) {
            setSelectedLeads(prev => prev.filter(id => !currentLeadIds.includes(id)));
        } else {
            setSelectedLeads(prev => [...new Set([...prev, ...currentLeadIds])]);
        }
    };

    // Derived state
    const queryValue = leadData?.niche || 'N/A';
    const cityValue = leadData?.city || 'N/A';
    const areaValue = leadData?.area || 'N/A';

    const baseLeads = isFiltered ? filteredLeads : originalLeads;

    const leads = baseLeads.filter(lead => {
        if (!lead) return false;
        const name = (lead.name || lead.BusinessName || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    const handleViewLead = useCallback(async (lead) => {
        if (!lead) return;

        // Extract ID
        const leadId = deepGet(lead, ['id', 'result_id', 'business_information_id', 'lead_id', 'search_id']);
        
        const navigationState = {
            ...location.state,
            results: originalLeads,
            queryInfo: { niche: queryValue, city: cityValue, area: areaValue },
            currentPage: currentPage,
            selectedLeads: selectedLeads,
            filters: filters,
            isFiltered: isFiltered,
            filteredLeads: filteredLeads,
            searchTerm: searchTerm,
            backUrl: '/enrich'
        };

        // CASE 1: Already has owner info — navigate directly
        if (hasRealOwnerName(lead)) {
            navigate('/lead-details', { 
                state: { ...navigationState, selectedLead: lead } 
            });
            return;
        }

        // CASE 2: No ID — cannot fetch fresh data
        if (!leadId) {
            navigate('/lead-details', { 
                state: { ...navigationState, singleLead: lead } 
            });
            return;
        }

        // CASE 3: Fetch fresh data
        try {
            setProcessingLeadId(leadId);
            const freshData = await Api.getLeadById(leadId, adminToken, true);
            const unwrappedData = freshData?.data || freshData;

            if (unwrappedData) {
                navigate('/lead-details', { 
                    state: { ...navigationState, selectedLead: { ...lead, ...unwrappedData } } 
                });
            } else {
                navigate('/lead-details', { 
                    state: { ...navigationState, singleLead: lead } 
                });
            }
        } catch (error) {
            console.error("Failed to fetch fresh lead data:", error);
            navigate('/lead-details', { 
                state: { ...navigationState, singleLead: lead } 
            });
        } finally {
            setProcessingLeadId(null);
        }
    }, [adminToken, originalLeads, queryValue, cityValue, areaValue, currentPage, selectedLeads, filters, isFiltered, filteredLeads, searchTerm, navigate]);

    const handleConfirmDelete = async () => {
        if (!leadToDelete) return;
        setIsDeleting(true);
        try {
            const success = await Api.deleteLead(leadToDelete, adminToken);
            if (success) {
                // Update local state by filtering out the deleted lead
                setOriginalLeads(prev => prev.filter(l => (l.id || l.MobileNumber || l.result_id || l.business_information_id) !== leadToDelete));
                setIsDeleteModalOpen(false);
                setLeadToDelete(null);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDeleteClick = (id) => {
        setLeadToDelete(id);
        setIsDeleteModalOpen(true);
    };

    // Deletion State

    // Empty state
    if (!leadData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-6 py-20">
                <div className="bg-gray-50 p-6 rounded-full">
                    <Search size={48} className="text-gray-300" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">No Lead Data Found</p>
                    <p className="text-sm text-gray-500 mt-1">Please generate leads from the generator page first.</p>
                </div>
                <Button onClick={() => navigate('/lead-generator')} className="px-8">
                    Go to Generator
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            <EnrichLeadsHeader
                queryValue={queryValue}
                cityValue={cityValue}
                areaValue={areaValue}
                leads={leads}
                navigate={navigate}
                onFilterOpen={() => setIsFilterModalOpen(true)}
                location={location}
            />

            <FilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                filters={filters}
                setFilters={setFilters}
                onApply={handleFilter}
                isFiltering={isFiltering}
            />
            <EnrichLeadsTable
                currentLeads={currentLeads}
                leads={leads}
                selectedLeads={selectedLeads}
                onToggleSelect={toggleLeadSelection}
                onToggleSelectAll={toggleSelectAll}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onViewLead={handleViewLead}
                processingLeadId={processingLeadId}
                queryValue={queryValue}
                cityValue={cityValue}
                areaValue={areaValue}
                onDeleteLead={handleDeleteClick}
                filters={filters}
                isFiltered={isFiltered}
                filteredLeads={filteredLeads}
                searchTerm={searchTerm}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isLoading={isDeleting}
                title="Delete Lead"
                message="Are you sure you want to delete this lead? This action cannot be undone."
            />

            {/* Next Step CTA */}
            <div className="flex justify-end">
                <Button
                    className="px-10 shadow-2xl shadow-primary/30 text-lg"
                    onClick={() => {
                        const leadsToPass = selectedLeads.length > 0
                            ? leads.filter(l => selectedLeads.includes(l.id || l.MobileNumber || l.result_id || l.business_information_id))
                            : leads;
                        navigate('/review-leads', {
                            state: {
                                results: leadsToPass,
                                queryInfo: { 
                                    niche: queryValue, 
                                    city: cityValue, 
                                    area: areaValue,
                                    ...leadData 
                                }
                            }
                        });
                    }}
                >
                    Next
                    <ChevronRight size={18} strokeWidth={3} />
                </Button>
            </div>
        </div>
    );
};

export default EnrichLeads;
