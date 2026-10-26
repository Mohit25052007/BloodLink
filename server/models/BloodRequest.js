import mongoose from 'mongoose';
import { BLOOD_GROUPS } from './User.js';

export const URGENCY_LEVELS = ['normal', 'urgent', 'critical'];
export const REQUEST_STATUSES = ['open', 'fulfilled', 'cancelled', 'expired'];

const bloodRequestSchema = new mongoose.Schema(
  {
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request creator reference is required'],
      index: true,
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group',
      },
      index: true,
    },
    unitsRequired: {
      type: Number,
      required: [true, 'Number of blood units required is mandatory'],
      min: [1, 'Must require at least 1 unit'],
      max: [20, 'Units required cannot exceed 20 units per single request'],
    },
    hospitalName: {
      type: String,
      required: [true, 'Hospital name is required'],
      trim: true,
      maxlength: [100, 'Hospital name cannot exceed 100 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters'],
      index: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
      maxlength: [50, 'District cannot exceed 50 characters'],
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters'],
      index: true,
    },
    requiredBy: {
      type: Date,
      required: [true, 'Required-by date is required'],
      index: true,
    },
    urgency: {
      type: String,
      enum: {
        values: URGENCY_LEVELS,
        message: '{VALUE} is not a valid urgency level',
      },
      default: 'normal',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    contactPhone: {
      type: String,
      trim: true,
      maxlength: 20,
    },
    status: {
      type: String,
      enum: {
        values: REQUEST_STATUSES,
        message: '{VALUE} is not a valid request status',
      },
      default: 'open',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for searching & filtering
bloodRequestSchema.index({ status: 1, bloodGroup: 1, city: 1 });
bloodRequestSchema.index({ status: 1, urgency: 1, createdAt: -1 });

export const BloodRequest = mongoose.model('BloodRequest', bloodRequestSchema);
export default BloodRequest;
