import React, { useState, useEffect } from 'react';
import api from '../../services/api';

interface Service {
  _id: string;
  name: string;
  price: number;
  durationMinutes: number;
  description: string;
}

const ManageServices: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    durationMinutes: 30,
    description: '',
    clinicId: '' // We will get this from the clinic info
  });

  const fetchServices = async () => {
    try {
      const clinicRes = await api.get('/clinic');
      const clinicId = clinicRes.data?._id;
      if (clinicId) {
        setFormData(prev => ({ ...prev, clinicId }));
        const res = await api.get(`/services?clinicId=${clinicId}`);
        setServices(res.data);
      }
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
      if (editingService) {
        await api.put(`/services/${editingService._id}`, formData);
      } else {
        await api.post('/services', formData);
      }
      setIsModalOpen(false);
      setEditingService(null);
      fetchServices();
    } catch (err) {
      alert('Error saving service');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clinic Services</h1>
          <p className="text-gray-500">Manage medical services, prices, and durations.</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-blue-600">EGP {service.price}</span>
                <p className="text-[10px] text-gray-400 font-bold uppercase">{service.durationMinutes} Mins</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
            <p className="text-gray-500 text-sm mt-2 line-clamp-2">{service.description}</p>
            <div className="mt-6 flex gap-2">
              <button 
                onClick={() => { setEditingService(service); setFormData({...formData, ...service}); setIsModalOpen(true); }}
                className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingService ? 'Edit Service' : 'New Medical Service'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Service Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600" placeholder="e.g. Consultation" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Price (EGP)</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600" required />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Duration (Mins)</label>
                  <input type="number" value={formData.durationMinutes} onChange={e => setFormData({...formData, durationMinutes: Number(e.target.value)})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600" required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-600 h-24"></textarea>
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg">Save Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
