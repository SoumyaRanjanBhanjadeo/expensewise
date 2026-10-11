import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient as SvgGradient,
  Stop,
} from "react-native-svg";
import BottomBar from "../components/BottomBar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MONTHS_DATA = [
  { label: "jan", val: 55, x: 20, y: 75 },
  { label: "feb", val: 68, x: 65, y: 55 },
  { label: "mar", val: 60, x: 110, y: 65 },
  { label: "apr", val: 42, x: 155, y: 88 },
  { label: "may", val: 86, x: 200, y: 38 },
  { label: "jun", val: 74, x: 245, y: 50 },
  { label: "jul", val: 82, x: 290, y: 40 },
];

export default function InsightScreen({
  navigation,
  hideBottomBar = false,
  onBack,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("may");
  const [selectedCategory, setSelectedCategory] = useState("food");

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate("Dashboard");
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
      <View className="flex-row items-center justify-between px-5 pt-[52px] pb-3">
        {/* Back Button */}
        <TouchableOpacity
          onPress={handleBack}
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={styles.headerIconButton}
        >
          <Ionicons name="arrow-back" size={20} color="#1F382C" />
        </TouchableOpacity>

        {/* Header Title */}
        <Text className="text-[20px] font-bold text-[#111827]">
          Insights
        </Text>

        {/* Filter / Settings Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-11 h-11 rounded-full items-center justify-center"
          style={styles.headerIconButton}
          onPress={() => {}}
        >
          <Ionicons name="options-outline" size={20} color="#1F382C" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: hideBottomBar ? 110 : 130 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10B981"
            colors={["#10B981"]}
          />
        }
      >
        {/* Section 1: Today's Spend */}
        <View style={styles.todaySpendSection}>
          <Text style={styles.sectionSmallTitle}>Today's Spend</Text>

          <View style={styles.todayAmountRow}>
            <Text style={styles.todayAmountText}>₹250.00</Text>

            <View style={styles.yesterdayBadgeContainer}>
              <View style={styles.downBadge}>
                <Ionicons name="trending-down" size={13} color="#166534" />
                <Text style={styles.downBadgeText}>6%</Text>
              </View>
              <Text style={styles.thanYesterdayText}>than yesterday</Text>
            </View>
          </View>

          <Text style={styles.todaySubtitle}>Mostly on Food & Dining</Text>
        </View>

        {/* Section 2: Monthly Comparison Card (Dark Emerald Gradient Card) */}
        <LinearGradient
          colors={["#185F44", "#1E6E4E", "#278962"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.monthlyCard}
        >
          <Text style={styles.monthlyCardTitle}>Monthly Comparison</Text>

          {/* This Month vs Last Month comparison row */}
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonCol}>
              <Text style={styles.comparisonLabel}>This Month</Text>
              <Text style={styles.comparisonValue}>₹7620.00</Text>
            </View>

            {/* Comparison Divider Icon */}
            <View style={styles.comparisonDivider}>
              <View style={styles.comparisonDividerCircle}>
                <MaterialCommunityIcons
                  name="circle-slice-4"
                  size={16}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View style={styles.comparisonCol}>
              <Text style={styles.comparisonLabel}>Last Month</Text>
              <Text style={styles.comparisonValue}>₹6220.00</Text>
            </View>
          </View>

          {/* 7 Month Trend Subheading */}
          <Text style={styles.trendSubheading}>7 Month Trend</Text>

          {/* Trend Chart Area with Vertical Stripes and Smooth Spline Curve */}
          <View style={styles.chartContainer}>
            {/* Background vertical translucent bar stripes */}
            <View style={styles.chartStripesLayer}>
              {Array.from({ length: 22 }).map((_, i) => (
                <View key={i} style={styles.chartVerticalStripe} />
              ))}
            </View>

            {/* SVG Curve Line Graph */}
            <Svg
              width={SCREEN_WIDTH - 84}
              height={110}
              viewBox="0 0 310 110"
              style={StyleSheet.absoluteFill}
            >
              <Defs>
                <SvgGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </SvgGradient>
              </Defs>

              {/* Smooth trend line path */}
              <Path
                d="M 15 75 Q 40 68 65 55 T 110 65 T 155 88 Q 175 75 200 38 T 245 50 Q 270 42 295 40"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth={2.8}
                strokeLinecap="round"
              />

              {/* Highlight dot for May */}
              <Circle cx={200} cy={38} r={4} fill="#FFFFFF" />
            </Svg>

            {/* Floating Glass Tooltip for May */}
            <View style={styles.mayTooltipBadge}>
              <Text style={styles.mayTooltipMonth}>May</Text>
              <Text style={styles.mayTooltipPercent}>86%</Text>
            </View>

            {/* X-Axis Month Labels */}
            <View style={styles.monthsRow}>
              {MONTHS_DATA.map((item) => {
                const isActive = item.label === selectedMonth;
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={() => setSelectedMonth(item.label)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.monthLabelText,
                        isActive && styles.monthLabelTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </LinearGradient>

        {/* Section 3: Category Breakdown Card (White Card) */}
        <View style={styles.categoryCard}>
          <View style={styles.categoryCardHeader}>
            <Text style={styles.categoryCardTitle}>Category Breakdown</Text>
            <Text style={styles.categoryCountText}>
              Total Categories{" "}
              <Text style={{ fontWeight: "800", color: "#0F172A" }}>6</Text>
            </Text>
          </View>

          <Text style={styles.totalSpendLabel}>Total Spendings</Text>
          <Text style={styles.totalSpendValue}>₹7620.00</Text>

          {/* Bar Chart Visualization */}
          <View style={styles.barChartContainer}>
            {/* Bar 1: Food & Beverages (Dark Black) */}
            <View style={styles.barColumn}>
              <View style={[styles.barPill, styles.barDark]} />
            </View>

            {/* Bar 2: Transportation (Lime Green) */}
            <View style={styles.barColumn}>
              <View style={[styles.barPill, styles.barLime]} />
            </View>

            {/* Bar 3: Shopping (Mint / Sage) */}
            <View style={styles.barColumn}>
              <View style={[styles.barPill, styles.barMint]} />
            </View>

            {/* Bar 4: Highlighted Category (Food - with pizza badge and tooltip) */}
            <View style={[styles.barColumn, styles.activeCategoryColumn]}>
              {/* Category Icon Badge */}
              <View style={styles.categoryIconCircle}>
                <Text style={{ fontSize: 16 }}>🍕</Text>
              </View>

              {/* Translucent Frosted Capsule with Amount and Percentage */}
              <View style={styles.activePillCapsule}>
                <Text style={styles.activePillAmount}>₹2450</Text>
                <Text style={styles.activePillPercent}>86%</Text>
                <View style={styles.activePillStem} />
              </View>
            </View>

            {/* Bar 5: Other / Entertainment (Light gray) */}
            <View style={styles.barColumn}>
              <View style={[styles.barPill, styles.barGray]} />
            </View>
          </View>

          {/* Legend Row at the Bottom */}
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#0F172A" }]}
              />
              <Text style={styles.legendText}>Food & Beverages</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#84CC16" }]}
              />
              <Text style={styles.legendText}>Transportation</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#10B981" }]}
              />
              <Text style={styles.legendText}>Shopping</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Bar if not rendered within MainScreen */}
      {!hideBottomBar && (
        <BottomBar
          activeTab="analytics"
          onTabPress={(tab) => {
            if (tab === "home") {
              handleBack();
            } else if (tab === "transactions") {
              navigation?.navigate("Transactions");
            } else if (tab === "receipts") {
              navigation?.navigate("Receipts");
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
    backgroundColor: "#EEF4F1",
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
  },
  todaySpendSection: {
    marginBottom: 20,
  },
  sectionSmallTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 6,
  },
  todayAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 4,
  },
  todayAmountText: {
    fontSize: 38,
    fontWeight: "800",
    color: "#050B08",
    letterSpacing: -1,
    marginRight: 10,
  },
  yesterdayBadgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  downBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 6,
  },
  downBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#166534",
    marginLeft: 2,
  },
  thanYesterdayText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  todaySubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },
  monthlyCard: {
    borderRadius: 28,
    padding: 22,
    marginBottom: 20,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  monthlyCardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  comparisonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  comparisonCol: {
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.75)",
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  comparisonDivider: {
    paddingHorizontal: 8,
  },
  comparisonDividerCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  trendSubheading: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.85)",
    marginBottom: 8,
  },
  chartContainer: {
    height: 140,
    position: "relative",
    justifyContent: "flex-end",
  },
  chartStripesLayer: {
    position: "absolute",
    top: 15,
    left: 4,
    right: 4,
    bottom: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  chartVerticalStripe: {
    width: 3.5,
    height: "90%",
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderRadius: 2,
  },
  mayTooltipBadge: {
    position: "absolute",
    top: 4,
    left: 176,
    backgroundColor: "rgba(255, 255, 255, 0.26)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    alignItems: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mayTooltipMonth: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
    lineHeight: 14,
  },
  mayTooltipPercent: {
    fontSize: 12,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 15,
  },
  monthsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 6,
    marginTop: 8,
  },
  monthLabelText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.65)",
    textTransform: "lowercase",
  },
  monthLabelTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 4,
  },
  categoryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  categoryCardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  categoryCountText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  totalSpendLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  totalSpendValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.6,
    marginBottom: 16,
  },
  barChartContainer: {
    height: 180,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  barColumn: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: "100%",
  },
  barPill: {
    width: 8,
    borderRadius: 4,
  },
  barDark: {
    height: 80,
    backgroundColor: "#0F172A",
  },
  barLime: {
    height: 105,
    backgroundColor: "#84CC16",
  },
  barMint: {
    height: 125,
    backgroundColor: "#A7F3D0",
  },
  barGray: {
    height: 110,
    backgroundColor: "#E2E8F0",
  },
  activeCategoryColumn: {
    alignItems: "center",
  },
  categoryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  activePillCapsule: {
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    borderRadius: 18,
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 4,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  activePillAmount: {
    fontSize: 12,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },
  activePillPercent: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    marginBottom: 8,
  },
  activePillStem: {
    width: 8,
    height: 70,
    backgroundColor: "#165E42",
    borderRadius: 4,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
});
