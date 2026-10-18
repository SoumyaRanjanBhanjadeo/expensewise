import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import transactionsData from "../dummy/transactions.json";
import CalendarPickerModal from "../components/CalendarPickerModal";
import Scanner from "../components/Scanner";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

const EMOJI_OPTIONS = [
  "🍕",
  "🛍️",
  "🚙",
  "🛒",
  "🍿",
  "💊",
  "☕",
  "🎮",
  "✈️",
  "💡",
  "🏋️",
  "📚",
  "🍔",
  "🚕",
  "👗",
  "🎁",
];

const PAYMENT_METHODS = ["UPI", "Card", "Cash"];
const QUICK_DATES = ["Today", "Yesterday", "2 Days Ago"];

export default function CategoryDetailScreen({ navigation, route }) {
  const { isDarkMode, colors } = useTheme();

  // Initial category passed via route
  const initialCategory = route?.params?.category || {
    id: "cat_1",
    name: "Food & Beverages",
    emoji: "🍕",
    spent: "₹2450",
    spentAmount: 2450,
    budget: 3000,
    percentage: "81.67%",
    progress: 0.8167,
    progressColor: "#EAB308",
    leftAmount: "₹550 Left",
  };

  // Category State (Editable Name & Budget)
  const [category, setCategory] = useState({
    ...initialCategory,
    budget: initialCategory.budget || 3000,
    name: initialCategory.name || "Category",
    emoji: initialCategory.emoji || "🧾",
    spentAmount: initialCategory.spentAmount || 2450,
  });

  // Day-to-Day Transactions State (Editable & Expandable)
  const [transactions, setTransactions] = useState(() => {
    const list = [];
    if (transactionsData?.groups) {
      for (const group of transactionsData.groups) {
        for (const tx of group.transactions) {
          const isMatch =
            tx.category?.toLowerCase() ===
              initialCategory.name?.toLowerCase() ||
            initialCategory.name
              ?.toLowerCase()
              .includes(tx.category?.toLowerCase()) ||
            tx.category
              ?.toLowerCase()
              .includes(initialCategory.name?.toLowerCase());

          if (isMatch) {
            const num = Math.abs(
              parseFloat(tx.amount?.replace(/[^0-9.]/g, "")) || 0,
            );
            list.push({
              ...tx,
              numericAmount: num,
              groupDate: group.date || "Today",
            });
          }
        }
      }
    }

    // Default sample entries if none matched
    if (list.length === 0) {
      return [
        {
          id: "tx_init_1",
          title: "Initial Spend",
          category: initialCategory.name,
          paymentMethod: "UPI",
          amount: "-₹250.00",
          numericAmount: 250,
          isCredit: false,
          time: "01:30 PM",
          groupDate: "Today",
          emoji: initialCategory.emoji || "🧾",
        },
      ];
    }
    return list;
  });

  // Dynamically calculate spent amount from transactions
  const totalSpent = useMemo(() => {
    return transactions.reduce((sum, tx) => sum + (tx.numericAmount || 0), 0);
  }, [transactions]);

  const budget = category.budget || 3000;
  const remaining = Math.max(budget - totalSpent, 0);
  const percentUsed = Math.min(Math.round((totalSpent / budget) * 100), 100);
  const isNearLimit = percentUsed >= 80;

  // Sync back to RecieptScreen whenever category or transactions change
  const notifyParentScreen = (updatedCatData, newSpent) => {
    const spentVal = newSpent !== undefined ? newSpent : totalSpent;
    const budgetVal = updatedCatData?.budget || budget;
    const newRemaining = Math.max(budgetVal - spentVal, 0);
    const newProgress = Math.min(spentVal / budgetVal, 1);
    const newPercentage = `${Math.round(newProgress * 100)}%`;

    const updatedObject = {
      ...category,
      ...updatedCatData,
      spentAmount: spentVal,
      spent: `₹${spentVal}`,
      budget: budgetVal,
      progress: newProgress,
      percentage: newPercentage,
      leftAmount: `₹${newRemaining} Left`,
    };

    if (route?.params?.onUpdateCategory) {
      route.params.onUpdateCategory(updatedObject);
    }
  };

  // ==========================================
  // MODAL 1: EDIT CATEGORY NAME & BUDGET
  // ==========================================
  const [editCategoryModalVisible, setEditCategoryModalVisible] =
    useState(false);
  const [editName, setEditName] = useState(category.name);
  const [editEmoji, setEditEmoji] = useState(category.emoji);
  const [editBudget, setEditBudget] = useState(category.budget.toString());

  const handleOpenEditCategory = () => {
    setEditName(category.name);
    setEditEmoji(category.emoji);
    setEditBudget(category.budget.toString());
    setEditCategoryModalVisible(true);
  };

  const handleSaveCategory = () => {
    const trimmedName = editName.trim();
    const numBudget = parseFloat(editBudget);

    if (!trimmedName) {
      Alert.alert("Invalid Name", "Please enter a category name.");
      return;
    }
    if (isNaN(numBudget) || numBudget <= 0) {
      Alert.alert(
        "Invalid Budget",
        "Please enter a valid assigned budget amount.",
      );
      return;
    }

    const updated = {
      ...category,
      name: trimmedName,
      emoji: editEmoji,
      budget: numBudget,
    };

    setCategory(updated);
    notifyParentScreen(updated, totalSpent);
    setEditCategoryModalVisible(false);
    Alert.alert(
      "Updated! ✨",
      `Category and assigned budget of ₹${numBudget.toLocaleString()} updated successfully.`,
    );
  };

  // ==========================================
  // MODAL 2: ADD / EDIT DAY-TO-DAY EXPENSE
  // ==========================================
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseDate, setExpenseDate] = useState("Today");
  const [isCustomDate, setIsCustomDate] = useState(false);
  const [calendarModalVisible, setCalendarModalVisible] = useState(false);
  const [expensePayment, setExpensePayment] = useState("UPI");
  const [receiptImage, setReceiptImage] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [previewReceiptUri, setPreviewReceiptUri] = useState(null);

  const parseDateForPicker = (dateStr) => {
    if (!dateStr || dateStr === "Today") return new Date();
    if (dateStr === "Yesterday") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    }
    if (dateStr === "2 Days Ago") {
      const d = new Date();
      d.setDate(d.getDate() - 2);
      return d;
    }
    const parsed = Date.parse(dateStr);
    if (!isNaN(parsed)) return new Date(parsed);
    return new Date();
  };

  const handleOpenAddExpense = () => {
    setEditingExpenseId(null);
    setExpenseTitle("");
    setExpenseAmount("");
    setExpenseDate("Today");
    setIsCustomDate(false);
    setExpensePayment("UPI");
    setReceiptImage(null);
    setExpenseModalVisible(true);
  };

  const handleOpenEditExpense = (tx) => {
    setEditingExpenseId(tx.id);
    setExpenseTitle(tx.title || "");
    setExpenseAmount(tx.numericAmount ? tx.numericAmount.toString() : "0");
    const existingDate = tx.groupDate || "Today";
    const isQuick = QUICK_DATES.includes(existingDate);
    setExpenseDate(existingDate);
    setIsCustomDate(!isQuick);
    setExpensePayment(tx.paymentMethod || "UPI");
    setReceiptImage(tx.imageUri || null);
    setExpenseModalVisible(true);
  };

  const handleOpenCalendar = () => {
    if (Platform.OS === "android" && DateTimePickerAndroid) {
      try {
        DateTimePickerAndroid.open({
          value: parseDateForPicker(expenseDate),
          mode: "date",
          onValueChange: (event, date) => {
            if (date) {
              const day = String(date.getDate()).padStart(2, "0");
              const monthNames = [
                "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
              ];
              const formatted = `${day} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
              setExpenseDate(formatted);
              setIsCustomDate(true);
            }
          },
          onDismiss: () => {
            // User dismissed date picker without selecting
          },
        });
        return;
      } catch (e) {
        // Fallback to our visual CalendarPickerModal
      }
    }
    setCalendarModalVisible(true);
  };

  const handleSaveExpense = () => {
    const numAmount = parseFloat(expenseAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid spending amount.");
      return;
    }
    const titleTrimmed = expenseTitle.trim() || `${category.name} Spend`;
    const finalDate = expenseDate || "Today";

    let updatedList;
    if (editingExpenseId) {
      // Edit existing expense
      updatedList = transactions.map((tx) => {
        if (tx.id === editingExpenseId) {
          return {
            ...tx,
            title: titleTrimmed,
            amount: `-₹${numAmount.toFixed(2)}`,
            numericAmount: numAmount,
            groupDate: finalDate,
            paymentMethod: expensePayment,
            imageUri: receiptImage || null,
          };
        }
        return tx;
      });
    } else {
      // Add new day-to-day expense
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const newTx = {
        id: "tx_" + Date.now(),
        title: titleTrimmed,
        category: category.name,
        paymentMethod: expensePayment,
        amount: `-₹${numAmount.toFixed(2)}`,
        numericAmount: numAmount,
        isCredit: false,
        time: timeStr,
        groupDate: finalDate,
        emoji: category.emoji,
        imageUri: receiptImage || null,
      };
      updatedList = [newTx, ...transactions];
    }

    setTransactions(updatedList);
    const newSpent = updatedList.reduce(
      (sum, tx) => sum + (tx.numericAmount || 0),
      0,
    );
    notifyParentScreen(category, newSpent);
    setExpenseModalVisible(false);
  };

  const handleDeleteExpense = (txId) => {
    Alert.alert(
      "Delete Expense?",
      "Are you sure you want to remove this day-to-day spend entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedList = transactions.filter((tx) => tx.id !== txId);
            setTransactions(updatedList);
            const newSpent = updatedList.reduce(
              (sum, tx) => sum + (tx.numericAmount || 0),
              0,
            );
            notifyParentScreen(category, newSpent);
            if (editingExpenseId === txId) {
              setExpenseModalVisible(false);
            }
          },
        },
      ],
    );
  };

  const handleBack = () => {
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate("Receipts");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        translucent
        backgroundColor="transparent"
      />

      {/* Atmospheric Soft Sage Gradient covering top header */}
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

      {/* Top Header Bar */}
      <View className="flex-row items-center justify-between px-5 pt-[52px] pb-4">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center"
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
            name="arrow-back"
            size={20}
            color={isDarkMode ? "#E2F2EB" : "#1F382C"}
          />
        </TouchableOpacity>

        {/* Header Title */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "700",
            color: colors.textPrimary,
          }}
        >
          Category Details
        </Text>

        {/* Right Header Buttons: Edit Category + Add Expense */}
        <View className="flex-row items-center">
          {/* Edit Category Button */}
          <TouchableOpacity
            onPress={handleOpenEditCategory}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full items-center justify-center mr-2"
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
              name="create-outline"
              size={20}
              color={isDarkMode ? "#34D399" : "#0F4634"}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Card: Category Info & Assigned Budget */}
        <LinearGradient
          colors={
            isDarkMode
              ? ["#053B29", "#084934", "#0C5940"]
              : ["#185F44", "#1E6E4E", "#278962"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.heroCard,
            isDarkMode && {
              borderWidth: 1,
              borderColor: "rgba(16, 185, 129, 0.25)",
            },
          ]}
        >
          {/* Top Row: Emoji Icon + Category Title + Edit Pill */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1 pr-2">
              <View style={styles.heroEmojiCircle}>
                <Text style={{ fontSize: 24 }}>{category.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text style={styles.heroCategoryName}>{category.name}</Text>
              </View>
            </View>
          </View>

          {/* Assigned Budget Amount Display */}
          <View className="mb-4">
            <Text style={styles.heroAmountValue}>
              ₹{budget.toLocaleString()}
            </Text>
            <Text style={styles.heroAmountSub}>
              Allocated amount for this category
            </Text>
          </View>

          {/* Progress Bar with Tooltip */}
          <View className="mb-3">
            <View style={styles.heroProgressTrack}>
              <View
                style={[
                  styles.heroProgressFill,
                  {
                    width: `${percentUsed}%`,
                    backgroundColor: isNearLimit ? "#EF4444" : "#10B981",
                  },
                ]}
              />
            </View>
          </View>

          {/* Quick Metrics Comparison Row */}
          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>SPENT</Text>
              <Text style={styles.heroStatValue}>
                ₹{totalSpent.toLocaleString()}
              </Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>REMAINING</Text>
              <Text style={styles.heroStatValue}>
                ₹{remaining.toLocaleString()}
              </Text>
            </View>

            <View style={styles.heroStatDivider} />

            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>UTILIZED</Text>
              <Text style={styles.heroStatValue}>{percentUsed}%</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Info Tiles */}
        <View className="flex-row justify-between mb-4">
          <View
            style={[
              styles.infoTile,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            <View
              style={[
                styles.infoIconBox,
                { backgroundColor: isDarkMode ? "#021A13" : "#E8F5E9" },
              ]}
            >
              <Ionicons name="receipt-outline" size={18} color="#10B981" />
            </View>
            <Text style={[styles.infoTileTitle, { color: colors.textPrimary }]}>
              {transactions.length}
            </Text>
            <Text style={[styles.infoTileLabel, { color: colors.textMuted }]}>
              Spend Records
            </Text>
          </View>

          <View
            style={[
              styles.infoTile,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            <View
              style={[
                styles.infoIconBox,
                { backgroundColor: isDarkMode ? "#021A13" : "#FEF3C7" },
              ]}
            >
              <Ionicons name="pie-chart-outline" size={18} color="#F59E0B" />
            </View>
            <Text style={[styles.infoTileTitle, { color: colors.textPrimary }]}>
              {percentUsed}%
            </Text>
            <Text style={[styles.infoTileLabel, { color: colors.textMuted }]}>
              Budget Used
            </Text>
          </View>

          <View
            style={[
              styles.infoTile,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            <View
              style={[
                styles.infoIconBox,
                { backgroundColor: isDarkMode ? "#021A13" : "#E0F2FE" },
              ]}
            >
              <Ionicons name="wallet-outline" size={18} color="#0284C7" />
            </View>
            <Text style={[styles.infoTileTitle, { color: colors.textPrimary }]}>
              ₹{remaining}
            </Text>
            <Text style={[styles.infoTileLabel, { color: colors.textMuted }]}>
              Left to Spend
            </Text>
          </View>
        </View>

        {/* Day-to-Day Spendings Section Header */}
        <View className="flex-row items-center justify-between mt-2 mb-3 px-1">
          <View>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "700",
                color: colors.textPrimary,
              }}
            >
              Day-to-Day Spendings
            </Text>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: colors.textMuted,
              }}
            >
              Add or edit expenses in this category
            </Text>
          </View>

          {/* "+ Add Spend" Button */}
          <TouchableOpacity
            onPress={handleOpenAddExpense}
            activeOpacity={0.8}
            style={[
              styles.addSpendBtn,
              { backgroundColor: isDarkMode ? "#10B981" : "#0F4634" },
            ]}
          >
            <Ionicons
              name="add"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.addSpendBtnText}>Add Spend</Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        {transactions.length > 0 ? (
          <View
            style={[
              styles.transactionsCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            {transactions.map((tx, idx) => {
              const isLast = idx === transactions.length - 1;
              return (
                <View
                  key={tx.id || idx}
                  className="flex-row items-center justify-between py-3.5 px-4"
                  style={
                    !isLast
                      ? {
                          borderBottomWidth: 1,
                          borderBottomColor: isDarkMode
                            ? "rgba(255, 255, 255, 0.08)"
                            : "#F3F4F6",
                        }
                      : {}
                  }
                >
                  {/* Left Info: Emoji & Details */}
                  <TouchableOpacity
                    onPress={() => handleOpenEditExpense(tx)}
                    activeOpacity={0.7}
                    className="flex-row items-center flex-1 pr-2"
                  >
                    <View
                      style={[
                        styles.txEmojiBox,
                        isDarkMode && {
                          backgroundColor: "#021A13",
                          borderWidth: 1,
                          borderColor: "rgba(16, 185, 129, 0.2)",
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 18 }}>
                        {tx.emoji || category.emoji}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "700",
                          color: colors.textPrimary,
                        }}
                      >
                        {tx.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color: colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {tx.groupDate} • {tx.paymentMethod || "UPI"} •{" "}
                        {tx.time || "12:00 PM"}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  {/* Right: Amount & Quick Action Buttons */}
                  <View className="flex-row items-center">
                    <View className="items-end mr-3">
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "800",
                          color: colors.textPrimary,
                        }}
                      >
                        -₹{tx.numericAmount?.toFixed(2) || "0.00"}
                      </Text>
                    </View>

                    {/* Receipt Image Quick Viewer */}
                    {tx.imageUri && (
                      <TouchableOpacity
                        onPress={() => setPreviewReceiptUri(tx.imageUri)}
                        activeOpacity={0.7}
                        style={[
                          styles.actionIconButton,
                          {
                            backgroundColor: isDarkMode
                              ? "rgba(16, 185, 129, 0.2)"
                              : "#E8F5E9",
                            marginRight: 6,
                          },
                        ]}
                      >
                        <Ionicons
                          name="receipt"
                          size={14}
                          color={isDarkMode ? "#34D399" : "#10B981"}
                        />
                      </TouchableOpacity>
                    )}

                    {/* Quick Edit Icon */}
                    <TouchableOpacity
                      onPress={() => handleOpenEditExpense(tx)}
                      activeOpacity={0.7}
                      style={[
                        styles.actionIconButton,
                        { backgroundColor: isDarkMode ? "#021A13" : "#F1F5F9" },
                      ]}
                    >
                      <Ionicons
                        name="pencil"
                        size={14}
                        color={isDarkMode ? "#34D399" : "#0F4634"}
                      />
                    </TouchableOpacity>

                    {/* Quick Delete Icon */}
                    <TouchableOpacity
                      onPress={() => handleDeleteExpense(tx.id)}
                      activeOpacity={0.7}
                      style={[
                        styles.actionIconButton,
                        {
                          backgroundColor: isDarkMode
                            ? "rgba(239, 68, 68, 0.15)"
                            : "#FEE2E2",
                          marginLeft: 6,
                        },
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            <Text style={{ fontSize: 36, marginBottom: 8 }}>
              {category.emoji}
            </Text>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "700",
                color: colors.textPrimary,
                marginBottom: 4,
              }}
            >
              No day-to-day spendings yet
            </Text>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: colors.textMuted,
                textAlign: "center",
                paddingHorizontal: 20,
                marginBottom: 16,
              }}
            >
              Add your first spend entry for {category.name} to track daily
              budget.
            </Text>

            <TouchableOpacity
              onPress={handleOpenAddExpense}
              activeOpacity={0.8}
              style={[
                styles.addSpendBtn,
                {
                  backgroundColor: isDarkMode ? "#10B981" : "#0F4634",
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                },
              ]}
            >
              <Ionicons
                name="add"
                size={18}
                color="#FFFFFF"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.addSpendBtnText}>Add First Spend</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* ======================================================== */}
      {/* MODAL 1: EDIT CATEGORY NAME & ASSIGNED BUDGET            */}
      {/* ======================================================== */}
      <Modal
        visible={editCategoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditCategoryModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                Edit Category & Budget
              </Text>
              <TouchableOpacity
                onPress={() => setEditCategoryModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={isDarkMode ? colors.textMuted : "#94A3B8"}
                />
              </TouchableOpacity>
            </View>

            {/* Select Emoji */}
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
              CHOOSE ICON / EMOJI
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4, marginBottom: 14 }}
            >
              {EMOJI_OPTIONS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => setEditEmoji(e)}
                  activeOpacity={0.7}
                  style={[
                    styles.emojiSelectChip,
                    editEmoji === e && styles.emojiSelectChipActive,
                    isDarkMode && {
                      backgroundColor:
                        editEmoji === e
                          ? "rgba(16, 185, 129, 0.25)"
                          : "#021A13",
                    },
                  ]}
                >
                  <Text style={{ fontSize: 20 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Category Name Input */}
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
              CATEGORY NAME
            </Text>
            <View
              style={[
                styles.modalInputBox,
                isDarkMode && {
                  backgroundColor: "#021A13",
                  borderColor: "rgba(16, 185, 129, 0.25)",
                },
              ]}
            >
              <TextInput
                value={editName}
                onChangeText={setEditName}
                placeholder="e.g. Food & Beverages"
                placeholderTextColor={isDarkMode ? "#52796F" : "#94A3B8"}
                style={[styles.modalTextInput, { color: colors.textPrimary }]}
              />
            </View>

            {/* Assigned Budget Amount Input */}
            <Text
              style={[
                styles.inputLabel,
                { color: colors.textMuted, marginTop: 12 },
              ]}
            >
              ASSIGNED BUDGET (₹)
            </Text>
            <View
              style={[
                styles.modalInputBox,
                isDarkMode && {
                  backgroundColor: "#021A13",
                  borderColor: "rgba(16, 185, 129, 0.25)",
                },
              ]}
            >
              <Text
                style={[
                  styles.currencyLabel,
                  { color: isDarkMode ? "#34D399" : "#0F4634" },
                ]}
              >
                ₹
              </Text>
              <TextInput
                value={editBudget}
                onChangeText={setEditBudget}
                placeholder="3000"
                placeholderTextColor={isDarkMode ? "#52796F" : "#94A3B8"}
                keyboardType="numeric"
                style={[styles.modalTextInput, { color: colors.textPrimary }]}
              />
            </View>

            {/* Modal Action Buttons */}
            <View className="flex-row items-center justify-between mt-5">
              <TouchableOpacity
                onPress={() => setEditCategoryModalVisible(false)}
                activeOpacity={0.7}
                style={[
                  styles.modalCancelBtn,
                  isDarkMode && {
                    backgroundColor: "#021A13",
                    borderColor: "rgba(16, 185, 129, 0.2)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalCancelBtnText,
                    { color: colors.textMuted },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveCategory}
                activeOpacity={0.85}
                style={styles.modalSaveBtn}
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalSaveBtnGradient}
                >
                  <Text style={styles.modalSaveBtnText}>Save Changes</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ======================================================== */}
      {/* MODAL 2: ADD / EDIT DAY-TO-DAY SPENDING ENTRY            */}
      {/* ======================================================== */}
      <Modal
        visible={expenseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalBackdrop}
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {editingExpenseId
                  ? "Edit Day Spend"
                  : `Add Spend: ${category.name}`}
              </Text>
              <TouchableOpacity
                onPress={() => setExpenseModalVisible(false)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close-circle"
                  size={24}
                  color={isDarkMode ? colors.textMuted : "#94A3B8"}
                />
              </TouchableOpacity>
            </View>

            {/* Spend Amount Input */}
            <Text style={[styles.inputLabel, { color: colors.textMuted }]}>
              SPENT AMOUNT (₹)
            </Text>
            <View
              style={[
                styles.modalInputBox,
                isDarkMode && {
                  backgroundColor: "#021A13",
                  borderColor: "rgba(16, 185, 129, 0.25)",
                },
              ]}
            >
              <Text
                style={[
                  styles.currencyLabel,
                  { color: isDarkMode ? "#34D399" : "#0F4634" },
                ]}
              >
                ₹
              </Text>
              <TextInput
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                placeholder="0.00"
                placeholderTextColor={isDarkMode ? "#52796F" : "#94A3B8"}
                keyboardType="decimal-pad"
                autoFocus
                style={[
                  styles.modalTextInput,
                  {
                    color: colors.textPrimary,
                    fontSize: 18,
                    fontWeight: "700",
                  },
                ]}
              />
            </View>

            {/* Note / Title */}
            <Text
              style={[
                styles.inputLabel,
                { color: colors.textMuted, marginTop: 12 },
              ]}
            >
              NOTE / TITLE
            </Text>
            <View
              style={[
                styles.modalInputBox,
                isDarkMode && {
                  backgroundColor: "#021A13",
                  borderColor: "rgba(16, 185, 129, 0.25)",
                },
              ]}
            >
              <TextInput
                value={expenseTitle}
                onChangeText={setExpenseTitle}
                placeholder={`e.g. Lunch at Cafe, Coffee, Groceries`}
                placeholderTextColor={isDarkMode ? "#52796F" : "#94A3B8"}
                style={[styles.modalTextInput, { color: colors.textPrimary }]}
              />
            </View>

            {/* Date Quick Selector */}
            <Text
              style={[
                styles.inputLabel,
                { color: colors.textMuted, marginTop: 12 },
              ]}
            >
              DATE
            </Text>
            {/* Date Selection Row */}
            <View className="flex-row items-center mb-2">
              {QUICK_DATES.map((d) => {
                const isActive = !isCustomDate && expenseDate === d;
                return (
                  <TouchableOpacity
                    key={d}
                    onPress={() => {
                      setIsCustomDate(false);
                      setExpenseDate(d);
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.chipBtn,
                      isActive && styles.chipBtnActive,
                      isDarkMode && {
                        backgroundColor:
                          isActive
                            ? "rgba(16, 185, 129, 0.25)"
                            : "#021A13",
                        borderColor:
                          isActive
                            ? "#34D399"
                            : "rgba(16, 185, 129, 0.2)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipBtnText,
                        isActive && styles.chipBtnTextActive,
                        isDarkMode && {
                          color: isActive ? "#FFFFFF" : "#8EB7A4",
                        },
                      ]}
                    >
                      {d}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Click to open Calendar Card */}
            <TouchableOpacity
              onPress={handleOpenCalendar}
              activeOpacity={0.8}
              style={[
                styles.calendarTriggerCard,
                isCustomDate && styles.calendarTriggerCardActive,
                isDarkMode && {
                  backgroundColor: isCustomDate
                    ? "rgba(16, 185, 129, 0.18)"
                    : "#021A13",
                  borderColor: isCustomDate
                    ? "#34D399"
                    : "rgba(16, 185, 129, 0.25)",
                },
              ]}
            >
              <View className="flex-row items-center flex-1 pr-2">
                <View
                  style={[
                    styles.calendarIconCircle,
                    {
                      backgroundColor: isDarkMode ? "#04281E" : "#E8F5E9",
                    },
                  ]}
                >
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={isDarkMode ? "#34D399" : "#10B981"}
                  />
                </View>

                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text
                    style={[
                      styles.calendarCardSub,
                      { color: colors.textMuted },
                    ]}
                  >
                    {isCustomDate ? "CUSTOM DATE SELECTED" : "SELECT FROM CALENDAR"}
                  </Text>
                  <Text
                    style={[
                      styles.calendarCardMain,
                      { color: colors.textPrimary },
                    ]}
                  >
                    {expenseDate}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.calendarBadge,
                  {
                    backgroundColor: isDarkMode ? "#04281E" : "#F1F5F9",
                    borderColor: isDarkMode ? "rgba(16, 185, 129, 0.3)" : "#E2E8F0",
                  },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={isDarkMode ? "#34D399" : "#0F4634"}
                  style={{ marginRight: 5 }}
                />
                <Text
                  style={[
                    styles.calendarBadgeText,
                    { color: isDarkMode ? "#34D399" : "#0F4634" },
                  ]}
                >
                  Calendar
                </Text>
              </View>
            </TouchableOpacity>

            {/* Payment Method Selector */}
            <Text
              style={[
                styles.inputLabel,
                { color: colors.textMuted, marginTop: 8 },
              ]}
            >
              PAYMENT METHOD
            </Text>
            <View className="flex-row mb-3">
              {PAYMENT_METHODS.map((pm) => (
                <TouchableOpacity
                  key={pm}
                  onPress={() => setExpensePayment(pm)}
                  activeOpacity={0.7}
                  style={[
                    styles.chipBtn,
                    expensePayment === pm && styles.chipBtnActive,
                    isDarkMode && {
                      backgroundColor:
                        expensePayment === pm
                          ? "rgba(16, 185, 129, 0.25)"
                          : "#021A13",
                      borderColor:
                        expensePayment === pm
                          ? "#34D399"
                          : "rgba(16, 185, 129, 0.2)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      expensePayment === pm && styles.chipBtnTextActive,
                      isDarkMode && {
                        color: expensePayment === pm ? "#FFFFFF" : "#8EB7A4",
                      },
                    ]}
                  >
                    {pm}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Receipt Attachment Section */}
            <View style={styles.receiptSectionHeader}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: colors.textMuted, marginTop: 4, marginBottom: 8 },
                ]}
              >
                RECEIPT ATTACHMENT (OPTIONAL)
              </Text>
              {receiptImage && (
                <TouchableOpacity
                  onPress={() => setReceiptImage(null)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.removeReceiptText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>

            {receiptImage ? (
              <View
                style={[
                  styles.receiptAttachedBox,
                  {
                    backgroundColor: isDarkMode ? "#021A13" : "#F8FAF9",
                    borderColor: isDarkMode
                      ? "rgba(16, 185, 129, 0.3)"
                      : "#E2E8F0",
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => setPreviewReceiptUri(receiptImage)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: receiptImage }}
                    style={styles.receiptAttachedThumb}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.receiptAttachedBadge}>
                    <Ionicons
                      name="checkmark-circle"
                      size={15}
                      color="#10B981"
                    />
                    <Text style={styles.receiptAttachedBadgeText}>
                      Receipt Attached
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      marginTop: 8,
                      gap: 8,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setPreviewReceiptUri(receiptImage)}
                      activeOpacity={0.7}
                      style={[
                        styles.receiptMiniActionBtn,
                        {
                          backgroundColor: isDarkMode ? "#04281E" : "#E8F5E9",
                          borderColor: isDarkMode
                            ? "rgba(16, 185, 129, 0.2)"
                            : "#C8E6C9",
                        },
                      ]}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={13}
                        color={isDarkMode ? "#34D399" : "#0F4634"}
                      />
                      <Text
                        style={[
                          styles.receiptMiniActionText,
                          { color: isDarkMode ? "#34D399" : "#0F4634" },
                        ]}
                      >
                        View
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setScannerVisible(true)}
                      activeOpacity={0.7}
                      style={[
                        styles.receiptMiniActionBtn,
                        {
                          backgroundColor: isDarkMode ? "#04281E" : "#F1F5F9",
                          borderColor: isDarkMode
                            ? "rgba(16, 185, 129, 0.2)"
                            : "#E2E8F0",
                        },
                      ]}
                    >
                      <Ionicons
                        name="camera-outline"
                        size={13}
                        color={isDarkMode ? "#8EB7A4" : "#475569"}
                      />
                      <Text
                        style={[
                          styles.receiptMiniActionText,
                          { color: isDarkMode ? "#8EB7A4" : "#475569" },
                        ]}
                      >
                        Retake
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => setScannerVisible(true)}
                activeOpacity={0.8}
                style={[
                  styles.receiptPlaceholderCard,
                  isDarkMode && {
                    backgroundColor: "#021A13",
                    borderColor: "rgba(16, 185, 129, 0.3)",
                  },
                ]}
              >
                <View
                  style={[
                    styles.receiptCameraIconCircle,
                    {
                      backgroundColor: isDarkMode ? "#04281E" : "#E8F5E9",
                    },
                  ]}
                >
                  <Ionicons
                    name="camera"
                    size={20}
                    color={isDarkMode ? "#34D399" : "#0F4634"}
                  />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text
                    style={[
                      styles.receiptPlaceholderTitle,
                      { color: colors.textPrimary },
                    ]}
                  >
                    Scan or Attach Bill Receipt
                  </Text>
                  <Text
                    style={[
                      styles.receiptPlaceholderSubtitle,
                      { color: colors.textMuted },
                    ]}
                  >
                    Click photo of your bill or receipt
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={isDarkMode ? "#52796F" : "#94A3B8"}
                />
              </TouchableOpacity>
            )}

            {/* Actions: Save & Delete (if editing) */}
            <View className="flex-row items-center justify-between mt-4">
              {editingExpenseId ? (
                <TouchableOpacity
                  onPress={() => handleDeleteExpense(editingExpenseId)}
                  activeOpacity={0.7}
                  style={styles.modalDeleteBtn}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color="#EF4444"
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.modalDeleteBtnText}>Delete</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={() => setExpenseModalVisible(false)}
                  activeOpacity={0.7}
                  style={[
                    styles.modalCancelBtn,
                    isDarkMode && {
                      backgroundColor: "#021A13",
                      borderColor: "rgba(16, 185, 129, 0.2)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.modalCancelBtnText,
                      { color: colors.textMuted },
                    ]}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={handleSaveExpense}
                activeOpacity={0.85}
                style={[styles.modalSaveBtn, { flex: 1, marginLeft: 10 }]}
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.modalSaveBtnGradient}
                >
                  <Text style={styles.modalSaveBtnText}>
                    {editingExpenseId ? "Update Spend" : "Save Spend"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Interactive Calendar Picker Modal */}
      <CalendarPickerModal
        visible={calendarModalVisible}
        selectedDate={expenseDate}
        onSelectDate={(formatted) => {
          setExpenseDate(formatted);
          setIsCustomDate(true);
        }}
        onClose={() => setCalendarModalVisible(false)}
      />

      {/* Bill & Receipt Scanner Camera Modal */}
      <Scanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onPhotoCaptured={(photo) => {
          if (photo?.uri) {
            setReceiptImage(photo.uri);
          }
        }}
      />

      {/* Full-Screen Receipt Preview Modal */}
      <Modal
        visible={!!previewReceiptUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewReceiptUri(null)}
      >
        <View style={styles.previewReceiptModalContainer}>
          <StatusBar barStyle="light-content" backgroundColor="#000000" />
          <View style={styles.previewReceiptHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="receipt-outline"
                size={20}
                color="#10B981"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.previewReceiptTitle}>Attached Receipt</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPreviewReceiptUri(null)}
              activeOpacity={0.8}
              style={styles.previewReceiptCloseBtn}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <View style={styles.previewReceiptBody}>
            {previewReceiptUri && (
              <Image
                source={{ uri: previewReceiptUri }}
                style={styles.previewReceiptImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
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
    height: 220,
  },
  headerIconButton: {
    backgroundColor: "rgba(184, 215, 202, 0.7)",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroEmojiCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  heroCategoryName: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  heroAllocatedLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 1,
  },
  editCategoryPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  editCategoryPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroAmountValue: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  heroAmountSub: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
    marginTop: 2,
  },
  heroProgressTrack: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    overflow: "hidden",
  },
  heroProgressFill: {
    height: "100%",
    borderRadius: 999,
  },
  heroStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  heroStatCol: {
    flex: 1,
    alignItems: "center",
  },
  heroStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  heroStatLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.65)",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  infoTile: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  infoIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  infoTileTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 2,
  },
  infoTileLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  addSpendBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    shadowColor: "#0F4634",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  addSpendBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  transactionsCard: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  txEmojiBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F4F7F5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    borderRadius: 24,
    paddingVertical: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 28,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  modalInputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  modalTextInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: "800",
    marginRight: 8,
  },
  emojiSelectChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  emojiSelectChipActive: {
    borderColor: "#10B981",
    backgroundColor: "#E6F4EE",
  },
  chipBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  chipBtnActive: {
    backgroundColor: "#E6F4EE",
    borderColor: "#0F4634",
  },
  chipBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  chipBtnTextActive: {
    color: "#0F4634",
    fontWeight: "700",
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  modalDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
  },
  modalDeleteBtnText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
  modalSaveBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  modalSaveBtnGradient: {
    paddingHorizontal: 20,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  dayAdjustBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  dayAdjustBtnText: {
    fontSize: 11,
    fontWeight: "600",
    marginHorizontal: 2,
  },
  calendarTriggerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  calendarTriggerCardActive: {
    borderColor: "#10B981",
    backgroundColor: "#E6F4EE",
  },
  calendarIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarCardSub: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  calendarCardMain: {
    fontSize: 15,
    fontWeight: "800",
    marginTop: 1,
  },
  calendarBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
  },
  calendarBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  receiptSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  removeReceiptText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  receiptAttachedBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 8,
  },
  receiptAttachedThumb: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#000",
  },
  receiptAttachedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  receiptAttachedBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 5,
  },
  receiptMiniActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
  },
  receiptMiniActionText: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  receiptPlaceholderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAF9",
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
  },
  receiptCameraIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  receiptPlaceholderTitle: {
    fontSize: 13.5,
    fontWeight: "700",
  },
  receiptPlaceholderSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 2,
  },
  previewReceiptModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "space-between",
  },
  previewReceiptHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
  },
  previewReceiptTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  previewReceiptCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewReceiptBody: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  previewReceiptImage: {
    width: "100%",
    height: "100%",
  },
});
