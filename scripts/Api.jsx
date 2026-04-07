import axios from 'axios';
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_ENV === "DEV"
    ? import.meta.env.VITE_BASE_URL_PRODUCTION
    : import.meta.env.VITE_BASE_URL_DEVELOPMENT;

// Request deduplication - prevents duplicate API calls
const requestCache = {}; // Successful response cache
const inFlightRequests = {}; // Tracks promises for in-flight requests
const abortControllers = {}; // Abort controllers for cancellable requests
const requestTimestamps = {}; // Track request timestamps to ignore stale responses
const requestCounter = {}; // Count requests per key for debugging
const CACHE_DURATION = 5000; // 5 seconds
const activeRequests = new Set(); // Track CURRENTLY EXECUTING requests

const isCacheValid = (cacheKey) => {
    if (!requestCache[cacheKey]) return false;
    const now = Date.now();
    if (now - requestCache[cacheKey].timestamp > CACHE_DURATION) {
        delete requestCache[cacheKey];
        return false;
    }
    return true;
};

// Cancel previous request for same key and create new abort controller
const createNewAbortController = (cacheKey) => {
    // Cancel previous request if exists
    if (abortControllers[cacheKey]) {
        abortControllers[cacheKey].abort();
        console.log("🛑 [API] Cancelled previous request for:", cacheKey);
    }
    // Create fresh abort controller
    const controller = new AbortController();
    abortControllers[cacheKey] = controller;
    return controller;
};

// Main deduplication logic: prevents duplicate concurrent requests
const executeWithDedup = async (cacheKey, executor) => {
    // INCREMENT COUNTER FOR DEBUGGING
    requestCounter[cacheKey] = (requestCounter[cacheKey] || 0) + 1;
    const requestNum = requestCounter[cacheKey];
    console.log(`🔢 Request #${requestNum}:`, cacheKey);

    // CHECK 1: Is this request CURRENTLY EXECUTING? If yes, BLOCK the duplicate
    if (activeRequests.has(cacheKey)) {
        console.log(`🚫 Request #${requestNum} BLOCKED - already executing:`, cacheKey);
        return await inFlightRequests[cacheKey];
    }

    // CHECK 2: Is result cached?
    if (isCacheValid(cacheKey)) {
        console.log(`⚡ Request #${requestNum} - cache HIT:`, cacheKey);
        return requestCache[cacheKey].data;
    }

    // MARK AS ACTIVE IMMEDIATELY - THIS PREVENTS DUPLICATES
    activeRequests.add(cacheKey);
    console.log(`📡 Request #${requestNum} - MARKED ACTIVE:`, cacheKey);

    // Create abort controller
    const controller = new AbortController();
    if (abortControllers[cacheKey]) {
        abortControllers[cacheKey].abort(); // Cancel any previous
    }
    abortControllers[cacheKey] = controller;

    // Make fresh request 
    const now = Date.now();
    requestTimestamps[cacheKey] = now;
    const requestId = now;

    const promise = executor(controller.signal).then(data => {
        // Only cache if this is the latest request
        if (requestTimestamps[cacheKey] === requestId) {
            requestCache[cacheKey] = { data, timestamp: Date.now() };
            activeRequests.delete(cacheKey);
            delete inFlightRequests[cacheKey];
            console.log(`✅ Request #${requestNum} - cached:`, cacheKey);
            return data;
        }
        activeRequests.delete(cacheKey);
        console.log(`⏭️ Request #${requestNum} - stale, ignored:`, cacheKey);
        return null;
    }).catch(error => {
        activeRequests.delete(cacheKey);
        delete inFlightRequests[cacheKey];
        if (error.name !== 'AbortError') {
            console.log(`❌ Request #${requestNum} - error:`, cacheKey, error?.message);
        }
        throw error;
    });

    inFlightRequests[cacheKey] = promise;
    return await promise;
};

