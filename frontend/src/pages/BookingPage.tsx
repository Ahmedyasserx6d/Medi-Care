import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import PaymentSelection from '../components/PaymentSelection';
import { getAvailableSlots } from '../utils/scheduleUtils';
import { APPOINTMENT_FEES } from '../utils/constants';

const BookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorSchedules, setDoctorSchedules] = useState<Record<string, any>>({});
  
  const [bookingData, setBookingData] = useState({
    doctorId: '',
    date: '',
    timeSlot: '',
    type: 'Examination',
    paymentMethod: 'Cash'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get('/auth/doctors');
        setDoctors(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (bookingData.doctorId) {
      api.get(`/schedules/${bookingData.doctorId}`)
        .then(res => {
          setDoctorSchedules(prev => ({ ...prev, [bookingData.doctorId]: res.data }));
        })
        .catch(err => console.error("Schedule error:", err));
    }
  }, [bookingData.doctorId]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const dynamicSlots = getAvailableSlots(bookingData.date, doctorSchedules[bookingData.doctorId]);

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      // NOTE: price should ideally come from the selected service via the backend API instead of being hardcoded
      const defaultAmount = bookingData.type === 'Consultation' ? APPOINTMENT_FEES.Consultation : APPOINTMENT_FEES.Examination;
      await api.post('/appointments', {
        ...bookingData,
        amount: defaultAmount,
        paymentMethod: 'Cash'
      });
      navigate('/success');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error processing booking');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find(d => d._id === bookingData.doctorId);

  return (
    <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="text-center">
        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">Reserve Your Session</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-2">Step {step} of 3</p>
      </div>

      <div className="flex gap-2 bg-gray-50 p-2 rounded-full border border-gray-100">
        {[1, 2, 3].map(num => (
          <div key={num} className={`flex-1 h-3 rounded-full transition-all duration-500 ${step >= num ? 'bg-blue-600 shadow-lg shadow-blue-600/30' : 'bg-gray-200'}`} />
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-bold border border-red-100 animate-bounce">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-8 animate-in slide-in-from-right-8">
          <h2 className="text-2xl font-black tracking-tight">Select Specialist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map(doc => (
              <div 
                key={doc._id}
                onClick={() => setBookingData({...bookingData, doctorId: doc._id})}
                className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all flex flex-col justify-between hover:scale-[1.02] ${bookingData.doctorId === doc._id ? 'border-blue-600 bg-blue-50 shadow-xl shadow-blue-600/10' : 'border-gray-100 hover:border-gray-300'}`}
              >
                <div>
                  <div className="mb-3.5">
                    {doc.imageUrl || doc.avatar ? (
                      <img src={doc.imageUrl || doc.avatar} alt={`Dr. ${doc.firstName}`} className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-white" />
                    ) : (
                      <div className="text-3xl">👨‍⚕️</div>
                    )}
                  </div>
                  <h3 className="font-black text-gray-900 text-lg tracking-tight leading-snug">Dr. {doc.firstName} {doc.lastName}</h3>
                </div>
                <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest mt-2">{doc.specialty}</p>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-50">
            <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">Booking Type</h2>
            <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => setBookingData({...bookingData, type: 'Examination'})}
                className={`p-4 rounded-[1.5rem] border-2 cursor-pointer text-center transition-all ${bookingData.type === 'Examination' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md shadow-blue-600/10' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
              >
                <h3 className="font-black tracking-tight">Examination</h3>
                <p className="text-[10px] uppercase font-bold mt-1">كشف جديد</p>
              </div>
              <div 
                onClick={() => setBookingData({...bookingData, type: 'Consultation'})}
                className={`p-4 rounded-[1.5rem] border-2 cursor-pointer text-center transition-all ${bookingData.type === 'Consultation' ? 'border-purple-600 bg-purple-50 text-purple-600 shadow-md shadow-purple-600/10' : 'border-gray-100 text-gray-400 hover:border-gray-300'}`}
              >
                <h3 className="font-black tracking-tight">Consultation</h3>
                <p className="text-[10px] uppercase font-bold mt-1">استشارة (متابعة)</p>
              </div>
            </div>
          </div>

          <button 
            disabled={!bookingData.doctorId}
            onClick={handleNext}
            className="w-full py-6 rounded-[2rem] bg-gray-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20"
          >
            Continue to Schedule
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-8 animate-in slide-in-from-right-8">
          <div className="flex justify-between items-center border-b border-gray-50 pb-6">
            <h2 className="text-2xl font-black tracking-tight">Select Date & Time</h2>
            <div className="flex items-center gap-3 text-right">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Selected Specialist</p>
                <p className="font-black text-gray-900 text-xs">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</p>
              </div>
              {selectedDoctor?.imageUrl || selectedDoctor?.avatar ? (
                <img src={selectedDoctor.imageUrl || selectedDoctor.avatar} alt="Doctor" className="w-10 h-10 rounded-xl object-cover shadow-sm" />
              ) : null}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Choose Date</label>
              <input 
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={bookingData.date}
                onChange={e => setBookingData({...bookingData, date: e.target.value, timeSlot: ''})}
                className="w-full p-6 bg-gray-50 rounded-[2rem] outline-none font-bold text-gray-700 focus:ring-4 focus:ring-blue-100 border border-transparent focus:border-blue-300 transition-all cursor-pointer"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Available Slots</label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {dynamicSlots.length === 0 ? (
                   <div className="col-span-full p-6 text-center text-red-500 font-black text-xs uppercase tracking-widest bg-red-50 rounded-2xl border border-red-100">
                     {bookingData.date ? 'Doctor is off duty on this date' : 'Please select a date first'}
                   </div>
                ) : (
                  dynamicSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setBookingData({...bookingData, timeSlot: time})}
                      className={`py-4 rounded-2xl font-black text-xs transition-all ${
                        bookingData.timeSlot === time 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                      }`}
                    >
                      {time}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={handleBack} className="flex-1 py-6 rounded-[2rem] bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Back</button>
            <button 
              disabled={!bookingData.date || !bookingData.timeSlot}
              onClick={handleNext}
              className="flex-[2] py-6 rounded-[2rem] bg-gray-900 text-white font-black uppercase tracking-widest text-xs hover:bg-black transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-gray-900/20"
            >
              Review Booking
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-50 space-y-10 animate-in slide-in-from-right-8">
          <div className="text-center border-b border-gray-50 pb-8">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-3xl mx-auto mb-4 animate-bounce">✓</div>
            <h2 className="text-3xl font-black tracking-tighter">Final Review</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Specialist</span>
              <div className="flex items-center gap-3 text-right">
                {selectedDoctor?.imageUrl || selectedDoctor?.avatar ? (
                  <img src={selectedDoctor.imageUrl || selectedDoctor.avatar} alt="Doctor" className="w-12 h-12 rounded-2xl object-cover shadow-sm" />
                ) : null}
                <div>
                  <span className="font-black text-gray-900 text-sm">Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}</span>
                  <br/>
                  <span className="text-[10px] text-blue-600 uppercase font-bold">{selectedDoctor?.specialty}</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Booking Type</span>
              <span className={`font-black uppercase tracking-widest text-xs px-4 py-2 rounded-xl ${bookingData.type === 'Consultation' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {bookingData.type}
              </span>
            </div>

            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Schedule</span>
              <span className="font-black text-gray-900 text-right">{new Date(bookingData.date).toDateString()}<br/><span className="text-blue-600">{bookingData.timeSlot}</span></span>
            </div>
            
            <div className="flex justify-between items-center p-6 bg-gray-900 text-white rounded-3xl shadow-xl">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Fee</span>
              {/* NOTE: price should ideally come from the selected service via the backend API instead of being hardcoded */}
              <span className="font-black text-2xl">EGP {bookingData.type === 'Consultation' ? APPOINTMENT_FEES.Consultation : APPOINTMENT_FEES.Examination}</span>
            </div>
          </div>

          <PaymentSelection />

          <div className="flex gap-4">
            <button onClick={handleBack} className="flex-1 py-6 rounded-[2rem] bg-gray-100 text-gray-400 font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">Edit</button>
            <button 
              onClick={handleConfirm}
              disabled={loading}
              className="flex-[2] py-6 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/30 disabled:opacity-50"
            >
              {loading ? 'Confirming...' : 'Confirm & Book'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
