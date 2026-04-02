import React from 'react';
import { Users } from 'lucide-react';
import ReviewLeadsRow from './ReviewLeadsRow';

const ReviewLeadsTable = ({ 
    currentLeads, 
    selectedLeads, 
    onSelectAll, 
    onSelectOne, 
    onViewLead, 
    onDeleteLead,
    isEnriching = false
}) => {
    const allSelected = currentLeads.length > 0 && currentLeads.every(l => {
        const id = l.id || l.MobileNumber || l.mobile_number;
        return selectedLeads.includes(id);
    });

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                        <th className="px-8 py-5 w-10">
                            <input
                                type="checkbox"
                                className="rounded text-primary border-gray-200 focus:ring-primary cursor-pointer"
                                checked={allSelected}
                                onChange={(e) => onSelectAll(e.target.checked)}
                            />
                        </th>
                        <th className="px-8 py-5">BUSINESS NAME</th>
                        <th className="px-8 py-5">CATEGORY</th>
                        <th className="px-8 py-5">MOBILE</th>
                        <th className="px-8 py-5">WEBSITE</th>
                        <th className="px-8 py-5">EMAIL</th>
                        <th className="px-8 py-5">RATING</th>
                        <th className="px-8 py-5">STATUS</th>
                        <th className="px-8 py-5 text-right">ACTION</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {currentLeads.length > 0 ? (
                        currentLeads.map((lead, index) => (
                            <ReviewLeadsRow 
                                key={lead.id || lead.MobileNumber || lead.mobile_number || index}
                                lead={lead}
                                isSelected={selectedLeads.includes(lead.id || lead.MobileNumber || lead.mobile_number)}
                                onSelect={onSelectOne}
                                onView={onViewLead}
                                onDelete={onDeleteLead}
                                isEnriching={isEnriching}
                            />
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                    <Users size={40} className="mb-2 opacity-20" />
                                    <p className="font-bold text-lg text-gray-900">No leads found</p>
                                    <p className="text-sm">Try adjusting your filters or search terms.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReviewLeadsTable;
