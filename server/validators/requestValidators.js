import { body, param, query } from 'express-validator';
import mongoose from 'mongoose';
import { handleValidationErrors } from './authValidators.js';
import { BLOOD_GROUPS } from '../models/User.js';
import { URGENCY_LEVELS, REQUEST_STATUSES } from '../models/BloodRequest.js';

export const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error(`Invalid ID format for ${paramName}`);
      }
      return true;
    }),
  handleValidationErrors,
];

export const createBloodRequestValidator = [
  body('bloodGroup')
    .notEmpty()
    .withMessage('Blood group is required')
    .isIn(BLOOD_GROUPS)
    .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}`),

  body('unitsRequired')
    .notEmpty()
    .withMessage('Units required is mandatory')
    .isInt({ min: 1, max: 20 })
    .withMessage('Units required must be between 1 and 20'),

  body('hospitalName')
    .trim()
    .notEmpty()
    .withMessage('Hospital name is required')
    .isLength({ max: 100 })
    .withMessage('Hospital name cannot exceed 100 characters'),

  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters'),

  body('district')
    .trim()
    .notEmpty()
    .withMessage('District is required')
    .isLength({ max: 50 })
    .withMessage('District cannot exceed 50 characters'),

  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 50 })
    .withMessage('State cannot exceed 50 characters'),

  body('requiredBy')
    .notEmpty()
    .withMessage('Required-by date and time is required')
    .isISO8601()
    .withMessage('Required-by date must be a valid date format')
    .custom((val) => {
      const targetDate = new Date(val);
      // Allow slight 5 minute grace period for timezone variance
      const now = new Date(Date.now() - 5 * 60 * 1000);
      if (targetDate < now) {
        throw new Error('Required-by date cannot be in the past');
      }
      return true;
    }),

  body('urgency')
    .optional()
    .isIn(URGENCY_LEVELS)
    .withMessage(`Urgency must be one of: ${URGENCY_LEVELS.join(', ')}`),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),

  body('contactPhone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Contact phone cannot exceed 20 characters'),

  handleValidationErrors,
];

export const updateBloodRequestValidator = [
  param('id')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid request ID');
      }
      return true;
    }),

  body('bloodGroup')
    .optional()
    .isIn(BLOOD_GROUPS)
    .withMessage(`Blood group must be one of: ${BLOOD_GROUPS.join(', ')}`),

  body('unitsRequired')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Units required must be between 1 and 20'),

  body('hospitalName')
    .optional()
    .trim()
    .isLength({ max: 100 }),

  body('city')
    .optional()
    .trim()
    .isLength({ max: 50 }),

  body('district')
    .optional()
    .trim()
    .isLength({ max: 50 }),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 50 }),

  body('urgency')
    .optional()
    .isIn(URGENCY_LEVELS),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }),

  body('status')
    .optional()
    .isIn(REQUEST_STATUSES)
    .withMessage(`Status must be one of: ${REQUEST_STATUSES.join(', ')}`),

  handleValidationErrors,
];

export const createContactRequestValidator = [
  body('recipient')
    .notEmpty()
    .withMessage('Recipient user ID is required')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid recipient ID format');
      }
      return true;
    }),

  body('bloodRequest')
    .optional({ nullable: true })
    .custom((val) => {
      if (val && !mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid blood request ID format');
      }
      return true;
    }),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Message must be between 5 and 500 characters'),

  handleValidationErrors,
];

export const respondContactRequestValidator = [
  param('id')
    .custom((val) => {
      if (!mongoose.Types.ObjectId.isValid(val)) {
        throw new Error('Invalid contact request ID');
      }
      return true;
    }),

  body('action')
    .notEmpty()
    .withMessage('Action is required')
    .isIn(['accept', 'reject'])
    .withMessage('Action must be either "accept" or "reject"'),

  handleValidationErrors,
];
