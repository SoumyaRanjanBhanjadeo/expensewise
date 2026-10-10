import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BottomBar({ activeTab = "home", onTabPress }) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handlePress = (tab) => {
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
          style={{
            backgroundColor: currentTab === "home" ? "#84CC16" : "transparent",
            paddingHorizontal: 12,
            paddingVertical: 7,
            borderRadius: 18,
          }}
        >
          <Ionicons
            name="home"
            size={18}
            color={currentTab === "home" ? "#0A1F12" : "#9CA3AF"}
          />
        </TouchableOpacity>

        {/* Tab 2: Transfer / Swap */}
        <TouchableOpacity
          onPress={() => handlePress("transfer")}
          activeOpacity={0.8}
          className="p-2"
        >
          <Ionicons
            name="swap-horizontal-outline"
            size={20}
            color={currentTab === "transfer" ? "#84CC16" : "#6B7280"}
          />
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
        <TouchableOpacity
          onPress={() => handlePress("wallet")}
          activeOpacity={0.8}
          className="p-2"
        >
          <Ionicons
            name="wallet-outline"
            size={19}
            color={currentTab === "wallet" ? "#84CC16" : "#6B7280"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
