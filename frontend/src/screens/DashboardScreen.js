import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Dummy data
import dashboardData from "../dummy/dashboard.json";
import BottomBar from "../components/BottomBar";

export default function DashboardScreen({
  navigation,
  hideBottomBar = false,
  onNavigateToTransactions,
}) {
  const [refreshing, setRefreshing] = useState(false);

  const {
    monthlyOverview,
    todaySpend,
    quickActions,
    recentTransactions,
    user,
  } = dashboardData;

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  return (
    <View className="flex-1 bg-[#EEF4F1]">
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Atmospheric Soft Sage Gradient covering the top half */}
      <LinearGradient
        colors={["#A1C4B5", "#B5D4C7", "#CBE3D7", "#DFEFE7", "#EEF4F1"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headerGradient}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981", "#059669"]}
          />
        }
      >
        {/* Top Header: 4-Dots Menu Button on Left, Profile Avatar on Right */}
        <View className="flex-row items-center justify-between px-5 pt-[52px] pb-4">
          {/* 4-Dots Menu Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full bg-black items-center justify-center shadow-md elevation-4"
          >
            <View className="w-4 h-4 flex-wrap flex-row justify-between content-between">
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
              <View className="w-1.5 h-1.5 rounded-full bg-white" />
            </View>
          </TouchableOpacity>

          {/* User Profile Avatar */}
          <TouchableOpacity
            onPress={() => navigation?.navigate("Profile")}
            activeOpacity={0.8}
            className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm elevation-3"
          >
            <Image
              source={{ uri: user.avatar }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </TouchableOpacity>
        </View>

        {/* Monthly Overview Section */}
        <View className="px-5 mt-1 mb-4">
          <Text className="text-[13px] font-semibold text-[#1F382C] tracking-wide">
            Monthly Overview
          </Text>
          <Text className="text-[38px] font-black text-[#0F4634] tracking-tight mt-0.5 mb-3.5">
            ₹ {monthlyOverview.total.toFixed(2)}
          </Text>

          {/* Dual Column Spend / Remaining Section - Transparent Background */}
          <View className="bg-transparent py-2">
            {/* Top Labels and Figures Row */}
            <View className="flex-row mb-3.5 items-end">
              {/* Thin White Left Border Line */}
              <View className="w-[1.5px] h-[38px] bg-white/80 mr-2" />

              {/* Spend Column */}
              <View style={styles.spendColumn} className="pr-3.5">
                <Text className="text-[13px] font-medium text-[#4A6357] text-right">
                  Spend
                </Text>
                <Text className="text-[20px] font-black text-black text-right mt-0.5">
                  ₹ {monthlyOverview.spend.toFixed(2)}
                </Text>
              </View>

              {/* Thin White Vertical Divider */}
              <View className="w-[1.5px] h-[38px] bg-white/80" />

              {/* Remaining Column */}
              <View style={styles.remainingColumn} className="pl-3.5">
                <Text className="text-[13px] font-medium text-[#4A6357] text-right">
                  Remaining
                </Text>
                <Text className="text-[20px] font-black text-black text-right mt-0.5">
                  ₹ {monthlyOverview.remaining.toFixed(2)}
                </Text>
              </View>

              {/* Thin White Right Border Line */}
              <View className="w-[1.5px] h-[38px] bg-white/80 ml-2" />
            </View>

            {/* Bottom Graphic Row */}
            <View className="flex-row h-[54px] items-center">
              {/* Left Spend Bar: NOT a capsule! Flat on left (0 radius), rounded on top-right and bottom-right only */}
              <View
                className="h-[54px] overflow-hidden flex-row items-center justify-end relative mr-1.5"
                style={styles.spendBar}
              >
                <LinearGradient
                  colors={[
                    "rgba(255, 255, 255, 0.75)",
                    "#B6DEC8",
                    "#65AC91",
                    "#1E6A52",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientFill}
                />
                {/* 95% Dark Green Circle Badge on the right */}
                <View className="w-[54px] h-[54px] rounded-full bg-[#114F3A] items-center justify-center z-10">
                  <Text className="text-white text-[13px] font-black">
                    {monthlyOverview.spendPercentage}%
                  </Text>
                </View>
              </View>

              {/* Right Remaining Bar: NOT a capsule! Rounded on top-left and bottom-left only, flat/open on right with dots fully covering */}
              <View
                className="h-[54px] bg-transparent relative justify-center"
                style={styles.remainingBar}
              >
                {/* Full Polka Dot Matrix covering entire Remaining area */}
                <View style={styles.dotsMatrixContainer}>
                  {Array.from({ length: 5 }).map((_, r) => (
                    <View key={r} style={styles.dotRow}>
                      {Array.from({ length: 11 }).map((_, c) => (
                        <View
                          key={c}
                          style={[styles.dot, dotColumnStyles[c]]}
                        />
                      ))}
                    </View>
                  ))}
                </View>

                {/* 05% Solid Black Circle Badge positioned on the left over the dots */}
                <View
                  className="w-[50px] h-[50px] rounded-full bg-black items-center justify-center z-10"
                  style={styles.remainingBadge}
                >
                  <Text className="text-white text-[13px] font-black">
                    {monthlyOverview.remainingPercentage}%
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Today's Spend Card: Linear gradient from top as black, dark green, light green */}
        <View className="px-5 mb-4">
          <LinearGradient
            colors={["#000000", "#072C1E", "#0E5238", "#1B7953", "#2EA874"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.todaySpendCard}
          >
            <Text className="text-[13px] font-medium text-white/75">
              Today's Spend
            </Text>
            <Text className="text-[36px] font-black text-white tracking-tight mt-0.5 mb-3.5">
              ₹ {todaySpend.amount.toFixed(2)}
            </Text>

            <View className="flex-row items-center justify-between">
              {/* Change Pill */}
              <View className="flex-row items-center">
                <View className="bg-[#86EFAC] px-2 py-1 rounded-[10px] flex-row items-center mr-1.5">
                  <Ionicons
                    name="trending-down"
                    size={12}
                    color="#064E3B"
                    style={styles.trendingIcon}
                  />
                  <Text className="text-[11px] font-extrabold text-[#064E3B]">
                    {todaySpend.percentageChange}%
                  </Text>
                </View>
                <Text className="text-[12px] font-medium text-white/75">
                  {todaySpend.comparisonText}
                </Text>
              </View>

              {/* Highlight Category */}
              <Text className="text-[12px] font-medium text-white/75">
                {todaySpend.highlightCategory}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Action Buttons Row */}
        <View className="flex-row justify-between px-5 mb-5">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              activeOpacity={0.8}
              className="flex-1 bg-white rounded-[18px] py-[18px] items-center justify-center mx-1 shadow-sm elevation-2"
            >
              <Ionicons
                name={action.icon}
                size={22}
                color="#000000"
                style={styles.actionIcon}
              />
              <Text className="text-[12px] font-bold text-gray-800">
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions Bottom Sheet Card (Extends down with no gaps) */}
        <View
          className="flex-1 bg-white rounded-t-[32px] pt-3.5 px-5 pb-[130px]"
          style={styles.bottomSheetCard}
        >
          {/* Top Sheet Drag Handle */}
          <View className="w-10 h-1 rounded-full bg-gray-200 self-center mb-4" />

          {/* Section Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-[17px] font-black text-gray-900 tracking-tight">
              Recent Transactions
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (onNavigateToTransactions) {
                  onNavigateToTransactions();
                } else {
                  navigation?.navigate("Transactions");
                }
              }}
            >
              <Text className="text-[12px] font-semibold text-gray-400">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Transactions List */}
          {recentTransactions.map((tx) => (
            <View
              key={tx.id}
              className="flex-row items-center justify-between py-3 border-b border-gray-100"
            >
              {/* Left Icon & Details */}
              <View className="flex-row items-center flex-1 pr-2">
                <View
                  style={[
                    { backgroundColor: tx.iconBg },
                    styles.txIconContainer,
                  ]}
                >
                  <Ionicons name={tx.icon} size={20} color={tx.iconColor} />
                </View>

                <View className="flex-1">
                  <Text className="text-[14px] font-bold text-gray-900 mb-0.5">
                    {tx.title}
                  </Text>
                  <Text className="text-[12px] font-medium text-gray-400">
                    {tx.category} • {tx.paymentMethod}
                  </Text>
                </View>
              </View>

              {/* Right Amount & Time */}
              <View className="items-end">
                <Text className="text-[14px] font-extrabold text-gray-900">
                  {tx.amount}
                </Text>
                <Text className="text-[11px] font-medium text-gray-400 mt-0.5">
                  {tx.time}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      {!hideBottomBar && (
        <BottomBar
          activeTab="home"
          onTabPress={(tab) => {
            if (tab === "transactions") {
              if (onNavigateToTransactions) {
                onNavigateToTransactions();
              } else {
                navigation?.navigate("Transactions");
              }
            }
          }}
        />
      )}
    </View>
  );
}

const dotColumnStyles = [
  { opacity: 0.65 },
  { opacity: 0.62 },
  { opacity: 0.58 },
  { opacity: 0.54 },
  { opacity: 0.5 },
  { opacity: 0.45 },
  { opacity: 0.4 },
  { opacity: 0.35 },
  { opacity: 0.3 },
  { opacity: 0.25 },
  { opacity: 0.2 },
];

const styles = StyleSheet.create({
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 440,
  },
  scrollContent: {
    flexGrow: 1,
  },
  spendColumn: {
    flex: 66,
  },
  remainingColumn: {
    flex: 34,
  },
  spendBar: {
    flex: 66,
    borderTopRightRadius: 27,
    borderBottomRightRadius: 27,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  remainingBar: {
    flex: 34,
    borderTopLeftRadius: 27,
    borderBottomLeftRadius: 27,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    overflow: "hidden",
  },
  gradientFill: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dotsMatrixContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 4,
    paddingHorizontal: 4,
    justifyContent: "space-between",
  },
  dotRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  remainingBadge: {
    position: "absolute",
    left: 0,
    top: 2,
    zIndex: 10,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2B3A33",
  },
  todaySpendCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
  },
  trendingIcon: {
    marginRight: 2,
  },
  actionIcon: {
    marginBottom: 6,
  },
  bottomSheetCard: {
    minHeight: 520,
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
});
