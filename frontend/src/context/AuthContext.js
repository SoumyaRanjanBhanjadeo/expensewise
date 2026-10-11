import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  googleLoginUser,
  biometricLoginUser,
  getMe,
  saveToken,
  getToken,
  clearToken,
} from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start, restore the session from the securely saved token
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedToken = await getToken();
        if (!savedToken) return;

        setToken(savedToken);
        const { data } = await getMe();
        if (data?.data?.user) {
          setUser(data.data.user);
          await AsyncStorage.setItem(
            "@expensewise_last_user",
            JSON.stringify(data.data.user),
          );
        }
      } catch (error) {
        // Token is invalid or expired, so clear the old session
        await clearToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Saves the token and user returned by any successful login call
  const applySession = async ({ token: newToken, user: newUser }) => {
    await saveToken(newToken);
    if (newUser) {
      await AsyncStorage.setItem(
        "@expensewise_last_user",
        JSON.stringify(newUser),
      );
    }
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email, password) => {
    const { data } = await loginUser({ email, password });
    await applySession(data.data);
    return data;
  };

  const register = async (username, email, password) => {
    const { data } = await registerUser({ username, email, password });
    // User must sign in manually after creating an account
    return data;
  };

  const googleLogin = async (payload) => {
    const { data } = await googleLoginUser(payload);
    await applySession(data.data);
    return data;
  };

  const biometricLogin = async (email) => {
    const { data } = await biometricLoginUser({ email });
    await applySession(data.data);
    return data;
  };

  const logout = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isLoading,
    isLoggedIn: Boolean(user),
    login,
    register,
    googleLogin,
    biometricLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Simple hook so screens can read the logged in user
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}