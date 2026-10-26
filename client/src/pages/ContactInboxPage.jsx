import React, { useState, useEffect } from 'react';
import contactRequestService from '../services/contactRequestService';
import { useToast } from '../context/ToastContext';
import { BloodGroupBadge } from '../components/common/Badge';
import { Spinner } from '../components/common/Loader';
import {
  Inbox,
  Send,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Hospital,
  MapPin,
  Calendar,
} from 'lucide-react';

export const ContactInboxPage = () => {
  const { showSuccess, showError } = useToast();

  const [activeTab, setActiveTab] = useState('incoming'); // 'incoming' | 'outgoing'
  const [incomingRequests, setIncomingContacts] = useState([]);
  const [outgoingRequests, setOutgoingContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const [inData, outData] = await Promise.all([
        contactRequestService.getIncomingRequests(),
        contactRequestService.getOutgoingRequests(),
      ]);

      if (inData.success) setIncomingContacts(inData.requests || []);
      if (outData.success) setOutgoingContacts(outData.requests || []);
    } catch (err) {
      showError(err.message || 'Failed to fetch contact requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleRespond = async (id, action) => {
    setActionLoadingId(id);
    try {
      const data = await contactRequestService.respondToRequest(id, action);
      if (data.success) {
        showSuccess(`Contact request ${action === 'accept' ? 'accepted' : 'declined'}.`);
        fetchContacts();
      }
    } catch (err) {
      showError(err.message || 'Failed to update contact request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this pending contact request?')) return;
    setActionLoadingId(id);
    try {
      const data = await contactRequestService.cancelRequest(id);
      if (data.success) {
        showSuccess('Contact request cancelled.');
        fetchContacts();
      }
    } catch (err) {
      showError(err.message || 'Failed to cancel request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const currentList = activeTab === 'incoming' ? incomingRequests : outgoingRequests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <Inbox className="w-4 h-4" />
          Direct Coordination
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Contact Inbox</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review incoming donor offers and outgoing requests. Phone details are unlocked automatically once accepted.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'incoming'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Incoming Requests
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {incomingRequests.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'outgoing'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Send className="w-4 h-4" />
          Outgoing Offers & Inquiries
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-700">
            {outgoingRequests.length}
          </span>
        </button>
      </div>

      {/* Requests Content */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Loading inbox messages...</p>
        </div>
      ) : currentList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3 max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            {activeTab === 'incoming' ? 'No incoming requests yet' : 'No outgoing offers yet'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {activeTab === 'incoming'
              ? 'When donors offer to help with your blood requests or reach out directly, they will appear here.'
              : 'When you offer to donate to an open blood request or contact a donor, your inquiries will show here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {currentList.map((item) => {
            const isIncoming = activeTab === 'incoming';
            const participant = isIncoming ? item.sender : item.recipient;
            const isAccepted = item.status === 'accepted';
            const isPending = item.status === 'pending';

            return (
              <div
                key={item._id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm">
                      {participant?.name ? participant.name.charAt(0) : 'U'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{participant?.name || 'User'}</span>
                        {participant?.donorProfile?.bloodGroup && (
                          <BloodGroupBadge group={participant.donorProfile.bloodGroup} size="sm" />
                        )}
                      </div>
                      <span className="text-xs text-slate-500">
                        {participant?.address?.city}, {participant?.address?.state}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : item.status === 'cancelled'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {/* Blood Request Reference Tag if applicable */}
                {item.bloodRequest && (
                  <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Hospital className="w-4 h-4 text-brand-600" />
                      <span className="font-semibold text-slate-800">
                        {item.bloodRequest.hospitalName} ({item.bloodRequest.city})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BloodGroupBadge group={item.bloodRequest.bloodGroup} size="sm" />
                      <span className="text-slate-600 font-medium">
                        {item.bloodRequest.unitsRequired} units required
                      </span>
                    </div>
                  </div>
                )}

                {/* Message */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  "{item.message}"
                </div>

                {/* Unlocked Contact Details (Visible ONLY after Acceptance!) */}
                {isAccepted ? (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Contact Details Unlocked (Mutual Acceptance Verified)</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm font-semibold text-emerald-950 pt-1">
                      {participant?.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-700" />
                          <a href={`tel:${participant.phone}`} className="underline hover:text-emerald-800">
                            {participant.phone}
                          </a>
                        </div>
                      )}
                      {participant?.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-emerald-700" />
                          <a href={`mailto:${participant.email}`} className="underline hover:text-emerald-800">
                            {participant.email}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                    <span>Phone number and email will only be revealed upon mutual acceptance.</span>
                  </div>
                )}

                {/* Action Buttons */}
                {isPending && (
                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                    {isIncoming ? (
                      <>
                        <button
                          type="button"
                          disabled={actionLoadingId === item._id}
                          onClick={() => handleRespond(item._id, 'reject')}
                          className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          disabled={actionLoadingId === item._id}
                          onClick={() => handleRespond(item._id, 'accept')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-xs transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Accept & Unlock Contact
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoadingId === item._id}
                        onClick={() => handleCancel(item._id)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactInboxPage;
