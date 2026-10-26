import React from 'react';
import { MapPin, Calendar, MessageSquare, ShieldCheck, Heart } from 'lucide-react';
import { BloodGroupBadge, VerificationBadge } from '../common/Badge';

export const DonorCard = ({ donor, onContactClick }) => {
  const profile = donor.donorProfile || {};
  const isAvailable = profile.available !== false;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between card-hover">
      <div>
        {/* Top Bar */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200/60 flex items-center justify-center font-bold text-brand-700 text-base shadow-xs">
              {donor.name ? donor.name.charAt(0) : 'D'}
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-base leading-snug">{donor.name}</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="truncate">
                  {donor.address?.city}, {donor.address?.state}
                </span>
              </div>
            </div>
          </div>
          <BloodGroupBadge group={profile.bloodGroup} size="md" />
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3.5 pt-1">
          <VerificationBadge status={profile.verificationStatus} />

          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${
              isAvailable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}
            ></span>
            {isAvailable ? 'Available Now' : 'Currently Unavailable'}
          </span>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic">
            "{profile.bio}"
          </p>
        )}

        {/* Last Donation Date */}
        {profile.lastDonationDate && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Last donation: {new Date(profile.lastDonationDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-600 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          Direct contact protected
        </span>

        <button
          type="button"
          onClick={() => onContactClick(donor)}
          disabled={!isAvailable}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-colors ${
            isAvailable
              ? 'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Contact Donor
        </button>
      </div>
    </div>
  );
};

export default DonorCard;
