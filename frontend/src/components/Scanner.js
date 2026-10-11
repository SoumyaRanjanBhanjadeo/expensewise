import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { ImageManipulator, FlipType, SaveFormat } from "expo-image-manipulator";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const FRAME_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 320);
const FRAME_HEIGHT = Math.min(SCREEN_HEIGHT * 0.52, 420);

export default function Scanner({ visible, onClose, onPhotoCaptured }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState("back");
  const [torch, setTorch] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const cameraRef = useRef(null);

  const handleClose = () => {
    setCapturedPhoto(null);
    setTorch(false);
    if (onClose) onClose();
  };

  const handleTakePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        let photo = await cameraRef.current.takePictureAsync({
          quality: 0.9,
          mirror: false,
          isImageMirror: false,
        });

        // When capturing via front camera / webcam, the viewfinder is mirrored for user perspective.
        // We flip the front-camera capture horizontally using modern ImageManipulator
        // so the resulting photo matches exactly what was seen on screen when clicked.
        if (facing === "front" && photo?.uri) {
          try {
            const context = ImageManipulator.manipulate(photo.uri);
            context.flip(FlipType.Horizontal);
            const image = await context.renderAsync();
            const saved = await image.saveAsync({
              format: SaveFormat.JPEG,
              compress: 0.9,
            });
            photo = saved;
          } catch (e) {
            console.warn("Front photo alignment skipped:", e);
          }
        }

        setCapturedPhoto(photo);
      } catch (error) {
        console.error("Error capturing photo:", error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const handleFlipPhoto = async () => {
    if (!capturedPhoto?.uri || isProcessing) return;
    try {
      setIsProcessing(true);
      const context = ImageManipulator.manipulate(capturedPhoto.uri);
      context.flip(FlipType.Horizontal);
      const image = await context.renderAsync();
      const saved = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.9,
      });
      setCapturedPhoto(saved);
    } catch (e) {
      console.error("Error flipping photo:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotatePhoto = async () => {
    if (!capturedPhoto?.uri || isProcessing) return;
    try {
      setIsProcessing(true);
      const context = ImageManipulator.manipulate(capturedPhoto.uri);
      context.rotate(90);
      const image = await context.renderAsync();
      const saved = await image.saveAsync({
        format: SaveFormat.JPEG,
        compress: 0.9,
      });
      setCapturedPhoto(saved);
    } catch (e) {
      console.error("Error rotating photo:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  const handleConfirmPhoto = () => {
    if (onPhotoCaptured && capturedPhoto) {
      onPhotoCaptured(capturedPhoto);
    }
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Permission View */}
        {!permission?.granted ? (
          <View style={styles.permissionContainer}>
            <View style={styles.permissionIconCircle}>
              <MaterialCommunityIcons
                name="camera-outline"
                size={44}
                color="#10B981"
              />
            </View>
            <Text style={styles.permissionTitle}>Camera Access Required</Text>
            <Text style={styles.permissionSubtitle}>
              ExpenseWise needs access to your camera to capture photos of paper
              receipts and bills.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={requestPermission}
              style={styles.grantButton}
            >
              <LinearGradient
                colors={["#34D399", "#10B981", "#059669"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.grantButtonGradient}
              >
                <Text style={styles.grantButtonText}>Enable Camera</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClose}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : capturedPhoto ? (
          /* Captured Photo Preview Screen */
          <View style={StyleSheet.absoluteFill}>
            <Image
              source={{ uri: capturedPhoto.uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="contain"
            />

            {/* Processing Overlay for Flip/Rotate */}
            {isProcessing && (
              <View style={styles.processingOverlay}>
                <ActivityIndicator color="#10B981" size="large" />
                <Text style={styles.processingText}>Adjusting photo...</Text>
              </View>
            )}

            {/* Top Bar on Preview */}
            <View style={styles.previewTopBar}>
              <TouchableOpacity
                onPress={handleRetake}
                activeOpacity={0.8}
                style={styles.headerIconBtn}
              >
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.headerTitleText}>Receipt Preview</Text>

              {/* Quick Actions: Rotate 90 & Horizontal Flip */}
              <View style={styles.previewTopRightActions}>
                <TouchableOpacity
                  onPress={handleRotatePhoto}
                  activeOpacity={0.8}
                  style={[styles.headerIconBtn, { marginRight: 8 }]}
                  disabled={isProcessing}
                >
                  <MaterialCommunityIcons
                    name="rotate-right"
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleFlipPhoto}
                  activeOpacity={0.8}
                  style={styles.headerIconBtn}
                  disabled={isProcessing}
                >
                  <MaterialCommunityIcons
                    name="flip-horizontal"
                    size={22}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Actions Bar on Preview */}
            <View style={styles.previewBottomBar}>
              <TouchableOpacity
                onPress={handleRetake}
                activeOpacity={0.8}
                style={styles.retakeButton}
                disabled={isProcessing}
              >
                <Ionicons
                  name="refresh"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmPhoto}
                activeOpacity={0.8}
                style={styles.usePhotoButton}
                disabled={isProcessing}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color="#FFFFFF"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.usePhotoButtonText}>Use Receipt</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Live Camera View with Shutter Button */
          <View style={StyleSheet.absoluteFill}>
            <CameraView
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              facing={facing}
              enableTorch={torch}
              mirror={false}
            />

            {/* Top Bar */}
            <View style={styles.cameraTopBar}>
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.8}
                style={styles.headerIconBtn}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <Text style={styles.headerTitleText}>Capture Receipt</Text>

              <TouchableOpacity
                onPress={() => setTorch((prev) => !prev)}
                activeOpacity={0.8}
                style={[
                  styles.headerIconBtn,
                  torch && styles.headerIconBtnActive,
                ]}
              >
                <Ionicons
                  name={torch ? "flash" : "flash-off"}
                  size={20}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

            {/* Receipt Alignment Frame Guide */}
            <View style={styles.frameContainer}>
              <View style={styles.receiptGuideFrame}>
                {/* 4 Corner Accent Brackets */}
                <View style={[styles.cornerBracket, styles.topLeftBracket]} />
                <View style={[styles.cornerBracket, styles.topRightBracket]} />
                <View
                  style={[styles.cornerBracket, styles.bottomLeftBracket]}
                />
                <View
                  style={[styles.cornerBracket, styles.bottomRightBracket]}
                />
              </View>
              <Text style={styles.guideInstructionText}>
                Align receipt or bill inside frame
              </Text>
            </View>

            {/* Bottom Controls Bar with Shutter Button */}
            <View style={styles.cameraBottomBar}>
              {/* Flip Camera Button */}
              <TouchableOpacity
                onPress={() =>
                  setFacing((prev) => (prev === "back" ? "front" : "back"))
                }
                activeOpacity={0.8}
                style={styles.sideControlBtn}
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={26}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {/* Shutter Capture Button */}
              <TouchableOpacity
                onPress={handleTakePicture}
                activeOpacity={0.7}
                disabled={isCapturing}
                style={styles.shutterOuterRing}
              >
                {isCapturing ? (
                  <ActivityIndicator color="#10B981" size="small" />
                ) : (
                  <View style={styles.shutterInnerCircle} />
                )}
              </TouchableOpacity>

              {/* Placeholder to balance row */}
              <View style={styles.sideControlBtnPlaceholder} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: "#050B08",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  permissionIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1.5,
    borderColor: "rgba(16, 185, 129, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 10,
  },
  permissionSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  grantButton: {
    width: "100%",
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 14,
  },
  grantButtonGradient: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  grantButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.6)",
  },
  cameraTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 10,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconBtnActive: {
    backgroundColor: "#10B981",
  },
  headerTitleText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  frameContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  receiptGuideFrame: {
    width: FRAME_WIDTH,
    height: FRAME_HEIGHT,
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  cornerBracket: {
    position: "absolute",
    width: 32,
    height: 32,
    borderColor: "#10B981",
  },
  topLeftBracket: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRightBracket: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeftBracket: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRightBracket: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  guideInstructionText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 18,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cameraBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 36,
    paddingBottom: 48,
    paddingTop: 24,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    zIndex: 10,
  },
  shutterOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  sideControlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  sideControlBtnPlaceholder: {
    width: 48,
    height: 48,
  },
  previewTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 52,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 10,
  },
  previewBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 44,
    paddingTop: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 10,
  },
  retakeButton: {
    flex: 1,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 14,
    borderRadius: 20,
    marginRight: 10,
  },
  retakeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  usePhotoButton: {
    flex: 1.2,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    borderRadius: 20,
    marginLeft: 10,
  },
  usePhotoButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  previewTopRightActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  },
  processingText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 12,
  },
});
