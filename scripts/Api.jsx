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

};