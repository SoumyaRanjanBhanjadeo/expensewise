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

export default function TransactionScreen({
  navigation,
  hideBottomBar = false,
  onBack,
}) {
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
    <View className="flex-1 bg-[#EEF4F1]">
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
          style={styles.headerIconButton}
        >
          <Ionicons name="arrow-back" size={20} color="#1F382C" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text className="text-[20px] font-bold text-[#111827]">
          Transactions
        </Text>

        {/* Filter / Settings Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={styles.headerIconButton}
        >
          <Ionicons name="options-outline" size={20} color="#1F382C" />
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
              className={`px-4 py-2 rounded-full mr-2.5 ${
                isActive ? "bg-[#114F3A]" : "bg-[#D9E9E0]"
              }`}
            >
              <Text
                className={`text-[13px] font-semibold ${
                  isActive ? "text-white font-bold" : "text-[#1F382C]"
                }`}
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
            <Text className="text-[14px] font-bold text-[#1F2937] mb-2.5 mt-2 ml-1">
              {group.date}
            </Text>

            {/* White Rounded Card containing group transactions */}
            <View
              className="bg-white rounded-[26px] px-4 py-1 mb-2"
              style={styles.groupCard}
            >
              {group.transactions.map((tx, idx) => {
                const isLast = idx === group.transactions.length - 1;
                return (
                  <View
                    key={tx.id}
                    className={`flex-row items-center justify-between py-3.5 ${
                      !isLast ? "border-b border-gray-100" : ""
                    }`}
                  >
                    {/* Left Emoji Icon & Details */}
                    <View className="flex-row items-center flex-1 pr-2">
                      <View
                        className="w-11 h-11 rounded-full items-center justify-center mr-3"
                        style={styles.emojiContainer}
                      >
                        <Text style={styles.emojiText}>{tx.emoji}</Text>
                      </View>

                      <View className="flex-1">
                        <Text className="text-[14px] font-bold text-[#111827]">
                          {tx.title}
                        </Text>
                        <Text className="text-[12px] font-medium text-[#6B7280] mt-0.5">
                          {tx.category} • {tx.paymentMethod}
                        </Text>
                      </View>
                    </View>

                    {/* Right Amount & Time */}
                    <View className="items-end">
                      <Text
                        className={`text-[14px] font-extrabold ${
                          tx.isCredit ? "text-[#15803D]" : "text-[#111827]"
                        }`}
                      >
                        {tx.amount}
                      </Text>
                      <Text className="text-[11px] font-medium text-[#9CA3AF] mt-0.5">
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
            <Text className="text-[14px] font-semibold text-gray-400">
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
