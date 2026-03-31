import React from 'react';
import { Eye, Trash2, Phone, Mail, Globe } from 'lucide-react';
import StarRating from '../ui/StarRating';
import { deepGet, extractStr, scanSocials, getSocialIcon } from '../../utils/contactUtils';

const INITIALS_COLORS = [
    'bg-blue-50 text-blue-500',
    'bg-purple-50 text-purple-500',
    'bg-orange-50 text-orange-500',
    'bg-cyan-50 text-cyan-500',
    'bg-pink-50 text-pink-500',
    'bg-green-50 text-green-500'
];

const getSocialColor = (link) => {
    const lower = String(link).toLowerCase();
    if (lower.includes('facebook') || lower.includes('fb.com')) return 'text-[#1877F2]';
    if (lower.includes('instagram')) return 'text-[#E4405F]';
    if (lower.includes('linkedin')) return 'text-[#0A66C2]';
    if (lower.includes('twitter') || lower.includes('x.com')) return 'text-[#1DA1F2]';
    if (lower.includes('youtube')) return 'text-[#FF0000]';
    return 'text-gray-400';
};

const EnrichedLeadRow = ({ lead, index, leads, queryInfo, navigate }) => {
    const phoneStr = extractStr(deepGet(lead, ['mobile', 'MobileNumber', 'phone', 'contact_number', 'phone_number', 'Phone', 'Mobile']));
    const emailRaw = deepGet(lead, ['email', 'Email', 'email_address', 'email_addresses', 'emails']);
    let emailsList = [];
    if (Array.isArray(emailRaw)) emailsList = emailRaw.flatMap(e => typeof e === 'string' ? e.split(',').map(x => x.trim()) : []).filter(Boolean);
    else if (typeof emailRaw === 'object' && emailRaw !== null) emailsList = Object.values(emailRaw).filter(e => typeof e === 'string' && e.trim());
    else if (typeof emailRaw === 'string') emailsList = emailRaw.split(',').map(e => e.trim()).filter(Boolean);
    const primaryEmail = emailsList.length > 0 ? emailsList[0] : 'N/A';

    const websiteRaw = deepGet(lead, ['website', 'Website', 'website_url', 'url', 'domain', 'web', 'site_url']);
    const websiteStr = extractStr(websiteRaw, null);

    const ratingRaw = deepGet(lead, ['rating', 'Rating', 'ratting', 'google_rating', 'star_rating', 'review_rating', 'avg_rating', 'score']);
    const ratingVal = extractStr(ratingRaw, '0');

    const extractedSocials = scanSocials(lead);

    const getHostname = (url) => {
        try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
    };

    return (
        <tr key={lead.id || index} className="group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer">
            {/* Business Name */}
            <td className="px-8 py-5">
                <div>
                    <p className="font-bold text-gray-900 text-sm leading-tight">{lead.name || lead.BusinessName || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-0.5">{lead.category || lead.Industry || lead.address || 'No category'}</p>
                </div>
            </td>

            {/* Contact Info */}
            <td className="px-8 py-5">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        {phoneStr}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Mail size={12} className="text-gray-400" />
                        <span className="truncate max-w-[150px]">{primaryEmail}</span>
                    </div>
                </div>
            </td>

            {/* Social Links */}
            <td className="px-8 py-5">
                <div className="flex flex-col gap-1.5 min-w-[140px]">
                    {extractedSocials.length > 0 ? (
                        extractedSocials.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 hover:text-primary transition-colors">
                                <span className={getSocialColor(link)}>{getSocialIcon(link)}</span>
                                <span className="truncate max-w-[100px]">{getHostname(link)}</span>
                            </a>
                        ))
                    ) : (
                        <span className="text-[10px] font-bold text-gray-300 italic">No social links</span>
                    )}
                </div>
            </td>

            {/* Website */}
            <td className="px-8 py-5">
                {websiteStr ? (
                    <a
                        href={websiteStr.startsWith('http') ? websiteStr : `https://${websiteStr}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-bold text-[11px] transition-all underline-offset-4 hover:underline"
                    >
                        <Globe size={14} className="text-blue-400" />
                        <span className="truncate max-w-[140px]">{getHostname(websiteStr.startsWith('http') ? websiteStr : `https://${websiteStr}`)}</span>
                    </a>
                ) : (
                    <span className="text-xs font-bold text-gray-300 italic">N/A</span>
                )}
            </td>

            {/* Rating */}
            <td className="px-8 py-5">
                <StarRating rating={parseFloat(ratingVal) || 0} size="sm" />
            </td>

            {/* Status */}
            <td className="px-8 py-5 text-sm">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(lead.status) ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                    {lead.status || 'ENRICHED'}
                </span>
            </td>

            {/* Actions */}
            <td className="px-8 py-5 text-right">
                <div className="flex items-center justify-end gap-3 text-gray-300">
                    <button
                        className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90"
                        onClick={() => navigate('/lead-details', { state: { singleLead: lead, results: leads, queryInfo } })}
                    >
                        <Eye size={18} />
                    </button>
                    <button className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90">
                        <Trash2 size={18} />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default EnrichedLeadRow;
