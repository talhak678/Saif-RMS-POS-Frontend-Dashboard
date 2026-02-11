import axios, { AxiosRequestConfig, AxiosResponse } from "axios";


const api = axios.create({
    baseURL: 'https://saif-rms-pos-backend.vercel.app/api',
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

// api.interceptors.response.use(
//     (response) => response,
//     (error) => {
//         return Promise.reject(error);
//     }
// );

// // refresh token / remember me logic
// type FailedQueueItem = {
//     resolve: (value?: AxiosResponse | PromiseLike<AxiosResponse>) => void;
//     reject: (reason?: any) => void;
//     config: AxiosRequestConfig;
// };

// let isRefreshing = false;
// let failedQueue: FailedQueueItem[] = [];

// // Process queued requests after refresh
// const processQueue = (newToken: string) => {
//     failedQueue.forEach(({ resolve, config }) => {
//         if (!config.headers) {
//             config.headers = {};
//         }

//         config.headers["Authorization"] = `Bearer ${newToken}`;
//         resolve(api(config));
//     });
//     failedQueue = [];
// };

// api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//         const originalConfig = error.config;

//         if (error.response && error.response.status === 401 && !originalConfig._retry) {
//             const token = isUserLoggedIn();

//             if (!token || !token.token || !token.rememberMe) {
//                 logout();
//                 return Promise.reject(new Error("No token available"));
//             }
//             if (!isRefreshing) {
//                 originalConfig._retry = true;
//                 isRefreshing = true;
//                 try {
//                     const newToken = await refreshAccessToken();
//                     originalConfig.headers["Authorization"] = `Bearer ${newToken}`;
//                     processQueue(newToken);
//                     return api(originalConfig);

//                 } catch (refreshError) {
//                     failedQueue.forEach(({ reject }) => reject(refreshError));
//                     failedQueue = [];
//                     logout();
//                     return Promise.reject(refreshError);
//                 } finally {
//                     isRefreshing = false;
//                 }
//             }
//             // Queue the failed request
//             return new Promise((resolve, reject) => {
//                 failedQueue.push({ resolve, reject, config: originalConfig });
//             });
//         }

//         return Promise.reject(error);
//     }
// );

// // Refresh function
// async function refreshAccessToken() {
//     try {
//         const encryptedServ = getEncryptionService();
//         const encryptedRefresh = isUserLoggedIn().refresh_token;
//         if (!encryptedRefresh) {
//             throw new Error('No refresh token available');
//         }
//         const response = await axios.post(
//             `${baseURL}${apiUrls.refreshToken}`,
//             { refreshToken: encryptedRefresh },
//             { headers: { 'Content-Type': 'application/json' } }
//         );

//         const cookieExpiry = 2;
//         const { accessToken, refreshToken } = response.data.data.tokens;
//         const tokenCookie = `${accessToken}___${cookieExpiry}`
//         const encryptedToken = encryptedServ.encryptField(tokenCookie)
//         const refreshTokenCookie = encryptedServ.encryptField(refreshToken)

//         setCookie('token', encryptedToken, true);
//         setCookie('refresh-token', refreshTokenCookie, true);

//         return accessToken;
//     }
//     catch (err) {
//         console.error(err)
//         logout()
//     }
// }

export default api;
