import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bloodRequestService from '../services/bloodRequestService';
import { useToast } from '../context/ToastContext';
import { BloodGroupBadge, UrgencyBadge, StatusBadge } from '../components/common/Badge';
import { Spinner } from '../components/common/Loader';
import { PlusCircle, Hospital, Calendar, CheckCircle, XCircle, Trash2, ArrowRight, FileText } from 'lucide-react';

export const MyRequestsPage = () => {
  const { showSuccess, showError } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const data = await bloodRequestService.getMyRequests();
      if (data.success) {
        setRequests(data.requests || []);
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch your blood requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const data = await bloodRequestService.updateStatus(id, status);
      if (data.success) {
        showSuccess(`Request status updated to ${status}.`);
        fetchMyRequests();
      }
    } catch (err) {
      showError(err.message || 'Failed to update request.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blood request?')) return;
    try {
      await bloodRequestService.deleteRequest(id);
      showSuccess('Blood request removed.');
      fetchMyRequests();
    } catch (err) {
      showError(err.message || 'Failed to delete blood request.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Blood Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your submitted patient blood requests, update statuses, and track donation progress.
          </p>
        </div>

        <Link
          to="/create-request"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          Create New Request
        </Link>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Fetching your requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-md mx-auto my-8">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-brand-600 flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Blood Requests Yet</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You haven't posted any blood requirements. When you or a family member needs blood, create a request here.
            </p>
          </div>
          <Link
            to="/create-request"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Post First Blood Request
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((reqItem) => {
            const isOpen = reqItem.status === 'open';
            const requiredDate = new Date(reqItem.requiredBy);

            return (
              <div
                key={reqItem._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <BloodGroupBadge group={reqItem.bloodGroup} />
                    <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {reqItem.unitsRequired} {reqItem.unitsRequired === 1 ? 'Unit' : 'Units'}
                    </span>
                    <UrgencyBadge urgency={reqItem.urgency} />
                    <StatusBadge status={reqItem.status} />
                  </div>

                  <h3 className="font-semibold text-slate-900 text-base leading-snug">
                    {reqItem.hospitalName} — {reqItem.city}, {reqItem.state}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Needed by {requiredDate.toLocaleDateString()}
                    </span>
                    <span>•</span>
                    <span>Posted {new Date(reqItem.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  <Link
                    to={`/requests/${reqItem._id}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    View
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {isOpen && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(reqItem._id, 'fulfilled')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Fulfilled
                    </button>
                  )}

                  {isOpen && (
                    <button
                      type="button"
                      onClick={() => handleStatusChange(reqItem._id, 'cancelled')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(reqItem._id)}
                    className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    title="Delete Request"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRequestsPage;
