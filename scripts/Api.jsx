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

            const url = `${API_BASE_URL}/enrichment/json/${id}`;

            const res = await axios.get(url, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("Enrichment JSON Response", res.data);
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

    getPoiDetails: async (businessId, token) => { // GET /enrichment/poi-details/${businessId}
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/enrichment/poi-details/${businessId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                console.log("POI Details Response:", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("POI Details Error:", error.response || error);
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
            }
            // Don't show a generic toast here as it's a background-fetch
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
            }
            
            return await executeWithDedup(cacheKey, async (signal) => {
                // Add cache-busting timestamp if bypassing cache
                let url = `${API_BASE_URL}/search/get_by_id/${id}`;
                if (bypassCache) {
                    url += `?nocache=${Date.now()}`;
                }
                
                const res = await axios.get(url, {
                    signal, // Pass abort signal for cancellation
                    headers: {
                        accept: "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                });
                
                if (res.status === 200) {
                    return res.data;
                }
            });
        } catch (error) {
            if (error.name === 'AbortError') {
                return null;
            }
            if (error.response?.status === 401) {
                toast.error("Authentication failed. Token may be expired. Please login again.");
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
            const res = await axios.get(`${API_BASE_URL}/search/filter`, {
                params: {
                    website: filters.website || 'Any',
                    ratings: filters.ratting !== undefined ? filters.ratting : (filters.ratings || 0),
                    reviews: filters.reviews || 0,
                    category: filters.category || ''
                },
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });
            return res.data;
        } catch (error) {
            console.error("Filter API Error:", error);
            return [];
        }
    },

    saveAudience: async (data, token) => {
        try {
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
                return res.data;
            } else {
                toast.error("Failed to save audience");
                return null;
            }
        } catch (error) {
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
                return res.data;
            }
        } catch (error) {
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
                return true;
            }
            return false;
        } catch (error) {
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
                return true;
            }
            return false;
        } catch (error) {
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
                toast.success('Business removed from audience successfully.');
                return true;
            }
            return false;
        } catch (error) {
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
                return res.data;
            }
            return null;
        } catch (error) {
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
                    return { ...lead, ...response.data, poi_id: lead.poi_id || lead.id || lead.result_id, status: 'Enriched' };
                } catch (error) {
                    return { ...lead, status: 'Failed' };
                }
            });

            const results = await Promise.all(enrichmentPromises);
            return results;

        } catch (error) {
            toast.error("Failed to process leads enrichment");
            return null;
        }
    },

    addNote: async (data, token) => { // add note api
        try {
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
                return res.data;
            } else {
                toast.error("Failed to add note");
                return null;
            }
        } catch (error) {
            toast.error("Failed to add note");
            return null;
        }
    },

    getNotes: async (token, skip = 0, limit = 100) => { // get notes api
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

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
                return res.data;
            } else {
                toast.error("Failed to fetch notes");
                return null;
            }
        } catch (error) {
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
                return true;
            }
            return false;
        } catch (error) {
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
            return null;
        }
    },

    triggerTestReminders: async (token) => {
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
                toast.success("Reminders triggered successfully!");
                return res.data;
            }
        } catch (error) {
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
            return res.data;
        } catch (error) {
            toast.error("Failed to send due-tomorrow notifications.");
            return null;
        }
    },

    updateTask: async (taskId, data, token) => {
        try {
            if (!token) return null;

            const params = new URLSearchParams();
            if (data.task_name) params.append('task_name', data.task_name);
            if (data.description) params.append('description', data.description);
            if (data.due_date) params.append('due_date', data.due_date);
            if (data.status) params.append('status', data.status);
            if (data.business_id) params.append('business_id', data.business_id);

            const res = await axios.put(
                `${API_BASE_URL}/contact_managment/tasks/${taskId}`,
                params,
                {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 200 || res.status === 201) {
                toast.success("Task updated successfully");
                return res.data;
            }
            return null;
        } catch (error) {
            toast.error("Failed to update task");
            return null;
        }
    },

    deleteTask: async (taskId, token) => {
        try {
            if (!token) return null;
            const res = await axios.delete(`${API_BASE_URL}/contact_managment/tasks/${taskId}`, {
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200 || res.status === 204) {
                toast.success("Task deleted successfully");
                return true;
            }
            return false;
        } catch (error) {
            toast.error("Failed to delete task");
            return false;
        }
    },


    getTasks: async (token, skip = 0, limit = 100) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/contact_managment/tasks/`, {
                params: { skip, limit },
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return res?.data || null;
        } catch (error) {
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
            return res?.data || [];
        } catch (error) {
            return [];
        }
    },

    getSummary: async (id, token) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/contact_managment/summary/${String(id).trim()}`, {
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500
            });
            if (res.status === 404) return null;
            return res.data;
        } catch (error) {
            return null;
        }
    },

    getPOIDetails: async (id, token) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/enrichment/poi-details/${String(id).trim()}`, {
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500
            });
            if (res.status === 404) return null;
            return res.data;
        } catch (error) {
            return null;
        }
    },

    generateMessagesStrategy: async (businessId, token) => {
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
            return null;
        }
    },

    processContactInfo: async (id, token) => {
        try {
            if (!token || !id) return null;
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
            return null;
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
            return null;
        }
    },

    getEmailActivityStatus: async (token, id) => {
        try {
            if (!token || !id) return [];
            const url = `${API_BASE_URL}/contact_managment/activity/business/${id}/email-status`;
            const res = await axios.get(url, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500,
            });
            if (res.status === 404) return [];
            return res.data;
        } catch (error) {
            return [];
        }
    },

    createIcp: async (data, token) => {
        try {
            if (!token) return null;
            const res = await axios.post(`${API_BASE_URL}/icp/`, data, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200 || res.status === 201) {
                toast.success("ICP created successfully");
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to create ICP");
            return null;
        }
    },

    getIcps: async (token, skip = 0, limit = 100) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/icp/`, {
                params: { skip, limit },
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to fetch ICPs");
            return null;
        }
    },

    getIcpById: async (token, id) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/icp/${id}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to fetch ICP details");
            return null;
        }
    },

    updateIcp: async (token, id, data) => {
        try {
            if (!token) return null;
            const res = await axios.put(`${API_BASE_URL}/icp/${id}`, data, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200) {
                toast.success("ICP updated successfully");
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to update ICP");
            return null;
        }
    },

    getIcpPerformanceMetrics: async (token, icpId) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/icp/performance-metrics`, {
                params: { icp_id: icpId },
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            return null;
        }
    },

    updateBusinessInfo: async (token, businessId, data) => {
        try {
            if (!token) return null;
            const res = await axios.put(`${API_BASE_URL}/admin/business-information/${businessId}`, data, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                toast.success("Business information updated successfully");
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to update business information");
            return null;
        }
    },

    getBusinessInfo: async (token, businessId) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/admin/business-information/${businessId}`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            return null;
        }
    },

    changePassword: async (token, businessId, payload) => {
        try {
            if (!token) return null;
            const res = await axios.put(`${API_BASE_URL}/admin/business-information/change-password/update/${businessId}`, payload, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            throw error;
        }
    },

    getAiPreference: async (token, businessId) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/admin/business-information/ai-preference/${businessId}`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            return null;
        }
    },

    updateAiPreference: async (token, businessId, tone) => {
        try {
            if (!token) return null;
            const params = new URLSearchParams();
            params.append('ai_tone_preference', tone);
            const res = await axios.put(`${API_BASE_URL}/admin/business-information/ai-preference/update/${businessId}`, params, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            const message = error.response?.data?.detail || "Failed to update AI preferences";
            toast.error(message);
            return null;
        }
    },

    uploadProfilePicture: async (adminId, file) => {
        try {
            if (!adminId) return null;
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.post(`${API_BASE_URL}/admin/business-information/profile-picture/upload?admin_id=${adminId}`, formData, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });
            if (res.status === 200) {
                toast.success("Logo updated successfully!");
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to upload logo");
            return null;
        }
    },

    updateProfilePicture: async (adminId, file) => {
        try {
            if (!adminId) return null;
            const formData = new FormData();
            formData.append('file', file);
            const res = await axios.put(`${API_BASE_URL}/admin/business-information/profile-picture/update/${adminId}`, formData, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "multipart/form-data",
                },
            });
            if (res.status === 200) {
                toast.success("Logo updated successfully!");
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to update logo");
            return null;
        }
    },

    getProfilePicture: async (adminId) => {
        try {
            if (!adminId) return null;
            const res = await axios.get(`${API_BASE_URL}/admin/business-information/profile-picture/${adminId}`, {
                headers: {
                    accept: "application/json",
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            return null;
        }
    },

    getProfilePictureUrl: (adminId) => {
        if (!adminId) return null;
        return `${API_BASE_URL}/admin/business-information/profile-picture/${adminId}`;
    },

    sendEmail: async (data, token) => {
        try {
            if (!token) return null;
            const res = await axios.post(`${API_BASE_URL}/contact_managment/activity/send-email`, data, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200 || res.status === 201) {
                toast.success("Email sent successfully!");
                return res.data;
            }
        } catch (error) {
            const message = error.response?.data?.detail || "Failed to send email";
            toast.error(message);
            return null;
        }
    },

    // --- Gmail Outreach APIs ---

    getGoogleConnectUrl: async (token) => {
        try {
            if (!token) return null;
            const res = await axios.get(`${API_BASE_URL}/calendar/connect`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data; // Expecting { authorization_url: "..." }
        } catch (error) {
            console.error("Failed to get Google connect URL:", error);
            return null;
        }
    },

    getGmailReplyContent: async (historyId, token) => {
        console.log("API CALL: getGmailReplyContent for historyId:", historyId);
        try {
            if (!token || !historyId) return null;
            const res = await axios.get(`${API_BASE_URL}/outreach/gmail/activity/${historyId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("API SUCCESS: getGmailReplyContent", res.data);
            return res.data; 
        } catch (error) {
            console.error("API ERROR: getGmailReplyContent:", error);
            return null;
        }
    },

    sendGmailOutreach: async (data, token) => {
        try {
            if (!token) return null;
            const res = await axios.post(`${API_BASE_URL}/outreach/gmail/send`, data, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (res.status === 200 || res.status === 201) {
                toast.success("Gmail sent successfully!");
                return res.data;
            }
        } catch (error) {
            if (error.response?.status === 403) {
                // Not connected to Google - caller should handle this
                throw error;
            }
            const message = error.response?.data?.detail || "Failed to send Gmail outreach";
            toast.error(message);
            return null;
        }
    },

    syncGmailReplies: async (token) => {
        try {
            if (!token) return null;
            const res = await axios.post(`${API_BASE_URL}/outreach/gmail/sync-replies`, {}, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data;
        } catch (error) {
            console.error("Failed to sync Gmail replies:", error);
            return null;
        }
    },

    getGmailLeadHistory: async (leadId, token) => {
        try {
            if (!token || !leadId) return [];
            const res = await axios.get(`${API_BASE_URL}/outreach/gmail/lead/${leadId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data || [];
        } catch (error) {
            console.error("Failed to fetch Gmail lead history:", error);
            return [];
        }
    },

    syncGmailOpenStatus: async (leadId, token) => {
        console.log("API CALL: syncGmailOpenStatus for ID:", leadId);
        try {
            if (!token || !leadId) return null;
            const res = await axios.get(`${API_BASE_URL}/outreach/gmail/track-open/${leadId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("API SUCCESS: syncGmailOpenStatus", res.data);
            return res.data;
        } catch (error) {
            console.error("API ERROR: syncGmailOpenStatus:", error);
            return null;
        }
    },

    deleteProfilePicture: async (adminId) => {
        try {
            if (!adminId) return null;
            const res = await axios.delete(`${API_BASE_URL}/admin/business-information/profile-picture/${adminId}`, {
                headers: {
                    accept: "application/json",
                },
            });
            if (res.status === 200) {
                toast.success("Logo removed successfully!");
                return res.data;
            }
        } catch (error) {
            toast.error("Failed to remove logo");
            return null;
        }
    },

    getNotifications: async (token) => {
        try {
            if (!token) return { total: 0, notifications: [] };
            const res = await axios.get(`${API_BASE_URL}/notifications/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.data; // Returns { total, notifications: [] }
        } catch (error) {
            console.error("Fetch Notifications Error:", error);
            return { total: 0, notifications: [] };
        }
    },

    markNotificationRead: async (id, token) => {
        try {
            if (!token) return null;
            const res = await axios.patch(`${API_BASE_URL}/notifications/${id}/read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.data;
        } catch (error) {
            console.error("Mark Read Error:", error);
            return null;
        }
    },

    markAllNotificationsRead: async (token) => {
        try {
            if (!token) return null;
            const res = await axios.post(`${API_BASE_URL}/notifications/mark-all-read`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return res.data;
        } catch (error) {
            console.error("Mark All Read Error:", error);
            return null;
        }
    },

    // --- Product Management APIs ---

    getProducts: async (token, adminId) => {
        try {
            if (!token || !adminId) return null;
            const res = await axios.get(`${API_BASE_URL}/admin/business-information/products/${adminId}`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                return res.data;
            }
        } catch (error) {
            console.error("Fetch Products Error:", error);
            return null;
        }
    },

    addProducts: async (token, products, links = [], file = null) => {
        console.log("Api.addProducts called", { products, links, file });
        try {
            if (!token) {
                console.error("No token provided to addProducts");
                return null;
            }
            const formData = new FormData();
            formData.append('products', JSON.stringify(products));
            formData.append('links', JSON.stringify(links));
            if (file) {
                formData.append('file', file);
            }

            const res = await axios.post(`${API_BASE_URL}/admin/business-information/products/`, formData, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200 || res.status === 201) {
                toast.success("Product added successfully");
                return res.data;
            }
        } catch (error) {
            console.error("Add Products Error:", error.response || error);
            const message = error.response?.data?.detail || "Failed to add products";
            toast.error(message);
            return null;
        }
    },

    updateProduct: async (token, adminId, productName, data) => {
        try {
            if (!token || !adminId || !productName) return null;
            const res = await axios.put(`${API_BASE_URL}/admin/business-information/products/${adminId}/${encodeURIComponent(productName)}`, data, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                toast.success("Product updated successfully");
                return res.data;
            }
        } catch (error) {
            const message = error.response?.data?.detail || "Failed to update product";
            toast.error(message);
            return null;
        }
    },

    deleteProduct: async (token, adminId, productName) => {
        try {
            if (!token || !adminId || !productName) return null;
            const res = await axios.delete(`${API_BASE_URL}/admin/business-information/products/${adminId}/${encodeURIComponent(productName)}`, {
                headers: {
                    accept: "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200) {
                toast.success("Product deleted successfully");
                return res.data;
            }
        } catch (error) {
            const message = error.response?.data?.detail || "Failed to delete product";
            toast.error(message);
            return null;
        }
    },

    uploadProductSource: async (token, file, sourceType) => {
        try {
            if (!token) return null;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('source_type', sourceType);

            const res = await axios.post(`${API_BASE_URL}/admin/business-information/products/sources/upload`, formData, {
                headers: {
                    accept: "application/json",
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`,
                },
            });
            if (res.status === 200 || res.status === 201) {
                toast.success("Document uploaded successfully");
                return res.data;
            }
        } catch (error) {
            const message = error.response?.data?.detail || "Failed to upload document";
            toast.error(message);
            return null;
        }
    }
};