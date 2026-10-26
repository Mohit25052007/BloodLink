import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import bloodRequestService from '../services/bloodRequestService';
import OfferHelpModal from '../components/requests/OfferHelpModal';
import { BloodGroupBadge, UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { Spinner } from '../components/common/Loader';
import {
  Hospital,
  MapPin,
  Calendar,
  Clock,
  HeartHandshake,
  ShieldCheck,
  User,
  Phone,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Trash2,
} from 'lucide-react';

export const BloodRequestDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bloodRequestService.getRequestById(id);
      if (data.success && data.request) {
        setRequest(data.request);
      }
    } catch (err) {
      showError(err.message || 'Failed to load blood request details.');
    } finally {
      setLoading(false);
    }
  }, [id, showError]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const isOwner = user && request && (
    (typeof request.createdBy === 'object' ? request.createdBy._id : request.createdBy) === user._id
  );
  const isAdmin = user && user.role === 'admin';
  const canManage = isOwner || isAdmin;
  const isOpen = request?.status === 'open';

  const handleUpdateStatus = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const data = await bloodRequestService.updateStatus(id, newStatus);
      if (data.success) {
        showSuccess(`Request status updated to ${newStatus}.`);
        setRequest(data.request);
      }
    } catch (err) {
      showError(err.message || 'Failed to update status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this blood request?')) return;
    try {
      await bloodRequestService.deleteRequest(id);
      showSuccess('Blood request deleted.');
      navigate('/requests');
    } catch (err) {
      showError(err.message || 'Failed to delete request.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">Loading request information...</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Blood Request Not Found</h2>
        <p className="text-sm text-slate-500">The requested blood donation post could not be located or was removed.</p>
        <Link
          to="/requests"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-brand-600 bg-brand-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blood Requests
        </Link>
      </div>
    );
  }

  const requiredDate = new Date(request.requiredBy);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all requests
        </Link>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-md space-y-8">
        {/* Header Badges and Title */}
        <div className="space-y-4 border-b border-slate-100 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BloodGroupBadge group={request.bloodGroup} size="lg" />
              <UrgencyBadge urgency={request.urgency} />
              <StatusBadge status={request.status} />
            </div>

            <span className="text-xs text-slate-400">
              Posted {new Date(request.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Urgent Blood Needed at {request.hospitalName}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>
                {request.city}, {request.district}, {request.state}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>
                Required by:{' '}
                <strong>
                  {requiredDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Primary Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700">Required Units</span>
            <p className="text-2xl font-black text-slate-900">
              {request.unitsRequired} <span className="text-sm font-semibold text-slate-600">units</span>
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Blood Group</span>
            <p className="text-2xl font-black text-brand-700">{request.bloodGroup}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Urgency Assessment</span>
            <p className="text-lg font-bold text-slate-900 capitalize">{request.urgency}</p>
          </div>
        </div>

        {/* Clinical / Patient Instructions */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-900">Additional Instructions & Medical Details</h3>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
            {request.description || 'No additional instructions provided.'}
          </p>
        </div>

        {/* Creator & Contact Details Section */}
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Requester & Hospital Contact</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                {typeof request.createdBy === 'object' && request.createdBy.name
                  ? request.createdBy.name.charAt(0)
                  : 'R'}
              </div>
              <div>
                <p className="font-semibold text-slate-900">
                  {typeof request.createdBy === 'object' ? request.createdBy.name : 'Registered Member'}
                </p>
                <p className="text-xs text-slate-500">
                  {request.city}, {request.state}
                </p>
              </div>
            </div>

            {/* Direct phone number disclosure logic */}
            {canManage && request.contactPhone ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <Phone className="w-3.5 h-3.5" />
                Contact Phone: {request.contactPhone}
              </div>
            ) : (
              <div className="text-xs text-slate-600 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                Contact unlocked upon mutual request acceptance
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Hospital className="w-4 h-4 text-brand-600" />
            <span>Confirm donation eligibility at {request.hospitalName}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {isOpen && !isOwner && (
              <button
                type="button"
                onClick={() => setIsOfferModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-600/20 transition-all"
              >
                <HeartHandshake className="w-4 h-4" />
                Offer to Donate Blood
              </button>
            )}

            {/* Owner / Admin Management Controls */}
            {canManage && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {isOpen && (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus('fulfilled')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Mark Fulfilled
                  </button>
                )}

                {isOpen && (
                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={() => handleUpdateStatus('cancelled')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Cancel Request
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDelete}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Help Modal */}
      <OfferHelpModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        request={request}
        onSuccess={fetchDetail}
      />
    </div>
  );
};

export default BloodRequestDetailPage;
