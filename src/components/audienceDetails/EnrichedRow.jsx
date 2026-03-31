import React from 'react';
import { Phone, Mail, Globe, Eye, Loader2 } from 'lucide-react';
import StarRating from '../ui/StarRating';
import { scanSocials, getSocialIcon, getHostname } from '../../utils/contactUtils';

const EnrichedRow = ({ lead, index, viewingId, onViewContact }) => {
    const id = lead.id || lead.result_id || index;
    const businessName = lead.name || lead.BusinessName || lead.business_name || lead.Business_Name || lead.title || 'N/A';
    const extractedSocials = scanSocials(lead);
    const websiteStr = lead.website || lead.Website || '';

    return (
        <tr key={id} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
            <td className="px-6 py-4">
                <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{businessName}</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-0.5 truncate max-w-[150px]">
                        {lead.category || lead.Industry || lead.address || 'No category'}
                    </p>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700 bg-gray-50/50 px-2 py-1 rounded-md border border-gray-100/50 w-fit">
                        <Phone size={10} className="text-primary/60" />
                        {lead.phone || lead.MobileNumber || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-primary transition-colors truncate max-w-[150px]">
                        <Mail size={10} className="text-gray-300" />
                        {lead.email || lead.Email || 'No email'}
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5 min-w-[120px]">
                    {extractedSocials.length > 0 ? (
                        extractedSocials.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors group/soc" title={`Visit ${getHostname(link)}`}>
                                {getSocialIcon(link)}
                                <span className="truncate max-w-[120px]">{getHostname(link)}</span>
                            </a>
                        ))
                    ) : (
                        <span className="text-[10px] font-bold text-gray-300">No social links</span>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                {websiteStr ? (
                    <a
                        href={websiteStr.startsWith('http') ? websiteStr : `https://${websiteStr}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-[11px] transition-all group/link underline-offset-4 hover:underline"
                    >
                        <Globe size={14} className="text-blue-400 shrink-0 group-hover/link:scale-110 transition-transform" />
                        <span className="truncate max-w-[140px]">
                            {getHostname(websiteStr)}
                        </span>
                    </a>
                ) : (
                    <span className="text-xs font-bold text-gray-300">N/A</span>
                )}
            </td>
            <td className="px-6 py-4 text-center">
                <StarRating rating={Number(lead.rating || lead.Rating || 0)} size="sm" />
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(lead.status) ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                    {lead.status || 'ENRICHED'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <button onClick={(e) => { e.stopPropagation(); onViewContact(lead); }} className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-95 disabled:opacity-50" disabled={viewingId === id}>
                    {viewingId === id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                </button>
            </td>
        </tr>
    );
};

export default EnrichedRow;
