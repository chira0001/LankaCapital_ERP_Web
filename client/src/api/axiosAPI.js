import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


////////////////////////////////////////////////////
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api/v1";

// console.log("BASE URL =", import.meta.env.VITE_BACKEND_URL);
/////////////////////////////////////////////////////////
const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

const refreshInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});


instance.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token");

        //  console.log("TOKEN SENT TO BACKEND:", token);

        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }
        return config;
    },
///////////////////////////
    (error) => {
    return Promise.reject(error);
  }

  /////////////////
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest || originalRequest.url?.includes("/auth/refresh")) {
            return Promise.reject(error);
        }
        // if (
        //     error.response?.status === 401 || error.response?.status === 403 &&
        //     !originalRequest._retry
        // ){
        if (
        (error.response?.status === 401 ||
        error.response?.status === 403) &&
        !originalRequest._retry
        ) {
        
        
            originalRequest._retry = true;

            try {
                const response =
                    //await axios.post(
                     //   "http://localhost:8080/api/v1/auth/refresh",
                      //  {},
                       // {
                       // {
                         //   withCredentials: true
                       // }
                    //);

                    await refreshInstance.post("/auth/refresh", {}, {
                        withCredentials: true
                    });

                const newToken = response.data?.token;
                if (!newToken) {
                    localStorage.removeItem("token");
                    toast.error("Session expired. Please login again.");
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1000);
                    return Promise.reject(new Error("No token returned from refresh"));
                }
                localStorage.setItem("token", newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return instance(originalRequest);
            } catch (refreshError) {
                toast.error(refreshError.response?.data?.message || "Session expired. Please login again.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
                localStorage.removeItem("token");
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
