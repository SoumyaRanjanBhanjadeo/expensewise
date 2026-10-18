import api, {
  API_URL,
  TOKEN_KEY,
  saveToken,
  getToken,
  clearToken,
  getErrorMessage,
} from "../axiosConfig/axiosConfig";

export {
  api,
  API_URL,
  TOKEN_KEY,
  saveToken,
  getToken,
  clearToken,
  getErrorMessage,
};

export const registerUser = (payload) => api.post("/auth/register", payload);

export const loginUser = (payload) => api.post("/auth/login", payload);

export const googleLoginUser = (payload) => api.post("/auth/google", payload);

export const biometricLoginUser = (payload) =>
  api.post("/auth/biometric", payload);

export const forgotPassword = (email) =>
  api.post("/auth/forgot-password", { email });

export const verifyOtp = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });

export const resetPassword = (payload) =>
  api.post("/auth/reset-password", payload);

export const getMe = () => api.get("/auth/me");
