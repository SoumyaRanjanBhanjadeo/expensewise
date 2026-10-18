import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import transactionsData from "../dummy/transactions.json";
import BottomBar from "../components/BottomBar";
import { useTheme } from "../context/ThemeContext";

export default function TransactionScreen({
  navigation,
  hideBottomBar = false,
  onBack,
}) {
  const { isDarkMode, colors } = useTheme();
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1200);
  }, []);

  const filteredGroups = useMemo(() => {
    if (selectedFilter === "All") {
      return transactionsData.groups;
    }
    return transactionsData.groups
      .map((group) => ({
        ...group,
        transactions: group.transactions.filter(
          (tx) => tx.filterType === selectedFilter
        ),
      }))
      .filter((group) => group.transactions.length > 0);
  }, [selectedFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.statusBarStyle}
        translucent
        backgroundColor="transparent"
      />

      {/* Atmospheric Soft Sage Gradient covering the top header */}
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
      <View className="flex-row items-center justify-between px-5 pt-[52px] pb-3">
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => {
            if (onBack) {
              onBack();
            } else {
              navigation?.goBack();
            }
          }}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={[
            styles.headerIconButton,
            {
              backgroundColor: isDarkMode ? "#04281E" : "rgba(184, 215, 202, 0.7)",
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
          Transactions
        </Text>

        {/* Filter / Settings Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={[
            styles.headerIconButton,
            {
              backgroundColor: isDarkMode ? "#04281E" : "rgba(184, 215, 202, 0.7)",
              borderColor: isDarkMode ? colors.cardBorder : "transparent",
              borderWidth: isDarkMode ? 1 : 0,
            },
          ]}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={isDarkMode ? "#E2F2EB" : "#1F382C"}
          />
        </TouchableOpacity>
      </View>

      {/* Filter Pills Row */}
      <View className="flex-row px-5 py-2">
        {transactionsData.filters.map((filter) => {
          const isActive = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}
              style={[
                styles.filterPill,
                isActive
                  ? {
                      backgroundColor: isDarkMode ? "#10B981" : "#114F3A",
                    }
                  : {
                      backgroundColor: isDarkMode ? "#04281E" : "#D9E9E0",
                      borderColor: isDarkMode ? "rgba(16, 185, 129, 0.25)" : "transparent",
                      borderWidth: isDarkMode ? 1 : 0,
                    },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? "700" : "600",
                  color: isActive
                    ? "#FFFFFF"
                    : isDarkMode
                    ? "#8EB7A4"
                    : "#1F382C",
                }}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Transactions List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        className="flex-1 px-5 pt-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981", "#059669"]}
          />
        }
      >
        {filteredGroups.map((group) => (
          <View key={group.date} className="mb-2">
            {/* Group Date Header */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: "700",
                color: colors.textMuted,
                marginBottom: 10,
                marginTop: 8,
                marginLeft: 4,
              }}
            >
              {group.date}
            </Text>

            {/* Rounded Card containing group transactions */}
            <View
              className="rounded-[26px] px-4 py-1 mb-2"
              style={[
                styles.groupCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                  borderWidth: isDarkMode ? 1 : 0,
                },
              ]}
            >
              {group.transactions.map((tx, idx) => {
                const isLast = idx === group.transactions.length - 1;
                return (
                  <View
                    key={tx.id}
                    className="flex-row items-center justify-between py-3.5"
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
                    {/* Left Emoji Icon & Details */}
                    <View className="flex-row items-center flex-1 pr-2">
                      <View
                        className="w-11 h-11 rounded-full items-center justify-center mr-3"
                        style={[
                          styles.emojiContainer,
                          isDarkMode && {
                            backgroundColor: "#021A13",
                            borderWidth: 1,
                            borderColor: "rgba(16, 185, 129, 0.2)",
                          },
                        ]}
                      >
                        <Text style={styles.emojiText}>{tx.emoji}</Text>
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
                          {tx.category} • {tx.paymentMethod}
                        </Text>
                      </View>
                    </View>

                    {/* Right Amount & Time */}
                    <View className="items-end">
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: tx.isCredit
                            ? isDarkMode
                              ? "#34D399"
                              : "#15803D"
                            : colors.textPrimary,
                        }}
                      >
                        {tx.amount}
                      </Text>
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "500",
                          color: colors.textMuted,
                          marginTop: 2,
                        }}
                      >
                        {tx.time}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {filteredGroups.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.textMuted,
              }}
            >
              No transactions found for {selectedFilter}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      {!hideBottomBar && (
        <BottomBar
          activeTab="transactions"
          onTabPress={(tab) => {
            if (tab === "home") {
              if (onBack) {
                onBack();
              } else {
                navigation?.navigate("Dashboard");
              }
            }
          }}
        />
      )}
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
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginRight: 10,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  groupCard: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emojiContainer: {
    backgroundColor: "#F4F7F5",
  },
  emojiText: {
    fontSize: 20,
  },
});
