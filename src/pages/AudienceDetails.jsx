import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Api from '../../scripts/Api';
import { findSocialLink } from '../utils/contactUtils';

import AudienceHeader from '../components/audienceDetails/AudienceHeader';
import AudienceStats from '../components/audienceDetails/AudienceStats';
import AudienceTable from '../components/audienceDetails/AudienceTable';

// --- FIELD SCANNER UTILITIES ---
const PHONE_FIELDS = ['phone', 'MobileNumber', 'phone_number', 'mobile', 'contact_no', 'telephone', 'contact_number', 'mobilenumber', 'cell', 'tel', 'office', 'whatsapp', 'biz_phone', 'business_phone', 'Contact'];
const EMAIL_FIELDS = ['email', 'Email', 'email_address', 'contact_email', 'work_email', 'primary_email', 'email_addresses', 'biz_email', 'business_email'];
const RATING_FIELDS = ['rating', 'Rating', 'stars', 'star_rating', 'average_rating', 'user_ratings_total', 'RatingValue', 'review_score', 'google_rating', 'google_map_rating', 'googleRating', 'avg_rating', 'score', 'lead_rating', 'biz_rating', 'BusinessRating', 'rating_value', 'rating_score', 'starRating'];
const WEBSITE_FIELDS = ['website', 'Website', 'url', 'site_url', 'business_url', 'link', 'domain'];

const parseRating = (val) => {
    if (val === undefined || val === null) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'object' && !Array.isArray(val)) {
        const subVal = val.value || val.rating || val.score || val.average || val.stars || val.Rating || val.RatingValue;
        return parseRating(subVal);
    }
    if (typeof val === 'string') {
        // Handle "4.5/5" or "4.5 stars"
        // Improved regex: match the first decimal number found in the string
        const match = val.match(/(\d+(\.\d+)?)/);
        if (match) {
            const num = parseFloat(match[0]);
            return isNaN(num) ? 0 : num;
        }
        return 0;
    }
    return 0;
};

const findIn = (obj, fields, recursive = false) => {
    if (!obj || typeof obj !== 'object') return null;
    
    // 1. Direct match at current level
    for (const f of fields) {
        const val = obj[f];
        if (val !== undefined && val !== null) {
            // If it's a primitive we want, return it
            if (typeof val === 'string' || typeof val === 'number') return val;
            // If it's an object, it might be { value: 4.5 }
            if (typeof val === 'object' && !Array.isArray(val)) {
                const sub = val.value || val.rating || val.score || val.stars || val.average;
                if (sub !== undefined && sub !== null) return sub;
            }
        }
    }

    // 2. Wrap-aware search (one level down for common containers)
    const wrappers = ['data', 'results', 'lead', 'contact', 'business_information', 'business_info', 'biz_info', 'business', 'search_details', 'analysis_results'];
    for (const w of wrappers) {
        if (obj[w] && typeof obj[w] === 'object' && !Array.isArray(obj[w])) {
            // Search inside wrappers, but don't indefinitely recurse here unless flag is set
            for (const f of fields) {
                if (obj[w][f] !== undefined && obj[w][f] !== null) return obj[w][f];
            }
        }
    }

    // 3. Recursive Deep Search (Super Scanner) - Only if explicitly requested (e.g. for Rating)
    if (recursive) {
        for (const key in obj) {
            const lowKey = key.toLowerCase();
            const val = obj[key];

            // If the key itself looks like a field we want and we have a primitive value
            // (Only for rating/score/stars when recursive is on)
            if ((lowKey.includes('rating') || lowKey.includes('star') || lowKey.includes('score')) && 
                !lowKey.includes('id') && 
                (typeof val === 'number' || typeof val === 'string')) {
                return val;
            }

            // Otherwise recurse
            if (val && typeof val === 'object' && !Array.isArray(val)) {
                const result = findIn(val, fields, true);
                if (result !== undefined && result !== null) return result;
            }
        }
    }
    return null;
};

const normalizeLead = (lead) => {
    if (!lead) return lead;

    // 1. Extract Fields using Recursive Scanner (Rating is recursive, others are shallow/wrap-aware)
    const phone = findIn(lead, PHONE_FIELDS, false) || 'N/A';
    const email = findIn(lead, EMAIL_FIELDS, false) || 'N/A';
    const website = findIn(lead, WEBSITE_FIELDS, false) || '';
    
    // 2. High-precision recursive rating extraction
    const rawRating = findIn(lead, RATING_FIELDS, true) || lead.rating || lead.Rating || 0;
    const finalRating = parseRating(rawRating);
    
    const normalizedId = lead.id || lead.result_id || lead.business_information_id || lead.business_id || lead.lead_id || '';

    // Debugging (optional, keep minimal)
    if (finalRating > 0) {
        console.log(`Rating Discovered for ${normalizedId}:`, finalRating);
    }

    return {
        ...lead,
        id: normalizedId,
        result_id: normalizedId,
        phone,
        MobileNumber: phone,
        email,
        Email: email,
        website,
        Website: website,
        rating: finalRating,
        Rating: finalRating
    };
};

const AudienceDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useApp();
    const [viewingId, setViewingId] = useState(null);
    const [leads, setLeads] = useState([]);
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enriching, setEnriching] = useState(false);

    const [searchMetadata, setSearchMetadata] = useState({
        query: 'N/A',
        city: 'Any',
        area: 'Any'
    });

    // Get audience from location state
    const audience = location.state?.audience || location.state?.selectedAudience || {};
    const audienceName = audience.audiance_name || audience.name || (location.state?.selectedAudience?.audiance_name) || 'N/A';


    useEffect(() => {
        const id = audience?.id || audience?.result_id || audience?.audiance_id || audience?.audience_id || location.state?.selectedAudience?.id || location.state?.selectedAudience?.audiance_id;
        window.scrollTo(0, 0);
        if (adminToken && id) {
            fetchAudienceData();
        } else if (!id && location.state?.selectedLeadsData) {

            // If we have no ID but we have data in state, use it
            setLeads(location.state.selectedLeadsData.map(l => normalizeLead(l)));
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [adminToken, audience?.id, audience?.result_id]);

    const fetchAudienceData = async () => {
        const id = audience?.id || audience?.result_id || audience?.audiance_id || audience?.audience_id || location.state?.selectedAudience?.id || location.state?.selectedAudience?.audiance_id;
        if (!id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            console.log("FETCH_AUDIENCE_DETAILS_START: id", id);

            // 1. Fetch full audience details directly from API
            const detailedAudience = await Api.getAudienceDetails(id, adminToken);

            // 3. Robust Lead Extraction (Brute Force Search)
            let rawSource = detailedAudience || audience || {};
            
            // Priority 1: Location state (already passed from previous page)
            let baseLeads = location.state?.selectedLeadsData || [];

            // Priority 2: Deep search in API response
            if (baseLeads.length === 0) {
                const findLeads = (obj) => {
                    if (!obj) return [];
                    if (Array.isArray(obj)) return obj;
                    
                    // Priority Keys
                    const keys = ['leads', 'contacts', 'results', 'audiance_leads', 'business_ids', 'lead_ids', 'data', 'Lead'];
                    for (const key of keys) {
                        if (Array.isArray(obj[key])) return obj[key];
                        // Also check if the key exists but is a single object (normalize it to an array)
                        if (obj[key] && typeof obj[key] === 'object' && (obj[key].name || obj[key].BusinessName || obj[key].business_name)) {
                            return [obj[key]];
                        }
                        if (obj[key] && typeof obj[key] === 'object') {
                            const nested = findLeads(obj[key]);
                            if (nested.length > 0) return nested;
                        }
                    }
                    
                    // If the object itself looks like a lead, return it as a single-item array
                    if (obj.name || obj.BusinessName || obj.business_name || obj.Business_Name) {
                        return [obj];
                    }
                    
                    // Brute force: find ANY array
                    for (const val of Object.values(obj)) {
                        if (Array.isArray(val) && val.length > 0) return val;
                    }
                    return [];
                };
                
                baseLeads = findLeads(rawSource);
            }

            console.log("BASE_LEADS_EXTRACTED:", baseLeads.length);

            // 4. Normalize Leads (Handle IDs vs Objects)
            baseLeads = baseLeads.map(lead => {
                if (!lead) return null;
                if (typeof lead === 'string' || typeof lead === 'number') {
                    return {
                        id: String(lead),
                        result_id: String(lead),
                        name: `Lead #${lead}`,
                        BusinessName: `Lead #${lead}`
                    };
                }
                return lead;
            }).filter(Boolean);

            // 5. Update Search Metadata
            const rawDetails = (Array.isArray(detailedAudience) ? detailedAudience[0] : (detailedAudience?.data || detailedAudience)) || audience || {};
            setSearchMetadata({
                query: rawDetails.audiance_name || rawDetails.name || rawDetails.search_details?.niche_or_keyword || rawDetails.query_name || rawDetails.search_details?.query || audienceName || 'N/A',
                city: rawDetails.city || rawDetails.search_details?.location || rawDetails.search_details?.city || audience?.city || 'Any',
                area: rawDetails.area || rawDetails.search_details?.area || audience?.area || 'Any'
            });

            // 6. Finalize leads list
            let finalLeads = baseLeads;

            // 6. Normalize all leads for the UI (ensures ID stability)
            finalLeads = finalLeads.map(lead => normalizeLead(lead));

            console.log(`SET_LEADS: total strictly fetched leads = ${finalLeads.length}`);
            setLeads(finalLeads);
            setLoading(false);

            // 7. Progressive Background Enrichment for Enriching missing data (Contact info, Rating, Socials)
            const leadsToEnrich = finalLeads.filter(l => 
                !l.BusinessName || 
                l.BusinessName.includes('Lead #') || 
                l.name === `Lead #${l.id}` ||
                (!l.email && !l.phone && !l.website) ||
                (!l.rating || l.rating === 0)
            );

            if (leadsToEnrich.length > 0) {
                setEnriching(true);
                console.log(`IN_PROGRESS: Enriching ${leadsToEnrich.length} minimal leads in background...`);
                // Use a modest concurrency limit of 5 to avoid overloading the backend
                const batchSize = 5;
                for (let i = 0; i < leadsToEnrich.length; i += batchSize) {
                    const batch = leadsToEnrich.slice(i, i + batchSize);
                    
                    const enrichedBatch = await Promise.all(
                        batch.map(async (minimalLead) => {
                            try {
                                const fullData = await Api.getContactInfo(minimalLead.id, adminToken);
                                if (fullData) {
                                    // Re-normalize with the new detailed data
                                    return normalizeLead({ ...minimalLead, ...fullData });
                                }
                                return null; // No new data found
                            } catch (err) {
                                console.warn(`Enrichment failed for lead ${minimalLead.id}:`, err);
                                return null;
                            }
                        })
                    );

                    const validEnrichedLeads = enrichedBatch.filter(Boolean);
                    if (validEnrichedLeads.length > 0) {
                        setLeads(prevLeads => prevLeads.map(lead => {
                            // Harden comparison: cast both IDs to String to ensure match regardless of type (Number vs String)
                            const match = validEnrichedLeads.find(el => String(el.id) === String(lead.id));
                            return match ? match : lead;
                        }));
                    }
                }
                console.log("SUCCESS: Background enrichment cycle complete.");
                setEnriching(false);
            }

        } catch (error) {
            console.error("FETCH_AUDIENCE_DATA_ERROR:", error);
        } finally {
            setLoading(false);
        }
    };

    // Detect if this is an enriched audience
    const isEnriched = (audience?.tag || '').toLowerCase().includes('enriched') || location.state?.activeTab === 'enriched';

    const totalLeads = leads.length;
    const verifiedContacts = leads.filter(l => l.email || l.Email || l.verified_email).length;

    const socialContactsFound = leads.filter(l =>
        findSocialLink(l, 'facebook') ||
        findSocialLink(l, 'instagram') ||
        findSocialLink(l, 'linkedin') ||
        findSocialLink(l, 'twitter') ||
        findSocialLink(l, 'youtube')
    ).length;

    const enrichmentRate = totalLeads > 0 ? Math.round((leads.filter(l =>
        l.email || l.Email ||
        findSocialLink(l, 'facebook') ||
        findSocialLink(l, 'instagram') ||
        findSocialLink(l, 'linkedin') ||
        findSocialLink(l, 'twitter') ||
        findSocialLink(l, 'youtube')
    ).length / totalLeads) * 100) : 0;

    const stats = isEnriched ? [
        { label: 'TOTAL LEADS', value: totalLeads.toLocaleString(), icon: Users },
        { label: 'VERIFIED EMAILS', value: verifiedContacts.toLocaleString(), icon: CheckCircle2 },
        { label: 'SOCIAL PROFILES', value: socialContactsFound.toLocaleString(), icon: Zap },
        { label: 'ENRICHMENT RATE', value: `${enrichmentRate}%`, icon: Sparkles },
    ] : [
        { label: 'SEARCH QUERY', value: searchMetadata.query },
        { label: 'CITY', value: searchMetadata.city },
        { label: 'AREA', value: searchMetadata.area },
        { label: 'TOTAL LEADS', value: leads.length.toString(), icon: Users },
    ];

    const handleViewContact = async (contact) => {
        const id = contact.id || contact.result_id;
        setViewingId(id);

        // --- Call Summary API (Pre-fetch / Trigger) ---
        try {
            console.log("TRIGGERING_SUMMARY_API_ON_CLICK:", id);
            await Api.getSummary(id, adminToken);
        } catch (err) {
            console.warn("Summary call background error:", err.message);
        }

        setTimeout(() => {
            console.log("Navigating to single lead. isEnriched flag:", isEnriched, "contact:", contact);
            if (isEnriched || contact.status === 'ENRICHED' || contact.status === 'Enriched') {
                navigate('/single-audience-view', { state: { singleLead: contact, audience: audience } });
            } else {
                navigate('/contact-details', { state: { singleLead: contact } });
            }
            setViewingId(null);
        }, 300);
    };

    const toggleLeadSelection = (id) => {
        setSelectedLeads(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        );
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-32">
            <AudienceHeader
                audienceName={audienceName}
                isEnriched={isEnriched}
                loading={loading}
                enriching={enriching}
                navigate={navigate}
            />

            <AudienceStats stats={stats} />

            <AudienceTable
                leads={leads}
                loading={loading}
                isEnriched={isEnriched}
                viewingId={viewingId}
                onViewContact={handleViewContact}
                selectedLeads={selectedLeads}
                toggleLeadSelection={toggleLeadSelection}
                setSelectedLeads={setSelectedLeads}
            />
        </div>
    );
};

export default AudienceDetails;
