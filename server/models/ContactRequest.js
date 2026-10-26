import mongoose from 'mongoose';

export const CONTACT_STATUSES = ['pending', 'accepted', 'rejected', 'cancelled'];

const contactRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required'],
      index: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient reference is required'],
      index: true,
    },
    bloodRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BloodRequest',
      default: null,
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      minlength: [5, 'Message must be at least 5 characters'],
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: {
        values: CONTACT_STATUSES,
        message: '{VALUE} is not a valid contact request status',
      },
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes to find and prevent duplicate pending requests
contactRequestSchema.index({ sender: 1, recipient: 1, status: 1 });
contactRequestSchema.index({ bloodRequest: 1, sender: 1, status: 1 });

export const ContactRequest = mongoose.model('ContactRequest', contactRequestSchema);
export default ContactRequest;
