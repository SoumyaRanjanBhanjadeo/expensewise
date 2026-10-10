import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SplashScreen({ navigation, onFinish }) {
  // Animation values
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(25)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const glowScale = useRef(new Animated.Value(1)).current;
  const progressBar = useRef(new Animated.Value(0)).current;

  // Percentage number state
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    // Listen to progress bar animation to display live percentage
    const listenerId = progressBar.addListener(({ value }) => {
      setPercent(Math.min(100, Math.round(value * 100)));
    });

    // 1. Entrance sequence
    Animated.sequence([
      // Logo spring and fade in
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 45,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
      // Text fade + slide up
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 2. Ambient pulse glow for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowScale, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 3. Progress bar fill & auto navigate to Login
    Animated.timing(progressBar, {
      toValue: 1,
      duration: 2600,
      useNativeDriver: false,
    }).start(() => {
      setTimeout(() => {
        if (navigation && navigation.replace) {
          navigation.replace("Login");
        } else if (onFinish) {
          onFinish();
        }
      }, 300);
    });

    return () => {
      progressBar.removeListener(listenerId);
    };
  }, [navigation, onFinish]);

  const TRACK_WIDTH = 220;

  const progressWidth = progressBar.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRACK_WIDTH],
  });

  return (
    <View className="flex-1 bg-[#021812] relative overflow-hidden">
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* Atmospheric Background Gradients */}
      <LinearGradient
        colors={["#03261C", "#021A13", "#010F0B"]}
        className="absolute inset-0"
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Ambient background glows */}
      <View className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <View className="absolute top-1/3 -right-28 w-96 h-96 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
      <View className="absolute bottom-10 left-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Main Center Content */}
      <View className="flex-1 items-center justify-center px-8 z-10">
        {/* Logo Container with Ambient Glow */}
        <View className="items-center justify-center mb-8 relative">
          {/* Pulsing Backlight Glow */}
          <Animated.View
            style={{
              transform: [{ scale: glowScale }],
              opacity: logoOpacity,
            }}
            className="absolute w-52 h-52 rounded-full bg-emerald-400/20 blur-2xl"
          />

          {/* Golden accent ring glow */}
          <View className="absolute w-44 h-44 rounded-full bg-amber-400/15 blur-xl" />

          {/* Icon Box */}
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            }}
            className="p-1 rounded-[36px] bg-emerald-500/20 border border-emerald-400/40 shadow-2xl shadow-emerald-950"
          >
            <View className="rounded-[32px] overflow-hidden bg-[#04281E]">
              <Image
                source={require("../../assets/expenseicon.png")}
                style={{ width: 135, height: 135, borderRadius: 28 }}
                resizeMode="cover"
              />
            </View>
          </Animated.View>
        </View>

        {/* Brand Name & Tagline */}
        <Animated.View
          style={{
            opacity: contentOpacity,
            transform: [{ translateY: contentSlide }],
          }}
          className="items-center"
        >
          <View className="flex-row items-center mb-2">
            <Text className="text-4xl font-extrabold text-white tracking-tight">
              Expense
            </Text>
            <Text className="text-4xl font-extrabold text-emerald-400 tracking-tight">
              Wise
            </Text>
          </View>

          <Text className="text-emerald-100/70 text-base text-center font-medium max-w-[280px] leading-relaxed">
            Master your spending. Grow your wealth. Effortlessly.
          </Text>
        </Animated.View>
      </View>

      {/* Bottom Section: Progress bar with percentage */}
      <View className="w-full px-10 pb-14 z-10 items-center">
        {/* Sleek Gradient Loading Track */}
        <View
          style={{
            width: TRACK_WIDTH,
            height: 8,
            backgroundColor: "rgba(3, 38, 28, 0.9)",
            borderRadius: 9999,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: "rgba(16, 185, 129, 0.3)",
            marginBottom: 12,
          }}
        >
          <Animated.View
            style={{
              width: progressWidth,
              height: "100%",
              borderRadius: 9999,
              overflow: "hidden",
            }}
          >
            <LinearGradient
              colors={["#10B981", "#34D399", "#F59E0B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: TRACK_WIDTH,
                height: "100%",
              }}
            />
          </Animated.View>
        </View>

        {/* Progress Percentage Display */}
        <Text className="text-emerald-400 font-bold text-sm tracking-widest">
          {percent}%
        </Text>
      </View>
    </View>
  );
}
