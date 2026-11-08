import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="bg-blue-50 text-blue-600 p-4 rounded-full mb-6">
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Coming Soon</h2>
      <p className="text-gray-500 max-w-md">
        This feature is currently under development. Stay tuned for future updates!
      </p>
    </div>
  );
};

export default ComingSoon;
