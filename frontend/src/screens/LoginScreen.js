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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import loginData from "../dummy/login.json";

export default function LoginScreen({ navigation }) {
  // Step state: "login" | "forgot_email" | "forgot_otp" | "forgot_new_password"
  const [authStep, setAuthStep] = useState("login");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Login states - default to dummy credentials for effortless testing
  const [email, setEmail] = useState(loginData.user.email);
  const [password, setPassword] = useState(loginData.user.password);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    setErrorMessage("");
    // Accept matching credentials or default login
    if (
      (email.trim().toLowerCase() === loginData.user.email.toLowerCase() &&
        password === loginData.user.password) ||
      (!email && !password)
    ) {
      navigation?.replace("Dashboard");
    } else {
      setErrorMessage(`Invalid credentials. Demo: ${loginData.user.email} / ${loginData.user.password}`);
    }
  };

  const handleGoogleLogin = () => {
    navigation?.replace("Dashboard");
  };

  // Forgot password states
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotEmailFocused, setForgotEmailFocused] = useState(false);

  // OTP states
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef([]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  // New password states
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmNewPasswordFocused, setConfirmNewPasswordFocused] =
    useState(false);

  // Countdown timer for OTP
  useEffect(() => {
    let interval;
    if (authStep === "forgot_otp" && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [authStep, timer]);

  const handleOtpChange = (text, index) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);

    if (cleanText && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    setTimer(30);
    setCanResend(false);
    otpRefs.current[0]?.focus();
    console.log("Resending OTP to:", forgotEmail);
  };

  const handleSendOtp = () => {
    if (!forgotEmail) return;
    setTimer(30);
    setCanResend(false);
    setAuthStep("forgot_otp");
  };

  const handleVerifyOtp = () => {
    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) return;
    setAuthStep("forgot_new_password");
  };

  const handleResetPassword = () => {
    if (!newPassword || newPassword !== confirmNewPassword) return;
    setSuccessMessage("Password reset successfully! Please sign in.");
    setAuthStep("login");
    // Reset forgot password state
    setForgotEmail("");
    setOtp(["", "", "", "", "", ""]);
    setNewPassword("");
    setConfirmNewPassword("");
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

      {/* Ambient background glows */}
      <View className="absolute -top-20 -left-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <View className="absolute top-1/2 -right-24 w-72 h-72 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="px-6 py-8"
        >
          {/* Header & Logo */}
          <View className="items-center mb-5">
            <View className="w-14 h-14 rounded-2xl bg-emerald-950/90 border border-emerald-500/30 items-center justify-center mb-3 shadow-md shadow-emerald-950">
              <Image
                source={require("../../assets/expenseicon.png")}
                style={{ width: 38, height: 38, borderRadius: 8 }}
                resizeMode="contain"
              />
            </View>

            {authStep === "login" && (
              <>
                <Text className="text-2xl font-bold text-white tracking-tight">
                  Welcome Back
                </Text>
                <Text className="text-emerald-100/60 text-xs mt-1 text-center">
                  Sign in to keep tracking your financial journey
                </Text>
              </>
            )}

            {authStep === "forgot_email" && (
              <>
                <Text className="text-2xl font-bold text-white tracking-tight">
                  Reset Password
                </Text>
                <Text className="text-emerald-100/60 text-xs mt-1 text-center">
                  Enter your registered email to receive a recovery code
                </Text>
              </>
            )}

            {authStep === "forgot_otp" && (
              <>
                <Text className="text-2xl font-bold text-white tracking-tight">
                  Verify OTP
                </Text>
                <Text className="text-emerald-100/60 text-xs mt-1 text-center">
                  Enter the 6-digit code sent to{" "}
                  <Text className="text-emerald-400 font-semibold">
                    {forgotEmail || "your email"}
                  </Text>
                </Text>
              </>
            )}

            {authStep === "forgot_new_password" && (
              <>
                <Text className="text-2xl font-bold text-white tracking-tight">
                  Create New Password
                </Text>
                <Text className="text-emerald-100/60 text-xs mt-1 text-center">
                  Your new password must be different from previous ones
                </Text>
              </>
            )}
          </View>

          {/* Success Banner if returned from reset */}
          {successMessage && authStep === "login" && (
            <View className="mb-4 bg-emerald-500/15 border border-emerald-400/40 rounded-xl px-4 py-2.5 flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#34D399"
                style={{ marginRight: 8 }}
              />
              <Text className="text-emerald-300 text-xs font-medium flex-1">
                {successMessage}
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {errorMessage && authStep === "login" && (
            <View className="mb-4 bg-red-500/15 border border-red-400/40 rounded-xl px-4 py-2.5 flex-row items-center">
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
            {/* Top Back Button for Forgot Password Steps */}
            {authStep !== "login" && (
              <TouchableOpacity
                onPress={() => {
                  if (authStep === "forgot_email") setAuthStep("login");
                  if (authStep === "forgot_otp") setAuthStep("forgot_email");
                  if (authStep === "forgot_new_password")
                    setAuthStep("forgot_otp");
                }}
                activeOpacity={0.7}
                className="flex-row items-center mb-3.5 self-start"
              >
                <Ionicons
                  name="arrow-back"
                  size={16}
                  color="#34D399"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-emerald-400 text-xs font-semibold">
                  {authStep === "forgot_email"
                    ? "Back to Login"
                    : "Previous Step"}
                </Text>
              </TouchableOpacity>
            )}

            {/* -------------------- 1. LOGIN STEP -------------------- */}
            {authStep === "login" && (
              <>
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
                <View className="mb-2">
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

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={() => {
                    setSuccessMessage("");
                    setForgotEmail(email); // prefill if already typed
                    setAuthStep("forgot_email");
                  }}
                  activeOpacity={0.7}
                  className="self-end mb-4"
                >
                  <Text className="text-emerald-400 text-xs font-semibold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleLogin}
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
                      Sign In
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-[1px] bg-emerald-500/20" />
                  <Text className="text-emerald-200/50 text-[10px] font-medium px-2.5 uppercase tracking-wider">
                    Or continue with
                  </Text>
                  <View className="flex-1 h-[1px] bg-emerald-500/20" />
                </View>

                {/* Google Account Login */}
                <TouchableOpacity
                  onPress={handleGoogleLogin}
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
                  <Ionicons
                    name="logo-google"
                    size={18}
                    color="#34D399"
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: "#D1FAE5",
                      fontWeight: "600",
                      fontSize: 13,
                    }}
                  >
                    Google Account
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* -------------------- 2. FORGOT PASSWORD - STEP 1: EMAIL -------------------- */}
            {authStep === "forgot_email" && (
              <>
                <View className="mb-4">
                  <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                    Registered Email
                  </Text>
                  <View
                    style={{
                      borderColor: forgotEmailFocused
                        ? "#34D399"
                        : "rgba(16, 185, 129, 0.25)",
                    }}
                    className="flex-row items-center bg-[#021812]/80 border rounded-xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={forgotEmailFocused ? "#34D399" : "#6EE7B7"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      onFocus={() => setForgotEmailFocused(true)}
                      onBlur={() => setForgotEmailFocused(false)}
                      placeholder="name@example.com"
                      placeholderTextColor="rgba(110, 231, 183, 0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-white text-sm font-medium"
                    />
                  </View>
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  onPress={handleSendOtp}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: 8,
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
                      Send OTP Code
                    </Text>
                    <Ionicons name="arrow-forward" size={16} color="#011B13" />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* -------------------- 3. FORGOT PASSWORD - STEP 2: 6-DIGIT OTP -------------------- */}
            {authStep === "forgot_otp" && (
              <>
                <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Code
                </Text>

                {/* 6 OTP Input Boxes */}
                <View className="flex-row justify-between mb-4">
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => (otpRefs.current[index] = ref)}
                      value={digit}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleOtpKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      style={{
                        width: 42,
                        height: 48,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#FFFFFF",
                        backgroundColor: "rgba(2, 24, 18, 0.9)",
                        borderRadius: 10,
                        borderWidth: 1.5,
                        borderColor: digit
                          ? "#34D399"
                          : "rgba(16, 185, 129, 0.25)",
                      }}
                    />
                  ))}
                </View>

                {/* Resend Code Section */}
                <View className="flex-row items-center justify-center mb-4">
                  <Text className="text-emerald-100/60 text-xs">
                    Didn't receive code?{" "}
                  </Text>
                  {canResend ? (
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      activeOpacity={0.7}
                    >
                      <Text className="text-emerald-400 font-bold text-xs">
                        Resend Code
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text className="text-emerald-400/80 font-semibold text-xs">
                      Resend in {timer}s
                    </Text>
                  )}
                </View>

                {/* Verify OTP Button */}
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: 8,
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
                      Verify Code
                    </Text>
                    <Ionicons
                      name="shield-checkmark"
                      size={16}
                      color="#011B13"
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* -------------------- 4. FORGOT PASSWORD - STEP 3: NEW PASSWORD -------------------- */}
            {authStep === "forgot_new_password" && (
              <>
                {/* New Password */}
                <View className="mb-3">
                  <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                    New Password
                  </Text>
                  <View
                    style={{
                      borderColor: newPasswordFocused
                        ? "#34D399"
                        : "rgba(16, 185, 129, 0.25)",
                    }}
                    className="flex-row items-center bg-[#021812]/80 border rounded-xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={newPasswordFocused ? "#34D399" : "#6EE7B7"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      onFocus={() => setNewPasswordFocused(true)}
                      onBlur={() => setNewPasswordFocused(false)}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(110, 231, 183, 0.4)"
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-white text-sm font-medium"
                    />
                    <TouchableOpacity
                      onPress={() => setShowNewPassword(!showNewPassword)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={
                          showNewPassword ? "eye-off-outline" : "eye-outline"
                        }
                        size={18}
                        color="rgba(110, 231, 183, 0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm New Password */}
                <View className="mb-4">
                  <Text className="text-emerald-200/80 text-[11px] font-semibold uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </Text>
                  <View
                    style={{
                      borderColor: confirmNewPasswordFocused
                        ? "#34D399"
                        : "rgba(16, 185, 129, 0.25)",
                    }}
                    className="flex-row items-center bg-[#021812]/80 border rounded-xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color={confirmNewPasswordFocused ? "#34D399" : "#6EE7B7"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
                      onFocus={() => setConfirmNewPasswordFocused(true)}
                      onBlur={() => setConfirmNewPasswordFocused(false)}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(110, 231, 183, 0.4)"
                      secureTextEntry={!showConfirmNewPassword}
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-white text-sm font-medium"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmNewPassword(!showConfirmNewPassword)
                      }
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={
                          showConfirmNewPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={18}
                        color="rgba(110, 231, 183, 0.7)"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  onPress={handleResetPassword}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    marginBottom: 8,
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
                      Reset Password
                    </Text>
                    <Ionicons name="checkmark-done" size={16} color="#011B13" />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer - Switch to Register (Shown in login mode) */}
          {authStep === "login" && (
            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-emerald-100/60 text-xs">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate("Register")}
                activeOpacity={0.7}
              >
                <Text className="text-emerald-400 font-bold text-xs">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
