import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Appointment {
  _id: string;
  patientId: { firstName: string; lastName: string; phone: string };
  date: string;
  timeSlot: string;
  status: string;
  doctorNotes?: string;
}

const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments/doctor');
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments');
    }
  };

  const handleUpdateNotes = async () => {
    if (!selectedAppt) return;
    try {
      await api.put(`/appointments/${selectedAppt._id}/notes`, { doctorNotes: notes, status: 'Confirmed' });
      setSelectedAppt(null);
      fetchAppointments();
    } catch (error) {
      alert('Failed to save notes');
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Doctor Dashboard</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-4 font-semibold text-gray-600">Patient</th>
              <th className="p-4 font-semibold text-gray-600">Date & Time</th>
              <th className="p-4 font-semibold text-gray-600">Status</th>
              <th className="p-4 font-semibold text-gray-600">Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt._id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <p className="font-medium text-gray-900">{appt.patientId?.firstName} {appt.patientId?.lastName}</p>
                  <p className="text-sm text-gray-500">{appt.patientId?.phone}</p>
                </td>
                <td className="p-4">
                  <p className="text-gray-900">{new Date(appt.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-500">{appt.timeSlot}</p>
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {appt.status}
                  </span>
                </td>
                <td className="p-4">
                  <button 
                    onClick={() => { setSelectedAppt(appt); setNotes(appt.doctorNotes || ''); }}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Add Notes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedAppt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Consultation Notes</h2>
            <p className="text-sm text-gray-500 mb-4">Patient: {selectedAppt.patientId?.firstName} {selectedAppt.patientId?.lastName}</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl h-32 focus:ring-2 focus:ring-blue-500 outline-none mb-4"
              placeholder="Write diagnosis and prescriptions here..."
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setSelectedAppt(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Cancel</button>
              <button onClick={handleUpdateNotes} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Save Notes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
