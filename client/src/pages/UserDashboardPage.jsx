import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import bloodRequestService from '../services/bloodRequestService';
import contactRequestService from '../services/contactRequestService';
import notificationService from '../services/notificationService';
import { BloodGroupBadge, VerificationBadge, StatusBadge, UrgencyBadge } from '../components/common/Badge';
import { Spinner } from '../components/common/Loader';
import {
  Droplet,
  PlusCircle,
  Search,
  Inbox,
  Bell,
  CheckCircle2,
  Calendar,
  Hospital,
  ArrowRight,
  ShieldCheck,
  User,
  Settings,
  Clock,
} from 'lucide-react';

export const UserDashboardPage = () => {
  const { user, updateDonorProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const [myRequests, setMyRequests] = useState([]);
  const [incomingContacts, setIncomingContacts] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingAvailability, setTogglingAvailability] = useState(false);

  const donor = user?.donorProfile || {};
  const isDonor = Boolean(donor.isDonor);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [reqData, contactData, notifData] = await Promise.all([
        bloodRequestService.getMyRequests(),
        contactRequestService.getIncomingRequests(),
        notificationService.getNotifications({ limit: 4 }),
      ]);

      if (reqData.success) setMyRequests(reqData.requests || []);
      if (contactData.success) setIncomingContacts(contactData.requests || []);
      if (notifData.success) setRecentNotifications(notifData.notifications || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleAvailability = async () => {
    setTogglingAvailability(true);
    try {
      const newAvail = !donor.available;
      const data = await updateDonorProfile({ available: newAvail });
      if (data.success) {
        showSuccess(`Your donor availability is now ${newAvail ? 'ACTIVE' : 'PAUSED'}.`);
      }
    } catch (err) {
      showError(err.message || 'Failed to update availability.');
    } finally {
      setTogglingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-slate-500 font-medium">Loading your personalized dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Personal Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.address?.city}, {user?.address?.state} • Member since{' '}
            {new Date(user?.createdAt || Date.now()).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/create-request"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create Request
          </Link>
          <Link
            to="/donors"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <Search className="w-4 h-4 text-brand-600" />
            Find Donors
          </Link>
        </div>
      </div>

      {/* Donor Status & Availability Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Donor Profile Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Donor Status</span>
            {isDonor && <BloodGroupBadge group={donor.bloodGroup} />}
          </div>

          {isDonor ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <VerificationBadge status={donor.verificationStatus} />
              </div>

              {/* Availability Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-semibold text-slate-800">
                    {donor.available ? 'Available for Donation' : 'Currently Unavailable'}
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    {donor.available ? 'You appear in donor search results' : 'Hidden from search discovery'}
                  </span>
                </div>
                <button
                  type="button"
                  disabled={togglingAvailability}
                  onClick={handleToggleAvailability}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    donor.available ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={donor.available}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      donor.available ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="pt-2">
                <Link
                  to="/donor-profile"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                >
                  Manage Donor Profile →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                You are currently registered as a requester only. You can enable your donor profile anytime to help
                patients in your city.
              </p>
              <Link
                to="/donor-profile"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <Droplet className="w-3.5 h-3.5" />
                Become a Voluntary Donor
              </Link>
            </div>
          )}
        </div>

        {/* Card 2: Contact Inbox Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Inbox</span>
            <Inbox className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2">
            <p className="text-2xl font-black text-slate-900">{incomingContacts.length}</p>
            <p className="text-xs text-slate-500">
              Incoming offers & contact requests from patients and potential donors.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/inbox"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Open Contact Inbox →
            </Link>
          </div>
        </div>

        {/* Card 3: Blood Requests Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">My Blood Requests</span>
            <Hospital className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2">
            <p className="text-2xl font-black text-slate-900">{myRequests.length}</p>
            <p className="text-xs text-slate-500">
              Active patient requirements created from your account.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Link
              to="/my-requests"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              Manage My Requests →
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Grid: My Active Requests & Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: My Active Requests */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">My Active Blood Requests</h3>
            <Link to="/my-requests" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-xs text-slate-400">You haven't posted any blood requests yet.</p>
              <Link
                to="/create-request"
                className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Post your first blood request
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myRequests.slice(0, 3).map((reqItem) => (
                <div
                  key={reqItem._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <BloodGroupBadge group={reqItem.bloodGroup} size="sm" />
                      <span className="font-semibold text-xs text-slate-900 truncate max-w-[180px]">
                        {reqItem.hospitalName}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {reqItem.unitsRequired} units • Needed by {new Date(reqItem.requiredBy).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={reqItem.status} />
                    <Link
                      to={`/requests/${reqItem._id}`}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Notifications */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Recent Alerts & Notifications</h3>
            <Link to="/notifications" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-slate-400">No new alerts or notifications at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`p-3 rounded-2xl border text-xs space-y-1 ${
                    notif.readAt
                      ? 'bg-white border-slate-100 text-slate-600'
                      : 'bg-rose-50/60 border-rose-100 text-slate-900 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs">{notif.title}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">{notif.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
