const jwt = require("jsonwebtoken");
const User = require("../models/auth.model");

// Protects routes by checking the login token and loading the user
const authMiddleware = async (req, res, next) => {
  try {
    // Read the token from the httpOnly cookie, or the Authorization header for mobile apps
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    // Reject requests that send no token at all
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Login required" });
    }

    // Confirm the token was signed by us and is not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the active account this token belongs to
    const user = await User.findOne({
      _id: decoded.id,
      isActive: true,
      deletedAt: null,
    });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Account not found or inactive" });
    }

    // Attach the user so the controller can use it
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired login" });
  }
};

module.exports = authMiddleware;