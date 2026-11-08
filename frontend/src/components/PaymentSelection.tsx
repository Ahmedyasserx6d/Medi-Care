import React from 'react';

const PaymentSelection: React.FC = () => {
  return (
    <div className="border-y border-gray-200 py-6">
      <h2 className="text-lg font-black text-gray-900">Payment at the clinic</h2>
      <div className="mt-4 flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white text-2xl shadow-sm">💵</div>
        <div>
          <h3 className="font-black text-gray-900">Cash at Clinic</h3>
          <p className="mt-1 text-xs font-medium text-gray-600">Pay in person when you arrive. Online payment is not available yet.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;
