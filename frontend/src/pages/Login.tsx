import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token } = response.data;
      login(userData, token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Email or Password incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  if (user) return null; // Don't show login if already logged in

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter">Secure Login</h1>
          <p className="text-gray-500 mt-2 text-sm font-bold">Access your medical workspace</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-5 bg-gray-50 rounded-3xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Password</label>
              <Link to="/forgot-password" className="text-[10px] font-black text-blue-600 hover:underline uppercase">Forgot?</Link>
            </div>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-5 bg-gray-50 rounded-3xl border-none outline-none font-bold text-sm focus:ring-2 focus:ring-blue-600 transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest text-xs"
          >
            {isLoading ? "AUTHENTICATING..." : "VERIFY & LOGIN"}
          </button>
        </form>

        <p className="text-center text-xs font-bold text-gray-400">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline font-black uppercase">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
