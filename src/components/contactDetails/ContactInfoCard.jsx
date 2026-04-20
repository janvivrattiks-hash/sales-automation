import React from 'react';
import { Tag, Phone, Mail, MapPin, Globe, User, MessageSquare, Star } from 'lucide-react';
import Card from '../ui/Card';
import InfoRow from './InfoRow';
import StarRating from '../ui/StarRating';
import { getHostname } from '../../utils/contactUtils';

const ContactInfoCard = ({ businessName, phoneStr, emailsList, primaryEmail, addressStr, websiteStr, extractedSocials, ownerName, reviewsRaw, ratingVal, allPhones = [] }) => {
    return (
        <Card title="Business Information" subtitle="Full details for this contact">
            <div className="mt-2 text-sm">
                <InfoRow icon={Tag} label="Business Name" value={businessName} />
                <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
                    <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                        <Phone size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Contact Mobile</p>
                        {allPhones.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                {allPhones.map((p, idx) => (
                                    <a key={idx} href={`tel:${p}`} className="text-sm font-medium text-primary hover:underline block truncate">
                                        {p}
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm font-medium text-gray-800">{phoneStr || '—'}</p>
                        )}
                    </div>
                </div>
                <InfoRow
                    icon={Mail}
                    label="Email Address"
                    value={emailsList.length > 1 ? `${emailsList[0]} (+${emailsList.length - 1} more)` : primaryEmail}
                    href={primaryEmail !== 'N/A' ? `mailto:${primaryEmail}` : null}
                />
                <InfoRow icon={MapPin} label="Location/Address" value={addressStr} />
                <InfoRow
                    icon={Globe}
                    label="Website"
                    value={websiteStr ? getHostname(websiteStr) : 'N/A'}
                    href={websiteStr ? (websiteStr.startsWith('http') ? websiteStr : `https://${websiteStr}`) : null}
                />

                {/* Social links rendered as InfoRows */}
                {extractedSocials.map((link, i) => {
                    const hostname = getHostname(link);
                    const platform = hostname.split('.')[0].charAt(0).toUpperCase() + hostname.split('.')[0].slice(1);
                    return (
                        <InfoRow
                            key={i}
                            icon={Globe}
                            label={platform}
                            value="Visit Profile"
                            href={link}
                        />
                    );
                })}

                <InfoRow icon={User} label="Owner Name" value={ownerName} />
                <InfoRow icon={MessageSquare} label="Reviews" value={reviewsRaw ? `${reviewsRaw} reviews` : '0 reviews'} />

                {/* Star rating */}
                <div className="flex items-start gap-4 py-4">
                    <div className="mt-0.5 p-2 bg-primary/5 rounded-lg text-primary shrink-0">
                        <Star size={16} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</p>
                        <StarRating rating={ratingVal} size="md" />
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ContactInfoCard;
