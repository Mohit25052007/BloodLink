import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import contactRequestService from '../../services/contactRequestService';
import Modal from '../common/Modal';
import { BloodGroupBadge, UrgencyBadge } from '../common/Badge';
import { HeartHandshake, ShieldAlert, Send, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OfferHelpModal = ({ isOpen, onClose, request, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!request) return null;

  const isOwner = user?._id && request.createdBy && (
    (typeof request.createdBy === 'object' ? request.createdBy._id : request.createdBy) === user._id
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.length < 5) {
      showError('Please provide a short message (min 5 characters) with your availability details.');
      return;
    }

    setSubmitting(true);
    try {
      const recipientId = typeof request.createdBy === 'object' ? request.createdBy._id : request.createdBy;
      const data = await contactRequestService.createContactRequest({
        recipient: recipientId,
        bloodRequest: request._id,
        message: message.trim(),
      });

      if (data.success) {
        showSuccess('Your offer to donate was sent to the requester! Check your Inbox for updates.');
        setMessage('');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      showError(err.message || 'Failed to submit donation offer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Offer to Donate Blood">
      {!isAuthenticated ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-brand-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900">Sign In to Offer Help</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Please log in so the patient or hospital contact can receive your offer securely.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Register Free
            </Link>
          </div>
        </div>
      ) : isOwner ? (
        <div className="text-center py-4 space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
          <p className="text-sm text-slate-700 font-medium">
            You cannot submit a donation offer to your own blood request.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Request Header Summary */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">{request.hospitalName}</span>
              <UrgencyBadge urgency={request.urgency} />
            </div>
            <div className="flex items-center gap-2">
              <BloodGroupBadge group={request.bloodGroup} />
              <span className="text-xs font-semibold text-slate-800">
                {request.unitsRequired} {request.unitsRequired === 1 ? 'unit required' : 'units required'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600">{request.city}, {request.state}</span>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-brand-900 flex items-start gap-2">
            <HeartHandshake className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
            <p>
              Your offer will be sent directly to the request creator. Once they accept your offer in their inbox,
              mutual direct phone contact details will be unlocked.
            </p>
          </div>

          {/* Message Area */}
          <div>
            <label htmlFor="offer-message" className="block text-xs font-semibold text-slate-700 mb-1">
              Your Message & Arrival Availability <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="offer-message"
              rows={4}
              required
              minLength={5}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., I am an eligible blood donor located 15 minutes away from Lilavati Hospital. I am available to arrive today by 2:00 PM."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400"
            ></textarea>
            <div className="flex justify-between items-center text-[11px] text-slate-600 mt-1">
              <span>Min 5 characters</span>
              <span>{message.length} / 500 characters</span>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || message.trim().length < 5}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              {submitting ? 'Submitting...' : 'Send Donation Offer'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default OfferHelpModal;
