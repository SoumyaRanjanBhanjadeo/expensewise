import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  // User Profile State
  const [name, setName] = useState(user?.username || "ExpenseWise User");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Preference Toggles
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (user?.username) {
      setName(user.username);
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const val = await AsyncStorage.getItem("@expensewise_biometrics");
        if (val !== null) {
          setBiometricsEnabled(val === "true");
        }
        if (!user) {
          const lastUserRaw = await AsyncStorage.getItem(
            "@expensewise_last_user",
          );
          if (lastUserRaw) {
            const lastUser = JSON.parse(lastUserRaw);
            if (lastUser?.username) setName(lastUser.username);
            if (lastUser?.email) setEmail(lastUser.email);
          }
        }
      } catch (e) {
        console.warn("Error loading biometric preference:", e);
      }
    })();
  }, [user]);

  const handleToggleBiometrics = async (value) => {
    setBiometricsEnabled(value);
    try {
      await AsyncStorage.setItem("@expensewise_biometrics", String(value));
    } catch (e) {
      console.warn("Error saving biometric preference:", e);
    }
  };

  // Calculate Password Strength
  const getPasswordStrength = () => {
    if (!newPassword) return null;
    if (newPassword.length < 6)
      return { label: "Too Weak", color: "#EF4444", progress: 0.25 };
    if (newPassword.length < 9)
      return { label: "Good", color: "#F59E0B", progress: 0.65 };
    return { label: "Strong", color: "#10B981", progress: 1.0 };
  };

  const strength = getPasswordStrength();

  const handleUpdatePassword = () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter your current password.");
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Error",
        "New password and confirmation password do not match.",
      );
      return;
    }

    Alert.alert(
      "Password Changed! 🔒",
      "Your password has been successfully updated.",
      [
        {
          text: "OK",
          onPress: () => {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
          },
        },
      ],
    );
  };

  const handleSaveProfile = () => {
    setIsEditingInfo(false);
    Alert.alert("Profile Saved", "Your profile details have been updated.");
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of ExpenseWise?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          navigation?.reset({
            index: 0,
            routes: [{ name: "Login" }],
          });
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Atmospheric Soft Sage Gradient covering the top header */}
      <LinearGradient
        colors={["#A1C4B5", "#B5D4C7", "#CBE3D7", "#DFEFE7", "#EEF4F1"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.8}
          style={styles.headerIconButton}
        >
          <Ionicons name="arrow-back" size={20} color="#1F382C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          onPress={() => {
            if (isEditingInfo) {
              handleSaveProfile();
            } else {
              setIsEditingInfo(true);
            }
          }}
          activeOpacity={0.8}
          style={styles.headerIconButton}
        >
          <Ionicons
            name={isEditingInfo ? "checkmark" : "create-outline"}
            size={20}
            color="#1F382C"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* User Profile Card */}
        <View style={styles.profileCard}>
          {/* Avatar with Camera Badge */}
          <View style={styles.avatarWrapper}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarFallback]}>
                <Ionicons name="person" size={40} color="#0F4634" />
              </View>
            )}
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.avatarCameraBadge}
              onPress={() =>
                Alert.alert("Change Photo", "Avatar upload coming soon!")
              }
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Name & Email */}
          {isEditingInfo ? (
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.editNameInput}
              placeholder="Full Name"
            />
          ) : (
            <Text style={styles.profileName}>{name}</Text>
          )}

          <Text style={styles.profileEmail}>{email}</Text>
        </View>

        {/* Account Quick Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statValue}>₹18,420</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statValue}>34</Text>
            <Text style={styles.statLabel}>Receipts</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCol}>
            <Text style={styles.statValue}>24%</Text>
            <Text style={styles.statLabel}>Savings Rate</Text>
          </View>
        </View>

        {/* Personal Details Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            <TouchableOpacity
              onPress={() => setIsEditingInfo(!isEditingInfo)}
              activeOpacity={0.7}
            >
              <Text style={styles.editSectionBtnText}>
                {isEditingInfo ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Field */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="person-outline" size={18} color="#0F4634" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Full Name</Text>
              {isEditingInfo ? (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={styles.infoInput}
                />
              ) : (
                <Text style={styles.infoValue}>{name}</Text>
              )}
            </View>
          </View>

          {/* Currency Field */}
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoIconCircle}>
              <Ionicons name="cash-outline" size={18} color="#0F4634" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Currency</Text>
              <Text style={styles.infoValue}>₹ INR - Indian Rupee</Text>
            </View>
          </View>
        </View>

        {/* Change Password Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={[styles.infoIconCircle, { marginRight: 8 }]}>
                <Ionicons name="key-outline" size={18} color="#0F4634" />
              </View>
              <Text style={styles.sectionTitle}>Change Password</Text>
            </View>
          </View>

          {/* Current Password Field */}
          <View style={styles.passwordFieldWrapper}>
            <Text style={styles.passwordInputLabel}>Current Password</Text>
            <View style={styles.passwordInputRow}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showCurrentPass}
                style={styles.passwordTextInput}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPass(!showCurrentPass)}
                activeOpacity={0.7}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showCurrentPass ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password Field */}
          <View style={styles.passwordFieldWrapper}>
            <Text style={styles.passwordInputLabel}>New Password</Text>
            <View style={styles.passwordInputRow}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showNewPass}
                style={styles.passwordTextInput}
              />
              <TouchableOpacity
                onPress={() => setShowNewPass(!showNewPass)}
                activeOpacity={0.7}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showNewPass ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Meter */}
            {strength && (
              <View style={styles.strengthMeterContainer}>
                <View style={styles.strengthBarBg}>
                  <View
                    style={[
                      styles.strengthBarFill,
                      {
                        width: `${strength.progress * 100}%`,
                        backgroundColor: strength.color,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: strength.color }]}>
                  {strength.label}
                </Text>
              </View>
            )}
          </View>

          {/* Confirm Password Field */}
          <View style={styles.passwordFieldWrapper}>
            <Text style={styles.passwordInputLabel}>Confirm New Password</Text>
            <View style={styles.passwordInputRow}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter new password"
                placeholderTextColor="#94A3B8"
                secureTextEntry={!showConfirmPass}
                style={styles.passwordTextInput}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPass(!showConfirmPass)}
                activeOpacity={0.7}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showConfirmPass ? "eye-off-outline" : "eye-outline"}
                  size={19}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && newPassword === confirmPassword && (
              <View style={styles.passwordMatchNotice}>
                <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                <Text style={styles.passwordMatchText}>Passwords match</Text>
              </View>
            )}
          </View>

          {/* Update Password Action Button */}
          <TouchableOpacity
            onPress={handleUpdatePassword}
            activeOpacity={0.85}
            style={styles.updatePassBtn}
          >
            <LinearGradient
              colors={["#10B981", "#059669", "#047857"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.updatePassGradient}
            >
              <Ionicons
                name="shield-checkmark"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.updatePassBtnText}>Update Password</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Preferences & Security Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {/* Biometrics Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <View style={styles.infoIconCircle}>
                <Ionicons
                  name="finger-print-outline"
                  size={19}
                  color="#0F4634"
                />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Biometric Lock</Text>
                <Text style={styles.toggleSubtitle}>
                  Require FaceID or Fingerprint
                </Text>
              </View>
            </View>
            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
              thumbColor={biometricsEnabled ? "#10B981" : "#F8FAFC"}
            />
          </View>

          {/* Notifications Toggle */}
          <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
            <View style={styles.toggleLeft}>
              <View style={styles.infoIconCircle}>
                <Ionicons
                  name="notifications-outline"
                  size={19}
                  color="#0F4634"
                />
              </View>
              <View>
                <Text style={styles.toggleTitle}>Expense Reminders</Text>
                <Text style={styles.toggleSubtitle}>
                  Daily budget alert notifications
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#CBD5E1", true: "#86EFAC" }}
              thumbColor={notificationsEnabled ? "#10B981" : "#F8FAFC"}
            />
          </View>
        </View>

        {/* Log Out Button */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={styles.logoutButton}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="#EF4444"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {/* Version Footer */}
        <Text style={styles.versionFooterText}>
          ExpenseWise • Version 1.0.0
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4F1",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 14,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(184, 215, 202, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 4,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#10B981",
  },
  avatarFallback: {
    backgroundColor: "#E6F4EE",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarCameraBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0F4634",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  editNameInput: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    borderBottomWidth: 1.5,
    borderBottomColor: "#10B981",
    paddingVertical: 2,
    paddingHorizontal: 8,
    marginBottom: 4,
    textAlign: "center",
  },
  profileEmail: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginBottom: 12,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0F4634",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  proBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  statsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  statCol: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#E2E8F0",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  editSectionBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F4634",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E6F4EE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  infoInput: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    borderBottomWidth: 1,
    borderBottomColor: "#10B981",
    paddingVertical: 1,
  },
  passwordFieldWrapper: {
    marginBottom: 14,
  },
  passwordInputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
  },
  passwordInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  passwordTextInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
    padding: 0,
  },
  eyeBtn: {
    padding: 6,
  },
  strengthMeterContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  strengthBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
    marginRight: 8,
  },
  strengthBarFill: {
    height: "100%",
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  passwordMatchNotice: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  passwordMatchText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#10B981",
    marginLeft: 4,
  },
  updatePassBtn: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 6,
  },
  updatePassGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  updatePassBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  toggleSubtitle: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    paddingVertical: 15,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  logoutButtonText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "700",
  },
  versionFooterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 20,
  },
});
