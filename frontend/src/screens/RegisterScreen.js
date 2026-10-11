import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/auth";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export default function RegisterScreen({ navigation }) {
  const { register, googleLogin } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  const handleRegister = async () => {
    setErrorMessage("");

    // Basic checks before calling the backend
    if (!username.trim() || !email.trim() || !password) {
      setErrorMessage("Please fill in username, email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("The two passwords do not match.");
      return;
    }

    try {
      const cleanEmail = email.trim().toLowerCase();
      await register(username.trim(), cleanEmail, password);
      navigation?.navigate("Login", {
        registeredEmail: cleanEmail,
        successMessage: "Account created successfully! Please sign in.",
      });
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "We couldn't create your account right now. Please try again in a moment.",
        ),
      );
    }
  };

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignup = async () => {
    setErrorMessage("");
    setIsGoogleLoading(true);

    try {
      const redirectUri = Linking.createURL("oauthredirect");
      const authUrl =
        `https://accounts.google.com/o/oauth2/v2/auth` +
        `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=token%20id_token` +
        `&scope=${encodeURIComponent("openid email profile")}` +
        `&prompt=select_account` +
        `&nonce=${Math.random().toString(36).substring(2)}`;

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri,
        { showInRecents: true }
      );

      if (result?.type === "success" && result.url) {
        const rawParams = result.url.includes("#")
          ? result.url.split("#")[1]
          : result.url.split("?")[1] || "";

        const params = {};
        rawParams.split("&").forEach((item) => {
          const [k, v] = item.split("=");
          if (k && v) params[decodeURIComponent(k)] = decodeURIComponent(v);
        });

        const accessToken = params.access_token;
        const idToken = params.id_token;

        let profileData = null;

        if (accessToken) {
          try {
            const res = await fetch(
              "https://www.googleapis.com/oauth2/v3/userinfo",
              {
                headers: { Authorization: `Bearer ${accessToken}` },
              }
            );
            if (res.ok) profileData = await res.json();
          } catch (e) {
            console.warn("Could not fetch userinfo via accessToken:", e);
          }
        }

        if ((!profileData || !profileData.email) && idToken) {
          try {
            const res = await fetch(
              `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
            );
            if (res.ok) profileData = await res.json();
          } catch (e) {
            console.warn("Could not fetch profile via idToken:", e);
          }
        }

        if (!profileData || !profileData.email) {
          throw new Error("Unable to retrieve account details from Google.");
        }

        const cleanEmail = profileData.email.toLowerCase().trim();
        const cleanUsername = profileData.name || cleanEmail.split("@")[0];
        const avatar = profileData.picture || "";

        await googleLogin({
          email: cleanEmail,
          username: cleanUsername,
          avatar,
          tokenId: idToken,
        });

        navigation?.replace("Dashboard");
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Google sign-up could not be completed. Please try again."
        )
      );
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#021812] relative">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Atmospheric Background Gradients */}
      <LinearGradient
        colors={["#03261C", "#021A13", "#010F0B"]}
        className="absolute inset-0"
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient glows */}
      <View className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <View className="absolute bottom-1/4 -left-28 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingVertical: 28,
            justifyContent: "center",
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="px-6"
        >
          {/* Top navigation row */}
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            activeOpacity={0.7}
            className="w-9 h-9 rounded-full bg-[#04281E] border border-emerald-500/30 items-center justify-center mb-3"
          >
            <Ionicons name="chevron-back" size={20} color="#34D399" />
          </TouchableOpacity>

          {/* Header */}
          <View className="items-center mb-4">
            <View className="w-12 h-12 rounded-2xl bg-emerald-950/90 border border-emerald-500/30 items-center justify-center mb-2 shadow-md shadow-emerald-950">
              <Image
                source={require("../../assets/expenseicon.png")}
                style={{ width: 32, height: 32, borderRadius: 6 }}
                resizeMode="contain"
              />
            </View>

            <Text className="text-2xl font-bold text-white tracking-tight">
              Create Account
            </Text>
            <Text className="text-emerald-100/60 text-xs mt-0.5 text-center">
              Start mastering your money with ExpenseWise
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View className="w-full mb-4 bg-red-500/15 border border-red-400/40 rounded-xl px-4 py-2.5 flex-row items-center">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#F87171"
                style={{ marginRight: 8 }}
              />
              <Text className="text-red-300 text-xs font-medium flex-1">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Form Card */}
          <View className="w-full bg-[#04281E]/70 border border-emerald-500/20 rounded-2xl p-5 shadow-xl">
            {/* Username Field */}
            <View className="mb-3">
              <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                Username
              </Text>
              <View
                style={{
                  borderColor: usernameFocused
                    ? "#34D399"
                    : "rgba(16, 185, 129, 0.25)",
                }}
                className="flex-row items-center bg-[#021812]/80 border rounded-xl px-3.5 py-2.5"
              >
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={usernameFocused ? "#34D399" : "#6EE7B7"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setUsernameFocused(true)}
                  onBlur={() => setUsernameFocused(false)}
                  placeholder="username"
                  placeholderTextColor="rgba(110, 231, 183, 0.4)"
                  autoCapitalize="none"
                  style={{ paddingVertical: 0 }}
                  className="flex-1 text-white text-sm font-medium"
                />
              </View>
            </View>

            {/* Email Field */}
            <View className="mb-3">
              <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                Email Address
              </Text>
              <View
                style={{
                  borderColor: emailFocused
                    ? "#34D399"
                    : "rgba(16, 185, 129, 0.25)",
                }}
                className="flex-row items-center bg-[#021812]/80 border rounded-xl px-3.5 py-2.5"
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={emailFocused ? "#34D399" : "#6EE7B7"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  placeholder="name@example.com"
                  placeholderTextColor="rgba(110, 231, 183, 0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={{ paddingVertical: 0 }}
                  className="flex-1 text-white text-sm font-medium"
                />
              </View>
            </View>

            {/* Password Field */}
            <View className="mb-3">
              <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                Password
              </Text>
              <View
                style={{
                  borderColor: passwordFocused
                    ? "#34D399"
                    : "rgba(16, 185, 129, 0.25)",
                }}
                className="flex-row items-center bg-[#021812]/80 border rounded-xl px-3.5 py-2.5"
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={passwordFocused ? "#34D399" : "#6EE7B7"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(110, 231, 183, 0.4)"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  style={{ paddingVertical: 0 }}
                  className="flex-1 text-white text-sm font-medium"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="rgba(110, 231, 183, 0.7)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password Field */}
            <View className="mb-4">
              <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                Confirm Password
              </Text>
              <View
                style={{
                  borderColor: confirmPasswordFocused
                    ? "#34D399"
                    : "rgba(16, 185, 129, 0.25)",
                }}
                className="flex-row items-center bg-[#021812]/80 border rounded-xl px-3.5 py-2.5"
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={18}
                  color={confirmPasswordFocused ? "#34D399" : "#6EE7B7"}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(110, 231, 183, 0.4)"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  style={{ paddingVertical: 0 }}
                  className="flex-1 text-white text-sm font-medium"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={18}
                    color="rgba(110, 231, 183, 0.7)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity
              onPress={handleRegister}
              activeOpacity={0.85}
              style={{
                borderRadius: 12,
                overflow: "hidden",
                marginBottom: 16,
              }}
            >
              <LinearGradient
                colors={["#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 11,
                  paddingHorizontal: 16,
                  borderRadius: 12,
                }}
              >
                <Text
                  style={{
                    color: "#011B13",
                    fontWeight: "700",
                    fontSize: 14,
                    letterSpacing: 0.5,
                    marginRight: 6,
                  }}
                >
                  Create Account
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center mb-4">
              <View className="flex-1 h-[1px] bg-emerald-500/20" />
              <Text className="text-emerald-200/50 text-[10px] font-medium px-2.5 uppercase tracking-wider">
                Or sign up with
              </Text>
              <View className="flex-1 h-[1px] bg-emerald-500/20" />
            </View>

            {/* Google Signup */}
            <TouchableOpacity
              onPress={handleGoogleSignup}
              disabled={isGoogleLoading}
              activeOpacity={0.8}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 11,
                paddingHorizontal: 16,
                borderRadius: 12,
                backgroundColor: "rgba(2, 24, 18, 0.9)",
                borderWidth: 1,
                borderColor: "rgba(16, 185, 129, 0.3)",
              }}
            >
              {isGoogleLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#34D399"
                  style={{ marginRight: 8 }}
                />
              ) : (
                <Ionicons
                  name="logo-google"
                  size={18}
                  color="#34D399"
                  style={{ marginRight: 8 }}
                />
              )}
              <Text
                style={{
                  color: "#D1FAE5",
                  fontWeight: "600",
                  fontSize: 13,
                }}
              >
                {isGoogleLoading ? "Connecting to Google..." : "Google Account"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer - Switch to Login */}
          <View className="flex-row items-center justify-center mt-5">
            <Text className="text-emerald-100/60 text-xs">
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => navigation?.navigate("Login")}
              activeOpacity={0.7}
            >
              <Text className="text-emerald-400 font-bold text-xs">
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
