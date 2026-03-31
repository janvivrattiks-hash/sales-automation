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
const RATING_FIELDS = ['rating', 'Rating', 'stars', 'average_rating', 'user_ratings_total', 'RatingValue', 'review_score'];
const WEBSITE_FIELDS = ['website', 'Website', 'url', 'site_url', 'business_url', 'link', 'domain'];

const findIn = (obj, fields) => {
    if (!obj || typeof obj !== 'object') return null;
    // Direct match
    for (const f of fields) {
        if (obj[f] && typeof obj[f] === 'string' && obj[f].trim()) return obj[f].trim();
        if (obj[f] && typeof obj[f] === 'number') return String(obj[f]);
    }
    // Deep match (scan one level down if it's a 'data' or 'results' wrapper)
    const wrappers = ['data', 'results', 'lead', 'contact', 'business_information', 'business_info', 'biz_info', 'business'];
    for (const w of wrappers) {
        if (obj[w] && typeof obj[w] === 'object') {
            const nested = findIn(obj[w], fields);
            if (nested) return nested;
        }
    }
    // Array scan
    if (Array.isArray(obj.email_addresses) && fields === EMAIL_FIELDS) return obj.email_addresses[0];
    return null;
};

const normalizeLead = (lead) => {
    if (!lead) return lead;
    const phone = findIn(lead, PHONE_FIELDS) || 'N/A';
    const email = findIn(lead, EMAIL_FIELDS) || 'N/A';
    const website = findIn(lead, WEBSITE_FIELDS) || '';
    const rating = findIn(lead, RATING_FIELDS) || lead.rating || 0;

    return {
        ...lead,
        phone,
        MobileNumber: phone,
        email,
        Email: email,
        website,
        Website: website,
        rating: Number(rating),
        Rating: Number(rating)
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

    const [searchMetadata, setSearchMetadata] = useState({
        query: 'N/A',
        city: 'Any',
        area: 'Any'
    });

    // Get audience from location state
    const audience = location.state?.audience || location.state?.selectedAudience;

    useEffect(() => {
        window.scrollTo(0, 0);
        if (adminToken && audience) {
            fetchAudienceData();
        } else {
            setLoading(false);
        }
    }, [adminToken, audience?.id, location.state?.selectedLeadsData?.length]);

    const fetchAudienceData = async () => {
        setLoading(true);
        try {
            const id = audience.id || audience.result_id;
            console.log("FETCH_AUDIENCE_DETAILS_START: id", id);

            // 1. Fetch full audience details directly from API
            const [detailedAudience, recentActivities] = await Promise.all([
                Api.getAudienceDetails(id, adminToken),
                Api.getRecent(adminToken)
            ]);

            // 2. Extract leads from the detailed audience response
            let baseLeads = location.state?.selectedLeadsData || 
                            detailedAudience?.leads || 
                            detailedAudience?.contacts || 
                            detailedAudience?.results || 
                            audience.leads || 
                            audience.contacts || [];
            
            console.log("BASE_LEADS_FETCHED:", baseLeads.length);

            // 3. Process Raw Activity metadata for City/Area fallbacks
            const allRawLeads = recentActivities?.flatMap(activity => {
                const qName = activity.search_details?.niche_or_keyword || activity.query_name || activity.search_details?.query || '';
                return (activity.results || []).map(lead => ({
                    ...lead,
                    job_status: activity.search_details?.status || 'New',
                    source_job: activity.job_id,
                    city: activity.search_details?.location || activity.search_details?.city || lead.city || lead.City || 'Any',
                    area: activity.search_details?.area || lead.area || lead.Area || 'Any',
                    queryValue: qName
                }));
            }) || [];

            // 4. Update Search Metadata
            const searchName = (audience.audiance_name || detailedAudience?.audiance_name || '').toLowerCase();
            const matchedActivity = recentActivities?.find(activity => {
                const activityQuery = (activity.search_details?.niche_or_keyword || activity.query_name || activity.search_details?.query || '').toLowerCase();
                return activityQuery.includes(searchName) || searchName.includes(activityQuery);
            });

            setSearchMetadata({
                query: matchedActivity?.search_details?.niche_or_keyword || matchedActivity?.query_name || matchedActivity?.search_details?.query || audience.audiance_name || 'N/A',
                city: matchedActivity?.search_details?.location || matchedActivity?.search_details?.city || audience.city || 'Any',
                area: matchedActivity?.search_details?.area || audience.area || 'Any'
            });

            // 5. Finalize leads list
            let finalLeads = baseLeads.length > 0 ? baseLeads : allRawLeads.filter(lead => {
                const leadQuery = (lead.queryValue || '').toLowerCase();
                return leadQuery.includes(searchName) || searchName.includes(leadQuery);
            });

            // 6. Normalize all leads for the UI
            finalLeads = finalLeads.map(lead => normalizeLead(lead));

            // 5. De-duplicate and set leads directly (no extra per-lead API calls needed)
            const seenIds = new Set();
            const uniqueLeads = finalLeads.filter(lead => {
                if (!lead) return false;
                const rawId = lead.result_id || lead.id || lead.business_id || lead.lead_id || lead.business_information_id || '';
                const rawName = lead.name || lead.BusinessName || lead.business_name || lead.Business_Name || lead.title || '';
                const rawAddr = lead.address || lead.Address || lead.full_address || lead.location || '';
                const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normAddr = rawAddr.toLowerCase().replace(/[^a-z0-9]/g, '');
                const nameAddrSlug = (normName && normAddr) ? `na-${normName}-${normAddr}` : null;
                const isSlug = String(rawId).startsWith('na-') || String(rawId).startsWith('ph-') || String(rawId).startsWith('em-') || String(rawId).startsWith('name-');
                const cleanId = !isSlug && rawId ? rawId : null;
                const matchKey = cleanId || nameAddrSlug || `key-${Math.random()}`;
                if (seenIds.has(matchKey)) return false;
                seenIds.add(matchKey);
                return true;
            });

            console.log(`SET_LEADS: total unique leads = ${uniqueLeads.length}`);
            setLeads(uniqueLeads);

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
                audienceName={audience?.audiance_name || 'N/A'} 
                isEnriched={isEnriched} 
                loading={loading} 
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
