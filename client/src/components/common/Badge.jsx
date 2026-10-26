import React from 'react';
import { Droplet, AlertTriangle, ShieldCheck, Clock, XCircle, CheckCircle } from 'lucide-react';

export const BloodGroupBadge = ({ group, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-lg bg-rose-50 text-brand-700 border border-rose-200/80 shadow-xs ${
        sizeClasses[size] || sizeClasses.md
      }`}
    >
      <Droplet className="w-3.5 h-3.5 fill-brand-600 text-brand-600" />
      {group || 'Unknown'}
    </span>
  );
};

export const UrgencyBadge = ({ urgency }) => {
  if (urgency === 'critical') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
        Critical
      </span>
    );
  }
  if (urgency === 'urgent') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
        <AlertTriangle className="w-3 h-3 text-amber-600" />
        Urgent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
      Normal
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const styles = {
    open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    fulfilled: 'bg-purple-50 text-purple-700 border-purple-200',
    cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
    expired: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const icons = {
    open: <CheckCircle className="w-3 h-3 text-emerald-600" />,
    fulfilled: <ShieldCheck className="w-3 h-3 text-purple-600" />,
    cancelled: <XCircle className="w-3 h-3 text-slate-500" />,
    expired: <Clock className="w-3 h-3 text-rose-600" />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${
        styles[status] || styles.open
      }`}
    >
      {icons[status]}
      {status}
    </span>
  );
};

export const VerificationBadge = ({ status }) => {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        Verified Donor
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle className="w-3.5 h-3.5 text-rose-600" />
        Verification Declined
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <Clock className="w-3.5 h-3.5 text-amber-500" />
      Verification Pending
    </span>
  );
};
