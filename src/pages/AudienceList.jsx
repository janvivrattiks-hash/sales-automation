import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Api from '../../scripts/Api';
import { toast } from 'react-toastify';
import {
    Users,
    Eye,
    Search,
    Loader2,
    ChevronLeft,
    Sparkles,
    Trash2,
    Calendar,
    Tag
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import DeleteModal from '../components/contacts/DeleteModal';

// Proper Date Formatter
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const AudienceRow = ({ 
    aud, 
    isNew, 
    isDeleting, 
    isFetching,
    onDelete, 
    onView
}) => {
    const updatedAt = aud.updated_at || aud.created_at;
    const audTag = (aud.tag || '').toLowerCase().includes('enriched') ? 'Enriched' : 'Segment';
    // Handle lead count more robustly
    const leadCount = aud.leads?.length || aud.count || aud.leads_count || 0;

    return (
        <tr className={`hover:bg-primary/[0.02] even:bg-gray-50/40 transition-colors group ${isNew ? 'bg-blue-50/50' : ''}`}>
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform shrink-0">
                        <Users size={20} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <p
                                className="font-bold text-gray-900 text-sm cursor-pointer hover:text-primary transition-colors hover:underline underline-offset-4 truncate"
                                onClick={onView}
                            >
                                {aud.audiance_name}
                            </p>
                            {isNew && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-lg uppercase tracking-widest animate-bounce shadow-lg shadow-primary/20 shrink-0">
                                    <Sparkles size={8} /> New
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">
                            {aud.discription || 'No description provided'}
                        </p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5">
                <div className="flex flex-col gap-1.5">
                    <div className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-lg w-fit border ${
                        audTag === 'Enriched' 
                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                        : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                        <Tag size={12} />
                        {audTag}
                    </div>
                    <p className="text-[10px] font-black text-gray-400 pl-1">
                        {leadCount} {leadCount === 1 ? 'Contact' : 'Contacts'}
                    </p>
                </div>
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    <Calendar size={14} className="text-gray-300" />
                    {formatDate(updatedAt)}
                </div>
            </td>
            <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-2 text-gray-400">
                    <button
                        className="p-2.5 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90 disabled:opacity-50"
                        title="View Details"
                        disabled={isFetching}
                        onClick={onView}
                    >
                        {isFetching ? <Loader2 size={20} className="animate-spin text-primary" /> : <Eye size={20} />}
                    </button>
                    <button
                        className="p-2.5 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90 disabled:opacity-50"
                        title="Delete Audience"
                        disabled={isDeleting}
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(aud);
                        }}
                    >
                        {isDeleting ? <Loader2 size={20} className="animate-spin text-red-500" /> : <Trash2 size={20} />}
                    </button>
                </div>
            </td>
        </tr>
    );
};

const AudienceList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useApp();
    
    // State
    const [audiences, setAudiences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [fetchingId, setFetchingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, data: null });

    // Context from navigation
    const newAudience = location.state?.newAudience;
    const passedLeads = location.state?.selectedLeadsData;
    const audienceName = location.state?.audienceName || null;

    const fetchAudiences = async () => {
        setIsLoading(true);
        try {
            const response = await Api.getAudiences(adminToken);
            if (response) {
                setAudiences(Array.isArray(response) ? response : (response.data || response.results || []));
            }
        } catch (error) {
            console.error("Error fetching audiences:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (adminToken) fetchAudiences();
    }, [adminToken]);

    const handleDeleteAudience = async (id) => {
        if (!id) return;
        setDeletingId(id);
        try {
            const success = await Api.deleteAudience(id, adminToken);
            if (success) {
                console.log("UI_SUCCESS: Audience deleted permanently (ID:", id, ")");
                setAudiences(prev => prev.filter(a => (a.id || a.result_id) !== id));
                toast.success("Audience deleted permanently");
                setDeleteModal({ open: false, data: null });
            }
        } catch (error) {
            console.error("Delete Error:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleViewAudience = async (aud, isNew) => {
        const id = aud.id || aud.result_id;
        if (!id) return;

        setFetchingId(id);
        try {
            // Fetch detailed audience data as requested
            const fullDetails = await Api.getAudienceDetails(id, adminToken);
            
            navigate('/audience-details', {
                state: {
                    audience: fullDetails || aud,
                    selectedAudience: fullDetails || aud, 
                    activeTab: 'enriched',
                    selectedLeadsData: isNew ? passedLeads : (fullDetails?.leads || fullDetails?.contacts || null)
                }
            });
        } catch (error) {
            console.error("Fetch Details Error:", error);
            toast.error("Failed to load audience details");
        } finally {
            setFetchingId(null);
        }
    };

    const filteredAudiences = useMemo(() => {
        return (audiences || []).filter(aud => {
            const matchesSearch = aud.audiance_name?.toLowerCase().includes(searchQuery.toLowerCase());
            // Only show enriched audiences as requested
            const tags = (aud.tag || '').toLowerCase();
            return matchesSearch && tags.includes('enriched');
        });
    }, [audiences, searchQuery]);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 min-h-[80vh] pb-32">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em] mb-1">
                        <Users size={14} className="stroke-[3]" /> Management Hub
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Audience <span className="text-primary italic">List</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Manage and view your saved lead segments.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 w-fit px-6 hover:bg-gray-50"
                        onClick={() => navigate('/contacts')}
                    >
                        <ChevronLeft size={16} /> Back to Contacts
                    </Button>
                </div>
            </div>

            {/* Search Bar Section */}
            <div className="mb-8 relative max-w-2xl group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                <input
                    type="text"
                    placeholder="Quick search by audience name..."
                    className="w-full pl-14 pr-6 py-4 bg-white border-none rounded-[2rem] text-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-primary/20 transition-all font-medium shadow-sm group-hover:shadow-md"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Main Table Content */}
            <Card noPadding className="overflow-hidden border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 uppercase text-[10px] font-black text-gray-400 tracking-[0.1em]">
                                <th className="px-8 py-6">Audience Name</th>
                                <th className="px-8 py-6">Status / Tag</th>
                                <th className="px-8 py-6">Last Updated</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center text-gray-400">
                                        <Loader2 className="animate-spin mx-auto mb-4 text-primary" size={40} />
                                        <p className="text-xs font-black uppercase tracking-widest">Scanning Metadata...</p>
                                    </td>
                                </tr>
                            ) : filteredAudiences.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-300 opacity-60">
                                            <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center border-4 border-white shadow-inner">
                                                <Users size={32} />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-900 tracking-wide uppercase">No Segments Found</p>
                                                <p className="text-xs text-gray-400 font-medium">Try matching with another keyword.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAudiences.map((aud) => {
                                    const id = aud.id || aud.result_id;
                                    const isNew = (newAudience && String(id) === String(newAudience.id)) || (audienceName && aud.audiance_name === audienceName);
                                    return (
                                        <AudienceRow
                                            key={id}
                                            aud={aud}
                                            isNew={isNew}
                                            isDeleting={deletingId === id}
                                            isFetching={fetchingId === id}
                                            onDelete={(data) => setDeleteModal({ open: true, data })}
                                            onView={() => handleViewAudience(aud, isNew)}
                                        />
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <DeleteModal 
                isOpen={deleteModal.open}
                onClose={() => setDeleteModal({ open: false, data: null })}
                type="audience"
                data={deleteModal.data}
                onConfirm={handleDeleteAudience}
                isLoading={deletingId !== null}
            />
        </div>
    );
};

export default AudienceList;
