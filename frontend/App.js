import React from "react";
import { View } from "react-native";
import "./global.css";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "#021812" }}>
      <AppNavigator />
    </View>
  );
}
