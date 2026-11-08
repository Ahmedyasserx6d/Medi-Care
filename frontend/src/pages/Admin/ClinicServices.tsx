import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Pencil, Trash2, Stethoscope, Plus } from 'lucide-react';

const ClinicServices: React.FC = () => {
  const [services, setServices] = useState<any[]>([]);
  const [newService, setNewService] = useState({ name: '', price: 0, specialty: '', duration: 30 });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put('/services/' + editingId, newService);
        setEditingId(null);
      } else {
        await api.post('/services', newService);
      }
      setNewService({ name: '', price: 0, specialty: '', duration: 30 });
      fetchServices();
    } catch (err) {
      alert('Error saving service');
    }
  };

  const handleEditClick = (s: any) => {
    setEditingId(s._id);
    setNewService({ name: s.name, price: s.price, specialty: s.specialty, duration: s.duration });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setNewService({ name: '', price: 0, specialty: '', duration: 30 });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete('/services/' + id);
        fetchServices();
      } catch (err) {
        alert('Error deleting service');
      }
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div>
        <h1 className="text-4xl font-black text-gray-900 tracking-tighter font-sans not-italic">Clinical Services</h1>
        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mt-1">Catalog & Pricing Management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1">
          <div className="bg-white p-8 rounded-[3rem] shadow-md border border-gray-100 space-y-6">
            <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest border-b border-gray-50 pb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> {editingId ? 'Edit Service' : 'Add New Service'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Service Name</label>
                <input type="text" placeholder="e.g. General Checkup" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" value={newService.name} onChange={e => setNewService({...newService, name: e.target.value})} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Department / Specialty</label>
                <input type="text" placeholder="e.g. Internal Medicine" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" value={newService.specialty} onChange={e => setNewService({...newService, specialty: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Price (EGP)</label>
                  <input type="number" placeholder="0" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" value={newService.price} onChange={e => setNewService({...newService, price: Number(e.target.value)})} required />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Duration (Min)</label>
                  <input type="number" placeholder="30" className="w-full p-4 bg-gray-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-600 transition-all text-sm" value={newService.duration} onChange={e => setNewService({...newService, duration: Number(e.target.value)})} required />
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-wider shadow-md shadow-blue-600/20 transition-all cursor-pointer">
                  {editingId ? 'Save Changes' : 'Create Service'}
                </button>
                {editingId && (
                  <button type="button" onClick={handleCancelEdit} className="w-full py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold uppercase text-[10px] tracking-wider hover:bg-gray-100 mt-2 transition-all cursor-pointer">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => (
                 <div key={s._id} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-md hover:translate-y-[-2px] transition-all flex items-center justify-between group">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <h4 className="text-base font-black text-gray-900 leading-tight">{s.name}</h4>
                      </div>
                      <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">{s.specialty}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-700">
                        <span>EGP {s.price}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 font-medium">{s.duration} MIN</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-gray-50/50 p-1 rounded-xl opacity-80 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditClick(s)} 
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white transition-all cursor-pointer" 
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDelete(s._id)} 
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white transition-all cursor-pointer" 
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                 </div>
              ))}
           </div>
           {services.length === 0 && (
             <div className="py-20 text-center text-gray-400 font-bold text-xs uppercase tracking-wider">
               No clinic services added yet. Use the form to build your catalog.
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ClinicServices;
