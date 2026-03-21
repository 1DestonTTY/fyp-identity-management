import axios from "axios";

const api = axios.create({
    // baseURL: "http://127.0.0.1:8000/api",
    // baseURL: 'http://143.198.220.144:8000/api/'
    baseURL: 'https://143.198.220.144.nip.io/api/'
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
    
        //check if the error is 401 and we havent already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
    
            const refreshToken = localStorage.getItem('refresh');
            if(refreshToken){
                try{
                    //attempt to get a new access token
                    const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {refresh: refreshToken});
                    const newAccessToken = response.data.access;
                    localStorage.setItem('access', newAccessToken);
        
                    //update the header of the original request and retry it
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                }catch(refreshError){
                    //refresh token is expired or invalid and log the user out
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