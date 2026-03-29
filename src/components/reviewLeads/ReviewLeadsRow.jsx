import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import StarRating from '../ui/StarRating';

const ReviewLeadsRow = ({ 
    lead, 
    isSelected, 
    onSelect, 
    onView, 
    onDelete 
}) => {
    const id = lead.id || lead.MobileNumber || lead.mobile_number;

    return (
        <tr className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
            <td className="px-8 py-6">
                <input
                    type="checkbox"
                    className="rounded text-primary border-gray-200 focus:ring-primary cursor-pointer"
                    checked={isSelected}
                    onChange={() => onSelect(id)}
                />
            </td>
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-tight">{lead.name || lead.BusinessName || lead.business_name || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{lead.location || lead.address || lead.Address || 'No location'}</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-6 text-sm font-bold text-gray-500">
                {lead.category || lead.Category || lead.business_category || lead.business_category_name || 'N/A'}
            </td>
            <td className="px-8 py-6 text-sm font-bold text-gray-500">
                {lead.mobile || lead.MobileNumber || lead.phone || lead.mobile_number || 'N/A'}
            </td>
            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                {lead.website || lead.Website || lead.business_website || 'N/A'}
            </td>
            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                {lead.email || lead.Email || lead.business_email || 'N/A'}
            </td>

            <td className="px-8 py-6">
                <StarRating rating={lead.rating || lead.Rating || lead.ratting || 0} size="sm" />
            </td>
            <td className="px-8 py-6 text-sm">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${['Validated', 'Active', 'Enriched'].includes(lead.status) ? 'bg-green-50 text-green-500' : 'bg-yellow-50 text-yellow-500'}`}>
                    {lead.status || 'Pending'}
                </span>
            </td>
            <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-3 text-gray-300">
                    <button
                        className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(lead);
                        }}
                    >
                        <Eye size={18} />
                    </button>
                    <button 
                        className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(id);
                        }}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ReviewLeadsRow;
