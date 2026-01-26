import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
const sanitizedBaseUrl = rawBaseUrl
  ? rawBaseUrl.replace(/\/api-swagger\/?$/i, "")
  : "";

export const API_BASE_URL = sanitizedBaseUrl;

export const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
