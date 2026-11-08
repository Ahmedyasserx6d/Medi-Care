import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ManageDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDoctor, setNewDoctor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: 'password123',
    specialty: '',
    degree: '',
    experience: 0
  });

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/auth/doctors');
      setDoctors(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Logic for admin to create a user with role 'Doctor'
      await api.post('/auth/register', { ...newDoctor, role: 'Doctor' });
      alert('Doctor added successfully! ✅');
      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      alert('Error adding doctor');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Medical Staff</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Specialist Roster</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 transition-all"
        >
          + Add New Specialist
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <tr>
              <th className="px-10 py-8">Practitioner</th>
              <th className="px-10 py-8">Specialty</th>
              <th className="px-10 py-8">Credentials</th>
              <th className="px-10 py-8 text-right">Operations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {doctors.map(doc => (
              <tr key={doc._id} className="hover:bg-gray-50/50 transition-all group">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center font-black text-blue-600 text-lg group-hover:rotate-6 transition-transform">
                      {doc.firstName[0]}
                    </div>
                    <div>
                      <div className="font-black text-gray-900 text-lg">Dr. {doc.firstName} {doc.lastName}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{doc.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8 text-sm font-black text-blue-600 uppercase tracking-widest">{doc.specialty}</td>
                <td className="px-10 py-8">
                  <div className="font-bold text-gray-700 text-sm">{doc.degree || 'MD'}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{doc.experience || 0} Years Experience</div>
                </td>
                <td className="px-10 py-8 text-right">
                   <button className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-red-500 transition-colors">Terminate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[500] flex items-center justify-center p-8">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-12 space-y-10 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Recruit New Specialist</h2>
            <form onSubmit={handleAddDoctor} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="p-5 bg-gray-50 rounded-2xl outline-none font-bold" value={newDoctor.firstName} onChange={e => setNewDoctor({...newDoctor, firstName: e.target.value})} required />
                <input type="text" placeholder="Last Name" className="p-5 bg-gray-50 rounded-2xl outline-none font-bold" value={newDoctor.lastName} onChange={e => setNewDoctor({...newDoctor, lastName: e.target.value})} required />
              </div>
              <input type="email" placeholder="Professional Email" className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold" value={newDoctor.email} onChange={e => setNewDoctor({...newDoctor, email: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Specialty (e.g. باطنة)" className="p-5 bg-gray-50 rounded-2xl outline-none font-bold" value={newDoctor.specialty} onChange={e => setNewDoctor({...newDoctor, specialty: e.target.value})} required />
                <input type="text" placeholder="Degree" className="p-5 bg-gray-50 rounded-2xl outline-none font-bold" value={newDoctor.degree} onChange={e => setNewDoctor({...newDoctor, degree: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 bg-gray-100 rounded-2xl font-black uppercase text-xs tracking-widest">Cancel</button>
                <button type="submit" className="flex-2 px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-600/30">Confirm Hire</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDoctors;
