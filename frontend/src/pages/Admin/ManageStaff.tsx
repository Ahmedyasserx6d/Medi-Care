import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Upload, Plus, FolderOpen, User, X } from 'lucide-react';

const ManageStaff: React.FC = () => {
  const [staff, setStaff] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Doctor' | 'Receptionist'>('Doctor');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    specialty: '',
    imageUrl: '',
    role: 'Doctor'
  });

  const fetchStaff = async () => {
    try {
      const res = await api.get('/auth/staff');
      setStaff(res.data || []);
    } catch (err: any) {
      console.error("STAFF FETCH ERROR:", err);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenModal = (member?: any) => {
    if (member) {
      setEditingId(member._id);
      setFormData({
        firstName: member.firstName,
        lastName: member.lastName,
        email: member.email,
        password: '', 
        specialty: member.specialty || '',
        imageUrl: member.imageUrl || member.avatar || '',
        role: member.role.charAt(0).toUpperCase() + member.role.slice(1).toLowerCase()
      });
    } else {
      setEditingId(null);
      setFormData({ firstName: '', lastName: '', email: '', password: '', specialty: '', imageUrl: '', role: 'Doctor' });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);

    setUploadingImage(true);
    try {
      const res = await api.post('/files/upload-image', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.success('Photo uploaded directly from your device successfully! 📸');
    } catch (err: any) {
      toast.error('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.imageUrl || payload.imageUrl.trim() === '') {
        delete (payload as any).imageUrl;
      }

      if (editingId) {
        await api.put(`/auth/staff/${editingId}`, payload);
        toast.success('Doctor / Staff Account updated successfully with photo! ✅');
      } else {
        await api.post('/auth/create-staff', payload);
        toast.success(`${formData.role} account created successfully! ✅`);
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error processing request');
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await api.delete(`/auth/staff/${id}`);
      toast.success('Access revoked successfully.');
      fetchStaff();
    } catch (err) {
      toast.error('Error deleting staff member');
    }
  };

  const handleDelete = (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black text-gray-900">Are you sure you want to PERMANENTLY revoke access for this staff member? 🛑</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              confirmDelete(id);
            }}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            Revoke Access
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

  const displayedStaff = staff.filter(s => 
    s.role.toLowerCase() === activeTab.toLowerCase()
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-2">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter font-sans not-italic">System Access</h1>
          <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Manage Official Center Accounts & Photos</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md hover:bg-blue-600 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Official Account
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-md overflow-hidden flex flex-col">
        <div className="flex bg-gray-50/50 p-2 border-b border-gray-100">
          <button onClick={() => setActiveTab('Doctor')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-3xl transition-all ${activeTab === 'Doctor' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400'}`}>Doctors Roster</button>
          <button onClick={() => setActiveTab('Receptionist')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest rounded-3xl transition-all ${activeTab === 'Receptionist' ? 'bg-white text-emerald-600 shadow-md' : 'text-gray-400'}`}>Receptionists Desk</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-12 py-6 border-b border-gray-100">Staff Member</th>
                <th className="px-12 py-6 border-b border-gray-100">Role / Department</th>
                <th className="px-12 py-6 border-b border-gray-100 text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayedStaff.map(s => (
                <tr key={s._id} className="hover:bg-gray-50/50 transition-all group">
                  <td className="px-12 py-8">
                    <div className="flex items-center gap-6">
                      {s.imageUrl || s.avatar ? (
                        <img src={s.imageUrl || s.avatar} alt={s.firstName} className="w-16 h-16 rounded-2xl object-cover shadow-sm border border-gray-100 group-hover:scale-105 transition-transform flex-shrink-0" />
                      ) : (
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform flex-shrink-0 ${activeTab === 'Doctor' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {s.firstName[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-black text-gray-900 text-lg">{activeTab === 'Doctor' ? 'Dr.' : ''} {s.firstName} {s.lastName}</div>
                        <div className="text-xs text-gray-400 font-medium mt-1">{s.email}</div>
                        {s.mustSetPassword && <div className="mt-1 text-[10px] font-bold text-amber-700">Password must be set before sign-in</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-12 py-8">
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider inline-block ${activeTab === 'Doctor' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      {s.specialty || s.role}
                    </span>
                  </td>
                  <td className="px-12 py-8 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(s)} 
                        className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold" 
                        title="Edit Data & Photo"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(s._id)} 
                        className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer" 
                        title="Revoke Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayedStaff.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <FolderOpen className="w-12 h-12 text-gray-300 mb-4 stroke-1" />
            <p className="text-gray-400 font-black uppercase text-xs tracking-wider">No accounts found in this category.</p>
            <p className="text-gray-400 text-[10px] font-medium mt-1">Create accounts using the official top right button.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[500] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-2xl p-10 shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto hide-scrollbar relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black text-gray-900 tracking-tighter">{editingId ? 'Edit Doctor / Staff Data' : 'Create Official Account'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Account Type</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer">
                  <option value="Doctor">Medical Doctor</option>
                  <option value="Receptionist">Receptionist / Front Desk</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">First Name</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Official Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{editingId ? 'New Password (Optional)' : 'Secure Password'}</label>
                  <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" required={!editingId} />
                </div>
              </div>

              {formData.role === 'Doctor' && (
                <div className="space-y-4 animate-in slide-in-from-top-2 pt-2 border-t border-gray-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Medical Specialty</label>
                    <input type="text" placeholder="e.g. باطنة, أسنان, أمراض القلب" value={formData.specialty} onChange={e => setFormData({...formData, specialty: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-600" required />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest px-2 flex items-center gap-1">
                      📸 Doctor Profile Photo (Direct Upload)
                    </label>
                    
                    <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      {formData.imageUrl ? (
                        <div className="relative group flex-shrink-0">
                          <img src={formData.imageUrl} alt="Doctor Avatar Preview" className="w-16 h-16 rounded-2xl object-cover shadow-md border border-white" />
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, imageUrl: ''})} 
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow hover:scale-110 transition-transform cursor-pointer"
                            title="Remove Photo"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gray-200 border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-bold text-[10px] flex-shrink-0 text-center px-1">
                          <User className="w-6 h-6 stroke-1" />
                        </div>
                      )}

                      <div className="flex-1">
                        <label className="cursor-pointer inline-block px-4 py-3 bg-white hover:bg-blue-50 text-blue-600 font-black rounded-xl text-xs shadow-sm border border-gray-200 transition-all uppercase tracking-wider block text-center w-full">
                          <span className="flex items-center justify-center gap-2">
                            <Upload className="w-4 h-4" /> {uploadingImage ? 'Uploading Image...' : 'Choose File from Device'}
                          </span>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            disabled={uploadingImage}
                            className="hidden" 
                          />
                        </label>
                        <p className="text-[9px] text-gray-400 mt-1.5 font-medium text-center">Select any local image from your PC/phone to set as the landing card picture.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-5 rounded-2xl font-black text-xs text-gray-400 uppercase tracking-widest bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer">Cancel</button>
                <button type="submit" className="flex-[2] py-5 rounded-2xl font-black text-xs text-white uppercase tracking-widest bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all cursor-pointer">
                  {editingId ? 'Save Changes & Photo' : 'Grant Access'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
