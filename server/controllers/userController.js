import User from '../models/User.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (phone) user.phone = phone.trim();
    if (address) {
      if (address.city) user.address.city = address.city.trim();
      if (address.district) user.address.district = address.district.trim();
      if (address.state) user.address.state = address.state.trim();
      if (address.pincode) user.address.pincode = address.pincode.trim();
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDonorProfile = async (req, res, next) => {
  try {
    const { isDonor, bloodGroup, available, lastDonationDate, bio } = req.body;
    const user = await User.findById(req.user._id);

    if (isDonor !== undefined) {
      user.donorProfile.isDonor = Boolean(isDonor);
    }
    if (bloodGroup !== undefined) {
      user.donorProfile.bloodGroup = bloodGroup;
    }
    if (available !== undefined) {
      user.donorProfile.available = Boolean(available);
    }
    if (lastDonationDate !== undefined) {
      user.donorProfile.lastDonationDate = lastDonationDate ? new Date(lastDonationDate) : null;
    }
    if (bio !== undefined) {
      user.donorProfile.bio = bio ? bio.trim() : '';
    }

    // If user previously was not verified or rejected and changed blood group, reset to pending
    if (bloodGroup && bloodGroup !== user.donorProfile.bloodGroup) {
      user.donorProfile.verificationStatus = 'pending';
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Donor profile updated successfully.',
      donorProfile: user.donorProfile,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const searchDonors = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      city,
      district,
      state,
      pincode,
      available,
      verifiedOnly = 'true',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {
      'donorProfile.isDonor': true,
      status: 'active',
    };

    // By default only verified donors appear in normal donor searches (Phase 4 requirement)
    if (verifiedOnly === 'true') {
      query['donorProfile.verificationStatus'] = 'verified';
    } else if (req.query.verificationStatus) {
      query['donorProfile.verificationStatus'] = req.query.verificationStatus;
    }

    // Availability filter
    if (available === 'true' || available === undefined) {
      query['donorProfile.available'] = true;
    } else if (available === 'false') {
      query['donorProfile.available'] = false;
    }

    // Blood group filter (handles URL decoded space for +)
    if (bloodGroup && bloodGroup !== 'ALL') {
      const normalizedGroup = bloodGroup.replace(/ /g, '+');
      query['donorProfile.bloodGroup'] = normalizedGroup;
    }

    // Location filters (case-insensitive)
    if (city && city.trim()) {
      query['address.city'] = { $regex: new RegExp(city.trim(), 'i') };
    }
    if (district && district.trim()) {
      query['address.district'] = { $regex: new RegExp(district.trim(), 'i') };
    }
    if (state && state.trim()) {
      query['address.state'] = { $regex: new RegExp(state.trim(), 'i') };
    }
    if (pincode && pincode.trim()) {
      query['address.pincode'] = pincode.trim();
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Projection explicitly excludes private contact information (phone, email, full address details)
    const donors = await User.find(query)
      .select('name address.city address.district address.state donorProfile createdAt')
      .sort({ 'donorProfile.available': -1, updatedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await User.countDocuments(query);

    return res.status(200).json({
      success: true,
      donors,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1,
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDonorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const donor = await User.findOne({
      _id: id,
      'donorProfile.isDonor': true,
      status: 'active',
    })
      .select('name address.city address.district address.state donorProfile createdAt')
      .lean();

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor profile not found or unavailable.',
      });
    }

    return res.status(200).json({
      success: true,
      donor,
    });
  } catch (error) {
    next(error);
  }
};
