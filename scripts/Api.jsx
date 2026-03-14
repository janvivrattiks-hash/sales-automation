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

    getSingleLead: async (id, token) => { // get single lead api
        try { // try to get single lead
            if (!token) {
                toast.error("Authentication token is missing. Please login again.");
                return null;
            }
            const res = await axios.get(`${API_BASE_URL}/search/get_by_id/${id}`, { // get the single lead
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
            const res = await axios.get(`${API_BASE_URL}/search/filter`, {
                params: {
                    website: filters.website,
                    ratting: filters.ratting,
                    category: filters.category
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
    }




};