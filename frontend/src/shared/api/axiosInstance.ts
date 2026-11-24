import axios from "axios";
import { API_ENDPOINT } from "../../secrect";
import tokenStorage from "../storage/tokenStorage";
import jobModeStorage from "../storage/jobModeStorage";

// Shared axios instance. Every API file imports this instead of plain axios.
// withCredentials: send cookies (sessionId, refreshToken) to the backend on another port.
const axiosInstance = axios.create({ baseURL: API_ENDPOINT, withCredentials: true });

// Before each request: add the access token if we have one,
// and the "Worker / Local" choice from the dashboard switch (the backend reads it when it creates a job).
axiosInstance.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers["X-Job-Mode"] = jobModeStorage.get();
  return config;
});

// After each response: if the server says 401, the token is no longer valid, so remove it.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clear();
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
