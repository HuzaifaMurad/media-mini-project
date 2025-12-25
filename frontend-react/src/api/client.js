import axios from "axios";

const isLocal = import.meta.env.DEV;

// Local: Functions Core Tools
// Prod: Your deployed Function App
const PROD_API = "https://func-mediamini-sass-cubtdzhpfcandgew.polandcentral-01.azurewebsites.net/api";

export const api = axios.create({
  baseURL: isLocal ? "http://localhost:7071/api" : PROD_API,
  withCredentials: false, // IMPORTANT: cross-domain cookies won't work here
});
