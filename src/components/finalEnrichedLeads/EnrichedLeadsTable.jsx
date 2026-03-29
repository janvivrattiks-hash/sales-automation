import React from 'react';
import { Search, Download, Users } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Pagination from '../ui/Pagination';
import EnrichedLeadRow from './EnrichedLeadRow';

const EnrichedLeadsTable = ({
    filteredLeads,
    currentLeads,
    searchTerm,
    onSearchChange,
    onExportCSV,
    currentPage,
    itemsPerPage,
    onPageChange,
    navigate,
    queryInfo,
    leads,
}) => {
    return (
        <Card noPadding className="border-none shadow-sm rounded-2xl bg-white">
            {/* Table Toolbar */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search in enriched results..."
                        className="w-full pl-12 pr-4 py-2.5 bg-gray-50/50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                        onClick={onExportCSV}
                    >
                        <Download size={16} />
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                            <th className="px-8 py-5">BUSINESS NAME</th>
                            <th className="px-8 py-5">CONTACT INFO</th>
                            <th className="px-8 py-5">SOCIAL LINKS</th>
                            <th className="px-8 py-5">WEBSITE</th>
                            <th className="px-8 py-5">LEAD RATING</th>
                            <th className="px-8 py-5">STATUS</th>
                            <th className="px-8 py-5 text-right">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {currentLeads.length > 0 ? (
                            currentLeads.map((lead, index) => (
                                <EnrichedLeadRow
                                    key={lead.id || lead.result_id || index}
                                    lead={lead}
                                    index={index}
                                    leads={leads}
                                    queryInfo={queryInfo}
                                    navigate={navigate}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Users size={40} className="mb-2 opacity-20" />
                                        <p className="font-bold text-lg text-gray-900">No leads found</p>
                                        <p className="text-sm">Try adjusting your search term.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalItems={filteredLeads.length}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
            />
        </Card>
    );
};

export default EnrichedLeadsTable;
