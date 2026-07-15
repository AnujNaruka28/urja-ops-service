import axios from "axios";

const axiosInstance = axios.create({
    withCredentials: true,
});

export const axiosRequest = (
    url: string, 
    method: string, 
    data?: Record<string, any>, 
    params?: Record<string, any>, 
    headers?: any
) => {
    return axiosInstance({
        url,
        method,
        data,
        params,
        headers
    });
};

