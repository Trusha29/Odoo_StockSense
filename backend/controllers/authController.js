const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const PasswordResetOtp = require("../models/PasswordResetOtp");
const { sendOtpEmail } = require("../services/emailService");
const generateOtp = require("../utils/generateOtp");
const generateToken = require("../utils/generateToken");


// ======================================================
// SIGN UP
// ======================================================

const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      confirmPassword,
      role
    } = req.body;

    // Check required fields
    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !confirmPassword ||
      !role
    ) {
      return res.status(400).json({
        message: "Please fill all required fields."
      });
    }

    // Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    // Check email
    const existingEmail = await User.findOne({
      email: email.toLowerCase()
    });

    if (existingEmail) {
      return res.status(409).json({
        message: "Email is already registered."
      });
    }

    // Check phone
    const existingPhone = await User.findOne({
      phone
    });

    if (existingPhone) {
      return res.status(409).json({
        message: "Phone number is already registered."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error during signup."
    });
  }
};


// ======================================================
// LOGIN
// ======================================================

const login = async (req, res) => {
  try {
    const {
      identifier,
      password
    } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Please enter email/phone and password."
      });
    }

    // Search using email OR phone
    const user = await User.findOne({
      $or: [
        {
          email: identifier.toLowerCase()
        },
        {
          phone: identifier
        }
      ]
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email/phone or password."
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email/phone or password."
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login."
    });
  }
};


// ======================================================
// FORGOT PASSWORD - SEND OTP
// ======================================================

const forgotPassword = async (req, res) => {

  try {

    const { identifier } = req.body;


    if (!identifier) {

      return res.status(400).json({
        message: "Email or phone number is required."
      });

    }


    const user = await User.findOne({

      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier }
      ]

    });


    // Generic response prevents account enumeration
    if (!user) {

      return res.status(200).json({

        message:
          "If an account exists, a password reset OTP has been sent."

      });

    }


    // Delete previous OTP requests
    await PasswordResetOtp.deleteMany({
      userId: user._id
    });


    // Generate new OTP
    const otp = generateOtp();


    // OTP expires after 5 minutes
    const expiresAt = new Date(
      Date.now() + 5 * 60 * 1000
    );


    // Hash OTP before storing
    const hashedOtp = await bcrypt.hash(otp, 10);


    // Save OTP
    await PasswordResetOtp.create({

      userId: user._id,

      identifier: identifier.toLowerCase(),

      otp: hashedOtp,

      expiresAt: expiresAt,

      attempts: 0,

      verified: false

    });


    // =========================================
    // SEND OTP
    // =========================================

    if (user.email === identifier.toLowerCase()) {

      await sendOtpEmail(user.email, otp);

      console.log(
        `OTP sent to email: ${user.email}`
      );

    }

    else if (user.phone === identifier) {

      console.log(
        `Password reset OTP for phone ${user.phone}: ${otp}`
      );

    }


    return res.status(200).json({

      message:
        "Password reset OTP sent successfully."

    });


  } catch (error) {

    console.error(
      "Forgot password error:",
      error
    );


    return res.status(500).json({

      message:
        "Unable to send password reset OTP."

    });

  }

};


// ======================================================
// VERIFY OTP
// ======================================================

const verifyOtp = async (req, res) => {
  try {
    const {
      identifier,
      otp
    } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        message: "Identifier and OTP are required."
      });
    }

    const resetRequest = await PasswordResetOtp.findOne({
      identifier,
      verified: false
    }).sort({
      createdAt: -1
    });

    if (!resetRequest) {
      return res.status(400).json({
        message: "Invalid or expired OTP."
      });
    }

    // Check expiration
    if (resetRequest.expiresAt < new Date()) {
      await PasswordResetOtp.findByIdAndDelete(
        resetRequest._id
      );

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP."
      });
    }

    // Maximum attempts
    if (resetRequest.attempts >= 5) {
      await PasswordResetOtp.findByIdAndDelete(
        resetRequest._id
      );

      return res.status(400).json({
        message: "Too many incorrect attempts."
      });
    }

    // Compare OTP
    const otpMatch = await bcrypt.compare(
      otp,
      resetRequest.otp
    );

    if (!otpMatch) {
      resetRequest.attempts += 1;

      await resetRequest.save();

      return res.status(400).json({
        message: "Invalid OTP."
      });
    }

    // Mark OTP verified
    resetRequest.verified = true;

    await resetRequest.save();

    // Temporary reset token
    const resetToken = jwt.sign(
      {
        userId: resetRequest.userId,
        purpose: "password_reset"
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m"
      }
    );

    res.status(200).json({
      message: "OTP verified successfully.",
      resetToken
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    res.status(500).json({
      message: "Server error while verifying OTP."
    });
  }
};


// ======================================================
// RESET PASSWORD
// ======================================================

const resetPassword = async (req, res) => {
  try {
    const {
      resetToken,
      newPassword,
      confirmPassword
    } = req.body;

    if (
      !resetToken ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All fields are required."
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match."
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters."
      });
    }

    // Verify reset token
    const decoded = jwt.verify(
      resetToken,
      process.env.JWT_SECRET
    );

    if (decoded.purpose !== "password_reset") {
      return res.status(400).json({
        message: "Invalid password reset token."
      });
    }

    const user = await User.findById(
      decoded.userId
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    // Update password
    user.password = hashedPassword;

    await user.save();

    // Delete used OTP records
    await PasswordResetOtp.deleteMany({
      userId: user._id
    });

    res.status(200).json({
      message: "Password reset successfully."
    });

  } catch (error) {
    console.error("Reset password error:", error);

    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(400).json({
        message: "Invalid or expired reset token."
      });
    }

    res.status(500).json({
      message: "Server error while resetting password."
    });
  }
};


// ======================================================
// GET CURRENT USER
// ======================================================

const getMe = async (req, res) => {
  try {
    res.status(200).json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error."
    });
  }
};


module.exports = {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getMe
};