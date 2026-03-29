import React from 'react';
import { Mail, Phone, Globe, Loader2, Eye, Trash2, Facebook, Instagram, Linkedin, Twitter, Youtube } from 'lucide-react';
import StarRating from '../ui/StarRating';
import { 
    deepGet, 
    extractStr, 
    scanSocials, 
    getSocialIcon, 
    getHostname 
} from '../../utils/contactUtils.jsx';

const ContactRow = ({ 
    contact, 
    idx, 
    isEnriched, 
    selectedLeads, 
    toggleLeadSelection, 
    handleViewLead, 
    handleViewRawContact,
    setDeleteModal, 
    viewingId, 
    deletingId 
}) => {
    const leadId = contact.id || contact.result_id;
    const isSelected = selectedLeads.includes(leadId);

    if (isEnriched) {
        const phoneStr = extractStr(
            deepGet(contact, ['mobile', 'MobileNumber', 'phone', 'contact_number', 'phone_number', 'Phone', 'Mobile']) ||
            contact.mobile || contact.MobileNumber || contact.phone
        );

        const emailRaw = deepGet(contact, ['email', 'Email', 'email_address', 'email_addresses', 'emails']) ||
            contact.email || contact.Email || contact.emails;
        
        let emailsList = [];
        if (Array.isArray(emailRaw)) emailsList = emailRaw.flatMap(e => typeof e === 'string' ? e.split(',').map(x => x.trim()) : []).filter(Boolean);
        else if (typeof emailRaw === 'object' && emailRaw !== null) emailsList = Object.values(emailRaw).filter(e => typeof e === 'string' && e.trim());
        else if (typeof emailRaw === 'string') emailsList = emailRaw.split(',').map(e => e.trim()).filter(Boolean);
        const primaryEmail = emailsList.length > 0 ? emailsList[0] : 'N/A';

        const websiteRaw = deepGet(contact, ['website', 'Website', 'website_url', 'url', 'domain', 'web', 'site_url']) ||
            contact.website || contact.Website;
        const websiteStr = extractStr(websiteRaw, null);

        const ratingRaw = deepGet(contact, ['rating', 'Rating', 'ratting', 'google_rating', 'star_rating', 'review_rating', 'avg_rating', 'score']) ||
            contact.rating || contact.Rating || contact.ratting;
        const ratingVal = extractStr(ratingRaw, '0');

        const extractedSocials = scanSocials(contact);

        return (
            <tr key={leadId || `enriched-${idx}`} className={`group hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleLeadSelection(leadId)}
                    />
                </td>
                <td className="px-6 py-4">
                    <div>
                        <p className="font-bold text-gray-900 text-sm leading-tight">
                            {contact.name || contact.BusinessName || contact.business_name || contact.Business_Name || contact.title || 'N/A'}
                        </p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-tight uppercase mt-0.5">
                            {contact.category || contact.Industry || contact.industry || contact.address || contact.Address || 'No category'}
                        </p>
                    </div>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600">
                            <Phone size={12} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[150px]">{phoneStr}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <Mail size={12} className="text-gray-400 shrink-0" />
                            {primaryEmail !== 'N/A' ? (
                                <a href={`mailto:${primaryEmail}`} className="truncate max-w-[150px] hover:text-primary transition-colors underline-offset-4 hover:underline">
                                    {primaryEmail}
                                </a>
                            ) : (
                                <span>N/A</span>
                            )}
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                        {extractedSocials.length > 0 ? (
                            extractedSocials.slice(0, 3).map((link, i) => (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-primary transition-colors group/soc" title={`Visit ${getHostname(link)}`}>
                                    {getSocialIcon(link)}
                                    <span className="truncate max-w-[120px]">{getHostname(link)}</span>
                                </a>
                            ))
                        ) : (
                            <span className="text-[10px] font-bold text-gray-300">No social links</span>
                        )}
                        {extractedSocials.length > 3 && (
                            <span className="text-[10px] font-bold text-gray-400">+{extractedSocials.length - 3} more</span>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
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
                <td className="px-6 py-4 text-sm">
                    <StarRating rating={parseFloat(ratingVal) || 0} size="sm" />
                </td>
                <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(contact.status) ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                        {contact.status || 'ENRICHED'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button
                            className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90 disabled:opacity-50"
                            onClick={() => handleViewLead(contact)}
                            disabled={viewingId === leadId}
                            title="View details"
                        >
                            {viewingId === leadId
                                ? <Loader2 size={18} className="animate-spin" />
                                : <Eye size={18} />}
                        </button>
                        <button
                            className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90 disabled:opacity-50"
                            onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModal({ open: true, type: 'lead', data: contact });
                            }}
                            disabled={deletingId === leadId}
                            title="Delete contact"
                        >
                            {deletingId === leadId
                                ? <Loader2 size={18} className="animate-spin" />
                                : <Trash2 size={18} />}
                        </button>
                    </div>
                </td>
            </tr>
        );
    }

    // Raw mode
    return (
        <tr key={leadId || `contact-${idx}-${contact.name || contact.BusinessName}`} className={`hover:bg-primary/[0.02] even:bg-gray-100/40 transition-colors group cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}>
            <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleLeadSelection(leadId)}
                />
            </td>
            <td className="px-6 py-4">
                <div>
                    <p className="font-bold text-gray-900 truncate max-w-[200px]">{contact.name || contact.BusinessName || 'N/A'}</p>
                </div>
            </td>
            <td className="comment px-6 py-4">
                <span className="text-sm font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100/50">
                    {contact.phone || contact.MobileNumber || contact.mobile || 'N/A'}
                </span>
            </td>
            <td className="px-6 py-4">
                <span className="text-sm font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer">
                    {contact.email || contact.Email || 'N/A'}
                </span>
            </td>
            <td className="px-6 py-4">
                {contact.website || contact.Website || contact.website_url ? (
                    <a
                        href={contact.website || contact.Website || contact.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all truncate max-w-[150px] inline-block"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {contact.website || contact.Website || contact.website_url}
                    </a>
                ) : (
                    <span className="text-xs font-bold text-gray-300 italic">N/A</span>
                )}
            </td>
            <td className="px-6 py-4 text-center">
                <StarRating rating={contact.rating || contact.Rating || contact.ratting || 0} size="sm" />
            </td>
            <td className="px-6 py-4">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-tighter uppercase border ${['VERIFIED', 'Active', 'Enriched', 'Validated'].includes(contact.status)
                    ? 'bg-green-50 text-green-600 border-green-100'
                    : 'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                    {contact.status || 'NEW'}
                </span>
            </td>
            <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-3 text-gray-400">
                    <button
                        className="p-2 hover:text-primary transition-colors hover:bg-primary/5 rounded-lg active:scale-90 disabled:opacity-50"
                        onClick={() => handleViewRawContact(contact)}
                        disabled={viewingId === leadId}
                        title="View details"
                    >
                        {viewingId === leadId
                            ? <Loader2 size={18} className="animate-spin" />
                            : <Eye size={18} />}
                    </button>
                    <button
                        className="p-2 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg active:scale-90 disabled:opacity-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDeleteModal({ open: true, type: 'lead', data: contact });
                        }}
                        disabled={deletingId === leadId}
                        title="Delete contact"
                    >
                        {deletingId === leadId
                            ? <Loader2 size={18} className="animate-spin" />
                            : <Trash2 size={18} />}
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default ContactRow;
