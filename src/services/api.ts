import { baseUrl } from "@/types/environment";
import axios from "axios";
import { AuthServiceInstance } from "./auth.service";

const api = axios.create({
    baseURL: baseUrl,
    withCredentials: false
});

// api.interceptors.request.use(
//     (config) => {
//         const token = isUserLoggedIn();
//         if (config.data && config.data instanceof FormData) {
//             delete config.headers['Content-Type'];
//         } else {
//             config.headers['Content-Type'] = 'application/json';
//         }
//         if (token.token) {
//             config.headers['Authorization'] = `Bearer ${token.token}`;
//         }
//         return config;
//     },
//     (error) => {
//         return Promise.reject(error);
//     }
// );

api.interceptors.response.use(
    (response) => response,
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalConfig = error.config;

        if (error.response && error.response.status === 401 && !originalConfig._retry) {
            const authServ = AuthServiceInstance()
            authServ.logout()
        }

        return Promise.reject(error);
    }
);

export default api;

