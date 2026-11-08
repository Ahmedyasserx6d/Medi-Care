import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getAvailableSlots } from '../../utils/scheduleUtils';
import { APPOINTMENT_FEES } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Search, User, Calendar as CalendarIcon, Mail, Plus, X, Check } from 'lucide-react';

const ReceptionPanel: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'all'>('today');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [walkIn, setWalkIn] = useState({
    patientName: '', patientPhone: '', doctorId: '', date: '', timeSlot: '', type: 'Examination', urgency: 'Normal'
  });
  const [isBooking, setIsBooking] = useState(false);

  const fetchData = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data || []);
      const dRes = await api.get('/auth/doctors');
      setDoctors(dRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (walkIn.doctorId) {
      api.get(`/schedules/${walkIn.doctorId}`).then(res => {
        setDoctorSchedules(prev => ({ ...prev, [walkIn.doctorId]: res.data }));
      }).catch(console.error);
    }
  }, [walkIn.doctorId]);

  const dynamicSlots = getAvailableSlots(walkIn.date, doctorSchedules[walkIn.doctorId]);

  const confirmCancelAppointment = async (id: string) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: 'Cancelled' });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'Cancelled' } : a));
      toast.success('Appointment Cancelled! ❌');
    } catch (err) {
      toast.error('Error cancelling appointment');
    }
  };

  const handleCancelAppointment = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-gray-900">Are you sure you want to cancel this appointment?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              confirmCancelAppointment(id);
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            Confirm
          </button>
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-100 text-gray-400 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleConfirmPayment = async (id: string) => {
    try {
      await api.put(`/reception/payment/${id}`, { paymentStatus: 'Paid' });
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, paymentStatus: 'Paid' } : a));
      toast.success('Payment Confirmed! Patient is ready for examination.');
    } catch (err) {
      toast.error('Error confirming payment');
    }
  };

  const handleWalkInBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      const defaultAmount = walkIn.type === 'Consultation' ? APPOINTMENT_FEES.Consultation : APPOINTMENT_FEES.Examination;
      await api.post('/appointments/walkin', { ...walkIn, amount: defaultAmount });
      toast.success('Walk-in Appointment Booked!');
      setIsModalOpen(false);
      setWalkIn({ patientName: '', patientPhone: '', doctorId: '', date: '', timeSlot: '', type: 'Examination', urgency: 'Normal' });
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error booking appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const todayStr = new Date().toDateString();
  const displayedAppointments = appointments.filter(a => {
    const matchesSearch = `${a.patientId?.firstName || ''} ${a.patientId?.lastName || ''} ${a.patientId?.phone || ''} ${a.patientId?.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'today') return a.date && new Date(a.date).toDateString() === todayStr;
    return true;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter font-sans not-italic">Reception Desk</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Patient Queue & Designated Doctors</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center shadow-md flex-1 md:w-64">
            <Search className="w-4 h-4 text-gray-400 mr-3 ml-2" />
            <input type="text" placeholder="Search name, phone or email..." className="bg-transparent border-none outline-none font-bold text-xs flex-1 w-full" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-blue-700 transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer">
            <Plus className="w-4 h-4" /> WALK-IN BOOK
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-md overflow-hidden flex flex-col">
        <div className="flex bg-gray-50/50 p-2 border-b border-gray-100">
          <button onClick={() => setActiveTab('today')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-3xl transition-all ${activeTab === 'today' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>Today's Queue</button>
          <button onClick={() => setActiveTab('all')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-3xl transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>All Records</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-12 py-6 border-b border-gray-100">Patient Identity</th>
                <th className="px-12 py-6 border-b border-gray-100">Date & Doctor</th>
                <th className="px-12 py-6 border-b border-gray-100">Type & Fee</th>
                <th className="px-12 py-6 border-b border-gray-100">Status</th>
                <th className="px-12 py-6 border-b border-gray-100 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedAppointments.map((app) => (
                <tr key={app._id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-12 py-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center font-black text-gray-400 text-base shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0">
                        {app.patientId?.firstName?.[0] || '?'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="font-black text-gray-900 text-base">{app.patientId?.firstName || 'Unknown'} {app.patientId?.lastName || ''}</div>
                          <span title="Patient" className="p-1 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <User className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="text-[11px] text-gray-500 font-medium mt-1 flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">{app.patientId?.phone || 'No Phone'}</span>
                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                            <span className="text-blue-600">{app.patientId?.email || 'no-email'}</span>
                          </div>
                          <span className="text-[9px] text-gray-400 font-mono">ID-{app.patientId?._id?.slice(-6)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-blue-600 flex-shrink-0" /> 
                      <span>{new Date(app.date).toDateString()}</span>
                    </div>
                    <div className="text-xs text-blue-600 font-bold mt-2 flex items-center gap-2">
                      {app.doctorId?.imageUrl || app.doctorId?.avatar ? (
                        <img src={app.doctorId.imageUrl || app.doctorId.avatar} alt="Doctor" className="w-6 h-6 rounded-full object-cover shadow-sm border border-white flex-shrink-0" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                          {app.doctorId?.firstName?.[0] || 'D'}
                        </div>
                      )}
                      <span>Dr. {app.doctorId?.firstName || 'Staff'} • <span className="underline decoration-blue-300">{app.timeSlot}</span></span>
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <div className="mb-2.5">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl ${app.type === 'Consultation' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                        {app.type || 'Examination'}
                      </span>
                    </div>
                    <div className="font-black text-gray-900 text-base">
                      <span className="text-gray-400 font-normal text-xs mr-1">EGP</span>{app.amount || 0}
                    </div>
                  </td>
                  <td className="px-12 py-10">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider text-center inline-block shadow-2xs ${
                      app.status === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' : app.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {app.status === 'Cancelled' ? '❌ CANCELLED' : app.paymentStatus === 'Paid' ? '💰 PAID' : '⏳ UNPAID'}
                    </span>
                  </td>
                  <td className="px-12 py-10 text-right">
                    {app.status === 'Cancelled' ? (
                      <span className="text-red-500 font-black text-xs uppercase tracking-wider">Cancelled</span>
                    ) : app.paymentStatus === 'Pending' ? (
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleConfirmPayment(app._id)}
                          className="px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Confirm
                        </button>
                        <button 
                          onClick={() => handleCancelAppointment(app._id)}
                          className="px-4 py-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer" title="Send Email Notification">
                          <Mail className="w-4 h-4" />
                        </button>
                        <span className="text-emerald-600 font-black text-xs uppercase tracking-wider px-2">DONE</span>
                        <button 
                          onClick={() => handleCancelAppointment(app._id)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-bold hover:bg-red-600 hover:text-white transition-all whitespace-nowrap cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedAppointments.length === 0 && (
            <div className="py-20 text-center text-gray-400 font-bold text-sm">
              No walk-in or booked patients fit the current queue tab criteria.
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="bg-white rounded-[3rem] w-full max-w-2xl relative z-10 p-10 shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">Walk-in Booking</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleWalkInBooking} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Patient First Name</label>
                  <input type="text" required value={walkIn.patientName} onChange={e => setWalkIn({...walkIn, patientName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Phone Number</label>
                  <input type="tel" required value={walkIn.patientPhone} onChange={e => setWalkIn({...walkIn, patientPhone: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Assign Doctor</label>
                  <select required value={walkIn.doctorId} onChange={e => setWalkIn({...walkIn, doctorId: e.target.value, date: '', timeSlot: ''})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                    <option value="">Select Doctor</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>Dr. {d.firstName} {d.lastName} ({d.specialty})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Booking Type</label>
                  <select required value={walkIn.type} onChange={e => setWalkIn({...walkIn, type: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                    <option value="Examination">Examination (كشف)</option>
                    <option value="Consultation">Consultation (استشارة)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Date</label>
                  <input type="date" required min={new Date().toISOString().split('T')[0]} value={walkIn.date} onChange={e => setWalkIn({...walkIn, date: e.target.value, timeSlot: ''})} disabled={!walkIn.doctorId} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Available Time</label>
                  <select required value={walkIn.timeSlot} onChange={e => setWalkIn({...walkIn, timeSlot: e.target.value})} disabled={!walkIn.date || dynamicSlots.length === 0} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                    <option value="">{dynamicSlots.length === 0 && walkIn.date ? 'Doctor Off Duty' : 'Select Time'}</option>
                    {dynamicSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black text-xs text-gray-400 uppercase tracking-widest bg-gray-50 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isBooking || !walkIn.timeSlot} className="flex-[2] py-5 rounded-2xl font-black text-xs text-white uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer">
                  {isBooking ? 'Registering...' : 'Book Walk-in'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionPanel;
