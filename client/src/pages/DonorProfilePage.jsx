import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { BloodGroupBadge, VerificationBadge } from '../components/common/Badge';
import { Droplet, ShieldCheck, Calendar, Info, Save } from 'lucide-react';
import Spinner from '../components/common/Loader';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const DonorProfilePage = () => {
  const { user, updateDonorProfile } = useAuth();
  const { showSuccess, showError } = useToast();

  const currentProfile = user?.donorProfile || {};

  const [formData, setFormData] = useState({
    isDonor: Boolean(currentProfile.isDonor),
    bloodGroup: currentProfile.bloodGroup || 'O+',
    available: currentProfile.available !== false,
    lastDonationDate: currentProfile.lastDonationDate
      ? new Date(currentProfile.lastDonationDate).toISOString().slice(0, 10)
      : '',
    bio: currentProfile.bio || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = await updateDonorProfile({
        isDonor: formData.isDonor,
        bloodGroup: formData.isDonor ? formData.bloodGroup : undefined,
        available: formData.available,
        lastDonationDate: formData.lastDonationDate || null,
        bio: formData.bio.trim(),
      });

      if (data.success) {
        showSuccess('Donor profile updated successfully!');
      }
    } catch (err) {
      showError(err.message || 'Failed to update donor profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
          <Droplet className="w-4 h-4" />
          Voluntary Donor Profile
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Donor Profile Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Control your donation availability, blood group details, and view your verification status.
        </p>
      </div>

      {/* Verification Status Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Account Verification
          </span>
          <VerificationBadge status={currentProfile.verificationStatus || 'pending'} />
        </div>

        <div className="text-xs text-slate-600 space-y-1.5 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <p>
            <strong>How Verification Works:</strong> BloodLink administrators review donor records to ensure reliable,
            responsible community connections. Only opted-in donors with an approved verification status appear in
            standard donor search results.
          </p>
          {currentProfile.verificationNotes && (
            <p className="text-rose-700 font-medium pt-1">
              Note from admin: {currentProfile.verificationNotes}
            </p>
          )}
          <p className="text-slate-600 text-[11px] pt-1">
            *Verification indicates account authenticity and basic eligibility criteria, not an official clinical medical certificate.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voluntary Donor Toggle */}
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between gap-4">
            <div>
              <span className="block text-sm font-bold text-slate-900">
                Register as an Active Voluntary Donor
              </span>
              <span className="block text-xs text-slate-600">
                Allow patients and caregivers in your area to find and contact you for blood donation.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.isDonor}
              onChange={(e) => setFormData((prev) => ({ ...prev, isDonor: e.target.checked }))}
              className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300 cursor-pointer"
            />
          </div>

          {formData.isDonor && (
            <div className="space-y-6 animate-in fade-in">
              {/* Blood Group */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Blood Group <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_GROUPS.map((bg) => (
                    <button
                      key={bg}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bloodGroup: bg }))}
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

              {/* Immediate Availability Toggle */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-900">Current Availability</span>
                  <span className="block text-[11px] text-slate-500">
                    Temporarily turn this off if you recently donated, are traveling, or are unwell.
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.available}
                    onChange={(e) => setFormData((prev) => ({ ...prev, available: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Last Donation Date */}
              <div>
                <label htmlFor="lastDonationDate" className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Blood Donation Date (Optional)
                </label>
                <div className="relative max-w-xs">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="lastDonationDate"
                    type="date"
                    value={formData.lastDonationDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, lastDonationDate: e.target.value }))}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <span className="text-[11px] text-slate-600 mt-1 block">
                  Standard medical recovery interval is 90 days between whole blood donations.
                </span>
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="donor-bio" className="block text-xs font-semibold text-slate-700 mb-1">
                  Short Bio or Donation Preferences
                </label>
                <textarea
                  id="donor-bio"
                  rows={3}
                  maxLength={300}
                  value={formData.bio}
                  onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                  placeholder="E.g., Available on short notice in South Mumbai. Regular platelet donor."
                  className="w-full text-xs rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                ></textarea>
                <div className="flex justify-between items-center text-[11px] text-slate-600 mt-1">
                  <span>Max 300 characters</span>
                  <span>{formData.bio.length} / 300</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-sm transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Donor Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DonorProfilePage;
