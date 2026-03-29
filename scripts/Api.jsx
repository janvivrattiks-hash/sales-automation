import axios from 'axios';
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_ENV === "DEV"
    ? import.meta.env.VITE_BASE_URL_PRODUCTION
    : import.meta.env.VITE_BASE_URL_DEVELOPMENT;

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
                return res.data; // return the response data
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
                console.log("Lead Generation Response", res.data.results); // log the response data
                return res.data.results; // return the response data
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

    saveAudience: async (data, token) => { // save audience api
        try { // try to save audience
            console.log("Save Audience Data:", data); // log audience data
            console.log("Token:", token ? "Token exists" : "Token is missing"); // log token status

            if (!token) { // if token is missing
                toast.error("Authentication token is missing. Please login again."); // show error message
                return null; // return null
            }

            const res = await axios.post(`${API_BASE_URL}/audiance`, data, { // post the save audience request
                headers: {
                    "Content-Type": "application/json",
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.status === 200) { // if response is 200
                console.log("Save Audience Response:", res.data); // log the response data
                return res.data; // return the response data
            } else { // if response is not 200
                toast.error("Failed to save audience"); // show error message
                return null; // return null
            }
        } catch (error) { // catch the error
            console.log("Error Details:", error.response || error); // log detailed error
            if (error.response?.status === 401) { // if response is 401
                toast.error("Authentication failed. Token may be expired. Please login again."); // show error message
            } else { // if response is not 401
                toast.error("Failed to save audience"); // show error message
            }
            return null; // return null
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
            const res = await axios.delete(`${API_BASE_URL}/audiance/${id}/`, {
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
            console.log("Delete Audience Error:", error.response || error);
            toast.error("Failed to delete audience");
            return false;
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
                    return { ...lead, ...response.data, status: 'Enriched' };
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
                toast.success("Note added successfully");
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

    getNotes: async (token) => { // get notes api
        try {
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }

            const res = await axios.get(`${API_BASE_URL}/contact_managment/notes/`, {
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
                toast.success("Note deleted successfully");
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

    triggerDueTomorrow: async (token, templateType = '10AM') => { // GET /contact_managment/tasks/test-reminders/force-tomorrow
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
                        accept: "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res.status === 200) {
                console.log("Due Tomorrow Notification Response", res.data);
                return res.data;
            }
        } catch (error) {
            console.log("Due Tomorrow Notification Error:", error.response || error);
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

            return res?.data || null;

        } catch (error) {
            console.error(
                "Get Tasks Error:",
                error?.response?.data || error.message
            );
            return null;
        }
    },

    getSummary: async (id, token) => { // get summary api - VERSION 3.0
        try {
            if (!token) {
                console.log("FETCH_SUMMARY_TOKEN_MISSING");
                return null;
            }
            const cleanId = String(id).trim();
            const url = `${API_BASE_URL}/contact_managment/summary/${cleanId}`;
            console.log("FETCH_SUMMARY_API_URL_V3:", url);
            console.log("FETCH_SUMMARY_BASE_URL:", API_BASE_URL);

            const res = await axios.get(url, {
                headers: {
                    "accept": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });
            console.log("FETCH_SUMMARY_API_RESPONSE_STATUS:", res.status);
            console.log("FETCH_SUMMARY_API_DATA_FULL:", res.data);

            return res.data;
        } catch (error) {
            console.log("FETCH_SUMMARY_API_ERROR:", error.response || error);
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
            console.log("GENERATE_MESSAGES_API_RESPONSE_STATUS:", res.status);
            console.log("GENERATE_MESSAGES_API_DATA:", res.data);
            return res.data;
        } catch (error) {
            console.log("GENERATE_MESSAGES_API_ERROR:", error.response || error);
            return null;
        }
    },

    getContactInfo: async (jobId, token) => {
        try {
            if (!token) {
                console.error("Token is missing for getContactInfo");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/contact_managment/contact_info/${jobId}`, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Contact Info Response:", res.data);
            return res.data;
        } catch (error) {
            console.error("Error fetching contact info:", error.response || error);
            if (error.response?.status === 404) {
                console.log("Contact info not ready yet");
                return null;
            }
            throw error;
        }
    },

    getEmailActivityStatus: async (token, id) => { // GET /contact_managment/activity/email-status/{id}
        try {
            if (!token || !id) return [];
            const url = `${API_BASE_URL}/contact_managment/activity/business/${id}/email-status`;
            const res = await axios.get(url, {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${token}`,
                },
                validateStatus: (status) => status < 500, // Treat 404 as a valid response
            });

            if (res.status === 404) {
                console.log("No activity logs found (404) for ID:", id);
                return [];
            }

            console.log("Activity Status Response", res.data);
            return res.data;
        } catch (error) {
            console.error("Activity Status Error:", error.message);
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