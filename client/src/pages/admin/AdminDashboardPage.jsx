import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { BloodGroupBadge, StatusBadge } from '../../components/common/Badge';
import { Spinner } from '../../components/common/Loader';
import {
  Users,
  Droplet,
  ShieldCheck,
  Hospital,
  Activity,
  ArrowRight,
  ShieldAlert,
  Inbox,
  Clock,
  UserCheck,
} from 'lucide-react';

export const AdminDashboardPage = () => {
  const { showError } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        showError(err.message || 'Failed to fetch admin metrics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [showError]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">Loading administrative analytics...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentUsers = data?.recentActivity?.recentUsers || [];
  const recentRequests = data?.recentActivity?.recentRequests || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            Administration Control Center
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time platform statistics, donor verification queue, and safety moderation controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/verifications"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-xs"
          >
            <UserCheck className="w-4 h-4" />
            Verification Queue ({stats.pendingVerifications || 0})
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Users */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Users</span>
          <p className="text-2xl font-black text-slate-900">{stats.totalUsers || 0}</p>
        </div>

        {/* Total Donors */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Donors</span>
          <p className="text-2xl font-black text-brand-600">{stats.totalDonors || 0}</p>
        </div>

        {/* Pending Verifications */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">Pending Review</span>
          <p className="text-2xl font-black text-amber-900">{stats.pendingVerifications || 0}</p>
        </div>

        {/* Verified Donors */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Verified Donors</span>
          <p className="text-2xl font-black text-emerald-900">{stats.verifiedDonors || 0}</p>
        </div>

        {/* Open Requests */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Open Requests</span>
          <p className="text-2xl font-black text-slate-900">{stats.openRequests || 0}</p>
        </div>

        {/* Fulfilled Requests */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Fulfilled</span>
          <p className="text-2xl font-black text-purple-700">{stats.fulfilledRequests || 0}</p>
        </div>
      </div>

      {/* Admin Module Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/verifications"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Donor Verification Management</h3>
            <p className="text-xs text-slate-500 mt-0.5">Review, approve, or reject pending donor profiles</p>
          </div>
          <UserCheck className="w-5 h-5 text-brand-600" />
        </Link>

        <Link
          to="/admin/users"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">User & Account Moderation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Search accounts, manage roles, and toggle suspensions</p>
          </div>
          <Users className="w-5 h-5 text-brand-600" />
        </Link>

        <Link
          to="/admin/requests"
          className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-500 hover:shadow-md transition-all flex items-center justify-between"
        >
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Blood Request Moderation</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monitor active hospital posts and adjust status</p>
          </div>
          <Hospital className="w-5 h-5 text-brand-600" />
        </Link>
      </div>

      {/* Two Column Section: Recent Users & Recent Blood Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Registered Members</h3>
            <Link to="/admin/users" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage Users →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentUsers.map((u) => (
              <div key={u._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{u.name}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {u.donorProfile?.isDonor && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-brand-700 font-bold text-[10px]">
                      Donor ({u.donorProfile.bloodGroup})
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded-md font-semibold text-[10px] uppercase ${
                      u.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Blood Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Blood Requests</h3>
            <Link to="/admin/requests" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              Manage Requests →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentRequests.map((r) => (
              <div key={r._id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{r.hospitalName}</p>
                  <p className="text-[11px] text-slate-400">
                    {r.city} • By {typeof r.createdBy === 'object' ? r.createdBy.name : 'User'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <BloodGroupBadge group={r.bloodGroup} size="sm" />
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
