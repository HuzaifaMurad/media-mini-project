// import axios from "axios";

// const isLocal = import.meta.env.DEV;

// // Local: Functions Core Tools
// // Prod: Your deployed Function App
// const PROD_API = "https://func-mediamini-sass-cubtdzhpfcandgew.polandcentral-01.azurewebsites.net/api";

// export const api = axios.create({
//   baseURL: isLocal ? "http://localhost:7071/api" : PROD_API,
//   withCredentials: false, // IMPORTANT: cross-domain cookies won't work here
// });



import axios from "axios";

const isLocal = import.meta.env.DEV;

// For now we are calling Function App directly in production.
// (Later we can switch to SWA integrated API and remove demo headers.)
const PROD_API =
  "https://func-mediamini-sass-cubtdzhpfcandgew.polandcentral-01.azurewebsites.net/api";

export const api = axios.create({
  baseURL: isLocal ? "http://localhost:7071/api" : PROD_API,
  withCredentials: false,
});

// ✅ DEMO Creator headers (Phase A)
// Remove this later when you implement proper auth
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers["x-demo-user"] = "creator_demo";
  config.headers["x-demo-roles"] = "Creator";
  return config;
});
