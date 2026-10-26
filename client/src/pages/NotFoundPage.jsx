import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <Droplet className="w-8 h-8 fill-brand-600" />
        </div>

        <div className="space-y-2">
          <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">404</span>
          <h1 className="text-xl font-bold text-slate-800">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-xs transition-colors"
          >
            <Home className="w-4 h-4" />
            Return to Home
          </Link>
          <Link
            to="/donors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Find Donors
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
