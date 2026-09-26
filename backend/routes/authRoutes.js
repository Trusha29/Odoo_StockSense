const express = require("express");

const {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Signup
router.post("/signup", signup);


// Login
router.post("/login", login);


// Forgot password - send OTP
router.post("/forgot-password", forgotPassword);


// Verify OTP
router.post("/verify-otp", verifyOtp);


// Reset password
router.post("/reset-password", resetPassword);


// Get logged-in user
router.get("/me", protect, getMe);


module.exports = router;