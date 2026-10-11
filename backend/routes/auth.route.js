const express = require("express");
const {
  createAccount,
  login,
  googleLogin,
  biometricLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
} = require("../controllers/Auth/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", createAccount);
router.post("/login", login);
router.post("/google", googleLogin);
router.post("/biometric", biometricLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getMe);

module.exports = router;