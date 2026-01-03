import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';

interface RegisterProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export const Register: React.FC<RegisterProps> = ({ users, setUsers }) => {
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', aadhaar: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     if ((name === 'mobile' || name === 'aadhaar') && !/^\d*$/.test(value)) return;
     setFormData({ ...formData, [name]: value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.aadhaar.length !== 12) {
      setError('Aadhaar number must be exactly 12 digits.');
      return;
    }
    if (formData.mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (users.some(u => u.aadhaar === formData.aadhaar)) {
      setError('This Aadhaar Number is already registered. Please login.');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      aadhaar: formData.aadhaar,
      role: UserRole.APPLICANT
    };

    setUsers([...users, newUser]);
    alert('Registration Successful! Please login with your Aadhaar number.');
    navigate('/login');
  };

  return (
    <div 
      className="flex items-center justify-center min-h-[90vh] bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url('${config.landing.heroImageUrl}')` }}
    >
      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-lg p-8 rounded-2xl bg-white/10 border border-white/20 shadow-2xl backdrop-blur-md my-10">
        <div className="text-center mb-8">
           <div className="bg-white/90 p-3 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
             <UserPlus className="text-green-600 w-10 h-10" />
           </div>
           <h2 className="text-3xl font-bold text-white drop-shadow-md">New Registration</h2>
           <p className="text-blue-100 text-sm mt-2">Create an account to apply for positions at CSIR-SERC</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-white mb-1 shadow-black drop-shadow-sm">Full Name <span className="text-yellow-400">*</span></label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full p-3 bg-white/80 border border-white/30 rounded-lg focus:bg-white focus:border-csir-blue focus:ring-2 focus:ring-blue-300 outline-none transition-all placeholder-slate-500 text-slate-800"
              required 
              placeholder="As per Aadhaar/ID"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-1 shadow-black drop-shadow-sm">Email Address <span className="text-yellow-400">*</span></label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full p-3 bg-white/80 border border-white/30 rounded-lg focus:bg-white focus:border-csir-blue focus:ring-2 focus:ring-blue-300 outline-none transition-all placeholder-slate-500 text-slate-800"
              required 
              placeholder="active.email@example.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-white mb-1 shadow-black drop-shadow-sm">Mobile <span className="text-yellow-400">*</span></label>
              <input 
                type="text" 
                name="mobile" 
                value={formData.mobile} 
                onChange={handleChange} 
                maxLength={10} 
                className="w-full p-3 bg-white/80 border border-white/30 rounded-lg focus:bg-white focus:border-csir-blue focus:ring-2 focus:ring-blue-300 outline-none transition-all placeholder-slate-500 text-slate-800"
                required 
                placeholder="10 digits" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-white mb-1 shadow-black drop-shadow-sm">Aadhaar <span className="text-yellow-400">*</span></label>
              <input 
                type="text" 
                name="aadhaar" 
                value={formData.aadhaar} 
                onChange={handleChange} 
                maxLength={12} 
                className="w-full p-3 bg-white/80 border border-white/30 rounded-lg focus:bg-white focus:border-csir-blue focus:ring-2 focus:ring-blue-300 outline-none transition-all placeholder-slate-500 text-slate-800"
                required 
                placeholder="12 digits" 
              />
            </div>
          </div>
          
          {error && <p className="text-red-100 bg-red-900/50 border border-red-500/50 p-3 rounded-lg text-sm text-center">{error}</p>}
          
          <button type="submit" className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg transition-all transform hover:scale-[1.02] border border-white/10">
             Register Now
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-blue-50">
           Already registered? <span onClick={() => navigate('/login')} className="text-yellow-400 font-bold cursor-pointer hover:underline hover:text-yellow-300 transition-colors">Login here</span>
        </p>
      </div>
    </div>
  );
};