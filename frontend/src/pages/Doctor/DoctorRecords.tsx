import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MOCK_APPOINTMENTS = [
  {
    _id: "mock-1",
    patientId: {
      _id: "mock-p-1",
      firstName: "أحمد",
      lastName: "علي",
      phone: "+201012345678"
    },
    date: new Date().toISOString(),
    timeSlot: "10:00 AM",
    status: "Pending",
    type: "Examination",
    paymentStatus: "Paid",
    isMock: true,
    history: [
      { date: "2026-05-10T10:00:00Z", diagnosis: "نزلات البرد الشديدة", notes: "يعاني المريض من رشح وصداع شديد مع ارتفاع طفيف في درجات الحرارة." },
      { date: "2026-04-12T10:00:00Z", diagnosis: "فحص دوري عام", notes: "المؤشرات الحيوية ممتازة وتم تقديم نصائح بشأن التغذية والرياضة." }
    ],
    files: [
      { fileUrl: "/uploads/blood_test.pdf", fileType: "Blood Test Report" },
      { fileUrl: "/uploads/xray.png", fileType: "Chest X-Ray Scan" }
    ],
    vitals: {
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 37,
      weight: 80,
      height: 178
    },
    complaint: "يعاني من خمول وصداع وتعب مستمر منذ يومين.",
    diagnosis: "إرهاق عام مع جفاف خفيف. تم التوصية بالراحة التامة وشرب السوائل بانتظام.",
    prescriptions: [
      { medicine: "Panadol Joint 500mg", dosage: "قرص كل 8 ساعات", duration: "3 أيام" },
      { medicine: "Rehydran Oral Salts", dosage: "كيس فوار على كوب ماء يومياً", duration: "5 أيام" }
    ]
  },
  {
    _id: "mock-2",
    patientId: {
      _id: "mock-p-2",
      firstName: "سارة",
      lastName: "أحمد",
      phone: "+201122334455"
    },
    date: new Date().toISOString(),
    timeSlot: "10:30 AM",
    status: "Pending",
    type: "Consultation",
    paymentStatus: "Paid",
    isMock: true,
    history: [
      { date: "2026-03-01T10:00:00Z", diagnosis: "التهاب الشعب الهوائية", notes: "سعال جاف ومستمر، تم وصف شراب مهدئ للسعال." }
    ],
    files: [
      { fileUrl: "/uploads/prescription_scan.jpg", fileType: "Allergy Report" }
    ],
    vitals: {
      bloodPressure: "115/75",
      heartRate: 68,
      temperature: 36.8,
      weight: 62,
      height: 165
    },
    complaint: "متابعة حساسية الأنف وصعوبة طفيفة في التنفس ليلاً.",
    diagnosis: "حساسية الأنف الموسمية. تم وصف مضاد للهستامين وبخاخ للأنف.",
    prescriptions: [
      { medicine: "Claritine 10mg", dosage: "قرص واحد مساءً قبل النوم", duration: "10 أيام" },
      { medicine: "Avamys Nasal Spray", dosage: "بخة في كل أنف مرة واحدة يومياً", duration: "14 يوماً" }
    ]
  },
  {
    _id: "mock-3",
    patientId: {
      _id: "mock-p-3",
      firstName: "محمود",
      lastName: "حسن",
      phone: "+201277665544"
    },
    date: new Date().toISOString(),
    timeSlot: "11:15 AM",
    status: "Pending",
    type: "Examination",
    paymentStatus: "Unpaid",
    isMock: true,
    history: [],
    files: [],
    vitals: {
      bloodPressure: "135/85",
      heartRate: 85,
      temperature: 38.5,
      weight: 95,
      height: 182
    },
    complaint: "سخونة شديدة في الجسم مع رعشة وآلام في العظام بدأت من مساء أمس.",
    diagnosis: "اشتباه نزلة إنفلونزا حادة. يلزم راحة تامة مع تناول مخفضات الحرارة ومضاد للفيروسات.",
    prescriptions: [
      { medicine: "Brufen 400mg", dosage: "قرص بعد الأكل عند اللزوم", duration: "5 أيام" },
      { medicine: "Tamiflu 75mg", dosage: "كبسولة مرتين يومياً", duration: "5 أيام" }
    ]
  }
];

