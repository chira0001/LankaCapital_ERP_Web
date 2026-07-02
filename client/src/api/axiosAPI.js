import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});

instance.interceptors.request.use(
    (config) => {
        const token =
            localStorage.getItem("token");
        if (token) {
            config.headers.Authorization =
                `Bearer ${token}`;
        }
        return config;
    }
);

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response.status === 401 || error.response.status === 403 &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;

            try {
                const response =
                    await axios.post(
                        // "http://localhost:8080/api/v1/auth/refresh",
                        `${BASE_URL}/auth/refresh`,
                        {},
                        {
                            withCredentials: true
                        }
                    );

                const newToken =
                    response.data.token;
                localStorage.setItem(
                    "token",
                    newToken
                );
                originalRequest.headers.Authorization =
                    `Bearer ${newToken}`;
                return instance(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("token");
                toast.error(refreshError.response?.data?.message || "Session expired. Please login again.");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 2000);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;