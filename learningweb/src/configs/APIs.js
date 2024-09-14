import axios from "axios";
import cookie from "react-cookies";

const BASE_URL = "http://127.0.0.1:8000/";

export const endpoints = {
    "category": "/categories"
};

export const authAPIs = () => {
    const token = cookie.load('authToken');
    
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': token ? `Bearer ${token}` : ''
        }
    });
};

export default axios.create({
    baseURL: BASE_URL
});
