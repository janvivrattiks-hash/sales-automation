import React, { useState, useContext } from 'react';
import { Loader2, Eye, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Api from '../../../scripts/Api';
import { AppContext } from '../../context/AppContext';

const AudienceTable = ({
    audiences,
    filteredAudiences,
    audLoading,
    navigate,
    setDeleteModal
}) => {
    const { adminToken } = useContext(AppContext);
    const [viewingId, setViewingId] = useState(null);
    const [fetchingId, setFetchingId] = useState(null);

    const handleViewAudience = async (aud, isNew) => {
        const id = aud.id || aud.result_id || aud._id || aud.audiance_id || aud.audience_id;
        if (!id) return;

        setFetchingId(id);
        try {
            // Fetch detailed audience data as requested
            const fullDetails = await Api.getAudienceDetails(id, adminToken);

            // Extract leads correctly from the response (robust key checking)
            const leads = fullDetails?.leads || 
                          fullDetails?.contacts || 
                          fullDetails?.results || 
                          fullDetails?.audiance_leads ||
                          fullDetails?.business_ids ||
                          fullDetails?.data?.leads || 
                          fullDetails?.data?.contacts || 
                          fullDetails?.data?.results || 
                          fullDetails?.data?.audiance_leads ||
                          fullDetails?.data?.business_ids ||
                          fullDetails?.data || 
                          [];
            
            // Handle if leads is an object wrapping the array
            const finalLeads = Array.isArray(leads) ? leads : (leads.leads || leads.contacts || leads.results || leads.data || leads.audiance_leads || leads.business_ids || []);

            navigate('/audience-details', {
                state: {
                    audience: fullDetails || aud,
                    selectedAudience: fullDetails || aud,
                    activeTab: 'enriched',
                    selectedLeadsData: finalLeads
                }
            });
        } catch (error) {
            console.error("Fetch Details Error:", error);
            toast.error("Failed to load audience details");
        } finally {
            setFetchingId(null);
        }
    };

    return (
        <div className="pt-6">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Audience List</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your saved custom audiences and segments.</p>
                </div>
                <Button
                    variant="soft"
                    className="flex items-center gap-2"
                    onClick={() => navigate('/audience-list')}
                >
                    View All
                </Button>
            </div>
            <Card className="p-0 overflow-hidden shadow-xl shadow-black/[0.02] border-none">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                                <th className="px-6 py-5">Audience Name</th>
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
                                filteredAudiences.map((audience, idx) => {
                                    const isEnriched = (audience.tag || '').toLowerCase().includes('enriched');
                                    return (
                                        <tr
                                            key={audience.id || `aud-${idx}-${audience.audiance_name}`}
                                            className="hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors group cursor-pointer"
                                            onClick={() => handleViewAudience(audience)}
                                        >
                                            <td className="px-6 py-5">
                                                <p className="font-bold text-gray-900 text-sm">{audience.audiance_name}</p>
                                                <p className="text-[10px] text-gray-400 font-medium truncate max-w-[200px]">{audience.discription || 'No description'}</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col gap-1">
                                                    <div className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-lg w-fit">
                                                        {audience.businesses?.length || audience.leads?.length || audience.count || audience.business_ids?.length || 0} Leads
                                                    </div>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter pl-1">
                                                        {audience.tag || 'No tags'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-sm font-medium text-gray-500">
                                                {audience.updated_at
                                                    ? new Date(audience.updated_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })
                                                    : audience.created_at
                                                        ? new Date(audience.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })
                                                        : 'N/A'
                                                }
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-3 text-gray-300">
                                                    <button
                                                        className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors active:scale-90 flex items-center justify-center min-w-[36px]"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewAudience(audience);
                                                        }}
                                                        disabled={viewingId === (audience.id || audience.result_id)}
                                                    >
                                                        {viewingId === (audience.id || audience.result_id) ? (
                                                            <Loader2 size={18} className="animate-spin text-primary" />
                                                        ) : (
                                                            <Eye size={18} />
                                                        )}
                                                    </button>
                                                    <button
                                                        className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors active:scale-90"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setDeleteModal({ open: true, type: 'audience', data: audience });
                                                        }}
                                                    >
                                                        <Trash2 size={18} />
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
        </div>
    );
};

export default AudienceTable;
