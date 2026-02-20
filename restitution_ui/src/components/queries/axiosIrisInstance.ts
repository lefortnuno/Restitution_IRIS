import axios from "axios";

const axiosIrisInstance = axios.create({
  baseURL: process.env.REACT_APP_API_IRIS_URL,
  withCredentials: true,
});

axiosIrisInstance.interceptors.request.use((config) => {
  const token = process.env.REACT_APP_API_TOKEN_IRIS;
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosIrisInstance;
