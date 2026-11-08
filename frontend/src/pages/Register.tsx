// @ts-ignore
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', formData);
      login(data.user, data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="flex items-center justify-center py-10">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Patient Account</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" name="firstName" onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" name="lastName" onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" name="email" onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" name="phone" onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" name="password" onChange={handleChange} required minLength={6} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors mt-4">
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
