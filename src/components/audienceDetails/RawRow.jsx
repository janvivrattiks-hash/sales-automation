import React from 'react';
import { Eye, Loader2 } from 'lucide-react';
import StarRating from '../ui/StarRating';

const RawRow = ({ lead, index, viewingId, onViewContact }) => {
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
            <td className="px-8 py-6 text-sm font-bold text-gray-500 truncate max-w-[150px]">
                {lead.email || lead.Email || 'N/A'}
            </td>
            <td className="px-8 py-6">
                {lead.website || lead.Website ? (
                    <a href={lead.website || lead.Website} target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-600 hover:underline truncate max-w-[150px] inline-block">
                        {lead.website || lead.Website}
                    </a>
                ) : <span className="text-xs font-bold text-gray-300 italic">N/A</span>}
            </td>
            <td className="px-8 py-6 text-center">
                <StarRating rating={Number(lead.rating || lead.Rating || 0)} size="sm" />
            </td>
            <td className="px-8 py-6">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-full border border-blue-100 uppercase tracking-tight italic">Raw</span>
            </td>
            <td className="px-8 py-6 text-right">
                <button onClick={(e) => { e.stopPropagation(); onViewContact(lead); }} className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-95 disabled:opacity-50" disabled={viewingId === id}>
                    {viewingId === id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                </button>
            </td>
        </tr>
    );
};

export default RawRow;
