import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const AllPatients: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [history, setHistory] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        // Filter out those without patientId just in case
        const validApps = (res.data || []).filter((a: any) => a && a.patientId);
        setAppointments(validApps);
      } catch (err) {
        console.error(err);
      }
    };
    if (user?.id) fetchAppointments();
  }, [user]);

  const handleOpenModal = async (app: any) => {
    if (!app || !app.patientId) return;
    setSelectedApp(app);
    setNotes(app.doctorNotes || '');
    setActiveTab('current');
    setIsModalOpen(true);
    
    try {
      const res = await api.get(`/medical/history/${app.patientId._id}`);
      setHistory(res.data || []);
    } catch (err) {
      console.error("Error fetching history", err);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    setIsSaving(true);
    try {
      await api.put(`/appointments/${selectedApp._id}/notes`, { doctorNotes: notes });
      setAppointments(prev => prev.map(a => 
        a._id === selectedApp._id ? { ...a, doctorNotes: notes, status: 'Completed' } : a
      ));
      setIsModalOpen(false);
    } catch (err) {
      alert("Error saving notes");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = appointments.filter(a => {
    if (!a.patientId) return false;
    const name = `${a.patientId.firstName || ''} ${a.patientId.lastName || ''}`.toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 p-4">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Clinical Workspace</h1>
          <p className="text-gray-500 mt-2 font-bold uppercase text-[10px] tracking-widest italic">Hospital Management System v2.0</p>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center shadow-sm w-80">
          <span className="mr-3 ml-2 opacity-30">🔍</span>
          <input 
            type="text" 
            placeholder="Search patient record..." 
            className="bg-transparent border-none outline-none font-bold text-xs flex-1"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            <tr>
              <th className="px-10 py-8">Patient Identity</th>
              <th className="px-10 py-8">Session Date</th>
              <th className="px-10 py-8">Medical Files</th>
              <th className="px-10 py-8">Workflow Status</th>
              <th className="px-10 py-8 text-right">Clinical Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((app) => (
              <tr key={app._id} className="hover:bg-blue-50/40 transition-all group">
                <td className="px-10 py-8">
                  <div className="font-black text-gray-900 text-lg tracking-tight">{app.patientId?.firstName} {app.patientId?.lastName}</div>
                  <div className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-1 opacity-60">{app.patientId?.email}</div>
                </td>
                <td className="px-10 py-8">
                  <div className="font-black text-gray-700 text-sm">{new Date(app.date).toDateString()}</div>
                  <div className="mt-1 inline-block bg-blue-100 text-blue-700 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{app.timeSlot}</div>
                </td>
                <td className="px-10 py-8">
                   <div className="flex -space-x-2">
                     <div className="w-8 h-8 rounded-lg bg-gray-100 border-2 border-white flex items-center justify-center text-xs opacity-40">📄</div>
                   </div>
                </td>
                <td className="px-10 py-8">
                  <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${
                    app.status === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {app.status}
                  </span>
                </td>
                <td className="px-10 py-8 text-right">
                  <button 
                    onClick={() => handleOpenModal(app)}
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:scale-105 transition-all shadow-xl shadow-gray-900/10"
                  >
                    EXAMINE PATIENT
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[4rem] w-full max-w-4xl relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in duration-300 flex flex-col h-[85vh]">
            
            <div className="bg-blue-600 p-12 text-white flex justify-between items-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-20 opacity-10 rotate-12 text-9xl">⚕️</div>
              <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-3">Professional Medical Workspace</p>
                <h2 className="text-5xl font-black tracking-tighter leading-none">{selectedApp?.patientId?.firstName} {selectedApp?.patientId?.lastName}</h2>
              </div>
              <div className="relative z-10 flex flex-col items-end">
                <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  Active Session: {selectedApp?.timeSlot}
                </div>
              </div>
            </div>

            <div className="flex bg-gray-50/50 p-2 m-8 rounded-3xl border border-gray-100 self-center">
              <button 
                onClick={() => setActiveTab('current')}
                className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'current' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400'}`}
              >
                Current Exam
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-12 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400'}`}
              >
                Previous Visits ({history.length})
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-12 pb-12">
              {activeTab === 'current' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Clinical Diagnosis & Prescription</label>
                    <textarea 
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Enter chief complaint, diagnosis, and treatment plan..."
                      className="w-full h-64 bg-gray-50 rounded-[3rem] p-10 border-none outline-none font-bold text-gray-700 text-lg focus:ring-4 focus:ring-blue-100 transition-all placeholder:opacity-30"
                    ></textarea>
                  </div>
                  <div className="flex space-x-6">
                    <button onClick={() => setIsModalOpen(false)} className="flex-1 py-6 rounded-3xl font-black text-xs text-gray-400 hover:bg-gray-50 transition-all uppercase tracking-widest">Discard Session</button>
                    <button 
                      onClick={handleSaveNotes}
                      disabled={isSaving}
                      className="flex-[2] py-6 bg-blue-600 text-white rounded-3xl font-black text-xs shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.01] transition-all uppercase tracking-[0.2em]"
                    >
                      {isSaving ? "SYNCING..." : "COMMIT & COMPLETE SESSION"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-12 py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {history.length > 0 ? (
                    <div className="relative border-l-4 border-blue-50 ml-6 pl-10 space-y-12">
                      {history.map((h, i) => (
                        <div key={i} className="relative">
                          <div className="absolute -left-[54px] top-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-xl font-black text-gray-900 tracking-tight">Visit Date: {new Date(h.date).toDateString()}</h4>
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">Physician: Dr. {h.doctorId?.firstName} {h.doctorId?.lastName} ({h.doctorId?.specialty})</p>
                              </div>
                              <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Completed</span>
                            </div>
                            <div className="bg-gray-50/50 p-6 rounded-2xl">
                              <p className="text-sm font-bold text-gray-600 leading-relaxed italic">"{h.doctorNotes || 'No notes recorded for this visit.'}"</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-6 opacity-20">📂</div>
                      <p className="text-gray-400 font-black uppercase tracking-widest text-xs">No previous visits found for this patient.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllPatients;
