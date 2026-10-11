import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Scanner from "../components/Scanner";

const CATEGORIES = [
  { id: "cat_1", name: "Food & Dining", emoji: "🍕" },
  { id: "cat_2", name: "Shopping", emoji: "🛍️" },
  { id: "cat_3", name: "Transportation", emoji: "🚙" },
  { id: "cat_4", name: "Grocery", emoji: "🛒" },
  { id: "cat_5", name: "Entertainment", emoji: "🍿" },
  { id: "cat_6", name: "Health & Care", emoji: "💊" },
];

const PAYMENT_METHODS = [
  { id: "upi", name: "UPI / QR", icon: "qrcode-scan" },
  { id: "card", name: "Credit / Debit", icon: "credit-card-outline" },
  { id: "cash", name: "Cash", icon: "cash" },
  { id: "netbanking", name: "Net Banking", icon: "bank-outline" },
];

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000];

export default function RecieptModalScreen({
  navigation,
  route,
  onClose,
  onAddReceipt,
}) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("cat_1");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [receiptDate, setReceiptDate] = useState("Today");
  const [notes, setNotes] = useState("");
  const [receiptImage, setReceiptImage] = useState(null);
  const [scannerVisible, setScannerVisible] = useState(false);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate("Receipts");
    }
  };

  const handleSaveReceipt = () => {
    const numericAmount = parseFloat(amount);
    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid receipt amount.");
      return;
    }

    const categoryObj = CATEGORIES.find((c) => c.id === selectedCategory);

    const newReceipt = {
      id: "rcpt_" + Date.now(),
      merchant: merchant.trim() || categoryObj?.name || "Receipt Expense",
      amount: numericAmount,
      formattedAmount: `₹${numericAmount.toFixed(2)}`,
      category: categoryObj?.name || "General",
      emoji: categoryObj?.emoji || "🧾",
      date: receiptDate === "Today" ? "Today" : receiptDate,
      paymentMethod,
      notes: notes.trim(),
      imageUri: receiptImage,
      createdAt: new Date().toISOString(),
    };

    if (onAddReceipt) {
      onAddReceipt(newReceipt);
    } else if (route?.params?.onAddReceipt) {
      route.params.onAddReceipt(newReceipt);
    }

    if (navigation?.navigate) {
      navigation.navigate({
        name: "Receipts",
        params: { newReceipt },
        merge: true,
      });
    }

    Alert.alert(
      "Receipt Added! ✨",
      `₹${numericAmount.toFixed(2)} recorded under ${categoryObj?.name}.`,
      [
        {
          text: "OK",
          onPress: handleClose,
        },
      ]
    );
  };

  const addQuickAmount = (val) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
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
          onPress={handleClose}
          activeOpacity={0.8}
          style={styles.headerIconButton}
        >
          <Ionicons name="close" size={22} color="#1F382C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Receipt</Text>

        <TouchableOpacity
          onPress={() => setScannerVisible(true)}
          activeOpacity={0.8}
          style={styles.headerIconButton}
        >
          <MaterialCommunityIcons name="camera-plus" size={21} color="#1F382C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input Card */}
        <View style={styles.amountCard}>
          <Text style={styles.cardSectionLabel}>RECEIPT AMOUNT</Text>

          <View style={styles.amountInputRow}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor="#94A3B8"
              keyboardType="decimal-pad"
              style={styles.amountTextInput}
              maxLength={9}
            />
          </View>

          {/* Quick Amount Suggestion Chips */}
          <View style={styles.quickAmountsRow}>
            {QUICK_AMOUNTS.map((val) => (
              <TouchableOpacity
                key={val}
                onPress={() => addQuickAmount(val)}
                activeOpacity={0.7}
                style={styles.quickAmountChip}
              >
                <Text style={styles.quickAmountText}>+₹{val}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Receipt Photo / Scanner Attachment Card */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.cardSectionLabel}>RECEIPT ATTACHMENT</Text>
            {receiptImage && (
              <TouchableOpacity
                onPress={() => setReceiptImage(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.removePhotoText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {receiptImage ? (
            <View style={styles.attachedImageContainer}>
              <Image
                source={{ uri: receiptImage }}
                style={styles.attachedThumbnail}
                resizeMode="cover"
              />
              <View style={styles.attachedOverlayInfo}>
                <View style={styles.attachedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.attachedBadgeText}>Photo Attached</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setScannerVisible(true)}
                  activeOpacity={0.8}
                  style={styles.retakeMiniBtn}
                >
                  <Text style={styles.retakeMiniBtnText}>Retake Photo</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => setScannerVisible(true)}
              activeOpacity={0.8}
              style={styles.photoUploadPlaceholder}
            >
              <View style={styles.cameraIconCircle}>
                <Ionicons name="camera" size={24} color="#0F4634" />
              </View>
              <Text style={styles.uploadPromptTitle}>
                Scan or Click Receipt Photo
              </Text>
              <Text style={styles.uploadPromptSubtitle}>
                Take a photo to attach your bill or receipt copy
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Store / Merchant Name */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionLabel}>STORE / MERCHANT</Text>
          <View style={styles.inputFieldContainer}>
            <Ionicons
              name="business-outline"
              size={20}
              color="#0F4634"
              style={{ marginRight: 10 }}
            />
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder="e.g. Starbucks, Reliance Fresh, Uber"
              placeholderTextColor="#94A3B8"
              style={styles.textInputField}
            />
          </View>
        </View>

        {/* Category Picker */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionLabel}>CATEGORY</Text>
          <View style={styles.categoriesGrid}>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(cat.id)}
                  activeOpacity={0.75}
                  style={[
                    styles.categoryChip,
                    isSelected && styles.categoryChipSelected,
                  ]}
                >
                  <Text style={styles.categoryChipEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionLabel}>PAYMENT METHOD</Text>
          <View style={styles.paymentMethodsRow}>
            {PAYMENT_METHODS.map((pm) => {
              const isSelected = paymentMethod === pm.id;
              return (
                <TouchableOpacity
                  key={pm.id}
                  onPress={() => setPaymentMethod(pm.id)}
                  activeOpacity={0.75}
                  style={[
                    styles.paymentMethodChip,
                    isSelected && styles.paymentMethodChipSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={pm.icon}
                    size={18}
                    color={isSelected ? "#0F4634" : "#64748B"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      isSelected && styles.paymentMethodTextSelected,
                    ]}
                  >
                    {pm.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Date Selector Chips */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionLabel}>DATE</Text>
          <View style={styles.dateChipsRow}>
            {["Today", "Yesterday", "2 Days Ago"].map((d) => {
              const isSelected = receiptDate === d;
              return (
                <TouchableOpacity
                  key={d}
                  onPress={() => setReceiptDate(d)}
                  activeOpacity={0.75}
                  style={[
                    styles.dateChip,
                    isSelected && styles.dateChipSelected,
                  ]}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={15}
                    color={isSelected ? "#0F4634" : "#64748B"}
                    style={{ marginRight: 5 }}
                  />
                  <Text
                    style={[
                      styles.dateChipText,
                      isSelected && styles.dateChipTextSelected,
                    ]}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes Input */}
        <View style={styles.sectionCard}>
          <Text style={styles.cardSectionLabel}>NOTES / ITEMS (OPTIONAL)</Text>
          <View style={[styles.inputFieldContainer, { height: 80, alignItems: "flex-start", paddingTop: 10 }]}>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Lunch with team, client meeting..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={3}
              style={[styles.textInputField, { height: "100%", textAlignVertical: "top" }]}
            />
          </View>
        </View>

        {/* Save Receipt Button */}
        <TouchableOpacity
          onPress={handleSaveReceipt}
          activeOpacity={0.85}
          style={styles.saveButtonWrapper}
        >
          <LinearGradient
            colors={["#10B981", "#059669", "#047857"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.saveButtonGradient}
          >
            <Ionicons
              name="checkmark-circle"
              size={22}
              color="#FFFFFF"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.saveButtonText}>Save Receipt</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Embedded Camera / Photo Clicker Scanner */}
      <Scanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onPhotoCaptured={(photo) => {
          setReceiptImage(photo.uri);
          setScannerVisible(false);
        }}
      />
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
  amountCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  cardSectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  currencyPrefix: {
    fontSize: 36,
    fontWeight: "800",
    color: "#0F4634",
    marginRight: 6,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 40,
    fontWeight: "800",
    color: "#050B08",
    padding: 0,
    letterSpacing: -1,
  },
  quickAmountsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  quickAmountChip: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  quickAmountText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F4634",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
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
  },
  removePhotoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#EF4444",
  },
  photoUploadPlaceholder: {
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    borderStyle: "dashed",
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  cameraIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E2F0EA",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadPromptTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F4634",
    marginBottom: 4,
  },
  uploadPromptSubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
  },
  attachedImageContainer: {
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  attachedThumbnail: {
    width: "100%",
    height: "100%",
  },
  attachedOverlayInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  attachedBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  attachedBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },
  retakeMiniBtn: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  retakeMiniBtnText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  inputFieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
  },
  textInputField: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
    padding: 0,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  categoryChipSelected: {
    backgroundColor: "#E6F4EE",
    borderColor: "#0F4634",
  },
  categoryChipEmoji: {
    fontSize: 15,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  categoryChipTextSelected: {
    color: "#0F4634",
    fontWeight: "700",
  },
  paymentMethodsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paymentMethodChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  paymentMethodChipSelected: {
    backgroundColor: "#E6F4EE",
    borderColor: "#0F4634",
  },
  paymentMethodText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  paymentMethodTextSelected: {
    color: "#0F4634",
    fontWeight: "700",
  },
  dateChipsRow: {
    flexDirection: "row",
    gap: 8,
  },
  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  dateChipSelected: {
    backgroundColor: "#E6F4EE",
    borderColor: "#0F4634",
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  dateChipTextSelected: {
    color: "#0F4634",
    fontWeight: "700",
  },
  saveButtonWrapper: {
    borderRadius: 22,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
