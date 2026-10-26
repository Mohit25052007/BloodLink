import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Droplet,
  Search,
  PlusCircle,
  ShieldCheck,
  Heart,
  Users,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { EmergencyNotice } from '../components/common/EmergencyNotice';
import bloodRequestService from '../services/bloodRequestService';
import userService from '../services/userService';
import { BloodGroupBadge, UrgencyBadge } from '../components/common/Badge';

export const HomePage = () => {
  const [recentRequests, setRecentRequests] = useState([]);
  const [stats, setStats] = useState({ donors: '2,500+', requests: '1,400+', cities: '45+' });

  useEffect(() => {
    // Fetch a few open requests to display live data on the home page
    const fetchHomeData = async () => {
      try {
        const reqData = await bloodRequestService.getRequests({ limit: 3, status: 'open' });
        if (reqData.success && reqData.requests) {
          setRecentRequests(reqData.requests);
        }
      } catch (err) {
        // Fallback
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/70 via-white to-slate-50 pt-12 pb-16 sm:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/80 border border-brand-200 text-brand-800 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Community-Powered Blood Donor Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight sm:leading-none">
              Every Donor Can <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-rose-600">
                Make a Difference.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              BloodLink connects patients and hospitals with voluntary, verified blood donors in real time.
              Strict privacy protection ensures your personal phone number remains private until you choose to connect.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
              <Link
                to="/donors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:bg-brand-800 shadow-md shadow-brand-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <Search className="w-4 h-4" />
                Find Available Donors
              </Link>

              <Link
                to="/create-request"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300/80 shadow-xs transition-all hover:shadow-md"
              >
                <PlusCircle className="w-4 h-4 text-brand-600" />
                Request Blood Urgently
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified Donor Screening</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-brand-600" />
                <span>100% Free & Voluntary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>Zero Commercialization</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>
      </section>

      {/* Emergency Medical Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <EmergencyNotice />
      </section>

      {/* Live Recent Blood Requests */}
      {recentRequests.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-700 tracking-wider uppercase mb-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                Live Emergency Feed
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Open Blood Requests</h2>
            </div>
            <Link
              to="/requests"
              className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              View all open requests
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentRequests.map((reqItem) => (
              <div
                key={reqItem._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all card-hover"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <BloodGroupBadge group={reqItem.bloodGroup} />
                    <UrgencyBadge urgency={reqItem.urgency} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1">{reqItem.hospitalName}</h3>
                  <p className="text-xs text-slate-500 mb-3">
                    {reqItem.city}, {reqItem.state} • {reqItem.unitsRequired} {reqItem.unitsRequired === 1 ? 'unit' : 'units'} needed
                  </p>
                  {reqItem.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-lg">
                      {reqItem.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between items-center">
                  <span className="text-[11px] text-slate-400">
                    Needed by {new Date(reqItem.requiredBy).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/requests/${reqItem._id}`}
                    className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View & Offer Help →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* How BloodLink Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Simple & Secure</span>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">How BloodLink Works</h2>
          <p className="text-sm text-slate-600">
            A three-step safe process that protects your personal identity while coordinating urgent donations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg border border-brand-100">
              1
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Post or Search</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Patients and caregivers create a blood request specifying hospital, blood group, and required timeline.
              Alternatively, search for verified nearby donors by city and blood type.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg border border-brand-100">
              2
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Protected Coordination</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Donors send an offer or requesters send a contact request. Phone numbers remain completely hidden until the
              intended recipient accepts the request in their inbox.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg border border-brand-100">
              3
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Hospital Donation</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Both parties connect directly, confirm compatibility with the hospital blood bank, and complete the
              voluntary donation process under professional medical supervision.
            </p>
          </div>
        </div>
      </section>

      {/* Blood Group Compatibility Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="max-w-2xl mb-8 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Educational Guide</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Blood Compatibility Reference
            </h2>
            <p className="text-sm text-slate-600">
              Understanding which blood groups can donate to and receive from each other.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="pb-3 px-3">Blood Type</th>
                  <th className="pb-3 px-3">Can Donate Red Cells To</th>
                  <th className="pb-3 px-3">Can Receive Red Cells From</th>
                  <th className="pb-3 px-3">Key Characteristic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                <tr>
                  <td className="py-3 px-3 font-bold text-brand-700">O-</td>
                  <td className="py-3 px-3 text-slate-700">All Blood Types (Universal Red Cells)</td>
                  <td className="py-3 px-3 text-slate-700">O- only</td>
                  <td className="py-3 px-3 text-brand-600 font-semibold">Universal Emergency Donor</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-brand-700">O+</td>
                  <td className="py-3 px-3 text-slate-700">O+, A+, B+, AB+</td>
                  <td className="py-3 px-3 text-slate-700">O+, O-</td>
                  <td className="py-3 px-3 text-slate-500">Most common blood type</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-brand-700">A+</td>
                  <td className="py-3 px-3 text-slate-700">A+, AB+</td>
                  <td className="py-3 px-3 text-slate-700">A+, A-, O+, O-</td>
                  <td className="py-3 px-3 text-slate-500">Platelets highly valuable</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-brand-700">B+</td>
                  <td className="py-3 px-3 text-slate-700">B+, AB+</td>
                  <td className="py-3 px-3 text-slate-700">B+, B-, O+, O-</td>
                  <td className="py-3 px-3 text-slate-500">High demand in South Asia</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-brand-700">AB+</td>
                  <td className="py-3 px-3 text-slate-700">AB+ only</td>
                  <td className="py-3 px-3 text-slate-700">All Blood Types (Universal Recipient)</td>
                  <td className="py-3 px-3 text-emerald-600 font-semibold">Universal Recipient / Plasma Donor</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
            <strong>Clinical Notice:</strong> Blood compatibility must always be cross-matched and confirmed by the
            transfusion department at the treating hospital prior to any medical procedure.
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-brand-700 via-brand-600 to-rose-600 p-8 sm:p-12 text-white text-center space-y-6 shadow-xl shadow-brand-700/20">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Save a Life in Your City?
            </h2>
            <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
              Register in under two minutes as a voluntary donor. Set your availability, update your blood group, and
              receive emergency notifications only when needed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-white text-brand-700 hover:bg-rose-50 transition-all shadow-md hover:scale-105"
            >
              Register as a Donor
            </Link>
            <Link
              to="/donors"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm text-white border border-white/40 hover:bg-white/10 transition-colors"
            >
              Browse Donor Directory
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
