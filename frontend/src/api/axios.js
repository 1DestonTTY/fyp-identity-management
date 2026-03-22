import axios from "axios";

const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

const api = axios.create({
    baseURL: isLocal 
        ? "http://127.0.0.1:8000/api" 
        : "https://143.198.220.144.nip.io/api"
});

api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('access');
        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if(error.response?.status === 401 && !originalRequest._retry){
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh');
            if(refreshToken){
                try{
                    //use the dynamic baseURL instead of a hardcoded string
                    const response = await axios.post(`${api.defaults.baseURL}/token/refresh/`, {refresh: refreshToken});
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access', newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }catch(refreshError){
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    window.location.href = '/';
                    return Promise.reject(refreshError);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;