import React from 'react';
import { Loader2, Eye, Trash2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const AudienceTable = ({ 
    audiences, 
    filteredAudiences, 
    audLoading, 
    navigate, 
    setDeleteModal 
}) => {
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
                                filteredAudiences.map((audience, idx) => {
                                    const isEnriched = (audience.tag || '').toLowerCase().includes('enriched');
                                    return (
                                        <tr
                                            key={audience.id || `aud-${idx}-${audience.audiance_name}`}
                                            className="hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors group cursor-pointer"
                                            onClick={() => navigate('/audience-details', {
                                                state: {
                                                    selectedAudience: audience,
                                                    activeTab: isEnriched ? 'enriched' : 'raw'
                                                }
                                            })}
                                        >
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
                                                    <button
                                                        className="p-2 hover:bg-gray-100 hover:text-gray-700 rounded-lg transition-colors active:scale-90"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/audience-details', {
                                                                state: {
                                                                    selectedAudience: audience,
                                                                    activeTab: isEnriched ? 'enriched' : 'raw'
                                                                }
                                                            });
                                                        }}
                                                    >
                                                        <Eye size={18} />
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
