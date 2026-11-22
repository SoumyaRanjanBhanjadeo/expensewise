import React, { forwardRef } from "react";
import { View, Image, StyleSheet } from "react-native";

const ScreenBackground = forwardRef(function ScreenBackground(
  {
    source,
    style,
    imageStyle,
    imageRef,
    children,
    resizeMode = "cover",
    blurRadius,
    defaultSource,
    onLoad,
    onLoadEnd,
    onLoadStart,
    onError,
    ...restProps
  },
  ref,
) {
  return (
    <View ref={ref} style={[styles.container, style]} {...restProps}>
      {source && (
        <Image
          ref={imageRef}
          source={source}
          style={[StyleSheet.absoluteFill, styles.image, imageStyle]}
          resizeMode={resizeMode}
          blurRadius={blurRadius}
          defaultSource={defaultSource}
          onLoad={onLoad}
          onLoadEnd={onLoadEnd}
          onLoadStart={onLoadStart}
          onError={onError}
          pointerEvents="none"
          accessibilityIgnoresInvertColors
        />
      )}
      {children}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default ScreenBackground;
