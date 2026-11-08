import React from 'react';

import MedicalChatbot from '../components/MedicalChatbot';
import { useAuth } from '../context/AuthContext';
import { Link, NavLink } from 'react-router-dom';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  const links = {
    Patient: [
      { name: 'Dashboard', path: '/', icon: '🏠' },
      { name: 'Book Appointment', path: '/book', icon: '📅' },
      { name: 'My Appointments', path: '/appointments', icon: '📋' },
      { name: 'My Medical Files', path: '/patient/files', icon: '📂' },
    ],
    Doctor: [
      { name: 'Dashboard', path: '/', icon: '🏠' },
      { name: 'Clinic Panel', path: '/doctor/clinic', icon: '🩺' },
      { name: 'Patient Records', path: '/doctor/records', icon: '📁' },
      { name: 'My Schedule', path: '/doctor/schedule', icon: '⏰' },
    ],
    Receptionist: [
      { name: 'Dashboard', path: '/', icon: '🏠' },
      { name: 'Reception Desk', path: '/reception', icon: '🏢' },
    ],
    Admin: [
      { name: 'Home', path: '/', icon: '🏠' },
      { name: 'Admin Dashboard', path: '/admin', icon: '📊' },
      { name: 'Reception Desk', path: '/reception', icon: '🏢' },
      { name: 'Manage Staff', path: '/admin/staff', icon: '🛡️' },
      { name: 'Clinic Services', path: '/admin/services', icon: '🏥' },
      { name: 'Center Settings', path: '/admin/settings', icon: '⚙️' },
    ]
  };

  const userRole = user?.role || 'Patient';
  const userLinks = (links as any)[userRole] || [];


  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 group-hover:rotate-12 transition-transform duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">MediCare</span>
          </Link>

          <nav className="flex items-center space-x-8">
            {!user ? (
              <div className="flex items-center space-x-4">
                <Link to="/" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Home</Link>
                <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Login</Link>
                <Link to="/register" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Register</Link>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2 mr-4 bg-gray-50 p-1.5 rounded-2xl">
                  {userLinks.map((link: any) => (
                    <NavLink
                      key={link.name}
                      to={link.path}
                      end={link.path === '/'}
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-4 py-2 rounded-xl font-bold transition-all ${
                          isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-blue-600 hover:bg-white/50'
                        }`
                      }
                    >
                      <span className="text-sm">{link.icon}</span>
                      <span className="text-xs uppercase tracking-wider">{link.name}</span>
                    </NavLink>
                  ))}
                </div>
                <div className="flex items-center space-x-4 border-l border-gray-100 pl-6">
                  <div className="flex flex-col text-right mr-2">
                    <span className="text-sm font-black text-gray-900 leading-tight">{user.firstName} {user.lastName}</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.role}</span>
                  </div>
                  {user.imageUrl || user.avatar ? (
                    <img src={user.imageUrl || user.avatar} alt={user.firstName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-black flex-shrink-0">
                      {user.firstName ? user.firstName[0] : 'U'}
                    </div>
                  )}
                  <button onClick={logout} className="ml-4 p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all cursor-pointer" title="Logout">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 flex space-x-8">
        
        <main className="flex-1 py-8 w-full">
          {children}
        </main>
      </div>

      <MedicalChatbot />
    </div>
  );
};

export default DashboardLayout;
