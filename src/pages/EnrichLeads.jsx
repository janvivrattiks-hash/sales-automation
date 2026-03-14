import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronRight,
    Filter,
    Download,
    Eye,
    Trash2,
    Star,
    ChevronLeft,
    Search,
    ChevronRight as ChevronRightIcon,
    ArrowRight,
    Plus,
    X,
    Users,
    Loader2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import Api from '../../scripts/Api';
import { AppContext } from '../context/AppContext';

// StarRating Component (same as LeadDetails)
const StarRating = ({ rating, max = 5, size = 'md' }) => {
    const sizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };
    return (
        <div className="flex items-center gap-0.5">
            {[...Array(max)].map((_, i) => {
                const fill = Math.min(Math.max(rating - i, 0), 1);
                const fillPct = Math.round(fill * 100);
                return (
                    <span
                        key={i}
                        className={`relative inline-block ${sizeClasses[size]} leading-none`}
                        style={{ width: '1em', height: '1em' }}
                    >
                        <span className="text-gray-200">★</span>
                        {fillPct > 0 && (
                            <span
                                className="absolute inset-0 overflow-hidden text-yellow-400"
                                style={{ width: `${fillPct}%` }}
                            >
                                ★
                            </span>
                        )}
                    </span>
                );
            })}
            <span className="ml-1 text-xs text-gray-400 font-medium">{rating}</span>
        </div>
    );
};

