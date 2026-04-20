import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import StarRating from '../ui/StarRating';

const EnrichLeadRow = ({ lead, index, isSelected, onToggleSelect, navigate, queryValue, cityValue, areaValue, leads, onDelete, savedCurrentPage, savedSelectedLeads, filters, isFiltered, filteredLeads, searchTerm }) => {
    const leadId = lead.id || lead.MobileNumber || lead.result_id || lead.business_information_id;

    const handleViewLead = () => {
        navigate('/lead-details', {
            state: {
                singleLead: lead,
                results: leads,
                queryInfo: { niche: queryValue, city: cityValue, area: areaValue },
                currentPage: savedCurrentPage,
                selectedLeads: savedSelectedLeads,
                filters: filters,
                isFiltered: isFiltered,
                filteredLeads: filteredLeads,
                searchTerm: searchTerm,
                backUrl: '/enrich'
            }
        });
    };

    return (
        <tr
            key={leadId || index}
            className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer"
        >
            {/* Checkbox */}
            <td className="px-8 py-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                        checked={isSelected}
                        onChange={() => onToggleSelect(leadId)}
                    />
                </div>
            </td>

            {/* Business Name */}
            <td className="px-8 py-6">
                <div className="flex items-center gap-4">
                    <div>
                        <p
                            className="font-bold text-gray-900 text-sm leading-tight hover:text-primary transition-colors cursor-pointer hover:underline underline-offset-4"
                            onClick={handleViewLead}
                        >
                            {lead.name || lead.BusinessName || lead.business_name || 'N/A'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
                            {lead.address || lead.Address || 'No address'}
                        </p>
                    </div>
                </div>
            </td>

            {/* Phone */}
            <td className="px-8 py-6 text-sm font-bold text-gray-500">
                {lead.phone || lead.MobileNumber || 'N/A'}
            </td>

            {/* Email */}
            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                {lead.email || 'N/A'}
            </td>

            {/* Website */}
            <td className="px-8 py-6 text-sm font-medium text-gray-500">
                {lead.website || 'N/A'}
            </td>

            {/* Rating */}
            <td className="px-8 py-6">
                <StarRating rating={lead.rating || lead.Rating || lead.ratting || 0} size="sm" />
            </td>

            {/* Status */}
            <td className="px-8 py-6 text-sm">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-tight ${
                    ['Validated', 'Active', 'Enriched'].includes(lead.status)
                        ? 'bg-green-50 text-green-500'
                        : 'bg-orange-50 text-orange-500'
                }`}>
                    {lead.status || 'Pending'}
                </span>
            </td>

            {/* Actions */}
            <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-3 text-gray-300">
                    <button
                        className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90"
                        onClick={handleViewLead}
                    >
                        <Eye size={18} />
                    </button>
                    <button 
                        className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete && onDelete(leadId);
                        }}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default EnrichLeadRow;
