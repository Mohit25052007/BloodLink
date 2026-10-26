import { body, validationResult } from 'express-validator';
import { BLOOD_GROUPS } from '../models/User.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the highlighted errors.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

export const registerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Password confirmation is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 digits'),

  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),

  body('address.district')
    .trim()
    .notEmpty()
    .withMessage('District is required')
    .isLength({ max: 50 })
    .withMessage('District cannot exceed 50 characters'),

  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('address.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^[0-9]{5,10}$/)
    .withMessage('Pincode must be 5 to 10 digits'),

  body('isDonor')
    .optional()
    .isBoolean()
    .withMessage('isDonor must be a boolean'),

  body('bloodGroup')
    .optional({ checkFalsy: true })
    .custom((val, { req }) => {
      if (req.body.isDonor && !BLOOD_GROUPS.includes(val)) {
        throw new Error(`Blood group is required for donors and must be one of: ${BLOOD_GROUPS.join(', ')}`);
      }
      return true;
    }),

  // Explicit security rule: Reject client attempt to assign admin role
  body('role')
    .optional()
    .custom((val) => {
      if (val === 'admin') {
        throw new Error('Public registration cannot assign the administrator role');
      }
      return true;
    }),

  handleValidationErrors,
];

export const loginValidator = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  handleValidationErrors,
];

export const updateProfileValidator = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters'),

  body('phone')
    .optional()
    .trim()
    .isLength({ min: 8, max: 20 })
    .withMessage('Phone number must be between 8 and 20 digits'),

  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 }),

  body('address.district')
    .optional()
    .trim()
    .isLength({ max: 50 }),

  body('address.state')
    .optional()
    .trim()
    .isLength({ max: 50 }),

  body('address.pincode')
    .optional()
    .trim()
    .matches(/^[0-9]{5,10}$/)
    .withMessage('Pincode must be 5 to 10 digits'),

  handleValidationErrors,
];

export const donorProfileValidator = [
  body('isDonor')
    .optional()
    .isBoolean(),

  body('bloodGroup')
    .optional()
    .isIn(BLOOD_GROUPS)
    .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}`),

  body('available')
    .optional()
    .isBoolean(),

  body('lastDonationDate')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('Last donation date must be a valid date'),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage('Bio cannot exceed 300 characters'),

  handleValidationErrors,
];

export const changePasswordValidator = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/[A-Za-z]/)
    .withMessage('New password must contain at least one letter')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),

  handleValidationErrors,
];
