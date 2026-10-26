import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { BloodGroupBadge, VerificationBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import Modal from '../../components/common/Modal';
import { ShieldCheck, XCircle, CheckCircle, Search, UserCheck, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminVerificationsPage = () => {
  const { showSuccess, showError } = useToast();

  const [donors, setDonors] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // 'pending' | 'verified' | 'rejected' | 'ALL'
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);

  // Rejection Modal State
  const [rejectingDonor, setRejectingDonor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchVerifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        isDonor: 'true',
        verificationStatus: filterStatus !== 'ALL' ? filterStatus : undefined,
        page,
        limit: 15,
      };

      const data = await adminService.getUsers(params);
      if (data.success) {
        setDonors(data.users || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch donor verifications.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page, showError]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  const handleApprove = async (id) => {
    setSubmittingAction(true);
    try {
      const data = await adminService.updateVerification(id, 'verified', 'Verified by Admin review.');
      if (data.success) {
        showSuccess('Donor verification approved!');
        fetchVerifications();
      }
    } catch (err) {
      showError(err.message || 'Failed to approve verification.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const openRejectModal = (donor) => {
    setRejectingDonor(donor);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectingDonor) return;

    setSubmittingAction(true);
    try {
      const data = await adminService.updateVerification(
        rejectingDonor._id,
        'rejected',
        rejectReason.trim() || 'Did not meet verification criteria.'
      );
      if (data.success) {
        showSuccess('Donor verification declined.');
        setIsRejectModalOpen(false);
        fetchVerifications();
      }
    } catch (err) {
      showError(err.message || 'Failed to decline verification.');
    } finally {
      setSubmittingAction(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Donor Verification Moderation
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review registered voluntary blood donors before activating public search visibility.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl text-xs font-semibold">
          {['pending', 'verified', 'rejected', 'ALL'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setFilterStatus(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl capitalize transition-colors ${
                filterStatus === st ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Loading verification records...</p>
        </div>
      ) : donors.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3 max-w-md mx-auto my-8">
          <UserCheck className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Queue is Clear!</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            There are currently no donor accounts with status "{filterStatus}".
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Blood Group</th>
                  <th className="py-3 px-4">City / State</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4">Bio / Notes</th>
                  <th className="py-3 px-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {donors.map((donor) => {
                  const dp = donor.donorProfile || {};
                  return (
                    <tr key={donor._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{donor.name}</p>
                        <p className="text-xs text-slate-400">{donor.email} • {donor.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <BloodGroupBadge group={dp.bloodGroup} size="sm" />
                      </td>
                      <td className="py-4 px-4 text-slate-600">
                        {donor.address?.city}, {donor.address?.state}
                      </td>
                      <td className="py-4 px-4">
                        <VerificationBadge status={dp.verificationStatus} />
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 max-w-xs truncate">
                        {dp.bio || 'No bio submitted'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {dp.verificationStatus !== 'verified' && (
                            <button
                              type="button"
                              disabled={submittingAction}
                              onClick={() => handleApprove(donor._id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}

                          {dp.verificationStatus !== 'rejected' && (
                            <button
                              type="button"
                              disabled={submittingAction}
                              onClick={() => openRejectModal(donor)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Decline
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Decline Donor Verification"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide an optional reason for declining verification for{' '}
            <strong>{rejectingDonor?.name}</strong>. This note will be sent to the donor in an in-app alert.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Decline Reason / Notes
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="E.g., Incomplete address information or unverified blood report."
              className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingAction}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
            >
              Confirm Decline
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminVerificationsPage;
