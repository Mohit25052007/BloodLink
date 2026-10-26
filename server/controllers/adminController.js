import User from '../models/User.js';
import BloodRequest from '../models/BloodRequest.js';
import ContactRequest from '../models/ContactRequest.js';
import Notification from '../models/Notification.js';

export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ 'donorProfile.isDonor': true });
    const pendingVerifications = await User.countDocuments({
      'donorProfile.isDonor': true,
      'donorProfile.verificationStatus': 'pending',
    });
    const verifiedDonors = await User.countDocuments({
      'donorProfile.isDonor': true,
      'donorProfile.verificationStatus': 'verified',
    });
    const totalRequests = await BloodRequest.countDocuments();
    const openRequests = await BloodRequest.countDocuments({ status: 'open' });
    const fulfilledRequests = await BloodRequest.countDocuments({ status: 'fulfilled' });
    const totalContactRequests = await ContactRequest.countDocuments();

    // Recent 5 users
    const recentUsers = await User.find()
      .select('name email role status donorProfile createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent 5 blood requests
    const recentRequests = await BloodRequest.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalDonors,
        pendingVerifications,
        verifiedDonors,
        totalRequests,
        openRequests,
        fulfilledRequests,
        totalContactRequests,
      },
      recentActivity: {
        recentUsers,
        recentRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const {
      search,
      role,
      status,
      verificationStatus,
      isDonor,
      page = 1,
      limit = 15,
    } = req.query;

    const query = {};

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: new RegExp(search.trim(), 'i') } },
        { email: { $regex: new RegExp(search.trim(), 'i') } },
        { phone: { $regex: new RegExp(search.trim(), 'i') } },
      ];
    }

    if (role && role !== 'ALL') query.role = role;
    if (status && status !== 'ALL') query.status = status;
    if (isDonor === 'true') query['donorProfile.isDonor'] = true;
    if (verificationStatus && verificationStatus !== 'ALL') {
      query['donorProfile.verificationStatus'] = verificationStatus;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserVerification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'verified' | 'rejected' | 'pending'

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status. Must be "verified", "rejected", or "pending".',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (!user.donorProfile.isDonor) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update verification for a user who is not registered as a donor.',
      });
    }

    user.donorProfile.verificationStatus = status;
    if (notes !== undefined) {
      user.donorProfile.verificationNotes = notes.trim();
    }
    await user.save();

    // Send in-app notification to the donor
    const isApproved = status === 'verified';
    await Notification.create({
      user: user._id,
      title: isApproved
        ? 'Donor Profile Verified!'
        : `Donor Profile Verification ${status === 'rejected' ? 'Declined' : 'Updated'}`,
      message: isApproved
        ? 'Your BloodLink donor profile has been verified by the administration team. You are now discoverable in donor searches.'
        : `Your donor verification was marked as ${status}${notes ? `. Reason: ${notes}` : '.'}`,
      type: 'donor_verification_update',
      relatedEntityId: user._id,
      relatedEntityType: 'User',
    });

    return res.status(200).json({
      success: true,
      message: `Donor verification status set to ${status}.`,
      donorProfile: user.donorProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'active' | 'suspended'

    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "suspended".',
      });
    }

    // Safety check: Prevent admin from suspending themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot suspend your own administrator account.',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    user.status = status;
    // Business rule: If suspended, deactivate donor availability automatically
    if (status === 'suspended' && user.donorProfile) {
      user.donorProfile.available = false;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: `User account has been marked as ${status}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBloodRequests = async (req, res, next) => {
  try {
    const { status, urgency, bloodGroup, search, page = 1, limit = 15 } = req.query;

    const query = {};
    if (status && status !== 'ALL') query.status = status;
    if (urgency && urgency !== 'ALL') query.urgency = urgency;
    if (bloodGroup && bloodGroup !== 'ALL') query.bloodGroup = bloodGroup;

    if (search && search.trim()) {
      query.$or = [
        { hospitalName: { $regex: new RegExp(search.trim(), 'i') } },
        { city: { $regex: new RegExp(search.trim(), 'i') } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;

    const requests = await BloodRequest.find(query)
      .populate('createdBy', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await BloodRequest.countDocuments(query);

    return res.status(200).json({
      success: true,
      requests,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminBloodRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'fulfilled', 'cancelled', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value.',
      });
    }

    const request = await BloodRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Blood request status updated to ${status} by administrator.`,
      request,
    });
  } catch (error) {
    next(error);
  }
};
