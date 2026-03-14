import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronRight,
    Search,
    Filter,
    Download,
    Eye,
    Trash2,
    Star,
    ChevronLeft,
    Users,
    MoreHorizontal
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import { AppContext } from '../context/AppContext';

const ReviewLeads = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { leads } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;


    const [selectedLeads, setSelectedLeads] = useState([]);
    const [statusFilter, setStatusFilter] = useState('All');

    // Support both direct state passing and Context storage
    const [originalLeads, setOriginalLeads] = useState([]);


    useEffect(() => {
        const rawResults = location.state?.results;
        if (rawResults) {
            console.log("RECEIVED DATA FROM STATE:", rawResults);
            const leadsArray = Array.isArray(rawResults)
                ? rawResults
                : (rawResults.results || rawResults.data || []);
            setOriginalLeads(leadsArray);
        } else if (leads && leads.length > 0) {
            console.log("USING DATA FROM CONTEXT:", leads);
            setOriginalLeads(Array.isArray(leads) ? leads : (leads.results || leads.data || []));
        } else {
            setOriginalLeads([]);
        }
    }, [location.state, leads]);

    const queryInfo = location.state?.queryInfo ?? {};

    // Restore robust search and category filtering
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

    // StarRating Component with fractional support
    const StarRating = ({ rating, max = 5, size = 'md' }) => {
        const sizeClasses = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };
        return (
            <div className="flex items-center gap-0.5">
                {[...Array(max)].map((_, i) => {
                    const fill = Math.min(Math.max(rating - i, 0), 1);
                    const fillPct = Math.round(fill * 100);
                    return (
                        <span key={i} className={`relative inline-block ${sizeClasses[size] || 'text-base'} leading-none`} style={{ width: '1em', height: '1em' }}>
                            <span className="text-gray-200">★</span>
                            {fillPct > 0 && (
                                <span className="absolute inset-0 overflow-hidden text-yellow-400" style={{ width: `${fillPct}%` }}>★</span>
                            )}
                        </span>
                    );
                })}
                <span className="ml-1 text-[10px] text-gray-400 font-bold">{rating}</span>
            </div>
        );
    };



    return (


        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-10">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-generator')} className="hover:text-primary transition-colors">LEAD GENERATOR</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">REVIEW</span>
            </div>

            {/* Header section with Stats Card */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review Leads</h1>
                    <p className="text-gray-500 text-sm mt-1">Select and verify contacts before proceeding to enrichment.</p>
                </div>

                {/* Stats Card Styled as per screenshot */}
                <div className="bg-white px-6 py-4 rounded-xl border border-gray-100 flex items-center gap-4 shadow-sm min-w-[200px]">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">Total Leads</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{filteredLeads.length}</p>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <Card noPadding className="overflow-hidden border-none shadow-xl shadow-black/[0.02]">
                {/* Search and Filters Bar */}
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by business name, email..."
                            className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3 items-center">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select
                                className="pl-9 pr-8 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-xs font-bold text-gray-500 appearance-none focus:bg-white focus:border-primary/20 outline-none cursor-pointer transition-all uppercase tracking-wider"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <option value="All">All Categories</option>
                                {categories.filter(c => c !== "All").map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <select
                                className="pl-9 pr-8 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-xs font-bold text-gray-500 appearance-none focus:bg-white focus:border-primary/20 outline-none cursor-pointer transition-all uppercase tracking-wider"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Enriched">Enriched</option>
                                <option value="Validated">Validated</option>
                                <option value="Pending">Pending</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                <th className="px-8 py-5 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded text-primary border-gray-200 focus:ring-primary cursor-pointer"
                                        checked={currentLeads.length > 0 && currentLeads.every(l => selectedLeads.includes(l.id || l.MobileNumber || l.mobile_number))}
                                        onChange={(e) => {
                                            const currentIds = currentLeads.map(l => l.id || l.MobileNumber || l.mobile_number);
                                            if (e.target.checked) {
                                                setSelectedLeads(prev => [...new Set([...prev, ...currentIds])]);
                                            } else {
                                                setSelectedLeads(prev => prev.filter(id => !currentIds.includes(id)));
                                            }
                                        }}
                                    />
                                </th>
                                <th className="px-8 py-5">BUSINESS NAME</th>
                                <th className="px-8 py-5">CATEGORY</th>
                                <th className="px-8 py-5">MOBILE</th>
                                <th className="px-8 py-5">WEBSITE</th>
                                <th className="px-8 py-5">EMAIL</th>
                                <th className="px-8 py-5">RATING</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">ACTION</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {currentLeads.length > 0 ? (
                                currentLeads.map((lead, index) => {
                                    return (
                                        <tr key={lead.id || lead.MobileNumber || lead.mobile_number || index} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
                                            <td className="px-8 py-6">
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-primary border-gray-200 focus:ring-primary cursor-pointer"
                                                    checked={selectedLeads.includes(lead.id || lead.MobileNumber || lead.mobile_number)}
                                                    onChange={() => {
                                                        const id = lead.id || lead.MobileNumber || lead.mobile_number;
                                                        setSelectedLeads(prev =>
                                                            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
                                                        );
                                                    }}
                                                />
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{lead.name || lead.BusinessName || lead.business_name || 'N/A'}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{lead.location || lead.address || lead.Address || 'No location'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                                {lead.category || lead.Category || lead.business_category || lead.business_category_name || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-bold text-gray-500">
                                                {lead.mobile || lead.MobileNumber || lead.phone || lead.mobile_number || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                                                {lead.website || lead.Website || lead.business_website || 'N/A'}
                                            </td>
                                            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                                                {lead.email || lead.Email || lead.business_email || 'N/A'}
                                            </td>

                                            <td className="px-8 py-6">
                                                <StarRating rating={lead.rating || lead.Rating || lead.ratting || 0} size="sm" />
                                            </td>
                                            <td className="px-8 py-6 text-sm">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${['Validated', 'Active', 'Enriched'].includes(lead.status) ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'}`}>
                                                    {lead.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex items-center justify-end gap-3 text-gray-300">
                                                    <button
                                                        className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/lead-details', { state: { singleLead: lead, results: originalLeads, queryInfo } });
                                                        }}
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
                                    <td colSpan="9" className="px-8 py-20 text-center">
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
                    totalItems={filteredLeads.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />
            </Card>



            {/* Next Step Button */}
            <div className="flex justify-end">
                <Button
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
                    onClick={() => {
                        const leadsToPass = selectedLeads.length
                            ? filteredLeads.filter(l => {
                                const id = l.id || l.MobileNumber || l.mobile_number;
                                return selectedLeads.includes(id);
                            })
                            : filteredLeads;
                        navigate('/final-leads', {
                            state: {
                                results: leadsToPass,
                                queryInfo
                            }
                        });
                    }}
                >
                    Next
                    <ChevronRight size={18} />
                </Button>
            </div>
        </div>
    );
};

export default ReviewLeads;
