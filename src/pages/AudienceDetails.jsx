import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, CheckCircle2, Zap, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Api from '../../scripts/Api';
import { findSocialLink } from '../utils/contactUtils';

import AudienceHeader from '../components/audienceDetails/AudienceHeader';
import AudienceStats from '../components/audienceDetails/AudienceStats';
import AudienceTable from '../components/audienceDetails/AudienceTable';

const AudienceDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useApp();
    const [viewingId, setViewingId] = useState(null);
    const [leads, setLeads] = useState([]);
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
            console.log("FETCH_AUDIENCE_DATA_START: audience", audience);

            // 0. Check for leads passed in navigation state (highest priority)
            let baseLeads = location.state?.selectedLeadsData || audience.leads || audience.contacts || [];
            console.log("INITIAL_LEADS_COUNT:", baseLeads.length);

            // 1. Fetch Raw Data (Recent Searches) for metadata matching
            const recentActivities = await Api.getRecent(adminToken);

            // 1b. Fetch Enrichment Data if audience is enriched (MANDATORY per user request)
            const isAudienceEnriched = (audience?.tag || '').toLowerCase().includes('enriched') || location.state?.activeTab === 'enriched';
            let enrichmentData = [];
            if (isAudienceEnriched) {
                console.log("FETCHING_ENRICHMENT_DATA...");
                try {
                    const enrichmentResponse = await Api.getEnrichment(adminToken);
                    // Handle different response formats
                    enrichmentData = Array.isArray(enrichmentResponse) ? enrichmentResponse : (enrichmentResponse?.results || enrichmentResponse?.data || []);
                    console.log("ENRICHMENT_DATA_FETCHED:", enrichmentData.length);
                } catch (err) {
                    console.error("Failed to fetch enrichment data:", err);
                }
            }

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

            // 2. Identify corresponding Search Activity for metadata
            const searchName = (audience.audiance_name || '').toLowerCase();
            const matchedActivity = recentActivities?.find(activity => {
                const activityQuery = (activity.search_details?.niche_or_keyword || activity.query_name || activity.search_details?.query || '').toLowerCase();
                return activityQuery.includes(searchName) || searchName.includes(activityQuery);
            });

            if (matchedActivity) {
                setSearchMetadata({
                    query: matchedActivity.search_details?.niche_or_keyword || matchedActivity.query_name || matchedActivity.search_details?.query || audience.audiance_name || 'N/A',
                    city: matchedActivity.search_details?.location || matchedActivity.search_details?.city || audience.city || 'Any',
                    area: matchedActivity.search_details?.area || audience.area || 'Any'
                });
            } else {
                setSearchMetadata({
                    query: audience.audiance_name || 'N/A',
                    city: audience.city || 'Any',
                    area: audience.area || 'Any'
                });
            }

            // 3. Finalize leads list
            let finalLeads = baseLeads;

            // If no leads passed in, try to filter raw leads by audience name/query (original fallback)
            if (finalLeads.length === 0) {
                if (isAudienceEnriched && enrichmentData.length > 0) {
                    finalLeads = [...enrichmentData];
                } else {
                    finalLeads = allRawLeads.filter(lead => {
                        const leadQuery = (lead.queryValue || '').toLowerCase();
                        return leadQuery.includes(searchName) || searchName.includes(leadQuery);
                    });
                }
            }

            // 4. Merge Enrichment Data if necessary
            if (isAudienceEnriched && enrichmentData.length > 0) {
                finalLeads = finalLeads.map(lead => {
                    const leadId = lead.id || lead.result_id;
                    const enrichedLead = enrichmentData.find(el => (el.id || el.result_id) === leadId);
                    return enrichedLead ? { ...lead, ...enrichedLead } : lead;
                });
            }

            // 5. De-duplicate and set
            const uniqueLeads = [];
            const seenIds = new Set();
            finalLeads.forEach(lead => {
                if (!lead) return;

                const id = lead.id || lead.result_id || null;

                // Identity 2: Normalized Name + Normalized Address
                const rawName = lead.name || lead.BusinessName || lead.business_name || lead.Business_Name || '';
                const rawAddr = lead.address || lead.Address || lead.full_address || '';
                const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normAddr = rawAddr.toLowerCase().replace(/[^a-z0-9]/g, '');
                const nameAddrKey = (normName && normAddr) ? `na-${normName}-${normAddr}` : null;

                // Identity 3: Normalized Phone
                const rawPhone = String(lead.mobile || lead.MobileNumber || lead.phone || '');
                const normPhone = rawPhone.replace(/\D/g, '');
                const phoneKey = (normPhone && normPhone.length >= 8) ? `ph-${normPhone}` : null;

                // Identity 4: Email
                const rawEmail = lead.email || lead.Email || '';
                const emailKey = rawEmail ? `em-${rawEmail.toLowerCase().trim()}` : null;

                // Identity 5: Aggressive Name Fallback (Deduplicates scraped identical businesses)
                const nameKey = (isAudienceEnriched && normName.length > 2) ? `name-${normName}` : null;

                const isDuplicate = (id && seenIds.has(id)) ||
                    (nameAddrKey && seenIds.has(nameAddrKey)) ||
                    (phoneKey && seenIds.has(phoneKey)) ||
                    (emailKey && seenIds.has(emailKey)) ||
                    (nameKey && seenIds.has(nameKey));

                if (!isDuplicate) {
                    if (id) seenIds.add(id);
                    if (nameAddrKey) seenIds.add(nameAddrKey);
                    if (phoneKey) seenIds.add(phoneKey);
                    if (emailKey) seenIds.add(emailKey);
                    if (nameKey) seenIds.add(nameKey);

                    lead.id = id || nameAddrKey || phoneKey || emailKey || nameKey || `lead-${Date.now()}-${Math.random()}`; // Ensure consistent ID
                    uniqueLeads.push(lead);
                }
            });

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

    const handleViewContact = (contact) => {
        const id = contact.id || contact.result_id;
        setViewingId(id);
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
            />
        </div>
    );
};

export default AudienceDetails;
