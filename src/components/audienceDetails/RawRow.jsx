import React from 'react';
import { Eye, Loader2, Trash2 } from 'lucide-react';
import StarRating from '../ui/StarRating';

const RawRow = ({ lead, index, viewingId, onViewContact, onDelete }) => {
    const id = lead.id || lead.result_id || index;

    return (
        <tr key={id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer text-nowrap">
            <td className="px-8 py-6">
                <p className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors truncate max-w-[200px]">{lead.name || lead.BusinessName || lead.business_name || lead.Business_Name || lead.title || 'N/A'}</p>
            </td>
            <td className="px-8 py-6">
                <span className="text-sm font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100/50">
                    {lead.phone || lead.MobileNumber || 'N/A'}
                </span>
            </td>
            <td className="px-8 py-6">
                <div className="flex flex-col gap-1 text-sm font-bold text-gray-500">
                    {(() => {
                        const emailRaw = lead.email || lead.Email;
                        let emails = [];
                        if (Array.isArray(emailRaw)) emails = emailRaw;
                        else if (typeof emailRaw === 'string') emails = emailRaw.split(',').map(e => e.trim()).filter(e => e && e.toLowerCase() !== 'n/a');

                        if (emails.length > 0) {
                            return emails.map((email, i) => (
                                <span key={i} className="truncate max-w-[150px]">{email}</span>
                            ));
                        }
                        return <span className="text-gray-300 italic">N/A</span>;
                    })()}
                </div>
            </td>
            <td className="px-8 py-6">
                {(() => {
                    const ws = lead.website || lead.Website;
                    const junk = ['no', 'false', 'none', 'null', 'undefined', 'n/a', 'na'];
                    if (!ws || (typeof ws === 'string' && (junk.includes(ws.toLowerCase().trim()) || ws.length < 4))) {
                        return <span className="text-xs font-bold text-gray-400 italic">Not Available</span>;
                    }
                    return (
                        <a href={ws.startsWith('http') ? ws : `https://${ws}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline truncate max-w-[150px] inline-block">
                            {ws}
                        </a>
                    );
                })()}
            </td>
            <td className="px-8 py-6 text-center">
                <StarRating rating={Number(lead.rating || lead.Rating || 0)} size="sm" />
            </td>
            <td className="px-8 py-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-tight italic">Raw</span>
            </td>
            <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-3 text-gray-300">
                    <button onClick={(e) => { e.stopPropagation(); onViewContact(lead); }} className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-95 disabled:opacity-50" disabled={viewingId === id} title="View Details">
                        {viewingId === id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(lead); }} 
                        className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-95"
                        title="Delete Lead"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default RawRow;
