import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { BloodGroupBadge, UrgencyBadge, StatusBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import { Hospital, Search, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

export const AdminRequestsPage = () => {
  const { showSuccess, showError } = useToast();

  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        urgency: urgencyFilter !== 'ALL' ? urgencyFilter : undefined,
        page,
        limit: 15,
      };

      const data = await adminService.getBloodRequests(params);
      if (data.success) {
        setRequests(data.requests || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      showError(err.message || 'Failed to fetch blood requests.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, urgencyFilter, page, showError]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const data = await adminService.updateBloodRequestStatus(id, newStatus);
      if (data.success) {
        showSuccess(`Blood request status updated to ${newStatus}.`);
        fetchRequests();
      }
    } catch (err) {
      showError(err.message || 'Failed to update request status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Blood Request Moderation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review patient requirements, monitor urgency levels, and adjust request lifecycles.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search hospital or city..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:outline-none capitalize"
          >
            <option value="ALL">All Statuses</option>
            <option value="open">Open</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          {/* Urgency Filter */}
          <select
            value={urgencyFilter}
            onChange={(e) => {
              setUrgencyFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:outline-none capitalize"
          >
            <option value="ALL">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Loading blood requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3 max-w-md mx-auto my-8">
          <Hospital className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No Requests Found</h3>
          <p className="text-xs text-slate-500">No blood requests match your selected moderation filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Hospital & Location</th>
                  <th className="py-3 px-4">Group & Units</th>
                  <th className="py-3 px-4">Requester Contact</th>
                  <th className="py-3 px-4">Urgency & Timeline</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Moderator Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{r.hospitalName}</p>
                      <p className="text-xs text-slate-500">{r.city}, {r.state}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <BloodGroupBadge group={r.bloodGroup} size="sm" />
                        <span className="text-xs font-semibold text-slate-700">
                          {r.unitsRequired} {r.unitsRequired === 1 ? 'unit' : 'units'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs">
                      <p className="font-semibold text-slate-900">
                        {typeof r.createdBy === 'object' ? r.createdBy.name : 'User'}
                      </p>
                      <p className="text-slate-400 font-mono">
                        {typeof r.createdBy === 'object' ? r.createdBy.phone : ''}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <UrgencyBadge urgency={r.urgency} />
                        <p className="text-[11px] text-slate-500">
                          {new Date(r.requiredBy).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/requests/${r._id}`}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          View
                        </Link>

                        {r.status === 'open' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r._id, 'fulfilled')}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          >
                            Fulfill
                          </button>
                        )}

                        {r.status === 'open' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r._id, 'cancelled')}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;
