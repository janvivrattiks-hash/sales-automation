import { useState, useCallback, useContext } from 'react';
import Api from '../../scripts/Api';
import { AppContext } from '../context/AppContext';

export const useContacts = (navigate) => {
    const { adminToken } = useContext(AppContext);

    // Core Data State
    const [rawContacts, setRawContacts] = useState([]);
    const [enrichedContacts, setEnrichedContacts] = useState([]);
    const [audiences, setAudiences] = useState([]);

    // Loading State
    const [loading, setLoading] = useState(false);
    const [rawLoading, setRawLoading] = useState(false);
    const [audLoading, setAudLoading] = useState(false);
    const [isFiltering, setIsFiltering] = useState(false);
    const [isSavingAudience, setIsSavingAudience] = useState(false);

    // Interaction State
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [selectedLeadsInModal, setSelectedLeadsInModal] = useState([]);
    const [viewingId, setViewingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    // Filter & Audience Form State
    const [filters, setFilters] = useState({
        website: 'Any',
        ratings: 0,
        parameter: ''
    });
    const [audienceData, setAudienceData] = useState({
        audiance_name: '',
        discription: '',
        icp: '',
        tag: 'High Priority'
    });
    const [uiTags, setUiTags] = useState(['High Priority']);

    // Fetchers
    const fetchEnrichedData = useCallback(async () => {
        if (!adminToken) return;
        setRawLoading(true);
        try {
            const enrichmentData = await Api.getEnrichment(adminToken);
            const enrichedLeadsFromApi = Array.isArray(enrichmentData)
                ? enrichmentData
                : (enrichmentData?.data || enrichmentData?.results || []);

            const uniqueEnriched = [];
            const seenKeys = new Set();

            enrichedLeadsFromApi.forEach(lead => {
                if (!lead) return;
                const id = lead.result_id || lead.id || null;
                const rawName = lead.name || lead.BusinessName || lead.business_name || lead.Business_Name || '';
                const rawAddr = lead.address || lead.Address || lead.full_address || '';
                const normName = rawName.toLowerCase().replace(/[^a-z0-9]/g, '');
                const normAddr = rawAddr.toLowerCase().replace(/[^a-z0-9]/g, '');
                const nameAddrKey = (normName && normAddr) ? `na-${normName}-${normAddr}` : null;

                const isDuplicate = (id && seenKeys.has(id)) || (nameAddrKey && seenKeys.has(nameAddrKey));

                if (!isDuplicate) {
                    if (id) seenKeys.add(id);
                    if (nameAddrKey) seenKeys.add(nameAddrKey);
                    lead.id = id || nameAddrKey || `lead-${Date.now()}-${Math.random()}`;
                    uniqueEnriched.push(lead);
                }
            });
            // NEW: Fetch POI details for each lead in parallel
            const enrichedWithPoi = await Promise.all(
                uniqueEnriched.map(async (lead) => {
                    try {
                        const poiData = await Api.getPOIDetails(lead.result_id || lead.id, adminToken);
                        if (poiData) {
                            console.log(`POI Details for ${lead.name || lead.BusinessName}:`, poiData);
                        }
                        return { ...lead, poi_details: poiData };
                    } catch (e) {
                        return lead; // Fallback to original lead if POI fails
                    }
                })
            );

            setEnrichedContacts(enrichedWithPoi);
        } catch (error) {
            console.error("Error fetching enriched data:", error);
        } finally {
            setRawLoading(false);
        }
    }, [adminToken]);

    const fetchRawData = useCallback(async () => {
        if (!adminToken) return;
        setRawLoading(true);
        try {
            const recentActivities = await Api.getRecent(adminToken);
            const allRawLeads = recentActivities?.flatMap(activity => {
                return (activity.results || []).map(lead => ({
                    ...lead,
                    job_status: activity.search_details?.status || 'New',
                    source_job: activity.job_id
                }));
            }) || [];
            console.log("Raw Contacts Data (Recent Activity):", allRawLeads);

            const uniqueRaw = [];
            const seenIds = new Set();
            allRawLeads.forEach((lead, idx) => {
                if (!lead) return;
                const leadId = lead.id || lead.result_id || lead.MobileNumber || lead.phone || `${lead.name || 'raw'}-${lead.address || idx}`;
                if (!seenIds.has(leadId)) {
                    seenIds.add(leadId);
                    lead.id = leadId;
                    uniqueRaw.push(lead);
                }
            });
            setRawContacts(uniqueRaw);
        } catch (error) {
            console.error("Error fetching raw data:", error);
        } finally {
            setRawLoading(false);
        }
    }, [adminToken]);

    const fetchAudiences = useCallback(async () => {
        if (!adminToken) return;
        setAudLoading(true);
        try {
            const audienceList = await Api.getAudiences(adminToken);
            if (audienceList) setAudiences(audienceList);
        } catch (err) {
            console.error("Failed to fetch audiences:", err);
        } finally {
            setAudLoading(false);
        }
    }, [adminToken]);

    // Logic
    const toggleLeadSelection = (id) => {
        setSelectedLeads(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const toggleModalLeadSelection = (id) => {
        setSelectedLeadsInModal(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleFilter = async (isMainSearch, isEnriched, onSuccess) => {
        setIsFiltering(true);
        try {
            const response = await Api.filterLeads(filters, adminToken);
            const filteredData = Array.isArray(response) ? response : (response?.data || response?.results || []);

            if (isMainSearch) {
                if (isEnriched) setEnrichedContacts(filteredData);
                else setRawContacts(filteredData);
            }
            if (onSuccess) onSuccess(filteredData);
        } catch (error) {
            console.error("Filter error:", error);
            console.error("Failed to filter leads");
        } finally {
            setIsFiltering(false);
        }
    };

    const handleSaveAudience = async (isEnriched, activeContacts, filterLeadsData) => {
        if (!audienceData.audiance_name) {
            console.error("Audience name is required");
            return;
        }
        setIsSavingAudience(true);
        try {
            const currentSelected = Array.from(new Set([...selectedLeads, ...selectedLeadsInModal]));
            
            // Search across ALL contacts to find the selected ones
            const allAvailableContacts = [...enrichedContacts, ...rawContacts];
            const passedLeads = currentSelected.length > 0
                ? allAvailableContacts.filter(l => currentSelected.includes(l.id || l.result_id))
                : (filterLeadsData.length > 0 ? filterLeadsData : activeContacts);
            
            const ids = passedLeads.map(l => l.id || l.result_id).filter(Boolean);

            const typeTag = isEnriched ? 'Enriched' : 'Raw';
            const finalTags = [typeTag, ...uiTags.filter(t => t !== 'Enriched' && t !== 'Raw')];
            const payload = { 
                ...audienceData, 
                tag: finalTags.join(', '),
                business_ids: ids 
            };

            const response = await Api.saveAudience(payload, adminToken);
            console.log("Audience saved successfully with IDs:", ids.length);

            // Reset
            setAudienceData({ audiance_name: '', discription: '', icp: '', tag: 'High Priority' });
            setSelectedLeads([]);
            setSelectedLeadsInModal([]);

            if (navigate) {
                navigate('/audience-list', {
                    state: {
                        newAudience: response?.audience || response?.data || response,
                        selectedLeadsData: passedLeads,
                        audienceName: payload.audiance_name,
                        fromSave: true,
                        activeTab: isEnriched ? 'enriched' : 'raw'
                    },
                    replace: true
                });
            }
        } catch (error) {
            console.error("Save error:", error);
            console.error("Failed to save audience");
        } finally {
            setIsSavingAudience(false);
        }
    };

    const handleDeleteLead = async (id, isEnriched) => {
        setDeletingId(id);
        try {
            const success = await Api.deleteLead(id, adminToken);
            if (success) {
                toast.success("Contact deleted successfully");
                if (isEnriched) setEnrichedContacts(prev => prev.filter(l => (l.id || l.result_id) !== id));
                else setRawContacts(prev => prev.filter(l => (l.id || l.result_id) !== id));
            }
        } catch (error) {
            console.error("Failed to delete lead:", error);
        } finally {
            setDeletingId(null);
        }
    };
    
    const handleDeleteAudience = async (id) => {
        if (!id) return;
        setAudLoading(true);
        try {
            const success = await Api.deleteAudience(id, adminToken);
            if (success) {
                console.log("UI_SUCCESS: Audience deleted from local state (ID:", id, ")");
                setAudiences(prev => prev.filter(aud => aud.id !== id));
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to delete audience:", error);
            return false;
        } finally {
            setAudLoading(false);
        }
    };

    return {
        rawContacts, enrichedContacts, audiences,
        loading, setLoading,
        rawLoading, setRawLoading,
        audLoading, setAudLoading,
        isFiltering, isSavingAudience,
        selectedLeads, setSelectedLeads,
        selectedLeadsInModal, setSelectedLeadsInModal,
        viewingId, setViewingId,
        deletingId, setDeletingId,
        filters, setFilters,
        audienceData, setAudienceData,
        uiTags, setUiTags,
        fetchEnrichedData, fetchRawData, fetchAudiences,
        toggleLeadSelection, toggleModalLeadSelection,
        handleFilter, handleSaveAudience, handleDeleteLead, handleDeleteAudience
    };
};
