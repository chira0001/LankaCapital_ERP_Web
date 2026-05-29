import api from "./axiosAPI";

export const loginFunc = async (data) => {
    const response = await api.post(
        "/auth/login",
        {
            username: data.email,
            password: data.password
        }
    );
    return response;
};

export const refreshToken = async () => {
    const response = await api.post(
        "/auth/refresh"
    );
    return response.data;
};