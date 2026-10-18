import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

const SUGGESTED_CATEGORIES = [
  { name: "Food & Dining", emoji: "🍕" },
  { name: "Shopping", emoji: "🛍️" },
  { name: "Transportation", emoji: "🚙" },
  { name: "Grocery", emoji: "🛒" },
  { name: "Entertainment", emoji: "🍿" },
  { name: "Bills & Utilities", emoji: "💡" },
  { name: "Health & Care", emoji: "💊" },
  { name: "Travel", emoji: "✈️" },
  { name: "Fitness", emoji: "🏋️" },
  { name: "Education", emoji: "📚" },
  { name: "Personal Care", emoji: "✨" },
  { name: "Gifts & Charity", emoji: "🎁" },
];

const EMOJI_PALETTE = [
  "🍕", "🛍️", "🚙", "🛒", "🍿", "💊",
  "☕", "🎮", "✈️", "💡", "🏋️", "📚",
  "🍔", "🚕", "👗", "🎁", "🏠", "⚡",
  "🎬", "🩺", "📱", "🥗", "💳", "✨",
];

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export default function RecieptModalScreen({
  navigation,
  route,
  onClose,
  onAddCategory,
}) {
  const { isDarkMode, colors } = useTheme();

  const [categoryName, setCategoryName] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🍕");
  const [budgetAmount, setBudgetAmount] = useState("");

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate("Receipts");
    }
  };

  const handleSelectSuggested = (cat) => {
    setCategoryName(cat.name);
    setSelectedEmoji(cat.emoji);
  };

  const addQuickAmount = (val) => {
    const current = parseFloat(budgetAmount) || 0;
    setBudgetAmount((current + val).toString());
  };

  const setExactAmount = (val) => {
    setBudgetAmount(val.toString());
  };

  const handleCreateCategory = () => {
    const trimmedName = categoryName.trim();
    const numericBudget = parseFloat(budgetAmount);

    if (!trimmedName) {
      Alert.alert(
        "Category Name Required",
        "Please enter or select a category name.",
      );
      return;
    }

    if (!budgetAmount || isNaN(numericBudget) || numericBudget <= 0) {
      Alert.alert(
        "Budget Amount Required",
        "Please enter how much amount to assign to this category.",
      );
      return;
    }

    const newCategory = {
      id: "cat_" + Date.now(),
      name: trimmedName,
      emoji: selectedEmoji,
      budget: numericBudget,
      spent: "₹0",
      spentAmount: 0,
      percentage: "0%",
      progress: 0,
      progressColor: "#10B981",
      leftAmount: `₹${numericBudget.toLocaleString()} Left`,
    };

    if (onAddCategory) {
      onAddCategory(newCategory);
    } else if (route?.params?.onAddCategory) {
      route.params.onAddCategory(newCategory);
    }

    if (navigation?.navigate) {
      navigation.navigate({
        name: "Receipts",
        params: { newCategory },
        merge: true,
      });
    }

    Alert.alert(
      "Category Created! ✨",
      `"${trimmedName}" category created with budget of ₹${numericBudget.toLocaleString()}.`,
      [
        {
          text: "OK",
          onPress: handleClose,
        },
      ],
    );
  };

  const parsedBudget = parseFloat(budgetAmount) || 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={colors.statusBarStyle}
        translucent
        backgroundColor="transparent"
      />

      {/* Atmospheric Soft Sage Gradient */}
      <LinearGradient
        colors={
          isDarkMode
            ? ["#021F17", "#03261C", "#021A13"]
            : ["#A1C4B5", "#B5D4C7", "#CBE3D7", "#DFEFE7", "#EEF4F1"]
        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headerGradient}
      />

      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleClose}
          activeOpacity={0.8}
          style={[
            styles.headerIconButton,
            {
              backgroundColor: isDarkMode
                ? "#04281E"
                : "rgba(184, 215, 202, 0.7)",
              borderColor: isDarkMode ? colors.cardBorder : "transparent",
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
        >
          <Ionicons
            name="close"
            size={22}
            color={isDarkMode ? "#E2F2EB" : "#1F382C"}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          Create Category
        </Text>

        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Category Live Preview Card */}
        <View
          style={[
            styles.previewCard,
            {
              backgroundColor: colors.card,
              borderColor: isDarkMode
                ? "rgba(16, 185, 129, 0.3)"
                : "rgba(16, 185, 129, 0.2)",
            },
          ]}
        >
          <View style={styles.previewHeaderRow}>
            <View
              style={[
                styles.previewEmojiBox,
                {
                  backgroundColor: isDarkMode ? "#021A13" : "#E8F5E9",
                  borderColor: isDarkMode
                    ? "rgba(16, 185, 129, 0.3)"
                    : "#C8E6C9",
                },
              ]}
            >
              <Text style={styles.previewEmojiText}>{selectedEmoji}</Text>
            </View>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={[
                  styles.previewCategoryName,
                  { color: colors.textPrimary },
                ]}
                numberOfLines={1}
              >
                {categoryName.trim() || "New Category"}
              </Text>
              <Text
                style={[
                  styles.previewSubtext,
                  { color: isDarkMode ? "#34D399" : "#0F4634" },
                ]}
              >
                Assigned Budget: ₹
                {parsedBudget > 0 ? parsedBudget.toLocaleString() : "0"}
              </Text>
            </View>

            <View
              style={[
                styles.previewBadge,
                {
                  backgroundColor: isDarkMode
                    ? "rgba(16, 185, 129, 0.15)"
                    : "#DCFCE7",
                },
              ]}
            >
              <Text
                style={[
                  styles.previewBadgeText,
                  { color: isDarkMode ? "#34D399" : "#15803D" },
                ]}
              >
                ₹0 Spent
              </Text>
            </View>
          </View>

          {/* Progress Bar preview */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: isDarkMode ? "#021A13" : "#F1F5F9" },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: "0%",
                    backgroundColor: isDarkMode ? "#10B981" : "#0F4634",
                  },
                ]}
              />
            </View>
            <View style={styles.progressLabelsRow}>
              <Text
                style={[styles.progressLabelText, { color: colors.textMuted }]}
              >
                0% Used
              </Text>
              <Text
                style={[
                  styles.progressLabelText,
                  { color: isDarkMode ? "#34D399" : "#0F4634" },
                ]}
              >
                ₹{parsedBudget > 0 ? parsedBudget.toLocaleString() : "0"} Left
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Category Name Input Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            CATEGORY NAME
          </Text>

          <View
            style={[
              styles.inputBox,
              isDarkMode && {
                backgroundColor: "#021A13",
                borderColor: "rgba(16, 185, 129, 0.25)",
              },
            ]}
          >
            <View
              style={[
                styles.inputEmojiCircle,
                { backgroundColor: isDarkMode ? "#04281E" : "#F4F7F5" },
              ]}
            >
              <Text style={{ fontSize: 20 }}>{selectedEmoji}</Text>
            </View>
            <TextInput
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="e.g. Dining, Shopping, Health"
              placeholderTextColor={isDarkMode ? "#52796F" : "#94A3B8"}
              style={[styles.textInput, { color: colors.textPrimary }]}
              maxLength={30}
            />
            {categoryName.length > 0 && (
              <TouchableOpacity
                onPress={() => setCategoryName("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={isDarkMode ? "#52796F" : "#94A3B8"}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Suggested Category Chips */}
          <Text
            style={[
              styles.subSectionLabel,
              { color: colors.textMuted, marginTop: 14 },
            ]}
          >
            QUICK SUGGESTIONS
          </Text>
          <View style={styles.chipsWrap}>
            {SUGGESTED_CATEGORIES.map((cat) => {
              const isSelected =
                categoryName.trim().toLowerCase() === cat.name.toLowerCase();
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => handleSelectSuggested(cat)}
                  activeOpacity={0.7}
                  style={[
                    styles.suggestedChip,
                    isSelected && styles.suggestedChipActive,
                    isDarkMode && {
                      backgroundColor: isSelected
                        ? "rgba(16, 185, 129, 0.25)"
                        : "#021A13",
                      borderColor: isSelected
                        ? "#34D399"
                        : "rgba(16, 185, 129, 0.2)",
                    },
                  ]}
                >
                  <Text style={styles.suggestedChipEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.suggestedChipText,
                      isSelected && styles.suggestedChipTextActive,
                      isDarkMode && {
                        color: isSelected ? "#FFFFFF" : "#8EB7A4",
                      },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Choose Icon / Emoji Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            CATEGORY ICON
          </Text>

          <View style={styles.emojiGrid}>
            {EMOJI_PALETTE.map((emoji) => {
              const isSelected = selectedEmoji === emoji;
              return (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => setSelectedEmoji(emoji)}
                  activeOpacity={0.7}
                  style={[
                    styles.emojiGridItem,
                    isSelected && styles.emojiGridItemActive,
                    isDarkMode && {
                      backgroundColor: isSelected
                        ? "rgba(16, 185, 129, 0.25)"
                        : "#021A13",
                      borderColor: isSelected
                        ? "#34D399"
                        : "rgba(16, 185, 129, 0.15)",
                    },
                  ]}
                >
                  <Text style={styles.emojiGridText}>{emoji}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 3. Assigned Budget Amount Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
        >
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
            ASSIGNED BUDGET AMOUNT
          </Text>

          <View style={styles.amountInputRow}>
            <Text
              style={[
                styles.currencyPrefix,
                { color: isDarkMode ? "#34D399" : "#0F4634" },
              ]}
            >
              ₹
            </Text>
            <TextInput
              value={budgetAmount}
              onChangeText={setBudgetAmount}
              placeholder="0"
              placeholderTextColor={isDarkMode ? "#52796F" : "#94A3B8"}
              keyboardType="numeric"
              style={[styles.amountTextInput, { color: colors.textPrimary }]}
              maxLength={8}
            />
          </View>

          {/* Quick Increment Chips */}
          <View
            style={[
              styles.quickAmountsRow,
              {
                borderTopColor: isDarkMode
                  ? "rgba(255, 255, 255, 0.08)"
                  : "#F1F5F9",
              },
            ]}
          >
            {QUICK_AMOUNTS.map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => addQuickAmount(val)}
                activeOpacity={0.7}
                style={[
                  styles.quickAmountChip,
                  isDarkMode && {
                    backgroundColor: "#021A13",
                    borderWidth: 1,
                    borderColor: "rgba(16, 185, 129, 0.25)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    isDarkMode && { color: "#34D399" },
                  ]}
                >
                  +₹{val >= 1000 ? `${val / 1000}k` : val}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Save / Create Category Button */}
        <TouchableOpacity
          onPress={handleCreateCategory}
          activeOpacity={0.85}
          style={styles.createButtonWrapper}
        >
          <LinearGradient
            colors={
              isDarkMode ? ["#10B981", "#059669"] : ["#0F4634", "#155E45"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.createButtonGradient}
          >
            <Ionicons
              name="add-circle"
              size={22}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.createButtonText}>Create Category</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
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
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 60,
  },
  previewCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  previewHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  previewEmojiBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  previewEmojiText: {
    fontSize: 26,
  },
  previewCategoryName: {
    fontSize: 18,
    fontWeight: "700",
  },
  previewSubtext: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2,
  },
  previewBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressContainer: {
    marginTop: 14,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  progressLabelText: {
    fontSize: 12,
    fontWeight: "600",
  },
  card: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  subSectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputEmojiCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    padding: 0,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestedChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  suggestedChipActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#10B981",
  },
  suggestedChipEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  suggestedChipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
  },
  suggestedChipTextActive: {
    color: "#0F4634",
    fontWeight: "700",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  emojiGridItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emojiGridItemActive: {
    backgroundColor: "#DCFCE7",
    borderColor: "#10B981",
    borderWidth: 2,
    transform: [{ scale: 1.08 }],
  },
  emojiGridText: {
    fontSize: 22,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  currencyPrefix: {
    fontSize: 36,
    fontWeight: "800",
    marginRight: 6,
  },
  amountTextInput: {
    fontSize: 40,
    fontWeight: "800",
    minWidth: 140,
    textAlign: "center",
    padding: 0,
  },
  quickAmountsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 14,
    marginTop: 10,
    gap: 8,
  },
  quickAmountChip: {
    flex: 1,
    backgroundColor: "#F8FAF9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F4634",
  },
  createButtonWrapper: {
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#0F4634",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 6,
  },
  createButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
});
