import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import Card from '../ui/Card';
import EnrichedRow from './EnrichedRow';
import RawRow from './RawRow';

const AudienceTable = ({ leads, loading, isEnriched, viewingId, onViewContact }) => {
    // Determine if we should show the enriched layout based on the data itself
    const anyLeadEnriched = leads.some(l =>
        (l.rating && l.rating > 0) ||
        (l.Rating && l.Rating > 0) ||
        l.website || l.Website ||
        l.email || l.Email ||
        (l.status && (l.status === 'Enriched' || l.status === 'VERIFIED'))
    );

    const effectiveIsEnriched = isEnriched || anyLeadEnriched;

    return (
        <Card noPadding className="overflow-hidden border-none shadow-2xl shadow-black/5 rounded-[2.5rem] bg-white">
            <div className="overflow-x-auto relative min-h-[300px]">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-primary" size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">Syncing Segment...</p>
                        </div>
                    </div>
                )}
                <table className="w-full text-left border-collapse">
                    <thead>
                        {effectiveIsEnriched ? (
                            <tr className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4">BUSINESS NAME</th>
                                <th className="px-6 py-4">CONTACT INFO</th>
                                <th className="px-6 py-4">SOCIAL LINKS</th>
                                <th className="px-6 py-4">WEBSITE</th>
                                <th className="px-6 py-4 text-center">RATING</th>
                                <th className="px-6 py-4">STATUS</th>
                                <th className="px-6 py-4 text-right">ACTION</th>
                            </tr>
                        ) : (
                            <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50/50">
                                <th className="px-8 py-5">BUSINESS NAME</th>
                                <th className="px-8 py-5">CONTACT MOBILE</th>
                                <th className="px-8 py-5">EMAIL</th>
                                <th className="px-8 py-5">WEBSITE</th>
                                <th className="px-8 py-5 text-center">RATING</th>
                                <th className="px-8 py-5">STATUS</th>
                                <th className="px-8 py-5 text-right">ACTION</th>
                            </tr>
                        )}
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {leads.length === 0 && !loading ? (
                            <tr>
                                <td colSpan="7" className="py-32 text-center text-gray-300">
                                    <div className="flex flex-col items-center gap-3">
                                        <Users size={64} className="opacity-10" />
                                        <p className="text-sm font-bold italic tracking-wide">No contacts found in this audience segment.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            leads.map((lead, index) => {
                                const hasRichData =
                                    (lead.rating && lead.rating > 0) ||
                                    (lead.Rating && lead.Rating > 0) ||
                                    lead.website || lead.Website ||
                                    lead.email || lead.Email ||
                                    lead.status === 'Enriched';

                                if (effectiveIsEnriched || hasRichData) {
                                    return <EnrichedRow 
                                        key={lead.id || lead.result_id || index} 
                                        lead={lead} 
                                        index={index} 
                                        viewingId={viewingId} 
                                        onViewContact={onViewContact} 
                                    />;
                                }
                                return <RawRow 
                                    key={lead.id || lead.result_id || index} 
                                    lead={lead} 
                                    index={index} 
                                    viewingId={viewingId} 
                                    onViewContact={onViewContact} 
                                />;
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};

export default AudienceTable;
