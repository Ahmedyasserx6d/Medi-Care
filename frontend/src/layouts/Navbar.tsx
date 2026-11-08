import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="font-bold text-xl text-blue-900">MediCare</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
            <Link to="/appointments" className="text-gray-500 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">My Appointments</Link>
            <div className="h-8 w-8 rounded-full bg-blue-100 border-2 border-blue-500 cursor-pointer overflow-hidden">
              <img src="https://via.placeholder.com/150" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
