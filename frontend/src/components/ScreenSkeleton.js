import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Skeleton from "react-native-reanimated-skeleton";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PADDING = 20;
const CONTENT_WIDTH = SCREEN_WIDTH - PADDING * 2;

const BONE_COLOR = "#DDECE3";
const HIGHLIGHT_COLOR = "#F4F9F6";

export function TransactionSkeleton() {
  const layout = [
    // Header Bar
    {
      key: "headerRow",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: CONTENT_WIDTH,
      marginTop: 52,
      marginBottom: 16,
      children: [
        { key: "backBtn", width: 44, height: 44, borderRadius: 22 },
        { key: "headerTitle", width: 140, height: 24, borderRadius: 8 },
        { key: "filterBtn", width: 44, height: 44, borderRadius: 22 },
      ],
    },
    // Filter Pills Row
    {
      key: "pillsRow",
      flexDirection: "row",
      width: CONTENT_WIDTH,
      marginBottom: 20,
      children: [
        { key: "pill1", width: 62, height: 34, borderRadius: 17, marginRight: 10 },
        { key: "pill2", width: 68, height: 34, borderRadius: 17, marginRight: 10 },
        { key: "pill3", width: 68, height: 34, borderRadius: 17, marginRight: 10 },
        { key: "pill4", width: 68, height: 34, borderRadius: 17 },
      ],
    },
    // Group 1: Today
    { key: "groupTitle1", width: 70, height: 16, borderRadius: 6, marginBottom: 10, marginLeft: 4 },
    {
      key: "card1",
      width: CONTENT_WIDTH,
      height: 80,
      borderRadius: 26,
      marginBottom: 18,
    },
    // Group 2: Yesterday
    { key: "groupTitle2", width: 90, height: 16, borderRadius: 6, marginBottom: 10, marginLeft: 4 },
    {
      key: "card2",
      width: CONTENT_WIDTH,
      height: 240,
      borderRadius: 26,
      marginBottom: 18,
    },
    // Group 3: 20 May 2026
    { key: "groupTitle3", width: 100, height: 16, borderRadius: 6, marginBottom: 10, marginLeft: 4 },
    {
      key: "card3",
      width: CONTENT_WIDTH,
      height: 180,
      borderRadius: 26,
    },
  ];

  return (
    <View style={styles.container}>
      <Skeleton
        isLoading={true}
        layout={layout}
        boneColor={BONE_COLOR}
        highlightColor={HIGHLIGHT_COLOR}
        animationType="pulse"
        duration={1000}
        containerStyle={styles.skeletonContainer}
      />
    </View>
  );
}

export function ReceiptSkeleton() {
  const layout = [
    // Header Bar
    {
      key: "headerRow",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: CONTENT_WIDTH,
      marginTop: 52,
      marginBottom: 20,
      children: [
        { key: "backBtn", width: 44, height: 44, borderRadius: 22 },
        { key: "headerTitle", width: 170, height: 24, borderRadius: 8 },
        { key: "addBtn", width: 44, height: 44, borderRadius: 22 },
      ],
    },
    // Category Cards List
    {
      key: "catCard1",
      width: CONTENT_WIDTH,
      height: 112,
      borderRadius: 24,
      marginBottom: 14,
    },
    {
      key: "catCard2",
      width: CONTENT_WIDTH,
      height: 112,
      borderRadius: 24,
      marginBottom: 14,
    },
    {
      key: "catCard3",
      width: CONTENT_WIDTH,
      height: 112,
      borderRadius: 24,
      marginBottom: 14,
    },
    {
      key: "catCard4",
      width: CONTENT_WIDTH,
      height: 112,
      borderRadius: 24,
      marginBottom: 14,
    },
    {
      key: "catCard5",
      width: CONTENT_WIDTH,
      height: 112,
      borderRadius: 24,
    },
  ];

  return (
    <View style={styles.container}>
      <Skeleton
        isLoading={true}
        layout={layout}
        boneColor={BONE_COLOR}
        highlightColor={HIGHLIGHT_COLOR}
        animationType="pulse"
        duration={1000}
        containerStyle={styles.skeletonContainer}
      />
    </View>
  );
}

export function DashboardSkeleton() {
  const layout = [
    // Header Row
    {
      key: "headerRow",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: CONTENT_WIDTH,
      marginTop: 52,
      marginBottom: 16,
      children: [
        { key: "menuBtn", width: 44, height: 44, borderRadius: 22 },
        { key: "avatarBtn", width: 44, height: 44, borderRadius: 22 },
      ],
    },
    // Monthly Overview
    { key: "monthlyTitle", width: 130, height: 16, borderRadius: 6, marginBottom: 8 },
    { key: "monthlyTotal", width: 220, height: 38, borderRadius: 8, marginBottom: 14 },
    {
      key: "monthlyOverviewBar",
      width: CONTENT_WIDTH,
      height: 54,
      borderRadius: 24,
      marginBottom: 18,
    },
    // Today's Spend Card
    {
      key: "todayCard",
      width: CONTENT_WIDTH,
      height: 130,
      borderRadius: 24,
      marginBottom: 18,
    },
    // Quick Actions
    {
      key: "actionsRow",
      flexDirection: "row",
      justifyContent: "space-between",
      width: CONTENT_WIDTH,
      marginBottom: 20,
      children: [
        { key: "action1", width: (CONTENT_WIDTH - 16) / 3, height: 64, borderRadius: 18 },
        { key: "action2", width: (CONTENT_WIDTH - 16) / 3, height: 64, borderRadius: 18 },
        { key: "action3", width: (CONTENT_WIDTH - 16) / 3, height: 64, borderRadius: 18 },
      ],
    },
    // Recent Transactions Bottom Sheet
    {
      key: "bottomSheet",
      width: CONTENT_WIDTH,
      height: 200,
      borderTopLeftRadius: 32,
      borderTopRightRadius: 32,
    },
  ];

  return (
    <View style={styles.container}>
      <Skeleton
        isLoading={true}
        layout={layout}
        boneColor={BONE_COLOR}
        highlightColor={HIGHLIGHT_COLOR}
        animationType="pulse"
        duration={1000}
        containerStyle={styles.skeletonContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF4F1",
    alignItems: "center",
  },
  skeletonContainer: {
    width: CONTENT_WIDTH,
    alignItems: "flex-start",
  },
});