export default {

    Login: async (email, password) => { // login api
        try { // try to login
            console.log("logging in user", API_BASE_URL); // log the base url
            const res = await axios.post(`${API_BASE_URL}/auth/login`, { // post the login request
                username: email,
                password: password,
            },
                { // headers
                    headers: { // headers
                        accept: "application/json", // accept
                        "Access-Control-Allow-Origin": "*", // access control allow origin
                        "Content-Type": "application/x-www-form-urlencoded", // content type
                    },
                }
            );

            toast.success("Welcome"); // show success message
            console.log("Login Response", res); // log the response

            if (res.status === 200) { // if response is 200
                return res.data; // return the response data
            }
        } catch (error) {
            console.log(error); // log the error
            toast.error("Login Failed"); // show error message
            return null; // return null
        }
    },

    getCurrentUser: async (token) => { // get current user api
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/admin/me`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Current User Response", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Error Details:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch current user");
            }
            return null;
        }
    },

    getCategoryLeads: async (keyword, token) => { // get leads by category keyword
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/search/category/${encodeURIComponent(keyword)}`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Category Leads Response", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Error Details:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch category leads");
            }
            return null;
        }
    },

    getCategories: async (token) => { // get categories api
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/search/categories`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Categories Response", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Error Details:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch categories");
            }
            return null;
        }
    },

    // Dashboard API
    getRecent: async (token) => { // get recent searches api
        try { // try to get recent searches
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/search/recent_activity`, { // get the recent searches
                headers: { // headers
                    accept: "application/json", // accept
                    "Authorization": `Bearer ${token}`, // bearer token
                },
            });
            if (res.status === 200) { // if response is 200
                console.log("Recent Searches Response", res.data.data); // log the response data
                return res.data.data; // return the response data
            }
        } catch (error) { // catch the error
            console.log("Error Details:", error.response || error); // log detailed error
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch recent searches"); // show error message
            }
            return null; // return null

        }
    },

    getNonEnriched: async (token) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/search/non-enriched`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Non-Enriched Leads Response:", res.data);
                return res.data;
            }
            return null;
        } catch (error) {
            console.error("Non-Enriched Leads Error:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch raw leads.");
            }
            return null;
        }
    },

    getEnrichment: async (token) => { // GET /enrichment/get — fetch all enriched leads
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/enrichment/get`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Enrichment List Response", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Enrichment List Error:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch enriched leads list.");
            }
            return null;
        }
    },

    getEnrichmentJson: async (id, token) => { // GET /enrichment/json/${id}
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

            const url = `${API_BASE_URL}/enrichment/analyze-raw/${id}`;

            const res = await axios.get(url, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Enrichment JSON Response", res.data);
                // Return full response body as requested, downstream flattener will handle it
                return res.data;
            }
        } catch (error) {
            console.log("Enrichment JSON Error:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch enriched data.");
            }
            return null;
        }
    },

    getContactInfo: async (id, token) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/enrichment/analyze-raw/${id}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            console.error("getContactInfo Error:", error);
            return null;
        }
    },

    getSingleLead: async (id, token) => { // get single lead api
        try { // try to get single lead
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/enrichment/analyze-raw/${id}`, { // get the single lead
                headers: { // headers
                    accept: "application/json", // accept
                    "Authorization": `Bearer ${token}`, // bearer token
                },
            });
            if (res.status === 200) { // if response is 200
                console.log("Single Lead Response", res.data); // log the response data
                return res.data; // return the response data
            }
        } catch (error) { // catch the error
            console.log("Error Details:", error.response || error); // log detailed error
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch single lead"); // show error message
            }
            return null; // return null
        }
    },

    getLeadById: async (id, token, bypassCache = false) => { // get lead by id from search endpoint, with optional cache bypass
        try { // try to get lead by id
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            
            const cacheKey = `getLeadById_${id}`;
            
            // **BYPASS CACHE if requested (for fresh data after processing)**
            if (bypassCache) {
                console.log(`🔄 [API] FULL CACHE BYPASS for fresh data: ${cacheKey}`);
                console.log(`   🗑️  Clearing: requestCache, inFlightRequests, activeRequests, requestTimestamps, abortControllers`);
                
                // Delete from cache
                delete requestCache[cacheKey];
                
                // Delete from in-flight requests
                delete inFlightRequests[cacheKey];
                
                // Remove from activeRequests SET (CRITICAL!)
                activeRequests.delete(cacheKey);
                
                // Delete request timestamp (forces new request)
                delete requestTimestamps[cacheKey];
                
                // Abort and delete abort controller
                if (abortControllers[cacheKey]) {
                    abortControllers[cacheKey].abort();
                    delete abortControllers[cacheKey];
                }
                
                console.log(`   ✅ Cache fully cleared for: ${cacheKey}`);
            }
            
            return await executeWithDedup(cacheKey, async (signal) => {
                // Add cache-busting timestamp if bypassing cache
                let url = `${API_BASE_URL}/search/get_by_id/${id}`;
                if (bypassCache) {
                    url += `?nocache=${Date.now()}`;
                    console.log(`📡 [API] Making fresh request with cache-bust: ${url}`);
                }
                
                const res = await axios.get(url, {
                    signal, // Pass abort signal for cancellation
                    headers: {
                        accept: "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                
                if (res.status === 200) {
                    console.log("✅ [API] getLeadById completed for ID:", id);
                    return res.data;
                }
            });
        } catch (error) { // catch the error
            // Ignore abort errors as they're expected when new request cancels old one
            if (error.name === 'AbortError') {
                console.log("🚫 [API] getLeadById cancelled for ID:", id);
                return null;
            }
            console.error("❌ [API] getLeadById error:", error.message);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else if (!error.message?.includes("cancelled")) {
                toast.error("Failed to fetch lead");
            }
            return null;
        }
    },

    deleteJob: async (id, token) => { // delete job api
        try { // try to delete job
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.delete(`${API_BASE_URL}/search/delete_job/${id}`, { // delete the job
                headers: { // headers
                    accept: "application/json", // accept
                    "Authorization": `Bearer ${token}`, // bearer token
                },
            });
            if (res.status === 200) { // if response is 200
                console.log("Job Deleted Successfully", res.data); // log the response data
                return res.data; // return the response data
            }
        } catch (error) { // catch the error
            console.log("Error Details:", error.response || error); // log detailed error
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to delete job"); // show error message
            }
            return null; // return null
        }
    },

    deleteLead: async (id, token) => { // delete lead api
        try { // try to delete lead
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.delete(`${API_BASE_URL}/search/delete/${id}`, { // delete the lead
                headers: { // headers
                    accept: "application/json", // accept
                    "Authorization": `Bearer ${token}`, // bearer token
                },
            });
            if (res.status === 200) { // if response is 200
                console.log("Lead Deleted Successfully", res.data); // log the response data
                return true; // return true to indicate success
            }
        } catch (error) { // catch the error
            console.log("Error Details:", error.response || error); // log detailed error
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to delete lead"); // show error message
            }
            return null; // return null
        }
    },

    deleteEnrichedLead: async (id, token) => { // delete enriched lead api
        try { // try to delete enriched lead
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.delete(`${API_BASE_URL}/enrichment/delete/${id}`, { // delete the enriched lead
                headers: { // headers
                    accept: "application/json", // accept
                    "Authorization": `Bearer ${token}`, // bearer token
                },
            });
            if (res.status === 200 || res.status === 204) { // if response is 200 or 204
                console.log("Enriched Lead Deleted Successfully", res.data); // log the response data
                return true; // return true to indicate success
            }
        } catch (error) { // catch the error
            console.log("Error Details:", error.response || error); // log detailed error
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to delete enriched lead"); // show error message
            }
            return null; // return null
        }
    },

    // get Lead Generation API
    addLead: async (data, token) => { // add lead api
        try { // try to add lead
            console.log("Lead Generation Data", data); // log the data
            console.log("Token:", token ? "Token exists" : "Token is missing"); // log token status

            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

            const res = await axios.post(`${API_BASE_URL}/search/start`, data, { // post the lead generation request
                headers: { // headers
                    "Content-Type": "application/json", // content type
                    accept: "application/json", // accept
                    "Authorization": `Bearer ${token}`, // bearer token
                },
            });
            if (res.status === 200) { // if response is 200
                console.log("Lead Generation Response", res.data); // log the response data
                return res.data; // return the whole response object (including job_id and results)
            }
            else {
                toast.error("Failed to fetch lead generation"); // show error message
                return null; // return null
            }
        } catch (error) { // catch the error
            console.log("Error Details:", error.response || error); // log detailed error
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch lead generation"); // show error message
            }
            return null; // return null
        }
    },

    filterLeads: async (filters, token) => {
        try {
            console.log("Filter Params:", filters);

            // Pass standard params ensuring they align fully with the backend's expected schema 
            // example: /search/filter?website=Any&ratings=4&category=restaurant
            const res = await axios.get(`${API_BASE_URL}/search/filter`, {
                params: {
                    website: filters.website || 'Any',
                    ratings: filters.ratting !== undefined ? filters.ratting : (filters.ratings || 0),
                    category: filters.category || ''
                },
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            console.log("API RESPONSE:", res.data);
            return res.data;

        } catch (error) {
            console.error("Filter API Error:", error);
            return [];
        }
    },

    saveAudience: async (data, token) => {
        try {
            console.log("Save Audience Data:", data);

            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

            const res = await axios.post(`${API_BASE_URL}/audiance/`, data, {
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 200 || res.status === 201) {
                console.log("Save Audience Response:", res.data);
                return res.data;
            } else {
                toast.error("Failed to save audience");
                return null;
            }
        } catch (error) {
            console.log("Save Audience Error:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Please login again.");
            } else {
                toast.error("Failed to save audience");
            }
            return null;
        }
    },

    getAudiences: async (token) => { // get audiences api
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/audiance`, {
                params: {
                    skip: 0,
                    limit: 100
                },
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Get Audiences Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Error Details:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            } else {
                toast.error("Failed to fetch audiences");
            }
            return null;
        }
    },

    deleteAudience: async (id, token) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.delete(`${API_BASE_URL}/audiance/${id}`, {
                headers: {
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200 || res.status === 204) {
                console.log("API_SUCCESS: Audience deleted successfully from server (ID:", id, ")");
                return true;
            }
            return false;
        } catch (error) {
            console.log("Delete Audience Error:", error.response || error);
            toast.error("Failed to delete audience");
            return false;
        }
    },

    deleteContact: async (id, token) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.delete(`${API_BASE_URL}/audiance/${id}`, {
                headers: {
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200 || res.status === 204) {
                console.log("API_SUCCESS: Contact deleted successfully from server (ID:", id, ")");
                return true;
            }
            return false;
        } catch (error) {
            console.log("Delete Contact Error:", error.response || error);
            toast.error("Failed to delete contact");
            return false;
        }
    },

    removeBusinessFromAudience: async (audienceId, businessId, token) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.delete(`${API_BASE_URL}/audiance/${audienceId}/business/${businessId}`, {
                headers: {
                    accept: "*/*",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200 || res.status === 204) {
                console.log(`API_SUCCESS: Business ${businessId} removed from audience ${audienceId}`);
                toast.success('Business removed from audience successfully.');
                return true;
            }
            return false;
        } catch (error) {
            console.error("Remove Business from Audience Error:", error.response || error);
            const message = error.response?.data?.detail || "Failed to remove business from audience.";
            toast.error(message);
            return false;
        }
    },

    getAudienceDetails: async (id, token) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/audiance/${id}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 200) {
                console.log("Get Audience Details Response:", res.data);
                return res.data;
            }
            return null;
        } catch (error) {
            console.log("Get Audience Details Error:", error.response || error);
            return null;
        }
    },


    enrichLeads: async (leads, token) => {
        try {
            if (!token) {
                console.error("No token provided");
                return null;
            }

            const leadsToEnrich = Array.isArray(leads) ? leads : [leads];
            console.log(`Starting enrichment for ${leadsToEnrich.length} leads...`);

            // Based on the curl example, the API takes a single object: { "business_name": "...", "address": "..." }
            // If we send an array, it returns a 422. We will call it for each lead concurrently.
            const enrichmentPromises = leadsToEnrich.map(async (lead) => {
                const payload = {
                    business_name: String(lead.name || lead.business_name || lead.BusinessName || lead.Business_Name || ""),
                    address: String(lead.address || lead.Address || lead.location || lead.full_address || lead.Full_Address || "")
                };

                try {
                    const response = await axios.post(
                        `${API_BASE_URL}/enrichment`,
                        payload,
                        {
                            headers: {
                                "accept": "application/json",
                                "Authorization": `Bearer ${token}`,
                                "Content-Type": "application/json"
                            }
                        }
                    );
                    // Return the enriched data combined with existing lead info
                    console.log(`Enrichment successful for: ${payload.business_name}`, response.data);
                    // Explicitly preserve the business ID as poi_id so it doesn't get lost
                    return { ...lead, ...response.data, poi_id: lead.poi_id || lead.id || lead.result_id, status: 'Enriched' };
                } catch (error) {
                    console.error(`Enrichment failed for lead: ${payload.business_name}`, error.response?.data || error.message);
                    // Return original lead so we don't lose it from the list
                    return { ...lead, status: 'Failed' };
                }
            });

            const results = await Promise.all(enrichmentPromises);
            console.log("Bulk Enrichment Completed:", results);
            return results;

        } catch (error) {
            console.error("Critical Enrich API Error:", error);
            toast.error("Failed to process leads enrichment");
            return null;
        }
    },

    addNote: async (data, token) => { // add note api
        try {
            console.log("Adding Note Data:", data);
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

            const res = await axios.post(`${API_BASE_URL}/contact_managment/notes/`, data, {
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 200 || res.status === 201) {
                console.log("Add Note Response:", res.data);
                return res.data;
            } else {
                toast.error("Failed to add note");
                return null;
            }
        } catch (error) {
            console.log("Add Note Error:", error.response || error);
            toast.error("Failed to add note");
            return null;
        }
    },

    getNotes: async (token, skip = 0, limit = 100) => { // get notes api (literal curl implementation)
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

            // Sync with literal curl: GET http://192.168.1.35:8000/contact_managment/notes/?skip=0&limit=100
            const res = await axios.get(`${API_BASE_URL}/contact_managment/notes/`, {
                params: {
                    skip: skip,
                    limit: limit
                },
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 200) {
                console.log("Get Notes Response:", res.data);
                return res.data;
            } else {
                toast.error("Failed to fetch notes");
                return null;
            }
        } catch (error) {
            console.log("Get Notes Error:", error.response || error);
            toast.error("Failed to fetch notes");
            return null;
        }
    },

    getNotesByBusinessId: async (businessId, token) => {
        try {
            if (!token || !businessId) return null;
            const res = await axios.get(`${API_BASE_URL}/contact_managment/notes/business/${businessId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
            return null;
        } catch (error) {
            console.error("Get Notes by Business ID Error:", error.response?.data || error.message);
            return null;
        }
    },

    deleteNote: async (id, token) => { // delete note api
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.delete(`${API_BASE_URL}/contact_managment/notes/${id}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200 || res.status === 204) {
                // toast.success("Note deleted successfully");
                return true;
            }
            return false;
        } catch (error) {
            console.log("Delete Note Error:", error.response || error);
            toast.error("Failed to delete note");
            return false;
        }
    },

    updateNote: async (id, data, token) => { // update note api
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.put(`${API_BASE_URL}/contact_managment/notes/${id}`, data, {
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                toast.success("Note updated successfully");
                return res.data;
            }
            return null;
        } catch (error) {
            console.log("Update Note Error:", error.response || error);
            toast.error("Failed to update note");
            return null;
        }
    },

    addTask: async (data, token) => {
        try {
            if (!token) return null;

            const params = new URLSearchParams();
            params.append('task_name', data.task_name || '');
            params.append('description', data.description || '');
            params.append('due_date', data.due_date || '');
            params.append('status', data.status || '');
            if (data.business_id) params.append('business_id', data.business_id);


            const res = await axios.post(
                `${API_BASE_URL}/contact_managment/tasks/`,
                params,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return res.data;
        } catch (error) {
            console.log("Add Task Error Status:", error.response?.status);
            console.log("Add Task Error Detail:", JSON.stringify(error.response?.data?.detail, null, 2));
            return null;
        }
    },

    triggerTestReminders: async (token) => { // GET /contact_managment/tasks/test-reminders/trigger
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/contact_managment/tasks/test-reminders/trigger`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Trigger Reminders Response", res.data);
                toast.success("Reminders triggered successfully!");
                return res.data;
            }
        } catch (error) {
            console.log("Trigger Reminders Error:", error.response || error);
            toast.error("Failed to trigger reminders.");
            return null;
        }
    },

    triggerDueTomorrow: async (token, templateType = '10AM') => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(
                `${API_BASE_URL}/contact_managment/tasks/test-reminders/force-tomorrow`,
                {
                    params: { template_type: templateType },
                    headers: {
                        "accept": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            console.log("Due Tomorrow Notification Response:", res.data);
            return res.data;
        } catch (error) {
            console.error("Due Tomorrow Notification Error:", error.response?.data || error.message);
            toast.error("Failed to send due-tomorrow notifications.");
            return null;
        }
    },


    getTasks: async (token, skip = 0, limit = 100) => {
        try {
            if (!token) {
                console.error("Token missing");
                return null;
            }

            const url = `${API_BASE_URL}/contact_managment/tasks/?skip=${skip}&limit=${limit}`;

            const res = await axios.get(url, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Get Tasks API Response:", res?.data);

            return res?.data || null;

        } catch (error) {
            console.error(
                "Get Tasks Error:",
                error?.response?.data || error.message
            );
            return null;
        }
    },

    getTasksByBusinessId: async (businessId, token) => {
        try {
            if (!token || !businessId) return [];
            const url = `${API_BASE_URL}/contact_managment/tasks/business/${businessId}`;
            const res = await axios.get(url, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Get Tasks By Business API Response:", res?.data);
            return res?.data || [];
        } catch (error) {
            console.error("Get Tasks By Business Error:", error?.response?.data || error.message);
            return [];
        }
    },

    getSummary: async (id, token) => { // get summary api - VERSION 3.0
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/contact_managment/summary/${String(id).trim()}`, {
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500 // Allow 404 to pass without throwing
            });

            if (res.status === 404) return null;
            return res.data;
        } catch (error) {
            console.warn("Summary API info (Expected):", error.message);
            return null;
        }
    },

    getPOIDetails: async (id, token) => { // get POI details api
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/enrichment/poi-details/${String(id).trim()}`, {
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500 // Allow 404 to pass without throwing
            });
            if (res.status === 404) return null;
            return res.data;
        } catch (error) {
            console.warn("POI Details API info (Expected):", error.message);
            return null;
        }
    },

    generateMessagesStrategy: async (businessId, token) => { // generate outreach messages api
        try {
            if (!token) return null;
            const res = await axios.post(`${API_BASE_URL}/outreach-messages/generate`,
                { business_id: businessId },
                {
                    headers: {
                        "accept": "application/json",
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );
            return res.data;
        } catch (error) {
            console.error("GENERATE_MESSAGES_API_ERROR:", error.message);
            return null;
        }
    },

    getContactInfo: async (contactId, token) => {
        try {
            if (!token || !contactId) return null;
            const res = await axios.get(`${API_BASE_URL}/contact_managment/contact_info/${contactId}`, {
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            return res.data;
        } catch (error) {
            console.warn("Contact info fetch warning:", error.message);
            return null;
        }
    },

    processContactInfo: async (id, token) => {
        try {
            if (!token || !id) return null;
            // Passed in both URL as path (fallback) and payload/query to handle various backend patterns.
            // As user provided just /process in curl, we pass id in query/body natively.
            const payload = { poi_id: id, business_id: id, id: id };
            const res = await axios.post(`${API_BASE_URL}/contact_managment/contact_info/process`, payload, {
                params: { poi_id: id, business_id: id },
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            return res.data;
        } catch (error) {
            console.error("processContactInfo Error:", error.message);
            // Fallback try with ID in path just in case
            try {
                 const res = await axios.post(`${API_BASE_URL}/contact_managment/contact_info/process/${id}`, { poi_id: id, business_id: id }, {
                    headers: { "accept": "application/json", "Authorization": `Bearer ${token}` }
                 });
                 return res.data;
            } catch (err2) {
                 return null;
            }
        }
    },

    processSummary: async (id, token) => {
        try {
            if (!token || !id) return null;
            const payload = { poi_id: id, business_id: id, id: id };
            const res = await axios.post(`${API_BASE_URL}/contact_managment/summary/process`, payload, {
                params: { poi_id: id, business_id: id },
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            return res.data;
        } catch (error) {
            console.error("processSummary Error:", error.message);
            try {
                 const res = await axios.post(`${API_BASE_URL}/contact_managment/summary/process/${id}`, { poi_id: id, business_id: id }, {
                    headers: { "accept": "application/json", "Authorization": `Bearer ${token}` }
                 });
                 return res.data;
            } catch (err2) {
                 return null;
            }
        }
    },

    getEmailActivityStatus: async (token, id) => { // GET /contact_managment/activity/business/{id}/email-status
        try {
            if (!token || !id) return [];
            const url = `${API_BASE_URL}/contact_managment/activity/business/${id}/email-status`;
            const res = await axios.get(url, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500, // Handle 404 silently
            });

            if (res.status === 404) return [];
            return res.data;
        } catch (error) {
            console.warn("Activity Status info (Expected):", error.message);
            return [];
        }
    },

    createIcp: async (data, token) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.post(`${API_BASE_URL}/icp/`, data, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200 || res.status === 201) {
                console.log("Create ICP Response:", res.data);
                toast.success("ICP created successfully");
                return res.data;
            }
        } catch (error) {
            console.log("Create ICP Error:", error.response || error);
            toast.error("Failed to create ICP");
            return null;
        }
    },

    getIcps: async (token, skip = 0, limit = 100) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/icp/`, {
                params: { skip, limit },
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Get ICPs Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Get ICPs Error:", error.response || error);
            toast.error("Failed to fetch ICPs");
            return null;
        }
    },

    getIcpById: async (token, id) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/icp/${id}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Get ICP Detail Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Get ICP Detail Error:", error.response || error);
            toast.error("Failed to fetch ICP details");
            return null;
        }
    },

    updateIcp: async (token, id, data) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.put(`${API_BASE_URL}/icp/${id}`, data, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200) {
                console.log("Update ICP Response:", res.data);
                toast.success("ICP updated successfully");
                return res.data;
            }
        } catch (error) {
            console.log("Update ICP Error:", error.response || error);
            toast.error("Failed to update ICP");
            return null;
        }
    },

    getIcpPerformanceMetrics: async (token, icpId) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/icp/performance-metrics`, {
                params: { icp_id: icpId },
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Get ICP Metrics Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Get ICP Metrics Error:", error.response || error);
            // toast.error("Failed to fetch ICP metrics");
            return null;
        }
    },

    updateBusinessInfo: async (token, businessId, data) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.put(`${API_BASE_URL}/admin/business-information/${businessId}`, data, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Update Business Information Response:", res.data);
                toast.success("Business information updated successfully");
                return res.data;
            }
        } catch (error) {
            console.log("Update Business Information Error:", error.response || error);
            toast.error("Failed to update business information");
            return null;
        }
    },

    getBusinessInfo: async (token, businessId) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/admin/business-information/${businessId}`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Get Business Information Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Get Business Information Error:", error.response || error);
            // toast.error("Failed to fetch business information");
            return null;
        }
    },

    changePassword: async (token, businessId, payload) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.put(`${API_BASE_URL}/admin/business-information/change-password/update/${businessId}`, payload, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200) {
                console.log("Change Password Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Change Password Error:", error.response || error);
            // toast.error("Failed to update password");
            throw error; // Let the component handle the specific error
        }
    },

    getAiPreference: async (token, businessId) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/admin/business-information/ai-preference/${businessId}`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Get AI Preference Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Get AI Preference Error:", error.response || error);
            return null;
        }
    },

    updateAiPreference: async (token, businessId, tone, personalizationLevel) => {
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

            const params = new URLSearchParams();
            params.append('ai_tone_preference', tone);
            params.append('ai_personalise_level', personalizationLevel);

            const res = await axios.put(`${API_BASE_URL}/admin/business-information/ai-preference/update/${businessId}`, params, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            if (res.status === 200) {
                console.log("Update AI Preference Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Update AI Preference Error:", error.response || error);
            const message = error.response?.data?.detail || "Failed to update AI preferences";
            toast.error(message);
            return null;
        }
    },

    uploadProfilePicture: async (adminId, file) => {
        try {
            if (!adminId) {
                toast.error("User ID is missing.");
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.post(`${API_BASE_URL}/admin/business-information/profile-picture/upload?admin_id=${adminId}`, formData, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200) {
                console.log("Upload Profile Picture Response:", res.data);
                toast.success("Logo updated successfully!");
                return res.data;
            }
        } catch (error) {
            console.log("Upload Profile Picture Error:", error.response || error);
            const message = error.response?.data?.detail || "Failed to upload logo";
            toast.error(message);
            return null;
        }
    },

    updateProfilePicture: async (adminId, file) => {
        try {
            if (!adminId) {
                toast.error("User ID is missing.");
                return null;
            }

            const formData = new FormData();
            formData.append('file', file);

            const res = await axios.put(`${API_BASE_URL}/admin/business-information/profile-picture/update/${adminId}`, formData, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.status === 200) {
                console.log("Update Profile Picture Response:", res.data);
                toast.success("Logo updated successfully!");
                return res.data;
            }
        } catch (error) {
            console.log("Update Profile Picture Error:", error.response || error);
            const message = error.response?.data?.detail || "Failed to update logo";
            toast.error(message);
            return null;
        }
    },

    getProfilePicture: async (adminId) => {
        try {
            if (!adminId) {
                return null;
            }

            const res = await axios.get(`${API_BASE_URL}/admin/business-information/profile-picture/${adminId}`, {
                headers: {
                    accept: "application/json",
                },
            });

            if (res.status === 200) {
                console.log("Get Profile Picture Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Get Profile Picture Error:", error.response || error);
            return null;
        }
    },

    getProfilePictureUrl: (adminId) => {
        if (!adminId) return null;
        return `${API_BASE_URL}/admin/business-information/profile-picture/${adminId}`;
    },

    deleteProfilePicture: async (adminId) => {
        try {
            if (!adminId) {
                toast.error("User ID is missing.");
                return null;
            }

            const res = await axios.delete(`${API_BASE_URL}/admin/business-information/profile-picture/${adminId}`, {
                headers: {
                    accept: "application/json",
                },
            });

            if (res.status === 200) {
                console.log("Delete Profile Picture Response:", res.data);
                toast.success("Logo removed successfully!");
                return res.data;
            }
        } catch (error) {
            console.log("Delete Profile Picture Error:", error.response || error);
            const message = error.response?.data?.detail || "Failed to remove logo";
            toast.error(message);
            return null;
        }
    },
};