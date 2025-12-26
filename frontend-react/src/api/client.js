import axios from "axios";
import { getToken } from "./jwtAuth";

const isLocal = import.meta.env.DEV;

export const api = axios.create({
  baseURL: isLocal ? "http://localhost:7071/api" : "https://func-mediamini-sass-cubtdzhpfcandgew.polandcentral-01.azurewebsites.net/api",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});




// import axios from "axios";

// const isLocal = import.meta.env.DEV;

// export const api = axios.create({
//   baseURL: isLocal ? "http://localhost:7071/api" : "/api",
//   withCredentials: false,
// });

// // Optional: local dev demo headers (ONLY if you want local to work without login)
// api.interceptors.request.use((config) => {
//   if (isLocal && import.meta.env.VITE_DEMO_MODE === "true") {
//     config.headers = config.headers || {};
//     config.headers["x-demo-user"] = "local_user";
//     config.headers["x-demo-roles"] = "Creator,Consumer";
//   }
//   return config;
// });



// const isLocal = import.meta.env.DEV;

// const instance = axios.create({
//   baseURL: isLocal ? "http://localhost:7071/api" : "/api",
//   withCredentials: false,
// });


// // For now we are calling Function App directly in production.
// // (Later we can switch to SWA integrated API and remove demo headers.)
// const PROD_API =
//   "https://func-mediamini-sass-cubtdzhpfcandgew.polandcentral-01.azurewebsites.net/api";

// export const api = axios.create({
//   baseURL: isLocal ? "http://localhost:7071/api" : PROD_API,
//   withCredentials: false,
// });

// // ✅ DEMO Creator headers (Phase A)
// // Remove this later when you implement proper auth
// api.interceptors.request.use((config) => {
//   config.headers = config.headers || {};
//   config.headers["x-demo-user"] = "creator_demo";
//   config.headers["x-demo-roles"] = "Creator";
//   return config;
// });



// import axios from "axios";

// const isLocal = import.meta.env.DEV;
// const PROD_API =
//   "https://func-mediamini-sass-cubtdzhpfcandgew.polandcentral-01.azurewebsites.net/api";

// function makeClient({ demoUser, demoRoles }) {
//   const instance = axios.create({
//     baseURL: isLocal ? "http://localhost:7071/api" : PROD_API,
//     withCredentials: false,
//   });

//   instance.interceptors.request.use((config) => {
//     config.headers = config.headers || {};
//     config.headers["x-demo-user"] = demoUser;
//     config.headers["x-demo-roles"] = demoRoles;
//     return config;
//   });

//   return instance;
// }

// export const creatorApi = makeClient({
//   demoUser: "creator_demo",
//   demoRoles: "Creator",
// });

// export const consumerApi = makeClient({
//   demoUser: "consumer_demo",
//   demoRoles: "Consumer",
// });


