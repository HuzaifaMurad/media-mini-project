import axios from "axios";

const isLocal = import.meta.env.DEV;

export const api = axios.create({
  baseURL: isLocal ? "http://localhost:7071/api" : "/api",
  withCredentials: !isLocal, // ✅ ONLY include credentials in production
});
