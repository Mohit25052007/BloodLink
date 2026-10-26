import React from 'react';
import { AlertCircle } from 'lucide-react';

export const EmergencyNotice = ({ className = '' }) => {
  return (
    <div
      className={`bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs text-amber-900 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <p className="font-semibold text-amber-950">Important Emergency Notice</p>
          <p className="mt-0.5 text-amber-800">
            BloodLink is a community peer-finder platform connecting voluntary donors with patient requests. It is
            <strong> not an emergency response service or blood bank</strong>. In critical life-threatening situations,
            please immediately contact local emergency services (112 / 108) or official hospital blood banks directly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyNotice;
