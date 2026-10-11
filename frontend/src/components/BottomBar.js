import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Scanner from "./Scanner";

export default function BottomBar({ activeTab = "home", onTabPress }) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [scannerVisible, setScannerVisible] = useState(false);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  const handlePress = (tab) => {
    if (tab === "scan") {
      setScannerVisible(true);
      return;
    }
    setCurrentTab(tab);
    if (onTabPress) onTabPress(tab);
  };

  return (
    <View className="absolute bottom-6 left-6 right-6 items-center pointer-events-box-none z-50">
      <View
        style={{
          backgroundColor: "#050B08",
          borderRadius: 36,
          paddingVertical: 10,
          paddingHorizontal: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.35,
          shadowRadius: 18,
          elevation: 20,
        }}
        className="flex-row items-center justify-between w-full max-w-xs"
      >
        {/* Tab 1: Home */}
        <TouchableOpacity
          onPress={() => handlePress("home")}
          activeOpacity={0.8}
        >
          <Ionicons
            name="home"
            size={18}
            color={currentTab === "home" ? "#84CC16" : "#9CA3AF"}
          />
        </TouchableOpacity>

        {/* Tab 2: Transactions */}
        <TouchableOpacity
          onPress={() => handlePress("transactions")}
          activeOpacity={0.8}
          className="p-2"
        >
          <Ionicons
            name="swap-horizontal-outline"
            size={20}
            color={currentTab === "transactions" ? "#84CC16" : "#6B7280"}
          />
        </TouchableOpacity>

        {/* Middle Scanner Button (PhonePe style elevated circular QR scanner) */}
        <TouchableOpacity
          onPress={() => handlePress("scan")}
          activeOpacity={0.85}
          style={styles.scannerWrapper}
        >
          <View style={styles.scannerRing}>
            <LinearGradient
              colors={["#34D399", "#10B981", "#059669"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.scannerButton}
            >
              <MaterialCommunityIcons
                name="qrcode-scan"
                size={23}
                color="#FFFFFF"
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>

        {/* Tab 3: Analytics */}
        <TouchableOpacity
          onPress={() => handlePress("analytics")}
          activeOpacity={0.8}
          className="p-2"
        >
          <Ionicons
            name="bar-chart-outline"
            size={19}
            color={currentTab === "analytics" ? "#84CC16" : "#6B7280"}
          />
        </TouchableOpacity>

        {/* Tab 4: Records / Receipts */}
        <TouchableOpacity
          onPress={() => handlePress("receipts")}
          activeOpacity={0.8}
          className="p-2"
        >
          <Ionicons
            name="receipt-outline"
            size={19}
            color={currentTab === "receipts" ? "#84CC16" : "#6B7280"}
          />
        </TouchableOpacity>

        {/* Tab 5: Wallet */}
        {/* <TouchableOpacity
          onPress={() => handlePress("wallet")}
          activeOpacity={0.8}
          className="p-2"
        >
          <Ionicons
            name="wallet-outline"
            size={19}
            color={currentTab === "wallet" ? "#84CC16" : "#6B7280"}
          />
        </TouchableOpacity> */}
      </View>

      {/* Camera Scanner Modal */}
      <Scanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scannerWrapper: {
    marginTop: -24,
    alignItems: "center",
    justifyContent: "center",
  },
  scannerRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#050B08",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255, 255, 255, 0.15)",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 12,
  },
  scannerButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
});
