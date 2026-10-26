import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import userService from '../services/userService';
import DonorCard from '../components/donors/DonorCard';
import DonorFilterSidebar from '../components/donors/DonorFilterSidebar';
import ContactDonorModal from '../components/donors/ContactDonorModal';
import { CardSkeleton } from '../components/common/Loader';
import { Search, Filter, ShieldCheck, ChevronLeft, ChevronRight, UserX } from 'lucide-react';

export const DonorSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [donors, setDonors] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Read initial filters from URL params
  const initialBloodGroup = searchParams.get('bloodGroup') || 'ALL';
  const initialCity = searchParams.get('city') || '';
  const initialDistrict = searchParams.get('district') || '';
  const initialState = searchParams.get('state') || '';
  const initialPincode = searchParams.get('pincode') || '';
  const initialAvailable = searchParams.get('available') || 'true';
  const initialVerified = searchParams.get('verifiedOnly') || 'true';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [filters, setFilters] = useState({
    bloodGroup: initialBloodGroup,
    city: initialCity,
    district: initialDistrict,
    state: initialState,
    pincode: initialPincode,
    available: initialAvailable,
    verifiedOnly: initialVerified,
  });

  const [page, setPage] = useState(initialPage);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        bloodGroup: filters.bloodGroup !== 'ALL' ? filters.bloodGroup : undefined,
        city: filters.city || undefined,
        district: filters.district || undefined,
        state: filters.state || undefined,
        pincode: filters.pincode || undefined,
        available: filters.available,
        verifiedOnly: filters.verifiedOnly,
      };

      const data = await userService.searchDonors(params);
      if (data.success) {
        setDonors(data.donors || []);
        setPagination(data.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Error fetching donors:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  // Sync state changes to URL search params
  const syncToURL = (newFilters, newPage) => {
    const params = new URLSearchParams();
    if (newFilters.bloodGroup && newFilters.bloodGroup !== 'ALL') params.set('bloodGroup', newFilters.bloodGroup);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.district) params.set('district', newFilters.district);
    if (newFilters.state) params.set('state', newFilters.state);
    if (newFilters.pincode) params.set('pincode', newFilters.pincode);
    if (newFilters.available) params.set('available', newFilters.available);
    if (newFilters.verifiedOnly) params.set('verifiedOnly', newFilters.verifiedOnly);
    if (newPage > 1) params.set('page', String(newPage));
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    setPage(1);
    syncToURL(updated, 1);
  };

  const handleClearFilters = () => {
    const defaultFilters = {
      bloodGroup: 'ALL',
      city: '',
      district: '',
      state: '',
      pincode: '',
      available: 'true',
      verifiedOnly: 'true',
    };
    setFilters(defaultFilters);
    setPage(1);
    syncToURL(defaultFilters, 1);
  };

  const handleSearchClick = () => {
    setPage(1);
    syncToURL(filters, 1);
    fetchDonors();
    setShowMobileFilter(false);
  };

  const handleContactDonor = (donor) => {
    setSelectedDonor(donor);
    setIsContactModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Find Voluntary Blood Donors</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search verified donors by blood group and location. Direct phone contacts are kept private until accepted.
          </p>
        </div>

        {/* Mobile filter toggle button */}
        <button
          type="button"
          onClick={() => setShowMobileFilter(!showMobileFilter)}
          className="md:hidden inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-200 text-slate-700 shadow-xs"
        >
          <Filter className="w-4 h-4 text-brand-600" />
          {showMobileFilter ? 'Hide Filters' : 'Filter Donors'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className={`md:block ${showMobileFilter ? 'block' : 'hidden'} md:col-span-1`}>
          <div className="sticky top-20">
            <DonorFilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onClear={handleClearFilters}
              onSearch={handleSearchClick}
              loading={loading}
            />
          </div>
        </div>

        {/* Donors Results Grid */}
        <div className="md:col-span-3 space-y-6">
          {/* Result Count and Summary */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{donors.length}</strong> of{' '}
              <strong className="text-slate-800">{pagination.total}</strong> registered donors
            </span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Identity-Protected Directory</span>
            </div>
          </div>

          {loading ? (
            <CardSkeleton count={6} />
          ) : donors.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4 max-w-lg mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-brand-500 flex items-center justify-center mx-auto">
                <UserX className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No Matching Donors Found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  We couldn't find any donors matching your selected location or blood group. Try broadening your
                  location search or clearing some filters.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                Reset All Search Filters
              </button>
            </div>
          ) : (
            <>
              {/* Donors Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {donors.map((donor) => (
                  <DonorCard
                    key={donor._id}
                    donor={donor}
                    onContactClick={handleContactDonor}
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const prevPage = page - 1;
                      setPage(prevPage);
                      syncToURL(filters, prevPage);
                    }}
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
                    onClick={() => {
                      const nextPage = page + 1;
                      setPage(nextPage);
                      syncToURL(filters, nextPage);
                    }}
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
      </div>

      {/* Contact Donor Modal */}
      <ContactDonorModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        donor={selectedDonor}
      />
    </div>
  );
};

export default DonorSearchPage;
