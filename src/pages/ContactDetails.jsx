import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import Button from '../components/ui/Button';

// Data Helpers
import { getDeepField } from '../utils/contactDataHelpers.jsx';
import { extractStr, scanSocials } from '../utils/contactUtils.jsx';

// Sections
import ContactHeader from '../components/contactDetails/ContactHeader';
import ContactStats from '../components/contactDetails/ContactStats';
import ContactInfoCard from '../components/contactDetails/ContactInfoCard';
import ContactInsights from '../components/contactDetails/ContactInsights';

const ContactDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initial lead data from route
    let originalLead = location.state?.singleLead;
    let lead = originalLead;

    // Contact details parser & heuristic flattener
    try {
        while (typeof lead === 'string') {
            try { lead = JSON.parse(lead); } catch (e) { break; }
        }
        if (Array.isArray(lead)) lead = lead[0];

        // HEURISTIC SUPER-SCANNER: Finds metrics anywhere in the payload
        const deepExtract = (ob, result = {}) => {
            if (!ob || typeof ob !== 'object') return result;
            
            if (Array.isArray(ob)) {
                ob.forEach(item => deepExtract(item, result));
                return result;
            }
            
            for (const key in ob) {
                const val = ob[key];
                const lowKey = key.toLowerCase();
                
                // --- SUPER SCANNER for Rating ---
                if ((lowKey.includes('rating') || lowKey.includes('star')) && !lowKey.includes('id') && val !== null && val !== undefined) {
                    let extracted = null;
                    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(parseFloat(val)))) {
                        extracted = val;
                    } else if (typeof val === 'object') {
                        // Extract from nested object if present
                        extracted = val.value || val.rating || val.stars || val.avg || val.score || val.google_rating;
                    }
                    
                    if (extracted !== null) {
                        const parsed = parseFloat(extracted);
                        if (!isNaN(parsed) && (parsed > 0 || !result['Rating'])) {
                            result['Rating'] = extracted;
                        }
                    }
                }
                
                // --- SUPER SCANNER for Reviews ---
                if ((lowKey.includes('review') || lowKey.includes('total_review') || lowKey.includes('reviewcount')) && !lowKey.includes('id') && val !== null && val !== undefined) {
                    let extracted = null;
                    if (typeof val === 'number' || (typeof val === 'string' && !isNaN(parseInt(val)))) {
                        extracted = val;
                    } else if (typeof val === 'object') {
                        extracted = val.count || val.total || val.reviews || val.review_count || val.value || val.google_reviews;
                    }
                    
                    if (extracted !== null) {
                        const parsed = parseInt(extracted);
                        if (!isNaN(parsed) && (parsed > 0 || !result['Reviews'])) {
                            result['Reviews'] = extracted;
                        }
                    }
                }

                if (val && typeof val === 'object') {
                    deepExtract(val, result);
                    result[key] = val;
                } else if (val !== null && val !== undefined) {
                    result[key] = val;
                }
            }
            return result;
        };

        if (lead && typeof lead === 'object') {
            lead = { ...lead, ...deepExtract(lead) };
        }
    } catch (e) {
        console.error("Error parsing lead data:", e);
    }

    const finalLead = lead || originalLead || {};

    useEffect(() => { window.scrollTo(0, 0); }, []);

    if (!finalLead || Object.keys(finalLead).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 py-20">
                <Button onClick={() => navigate('/contacts')} className="px-8 font-bold">Back to Contacts</Button>
            </div>
        );
    }

    // EXTRACTION WITH ROBUST ALIAS LISTS
    // ALL PHONES SCANNER WITH LAST-10-DIGIT DEDUPLICATION
    const allPhones = (() => {
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

        const rawPhones = getDeepField(finalLead, [
            'phones', 'contact_mobile', 'mobileNumber', 'contactMobile', 'mobile_no', 'phone_number', 'phone', 
            'mobile', 'phoneNumber', 'contact_number', 'Phone', 'telephone', 'Mobile', 'MobileNumber', 'whatsapp'
        ]);
        if (Array.isArray(rawPhones)) rawPhones.forEach(v => addIfUnique(v));
        else if (rawPhones && typeof rawPhones === 'string') rawPhones.split(',').map(s => s.trim()).forEach(v => addIfUnique(v));
        
        // Final fallback scanner
        for (const [k, v] of Object.entries(finalLead)) {
            if (k.toLowerCase().includes('phone') && typeof v === 'string') addIfUnique(v);
        }
        return uniqueList;
    })();
    const phoneStr = allPhones.length > 0 ? allPhones.join(', ') : 'N/A';

    const businessName = extractStr(getDeepField(finalLead, [
        'business_name', 'BusinessName', 'name', 'company_name', 'Company', 'brand_name', 'org_name', 'Business_Name'
    ]) || 'Contact Detail');

    // Rating Identification
    const ratingValRaw = getDeepField(finalLead, [
        'Rating', 'rating', 'google_rating', 'stars', 'star_rating', 'avg_rating', 'googleRating', 
        'score', 'rating_value', 'average_rating', 'google_map_rating', 'google_maps_rating'
    ]);
    const ratingVal = isNaN(parseFloat(ratingValRaw)) ? 0 : parseFloat(ratingValRaw);

    // Reviews Identification
    const reviewsRaw = getDeepField(finalLead, [
        'Reviews', 'reviews', 'review_count', 'total_reviews', 'user_ratings_total', 'reviews_count', 
        'totalReviews', 'google_review_count', 'review_total', 'number_of_reviews', 'total_review_count', 
        'reviews_total', 'reviewCount', 'reviewsCount', 'google_reviews'
    ]) || 0;

    const emailsField = getDeepField(finalLead, ['email', 'Email', 'emails', 'emails_found', 'contact_emails']);
    const emailsList = Array.isArray(emailsField) ? emailsField : (typeof emailsField === 'string' ? emailsField.split(',').map(s => s.trim()) : []);
    const primaryEmail = emailsList.length > 0 ? emailsList[0] : (finalLead.email || finalLead.Email || 'N/A');
    const categoryStr = extractStr(getDeepField(finalLead, ['category', 'industry', 'Industry', 'niche', 'vertical']) || 'Uncategorized');
    const addressStr = extractStr(getDeepField(finalLead, ['address', 'location', 'Address', 'full_address', 'Location', 'full_location']) || 'N/A');
    const websiteStr = extractStr(getDeepField(finalLead, ['website', 'Website', 'url', 'website_url', 'domain', 'site_url']) || null, null);
    const ownerNameRaw = extractStr(getDeepField(finalLead, ['lead_owner', 'main_owner', 'owner_name', 'full_name', 'contact_person', 'rep_name', 'representative_name', 'OwnerName', 'ContactPerson', 'person_name']) || 'N/A');
    const ownerName = ownerNameRaw !== 'N/A' ? ownerNameRaw.split(/[,;|]/)[0].trim() : 'N/A';
    const extractedSocials = scanSocials(finalLead);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-16">
            <ContactHeader businessName={businessName} categoryStr={categoryStr} navigate={navigate} location={location} />
            <ContactStats ratingVal={ratingVal} reviewsRaw={reviewsRaw} ownerName={ownerName} />
            <ContactInfoCard
                businessName={businessName}
                phoneStr={phoneStr}
                emailsList={emailsList}
                primaryEmail={primaryEmail}
                addressStr={addressStr}
                websiteStr={websiteStr}
                extractedSocials={extractedSocials}
                ownerName={ownerName}
                allPhones={allPhones}
                reviewsRaw={reviewsRaw}
                ratingVal={ratingVal}
            />
            <ContactInsights finalLead={finalLead} />
        </div>
    );
};

export default ContactDetails;
