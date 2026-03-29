import React from 'react';
import { MapPin, Phone, Mail, Globe, ExternalLink, User } from 'lucide-react';
import Card from '../ui/Card';
import StarRating from '../ui/StarRating';

const SingleAudienceSidebar = ({ 
    businessName, 
    contactName, 
    category, 
    locationStr, 
    phoneStr, 
    emailsArray, 
    websiteStr, 
    socialLinks, 
    ratingVal, 
    source, 
    leadOwner,
    renderSocialIcon,
    getHostname
}) => {
    return (
        <Card title="Contact Info" className="h-full border-gray-100 shadow-lg shadow-gray-200/40">
            <div className="space-y-6 mt-4">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Business Name</p>
                    <p className="text-sm font-bold text-gray-900">{businessName}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Contact Name</p>
                    <p className="text-sm font-bold text-gray-900">{contactName}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="text-sm font-bold text-gray-900">{category}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</p>
                    <div className="flex items-start gap-1.5 mt-1">
                        <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        <p className="text-sm font-bold text-gray-800 leading-tight">{locationStr}</p>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Phone size={14} className="text-gray-400 shrink-0" />
                        <p className="text-sm font-bold text-primary">{phoneStr}</p>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                    <div className="flex items-start gap-1.5 mt-1">
                        <Mail size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        {emailsArray.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {emailsArray.map((email, index) => (
                                    <a key={index} href={`mailto:${email}`} className="text-sm font-bold text-gray-800 hover:text-primary hover:underline break-all leading-tight">
                                        {email}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-bold text-gray-800">N/A</p>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Website</p>
                    <div className="flex items-start gap-1.5 mt-1">
                        <Globe size={14} className="text-gray-400 mt-0.5 shrink-0" />
                        {websiteStr && websiteStr !== 'N/A' ? (
                            <a href={websiteStr.startsWith('http') ? websiteStr : `https://${websiteStr}`} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline break-all leading-tight flex items-center gap-1">
                                {websiteStr}
                                <ExternalLink size={12} className="shrink-0" />
                            </a>
                        ) : (
                            <p className="text-sm font-bold text-gray-800">{websiteStr}</p>
                        )}
                    </div>
                </div>
                {socialLinks.length > 0 && (
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Social Links</p>
                        <div className="flex flex-col gap-2 mt-1">
                            {socialLinks.map((link, i) => (
                                <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
                                    <div className="p-1.5 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-gray-100 transition-colors">
                                        {renderSocialIcon(link)}
                                    </div>
                                    <span className="text-xs font-bold text-gray-600 group-hover:text-primary transition-colors truncate">
                                        {getHostname(link)}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Google Rating</p>
                    <div className="flex items-center gap-2">
                        <StarRating rating={ratingVal} size="sm" />
                        <span className="text-sm font-bold text-gray-900">{ratingVal}</span>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lead Source</p>
                    <p className="text-sm font-bold text-gray-900">{source}</p>
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Lead Owner</p>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-300 flex items-center justify-center overflow-hidden">
                            <User size={12} className="text-gray-500" />
                        </div>
                        <p className="text-sm font-bold text-gray-900">{leadOwner || 'Account Executive'}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default SingleAudienceSidebar;
