import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter">My Health Journey</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Medical Session History & Designated Doctors</p>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <tr>
                <th className="px-10 py-8">Reference</th>
                <th className="px-10 py-8">Medical Team</th>
                <th className="px-10 py-8">Schedule</th>
                <th className="px-10 py-8">Clinic Status</th>
                <th className="px-10 py-8">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {appointments.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-10 py-8">
                    <span className="font-mono text-[10px] text-gray-300 group-hover:text-blue-400 transition-colors">#{app._id.slice(-6).toUpperCase()}</span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      {app.doctorId?.imageUrl || app.doctorId?.avatar ? (
                        <img src={app.doctorId.imageUrl || app.doctorId.avatar} alt="Doctor" className="w-12 h-12 rounded-2xl object-cover shadow-sm border border-gray-100 flex-shrink-0" />
                      ) : (
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xs flex-shrink-0">
                          {(app.doctorId?.firstName || 'D')[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-black text-gray-900">Dr. {app.doctorId?.firstName || 'Unknown'} {app.doctorId?.lastName || ''}</div>
                        <div className="text-[9px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{app.doctorId?.specialty || 'General'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="font-bold text-gray-700 text-sm">{new Date(app.date).toLocaleDateString()}</div>
                    <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{app.timeSlot}</div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      app.status === 'Completed' ? 'bg-emerald-100 text-emerald-600' : 
                      app.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        app.paymentStatus === 'Paid' ? 'text-emerald-500' : 'text-amber-500'
                      }`}>
                        {app.paymentStatus === 'Paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                      <span className="text-[9px] font-bold text-gray-300 mt-1">EGP {app.amount}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {appointments.length === 0 && (
          <div className="py-24 text-center">
            <p className="text-gray-300 font-black uppercase text-[10px] tracking-[0.3em]">No medical history found yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
