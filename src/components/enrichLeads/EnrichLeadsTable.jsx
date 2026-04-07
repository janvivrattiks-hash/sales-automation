import React from 'react';
import { Users } from 'lucide-react';
import Card from '../ui/Card';
import Pagination from '../ui/Pagination';
import EnrichLeadRow from './EnrichLeadRow';

const EnrichLeadsTable = ({
    currentLeads,
    leads,
    selectedLeads,
    onToggleSelect,
    onToggleSelectAll,
    currentPage,
    itemsPerPage,
    onPageChange,
    navigate,
    queryValue,
    cityValue,
    areaValue,
    onDeleteLead
}) => {
    const allCurrentSelected = currentLeads.length > 0 &&
        currentLeads.every(l => selectedLeads.includes(l.id || l.MobileNumber));

    return (
        <Card noPadding className="border-none shadow-xl shadow-black/[0.02]">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] md:min-w-full">
                    <thead>
                        <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                            <th className="px-8 py-5 w-10">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/20 cursor-pointer"
                                        checked={allCurrentSelected}
                                        onChange={onToggleSelectAll}
                                    />
                                </div>
                            </th>
                            <th className="px-4 py-5">BUSINESS NAME</th>
                            <th className="px-8 py-5">CONTACT MOBILE</th>
                            <th className="px-8 py-5">EMAIL</th>
                            <th className="px-8 py-5">WEBSITE</th>
                            <th className="px-8 py-5">RATING</th>
                            <th className="px-8 py-5">STATUS</th>
                            <th className="px-8 py-5 text-right">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {currentLeads.length > 0 ? (
                            currentLeads.map((lead, index) => (
                                <EnrichLeadRow
                                    key={lead.id || lead.MobileNumber || index}
                                    lead={lead}
                                    index={index}
                                    isSelected={selectedLeads.includes(lead.id || lead.MobileNumber)}
                                    onToggleSelect={onToggleSelect}
                                    navigate={navigate}
                                    queryValue={queryValue}
                                    cityValue={cityValue}
                                    areaValue={areaValue}
                                    leads={leads}
                                    onDelete={onDeleteLead}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-8 py-20 text-center">
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
            <Pagination
                currentPage={currentPage}
                totalItems={leads.length}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
            />
        </Card>
    );
};

export default EnrichLeadsTable;
