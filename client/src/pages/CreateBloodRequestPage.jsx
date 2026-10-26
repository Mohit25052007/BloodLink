import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import bloodRequestService from '../services/bloodRequestService';
import { Hospital, MapPin, Calendar, Clock, AlertTriangle, PlusCircle, ShieldAlert } from 'lucide-react';
import Spinner from '../components/common/Loader';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = [
  { value: 'normal', label: 'Normal', desc: 'Planned surgeries or routine transfusions (within 3-7 days)' },
  { value: 'urgent', label: 'Urgent', desc: 'Required within 24-48 hours' },
  { value: 'critical', label: 'Critical', desc: 'Emergency ICU / Immediate resuscitation (within hours)' },
];

export const CreateBloodRequestPage = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  // Default requiredBy to 24 hours from now
  const defaultRequired = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    bloodGroup: 'O+',
    unitsRequired: 1,
    hospitalName: '',
    city: user?.address?.city || '',
    district: user?.address?.district || '',
    state: user?.address?.state || '',
    requiredBy: defaultRequired,
    urgency: 'urgent',
    description: '',
    contactPhone: user?.phone || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (new Date(formData.requiredBy) < new Date(Date.now() - 5 * 60 * 1000)) {
      setErrorMessage('Required-by date and time must be today or in the future.');
      showError('Required-by date cannot be in the past.');
      return;
    }

    setSubmitting(true);
    try {
      const data = await bloodRequestService.createRequest({
        ...formData,
        unitsRequired: parseInt(formData.unitsRequired, 10),
      });

      if (data.success && data.request) {
        showSuccess('Blood request posted successfully! Voluntary donors have been notified.');
        navigate(`/requests/${data.request._id}`);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create blood request.');
      showError(err.message || 'Failed to create blood request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-lg space-y-8">
        {/* Header */}
        <div className="border-b border-slate-100 pb-5 space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider">
            <PlusCircle className="w-4 h-4" />
            New Requirement
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Create a Blood Request
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Submit an emergency or scheduled requirement to connect with voluntary donors in your city.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blood Group and Units */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Blood Group Needed <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {BLOOD_GROUPS.map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => handleChange('bloodGroup', bg)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      formData.bloodGroup === bg
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="units" className="block text-xs font-semibold text-slate-700 mb-2">
                Units Required <span className="text-rose-500">*</span>
              </label>
              <input
                id="units"
                type="number"
                min={1}
                max={20}
                required
                value={formData.unitsRequired}
                onChange={(e) => handleChange('unitsRequired', e.target.value)}
                className="w-full text-sm font-semibold rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Maximum 20 units per request</span>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="space-y-4 pt-2">
            <div>
              <label htmlFor="hospitalName" className="block text-xs font-semibold text-slate-700 mb-1">
                Hospital / Blood Bank Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Hospital className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="hospitalName"
                  type="text"
                  required
                  maxLength={100}
                  value={formData.hospitalName}
                  onChange={(e) => handleChange('hospitalName', e.target.value)}
                  placeholder="E.g. Lilavati Hospital & Research Centre, Bandra"
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="req-city" className="block text-xs font-semibold text-slate-700 mb-1">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  id="req-city"
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="E.g. Mumbai"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="req-district" className="block text-xs font-semibold text-slate-700 mb-1">
                  District <span className="text-rose-500">*</span>
                </label>
                <input
                  id="req-district"
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => handleChange('district', e.target.value)}
                  placeholder="E.g. Mumbai Suburban"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="req-state" className="block text-xs font-semibold text-slate-700 mb-1">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  id="req-state"
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  placeholder="E.g. Maharashtra"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Timeline and Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label htmlFor="requiredBy" className="block text-xs font-semibold text-slate-700 mb-1">
                Required By Date & Time <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="requiredBy"
                  type="datetime-local"
                  required
                  value={formData.requiredBy}
                  onChange={(e) => handleChange('requiredBy', e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-xs font-semibold text-slate-700 mb-1">
                Emergency Contact Phone
              </label>
              <input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                placeholder="Phone number"
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[10px] text-slate-600 mt-1 block">
                Disclosed only to donors whose offers you accept
              </span>
            </div>
          </div>

          {/* Urgency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Urgency Level <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {URGENCIES.map((u) => {
                const isSelected = formData.urgency === u.value;
                return (
                  <div
                    key={u.value}
                    onClick={() => handleChange('urgency', u.value)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-rose-50/80 border-brand-500 ring-2 ring-brand-500/30'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold capitalize text-slate-900">{u.label}</span>
                      {u.value === 'critical' && (
                        <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{u.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Additional Instructions */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700 mb-1">
              Medical Notes & Patient Instructions
            </label>
            <textarea
              id="description"
              rows={3}
              maxLength={500}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="E.g. Patient undergoing open-heart bypass in Ward 4B. Please report to Lilavati Blood Bank counter."
              className="w-full text-sm rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
            ></textarea>
            <div className="flex justify-between items-center text-[11px] text-slate-600 mt-1">
              <span>Limit 500 characters</span>
              <span>{formData.description.length} / 500</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Spinner size="sm" className="border-white border-r-transparent" />
                  Publishing Request...
                </>
              ) : (
                'Publish Blood Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBloodRequestPage;
