import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: New Password
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/password/forgot-password', { email });
      setToken(response.data.token);
      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Email not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/password/reset-password', { token, newPassword });
      alert('Password updated successfully!');
      navigate('/login');
    } catch (err: any) {
      alert('Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Reset Password</h1>
          <p className="text-gray-500 mt-2 text-sm font-bold">
            {step === 1 ? "Enter your email to verify account" : "Enter your new secure password"}
          </p>
        </div>

        <form onSubmit={step === 1 ? handleCheckEmail : handleReset} className="space-y-6">
          {step === 1 ? (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-5 bg-gray-50 rounded-3xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="email@example.com"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full p-5 bg-gray-50 rounded-3xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-blue-600 transition-all"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black shadow-xl hover:bg-black transition-all uppercase tracking-widest text-xs"
          >
            {isLoading ? "PROCESSING..." : step === 1 ? "VERIFY EMAIL" : "UPDATE PASSWORD"}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-xs font-black text-blue-600 hover:underline uppercase">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
