import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    Users,
    Search,
    Filter,
    Download,
    Upload,
    MoreHorizontal,
    Mail,
    Phone,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Settings,
    Eye,
    Trash2,
    Loader2,
    Globe,
    Facebook,
    Instagram,
    Linkedin
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Pagination from '../components/ui/Pagination';
import Api from '../../scripts/Api';
import { AppContext } from '../context/AppContext';

const Contacts = () => {
    const [rawContacts, setRawContacts] = useState([]);
    const [enrichedContacts, setEnrichedContacts] = useState([]);
    const [audiences, setAudiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [audLoading, setAudLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEnriched, setIsEnriched] = useState(false);
    const [viewingId, setViewingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });
    const [deletingId, setDeletingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [audSearchQuery, setAudSearchQuery] = useState('');
    
    const navigate = useNavigate();
    const { adminToken, leads: contextLeads } = useContext(AppContext);
    const itemsPerPage = 10;

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

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const fetchData = async () => {
        if (!adminToken) return;
        setLoading(true);
        try {
            // Sourcing enriched data from global context (FinalEnrichedLeads flow)
            // as requested, instead of redundant filterLeads API calls for enriched data
            const enrichedLeads = contextLeads || [];

            // Fetch recent activities for raw/general data
            const recentActivities = await Api.getRecent(adminToken);
            const recentLeads = recentActivities?.flatMap(activity => activity.results || []) || [];

            // Merge everything and de-duplicate
            const leadMap = new Map();
            
            // Priority ordering: contextLeads > recentLeads
            [...recentLeads, ...enrichedLeads].forEach(lead => {
                const key = lead.result_id || lead.id || lead.BusinessName || lead.name;
                if (key) {
                    const existing = leadMap.get(key);
                    const isLeadenriched = l => l.status === 'Enriched' || l.is_enriched || l.email || l.website || l.facebook;
                    
                    // If we already have it, keep it if it's more enriched than the new one
                    if (!existing || (!isLeadenriched(existing) && isLeadenriched(lead))) {
                        leadMap.set(key, lead);
                    }
                }
            });

            const allLeads = Array.from(leadMap.values());

            // Refined criteria for enrichment
            const enriched = allLeads.filter(l => 
                l.status === 'Enriched' || 
                l.is_enriched || 
                l.email || 
                l.Email ||
                l.facebook || 
                l.facebook_url ||
                l.instagram || 
                l.instagram_url ||
                l.linkedin || 
                l.linkedin_url ||
                l.website ||
                l.Website ||
                l.website_url
            );
            const raw = allLeads.filter(l => !enriched.includes(l));

            setRawContacts(raw);
            setEnrichedContacts(enriched);
        } catch (error) {
            console.error("Failed to fetch contact data:", error);
        } finally {
            setLoading(false);
        }

        // Separate fetch for audiences
        try {
            setAudLoading(true);
            const audienceList = await Api.getAudiences(adminToken);
            if (audienceList) {
                setAudiences(audienceList);
            }
        } catch (err) {
            console.error("Failed to fetch audiences:", err);
        } finally {
            setAudLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [adminToken, contextLeads.length]);

    const handleViewLead = async (lead) => {
        const resultId = lead.result_id || lead.id;
        if (!resultId) {
            toast.error("Lead ID not found");
            return;
        }
        setViewingId(resultId);
        try {
            const data = await Api.getSingleLead(resultId, adminToken);
            if (data?.data) {
                navigate('/lead-details', {
                    state: {
                        singleLead: data.data,
                    },
                });
            } else {
                // Fallback to navigating with current state if direct fetch fails
                navigate('/lead-details', {
                    state: {
                        singleLead: lead,
                    },
                });
            }
        } catch (error) {
            console.error("Error viewing lead:", error);
            toast.error("Failed to load lead details");
        } finally {
            setViewingId(null);
        }
    };

    const handleDeleteConfirm = async () => {
        const lead = deleteModal.lead;
        const resultId = lead?.result_id || lead?.id;
        if (!resultId) return;
        
        setDeletingId(resultId);
        setDeleteModal({ open: false, lead: null });
        try {
            const res = await Api.deleteLead(resultId, adminToken);
            if (res !== null) {
                toast.success("Lead deleted successfully");
                // Remove from local state
                setRawContacts(prev => prev.filter(l => (l.result_id || l.id) !== resultId));
                setEnrichedContacts(prev => prev.filter(l => (l.result_id || l.id) !== resultId));
            }
        } catch (error) {
            console.error("Error deleting lead:", error);
            toast.error("Failed to delete lead");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredContacts = (isEnriched ? enrichedContacts : rawContacts).filter(contact => {
        const q = searchQuery.toLowerCase();
        return (
            (contact.name || contact.BusinessName || '').toLowerCase().includes(q) ||
            (contact.email || contact.Email || '').toLowerCase().includes(q) ||
            (contact.category || contact.Industry || '').toLowerCase().includes(q) ||
            (contact.phone || contact.MobileNumber || contact.mobile || '').toLowerCase().includes(q)
        );
    });

    const filteredAudiences = audiences.filter(audience => {
        const q = audSearchQuery.toLowerCase();
        return (
            (audience.audiance_name || '').toLowerCase().includes(q) ||
            (audience.discription || '').toLowerCase().includes(q) ||
            (audience.tag || '').toLowerCase().includes(q) ||
            (audience.icp || '').toLowerCase().includes(q)
        );
    });

    const displayContacts = filteredContacts;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentContacts = displayContacts.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="animate-in fade-in duration-700 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
                        <p className="text-gray-500 text-sm mt-1">View and manage your source leads and potential partners.</p>
                    </div>
                    {/* Toggle option between raw and enriched data */}
                    <div className="flex items-center gap-1 bg-white border border-gray-100 p-1 rounded-xl shadow-sm shadow-black/[0.02]">
                        <button
                            onClick={() => setIsEnriched(false)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${!isEnriched ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            Raw Data
                        </button>
                        <button
                            onClick={() => setIsEnriched(true)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${isEnriched ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            Enriched Data
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" className="flex items-center gap-2 px-4 shadow-sm">
                        <Download size={16} /> Export
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 px-4 shadow-sm">
                        <Upload size={16} /> Import
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2 px-4 shadow-sm">
                        <Filter size={16} /> Filter
                    </Button>
                    <Button className="flex items-center gap-2 px-6 shadow-lg shadow-primary/20 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all">
                        <Users size={16} /> Create Audience
                    </Button>
                </div>
            </div>

            <Card className="p-0">
                <div className="p-4 border-b border-gray-50 flex flex-wrap gap-4 items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by name, email or company..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        <Button variant="outline" className="h-[38px] px-3">
                            <Filter size={16} /> Filter
                        </Button>
                    </div>
                    <div className="text-sm text-gray-500 font-medium">
                        Showing <span className="text-gray-900">{displayContacts.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, displayContacts.length)}</span> of {displayContacts.length.toLocaleString()} contacts
                    </div>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                    {loading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[1px] z-10">
                            <Loader2 className="animate-spin text-primary mb-2" size={32} />
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Loading contacts...</p>
                        </div>
                    ) : displayContacts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mb-4">
                                <Users size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No {isEnriched ? 'enriched' : 'raw'} contacts found</h3>
                            <p className="text-gray-500 text-sm max-w-xs mt-1">
                                {isEnriched
                                    ? "Start enriching your leads from the lead generator page to see them here."
                                    : "Try generating some leads to build your contact list."}
                            </p>
                        </div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                {isEnriched ? (
                                    <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                        <th className="px-6 py-4">BUSINESS NAME</th>
                                        <th className="px-6 py-4">CONTACT INFO</th>
                                        <th className="px-6 py-4">SOCIAL LINKS</th>
                                        <th className="px-6 py-4">WEBSITE</th>
                                        <th className="px-6 py-4">LEAD RATING</th>
                                        <th className="px-6 py-4">STATUS</th>
                                        <th className="px-6 py-4 text-right">ACTION</th>
                                    </tr>
                                ) : (
                                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                )}
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentContacts.map((contact, idx) => {
                                    if (isEnriched) {
                                        return (
                                            <tr key={contact.id || `enriched-${idx}`} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{contact.name || contact.BusinessName || 'N/A'}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-0.5">{contact.category || contact.Industry || contact.address || 'No category'}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                                                            <Phone size={12} className="text-gray-400" />
                                                            {contact.mobile || contact.MobileNumber || contact.phone || 'N/A'}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                                            <Mail size={12} className="text-gray-400" />
                                                            <span className="truncate max-w-[150px]">{contact.email || contact.Email || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        {(contact.facebook || contact.facebook_url || contact.Facebook_link) && (
                                                            <a href={contact.facebook || contact.facebook_url || contact.Facebook_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#1877F2] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title="Facebook">
                                                                <Facebook size={12} className="group-hover/soc:scale-110 transition-transform" />
                                                                <span className="truncate max-w-[100px]">{(contact.name || contact.BusinessName || 'Business').split(' ')[0]} FB</span>
                                                            </a>
                                                        )}
                                                        {(contact.instagram || contact.instagram_url || contact.Instagram_link) && (
                                                            <a href={contact.instagram || contact.instagram_url || contact.Instagram_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#E4405F] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title="Instagram">
                                                                <Instagram size={12} className="group-hover/soc:scale-110 transition-transform" />
                                                                <span className="truncate max-w-[100px]">{(contact.name || contact.BusinessName || 'Business').split(' ')[0]} IG</span>
                                                            </a>
                                                        )}
                                                        {(contact.linkedin || contact.linkedin_url || contact.Linkedin_link) && (
                                                            <a href={contact.linkedin || contact.linkedin_url || contact.Linkedin_link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0A66C2] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title="LinkedIn">
                                                                <Linkedin size={12} className="group-hover/soc:scale-110 transition-transform" />
                                                                <span className="truncate max-w-[100px]">{(contact.name || contact.BusinessName || 'Business').split(' ')[0]} LI</span>
                                                            </a>
                                                        )}
                                                        {!(contact.facebook || contact.facebook_url || contact.Facebook_link || contact.instagram || contact.instagram_url || contact.Instagram_link || contact.linkedin || contact.linkedin_url || contact.Linkedin_link) && (
                                                            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded w-fit">No social</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {contact.website || contact.Website || contact.website_url ? (
                                                        <a
                                                            href={contact.website || contact.Website || contact.website_url}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-[11px] transition-all group/link underline-offset-4 hover:underline"
                                                        >
                                                            <Globe size={14} className="text-blue-400 group-hover/link:scale-110 transition-transform" />
                                                            <span className="truncate max-w-[140px]">
                                                                {(contact.name || contact.BusinessName || 'Business')} Website
                                                            </span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-300">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <StarRating rating={contact.rating || contact.Rating || contact.ratting || 0} size="sm" />
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(contact.status) ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                                                        {contact.status || 'ENRICHED'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3 text-gray-400">
                                                        <button 
                                                            className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90 disabled:opacity-50"
                                                            onClick={() => handleViewLead(contact)}
                                                            disabled={viewingId === (contact.result_id || contact.id)}
                                                            title="View details"
                                                        >
                                                            {viewingId === (contact.result_id || contact.id) 
                                                                ? <Loader2 size={18} className="animate-spin" /> 
                                                                : <Eye size={18} />}
                                                        </button>
                                                        <button 
                                                            className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90 disabled:opacity-50"
                                                            onClick={() => setDeleteModal({ open: true, lead: contact })}
                                                            disabled={deletingId === (contact.result_id || contact.id)}
                                                            title="Delete contact"
                                                        >
                                                            {deletingId === (contact.result_id || contact.id)
                                                                ? <Loader2 size={18} className="animate-spin" />
                                                                : <Trash2 size={18} />}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }

                                    return (
                                        <tr key={contact.id || `contact-${idx}-${contact.name || contact.BusinessName}`} className="hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors group cursor-pointer">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {/* <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                                        {(contact.name || contact.BusinessName || 'N').charAt(0).toUpperCase()}
                                                    </div> */}
                                                    <div>
                                                        <p className="font-bold text-gray-900">{contact.name || contact.BusinessName || 'N/A'}</p>
                                                        <p className="text-sm text-gray-500 truncate max-w-[200px]">{contact.address || contact.Address || 'No address'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-medium text-gray-600 uppercase tracking-tight text-[10px] bg-gray-50 px-2 py-1 rounded w-fit">
                                                    {contact.category || contact.Industry || 'No Category'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-tighter uppercase ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(contact.status) ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                    }`}>
                                                    {contact.status || (isEnriched ? 'ENRICHED' : 'NEW')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-0.5 text-yellow-500 font-bold text-sm">
                                                    ★ {contact.rating || contact.Rating || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-3 text-gray-400">
                                                    <button 
                                                        className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90 disabled:opacity-50"
                                                        onClick={() => handleViewLead(contact)}
                                                        disabled={viewingId === (contact.result_id || contact.id)}
                                                        title="View details"
                                                    >
                                                        {viewingId === (contact.result_id || contact.id)
                                                            ? <Loader2 size={18} className="animate-spin" />
                                                            : <Eye size={18} />}
                                                    </button>
                                                    <button 
                                                        className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90 disabled:opacity-50"
                                                        onClick={() => setDeleteModal({ open: true, lead: contact })}
                                                        disabled={deletingId === (contact.result_id || contact.id)}
                                                        title="Delete contact"
                                                    >
                                                        {deletingId === (contact.result_id || contact.id)
                                                            ? <Loader2 size={18} className="animate-spin" />
                                                            : <Trash2 size={18} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination
                    currentPage={currentPage}
                    totalItems={displayContacts.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                />

            </Card>

            {/* Audience List Table */}
            <div className="pt-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Audience List</h2>
                        <p className="text-gray-500 text-sm mt-1">Manage your saved custom audiences and segments.</p>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Filter audiences..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            value={audSearchQuery}
                            onChange={(e) => setAudSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <Card className="p-0 overflow-hidden shadow-xl shadow-black/[0.02] border-none">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                    <th className="px-6 py-5">Audience Name</th>
                                    <th className="px-6 py-5">Status</th>
                                    <th className="px-6 py-5">Size</th>
                                    <th className="px-6 py-5">Last Updated</th>
                                    <th className="px-6 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {audLoading ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center">
                                            <div className="flex flex-col items-center">
                                                <Loader2 className="animate-spin text-primary mb-2" size={24} />
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching audiences...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : audiences.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="py-20 text-center text-gray-500 text-sm font-medium">
                                            No audiences found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAudiences.map((audience, idx) => (
                                        <tr key={audience.id || `aud-${idx}-${audience.audiance_name}`} className="hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors group cursor-pointer">
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-900 text-sm">{audience.audiance_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{audience.discription || 'No description'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tight uppercase bg-green-50 text-green-500`}>
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg w-fit">
                                                    {audience.tag || 'No tags'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-gray-500">
                                                {audience.icp || 'N/A'}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3 text-gray-300">
                                                    <button className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors active:scale-90">
                                                        <Eye size={18} />
                                                    </button>
                                                    <button className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors active:scale-90">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>

                        </table>
                    </div>
                </Card>
            </div>
            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteModal({ open: false, lead: null })}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">Delete Lead?</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-700">{deleteModal.lead?.name || deleteModal.lead?.BusinessName}</span>?
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                onClick={() => setDeleteModal({ open: false, lead: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors"
                                onClick={handleDeleteConfirm}
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;
