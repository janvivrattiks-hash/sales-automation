import React from 'react';
import { ExternalLink, Eye, Trash2, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import Pagination from '../ui/Pagination';
import StarRating from '../ui/StarRating';

const statusColors = {
    'New': 'bg-blue-100 text-blue-600',
    'Contacted': 'bg-orange-100 text-orange-600',
    'In Review': 'bg-purple-100 text-purple-600',
    'completed': 'bg-green-100 text-green-600',
    'pending': 'bg-yellow-100 text-yellow-600',
    'failed': 'bg-red-100 text-red-600',
};

const RecentLeadsTable = ({
    currentLeads,
    leads,
    viewingId,
    deletingId,
    currentPage,
    itemsPerPage,
    onViewLead,
    onDeleteClick,
    onPageChange,
}) => {
    return (
        <div className="grid grid-cols-1 gap-8">
            <Card title="Recent Leads" subtitle="Last entries in the database" className="w-full">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <th className="pb-4">Business Name</th>
                                <th className="pb-4">Contact Info</th>
                                <th className="pb-4">Website</th>
                                <th className="pb-4">Rating</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentLeads.map((lead) => (
                                <tr key={lead.id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
                                    <td className="py-4">
                                        <span className="font-bold text-gray-900">{lead.company}</span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900 text-sm">{lead.name !== 'N/A' ? lead.name : '—'}</span>
                                            <span className="text-xs text-gray-400">{lead.phone}</span>
                                            {lead.category && <span className="text-xs text-gray-300 italic">{lead.category}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        {lead.website ? (
                                            <a
                                                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-primary hover:underline flex items-center gap-1"
                                            >
                                                {lead.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                <ExternalLink size={12} />
                                            </a>
                                        ) : <span className="text-gray-300 text-sm">—</span>}
                                    </td>
                                    <td className="py-4">
                                        <StarRating rating={lead.rating} size="sm" />
                                    </td>
                                    <td className="py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[lead.status] || 'bg-green-100 text-green-600'}`}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                className="text-gray-400 hover:text-primary p-1.5 hover:bg-primary/5 rounded-lg transition-all disabled:opacity-50"
                                                title="View details"
                                                disabled={viewingId === lead.id}
                                                onClick={() => onViewLead(lead)}
                                            >
                                                {viewingId === lead.id
                                                    ? <Loader2 size={18} className="animate-spin" />
                                                    : <Eye size={18} />}
                                            </button>
                                            <button
                                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                                                title="Delete lead"
                                                disabled={deletingId === lead.result_id}
                                                onClick={() => onDeleteClick(lead)}
                                            >
                                                {deletingId === lead.result_id
                                                    ? <Loader2 size={18} className="animate-spin" />
                                                    : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={leads.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                />
            </Card>
        </div>
    );
};

export default RecentLeadsTable;
