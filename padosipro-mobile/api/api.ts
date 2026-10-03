import storage from "@/services/storage";
import axios from "axios";

// Expo reads EXPO_PUBLIC_ variables from the root .env file.
const apiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!apiUrl) {
  throw new Error("Set EXPO_PUBLIC_API_URL in .env. See .env.example for an example.");
}

const api = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getItem("accessToken");

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

export default api;
