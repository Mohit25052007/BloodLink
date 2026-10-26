import BloodRequest from '../models/BloodRequest.js';
import Notification from '../models/Notification.js';

// Helper to auto-expire past-due requests
const autoExpirePastDueRequests = async () => {
  try {
    const now = new Date();
    await BloodRequest.updateMany(
      {
        status: 'open',
        requiredBy: { $lt: now },
      },
      {
        $set: { status: 'expired' },
      }
    );
  } catch (err) {
    console.error('Error during auto-expiry check:', err.message);
  }
};

export const createBloodRequest = async (req, res, next) => {
  try {
    const {
      bloodGroup,
      unitsRequired,
      hospitalName,
      city,
      district,
      state,
      requiredBy,
      urgency = 'normal',
      description,
      contactPhone,
    } = req.body;

    const newRequest = new BloodRequest({
      createdBy: req.user._id,
      bloodGroup,
      unitsRequired,
      hospitalName: hospitalName.trim(),
      city: city.trim(),
      district: district.trim(),
      state: state.trim(),
      requiredBy: new Date(requiredBy),
      urgency,
      description: description ? description.trim() : '',
      contactPhone: contactPhone ? contactPhone.trim() : req.user.phone,
      status: 'open',
    });

    await newRequest.save();
    await newRequest.populate('createdBy', 'name address.city address.state');

    return res.status(201).json({
      success: true,
      message: 'Blood request created successfully.',
      request: newRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getBloodRequests = async (req, res, next) => {
  try {
    await autoExpirePastDueRequests();

    const {
      bloodGroup,
      city,
      district,
      state,
      urgency,
      status = 'open',
      page = 1,
      limit = 12,
    } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (bloodGroup && bloodGroup !== 'ALL') {
      const normalizedGroup = bloodGroup.replace(/ /g, '+');
      query.bloodGroup = normalizedGroup;
    }

    if (urgency && urgency !== 'ALL') {
      query.urgency = urgency;
    }

    if (city && city.trim()) {
      query.city = { $regex: new RegExp(city.trim(), 'i') };
    }
    if (district && district.trim()) {
      query.district = { $regex: new RegExp(district.trim(), 'i') };
    }
    if (state && state.trim()) {
      query.state = { $regex: new RegExp(state.trim(), 'i') };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Sort critical and urgent requests first, then by requiredBy
    const requests = await BloodRequest.find(query)
      .populate('createdBy', 'name address.city address.state')
      .select('-contactPhone') // Protect private contactPhone in public listings
      .sort({
        urgency: -1,
        createdAt: -1,
      })
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
        hasNextPage: pageNum * limitNum < total,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBloodRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id).populate(
      'createdBy',
      'name address.city address.state'
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    // Auto check if expired
    if (request.status === 'open' && new Date(request.requiredBy) < new Date()) {
      request.status = 'expired';
      await request.save();
    }

    // Check if caller is authorized to view raw contact phone (owner or admin)
    const isOwner = req.user && req.user._id.toString() === request.createdBy._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    const responseObj = request.toObject();
    if (!isOwner && !isAdmin) {
      // In public view, contactPhone is masked or hidden until a contact request is accepted
      delete responseObj.contactPhone;
    }

    return res.status(200).json({
      success: true,
      request: responseObj,
      isOwner,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    const isOwner = req.user._id.toString() === request.createdBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this blood request.',
      });
    }

    const {
      bloodGroup,
      unitsRequired,
      hospitalName,
      city,
      district,
      state,
      requiredBy,
      urgency,
      description,
      contactPhone,
      status,
    } = req.body;

    if (bloodGroup) request.bloodGroup = bloodGroup;
    if (unitsRequired) request.unitsRequired = unitsRequired;
    if (hospitalName) request.hospitalName = hospitalName.trim();
    if (city) request.city = city.trim();
    if (district) request.district = district.trim();
    if (state) request.state = state.trim();
    if (requiredBy) request.requiredBy = new Date(requiredBy);
    if (urgency) request.urgency = urgency;
    if (description !== undefined) request.description = description.trim();
    if (contactPhone) request.contactPhone = contactPhone.trim();
    if (status) request.status = status;

    await request.save();

    return res.status(200).json({
      success: true,
      message: 'Blood request updated successfully.',
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBloodRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['open', 'fulfilled', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Can only set to open, fulfilled, or cancelled.',
      });
    }

    const request = await BloodRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    const isOwner = req.user._id.toString() === request.createdBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the owner or an admin can change this request status.',
      });
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Blood request marked as ${status}.`,
      request,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBloodRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Blood request not found.',
      });
    }

    const isOwner = req.user._id.toString() === request.createdBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this blood request.',
      });
    }

    await BloodRequest.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Blood request deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBloodRequests = async (req, res, next) => {
  try {
    await autoExpirePastDueRequests();

    const requests = await BloodRequest.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    next(error);
  }
};
