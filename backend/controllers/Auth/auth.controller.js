const crypto = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/auth.model");
const Otp = require("../../models/otp.model");
const {
  sendWelcomeEmail,
  sendOtpEmail,
  sendResetPasswordEmail,
} = require("../../config/mailer");

const BCRYPT_SALT_ROUNDS = 10;
const OTP_TTL_MS = 10 * 60 * 1000; // OTP stays valid for 10 minutes

// Generates a random 6-digit code
const generateOtp = () => crypto.randomInt(100000, 1000000).toString();

// Finds the latest OTP for a user that is still unused and un-expired
const findValidOtp = async (userId) => {
  return Otp.findOne({
    userId,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

// Creates a long-lived session cookie that JS code cannot read
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  });
};

const createAccount = async (req, res) => {
  try {
    const { username, email, password, provider, biometricLogin } = req.body;

    // The basic details every new account needs
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required",
      });
    }

    // Look for an existing account with the same email
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      // Bring a soft-deleted account back to life instead of creating a duplicate
      if (existingUser.deletedAt) {
        existingUser.username = username;
        existingUser.password = password;
        existingUser.provider = provider || "email";
        existingUser.biometricLogin = biometricLogin || false;
        existingUser.isActive = true;
        existingUser.deletedAt = null;
        await existingUser.save();
        return res.status(201).json({
          success: true,
          message:
            "Account reactivated successfully. Please sign in to continue.",
          data: { user: existingUser },
        });
      }

      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // Save the new user without automatically logging them in
    const user = await User.create({
      username,
      email,
      password,
      provider: provider || "email",
      biometricLogin: biometricLogin || false,
    });

    // Send welcome email
    sendWelcomeEmail(user.email, user.username).catch((err) => {
      console.warn("Could not send welcome email:", err.message);
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Please sign in to continue.",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Can't create your account right now. Please try again in a moment.",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Email and password must be sent together
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // password is hidden by default, so ask Mongo to include it here
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // A Google login is only allowed if the email already exists in the database
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "This email does not exist in our records",
      });
    }

    if (user.deletedAt || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    // Google sign-in accounts have no password, so refuse a password login
    if (user.provider === "google" && !user.password) {
      return res.status(401).json({
        success: false,
        message:
          "This account uses Google sign-in. Please continue with Google",
      });
    }

    // Check the typed password against the stored hash
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Log the user in by storing their token in the httpOnly cookie
    user.password = undefined;
    const token = signToken(user);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Couldn't sign you in right now. Please try again in a moment.",
      error: error.message,
    });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email, username, avatar, tokenId } = req.body;

    // The Google profile always gives us an email and a display name
    if (!email || !username) {
      return res
        .status(400)
        .json({ success: false, message: "Email and username are required" });
    }

    // Verify the Google token when it is sent, so nobody can fake a login
    if (tokenId) {
      const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${tokenId}`,
      );
      if (!response.ok) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid Google token" });
      }
      const googleUser = await response.json();
      if (
        googleUser.email !== email.toLowerCase().trim() ||
        String(googleUser.email_verified) !== "true"
      ) {
        return res.status(401).json({
          success: false,
          message: "Google email could not be verified",
        });
      }
    }

    // Look for a manual account created with this email
    let user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      // No account yet, so create one automatically from the Google profile
      user = await User.create({
        username,
        email,
        avatar,
        provider: "google",
      });

      // Send the new user a welcome email through SMTP
      try {
        await sendWelcomeEmail(user.email, user.username);
      } catch (emailError) {
        console.error("Welcome email failed:", emailError.message);
      }
    } else {
      // Account exists, keep its avatar and name fresh from Google
      if (user.avatar !== avatar) {
        user.avatar = avatar;
        user.username = username;
        await user.save();
      }
    }

    if (user.deletedAt || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "This account has been deactivated",
      });
    }

    // Log the user in by storing their token in the httpOnly cookie
    const token = signToken(user);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      data: { user, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Couldn't sign you in with Google right now. Please try again in a moment.",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // If no account exists with this email, return error
    if (!user || user.deletedAt || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: "There is no account registered with this email address.",
      });
    }

    // Google-only accounts have no password to reset
    if (user.provider === "google" && !user.password) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google sign-in and has no password to reset",
      });
    }

    // Remove old unused codes so only the latest one actually works
    await Otp.deleteMany({ userId: user._id, isUsed: false });

    // Store a hashed OTP so the code itself is never saved as plain text
    const otp = generateOtp();
    await Otp.create({
      userId: user._id,
      otpHash: await bcrypt.hash(otp, BCRYPT_SALT_ROUNDS),
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });

    // Send the 6-digit code to the user's email via SMTP
    await sendOtpEmail(user.email, user.username, otp);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    const errorDetails = error?.errors
      ? error.errors.map((e) => e.message || String(e)).join("; ")
      : error?.message || String(error);
    console.error("Forgot password error:", errorDetails, error);
    return res.status(500).json({
      success: false,
      message:
        "Couldn't send the reset code right now. Please try again in a moment.",
      error: errorDetails,
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const otpDoc = user ? await findValidOtp(user._id) : null;

    // Only accept the code when it matches the stored hash
    if (otpDoc && (await bcrypt.compare(otp, otpDoc.otpHash))) {
      return res
        .status(200)
        .json({ success: true, message: "OTP verified successfully" });
    }

    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired OTP" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Couldn't check the code right now. Please try again in a moment.",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP and the new password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    const otpDoc = user ? await findValidOtp(user._id) : null;

    // Never reset a password unless a valid OTP is provided again
    if (!otpDoc || !(await bcrypt.compare(otp, otpDoc.otpHash))) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Consume the OTP so this code cannot be reused
    otpDoc.isUsed = true;
    await otpDoc.save();

    // The model hashes the new password automatically before saving
    user.password = password;
    await user.save();

    // Send password reset confirmation email
    sendResetPasswordEmail(user.email, user.username).catch((err) => {
      console.warn(
        "Could not send password reset confirmation email:",
        err.message,
      );
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Couldn't update your password right now. Please try again in a moment.",
      error: error.message,
    });
  }
};

const getMe = async (req, res) => {
  try {
    // Load the token's user and make sure the account is still active
    const user = await User.findOne({
      _id: req.user._id,
      isActive: true,
      deletedAt: null,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      data: { user },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Couldn't load your profile right now. Please try again in a moment.",
      error: error.message,
    });
  }
};

// Biometric Login: signs in an authenticated device user and returns their full profile and token
const biometricLogin = async (req, res) => {
  try {
    const { email } = req.body;

    let query = { isActive: true, deletedAt: null };
    if (email && email.trim()) {
      query.email = email.toLowerCase().trim();
    }

    // Look for the requested user, or the most recently updated active account
    let user = await User.findOne(query).sort({ updatedAt: -1 });

    if (!user && email) {
      // Fallback if specific email was not found: find the latest active user
      user = await User.findOne({ isActive: true, deletedAt: null }).sort({
        updatedAt: -1,
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user account found. Please sign up or log in first.",
      });
    }

    const token = signToken(user);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: "Biometric login successful",
      data: { user, token },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Biometric authentication failed on server",
      error: error.message,
    });
  }
};

// Creates a signed token that holds the user id
const signToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "30d",
  });
};

module.exports = {
  createAccount,
  login,
  googleLogin,
  biometricLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe,
};
