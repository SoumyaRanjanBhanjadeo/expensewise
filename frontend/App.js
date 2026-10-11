import React from "react";
import { View } from "react-native";
import "./global.css";
import AppNavigator from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: "#021812" }}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </View>
  );
}