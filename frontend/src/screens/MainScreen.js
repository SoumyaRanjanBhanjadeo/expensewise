import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import DashboardScreen from "./DashboardScreen";
import TransactionScreen from "./TransactionScreen";
import RecieptScreen from "./RecieptScreen";
import InsightScreen from "./InsightScreen";
import BottomBar from "../components/BottomBar";
import { useTheme } from "../context/ThemeContext";

export default function MainScreen({ navigation, route }) {
  const { colors } = useTheme();
  const initialTab = route?.params?.initialTab || "home";
  const [activeTab, setActiveTab] = useState(initialTab);

  const handleTabPress = useCallback((tab) => {
    if (tab === "scan") return;
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    if (route?.params?.initialTab && route.params.initialTab !== activeTab) {
      setActiveTab(route.params.initialTab);
    }
  }, [route?.params?.initialTab]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Active Screen Area */}
      <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
        {(activeTab === "home" ||
          (activeTab !== "transactions" &&
            activeTab !== "receipts" &&
            activeTab !== "analytics")) && (
          <DashboardScreen
            navigation={navigation}
            hideBottomBar={true}
            onNavigateToTransactions={() => handleTabPress("transactions")}
          />
        )}
        {activeTab === "transactions" && (
          <TransactionScreen
            navigation={navigation}
            hideBottomBar={true}
            onBack={() => handleTabPress("home")}
          />
        )}
        {activeTab === "analytics" && (
          <InsightScreen
            navigation={navigation}
            hideBottomBar={true}
            onBack={() => handleTabPress("home")}
          />
        )}
        {activeTab === "receipts" && (
          <RecieptScreen
            navigation={navigation}
            route={route}
            hideBottomBar={true}
            onBack={() => handleTabPress("home")}
          />
        )}
      </View>

      {/* Persistent Floating Bottom Bar */}
      <BottomBar activeTab={activeTab} onTabPress={handleTabPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});
