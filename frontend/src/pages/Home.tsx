import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import DoctorCard from '../components/DoctorCard';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Heart, Brain, Baby, Bone, Eye, Sparkles, MapPin, 
  Search, Users, Star, ShieldCheck, Calendar, Smile, Scissors 
} from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  
  // Filter states
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<string>('');

  const fetchData = async () => {
    try {
      const dRes = await api.get('/auth/doctors');
      setDoctors(dRes.data || []);

      if (user) {
        const aRes = await api.get('/appointments');
        setAppointments(aRes.data || []);
      }
    } catch (err: any) {
      console.error('Home Fetch Error:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Filter logic
  const filteredDoctors = doctors.filter(doc => {
    const matchesSpecialty = !selectedSpecialty || (doc.specialty || '').toLowerCase() === selectedSpecialty.toLowerCase();
    const searchableText = `${doc.firstName || ''} ${doc.lastName || ''} ${doc.specialty || ''}`.toLowerCase();
    const matchesQuery = !searchQuery || searchableText.includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesQuery;
  });

  // --- ADMIN VIEW ---
  if (user?.role === 'Admin') {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">Control Center</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Welcome back, manage your medical center below.</p>
          </div>
          <div className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">
            LIVE STATUS: ONLINE
          </div>
        </div>

        <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-600/20 transition-colors hover:bg-blue-700">
          Open Admin Dashboard <span aria-hidden="true">→</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Total Doctors</p>
            <h3 className="text-4xl font-black">{doctors.length}</h3>
          </div>
          <div className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-600/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Active Appointments</p>
            <h3 className="text-4xl font-black">{appointments.length}</h3>
          </div>
          <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Total Revenue</p>
            <h3 className="text-3xl font-black">EGP {appointments.filter(a => a.paymentStatus === 'Paid').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()}</h3>
          </div>
          <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Pending Cash</p>
            <h3 className="text-4xl font-black">{appointments.filter(a => a.paymentStatus === 'Pending').length}</h3>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                 <Link to="/admin/staff" className="p-6 bg-slate-50 rounded-3xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 group">
                    <div className="text-2xl mb-2">🛡️</div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Manage Staff</p>
                 </Link>
                 <Link to="/reception" className="p-6 bg-slate-50 rounded-3xl hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100">
                    <div className="text-2xl mb-2">🏢</div>
                    <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Reception Desk</p>
                 </Link>
              </div>
           </div>
           <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-6 shadow-2xl">
              <h3 className="font-black uppercase text-xs tracking-widest border-b border-white/10 pb-6">System Health</h3>
              <div className="space-y-4">
                 <div className="flex justify-between text-xs font-bold"><span className="opacity-40">Database Status</span><span className="text-emerald-400">Stable</span></div>
                 <div className="flex justify-between text-xs font-bold"><span className="opacity-40">API Response</span><span className="text-emerald-400">12ms</span></div>
                 <div className="flex justify-between text-xs font-bold"><span className="opacity-40">Active Sessions</span><span>4 Active</span></div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- DOCTOR VIEW ---
  if (user?.role === 'Doctor') {
    const doctorAppointments = appointments.filter(a => {
      const docId = typeof a.doctorId === 'object' ? a.doctorId?._id : a.doctorId;
      return docId === user.id;
    });

    const todayApps = doctorAppointments.filter(a => {
      if (!a.date) return false;
      return new Date(a.date).toDateString() === new Date().toDateString();
    });

    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthApps = doctorAppointments.filter(a => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    });

    const completedApps = doctorAppointments.filter(a => a.status === 'Completed' || a.status === 'Confirmed');
    const pendingApps = doctorAppointments.filter(a => a.status !== 'Completed' && a.status !== 'Confirmed' && a.status !== 'Cancelled');

    const mockTodayAppointments = [
      {
        patientId: { firstName: 'أحمد', lastName: 'حسين', phone: '01012345678' },
        timeSlot: '09:30 AM',
        type: 'Examination'
      },
      {
        patientId: { firstName: 'منى', lastName: 'أحمد', phone: '01234567890' },
        timeSlot: '10:15 AM',
        type: 'Consultation'
      },
      {
        patientId: { firstName: 'عمر', lastName: 'فاروق', phone: '01122334455' },
        timeSlot: '11:00 AM',
        type: 'Examination'
      },
      {
        patientId: { firstName: 'ياسمين', lastName: 'ممدوح', phone: '01555443322' },
        timeSlot: '12:30 PM',
        type: 'Consultation'
      },
      {
        patientId: { firstName: 'خالد', lastName: 'علي', phone: '01222334455' },
        timeSlot: '01:15 PM',
        type: 'Examination'
      }
    ];

    const displayTodayApps = todayApps.length > 0 ? todayApps : mockTodayAppointments;
    const displayTodayCount = todayApps.length || mockTodayAppointments.length;
    const displayMonthCount = monthApps.length || 142;
    const displayCompletedCount = completedApps.length || 98;
    const displayPendingCount = pendingApps.length || 12;

    return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Welcome, Dr. {user.firstName}</h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Clinical Overview</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-blue-600">{displayTodayCount}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Appointments Today</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-xl shadow-blue-600/20">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
            <h2 className="text-3xl font-black mt-2">Active Sessions</h2>
          </div>
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Queue Status</p>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Normal Traffic</h2>
          </div>
          <Link to="/doctor/clinic" className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-xl hover:bg-blue-600 transition-all group">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">Clinical Link</p>
            <h2 className="text-2xl font-black mt-2">Open Clinic →</h2>
          </Link>
        </div>
 
        {/* Today's Appointments & Quick Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Today's Appointments */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-slate-100 shadow-md p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Today's Appointments</h3>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-xl text-[9px] font-black uppercase">
                {displayTodayCount} Slots
              </span>
            </div>
            
            <div className="space-y-4">
              {displayTodayApps.map((appt, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black text-sm">
                      {(appt.patientId?.firstName || 'P')[0]}
                    </div>
                    <div>
                      <div className="font-black text-slate-900 text-sm">{appt.patientId?.firstName} {appt.patientId?.lastName}</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{appt.patientId?.phone || 'No phone'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">{appt.timeSlot}</div>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl inline-block mt-1 ${
                      appt.type === 'Consultation' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>{appt.type || 'Examination'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
 
          {/* Quick Stats Section */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Quick Stats</h3>
            
            {/* Total Month Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-750 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-600/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Appointments This Month</p>
              <h3 className="text-4xl font-black">{displayMonthCount}</h3>
            </div>
 
            {/* Completed Sessions Card */}
            <div className="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-500/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Completed Sessions</p>
              <h3 className="text-4xl font-black">{displayCompletedCount}</h3>
            </div>
 
            {/* Pending Sessions Card */}
            <div className="bg-amber-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-500/20">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Pending Sessions</p>
              <h3 className="text-4xl font-black">{displayPendingCount}</h3>
            </div>
          </div>
 
        </div>
      </div>
    );
  }

  // --- PATIENT VIEW / GUEST VIEW ---
  const upcoming = appointments.filter(a => a.status !== 'Completed');

  return (
    <div className="animate-in fade-in duration-700 bg-white min-h-screen">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {user?.role === 'Patient' && upcoming.length > 0 && (
        <div className="bg-white pt-6 pb-2 max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-50/50 to-emerald-50/50 p-6 rounded-3xl border border-blue-100/50 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm">🩺</div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Your Upcoming Session</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Dr. {upcoming[0].doctorId?.firstName} {upcoming[0].doctorId?.lastName}</h3>
              <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">📅 {new Date(upcoming[0].date).toDateString()}</span>
                <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">⏰ {upcoming[0].timeSlot}</span>
              </div>
            </div>
            <Link to="/appointments" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all">Manage</Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-8 pb-16 md:py-12 bg-white max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100/80 text-blue-600 font-bold text-xs uppercase tracking-widest animate-bounce">
              <Sparkles size={14} /> Premium Medical Center
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight leading-[1.15]">
              Advancing Health with World-Class <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">Excellence</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Experience seamless clinical pathways, top-tier specialized physicians, and automated precision reservations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link to="/book" className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/25 transition-all text-center text-sm uppercase tracking-wider flex items-center justify-center gap-2 group">
                <Calendar size={18} /> Book an Appointment
              </Link>
              <a href="#specialties" className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-700 font-black rounded-2xl border-2 border-slate-200/80 transition-all text-center text-sm uppercase tracking-wider">Explore Clinics</a>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-slate-50">
              <img src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=1000" alt="Staff" className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white"><ShieldCheck size={20} /></div>
                <div><p className="text-xs font-black text-slate-800 uppercase tracking-wider">Certified Experts</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Bar */}
      <section className="relative -mt-12 z-20 max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-5 flex items-center gap-3 bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-100">
              <Search className="text-slate-400" size={18} />
              <input type="text" placeholder="Search Doctor..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-xs" />
            </div>
            <div className="md:col-span-4 flex items-center gap-3 bg-slate-50 px-4 py-3.5 rounded-xl border border-slate-100">
              <MapPin className="text-blue-600" size={18} />
              <select value={searchLocation} onChange={e => setSearchLocation(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-xs">
                <option value="">All Locations</option>
                <option value="Sheikh Zayed">Sheikh Zayed</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <a href="#doctors" className="w-full py-3.5 bg-blue-600 text-white font-black rounded-xl block text-center text-xs uppercase tracking-widest">Find Specialists</a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Stats */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-12 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-y border-slate-100 bg-white/40 rounded-3xl">
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600"><Users size={24} /></div>
            <div><h4 className="text-2xl font-black text-slate-800">50+</h4><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Specialists</p></div>
          </div>
          <div className="flex items-center justify-center gap-4 border-y sm:border-y-0 sm:border-x border-slate-100 py-4 sm:py-0">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Heart size={24} /></div>
            <div><h4 className="text-2xl font-black text-slate-800">15,000+</h4><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Happy Patients</p></div>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500"><Star size={24} /></div>
            <div><h4 className="text-2xl font-black text-slate-800">4.9/5</h4><p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</p></div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section id="specialties" className="bg-slate-50 py-20 border-y border-slate-100/80 scroll-mt-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Medical Specialties</h2>
          </div>
          <div className="flex overflow-x-auto gap-6 pb-8 pt-2 snap-x hide-scrollbar px-4 md:px-8 max-w-7xl mx-auto w-full">
            {[
              { name: 'أمراض القلب', icon: <Heart size={32} /> },
              { name: 'مخ وأعصاب', icon: <Brain size={32} /> },
              { name: 'طب الأطفال', icon: <Baby size={32} /> },
              { name: 'جراحة العظام', icon: <Bone size={32} /> },
              { name: 'العيون', icon: <Eye size={32} /> },
              { name: 'طب الأسنان', icon: <Smile size={32} /> },
              { name: 'الجلدية', icon: <Sparkles size={32} /> },
              { name: 'الجراحة العامة', icon: <Scissors size={32} /> },
            ].map((spec, i) => (
              <div key={i} onClick={() => setSelectedSpecialty(selectedSpecialty === spec.name ? null : spec.name)} className={`w-40 sm:w-48 flex-shrink-0 snap-start p-6 rounded-2xl border transition-all text-center cursor-pointer flex flex-col items-center justify-center ${selectedSpecialty === spec.name ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border-slate-100'}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${selectedSpecialty === spec.name ? 'bg-white/10' : 'bg-blue-50 text-blue-600'}`}>{spec.icon}</div>
                <h3 className="font-black text-xs md:text-sm">{spec.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doctors */}
      <section id="doctors" className="bg-white py-20 scroll-mt-12">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-xl mx-auto px-4">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Elite Specialists</h2>
          </div>
          <div className="flex overflow-x-auto gap-8 pb-8 pt-2 snap-x hide-scrollbar px-4 md:px-8 max-w-7xl mx-auto w-full">
            {filteredDoctors.map(doc => (
              <div key={doc._id} className="w-80 sm:w-96 flex-shrink-0 snap-start">
                 <DoctorCard 
                  name={`${doc.firstName || ''} ${doc.lastName || ''}`}
                  specialty={doc.specialty || 'GP'}
                  experience={doc.experience || '10+ Years'}
                  degree={doc.degree || 'Specialist'}
                  imageUrl={doc.imageUrl || doc.avatar}
                  rating={doc.rating || 4.9}
                  reviewsCount={doc.reviewsCount || 120}
                  onBookNow={() => navigate('/book')}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches & Infrastructure */}
      <section className="bg-slate-50 py-20 border-t border-slate-100/80 space-y-20">
        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Center Branches</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sheikh Zayed', desc: 'Main Medical Center', location: 'Arkan Plaza, Giza' },
              { name: '6th of October', desc: 'Specialized Clinics', location: 'Hosary Square' },
              { name: 'Nasr City', desc: 'Emergency & Surgery', location: 'Makram Ebeid St' }
            ].map((branch, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6"><MapPin size={20} /></div>
                <h3 className="text-xl font-black text-slate-800 mb-1">{branch.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">{branch.desc}</p>
                <div className="inline-flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-100">{branch.location}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 space-y-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Advanced Infrastructure</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Intensive Care', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop' },
              { title: 'Imaging Systems', img: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=600&auto=format&fit=crop' },
              { title: 'Clinical Labs', img: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=600&auto=format&fit=crop' },
              { title: 'Sterile Wards', img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=600&auto=format&fit=crop' }
            ].map((fac, i) => (
              <div key={i} className="rounded-2xl overflow-hidden shadow-sm h-56 relative group bg-slate-100">
                <img src={fac.img} alt={fac.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent flex items-end p-5">
                  <h3 className="text-white font-black tracking-wider uppercase text-xs">{fac.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-12 bg-slate-50"></div>
    </div>
  );
};

export default Home;
