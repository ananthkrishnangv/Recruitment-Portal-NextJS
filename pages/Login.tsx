import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, LogIn, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';

interface LoginProps {
  onLogin: (u: User) => void;
  users: User[];
}

export const Login: React.FC<LoginProps> = ({ onLogin, users }) => {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { config } = useSiteConfig();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{12}$/.test(identifier)) {
      setError('Please enter a valid 12-digit Aadhaar Number.');
      return;
    }
    const user = users.find(u => u.aadhaar === identifier && u.role === UserRole.APPLICANT);
    
    if (!user) {
      setError('User not found. Please check Aadhaar number or register.');
      return;
    }

    onLogin(user);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8]">
      <div 
        className="flex-1 flex items-center justify-center bg-cover bg-center relative p-4"
        style={{ backgroundImage: `url('${config.landing.heroImageUrl}')` }}
      >
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white p-10 rounded-2xl shadow-fluent-lg border border-[#EDEBE9]">
            <div className="text-center mb-10">
               <div className="bg-csir-blue/10 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
                 <ShieldCheck className="text-csir-blue w-10 h-10" />
               </div>
               <h2 className="text-3xl font-black text-[#323130] uppercase tracking-tight">Candidate Portal</h2>
               <p className="text-[#605E5C] text-[10px] font-black mt-2 uppercase tracking-[0.3em] opacity-70">Identity Verification Gateway</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-[#323130] uppercase tracking-[0.2em] mb-3">
                  Aadhaar Number (12 Digits)
                </label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000"
                  className="w-full p-4 bg-white border border-[#8A8886] rounded text-[#323130] font-black tracking-[0.4em] text-center focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none transition-all"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  maxLength={12}
                />
              </div>

              {error && (
                <div className="bg-[#FDF3F4] border border-[#FDE7E9] p-4 rounded text-red-600 text-[11px] font-black uppercase text-center animate-pulse tracking-wider">
                  {error}
                </div>
              )}
              
              <button type="submit" className="w-full py-4 bg-csir-blue hover:bg-[#005A9E] text-white rounded font-black text-sm uppercase tracking-[0.2em] shadow-fluent transition-all transform hover:-translate-y-1 flex items-center justify-center">
                 <LogIn size={18} className="mr-3"/> Authenticate & Login
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-[#EDEBE9] text-center flex flex-col space-y-4">
                <p className="text-[#605E5C] text-xs font-bold uppercase tracking-wider">
                  New Applicant? <Link to="/register" className="text-csir-blue font-black hover:underline ml-2">Register Identity</Link>
                </p>
                <Link to="/" className="text-[#A19F9D] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:text-csir-blue">
                   <ChevronLeft size={12} className="mr-1"/> Back to Homepage
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};