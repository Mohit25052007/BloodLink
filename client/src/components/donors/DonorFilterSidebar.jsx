import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorFilterSidebar = ({ filters, onChange, onClear, onSearch, loading }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
          <Filter className="w-4 h-4 text-brand-600" />
          Filter Donors
        </div>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-brand-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {/* Blood Group Filter */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
          Blood Group
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {BLOOD_GROUPS.map((bg) => {
            const isSelected = (filters.bloodGroup || 'ALL') === bg;
            return (
              <button
                key={bg}
                type="button"
                onClick={() => onChange('bloodGroup', bg)}
                className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {bg}
              </button>
            );
          })}
        </div>
      </div>

      {/* Location Filters */}
      <div className="space-y-3 pt-1 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Location
        </label>

        <div>
          <label htmlFor="filter-city" className="block text-xs text-slate-600 mb-1">
            City
          </label>
          <input
            id="filter-city"
            type="text"
            value={filters.city || ''}
            onChange={(e) => onChange('city', e.target.value)}
            placeholder="E.g. Mumbai, Pune"
            className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="filter-district" className="block text-xs text-slate-600 mb-1">
            District
          </label>
          <input
            id="filter-district"
            type="text"
            value={filters.district || ''}
            onChange={(e) => onChange('district', e.target.value)}
            placeholder="E.g. Central, Suburban"
            className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="filter-state" className="block text-xs text-slate-600 mb-1">
            State
          </label>
          <input
            id="filter-state"
            type="text"
            value={filters.state || ''}
            onChange={(e) => onChange('state', e.target.value)}
            placeholder="E.g. Maharashtra, Delhi"
            className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="filter-pincode" className="block text-xs text-slate-600 mb-1">
            Postal Code (Pincode)
          </label>
          <input
            id="filter-pincode"
            type="text"
            value={filters.pincode || ''}
            onChange={(e) => onChange('pincode', e.target.value)}
            placeholder="E.g. 400001"
            className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-2.5 pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.available === 'true'}
            onChange={(e) => onChange('available', e.target.checked ? 'true' : 'false')}
            className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-slate-300"
          />
          Available donors only
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.verifiedOnly === 'true'}
            onChange={(e) => onChange('verifiedOnly', e.target.checked ? 'true' : 'false')}
            className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-slate-300"
          />
          Verified donors only
        </label>
      </div>

      {/* Submit Search Button */}
      <button
        type="button"
        onClick={onSearch}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
      >
        <Search className="w-4 h-4" />
        {loading ? 'Searching...' : 'Apply Filters'}
      </button>
    </div>
  );
};

export default DonorFilterSidebar;
