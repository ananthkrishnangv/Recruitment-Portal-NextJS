import React, { useState } from 'react';
import { User, UserRole } from '../types';
// Added missing AlertCircle and ArrowRight icons to lucide-react imports
import { ShieldCheck, LogIn, ChevronLeft, Fingerprint, Info, AlertCircle, ArrowRight } from 'lucide-react';
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
      setError('Aadhaar Number must be exactly 12 digits.');
      return;
    }
    const user = users.find(u => u.aadhaar === identifier && u.role === UserRole.APPLICANT);
    
    if (!user) {
      setError('Record not found. Ensure Aadhaar is correct or Register.');
      return;
    }

    onLogin(user);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-white p-4 relative overflow-hidden">
      {/* Abstract background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-50 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 opacity-60"></div>

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="text-center mb-12">
             <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-slate-200">
               <Fingerprint className="text-white" size={40} />
             </div>
             <h2 className="text-4xl font-heading font-black text-slate-900 mb-4 tracking-tight uppercase">Portal Login</h2>
             <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">Identity Verification Node</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                Aadhaar UID (12 Digits)
              </label>
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="0000 0000 0000"
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 font-black tracking-[0.3em] text-center text-xl focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all outline-none"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  maxLength={12}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-5 rounded-2xl text-red-600 text-xs font-black uppercase text-center flex items-center justify-center shadow-sm">
                <AlertCircle size={16} className="mr-2"/> {error}
              </div>
            )}
            
            <button type="submit" className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-slate-200 transition-all transform active:scale-95 flex items-center justify-center text-sm">
               Begin Authentication <ArrowRight size={18} className="ml-3 opacity-50"/>
            </button>
          </form>

          <div className="mt-12 pt-10 border-t border-slate-100 text-center space-y-6">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                No recruitment account? <Link to="/register" className="text-brand-600 font-black hover:underline ml-2">Register UID</Link>
              </p>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-start space-x-3 text-left border border-slate-100">
                <Info size={16} className="text-brand-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed tracking-wider">
                  Authentication is handled via the secure GoI UIDAI nodal point. Please ensure your mobile number is linked for future OTP verification.
                </p>
              </div>
          </div>
        </div>
        
        <Link to="/" className="mt-8 mx-auto text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center hover:text-slate-900 transition-colors">
            <ChevronLeft size={14} className="mr-2"/> Back to main portal
        </Link>
      </div>
    </div>
  );
};