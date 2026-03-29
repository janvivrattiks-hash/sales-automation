import React from 'react';
import { Loader2, Users } from 'lucide-react';
import Card from '../ui/Card';
import EnrichedRow from './EnrichedRow';
import RawRow from './RawRow';

const AudienceTable = ({ leads, loading, isEnriched, viewingId, onViewContact }) => {
    return (
        <Card noPadding className="overflow-hidden border-gray-100 shadow-xl shadow-gray-200/50 rounded-3xl bg-white/80 backdrop-blur-md">
            <div className="overflow-x-auto relative min-h-[400px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Loader2 size={32} className="animate-spin text-primary mb-2" />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading audience data...</p>
                    </div>
                )}
                <table className="w-full min-w-[1000px] md:min-w-full">
                    <thead>
                        {isEnriched ? (
                            <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4">BUSINESS NAME</th>
                                <th className="px-6 py-4">CONTACT INFO</th>
                                <th className="px-6 py-4">SOCIAL LINKS</th>
                                <th className="px-6 py-4">WEBSITE</th>
                                <th className="px-6 py-4 text-center">LEAD RATING</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4 text-right">ACTION</th>
                            </tr>
                        ) : (
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                                <th className="px-8 py-5">Business Name</th>
                                <th className="px-8 py-5">Contact Mobile</th>
                                <th className="px-8 py-5">Email</th>
                                <th className="px-8 py-5">Website</th>
                                <th className="px-8 py-5 text-center">Rating</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leads.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="7" className="py-32 text-center">
                                    <div className="flex flex-col items-center gap-3 text-gray-300">
                                        <Users size={64} className="opacity-10" />
                                        <p className="text-sm font-bold italic tracking-wide">No contacts found in this audience segment.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead, index) => {
                                if (isEnriched) {
                                    return <EnrichedRow key={lead.id || lead.result_id || index} lead={lead} index={index} viewingId={viewingId} onViewContact={onViewContact} />;
                                }
                                return <RawRow key={lead.id || lead.result_id || index} lead={lead} index={index} viewingId={viewingId} onViewContact={onViewContact} />;
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default AudienceTable;
