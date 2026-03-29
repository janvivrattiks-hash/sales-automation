import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

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

    // Get base lead data from route
    let originalLead = location.state?.singleLead;
    let lead = originalLead;

    // Contact details parser
    try {
        while (typeof lead === 'string') {
            try { lead = JSON.parse(lead); } catch (e) { break; }
        }
        if (Array.isArray(lead)) lead = lead[0];

        // Deep recursive merge to flatten everything to the top level
        const flattenObj = (ob) => {
            let result = {};
            for (const i in ob) {
                if ((typeof ob[i]) === 'object' && !Array.isArray(ob[i]) && ob[i] !== null) {
                    const temp = flattenObj(ob[i]);
                    for (const j in temp) { result[j] = temp[j]; }
                } else {
                    result[i] = ob[i];
                }
            }
            return result;
        };

        if (lead && typeof lead === 'object') {
            lead = { ...lead, ...flattenObj(lead) };
        }
    } catch (e) {
        console.error("Error flattening lead payload:", e);
    }

    // Ensure lead falls back safely
    const finalLead = lead || originalLead || {};

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    if (!finalLead || Object.keys(finalLead).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-6 py-20">
                <div className="bg-gray-50 p-6 rounded-full">
                    <Users size={48} className="text-gray-300" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">No Contact Data Found</p>
                    <p className="text-sm text-gray-500 mt-1">Please select a contact from the management page.</p>
                </div>
                <Button onClick={() => navigate('/contacts')} className="px-8 font-bold">
                    Back to Contacts
                </Button>
            </div>
        );
    }

    // Refined Extraction Logic for Enriched Data
    const getEmailsArray = () => {
        const found = getDeepField(finalLead, ['email', 'Email', 'emails_found', 'emails', 'email_addresses', 'contact_emails', 'personal_email', 'work_email', 'email1', 'email2']);
        if (Array.isArray(found) && found.length > 0) return found.map(e => String(e).trim()).filter(Boolean);
        if (typeof found === 'string') return found.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    };
    const emailsList = getEmailsArray();
    const primaryEmail = emailsList.length > 0 ? emailsList[0] : 'N/A';

    const phoneStr = extractStr(getDeepField(finalLead, ['phone_number', 'phone', 'mobile', 'contact_number', 'Phone', 'MobileNumber', 'contact_no', 'work_phone', 'mobile_phone', 'phone1', 'phone2', 'contact_phone', 'telephone', 'WorkPhone', 'contact_mobile', 'mobile_no']) || 'N/A');

    const businessName = extractStr(
        getDeepField(finalLead, ['business_name', 'BusinessName', 'name', 'company_name', 'Company', 'title', 'brand_name', 'organization_name', 'org_name', 'trade_name', 'Business_Name']) || 'Contact Detail'
    );

    const categoryStr = extractStr(
        getDeepField(finalLead, ['category', 'Industry', 'industry', 'niche', 'vertical', 'sector']) || 'Uncategorized'
    );

    const addressStr = extractStr(
        getDeepField(finalLead, ['address', 'Address', 'location', 'full_address', 'Full_Address', 'formatted_address']) || 'N/A'
    );

    const websiteStr = extractStr(
        getDeepField(finalLead, ['website', 'Website', 'website_url', 'url', 'domain', 'site_url']) || null,
        null
    );

    const ratingParsed = parseFloat(getDeepField(finalLead, ['rating', 'Rating', 'ratting', 'google_rating', 'star_rating', 'review_rating', 'score', 'stars', 'rating_value', 'average_rating', 'google_map_rating', 'google_maps_rating']));
    const ratingVal = isNaN(ratingParsed) ? 0 : ratingParsed;
    const reviewsRaw = getDeepField(finalLead, ['reviews', 'Reviews', 'review_count', 'total_reviews', 'user_ratings_total', 'reviews_count', 'review_total', 'number_of_reviews', 'total_review_count', 'reviewCount', 'reviewsCount']) || 0;

    const ownerName = extractStr(getDeepField(finalLead, ['full_name', 'contact_name', 'contact_person', 'name', 'OwnerName', 'owner_name', 'Owner', 'assigned_to', 'owner', 'first_name', 'last_name', 'manager', 'rep_name', 'sales_rep', 'ContactPerson', 'contactPerson', 'ownerName']) || 'N/A');

    // Safety check: is the parsed data fundamentally empty? Create a raw dump for debugging just in case.
    const isDataEmpty = !businessName || businessName === 'Contact Detail' || businessName === 'N/A';
    const extractedSocials = scanSocials(finalLead);

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-16">
            <ContactHeader 
                businessName={businessName} 
                categoryStr={categoryStr} 
                navigate={navigate} 
                location={location} 
            />

            <ContactStats 
                ratingVal={ratingVal} 
                reviewsRaw={reviewsRaw} 
                ownerName={ownerName} 
            />

            <ContactInfoCard
                businessName={businessName}
                phoneStr={phoneStr}
                emailsList={emailsList}
                primaryEmail={primaryEmail}
                addressStr={addressStr}
                websiteStr={websiteStr}
                extractedSocials={extractedSocials}
                ownerName={ownerName}
                reviewsRaw={reviewsRaw}
                ratingVal={ratingVal}
            />

            <ContactInsights finalLead={finalLead} />

            {/* RAW PAYLOAD DEBUGGER (only visible if we couldn't parse the name) */}
            {isDataEmpty && (
                <Card title="Raw Data Payload (Debug Mode)" subtitle="This appears because we couldn't find the business name automatically.">
                    <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded-xl text-xs overflow-auto max-h-[400px]">
                        {JSON.stringify(originalLead || lead, null, 2)}
                    </pre>
                </Card>
            )}
        </div>
    );
};

export default ContactDetails;
