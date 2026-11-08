import React from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccess: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
      <p className="text-gray-500 text-center max-w-md mb-8">
        Your payment was successful and your appointment has been scheduled. You will receive a confirmation message shortly.
      </p>
      <div className="flex gap-4">
        <Link to="/appointments" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
          View Appointments
        </Link>
        <Link to="/" className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
