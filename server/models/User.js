import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const addressSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters'],
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
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      trim: true,
      match: [/^[0-9]{5,10}$/, 'Please provide a valid postal code (5-10 digits)'],
    },
  },
  { _id: false }
);

const donorProfileSchema = new mongoose.Schema(
  {
    isDonor: {
      type: Boolean,
      default: false,
      index: true,
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a supported blood group',
      },
      required: function () {
        return this.isDonor;
      },
      index: true,
    },
    available: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastDonationDate: {
      type: Date,
      default: null,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    verificationNotes: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      minlength: [8, 'Phone number must be at least 8 digits'],
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    address: {
      type: addressSchema,
      required: [true, 'Address information is required'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    donorProfile: {
      type: donorProfileSchema,
      default: () => ({
        isDonor: false,
        available: true,
        verificationStatus: 'pending',
      }),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Method to verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Compound index for donor search queries
userSchema.index({
  'donorProfile.isDonor': 1,
  'donorProfile.available': 1,
  'donorProfile.verificationStatus': 1,
  'donorProfile.bloodGroup': 1,
  'address.city': 1,
});

export const User = mongoose.model('User', userSchema);
export default User;
