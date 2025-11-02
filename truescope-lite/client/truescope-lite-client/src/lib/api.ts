/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError } from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:4000/api",
  timeout: 10_000,
});

// Attach token dynamically before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to extract a clean message
function getErrMsg(err: any) {
  const d = err?.response?.data;
  if (d && typeof d === "object") {
    if (typeof d.error === "string") return d.error;
    if (typeof d.message === "string") return d.message;
  }
  if (err?.code === "ECONNABORTED") return "Request timed out";
  if (!err?.response) return "Network error";
  return "Something went wrong";
}

// Normalize errors; broadcast 401
api.interceptors.response.use(
  (res) => res,
  (err: AxiosError) => {
    const status = err.response?.status ?? 0;

    if (status === 401) {
      localStorage.removeItem("token");
      // Let the app (AuthContext/Router) decide what to do
      window.dispatchEvent(new Event("auth:unauthorized"));
    }

    return Promise.reject({
      status,
      message: getErrMsg(err),
      data: err.response?.data ?? null,
    });
  }
);

export default api;
