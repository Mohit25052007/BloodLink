import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import bloodRequestService from '../services/bloodRequestService';
import BloodRequestCard from '../components/requests/BloodRequestCard';
import OfferHelpModal from '../components/requests/OfferHelpModal';
import { CardSkeleton } from '../components/common/Loader';
import { PlusCircle, Search, Filter, RotateCcw, ChevronLeft, ChevronRight, AlertCircle, FileText } from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = ['ALL', 'critical', 'urgent', 'normal'];

export const BloodRequestsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  const initialBloodGroup = searchParams.get('bloodGroup') || 'ALL';
  const initialUrgency = searchParams.get('urgency') || 'ALL';
  const initialCity = searchParams.get('city') || '';
  const initialStatus = searchParams.get('status') || 'open';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [filters, setFilters] = useState({
    bloodGroup: initialBloodGroup,
    urgency: initialUrgency,
    city: initialCity,
    status: initialStatus,
  });

  const [page, setPage] = useState(initialPage);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        bloodGroup: filters.bloodGroup !== 'ALL' ? filters.bloodGroup : undefined,
        urgency: filters.urgency !== 'ALL' ? filters.urgency : undefined,
        city: filters.city || undefined,
        status: filters.status !== 'ALL' ? filters.status : undefined,
      };

      const data = await bloodRequestService.getRequests(params);
      if (data.success) {
        setRequests(data.requests || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Error fetching blood requests:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setPage(1);

    const params = new URLSearchParams();
    if (updated.bloodGroup !== 'ALL') params.set('bloodGroup', updated.bloodGroup);
    if (updated.urgency !== 'ALL') params.set('urgency', updated.urgency);
    if (updated.city) params.set('city', updated.city);
    if (updated.status !== 'open') params.set('status', updated.status);
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    const reset = { bloodGroup: 'ALL', urgency: 'ALL', city: '', status: 'open' };
    setFilters(reset);
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  const handleOfferHelp = (reqItem) => {
    setSelectedRequest(reqItem);
    setIsOfferModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Active Blood Requests</h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse verified emergency and scheduled patient blood requirements across hospitals.
          </p>
        </div>

        <Link
          to="/create-request"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          Create Blood Request
        </Link>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {/* Blood Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
            <select
              value={filters.bloodGroup}
              onChange={(e) => handleFilterChange('bloodGroup', e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {BLOOD_GROUPS.map((bg) => (
                <option key={bg} value={bg}>
                  {bg === 'ALL' ? 'All Blood Groups' : bg}
                </option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Level</label>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange('urgency', e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>
                  {u === 'ALL' ? 'All Urgencies' : u}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
            <input
              type="text"
              placeholder="Search city..."
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
            >
              <option value="open">Open Requests Only</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </div>

        {/* Clear Filters bar */}
        {(filters.bloodGroup !== 'ALL' || filters.urgency !== 'ALL' || filters.city || filters.status !== 'open') && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Filters applied</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Requests Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Found <strong className="text-slate-800">{requests.length}</strong> of{' '}
            <strong className="text-slate-800">{pagination.total}</strong> blood requests
          </span>
        </div>

        {loading ? (
          <CardSkeleton count={6} />
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">No Blood Requests Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                There are currently no requests matching your criteria. Try adjusting your filters or post a new request.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Clear Filters
              </button>
              <Link
                to="/create-request"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
              >
                Create Request
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((request) => (
                <BloodRequestCard
                  key={request._id}
                  request={request}
                  onOfferHelpClick={handleOfferHelp}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-xs font-medium text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Offer to Donate Help Modal */}
      <OfferHelpModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
};

export default BloodRequestsPage;
