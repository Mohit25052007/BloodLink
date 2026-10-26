import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import contactRequestService from '../../services/contactRequestService';
import Modal from '../common/Modal';
import { BloodGroupBadge } from '../common/Badge';
import { ShieldAlert, Send, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactDonorModal = ({ isOpen, onClose, donor, onSuccess }) => {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.length < 5) {
      showError('Please provide a message with at least 5 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await contactRequestService.createContactRequest({
        recipient: donor._id,
        message: message.trim(),
      });

      if (data.success) {
        showSuccess('Contact request sent! The donor has been notified.');
        setMessage('');
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      showError(err.message || 'Failed to send contact request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!donor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect with Blood Donor">
      {!isAuthenticated ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-brand-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-semibold text-slate-900">Authentication Required</h4>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              To protect donor privacy and prevent spam, you must have an active BloodLink account to send contact requests.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Log In to Continue
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Register Free
            </Link>
          </div>
        </div>
      ) : user?._id === donor._id ? (
        <div className="text-center py-4 space-y-3">
          <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto" />
          <p className="text-sm text-slate-700 font-medium">This is your own donor profile.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Donor Summary Info */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-900">{donor.name}</p>
              <p className="text-xs text-slate-500">
                {donor.address?.city}, {donor.address?.state}
              </p>
            </div>
            <BloodGroupBadge group={donor.donorProfile?.bloodGroup} />
          </div>

          {/* Privacy Notice */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Privacy Protection:</strong> Phone numbers are never exposed in public searches. Once the donor
              accepts your request, direct phone contact will be unlocked in both of your inboxes.
            </p>
          </div>

          {/* Message Input */}
          <div>
            <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-700 mb-1">
              Your Message or Hospital Requirement <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="contact-message"
              rows={4}
              required
              minLength={5}
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="E.g., Hello, we urgently require an O+ donor at City Hospital for scheduled surgery tomorrow. Could you please confirm your availability?"
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all placeholder:text-slate-400"
            ></textarea>
            <div className="flex justify-between items-center text-[11px] text-slate-600 mt-1">
              <span>Min 5 characters</span>
              <span>{message.length} / 500 characters</span>
            </div>
          </div>

          {/* Actions */}
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
              {submitting ? 'Sending...' : 'Send Contact Request'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default ContactDonorModal;
