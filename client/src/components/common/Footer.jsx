import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Heart, Shield, Phone, AlertCircle } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Droplet className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Blood<span className="text-brand-500">Link</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every donor can make a difference. Connecting voluntary blood donors with patients and hospitals in
              need through a privacy-focused community platform.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/donors" className="hover:text-white transition-colors">
                  Find Blood Donors
                </Link>
              </li>
              <li>
                <Link to="/requests" className="hover:text-white transition-colors">
                  View Blood Requests
                </Link>
              </li>
              <li>
                <Link to="/create-request" className="hover:text-white transition-colors">
                  Submit a Blood Request
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  Register as a Donor
                </Link>
              </li>
            </ul>
          </div>

          {/* Blood Compatibility Info */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-3">Blood Types</h4>
            <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((group) => (
                <Link
                  key={group}
                  to={`/donors?bloodGroup=${encodeURIComponent(group)}`}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-brand-900/60 hover:text-white transition-colors font-bold text-slate-200"
                >
                  {group}
                </Link>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-slate-400">
              *O- is the universal red blood cell donor; AB+ is the universal plasma recipient.
            </p>
          </div>

          {/* Safety & Legal Disclaimers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-100 mb-3">Safety & Disclaimer</h4>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
              <p>
                BloodLink is not a certified blood bank or emergency clinical provider. Direct contact details are kept
                strictly private until mutual request acceptance.
              </p>
              <p>
                Compatibility, hemoglobin checks, and donation eligibility must always be confirmed directly by receiving
                medical professionals.
              </p>
            </div>
          </div>
        </div>

        {/* Emergency Notice Footer Banner */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 mb-8 flex items-center gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Medical Emergency Notice:</strong> In urgent life-or-death situations, do not rely exclusively on
            online responses. Contact emergency services or visit the nearest hospital emergency room immediately.
          </span>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} BloodLink Community Platform. All rights reserved.</p>
          <div className="flex items-center gap-1">
            <span>Built with care for public health</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
