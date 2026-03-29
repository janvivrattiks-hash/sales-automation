import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Star, Tag, MapPin, Phone, Globe, User, MessageSquare, Facebook, Instagram, Linkedin, Twitter, Youtube, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import StarRating from '../ui/StarRating';
import { findSocialLink } from '../../utils/contactUtils';

const InfoRow = ({ icon: Icon, label, value, href }) => (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
            <Icon size={16} />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</p>
            {href ? (
                <a href={href} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1 truncate">
                    {value} <ExternalLink size={12} className="shrink-0" />
                </a>
            ) : (
                <p className="text-sm font-medium text-gray-900 break-words">{value || '—'}</p>
            )}
        </div>
    </div>
);

const SingleLeadDetail = ({ lead, onBack }) => {
    const [isOwnerExpanded, setIsOwnerExpanded] = useState(false);

    const fbUrl = findSocialLink(lead, 'facebook');
    const igUrl = findSocialLink(lead, 'instagram');
    const liUrl = findSocialLink(lead, 'linkedin');
    const twUrl = findSocialLink(lead, 'twitter');
    const ytUrl = findSocialLink(lead, 'youtube');

    const hasSocials = fbUrl || igUrl || liUrl || twUrl || ytUrl;

    const websiteRaw = lead.website || lead.Website || lead.website_url;
    const websiteDisplay = websiteRaw
        ? websiteRaw.replace(/^https?:\/\//, '').replace(/\/$/, '')
        : null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <button onClick={onBack} className="hover:text-primary transition-colors">Dashboard</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">Lead Detail</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{lead.name || lead.BusinessName || 'Lead Detail'}</h1>
                    <p className="text-gray-500 text-sm mt-1">{lead.category || lead.Industry || 'No category'}</p>
                </div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                >
                    <ChevronLeft size={16} />
                    Back to Dashboard
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Rating', value: `${lead.rating || lead.Rating || lead.ratting || 0} / 5` },
                    { label: 'Reviews', value: lead.reviews || lead.Reviews || 0 },
                    { label: 'Owner', value: lead.owner_name || lead.Owner || 'N/A', isClickable: true },
                ].map(s => (
                    <Card
                        key={s.label}
                        noPadding
                        className={`p-4 transition-all duration-300 ${s.isClickable ? 'cursor-pointer hover:bg-gray-50/50 hover:shadow-md border-transparent hover:border-primary/20' : ''}`}
                        onClick={s.isClickable ? () => setIsOwnerExpanded(!isOwnerExpanded) : undefined}
                    >
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={`text-xl font-bold text-gray-900 leading-tight transition-all duration-300 ${s.label === 'Owner' && isOwnerExpanded ? 'whitespace-normal break-words h-auto' : 'truncate'}`}>
                            {s.value}
                        </p>
                    </Card>
                ))}
            </div>

            {/* Business Info Card */}
            <Card title="Business Information" subtitle="Full details for this lead">
                <div className="mt-2">
                    <InfoRow icon={Tag} label="Business Name" value={lead.name || lead.BusinessName} />
                    <InfoRow icon={Tag} label="Category" value={lead.category || lead.Industry} />
                    <InfoRow icon={MapPin} label="Address" value={lead.address || lead.Address} />
                    <InfoRow icon={Phone} label="Phone" value={lead.phone || lead.MobileNumber || lead.mobile} />
                    <InfoRow
                        icon={Globe}
                        label="Website"
                        value={websiteDisplay}
                        href={websiteRaw || null}
                    />
                    {hasSocials && (
                        <>
                            {fbUrl && <InfoRow icon={Facebook} label="Facebook" value="Visit Profile" href={fbUrl} />}
                            {igUrl && <InfoRow icon={Instagram} label="Instagram" value="Visit Profile" href={igUrl} />}
                            {liUrl && <InfoRow icon={Linkedin} label="LinkedIn" value="Visit Profile" href={liUrl} />}
                            {twUrl && <InfoRow icon={Twitter} label="Twitter" value="Visit Profile" href={twUrl} />}
                            {ytUrl && <InfoRow icon={Youtube} label="YouTube" value="Visit Profile" href={ytUrl} />}
                        </>
                    )}
                    <InfoRow icon={User} label="Owner Name" value={lead.owner_name || lead.Owner} />
                    <InfoRow
                        icon={MessageSquare}
                        label="Reviews"
                        value={(lead.reviews || lead.Reviews) != null ? `${lead.reviews || lead.Reviews} reviews` : null}
                    />
                    {/* Star rating row */}
                    <div className="flex items-start gap-4 py-4">
                        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                            <Star size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                            <StarRating rating={lead.rating || lead.Rating || lead.ratting || 0} size="md" />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SingleLeadDetail;
