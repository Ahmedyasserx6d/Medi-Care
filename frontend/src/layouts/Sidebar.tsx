import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
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
    <aside className="w-72 bg-white rounded-[2.5rem] border border-gray-100 p-6 flex flex-col h-[calc(100vh-120px)] sticky top-24 shadow-sm">
      <div className="flex-1 space-y-2 overflow-y-auto pr-2 custom-scrollbar">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-4">Main Menu</p>
        {userLinks.map((link: any) => (
          <NavLink
            key={link.name}
            to={link.path}
            end={link.path === '/'}
            className={({ isActive }) =>
              `flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            <span className="text-xl">{link.icon}</span>
            <span className="text-sm">{link.name}</span>
          </NavLink>
        ))}
      </div>

      <div className="pt-6 border-t border-gray-50">
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-bold text-red-500 hover:bg-red-50 transition-all"
        >
          <span className="text-xl">🚪</span>
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
