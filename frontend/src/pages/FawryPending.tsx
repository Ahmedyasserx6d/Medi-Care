import React from 'react';
import { Link } from 'react-router-dom';

const FawryPending: React.FC = () => {
  const referenceCode = "789 456 123";

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Pending</h1>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Please proceed to the nearest Fawry Kiosk and pay using the reference code below to confirm your booking.
      </p>
      
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center mb-8 w-full max-w-sm">
        <p className="text-sm text-gray-500 uppercase tracking-wider mb-2 font-semibold">Fawry Reference Code</p>
        <p className="text-4xl font-bold text-blue-600 tracking-widest">{referenceCode}</p>
        <p className="text-xs text-gray-400 mt-4">Code expires in 24 hours</p>
      </div>

      <div className="flex gap-4">
        <Link to="/appointments" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          View Appointments
        </Link>
      </div>
    </div>
  );
};

export default FawryPending;
