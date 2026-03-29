import React from 'react';
import { Phone, Mail, Facebook, Instagram, Linkedin, Twitter, Youtube, Eye, Loader2 } from 'lucide-react';
import StarRating from '../ui/StarRating';
import { findSocialLink } from '../../utils/contactUtils';

const EnrichedRow = ({ lead, index, viewingId, onViewContact }) => {
    const id = lead.id || lead.result_id || index;
    const fb = findSocialLink(lead, 'facebook');
    const ig = findSocialLink(lead, 'instagram');
    const li = findSocialLink(lead, 'linkedin');
    const tw = findSocialLink(lead, 'twitter');
    const yt = findSocialLink(lead, 'youtube');
    const businessName = lead.name || lead.BusinessName || lead.business_name || lead.Business_Name || lead.title || 'N/A';
    const shortName = businessName.split(' ')[0] || 'Biz';

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
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        {lead.phone || lead.MobileNumber || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Mail size={12} className="text-gray-400" />
                        <span className="truncate max-w-[150px]">{lead.email || lead.Email || 'N/A'}</span>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4">
                <div className="flex flex-col gap-1.5 min-w-[120px]">
                    {(!fb && !ig && !li && !tw && !yt) ? (
                        <span className="text-[10px] font-bold text-gray-300">No social links</span>
                    ) : (
                        <>
                            {fb && (
                                <a href={fb} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#1877F2] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title={`Visit ${businessName} Facebook`}>
                                    <Facebook size={12} className="group-hover/soc:scale-110 transition-transform" />
                                    <span className="truncate max-w-[100px]">{shortName} FB</span>
                                </a>
                            )}
                            {ig && (
                                <a href={ig} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#E4405F] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title={`Visit ${businessName} Instagram`}>
                                    <Instagram size={12} className="group-hover/soc:scale-110 transition-transform" />
                                    <span className="truncate max-w-[100px]">{shortName} IG</span>
                                </a>
                            )}
                            {li && (
                                <a href={li} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0A66C2] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title={`Visit ${businessName} LinkedIn`}>
                                    <Linkedin size={12} className="group-hover/soc:scale-110 transition-transform" />
                                    <span className="truncate max-w-[100px]">{shortName} LI</span>
                                </a>
                            )}
                            {tw && (
                                <a href={tw} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#1DA1F2] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title={`Visit ${businessName} Twitter`}>
                                    <Twitter size={12} className="group-hover/soc:scale-110 transition-transform" />
                                    <span className="truncate max-w-[100px]">{shortName} TW</span>
                                </a>
                            )}
                            {yt && (
                                <a href={yt} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#FF0000] hover:opacity-80 transition-opacity font-bold text-[10px] group/soc" title={`Visit ${businessName} YouTube`}>
                                    <Youtube size={12} className="group-hover/soc:scale-110 transition-transform" />
                                    <span className="truncate max-w-[100px]">{shortName} YT</span>
                                </a>
                            )}
                        </>
                    )}
                </div>
            </td>
            <td className="px-6 py-4">
                {lead.website || lead.Website ? (
                    <a href={lead.website || lead.Website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-[11px] transition-all group/link underline-offset-4 hover:underline">
                        <img src={`https://www.google.com/s2/favicons?domain=${(lead.website || lead.Website).replace(/^https?:\/\//, '').split('/')[0]}&sz=32`} className="w-4 h-4 rounded group-hover/link:scale-110 transition-transform" alt="web" />
                        <span className="truncate max-w-[120px] block">
                            {lead.website || lead.Website}
                        </span>
                    </a>
                ) : <span className="text-[10px] text-gray-300 italic font-bold">N/A</span>}
            </td>
            <td className="px-6 py-4 text-center">
                <StarRating rating={lead.rating || lead.Rating || 0} size="sm" />
            </td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(lead.status) ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                    {lead.status || 'ENRICHED'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <button onClick={() => onViewContact(lead)} className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-95 disabled:opacity-50" disabled={viewingId === id}>
                    {viewingId === id ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                </button>
            </td>
        </tr>
    );
};

export default EnrichedRow;
