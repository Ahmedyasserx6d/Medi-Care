import React, { useEffect, useState } from 'react';
import { Settings, RefreshCw, DownloadCloud, ShieldAlert, CheckCircle2, Save } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CenterSettings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isChangingLockdown, setIsChangingLockdown] = useState(false);
  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [restoreConfirmation, setRestoreConfirmation] = useState('');
  const [settings, setSettings] = useState({
    hospitalName: 'MediCare Premium',
    contactEmail: 'admin@medicare.com',
    emergencyPhone: '+20 123 456 7890',
    address: '123 Health Ave, Medical District',
    openingTime: '08:00',
    closingTime: '22:00',
    allowOnlineBooking: true,
    requirePaymentUpfront: false,
    maxPatientsPerDay: 150
  });

  useEffect(() => {
    api.get('/system/status')
      .then(response => {
        setEmergencyLockdown(Boolean(response.data.emergencyLockdown));
      })
      .catch(() => toast.error('Could not load system operation status'));
  }, []);

  const handleFlushCache = async () => {
    setIsFlushing(true);
    try {
      const response = await api.post('/system/cache/flush');
      toast.success(`Application cache cleared (${response.data.clearedEntries} entries).`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not clear application cache');
    } finally {
      setIsFlushing(false);
    }
  };

  const handleRestoreBackup = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!backupFile || restoreConfirmation !== 'IMPORT STAFF DATA') return;

    setIsRestoring(true);
    const formData = new FormData();
    formData.append('backup', backupFile);
    formData.append('confirmReplace', restoreConfirmation);

    try {
      const response = await api.post('/system/staff/import', formData);
      toast.success(`Import complete: ${response.data.created} added, ${response.data.updated} updated.`);
      if (response.data.accountsRequiringPasswordSetup > 0) {
        toast(`Set passwords for ${response.data.accountsRequiringPasswordSetup} new staff account(s) in Manage Staff.`, { duration: 8000 });
      }
      setBackupFile(null);
      setRestoreConfirmation('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Database restore failed');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleExportBackup = async () => {
    const confirmed = window.confirm('This downloads doctor and receptionist profile data and doctor schedules only. It excludes patients, appointments, administrators, and passwords. Continue?');
    if (!confirmed) return;

    setIsExporting(true);
    try {
      const response = await api.get('/system/staff/export', { responseType: 'blob' });
      const contentDisposition = response.headers['content-disposition'] as string | undefined;
      const filename = contentDisposition?.match(/filename="?([^";]+)"?/i)?.[1] || `medical-center-staff-${new Date().toISOString().slice(0, 10)}.json`;
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Staff JSON export downloaded.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Staff JSON export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleToggleLockdown = async () => {
    const nextEnabled = !emergencyLockdown;
    const confirmed = window.confirm(nextEnabled
      ? 'Emergency lockdown blocks API access for patients, doctors, and reception. Admin access and sign-in stay available. Enable it now?'
      : 'Disable emergency lockdown and restore normal API access?');
    if (!confirmed) return;

    setIsChangingLockdown(true);
    try {
      const response = await api.put('/system/emergency-lockdown', { enabled: nextEnabled });
      setEmergencyLockdown(Boolean(response.data.emergencyLockdown));
      toast.success(nextEnabled ? 'Emergency lockdown enabled' : 'Emergency lockdown disabled');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Could not update emergency lockdown');
    } finally {
      setIsChangingLockdown(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      alert('Center settings successfully updated and synchronized across all terminals! ⚙️✅');
    }, 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter font-sans not-italic">Center Settings</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Global System Configuration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          {/* General Info */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-md space-y-8">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest border-b border-gray-50 pb-4">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Hospital Name</label>
                <input type="text" value={settings.hospitalName} onChange={e => setSettings({...settings, hospitalName: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Admin Email</label>
                <input type="email" value={settings.contactEmail} onChange={e => setSettings({...settings, contactEmail: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Emergency Hotline</label>
                <input type="tel" value={settings.emergencyPhone} onChange={e => setSettings({...settings, emergencyPhone: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm text-red-600" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Main Address</label>
                <input type="text" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" />
              </div>
            </div>
          </div>

          {/* Operational Settings */}
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-md space-y-8">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest border-b border-gray-50 pb-4">Operational Parameters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Opening Time</label>
                <input type="time" value={settings.openingTime} onChange={e => setSettings({...settings, openingTime: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Closing Time</label>
                <input type="time" value={settings.closingTime} onChange={e => setSettings({...settings, closingTime: e.target.value})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Max Patients Per Day</label>
                <input type="number" value={settings.maxPatientsPerDay} onChange={e => setSettings({...settings, maxPatientsPerDay: Number(e.target.value)})} className="w-full p-5 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" />
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <label className="flex items-center space-x-4 p-5 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={settings.allowOnlineBooking} onChange={e => setSettings({...settings, allowOnlineBooking: e.target.checked})} className="w-6 h-6 text-blue-600 rounded-lg" />
                <div>
                  <div className="font-black text-gray-900 text-sm">Enable Online Booking</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Allow patients to book via portal</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-4 p-5 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="checkbox" checked={settings.requirePaymentUpfront} onChange={e => setSettings({...settings, requirePaymentUpfront: e.target.checked})} className="w-6 h-6 text-blue-600 rounded-lg" />
                <div>
                  <div className="font-black text-gray-900 text-sm">Enforce Strict Payment</div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">Require card details before confirming booking</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-md relative overflow-hidden space-y-8">
             <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 text-8xl text-gray-400 pointer-events-none">
               <Settings className="w-32 h-32" />
             </div>
             <div className="relative z-10 space-y-6">
                <div>
                   <h3 className="font-black text-xl text-gray-900 tracking-tight">System Operations</h3>
                   <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider mt-2.5 ${emergencyLockdown ? 'text-red-700 bg-red-50' : 'text-emerald-600 bg-emerald-50'}`}>
                     <CheckCircle2 className="w-3 h-3" /> {emergencyLockdown ? 'Emergency lockdown active' : 'All systems operational'}
                   </span>
                </div>
                
                <div className="space-y-3 pt-2">
                   <button onClick={handleFlushCache} disabled={isFlushing} className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs transition-all flex items-center gap-2.5 px-4 cursor-pointer disabled:opacity-50">
                     <RefreshCw className={`w-4 h-4 text-blue-600 ${isFlushing ? 'animate-spin' : ''}`} /> {isFlushing ? 'Flushing Cache...' : 'Flush System Cache'}
                   </button>
                   <button onClick={handleExportBackup} disabled={isExporting} className="w-full py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl font-bold text-xs transition-all flex items-center gap-2.5 px-4 cursor-pointer disabled:opacity-50">
                     <DownloadCloud className="w-4 h-4 text-emerald-600" /> {isExporting ? 'Preparing Staff JSON...' : 'Export Staff JSON'}
                   </button>
                   <div className="border-t border-gray-100 pt-4">
                     <h4 className="text-xs font-black text-gray-800">Import Doctors & Receptionists</h4>
                     <p className="mt-1 text-[10px] leading-relaxed text-gray-500">Merges staff by email and imports doctor schedules. It never replaces other staff or changes patients, appointments, or admins. New accounts need a password set by an administrator.</p>
                     <form onSubmit={handleRestoreBackup} className="mt-3 space-y-3">
                       <input
                         type="file"
                         accept="application/json,.json"
                         disabled={isRestoring}
                         onChange={event => setBackupFile(event.target.files?.[0] || null)}
                         className="block w-full text-[10px] text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-[10px] file:font-bold disabled:opacity-50"
                       />
                       <input
                         type="text"
                         value={restoreConfirmation}
                         onChange={event => setRestoreConfirmation(event.target.value)}
                         disabled={isRestoring}
                         placeholder="Type IMPORT STAFF DATA"
                         aria-label="Type IMPORT STAFF DATA to confirm staff import"
                         className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[10px] font-semibold outline-none focus:border-red-400 disabled:opacity-50"
                       />
                       <button
                         type="submit"
                         disabled={!backupFile || restoreConfirmation !== 'IMPORT STAFF DATA' || isRestoring}
                         className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-[10px] font-black uppercase tracking-wider text-red-700 transition-colors hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                       >
                         {isRestoring ? 'Importing Staff...' : 'Import Staff JSON'}
                       </button>
                     </form>
                   </div>
                   <button onClick={handleToggleLockdown} disabled={isChangingLockdown} className={`w-full py-3.5 border rounded-2xl font-bold text-xs transition-all flex items-center gap-2.5 px-4 cursor-pointer group disabled:opacity-50 ${emergencyLockdown ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border-red-100'}`}>
                     <ShieldAlert className={`w-4 h-4 ${emergencyLockdown ? 'text-emerald-600 group-hover:text-white' : 'text-red-500 group-hover:text-white'}`} /> {isChangingLockdown ? 'Updating...' : emergencyLockdown ? 'Disable Emergency Lockdown' : 'Emergency Lockdown'}
                   </button>
                </div>

                <div className="pt-6 border-t border-gray-50">
                   <button 
                     onClick={handleSave}
                     disabled={isSaving}
                     className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                   >
                     <Save className="w-4 h-4" /> {isSaving ? 'APPLYING CONFIGURATION...' : 'SAVE ALL SETTINGS'}
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterSettings;