const DoctorRecords: React.FC = () => {
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [patientFiles, setPatientFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: 0,
    temperature: 0,
    weight: 0,
    height: 0
  });
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescriptions, setPrescriptions] = useState([{ medicine: '', dosage: '', duration: '' }]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAllAppointments(prev => {
        const mocks = prev.filter(app => app.isMock);
        const fetched = res.data || [];
        const nonMocksFetched = fetched.filter((f: any) => !mocks.some(m => m._id === f._id));
        return [...mocks, ...nonMocksFetched];
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientHistory = async (patientId: string) => {
    if (!patientId) return;
    try {
      const hRes = await api.get(`/medical/history/${patientId}`);
      setPatientHistory(hRes.data || []);
      const fRes = await api.get(`/files/patient/${patientId}`);
      setPatientFiles(fRes.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const toggleDemoMode = () => {
    if (!isDemoMode) {
      const freshMocks = MOCK_APPOINTMENTS.map(app => ({
        ...app,
        date: new Date().toISOString(),
        status: 'Pending'
      }));
      setAllAppointments(prev => {
        const nonMocks = prev.filter(a => !a.isMock);
        return [...freshMocks, ...nonMocks];
      });
      setIsDemoMode(true);
      toast.success('Demo Mode active! Mock patients loaded 🧪');
    } else {
      setAllAppointments(prev => prev.filter(a => !a.isMock));
      setIsDemoMode(false);
      setSelectedAppointment(null);
      toast.success('Demo Mode deactivated! Real data only 📂');
    }
  };

  const todayAppointments = allAppointments.filter(app => {
    if (!app.date) return false;
    const appDate = new Date(app.date).toDateString();
    const today = new Date().toDateString();
    return appDate === today && app.status !== 'Completed';
  });

  const handleSelectAppointment = (app: any) => {
    setSelectedAppointment(app);
    if (app.isMock) {
      setVitals(app.vitals || { bloodPressure: '', heartRate: 0, temperature: 0, weight: 0, height: 0 });
      setComplaint(app.complaint || '');
      setDiagnosis(app.diagnosis || '');
      setPrescriptions(app.prescriptions || [{ medicine: '', dosage: '', duration: '' }]);
      setPatientHistory(app.history || []);
      setPatientFiles(app.files || []);
    } else {
      setVitals({ bloodPressure: '', heartRate: 0, temperature: 0, weight: 0, height: 0 });
      setComplaint('');
      setDiagnosis('');
      setPrescriptions([{ medicine: '', dosage: '', duration: '' }]);
      if (app.patientId?._id) {
        fetchPatientHistory(app.patientId._id);
      }
    }
  };

  const addPrescriptionRow = () => {
    setPrescriptions([...prescriptions, { medicine: '', dosage: '', duration: '' }]);
  };

  const handleSaveRecord = async () => {
    if (!selectedAppointment) return;
    if (selectedAppointment.isMock) {
      toast.success('Demo medical record saved & synchronized! ✅ (Simulation)');
      setAllAppointments(prev => prev.map(app => app._id === selectedAppointment._id ? { ...app, status: 'Completed' } : app));
      setSelectedAppointment(null);
      return;
    }
    try {
      await api.post('/medical/vitals', {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId?._id,
        ...vitals
      });
      await api.post('/medical/records', {
        appointmentId: selectedAppointment._id,
        patientId: selectedAppointment.patientId?._id,
        doctorId: selectedAppointment.doctorId?._id,
        diagnosis,
        notes: complaint,
        prescriptions: prescriptions.map(p => ({ medicineName: p.medicine, dosage: p.dosage, duration: p.duration }))
      });
      toast.success('Medical record saved and synchronized! ✅');
      setSelectedAppointment(null);
      fetchAppointments();
    } catch (err) {
      toast.error('Error saving record');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Clinical Panel</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Daily Patient Examination</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleDemoMode}
            className={`px-5 py-3 rounded-2xl shadow-lg font-black text-[10px] uppercase tracking-widest transition-all ${
              isDemoMode 
                ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600 scale-[1.02]' 
                : 'bg-white text-gray-700 border-2 border-gray-100 hover:border-blue-500 hover:text-blue-600 hover:scale-[1.02]'
            }`}
          >
            {isDemoMode ? '🧪 Demo Mode: Active' : '🧪 Load Demo Patients'}
          </button>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center">
            <span className="text-[10px] font-black uppercase tracking-widest">Live Session: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Today's Queue ({todayAppointments.length})</h3>
          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 border border-gray-100 rounded-[2.5rem] space-y-4 shadow-sm">
                <div className="text-3xl">📭</div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No active patients in queue.</p>
                <button
                  onClick={toggleDemoMode}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-md shadow-blue-600/10"
                >
                  🧪 Simulate Queue
                </button>
              </div>
            ) : (
              todayAppointments.map(app => (
                <button 
                  key={app._id}
                  onClick={() => handleSelectAppointment(app)}
                  className={`w-full p-6 rounded-[2.5rem] border-2 text-left transition-all relative overflow-hidden group ${
                    selectedAppointment?._id === app._id ? 'border-blue-600 bg-blue-50 shadow-xl' : 'border-gray-50 bg-white hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-black text-gray-900 text-lg flex items-center gap-1.5 flex-wrap">
                      {app.patientId?.firstName || 'Patient'} {app.patientId?.lastName}
                      {app.isMock && <span className="text-[8px] bg-amber-100 text-amber-800 font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Demo</span>}
                    </div>
                    <div className="flex gap-1">
                      <span className="w-5 h-5 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center text-[10px] font-black">⭐</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${app.paymentStatus === 'Paid' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                      <p className="text-[10px] font-black uppercase text-gray-400">{app.timeSlot}</p>
                    </div>
                    <p className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${app.type === 'Consultation' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {app.type || 'Examination'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedAppointment ? (
            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[3rem] border border-gray-100 flex justify-between items-center shadow-sm">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center text-white font-black text-2xl">
                      {(selectedAppointment.patientId?.firstName || 'P')[0]}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-xl flex items-center justify-center text-white text-[10px] font-black">✓</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-black text-gray-900 tracking-tighter">{selectedAppointment.patientId?.firstName} {selectedAppointment.patientId?.lastName}</h2>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl ${selectedAppointment.type === 'Consultation' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                        {selectedAppointment.type || 'Examination'}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 rounded-xl text-[9px] font-black text-gray-400 uppercase">{selectedAppointment.isMock ? 'Simulated Patient' : 'Returning Patient'}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Phone: {selectedAppointment.patientId?.phone}</p>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Queue Pos: {selectedAppointment.isMock ? '#1' : '#4'}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                   <button onClick={() => setIsHistoryOpen(true)} className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl">ARCHIVE</button>
                   <button className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center font-black text-xl hover:bg-red-500 hover:text-white transition-all">⚠️</button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vital Indicators</h3>
                    <div className="flex gap-2">
                       <div title="Normal Temp" className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                       <div title="Normal BP" className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                       <div title="Pulse Recorded" className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-300 uppercase ml-2 flex items-center gap-1">🌡️ Temp</label>
                       <input type="number" value={vitals.temperature} onChange={e => setVitals({...vitals, temperature: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-black text-blue-600" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-gray-300 uppercase ml-2 flex items-center gap-1">💓 BP</label>
                       <input type="text" value={vitals.bloodPressure} onChange={e => setVitals({...vitals, bloodPressure: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-black text-blue-600" />
                    </div>
                  </div>
                  <textarea value={complaint} onChange={e => setComplaint(e.target.value)} className="w-full p-6 bg-gray-50 rounded-3xl outline-none h-32 font-bold text-gray-700" placeholder="Clinical notes..."></textarea>
                </div>
                <div className="bg-white p-10 rounded-[3.5rem] border border-gray-100 shadow-sm space-y-6">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b pb-4">Diagnosis & Plan</h3>
                  <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} className="w-full p-6 bg-gray-50 rounded-3xl outline-none h-32 font-bold text-emerald-600" placeholder="Clinical diagnosis..."></textarea>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center px-2"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prescriptions</label><button onClick={addPrescriptionRow} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add</button></div>
                    {prescriptions.map((p, i) => (
                      <div key={i} className="flex gap-2 animate-in slide-in-from-right-2">
                        <input type="text" placeholder="Medicine" className="flex-1 p-4 bg-gray-50 rounded-xl outline-none text-xs font-black" value={p.medicine} onChange={e => {const n=[...prescriptions]; n[i].medicine=e.target.value; setPrescriptions(n);}} />
                        <input type="text" placeholder="Dose" className="flex-1 p-4 bg-gray-50 rounded-xl outline-none text-xs font-black" value={p.dosage} onChange={e => {const n=[...prescriptions]; n[i].dosage=e.target.value; setPrescriptions(n);}} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={handleSaveRecord} className="w-full py-7 bg-blue-600 text-white rounded-[2.5rem] font-black shadow-2xl shadow-blue-600/30 hover:bg-blue-700 hover:scale-[1.01] transition-all uppercase tracking-widest text-xs">COMPLETE SESSION</button>
            </div>
          ) : (
            <div className="h-full min-h-[500px] bg-white rounded-[4rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300">
              <div className="text-6xl mb-4">🩺</div>
              <p className="font-black uppercase text-[10px] tracking-widest">Ready for next patient</p>
            </div>
          )}
        </div>
      </div>

      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[500] flex items-center justify-center p-8">
          <div className="bg-white rounded-[4rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
            <div className="p-10 border-b flex justify-between items-center">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">Patient History Archive</h2>
              <button onClick={() => setIsHistoryOpen(false)} className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center font-black">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Records</h3>
                {patientHistory.map((h, i) => (
                  <div key={i} className="p-8 bg-gray-50 rounded-[2.5rem] space-y-3 border border-gray-100">
                    <div className="text-[9px] font-black text-blue-600 uppercase">{new Date(h.date).toLocaleDateString()}</div>
                    <p className="font-black text-gray-900">{h.diagnosis}</p>
                    <p className="text-xs text-gray-500 italic opacity-70">"{h.notes}"</p>
                  </div>
                ))}
              </div>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Uploaded Scans</h3>
                <div className="grid grid-cols-2 gap-4">
                  {patientFiles.map((f, i) => (
                    <a 
                      key={i} 
                      href={selectedAppointment.isMock ? "#" : `http://localhost:5000${f.fileUrl}`} 
                      onClick={selectedAppointment.isMock ? (e) => { e.preventDefault(); toast.success(`Viewing mock document: ${f.fileType} 📄`); } : undefined}
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex flex-col items-center text-center hover:bg-blue-100 transition-all"
                    >
                      <div className="text-3xl mb-2">📋</div>
                      <p className="text-[9px] font-black text-blue-600 uppercase">{f.fileType}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorRecords;
