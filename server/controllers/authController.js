import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { generateToken, setTokenCookie, clearTokenCookie } from '../middleware/auth.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address, isDonor, bloodGroup, bio } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      phone: phone.trim(),
      address: {
        city: address.city.trim(),
        district: address.district.trim(),
        state: address.state.trim(),
        pincode: address.pincode.trim(),
      },
      role: 'user', // Public registration is strictly locked to 'user'
      status: 'active',
      donorProfile: {
        isDonor: Boolean(isDonor),
        bloodGroup: isDonor ? bloodGroup : undefined,
        available: true,
        verificationStatus: 'pending',
        bio: bio ? bio.trim() : '',
      },
    });

    await newUser.save();

    const token = generateToken(newUser._id);
    setTokenCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to BloodLink.',
      user: newUser,
      token, // Also return in body for clients/mobile if needed
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended by an administrator. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);
    setTokenCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res) => {
  clearTokenCookie(res);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+passwordHash');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
    });
  } catch (error) {
    next(error);
  }
};
