import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    ChevronRight,
    Trash2,
    Users,
    Star,
    Eye,
    Trash,
    ChevronLeft,
    Sparkles,
    Loader2,
    Search,
    MapPin,
    Phone,
    Globe,
    Tag,
    MessageSquare,
    User,
    ExternalLink,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Api from '../../scripts/Api';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

// ─── StarRating Component ─────────────────────────────────────────────────────
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

// ─── Single Lead Detail View ──────────────────────────────────────────────────
const SingleLeadDetail = ({ lead, onBack }) => {
    const InfoRow = ({ icon: Icon, label, value, href }) => (
        <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
            <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
                {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer"
                        className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate">
                        {value} <ExternalLink size={12} className="shrink-0" />
                    </a>
                ) : (
                    <p className="text-sm font-medium text-gray-900 break-words">{value || '—'}</p>
                )}
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <button onClick={onBack} className="hover:text-primary transition-colors">Dashboard</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">Lead Detail</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{lead.name ?? 'Lead Detail'}</h1>
                    <p className="text-gray-500 text-sm mt-1">{lead.category ?? 'No category'}</p>
                </div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                >
                    <ChevronLeft size={16} />
                    Back to Dashboard
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Rating', value: `${lead.rating ?? 0} / 5` },
                    { label: 'Reviews', value: lead.reviews ?? 0 },
                    { label: 'Source', value: lead.source ?? 'N/A' },
                    { label: 'Owner', value: lead.owner_name ?? 'N/A' },
                ].map(s => (
                    <Card key={s.label} noPadding className="p-4">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className="text-xl font-bold text-gray-900 truncate">{s.value}</p>
                    </Card>
                ))}
            </div>

            {/* Detail card */}
            <Card title="Business Information" subtitle="Full details for this lead">
                <div className="mt-2">
                    <InfoRow icon={Tag} label="Business Name" value={lead.name} />
                    <InfoRow icon={Tag} label="Category" value={lead.category} />
                    <InfoRow icon={MapPin} label="Address" value={lead.address} />
                    <InfoRow icon={Phone} label="Phone" value={lead.phone} />
                    <InfoRow
                        icon={Globe}
                        label="Website"
                        value={lead.website ? lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '') : null}
                        href={lead.website || null}
                    />
                    <InfoRow icon={User} label="Owner Name" value={lead.owner_name} />
                    <InfoRow icon={MessageSquare} label="Reviews" value={lead.reviews != null ? `${lead.reviews} reviews` : null} />

                    {/* Star rating */}
                    <div className="flex items-start gap-4 py-4">
                        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                            <Star size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                            <StarRating rating={lead.rating ?? 0} size="md" />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// ─── Main LeadDetails ─────────────────────────────────────────────────────────
const LeadDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useApp();
    const [loading, setLoading] = useState(false);
    const [leadData, setLeadData] = useState(null);
    const [viewingId, setViewingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });

    useEffect(() => {
        if (location.state?.results) {
            setLeadData({
                leads: location.state.results,
                ...(location.state.queryInfo || {})
            });
        }
    }, [location.state]);

    // ── Handle View Lead ──────────────────────────────────────────────────────
    const handleViewLead = async (lead) => {
        if (!lead.id) {
            toast.error('Lead ID is missing');
            return;
        }
        setViewingId(lead.id);
        try {
            const response = await Api.getSingleLead(lead.id, adminToken);
            if (response && response.data) {
                navigate('/lead-details', { state: { singleLead: response.data } });
            } else {
                toast.error('Failed to fetch lead details');
            }
        } catch (error) {
            console.error('Error fetching lead:', error);
            toast.error('An error occurred while fetching lead details');
        } finally {
            setViewingId(null);
        }
    };

    // ── Handle Delete Lead ────────────────────────────────────────────────────
    const handleDelete = (lead) => {
        setDeleteModal({ open: true, lead });
    };

    const handleDeleteConfirm = async () => {
        const lead = deleteModal.lead;
        if (!lead?.id) {
            toast.error('Lead ID is missing');
            setDeleteModal({ open: false, lead: null });
            return;
        }
        setDeletingId(lead.id);
        try {
            const response = await Api.deleteLead(lead.id, adminToken);
            if (response) {
                toast.success('Lead deleted successfully');
                // Remove from local state
                setLeadData(prev => ({
                    ...prev,
                    leads: prev.leads.filter(l => l.id !== lead.id)
                }));
                setDeleteModal({ open: false, lead: null });
            } else {
                toast.error('Failed to delete lead');
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
            toast.error('An error occurred while deleting lead');
        } finally {
            setDeletingId(null);
        }
    };

    // ── Single lead from Dashboard eye-icon ───────────────────────────────────
    if (location.state?.singleLead) {
        return (
            <SingleLeadDetail
                lead={location.state.singleLead}
                onBack={() => navigate('/dashboard')}
            />
        );
    }

    // Extract properties safely from leadData
    const queryValue = leadData?.query || 'N/A';
    const cityValue = leadData?.city || 'N/A';
    const areaValue = leadData?.area || 'N/A';
    const leads = leadData?.leads || [];
    const totalLeadsCount = leads.length;

    const stats = [
        { label: 'SEARCH QUERY', value: queryValue },
        { label: 'CITY', value: cityValue },
        { label: 'AREA', value: areaValue },
        { label: 'TOTAL LEADS', value: totalLeadsCount.toString(), icon: Users },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 py-20">
                <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                <p className="font-medium">Loading search results...</p>
            </div>
        );
    }

    if (!leadData && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-6 py-20">
                <div className="bg-gray-50 p-6 rounded-full">
                    <Search size={48} className="text-gray-300" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">No Search Data Found</p>
                    <p className="text-sm text-gray-500 mt-1">Please generate leads from the generator page first.</p>
                </div>
                <Button onClick={() => navigate('/lead-generator')} className="px-8">
                    Go to Generator
                </Button>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-32">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                <button onClick={() => navigate('/lead-generator')} className="hover:text-primary transition-colors">LEAD GENERATOR</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">SEARCH DETAILS</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Search Details</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage the results of your lead generation query.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm font-bold">
                    <Trash2 size={16} />
                    Delete Search
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.label} noPadding className="p-4" >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                            {stat.icon && (
                                <div className="text-gray-200">
                                    <stat.icon size={36} />
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {/* Results Table */}
            <Card noPadding className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] md:min-w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                <th className="px-8 py-5">Business Name</th>
                                <th className="px-8 py-5">Contact Mobile</th>
                                <th className="px-8 py-5">Email</th>
                                <th className="px-8 py-5">Rating</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leads.map((lead, index) => (
                                <tr key={lead.id || index} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors">
                                    <td className="px-8 py-6">
                                        <span className="font-bold text-gray-900">{lead.name || lead.BusinessName || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-xs font-medium text-gray-500">{lead.phone || lead.MobileNumber || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className="text-sm text-gray-600">{lead.email || 'N/A'}</span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <StarRating rating={lead.rating || 0} size="sm" />
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${lead.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                            {lead.status || 'New'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-4">
                                            <button
                                                onClick={() => handleViewLead(lead)}
                                                disabled={viewingId === lead.id}
                                                className="text-gray-400 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {viewingId === lead.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Eye size={18} />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(lead)}
                                                disabled={deletingId === lead.id}
                                                className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {deletingId === lead.id ? (
                                                    <Loader2 size={18} className="animate-spin" />
                                                ) : (
                                                    <Trash size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {leads.length > 0 && (
                    <div className="px-8 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white/50 gap-4">
                        <p className="text-xs font-bold text-gray-400">
                            Showing <span className="text-gray-900">1</span> to <span className="text-gray-900">{leads.length}</span> of <span className="text-gray-900">{leads.length}</span> results
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="px-4 text-xs font-bold disabled:opacity-50" disabled>
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" className="px-4 text-xs font-bold">
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Enrich Data Button */}
            <div className="flex justify-end">
                <Button
                    onClick={() => navigate('/enrich', { 
                        state: { 
                            results: leads,
                            queryInfo: {
                                query: queryValue,
                                city: cityValue,
                                area: areaValue
                            }
                        }
                    })}
                    className="px-10 shadow-2xl shadow-primary/30 text-lg"
                >
                    <Sparkles size={20} fill="currentColor" />
                    Enrich Data
                </Button>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        onClick={() => setDeleteModal({ open: false, lead: null })}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto">
                            <Trash2 size={22} className="text-red-500" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-gray-900">Delete Lead?</h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-700">
                                    {deleteModal.lead?.name || deleteModal.lead?.BusinessName || 'this lead'}
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                                onClick={() => setDeleteModal({ open: false, lead: null })}
                                disabled={deletingId !== null}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                onClick={handleDeleteConfirm}
                                disabled={deletingId !== null}
                            >
                                {deletingId !== null ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Yes, Delete'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadDetails;
