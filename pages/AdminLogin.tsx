import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, LogIn, ShieldAlert, ChevronLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

interface AdminLoginProps {
  onLogin: (u: User) => void;
  users: User[];
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => 
      (u.email === email || u.id === email) && 
      (u.role === UserRole.ADMIN || u.role === UserRole.SUPERVISOR || u.role === UserRole.DIRECTOR)
    );
    
    if (user) {
      if (user.password === password) {
        onLogin(user);
        navigate('/admin');
      } else {
        setError('Authorization Failed: Invalid Credentials');
      }
    } else {
       setError('Access Denied: Administrative Privileges Required');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8]">
      <div className="flex-1 flex items-center justify-center bg-[#F3F2F1] relative overflow-hidden p-4">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#0078D4 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white p-10 rounded-xl shadow-fluent-lg border border-[#EDEBE9]">
            <div className="text-center mb-10">
               <div className="bg-[#A4262C]/5 p-5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border-2 border-[#A4262C]/20 shadow-inner">
                 <ShieldAlert className="text-[#A4262C] w-10 h-10" />
               </div>
               <h2 className="text-2xl font-black text-[#323130] uppercase tracking-tight">Official Login</h2>
               <p className="text-[#A4262C] text-[10px] font-black uppercase tracking-[0.3em] mt-2 opacity-80">Govt. Secure Access Node</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-8">
              <div>
                <label className="block text-[11px] font-black text-[#323130] uppercase tracking-widest mb-3">Service Identifier / ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. admoff.serc@csir.res.in"
                  className="w-full p-4 bg-[#FAF9F8] border border-[#8A8886] rounded-sm text-[#323130] font-bold focus:border-[#A4262C] focus:ring-1 focus:ring-[#A4262C] outline-none transition-all hover:bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-[#323130] uppercase tracking-widest mb-3">Security Key</label>
                <div className="relative">
                    <input 
                      type="password" 
                      placeholder="••••••••"
                      className="w-full p-4 bg-[#FAF9F8] border border-[#8A8886] rounded-sm text-[#323130] font-bold focus:border-[#A4262C] focus:ring-1 focus:ring-[#A4262C] outline-none transition-all hover:bg-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Lock className="absolute right-4 top-4 text-[#A19F9D]" size={18} />
                </div>
              </div>

              {error && (
                <div className="bg-[#FDF3F4] border border-[#FDE7E9] p-4 rounded text-[#A4262C] text-[11px] font-black uppercase text-center tracking-widest">
                  {error}
                </div>
              )}
              
              <button type="submit" className="w-full py-4 bg-[#323130] hover:bg-black text-white rounded font-black text-sm uppercase tracking-[0.2em] shadow-fluent transition-all transform hover:-translate-y-1 flex items-center justify-center">
                 <LogIn size={18} className="mr-3"/> Execute Authentication
              </button>
            </form>

            <div className="mt-10 text-center">
               <Link to="/" className="text-[#A19F9D] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:text-csir-blue transition-colors">
                  <ChevronLeft size={12} className="mr-1"/> Return to Public Portal
               </Link>
            </div>
          </div>
          <p className="mt-8 text-center text-[9px] font-black text-[#A19F9D] uppercase tracking-[0.4em] opacity-50">Unauthorized access is a punishable offense under the IT Act.</p>
        </div>
      </div>
    </div>
  );
};