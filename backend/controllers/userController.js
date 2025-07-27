const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/sendEmail');
const transporter = require('../database/nodemailer');
const { text } = require('express');

const signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.json({ success: false, message: 'Missing Details' });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const otpExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      verifyOTP: otp,
      verifyOtpExpiresAt: otpExpiry,
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,               // Must be true on deployed HTTPS
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, verifyOTP, verifyOtpExpiresAt, ...userData } = user._doc;

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Account Verification OTP',
      text: `Hello ${name},\n\nYour OTP is: ${otp}. It will expire in 24 hours.\n\nThank you!`,
    });

    return res.json({
      success: true,
      message: 'User created. Verification OTP sent via email.',
      user: userData,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and Password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid email' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,               // Must be true on deployed HTTPS
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // fixed duration
    });

    // Return user info (remove sensitive fields)
    const { password: _, ...userData } = user._doc;

    return res.status(200).json({
      success: true,
      user: userData,
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    })

    return res.json({ success: true, message: 'Logged out' })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

const sendVerifyOTP = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.json({ success: false, message: 'Account already verified' });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.verifyOTP = otp
    user.verifyOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await user.save();

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your OTP is ${otp}. Verify your account using this OTP`,
    }
    await transporter.sendMail(mailOption);

    res.json({ success: true, message: 'Verification OTP sent on Email' })
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}


const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  const user = req.user;

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found." });
  }

  if (user.isVerified) {
    return res.status(400).json({ success: false, message: "User is already verified." });
  }

  if (user.verifyOTP !== otp) {
    return res.status(400).json({ success: false, message: "Invalid OTP." });
  }

  if (user.verifyOtpExpiresAt < Date.now()) {
    return res.status(400).json({ success: false, message: "OTP expired." });
  }

  try {
    user.isVerified = true;
    user.verifyOTP = "";
    user.verifyOtpExpiresAt = 0;
    await user.save();

    // Optionally, regenerate token or refresh session
    // const token = generateJwt(user); 
    // res.cookie("token", token, { httpOnly: true, secure: true });

    return res.json({
      success: true,
      message: "Email verified successfully.",
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
        // Add other fields as needed
      },
    });
  } catch (err) {
    console.error("Error during email verification:", err);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};




const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, message: 'Authenticated' })
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
}

const sendRestPasswordOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.json({ success: false, message: 'Email is required' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.json({ success: false, message: 'User not found' })
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000))

    user.resetOtp = otp
    user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000

    await user.save()

    const mailOption = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP is ${otp}. Use this OTP to reset your password`,
    }

    await transporter.sendMail(mailOption)

    return res.json({ success: true, message: 'Reset Password OTP sent on Email' })
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
}

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Missing details' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resetOtp !== otp) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetOtpExpiresAt < Date.now()) {
      return res.status(401).json({ success: false, message: 'OTP Expired' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = '';
    user.resetOtpExpiresAt = 0;

    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({ success: false, message: 'An unexpected error occurred. Please try again.' });
  }
};


const resendOtp = async (req, res) => {
  const userId = req.user._id; // assuming middleware sets req.user
  console.log("Resending OTP for userId:", userId);

  try {
    const user = await User.findById(userId);
    console.log("Fetched user:", user);

    if (!user) {
      return res.status(400).json({ success: false, message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Account already verified' });
    }

    if (user.verifyOtpExpiresAt < Date.now()) {
      const otp = String(Math.floor(100000 + Math.random() * 900000));  // Generate OTP
      console.log("Generated OTP:", otp);  // Log the OTP

      user.verifyOTP = otp;
      user.verifyOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Set expiration to 24 hours

      await user.save();
      console.log("User OTP saved:", user);

      // Prepare the email options
      const mailOptions = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Account Verification OTP',
        text: `Your OTP is ${otp}. Verify your account using this OTP.`,
      };

      // Send the email
      await transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ success: false, message: 'Error sending OTP email' });
        }
        console.log("Email sent successfully:", info.response);
      });

      return res.json({ success: true, message: 'Verification OTP resent to your email' });
    }

    return res.status(400).json({ success: false, message: 'OTP is still valid' });

  } catch (error) {
    console.error("Error during OTP resend:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (user.resetOtpExpiresAt < Date.now()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }

    return res.json({ success: true, message: 'OTP verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};







module.exports = { signup, login, logout, sendVerifyOTP, verifyEmail, isAuthenticated, sendRestPasswordOTP, resetPassword, resendOtp, verifyOtp };
// module.exports = { signup, login, logout, sendVerifyOTP, verifyEmail, isAuthenticated };
