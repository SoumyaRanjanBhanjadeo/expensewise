import React from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import DashboardScreen from "../screens/DashboardScreen";

const Stack = createNativeStackNavigator();

// Custom Dark Theme to eliminate white flash during screen transitions
const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#021812",
    card: "#021812",
  },
};

export default function AppNavigator() {
  return (
    <NavigationContainer theme={CustomTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#021812" },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ animation: "fade" }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ animation: "fade" }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ animation: "fade" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
