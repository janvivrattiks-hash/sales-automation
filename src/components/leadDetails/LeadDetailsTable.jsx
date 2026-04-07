import React from 'react';
import { Eye, Trash, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import StarRating from '../ui/StarRating';

const LeadDetailsTable = ({ leads, processingLeadId, onViewLead, onDeleteLead }) => {
    return (
        <Card noPadding className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] md:min-w-full">
                    <thead>
                        <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <th className="px-8 py-5">Business Name</th>
                            <th className="px-8 py-5">Contact Mobile</th>
                            <th className="px-8 py-5">Email</th>
                            <th className="px-8 py-5">Website</th>
                            <th className="px-8 py-5">Rating</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leads.map((lead, index) => {
                            const leadId = lead?.result_id || lead?.id || lead?.lead_id;
                            const isProcessing = processingLeadId === leadId;
                            
                            return (
                            <tr
                                key={lead.id || index}
                                className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer"
                            >
                                <td className="px-8 py-6">
                                    <span
                                        className="font-bold text-gray-900 hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-4"
                                        onClick={() => onViewLead(lead)}
                                    >
                                        {lead.name || lead.BusinessName || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-xs font-medium text-gray-500">
                                        {lead.phone || lead.MobileNumber || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-sm text-gray-600">{lead.email || 'N/A'}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-sm text-gray-600">
                                        {(() => {
                                            const ws = lead.website;
                                            const junk = ['no', 'false', 'none', 'null', 'undefined', 'n/a', 'na'];
                                            if (!ws || (typeof ws === 'string' && (junk.includes(ws.toLowerCase().trim()) || ws.length < 4))) {
                                                return <span className="text-gray-400 italic font-bold">Not Available</span>;
                                            }
                                            return ws;
                                        })()}
                                    </span>
                                </td>
                                <td className="px-8 py-6">
                                    <StarRating rating={lead.rating || 0} size="sm" />
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                        lead.status === 'Active'
                                            ? 'bg-green-100 text-green-600'
                                            : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {lead.status || 'New'}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-4">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewLead(lead);
                                            }}
                                            disabled={isProcessing}
                                            className={`transition-colors ${
                                                isProcessing
                                                    ? 'text-gray-300 cursor-not-allowed opacity-50'
                                                    : 'text-gray-400 hover:text-primary'
                                            }`}
                                            type="button"
                                            title={isProcessing ? "This lead is being processed" : "View details"}
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteLead(lead);
                                            }}
                                            disabled={isProcessing}
                                            className={`transition-colors ${
                                                isProcessing
                                                    ? 'text-gray-300 cursor-not-allowed opacity-50'
                                                    : 'text-gray-400 hover:text-red-500'
                                            }`}
                                            type="button"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Simple footer count */}
            {leads.length > 0 && (
                <div className="px-8 py-5 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-white/50 gap-4">
                    <p className="text-xs font-bold text-gray-400">
                        Showing <span className="text-gray-900">1</span> to{' '}
                        <span className="text-gray-900">{leads.length}</span> of{' '}
                        <span className="text-gray-900">{leads.length}</span> results
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
    );
};

export default LeadDetailsTable;
