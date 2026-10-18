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
import { useTheme } from "../context/ThemeContext";

export default function RecieptScreen({
  navigation,
  route,
  hideBottomBar = false,
  onBack,
}) {
  const { isDarkMode, colors } = useTheme();
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

  const handleAddCategory = useCallback((newCategory) => {
    if (!newCategory) return;
    setCategories((prev) => {
      const exists = prev.some((c) => c.id === newCategory.id);
      if (exists) return prev;
      return [newCategory, ...prev];
    });
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
      }),
    );
  }, []);

  // Listen for newCategory or receipt data passed back via serializable navigation params
  React.useEffect(() => {
    if (route?.params?.newCategory) {
      handleAddCategory(route.params.newCategory);
      navigation?.setParams({ newCategory: undefined });
    }
    if (route?.params?.newReceipt) {
      handleAddReceipt(route.params.newReceipt);
      navigation?.setParams({ newReceipt: undefined });
    }
  }, [route?.params?.newCategory, route?.params?.newReceipt]);

  const handleOpenAddReceipt = () => {
    if (navigation?.navigate) {
      navigation.navigate("RecieptModalScreen", {
        onAddCategory: handleAddCategory,
      });
    } else {
      setModalVisible(true);
    }
  };

  const handleOpenCategoryDetail = (categoryItem) => {
    if (navigation?.navigate) {
      navigation.navigate("CategoryDetail", {
        category: categoryItem,
        onUpdateCategory: (updatedCat) => {
          if (!updatedCat) return;
          setCategories((prev) =>
            prev.map((c) =>
              c.id === updatedCat.id ? { ...c, ...updatedCat } : c,
            ),
          );
        },
      });
    }
  };

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
          Manage Category
        </Text>

        {/* Add Category (+) Button */}
        <TouchableOpacity
          onPress={handleOpenAddReceipt}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={[
            styles.addButton,
            {
              backgroundColor: isDarkMode ? "#10B981" : "#0F4634",
            },
          ]}
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
            onPress={() => handleOpenCategoryDetail(cat)}
            activeOpacity={0.85}
            className="rounded-3xl p-4 mb-3.5"
            style={[
              styles.categoryCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                borderWidth: isDarkMode ? 1 : 0,
              },
            ]}
          >
            {/* Top Row: Emoji Icon, Category Name & Spent, Chevron */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1 pr-2">
                {/* Circular Emoji Icon */}
                <View
                  className="w-11 h-11 rounded-full items-center justify-center mr-3.5"
                  style={[
                    styles.emojiContainer,
                    isDarkMode && {
                      backgroundColor: "#021A13",
                      borderWidth: 1,
                      borderColor: "rgba(16, 185, 129, 0.2)",
                    },
                  ]}
                >
                  <Text style={styles.emojiText}>{cat.emoji}</Text>
                </View>

                {/* Details */}
                <View className="flex-1">
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "700",
                      color: colors.textPrimary,
                    }}
                  >
                    {cat.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: colors.textPrimary,
                      marginTop: 2,
                    }}
                  >
                    {cat.spent}
                  </Text>
                </View>
              </View>

              {/* Chevron Right */}
              <TouchableOpacity
                onPress={() => handleOpenCategoryDetail(cat)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={isDarkMode ? colors.textMuted : "#6B7280"}
                />
              </TouchableOpacity>
            </View>

            {/* Middle Row: Progress Bar */}
            <View
              className="h-1.5 w-full rounded-full overflow-hidden mt-3.5 mb-2.5"
              style={[
                styles.progressTrack,
                isDarkMode && {
                  backgroundColor: "rgba(255, 255, 255, 0.08)",
                },
              ]}
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
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textMuted,
                }}
              >
                {cat.percentage} of budget
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: colors.textPrimary,
                }}
              >
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
          onAddCategory={(cat) => {
            handleAddCategory(cat);
            setModalVisible(false);
          }}
        />
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
