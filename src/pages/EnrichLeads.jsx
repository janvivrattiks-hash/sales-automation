import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import { AppContext } from '../context/AppContext';
import Api from '../../scripts/Api';

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
    const [leadData, setLeadData] = useState(null);
    const [filters, setFilters] = useState({
        website: 'Any',
        minRating: '',
        category: '',
        parameter: '',
    });

    const [selectedLeads, setSelectedLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [originalLeads, setOriginalLeads] = useState([]);
    const [isFiltering, setIsFiltering] = useState(false);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
    
    // Deletion State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [leadToDelete, setLeadToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const itemsPerPage = 5;

    useEffect(() => {
        if (location.state?.results) {
            const leadsArray = Array.isArray(location.state.results)
                ? location.state.results
                : location.state.results?.data || [];

            setLeadData({
                leads: leadsArray,
                ...(location.state.queryInfo || {})
            });
            setOriginalLeads(leadsArray);

            if (location.state.queryInfo?.niche) {
                setFilters(prev => ({ ...prev, category: location.state.queryInfo.niche }));
            }
        }
    }, [location.state]);

    const handleFilter = async () => {
        setIsFiltering(true);
        const filterParams = {
            website: filters.website || 'Any',
            ratings: filters.ratings || filters.minRating || 0,
            category: filters.category || ''
        };

        try {
            const response = await Api.filterLeads(filterParams, adminToken);
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

            // If user has specifically selected leads, we should prioritize them 
            // but if they are filtering, they likely want the filtered set as the new context.
            const finalLeads = selectedLeads.length > 0
                ? filteredData.filter(l => selectedLeads.includes(l.id || l.result_id || l.MobileNumber))
                : filteredData;

            navigate('/review-leads', {
                state: { 
                    results: finalLeads.length > 0 ? finalLeads : filteredData, 
                    queryInfo: {
                        niche: queryValue,
                        city: cityValue,
                        area: areaValue,
                        ...leadData
                    }
                }
            });
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
        const currentLeadIds = currentLeads.map(l => l.id || l.MobileNumber);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [baseLeads]);

    const leads = baseLeads.filter(lead => {
        if (!lead) return false;
        const name = (lead.name || lead.BusinessName || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    // Actions
    const handleDeleteClick = (id) => {
        setLeadToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!leadToDelete) return;
        setIsDeleting(true);
        try {
            const success = await Api.deleteLead(leadToDelete, adminToken);
            if (success) {
                // Update local state by filtering out the deleted lead
                setOriginalLeads(prev => prev.filter(l => (l.id || l.result_id || l.MobileNumber || l.business_information_id) !== leadToDelete));
                setIsDeleteModalOpen(false);
                setLeadToDelete(null);
            }
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setIsDeleting(false);
        }
    };

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
                navigate={navigate}
                queryValue={queryValue}
                cityValue={cityValue}
                areaValue={areaValue}
                onDeleteLead={handleDeleteClick}
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
                            ? leads.filter(l => selectedLeads.includes(l.id || l.MobileNumber || l.result_id))
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
