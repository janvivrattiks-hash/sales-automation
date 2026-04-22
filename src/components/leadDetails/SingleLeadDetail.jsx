import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Star, Tag, MapPin, Phone, Globe, User, MessageSquare, Facebook, Instagram, Linkedin, Twitter, Youtube, ExternalLink, Mail } from 'lucide-react';
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

    console.log("🔍 [SingleLeadDetail] Lead data received:", lead);

    // Unwrap the data if it's nested in a response object
    // API returns: { count: 1, data: { ... }, message: "..." }
    const leadData = lead?.data || lead;

    console.log("📋 [SingleLeadDetail] Unwrapped lead data:", leadData);

    // Helper to get first valid (non-empty, non-'N/A') string from a list of properties
    const getValidStr = (lead, keys, defaultVal = 'N/A') => {
        for (const key of keys) {
            const val = lead[key];
            if (val && typeof val === 'string' && val.trim() !== '' && val.toLowerCase() !== 'n/a') {
                return val;
            }
            if (val !== undefined && val !== null && typeof val !== 'string') {
                return String(val); // in case rating/reviews are numbers
            }
        }
        return defaultVal;
    };

    // Extract data with fallbacks for various field name formats, ignoring N/A
    const businessName = getValidStr(leadData, ['business_name', 'name', 'BusinessName']);
    const category = getValidStr(leadData, ['business_category', 'category', 'Category', 'Industry']);
    const address = getValidStr(leadData, ['address', 'Address', 'full_address']);
    const rawOwner = getValidStr(leadData, ['lead_owner', 'main_owner', 'primary_contact_name', 'owner_name', 'Owner', 'owner']);
    const ownerName = rawOwner !== 'N/A' ? rawOwner.split(/[,;|]/)[0].trim() : 'N/A';
    const email = getValidStr(leadData, ['email', 'Email', 'business_email']);
    const rating = getValidStr(leadData, ['rating', 'Rating', 'ratting'], 0);
    const reviews = getValidStr(leadData, ['reviews', 'Reviews'], 0);

    // Collective Phone Extraction with Last-10-Digit Deduplication
    const getPhones = (data) => {
        const uniqueList = [];
        const seenLast10 = new Set();

        const addIfUnique = (p) => {
            if (!p || typeof p !== 'string') return;
            const digits = p.replace(/\D/g, '');
            if (digits.length < 7) return;
            const last10 = digits.slice(-10);
            if (!seenLast10.has(last10)) {
                seenLast10.add(last10);
                uniqueList.push(p.trim());
            }
        };

        const keys = ['phones', 'contact_number', 'phone', 'Phone', 'MobileNumber', 'mobile_number', 'whatsapp'];
        keys.forEach(k => {
            const val = data[k];
            if (Array.isArray(val)) val.forEach(v => addIfUnique(v));
            else if (val) addIfUnique(val);
        });
        return uniqueList;
    };
    const allPhones = getPhones(leadData);
    const phone = allPhones.length > 0 ? allPhones.join(', ') : 'N/A';

    // Filter out junk values (e.g., "no", "false", "yes", "none", "null")
    const junkWebsites = ['no', 'n', 'false', 'none', 'null', 'undefined', 'n/a', 'na', 'yes', 'y'];
    // Website Extraction with junk value filtering
    const rawWebsite = getValidStr(leadData, ['website', 'Website', 'website_url'], null);
    const website = (rawWebsite && typeof rawWebsite === 'string' && !junkWebsites.includes(rawWebsite.toLowerCase().trim()) && rawWebsite.length >= 4)
        ? rawWebsite
        : null;

    console.log("📊 [SingleLeadDetail] Extracted data:", {
        businessName, category, address, phone, email, rating, reviews, ownerName, website
    });

    const fbUrl = findSocialLink(leadData, 'facebook');
    const igUrl = findSocialLink(leadData, 'instagram');
    const liUrl = findSocialLink(leadData, 'linkedin');
    const twUrl = findSocialLink(leadData, 'twitter');
    const ytUrl = findSocialLink(leadData, 'youtube');

    const hasSocials = fbUrl || igUrl || liUrl || twUrl || ytUrl;

    const websiteDisplay = website
        ? website.replace(/^https?:\/\//, '').replace(/\/$/, '')
        : 'Not Available';

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-16">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <button onClick={onBack} className="hover:text-primary transition-colors">Search Results</button>
                <ChevronRight size={10} />
                <span className="text-gray-900">Lead Detail</span>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{businessName}</h1>
                    <p className="text-gray-500 text-sm mt-1">{category}</p>
                </div>
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-bold"
                >
                    <ChevronLeft size={16} />
                    Back to Results
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Rating', value: `${rating} / 5` },
                    { label: 'Reviews', value: reviews },
                    { label: 'Owner', value: ownerName, isClickable: true },
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
                    <InfoRow icon={Tag} label="Business Name" value={businessName} />
                    <InfoRow icon={Tag} label="Category" value={category} />
                    <InfoRow icon={MapPin} label="Address" value={address} />
                    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
                        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                            <Phone size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Phone</p>
                            {allPhones.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                    {allPhones.map((p, idx) => (
                                        <a key={idx} href={`tel:${p}`} className="text-sm font-medium text-primary hover:underline block truncate">
                                            {p}
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm font-medium text-gray-900">—</p>
                            )}
                        </div>
                    </div>
                    <InfoRow
                        icon={Globe}
                        label="Website"
                        value={websiteDisplay}
                        href={website || null}
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
                    <InfoRow icon={User} label="Owner Name" value={ownerName} />
                    <InfoRow icon={MessageSquare} label="Reviews" value={reviews ? `${reviews} reviews` : null} />
                    <InfoRow icon={Mail} label="Email" value={email} />
                    {/* Star rating row */}
                    <div className="flex items-start gap-4 py-4">
                        <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                            <Star size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                            <StarRating rating={rating} size="md" />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default SingleLeadDetail;
