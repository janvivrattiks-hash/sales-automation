import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Api from '../../scripts/Api';
import {
    Users,
    Eye,
    Search,
    Loader2,
    Plus,
    ChevronLeft,
    Sparkles,
    Trash2
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const AudienceList = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useApp();
    const [audiences, setAudiences] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab] = useState('enriched'); // Only enriched audiences in this list
    const newAudience = location.state?.newAudience;
    const passedLeads = location.state?.selectedLeadsData;
    const audienceName = location.state?.audienceName || null;

    const fetchAudiences = async () => {
        setIsLoading(true);
        try {
            const response = await Api.getAudiences(adminToken);
            if (response) {
                const audienceData = Array.isArray(response)
                    ? response
                    : (response.data || response.results || []);

                // If we have a new audience, make sure it's at the top if it's not already
                if (newAudience || audienceName) {
                    const sortedData = [...audienceData].sort((a, b) => {
                        const isA = (newAudience?.id && String(a.id) === String(newAudience.id)) || (audienceName && a.audiance_name === audienceName);
                        const isB = (newAudience?.id && String(b.id) === String(newAudience.id)) || (audienceName && b.audiance_name === audienceName);
                        if (isA) return -1;
                        if (isB) return 1;
                        return 0;
                    });
                    setAudiences(sortedData || []);
                } else {
                    setAudiences(audienceData || []);
                }
            }
        } catch (error) {
            console.error("Error fetching audiences:", error);
            console.error("Failed to load audiences");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAudience = async (audienceId) => {
        if (!window.confirm("Are you sure you want to delete this audience?")) return;

        setIsDeleting(audienceId);
        try {
            const success = await Api.deleteAudience(audienceId, adminToken);
            if (success) {
                console.log("Audience deleted successfully");
                fetchAudiences();
            }
        } catch (error) {
            console.error("Delete Error:", error);
            console.error("Failed to delete audience");
        } finally {
            setIsDeleting(null);
        }
    };

    useEffect(() => {
        if (adminToken) {
            fetchAudiences();
        }
    }, [adminToken]);

    const filteredAudiences = (audiences || []).filter(aud => {
        const matchesSearch = aud.audiance_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const tags = (aud.tag || '').split(',').map(t => t.trim().toLowerCase());

        // Only show enriched audiences
        return matchesSearch && tags.includes('enriched');
    });

    const AudienceTable = ({ data, title, subtitle }) => (
        <Card noPadding className="overflow-hidden border-gray-100 shadow-xl shadow-gray-200/50 rounded-3xl bg-white/80 backdrop-blur-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/30 border-b border-gray-100">
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Audience Name</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Status</th>
                            <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="py-24 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-300">
                                        <Users size={48} className="opacity-20" />
                                        <p className="text-sm font-bold italic tracking-wide">No {activeTab === 'enriched' ? 'enriched' : 'raw'} audiences found.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((aud) => {
                                const isNew = (newAudience && newAudience.id && String(aud.id) === String(newAudience.id)) || (audienceName && aud.audiance_name === audienceName);
                                return (
                                    <tr key={aud.id || aud.audiance_name} className={`hover:bg-primary/[0.02] transition-colors group ${isNew ? 'bg-blue-50/50' : ''}`}>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                    <Users size={20} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <p
                                                            className="font-bold text-gray-900 text-sm cursor-pointer hover:text-primary transition-colors hover:underline underline-offset-4"
                                                            onClick={() => navigate('/audience-details', {
                                                                state: {
                                                                    audience: aud,
                                                                    selectedLeadsData: isNew ? passedLeads : null
                                                                }
                                                            })}
                                                        >
                                                            {aud.audiance_name}
                                                        </p>
                                                        {isNew && (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded-lg uppercase tracking-widest animate-bounce shadow-lg shadow-primary/20">
                                                                <Sparkles size={8} /> New
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">
                                                        {(aud.tag || '').split(',').map(t => t.trim()).filter(t => t.toLowerCase() !== activeTab).join(', ') || (activeTab === 'enriched' ? 'Enriched' : 'Raw')}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100 uppercase tracking-widest">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all active:scale-90"
                                                    title="View Details"
                                                    onClick={() => navigate('/audience-details', {
                                                        state: {
                                                            audience: aud,
                                                            selectedLeadsData: isNew ? passedLeads : null
                                                        }
                                                    })}
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                <button
                                                    className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                                                    title="Delete Audience"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAudience(aud.id);
                                                    }}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );

    return (
        <div className="animate-in fade-in duration-700 space-y-8 pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1">
                        <Users size={14} /> Audience Management
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">
                        Audience List - <span className="text-primary italic">Enriched Data</span>
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">View and manage your saved lead segments.</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => navigate('/contacts')}
                    >
                        <ChevronLeft size={16} /> Back
                    </Button>
                </div>
            </div>

            <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder={`Search ${activeTab === 'enriched' ? 'enriched' : 'raw'} audiences...`}
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm outline-none shadow-sm focus:ring-4 focus:ring-primary/5 transition-all font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4 text-gray-400">
                    <Loader2 className="animate-spin text-primary" size={40} />
                    <p className="text-sm font-bold animate-pulse uppercase tracking-widest">Loading Audiences...</p>
                </div>
            ) : (
                <AudienceTable data={filteredAudiences} />
            )}
        </div>
    );
};

export default AudienceList;
