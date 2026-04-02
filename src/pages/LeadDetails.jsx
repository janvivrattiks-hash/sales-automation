import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Search, Loader2, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Api from '../../scripts/Api';
import { useApp } from '../context/AppContext';

// Modular Components
import SingleLeadDetail from '../components/leadDetails/SingleLeadDetail';
import LeadDetailsHeader from '../components/leadDetails/LeadDetailsHeader';
import LeadDetailsStats from '../components/leadDetails/LeadDetailsStats';
import LeadDetailsTable from '../components/leadDetails/LeadDetailsTable';

// Reuse the DeleteLeadModal already built for Dashboard
import DeleteLeadModal from '../components/dashboard/DeleteLeadModal';
import DeleteSearchModal from '../components/leadGenerator/DeleteSearchModal';

const LeadDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminToken } = useApp();

    const [leadData, setLeadData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [processingLeadId, setProcessingLeadId] = useState(null); // Track which lead is processing
    const [showProcessingPopup, setShowProcessingPopup] = useState(false); // Only show popup when clicked during processing
    const loadingLeadIdRef = useRef(null); // Synchronous ref to prevent concurrent calls
    const [deleteModal, setDeleteModal] = useState({ open: false, lead: null });
    const [deleteSearchModalOpen, setDeleteSearchModalOpen] = useState(false);

    // Normalize leads by adding unique IDs and extracting any available identifiers
    useEffect(() => {
        console.log("📍 [LeadDetails] Received location state:", location.state);
        
        if (location.state?.results) {
            // Use leads as-is from backend - NO normalization, NO fake IDs
            const results = Array.isArray(location.state.results) ? location.state.results : [];

            console.log("✅ [LeadDetails] Using leads directly from backend (no normalization):", results);

            setLeadData({
                leads: results,
                ...(location.state.queryInfo || {})
            });
        }
    }, [location.state]);

    // ── Handlers ──────────────────────────────────────────────────────────────

    // Helper function to check if owner_name is real (not N/A, not empty)
    const hasRealOwnerName = (lead) => {
        if (!lead) return false;

        let ownerName = lead?.owner_name || lead?.owner || lead?.owner_info || null;

        // Handle if it's somehow an array (take first)
        if (Array.isArray(ownerName)) {
            ownerName = ownerName[0];
        }

        const result = !!(
            ownerName &&
            typeof ownerName === 'string' &&
            ownerName !== 'N/A' &&
            ownerName !== 'undefined' &&
            ownerName !== 'null' &&
            ownerName.trim() !== ''
        );

        console.log("🔍 [hasRealOwnerName] Checking:", {
            "lead?.owner_name": lead?.owner_name,
            "finalOwnerName": ownerName,
            "type": typeof ownerName,
            "result": result
        });

        return result;
    };

    // Helper function to extract backend UUID from lead object
    const extractBackendId = (lead) => {
        if (!lead) return null;

        // Search for ANY UUID field in the object
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        // Check all object values for UUID pattern
        for (const [key, value] of Object.entries(lead)) {
            if (typeof value === 'string' && uuidPattern.test(value)) {
                console.log(`✅ [extractBackendId] Found backend UUID in field '${key}': ${value}`);
                return value;
            }
        }

        console.log("❌ [extractBackendId] No backend UUID found in lead object");
        return null;
    };

    const handleViewLead = useCallback(async (lead) => {
        console.log("🔵 [handleViewLead] Called with lead:", lead?.name || 'Unknown');

        if (!lead) {
            console.error("❌ [handleViewLead] Lead object is null/undefined");
            return;
        }

        // **STEP 1: Attempt to find backend UUID in lead object**
        const backendUuid = extractBackendId(lead);
        console.log("🔍 [handleViewLead] Backend UUID extracted:", backendUuid);

        // **CASE 1: Owner Name IS AVAILABLE in current lead object - Data is PROCESSED**
        if (hasRealOwnerName(lead)) {
            console.log("✅ [LeadDetails] CASE 1: Owner name found in current lead. Showing detail view.");
            // Push a new history entry so browser back returns to the list
            navigate('/lead-details', {
                state: { ...location.state, selectedLead: lead },
            });
            return;
        }

        console.log("⏳ [LeadDetails] Owner name is 'N/A' or empty - Checking for backend UUID");

        // **CASE 2: No backend UUID found - Data not ready for API call**
        if (!backendUuid) {
            console.log("⚠️  [LeadDetails] CASE 2: No backend UUID found - Cannot fetch from API");
            setShowProcessingPopup(true);
            setTimeout(() => setShowProcessingPopup(false), 3000);
            return;
        }

        // **CASE 3: Backend UUID IS FOUND - FETCH FRESH DATA FROM DATABASE**
        console.log("🔄 [LeadDetails] CASE 3: Backend UUID found - Fetching fresh data from database");

        try {
            setProcessingLeadId(backendUuid);
            console.log("📡 [LeadDetails] Making API call to get fresh lead data (cache bypass enabled)...");

            // Call getLeadById with the backend UUID and cache bypass
            let apiResponse = await Api.getLeadById(backendUuid, adminToken, true);

            // Unwrap API response
            let freshLeadData = apiResponse;
            if (apiResponse?.message && apiResponse?.count !== undefined && apiResponse?.data) {
                freshLeadData = apiResponse.data;
                console.log("✅ [LeadDetails] Unwrapped API response");
            }

            if (!freshLeadData) {
                console.log("⚠️  [LeadDetails] No lead data received");
                setShowProcessingPopup(true);
                setTimeout(() => setShowProcessingPopup(false), 3000);
                return;
            }

            // **CHECK EXTRACTED DATA FOR OWNER_NAME**
            if (hasRealOwnerName(freshLeadData)) {
                console.log("✅ [LeadDetails] Fresh API data has owner_name. Showing detail view.");
                // Push a new history entry so browser back returns to the list
                navigate('/lead-details', {
                    state: { ...location.state, selectedLead: freshLeadData },
                });
            } else {
                console.log("⏳ [LeadDetails] Fresh API data still has no owner_name - Show popup");
                setShowProcessingPopup(true);
                setTimeout(() => setShowProcessingPopup(false), 3000);
            }
        } catch (error) {
            console.error("❌ [handleViewLead] Error fetching fresh lead data:", error);
            setShowProcessingPopup(true);
            setTimeout(() => setShowProcessingPopup(false), 3000);
        } finally {
            setProcessingLeadId(null);
        }
    }, [adminToken]);

    const handleDeleteConfirm = useCallback(async () => {
        const lead = deleteModal.lead;
        const backendUuid = extractBackendId(lead);

        if (!backendUuid) {
            console.error("❌ [handleDeleteConfirm] No backend UUID found");
            setDeleteModal({ open: false, lead: null });
            return;
        }

        try {
            const response = await Api.deleteLead(backendUuid, adminToken);
            if (response) {
                setLeadData(prev => ({
                    ...prev,
                    leads: prev.leads.filter(l => extractBackendId(l) !== backendUuid)
                }));
                // Show success toast
                console.log("Lead deleted successfully from backend");
                setDeleteModal({ open: false, lead: null });
            }
        } catch (error) {
            console.error('Error deleting lead:', error);
        }
    }, [deleteModal.lead, adminToken]);

    const handleDeleteSearch = useCallback(async () => {
        // Try all possible locations for job_id
        const jobId = location.state?.queryInfo?.job_id || 
                      location.state?.job_id || 
                      leadData?.job_id;
        
        console.log("🔍 [handleDeleteSearch] attempting to delete with jobId:", jobId);
        
        if (!jobId) {
            console.error("❌ [handleDeleteSearch] No job_id found");
            alert("No Job ID found for this search. Please try re-opening the search from Search History.");
            return;
        }

        try {
            setLoading(true);
            const response = await Api.deleteJob(jobId, adminToken);
            if (response) {
                console.log("✅ Search job deleted successfully");
                setDeleteSearchModalOpen(false);
                navigate('/search-history');
            }
        } catch (error) {
            console.error("❌ Error deleting search job:", error);
        } finally {
            setLoading(false);
        }
    }, [location.state?.queryInfo?.job_id, location.state?.job_id, leadData, adminToken, navigate]);

    // ── Single Lead View ─────────────────────────────────────────────────────
    // Check location state for a selected lead (pushed by handleViewLead navigate)
    const activeLead = location.state?.selectedLead || location.state?.singleLead;

    if (activeLead) {
        return (
            <SingleLeadDetail
                lead={activeLead}
                onBack={() => {
                    // Go back one step in browser history -> returns to the list view
                    navigate(-1);
                }}
            />
        );
    }

    // ── Loading state ─────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 py-20">
                <Loader2 size={48} className="animate-spin mb-4 text-primary" />
                <p className="font-medium">Loading search results...</p>
            </div>
        );
    }

    // ── Empty state ───────────────────────────────────────────────────────────
    if (!leadData && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500 space-y-6 py-20">
                <div className="bg-gray-50 p-6 rounded-full">
                    <Search size={48} className="text-gray-300" />
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">No Search Data Found</p>
                    <p className="text-sm text-gray-500 mt-1">Please generate leads from the generator page first.</p>
                </div>
                <Button onClick={() => navigate('/lead-generator')} className="px-8">
                    Go to Generator
                </Button>
            </div>
        );
    }

    // ── Derived data ──────────────────────────────────────────────────────────
    const queryValue = leadData?.niche || 'N/A';
    const cityValue = leadData?.city || 'N/A';
    const areaValue = leadData?.area || 'N/A';
    const leads = leadData?.leads || [];

    const stats = [
        { label: 'SEARCH QUERY', value: queryValue },
        { label: 'CITY', value: cityValue },
        { label: 'AREA', value: areaValue },
        { label: 'TOTAL LEADS', value: leads.length.toString(), icon: Users },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8 pb-32">
            <LeadDetailsHeader
                navigate={navigate}
                leads={leads}
                queryValue={queryValue}
                cityValue={cityValue}
                areaValue={areaValue}
                onDeleteSearch={() => setDeleteSearchModalOpen(true)}
            />

            <LeadDetailsStats stats={stats} />

            <LeadDetailsTable
                leads={leads}
                processingLeadId={processingLeadId}
                onViewLead={handleViewLead}
                onDeleteLead={(lead) => setDeleteModal({ open: true, lead })}
            />

            {deleteModal.open && (
                <DeleteLeadModal
                    lead={deleteModal.lead}
                    onCancel={() => setDeleteModal({ open: false, lead: null })}
                    onConfirm={handleDeleteConfirm}
                />
            )}

            {deleteSearchModalOpen && (
                <DeleteSearchModal
                    job={{ query_name: leadData?.niche || 'this entire search' }}
                    onCancel={() => setDeleteSearchModalOpen(false)}
                    onConfirm={handleDeleteSearch}
                />
            )}

            {/* Simple Processing Popup */}
            {showProcessingPopup && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowProcessingPopup(false)} />
                    <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm animate-in fade-in zoom-in-95 duration-200">
                        <h3 className="text-lg font-bold text-gray-900">Data Processing</h3>
                        <p className="text-sm text-gray-500 mt-2">This lead is currently being processed. Please try again in a moment.</p>
                        <button
                            onClick={() => setShowProcessingPopup(false)}
                            className="mt-4 w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeadDetails;