const EnrichLeads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { leads: contextLeads, filterLeads, setLeads, adminToken } = useContext(AppContext);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [leadData, setLeadData] = useState(null);
    const [filters, setFilters] = useState({
        website: 'Any',
        minRating: "",
        category: ""
    });

    const [selectedLeads, setSelectedLeads] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [originalLeads, setOriginalLeads] = useState([]);
    const [isFiltering, setIsFiltering] = useState(false);
    const [filteredLeads, setFilteredLeads] = useState([]);
    const [isFiltered, setIsFiltered] = useState(false);
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
        }
    }, [location.state]);


    const handleChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const handleFilter = async () => {

        setIsFiltering(true);

        const filterParams = {
            website:
                filters.website === "Any"
                    ? null
                    : filters.website === "Yes"
                        ? "yes"
                        : "no",
            ratting: filters.minRating || null,
            category: filters.category || null
        };

        console.log("FILTER PARAMS:", filterParams);

        const response = await Api.filterLeads(filterParams, adminToken);

        const filteredData =
            Array.isArray(response)
                ? response
                : response?.data || response?.results || [];

        console.log("FILTERED DATA:", filteredData);

        navigate("/review-leads", {
            state: {
                results: filteredData
            }
        });

        setIsFiltering(false);
    };




    const toggleLeadSelection = (leadId) => {
        setSelectedLeads(prev =>
            prev.includes(leadId)
                ? prev.filter(id => id !== leadId)
                : [...prev, leadId]
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

    // Extract properties safely from leadData
    const queryValue = leadData?.query || 'N/A';
    const cityValue = leadData?.city || 'N/A';
    const areaValue = leadData?.area || 'N/A';

    // Choose the source of leads: 
    // Priority: Filtered results (even if empty) > Original generated leads
    const baseLeads = isFiltered ? filteredLeads : originalLeads;

    // Reset to first page when results change
    useEffect(() => {
        setCurrentPage(1);
    }, [baseLeads]);

    // Apply frontend search filter
    const leads = baseLeads.filter(lead => {
        if (!lead) return false;
        const name = (lead.name || lead.BusinessName || '').toLowerCase();
        const email = (lead.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentLeads = leads.slice(startIndex, startIndex + itemsPerPage);

    // Show loading or no data states
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
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-details', { state: { results: leads, queryInfo: { query: queryValue, city: cityValue, area: areaValue } } })} className="hover:text-primary transition-colors">LEAD DETAILS</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">ENRICH</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Enrich Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Review and verify lead data before exporting to CRM.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsFilterModalOpen(true)}>
                        <Filter size={18} /> Filter
                    </Button>
                    <Button variant="outline">
                        <Download size={18} /> Export
                    </Button>
                </div>
            </div>

            {/* Filter Modal */}
            <Modal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                title="Filter Leads"
                footer={
                    <div className="flex items-center justify-end w-full gap-4">
                        <button
                            onClick={() => setIsFilterModalOpen(false)}
                            className="text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <Button
                            onClick={handleFilter}
                            disabled={isFiltering}
                            className="px-8 flex items-center gap-2"
                        >
                            {isFiltering ? <Loader2 className="animate-spin" size={18} /> : 'Apply Filters'}
                        </Button>
                    </div>
                }
            >
                <div className="space-y-8">
                    {/* Website Available */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900">Website Available</label>
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            {['Any', 'Yes', 'No'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setFilters({
                                        ...filters,
                                        website: option
                                    })}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filters.website === option
                                        ? 'bg-white text-primary shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Min Google Rating */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-gray-900">Min. Google Rating</label>
                            <span className="bg-primary/5 text-primary text-xs font-black px-2.5 py-1 rounded-lg border border-primary/10">
                                {filters.minRating}
                            </span>
                        </div>
                        <div className="relative pt-2">
                            <input
                                type="range"
                                min="0"
                                max="5"
                                step="0.1"
                                value={filters.minRating || 0}
                                onChange={(e) => setFilters({ ...filters, minRating: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary"
                                style={{
                                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(filters.minRating / 5) * 100}%, #f3f4f6 ${(filters.minRating / 5) * 100}%, #f3f4f6 100%)`
                                }}
                            />
                            <div className="flex justify-between mt-4">
                                {[0, 1, 2, 3, 4, 5].map((val) => (
                                    <span key={val} className="text-[10px] font-bold text-gray-400">{val}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900">Category</label>
                        <input
                            type="text"
                            name="category"
                            placeholder="e.g. Cafe, Restaurant, Hotel"
                            className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={filters.category}
                            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        />
                    </div>

                    {/* Additional Parameters */}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-gray-900">Additional Parameters</label>
                        <div className="relative">
                            <select
                                className="w-full pl-4 pr-10 py-3 bg-white border border-gray-100 rounded-xl text-sm font-medium text-gray-500 appearance-none focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer transition-all"
                                value={filters.parameter}
                                onChange={(e) => setFilters({ ...filters, parameter: e.target.value })}
                            >
                                <option value="" disabled>Select parameter (e.g., Industry, Size)</option>
                                <option value="industry">Industry</option>
                                <option value="size">Company Size</option>
                                <option value="revenue">Annual Revenue</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <ChevronRightIcon size={18} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    {/* Add More */}
                    <button className="flex items-center gap-2 text-primary text-sm font-bold hover:opacity-80 transition-opacity">
                        <Plus size={18} /> Add More
                    </button>
                </div>
            </Modal>



            {/* Leads Table */}
            <Card noPadding className="overflow-hidden border-none shadow-xl shadow-black/[0.02]">


                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] md:min-w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                <th className="px-8 py-5 w-10">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                            checked={currentLeads.length > 0 && currentLeads.every(l => selectedLeads.includes(l.id || l.MobileNumber))}
                                            onChange={toggleSelectAll}
                                        />
                                    </div>
                                </th>
                                <th className="px-4 py-5">BUSINESS NAME</th>
                                <th className="px-8 py-5">CONTACT MOBILE</th>
                                <th className="px-8 py-5">EMAIL</th>
                                <th className="px-8 py-5">WEBSITE</th>
                                <th className="px-8 py-5">RATING</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {currentLeads.length > 0 ? (
                                currentLeads.map((lead, index) => {
                                    const isSelected = selectedLeads.includes(lead.id || lead.MobileNumber);
                                    return (
                                        <tr key={lead.id || index} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                                        checked={isSelected}
                                                        onChange={() => toggleLeadSelection(lead.id || lead.MobileNumber)}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    {/* <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs bg-primary/10 text-primary">
                                                        {(lead.name || lead.BusinessName || 'NA').substring(0, 2).toUpperCase()}
                                                    </div> */}
                                                    <div>
                                                        <p
                                                            className="font-bold text-gray-900 text-sm leading-tight hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-4"
                                                            onClick={() => navigate('/lead-details', {
                                                                state: {
                                                                    singleLead: lead,
                                                                    results: leads,
                                                                    queryInfo: {
                                                                        query: queryValue,
                                                                        city: cityValue,
                                                                        area: areaValue
                                                                    }
                                                                }
                                                            })}
                                                        >
                                                            {lead.name || lead.BusinessName || lead.business_name || 'N/A'}
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{lead.address || lead.Address || 'No address'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                                {lead.phone || lead.MobileNumber || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                                                {lead.email || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                                                {lead.website || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6">
                                                <StarRating rating={lead.rating || lead.Rating || lead.ratting || 0} size="sm" />
                                            </td>
                                            <td className="px-8 py-6 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${['Validated', 'Active', 'Enriched'].includes(lead.status)
                                                    ? 'bg-green-50 text-green-500'
                                                    : 'bg-orange-50 text-orange-500'
                                                    }`}>
                                                    {lead.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 text-gray-300">
                                                    <button
                                                        className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90"
                                                        onClick={() => navigate('/lead-details', {
                                                            state: {
                                                                singleLead: lead,
                                                                results: leads,
                                                                queryInfo: {
                                                                    query: queryValue,
                                                                    city: cityValue,
                                                                    area: areaValue
                                                                }
                                                            }
                                                        })}
                                                    >
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Users size={40} className="mb-2 opacity-20" />
                                            <p className="font-bold text-lg text-gray-900">No leads found</p>
                                            <p className="text-sm">Try adjusting your filters or search terms.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={leads.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </Card>

            <div className="flex justify-end">
                <Button
                    className="px-10 shadow-2xl shadow-primary/30 text-lg"
                    onClick={() => {
                        const leadsToPass = selectedLeads.length > 0
                            ? leads.filter(l => selectedLeads.includes(l.id || l.MobileNumber))
                            : leads;
                        navigate('/review-leads', {
                            state: {
                                results: leadsToPass,
                                queryInfo: {
                                    query: queryValue,
                                    city: cityValue,
                                    area: areaValue
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
