import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { NativeModules, Platform } from "react-native";

// Automatically detects backend URL based on device, emulator, or web
export const getApiBaseUrl = () => {
  // 1. If running in a web browser, use window.location.hostname
  if (
    Platform.OS === "web" &&
    typeof window !== "undefined" &&
    window.location?.hostname
  ) {
    return `http://${window.location.hostname}:6000/api`;
  }

  // 2. In Expo Go / Native, extract host IP directly from the bundle scriptURL
  // This automatically tracks whatever Wi-Fi network the computer is on
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (scriptURL) {
    const match = scriptURL.match(/https?:\/\/([^/:]+)/);
    const host = match ? match[1] : null;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:6000/api`;
    }
  }

  // 3. Check EXPO_PUBLIC_API_URL from .env
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1")
  ) {
    return envUrl;
  }

  // 4. Default fallback: use current Wi-Fi LAN IP or Android emulator loopback
  if (Platform.OS === "android") {
    return "http://192.168.1.3:6000/api";
  }

  return "http://192.168.1.3:6000/api";
};

export const API_URL = getApiBaseUrl();

// Key used to store the token securely on the device
export const TOKEN_KEY = "expensewise_token";

// Shared axios client with credentials kept for cookie-based auth too
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Attach the saved token to every request as a Bearer header
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (__DEV__) {
    console.log(
      `[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log(
        `[API Response] ${response.status} from ${response.config?.url}`,
      );
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.log(
        `[API Error]`,
        error.message,
        "Target URL:",
        `${error.config?.baseURL || ""}${error.config?.url || ""}`,
      );
    }
    return Promise.reject(error);
  },
);

// Persists the token in the secure device store
export const saveToken = (token) => SecureStore.setItemAsync(TOKEN_KEY, token);

// Reads the saved token when the app starts
export const getToken = () => SecureStore.getItemAsync(TOKEN_KEY);

// Removes the token when the user logs out
export const clearToken = () => SecureStore.deleteItemAsync(TOKEN_KEY);

// Turns any API or network error into a message a normal user can understand
export const getErrorMessage = (error, fallback) => {
  // No response at all means the app could not reach the server
  if (!error.response) {
    const target = error.config?.baseURL ? ` (${error.config.baseURL})` : "";
    if (error.code === "ECONNABORTED") {
      return `Connection timed out${target}. Please check if the server is running.`;
    }
    return `Cannot connect to server${target}. Please check your connection and ensure the backend is running.`;
  }

  // Prefer the clear message sent by the backend, otherwise use the fallback
  return error.response.data?.message || fallback;
};

export default api;
