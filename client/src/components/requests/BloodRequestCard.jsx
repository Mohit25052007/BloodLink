import React from 'react';
import { Link } from 'react-router-dom';
import { Hospital, MapPin, Calendar, HeartHandshake, ArrowRight } from 'lucide-react';
import { BloodGroupBadge, UrgencyBadge, StatusBadge } from '../common/Badge';

export const BloodRequestCard = ({ request, onOfferHelpClick }) => {
  const isOpen = request.status === 'open';
  const requiredDate = new Date(request.requiredBy);
  const isPast = requiredDate < new Date();

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between card-hover">
      <div>
        {/* Header Tags */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <BloodGroupBadge group={request.bloodGroup} size="lg" />
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              {request.unitsRequired} {request.unitsRequired === 1 ? 'Unit' : 'Units'}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <UrgencyBadge urgency={request.urgency} />
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Hospital & Location */}
        <div className="space-y-1.5 mb-3">
          <h3 className="font-semibold text-slate-900 text-base leading-snug flex items-start gap-1.5">
            <Hospital className="w-4 h-4 text-brand-600 flex-shrink-0 mt-1" />
            <span>{request.hospitalName}</span>
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              {request.city}, {request.state}
            </span>
          </div>
        </div>

        {/* Required-by Timeline */}
        <div
          className={`flex items-center gap-1.5 text-xs p-2 rounded-xl mb-3 ${
            request.urgency === 'critical'
              ? 'bg-rose-50 text-rose-800 border border-rose-100'
              : 'bg-slate-50 text-slate-600 border border-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Needed by:{' '}
            <strong className="font-semibold">
              {requiredDate.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>{' '}
            {isPast && isOpen && '(Past due)'}
          </span>
        </div>

        {/* Description snippet */}
        {request.description && (
          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {request.description}
          </p>
        )}
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <Link
          to={`/requests/${request._id}`}
          className="text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors inline-flex items-center gap-1"
        >
          Details
          <ArrowRight className="w-3 h-3" />
        </Link>

        {isOpen && onOfferHelpClick && (
          <button
            type="button"
            onClick={() => onOfferHelpClick(request)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 transition-colors shadow-xs"
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            I Can Help
          </button>
        )}
      </div>
    </div>
  );
};

export default BloodRequestCard;
