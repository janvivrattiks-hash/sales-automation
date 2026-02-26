import axios from 'axios';
import { toast } from "react-toastify";

const API_BASE_URL = import.meta.env.VITE_ENV === "DEV"
    ? import.meta.env.VITE_BASE_URL_PRODUCTION
    : import.meta.env.VITE_BASE_URL_DEVELOPMENT;

export default {

    Login: async (email, password) => { // login api
        try { // try to login
            console.log("logging in user", API_BASE_URL); // log the base url
            const res = await axios.post(`${API_BASE_URL}/admin/login`, { // post the login request
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
            const res = await axios.post(`${API_BASE_URL}/serpapi/scrape`, data, { // post the lead generation request
                headers: { // headers
                    "content-type": "application/json", // content type
                    accept: "application / json", // accept
                    "admin-token": `${token}`, // admin token
                },
            });
            if (res.status === 200) { // if response is 200
                console.log("Lead Generation Response", res.data.results); // log the response data
                return res.data.results; // return the response data
            }
        } catch (error) { // catch the error
            console.log(error); // log the error
            toast.error("Failed to fetch lead generation"); // show error message
            return null; // return null
        }
    },

};