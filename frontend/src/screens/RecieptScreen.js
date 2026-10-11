import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  RefreshControl,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import categoriesData from "../dummy/categories.json";
import BottomBar from "../components/BottomBar";
import RecieptModalScreen from "./RecieptModalScreen";

export default function RecieptScreen({
  navigation,
  route,
  hideBottomBar = false,
  onBack,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState(categoriesData);
  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setCategories([...categoriesData]);
      setRefreshing(false);
    }, 1200);
  }, []);

  const handleAddReceipt = useCallback((newReceipt) => {
    if (!newReceipt) return;
    setCategories((prev) =>
      prev.map((cat) => {
        const isMatch =
          cat.name.toLowerCase().includes(newReceipt.category.toLowerCase()) ||
          newReceipt.category.toLowerCase().includes(cat.name.toLowerCase());
        if (isMatch) {
          const newSpent = (cat.spentAmount || 0) + newReceipt.amount;
          const budget = cat.budget || 3000;
          const newProgress = Math.min(newSpent / budget, 1);
          const newLeft = Math.max(budget - newSpent, 0);
          return {
            ...cat,
            spent: `₹${newSpent}`,
            spentAmount: newSpent,
            progress: newProgress,
            percentage: `${Math.round(newProgress * 100)}%`,
            leftAmount: `₹${newLeft} Left`,
          };
        }
        return cat;
      })
    );
  }, []);

  // Listen for receipt data passed back via serializable navigation params
  React.useEffect(() => {
    if (route?.params?.newReceipt) {
      handleAddReceipt(route.params.newReceipt);
      navigation?.setParams({ newReceipt: undefined });
    }
  }, [route?.params?.newReceipt]);

  const handleOpenAddReceipt = () => {
    if (navigation?.navigate) {
      navigation.navigate("RecieptModalScreen");
    } else {
      setModalVisible(true);
    }
  };

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
      <View className="flex-row items-center justify-between px-5 pt-[52px] pb-4">
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
          Manage Receipts
        </Text>

        {/* Add Category (+) Button */}
        <TouchableOpacity
          onPress={handleOpenAddReceipt}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center bg-[#0F4634]"
          style={styles.addButton}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Categories Budget Cards List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        className="flex-1 px-5 pt-2"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981", "#059669"]}
          />
        }
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            activeOpacity={0.9}
            className="bg-white rounded-3xl p-4 mb-3.5"
            style={styles.categoryCard}
          >
            {/* Top Row: Emoji Icon, Category Name & Spent, Chevron */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-2">
                {/* Circular Emoji Icon */}
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mr-3.5"
                  style={styles.emojiContainer}
                >
                  <Text style={styles.emojiText}>{cat.emoji}</Text>
                </View>

                {/* Details */}
                <View className="flex-1">
                  <Text className="text-[15px] font-bold text-[#111827]">
                    {cat.name}
                  </Text>
                  <Text className="text-[18px] font-black text-[#111827] mt-0.5">
                    {cat.spent}
                  </Text>
                </View>
              </View>

              {/* Chevron Right */}
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>

            {/* Middle Row: Progress Bar */}
            <View
              className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-3.5 mb-2.5"
              style={styles.progressTrack}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(cat.progress * 100, 100)}%`,
                    backgroundColor: cat.progressColor,
                  },
                ]}
              />
            </View>

            {/* Bottom Row: Percentage and Left Budget */}
            <View className="flex-row items-center justify-between">
              <Text className="text-[12px] font-bold text-[#111827]">
                {cat.percentage} of budget
              </Text>
              <Text className="text-[12px] font-bold text-[#111827]">
                {cat.leftAmount}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      {!hideBottomBar && (
        <BottomBar
          activeTab="receipts"
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

      {/* Add Receipt Modal Fallback */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setModalVisible(false)}
      >
        <RecieptModalScreen
          onClose={() => setModalVisible(false)}
          onAddReceipt={handleAddReceipt}
        />
      </Modal>
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
  addButton: {
    shadowColor: "#0F4634",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  categoryCard: {
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
  progressTrack: {
    backgroundColor: "#F3F4F6",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
});
