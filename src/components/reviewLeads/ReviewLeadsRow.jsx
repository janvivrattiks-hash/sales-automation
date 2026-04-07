import React, { useState, memo } from 'react';
import { Eye, Trash2, Loader2 } from 'lucide-react';
import StarRating from '../ui/StarRating';
import DataProcessingModal from './DataProcessingModal';

const ReviewLeadsRow = memo(({ 
    lead, 
    isSelected, 
    onSelect, 
    onView, 
    onDelete,
    isEnriching = false
}) => {
    const id = lead.id || lead.MobileNumber || lead.mobile_number;
    const [showProcessingModal, setShowProcessingModal] = useState(false);

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
                {(() => {
                    const ws = lead.website || lead.Website || lead.business_website;
                    const junk = ['no', 'false', 'none', 'null', 'undefined', 'n/a', 'na'];
                    if (!ws || (typeof ws === 'string' && (junk.includes(ws.toLowerCase().trim()) || ws.length < 4))) {
                        return <span className="text-gray-400 italic font-bold">Not Available</span>;
                    }
                    return ws;
                })()}
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
                        className={`p-2 rounded-lg active:scale-90 transition-colors ${isEnriching ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-50' : 'hover:text-primary hover:bg-primary/5'}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (isEnriching) {
                                setShowProcessingModal(true);
                            } else {
                                onView(lead);
                            }
                        }}
                        title={isEnriching ? 'Data is processing...' : ''}
                    >
                        {isEnriching ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <Eye size={18} />
                        )}
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

                <DataProcessingModal
                    isOpen={showProcessingModal}
                    leadName={lead.name || lead.BusinessName || lead.business_name || 'Lead'}
                    onClose={() => setShowProcessingModal(false)}
                    onViewData={() => {
                        setShowProcessingModal(false);
                        onView(lead);
                    }}
                />
            </td>
        </tr>
    );
});

ReviewLeadsRow.displayName = 'ReviewLeadsRow';

export default ReviewLeadsRow;
