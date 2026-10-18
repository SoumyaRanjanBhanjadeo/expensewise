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
import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import {
  forgotPassword,
  verifyOtp,
  resetPassword,
  getToken,
  getErrorMessage,
} from "../services/auth";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginScreen({ navigation, route }) {
  const { login, googleLogin, biometricLogin } = useAuth();

  // Step state: "login" | "forgot_email" | "forgot_otp" | "forgot_new_password"
  const [authStep, setAuthStep] = useState("login");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Loading state for Google login and normal login
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Login states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Biometric states
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricEnrolled, setBiometricEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState("fingerprint"); // "face" | "fingerprint"
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricsEnabled, setIsBiometricsEnabled] = useState(true);

  // Read params passed from registration
  useEffect(() => {
    if (route?.params?.registeredEmail) {
      setEmail(route.params.registeredEmail);
    }
    if (route?.params?.successMessage) {
      setSuccessMessage(route.params.successMessage);
      setErrorMessage("");
    }
  }, [route?.params]);

  // Automatically clear error messages after 3 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Automatically clear success messages after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Load biometrics preference and re-check whenever LoginScreen gains focus
  useEffect(() => {
    checkBiometrics();
    loadBiometricsPreference();

    const unsubscribe = navigation?.addListener?.("focus", () => {
      loadBiometricsPreference();
      checkBiometrics();
    });

    return unsubscribe;
  }, [navigation]);

  const loadBiometricsPreference = async () => {
    try {
      const savedPref = await AsyncStorage.getItem("@expensewise_biometrics");
      if (savedPref === "false") {
        setIsBiometricsEnabled(false);
      } else {
        setIsBiometricsEnabled(true);
      }
    } catch (e) {
      setIsBiometricsEnabled(true);
    }
  };

  const checkBiometrics = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      setBiometricSupported(hasHardware);

      if (hasHardware) {
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        setBiometricEnrolled(isEnrolled);

        const types =
          await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (
          types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          )
        ) {
          setBiometricType("face");
        } else {
          setBiometricType("fingerprint");
        }
      }
    } catch (err) {
      console.warn("Biometrics check error:", err);
    }
  };

  const handleBiometricLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsAuthenticating(true);

    try {
      // Check stored preference from Profile settings
      const savedPref = await AsyncStorage.getItem("@expensewise_biometrics");
      if (savedPref === "false") {
        Alert.alert(
          "Biometrics Disabled",
          "Biometric login is currently disabled in your Profile settings. Please enable it in Settings or sign in using your password.",
        );
        setIsAuthenticating(false);
        return;
      }

      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      // If hardware or enrollment is not available on this device/emulator, provide demo option
      if (!hasHw || !isEnrolled) {
        Alert.alert(
          "Biometric Authentication",
          `Biometric hardware or registered ${
            biometricType === "face" ? "Face ID" : "Fingerprint"
          } was not detected on this device.\n\nWould you like to simulate a successful biometric login?`,
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setIsAuthenticating(false),
            },
            {
              text: "Simulate Login",
              onPress: async () => {
                setSuccessMessage("Biometric verified! Signing in...");
                try {
                  const lastUserRaw = await AsyncStorage.getItem(
                    "@expensewise_last_user",
                  );
                  const lastUser = lastUserRaw ? JSON.parse(lastUserRaw) : null;
                  const targetEmail = email.trim() || lastUser?.email;
                  await biometricLogin(targetEmail);
                } catch (e) {
                  console.warn("Biometric backend sign-in note:", e);
                }
                setTimeout(() => {
                  navigation?.replace("Dashboard");
                }, 350);
              },
            },
          ],
        );
        return;
      }

      const promptMsg =
        biometricType === "face"
          ? "Scan your face to unlock ExpenseWise"
          : "Scan your fingerprint to unlock ExpenseWise";

      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMsg,
        cancelLabel: "Cancel",
        fallbackLabel: "Use Password",
        disableDeviceFallback: false,
      });

      if (authResult.success) {
        setSuccessMessage("Biometric verified! Signing in...");

        try {
          const lastUserRaw = await AsyncStorage.getItem(
            "@expensewise_last_user",
          );
          const lastUser = lastUserRaw ? JSON.parse(lastUserRaw) : null;
          const targetEmail = email.trim() || lastUser?.email;
          await biometricLogin(targetEmail);
        } catch (e) {
          console.warn("Biometric backend sign-in note:", e);
        }

        setTimeout(() => {
          navigation?.replace("Dashboard");
        }, 300);
      } else {
        if (
          authResult.error !== "user_cancel" &&
          authResult.error !== "app_cancel"
        ) {
          setErrorMessage(
            "Biometric verification was not recognized. Please try again or use your password.",
          );
        }
      }
    } catch (err) {
      console.warn("Biometrics error:", err);
      setErrorMessage(
        "Biometric login encountered an issue. Please enter your password.",
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    // Both fields are needed to reach the backend
    if (!email.trim() || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigation?.replace("Dashboard");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Wrong credentials. Please check your email and password and try again.",
        ),
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    setSuccessMessage("");
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
        { showInRecents: true },
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
              },
            );
            if (res.ok) profileData = await res.json();
          } catch (e) {
            console.warn("Could not fetch userinfo via accessToken:", e);
          }
        }

        if ((!profileData || !profileData.email) && idToken) {
          try {
            const res = await fetch(
              `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
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

        setSuccessMessage("Signed in with Google successfully!");
        setTimeout(() => {
          navigation?.replace("Dashboard");
        }, 300);
      }
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Google sign-in could not be completed. Please try again.",
        ),
      );
    } finally {
      setIsGoogleLoading(false);
    }
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

  // Loading states for forgot password flow
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

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

  const handleResendOtp = async () => {
    setErrorMessage("");
    setOtp(["", "", "", "", "", ""]);
    setCanResend(false);
    otpRefs.current[0]?.focus();
    setIsSendingOtp(true);

    try {
      await forgotPassword(forgotEmail.trim().toLowerCase());
      setTimer(30);
    } catch (error) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (
        status === 404 ||
        serverMessage?.toLowerCase()?.includes("no account") ||
        serverMessage?.toLowerCase()?.includes("not found")
      ) {
        setErrorMessage(
          serverMessage ||
            "There is no account registered with this email address.",
        );
      } else {
        setErrorMessage(
          getErrorMessage(
            error,
            "Failed to resend verification code. Please try again.",
          ),
        );
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage("Please enter your registered email.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setIsSendingOtp(true);
    try {
      await forgotPassword(cleanEmail);
      setTimer(30);
      setCanResend(false);
      setAuthStep("forgot_otp");
    } catch (error) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (
        status === 404 ||
        serverMessage?.toLowerCase()?.includes("no account") ||
        serverMessage?.toLowerCase()?.includes("not found")
      ) {
        setErrorMessage(
          serverMessage ||
            "There is no account registered with this email address.",
        );
      } else {
        setErrorMessage(
          getErrorMessage(
            error,
            "Failed to send verification code. Please try again.",
          ),
        );
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage("");
    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setErrorMessage("Please enter the full 6-digit code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      await verifyOtp(forgotEmail.trim().toLowerCase(), enteredOtp);
      setAuthStep("forgot_new_password");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "That code doesn't look right. Please check it and try again.",
        ),
      );
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    setErrorMessage("");

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("The two passwords do not match.");
      return;
    }

    setIsResettingPassword(true);
    try {
      await resetPassword({
        email: forgotEmail.trim().toLowerCase(),
        otp: otp.join(""),
        password: newPassword,
      });
      setSuccessMessage("Password reset successfully! Please sign in.");
      setAuthStep("login");
      setForgotEmail("");
      setOtp(["", "", "", "", "", ""]);
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setErrorMessage(
        getErrorMessage(
          error,
          "Can't update your password. Please try again in a moment.",
        ),
      );
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <View className="flex-1 bg-[#F4F9F6] relative">
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Subtle ambient light glows */}
      <View className="absolute -top-32 -left-20 w-80 h-80 rounded-full bg-emerald-200/30 blur-3xl pointer-events-none" />
      <View className="absolute top-1/2 -right-24 w-80 h-80 rounded-full bg-teal-200/25 blur-3xl pointer-events-none" />
      <View className="absolute -bottom-20 left-10 w-72 h-72 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

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
                <Text className="text-[26px] font-bold text-[#0F4634] tracking-tight">
                  Welcome
                </Text>
                <Text className="text-[#52796F] text-[13px] mt-1 text-center font-medium">
                  Sign in to keep tracking your financial journey
                </Text>
              </>
            )}

            {authStep === "forgot_email" && (
              <>
                <Text className="text-[26px] font-bold text-[#0F4634] tracking-tight">
                  Reset Password
                </Text>
                <Text className="text-[#52796F] text-[13px] mt-1 text-center font-medium">
                  Enter your registered email to receive a recovery code
                </Text>
              </>
            )}

            {authStep === "forgot_otp" && (
              <>
                <Text className="text-[26px] font-bold text-[#0F4634] tracking-tight">
                  Verify OTP
                </Text>
                <Text className="text-[#52796F] text-[13px] mt-1 text-center font-medium">
                  Enter the 6-digit code sent to{" "}
                  <Text className="text-[#059669] font-bold">
                    {forgotEmail || "your email"}
                  </Text>
                </Text>
              </>
            )}

            {authStep === "forgot_new_password" && (
              <>
                <Text className="text-[26px] font-bold text-[#0F4634] tracking-tight">
                  Create New Password
                </Text>
                <Text className="text-[#52796F] text-[13px] mt-1 text-center font-medium">
                  Your new password must be different from previous ones
                </Text>
              </>
            )}
          </View>

          {/* Success Banner if returned from reset */}
          {successMessage && (
            <View className="mb-4 bg-[#E8F8F2] border border-[#A7E8D0] rounded-2xl px-4 py-3 flex-row items-center shadow-xs">
              <Ionicons
                name="checkmark-circle"
                size={18}
                color="#059669"
                style={{ marginRight: 8 }}
              />
              <Text className="text-[#065F46] text-xs font-semibold flex-1">
                {successMessage}
              </Text>
            </View>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <View className="mb-4 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl px-4 py-3 flex-row items-center shadow-xs">
              <Ionicons
                name="alert-circle"
                size={18}
                color="#DC2626"
                style={{ marginRight: 8 }}
              />
              <Text className="text-[#991B1B] text-xs font-semibold flex-1">
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Form Card */}
          <View className="w-full bg-white border border-[#E3EDE7] rounded-3xl p-6 shadow-md shadow-emerald-950/5">
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
                className="flex-row items-center mb-4 self-start bg-[#EEF5F1] px-3.5 py-1.5 rounded-full"
              >
                <Ionicons
                  name="arrow-back"
                  size={15}
                  color="#0F4634"
                  style={{ marginRight: 4 }}
                />
                <Text className="text-[#0F4634] text-xs font-bold">
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
                <View className="mb-3.5">
                  <Text className="text-[#1F382C] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Email Address
                  </Text>
                  <View
                    style={{
                      borderColor: emailFocused ? "#10B981" : "#DCE7E1",
                      backgroundColor: emailFocused ? "#FFFFFF" : "#F8FAF9",
                    }}
                    className="flex-row items-center border rounded-2xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={emailFocused ? "#10B981" : "#52796F"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      placeholder="name@example.com"
                      placeholderTextColor="#8FA89B"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-[#0F4634] text-sm font-medium"
                    />
                  </View>
                </View>

                {/* Password Field */}
                <View className="mb-2">
                  <Text className="text-[#1F382C] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Password
                  </Text>
                  <View
                    style={{
                      borderColor: passwordFocused ? "#10B981" : "#DCE7E1",
                      backgroundColor: passwordFocused ? "#FFFFFF" : "#F8FAF9",
                    }}
                    className="flex-row items-center border rounded-2xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={passwordFocused ? "#10B981" : "#52796F"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      placeholder="••••••••"
                      placeholderTextColor="#8FA89B"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-[#0F4634] text-sm font-medium"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      activeOpacity={0.7}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={18}
                        color="#52796F"
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
                  <Text className="text-[#059669] text-xs font-bold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                {/* Sign In Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoggingIn}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 16,
                    opacity: isLoggingIn ? 0.7 : 1,
                  }}
                >
                  <LinearGradient
                    colors={["#0F4634", "#155E47"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 13,
                      paddingHorizontal: 16,
                      borderRadius: 14,
                    }}
                  >
                    {isLoggingIn ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "700",
                          fontSize: 15,
                          letterSpacing: 0.3,
                        }}
                      >
                        Sign In
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View className="flex-row items-center mb-4">
                  <View className="flex-1 h-[1px] bg-[#E3EDE7]" />
                  <Text className="text-[#7A998B] text-[10px] font-bold px-2.5 uppercase tracking-wider">
                    Or continue with
                  </Text>
                  <View className="flex-1 h-[1px] bg-[#E3EDE7]" />
                </View>

                {/* Alternative Logins: Google & Biometric Option */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <TouchableOpacity
                    onPress={handleGoogleLogin}
                    disabled={isGoogleLoading || isAuthenticating}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 11,
                      paddingHorizontal: 10,
                      borderRadius: 14,
                      backgroundColor: "#F8FAF9",
                      borderWidth: 1,
                      borderColor: "#DCE7E1",
                    }}
                  >
                    {isGoogleLoading ? (
                      <ActivityIndicator
                        size="small"
                        color="#0F4634"
                        style={{ marginRight: 6 }}
                      />
                    ) : (
                      <Ionicons
                        name="logo-google"
                        size={17}
                        color="#0F4634"
                        style={{ marginRight: 6 }}
                      />
                    )}
                    <Text
                      style={{
                        color: "#0F4634",
                        fontWeight: "700",
                        fontSize: 13,
                      }}
                    >
                      {isGoogleLoading ? "Signing in..." : "Google"}
                    </Text>
                  </TouchableOpacity>

                  {isBiometricsEnabled && (
                    <TouchableOpacity
                      onPress={handleBiometricLogin}
                      activeOpacity={0.8}
                      disabled={isAuthenticating}
                      style={{
                        flex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingVertical: 11,
                        paddingHorizontal: 10,
                        borderRadius: 14,
                        backgroundColor: "#F8FAF9",
                        borderWidth: 1,
                        borderColor: "#DCE7E1",
                      }}
                    >
                      {isAuthenticating ? (
                        <ActivityIndicator
                          size="small"
                          color="#0F4634"
                          style={{ marginRight: 6 }}
                        />
                      ) : (
                        <Ionicons
                          name={
                            biometricType === "face"
                              ? "scan-outline"
                              : "finger-print-outline"
                          }
                          size={17}
                          color="#0F4634"
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text
                        style={{
                          color: "#0F4634",
                          fontWeight: "700",
                          fontSize: 13,
                        }}
                      >
                        {biometricType === "face" ? "Face ID" : "Biometrics"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* -------------------- 2. FORGOT PASSWORD - STEP 1: EMAIL -------------------- */}
            {authStep === "forgot_email" && (
              <>
                <View className="mb-4">
                  <Text className="text-[#1F382C] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Registered Email
                  </Text>
                  <View
                    style={{
                      borderColor: forgotEmailFocused ? "#10B981" : "#DCE7E1",
                      backgroundColor: forgotEmailFocused
                        ? "#FFFFFF"
                        : "#F8FAF9",
                    }}
                    className="flex-row items-center border rounded-2xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="mail-outline"
                      size={18}
                      color={forgotEmailFocused ? "#10B981" : "#52796F"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={forgotEmail}
                      onChangeText={setForgotEmail}
                      onFocus={() => setForgotEmailFocused(true)}
                      onBlur={() => setForgotEmailFocused(false)}
                      placeholder="name@example.com"
                      placeholderTextColor="#8FA89B"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-[#0F4634] text-sm font-medium"
                    />
                  </View>
                </View>

                {/* Send OTP Button */}
                <TouchableOpacity
                  onPress={handleSendOtp}
                  disabled={isSendingOtp}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 8,
                    opacity: isSendingOtp ? 0.7 : 1,
                  }}
                >
                  <LinearGradient
                    colors={["#0F4634", "#155E47"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 13,
                      paddingHorizontal: 16,
                      borderRadius: 14,
                    }}
                  >
                    {isSendingOtp ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text
                        style={{
                          color: "#FFFFFF",
                          fontWeight: "700",
                          fontSize: 15,
                          letterSpacing: 0.3,
                        }}
                      >
                        Send OTP Code
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* -------------------- 3. FORGOT PASSWORD - STEP 2: 6-DIGIT OTP -------------------- */}
            {authStep === "forgot_otp" && (
              <>
                <Text className="text-[#1F382C] text-[11px] font-bold uppercase tracking-wider mb-3 text-center">
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
                        width: 44,
                        height: 50,
                        textAlign: "center",
                        fontSize: 18,
                        fontWeight: "bold",
                        color: "#0F4634",
                        backgroundColor: digit ? "#FFFFFF" : "#F8FAF9",
                        borderRadius: 12,
                        borderWidth: 1.5,
                        borderColor: digit ? "#10B981" : "#DCE7E1",
                      }}
                    />
                  ))}
                </View>

                {/* Resend Code Section */}
                <View className="flex-row items-center justify-center mb-4">
                  <Text className="text-[#52796F] text-xs">
                    Didn't receive code?{" "}
                  </Text>
                  {canResend ? (
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      activeOpacity={0.7}
                    >
                      <Text className="text-[#059669] font-bold text-xs">
                        Resend Code
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <Text className="text-[#52796F] font-semibold text-xs">
                      Resend in {timer}s
                    </Text>
                  )}
                </View>

                {/* Verify OTP Button */}
                <TouchableOpacity
                  onPress={handleVerifyOtp}
                  disabled={isVerifyingOtp}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 8,
                    opacity: isVerifyingOtp ? 0.7 : 1,
                  }}
                >
                  <LinearGradient
                    colors={["#0F4634", "#155E47"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 13,
                      paddingHorizontal: 16,
                      borderRadius: 14,
                    }}
                  >
                    {isVerifyingOtp ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontWeight: "700",
                            fontSize: 15,
                            letterSpacing: 0.3,
                            marginRight: 6,
                          }}
                        >
                          Verify Code
                        </Text>
                        <Ionicons
                          name="shield-checkmark"
                          size={16}
                          color="#FFFFFF"
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {/* -------------------- 4. FORGOT PASSWORD - STEP 3: NEW PASSWORD -------------------- */}
            {authStep === "forgot_new_password" && (
              <>
                {/* New Password */}
                <View className="mb-3.5">
                  <Text className="text-[#1F382C] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    New Password
                  </Text>
                  <View
                    style={{
                      borderColor: newPasswordFocused ? "#10B981" : "#DCE7E1",
                      backgroundColor: newPasswordFocused
                        ? "#FFFFFF"
                        : "#F8FAF9",
                    }}
                    className="flex-row items-center border rounded-2xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={18}
                      color={newPasswordFocused ? "#10B981" : "#52796F"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      onFocus={() => setNewPasswordFocused(true)}
                      onBlur={() => setNewPasswordFocused(false)}
                      placeholder="••••••••"
                      placeholderTextColor="#8FA89B"
                      secureTextEntry={!showNewPassword}
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-[#0F4634] text-sm font-medium"
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
                        color="#52796F"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm New Password */}
                <View className="mb-4">
                  <Text className="text-[#1F382C] text-[11px] font-bold uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </Text>
                  <View
                    style={{
                      borderColor: confirmNewPasswordFocused
                        ? "#10B981"
                        : "#DCE7E1",
                      backgroundColor: confirmNewPasswordFocused
                        ? "#FFFFFF"
                        : "#F8FAF9",
                    }}
                    className="flex-row items-center border rounded-2xl px-3.5 py-2.5"
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color={confirmNewPasswordFocused ? "#10B981" : "#52796F"}
                      style={{ marginRight: 8 }}
                    />
                    <TextInput
                      value={confirmNewPassword}
                      onChangeText={setConfirmNewPassword}
                      onFocus={() => setConfirmNewPasswordFocused(true)}
                      onBlur={() => setConfirmNewPasswordFocused(false)}
                      placeholder="••••••••"
                      placeholderTextColor="#8FA89B"
                      secureTextEntry={!showConfirmNewPassword}
                      autoCapitalize="none"
                      style={{ paddingVertical: 0 }}
                      className="flex-1 text-[#0F4634] text-sm font-medium"
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
                        color="#52796F"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Reset Password Button */}
                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={isResettingPassword}
                  activeOpacity={0.85}
                  style={{
                    borderRadius: 14,
                    overflow: "hidden",
                    marginBottom: 8,
                    opacity: isResettingPassword ? 0.7 : 1,
                  }}
                >
                  <LinearGradient
                    colors={["#0F4634", "#155E47"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 13,
                      paddingHorizontal: 16,
                      borderRadius: 14,
                    }}
                  >
                    {isResettingPassword ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text
                          style={{
                            color: "#FFFFFF",
                            fontWeight: "700",
                            fontSize: 15,
                            letterSpacing: 0.3,
                            marginRight: 6,
                          }}
                        >
                          Reset Password
                        </Text>
                        <Ionicons
                          name="checkmark-done"
                          size={16}
                          color="#FFFFFF"
                        />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Footer - Switch to Register (Shown in login mode) */}
          {authStep === "login" && (
            <View className="flex-row items-center justify-center mt-6">
              <Text className="text-[#52796F] text-xs font-medium">
                Don't have an account?{" "}
              </Text>
              <TouchableOpacity
                onPress={() => navigation?.navigate("Register")}
                activeOpacity={0.7}
              >
                <Text className="text-[#0F4634] font-bold text-xs">
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
