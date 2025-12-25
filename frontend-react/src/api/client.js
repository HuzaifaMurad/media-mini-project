import axios from "axios";

const isLocal = import.meta.env.DEV;

export const api = axios.create({
  baseURL: "/api",
  withCredentials: !isLocal
});
