import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, LogIn, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    // Check credentials against the users array
    const user = users.find(u => 
      (u.email === email || u.id === email) && 
      (u.role === UserRole.ADMIN || u.role === UserRole.SUPERVISOR || u.role === UserRole.DIRECTOR)
    );
    
    if (user) {
      if (user.password === password) {
        onLogin(user);
        navigate('/admin');
      } else {
        setError('Incorrect Password.');
      }
    } else {
       setError('Invalid Credentials or Insufficient Privileges.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] bg-[#1B1A19] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#004578] via-[#1B1A19] to-[#1B1A19] opacity-40"></div>
      
      <div className="relative z-10 w-full max-w-md p-10 rounded-2xl bg-[#292827]/80 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
           <div className="bg-[#A4262C]/20 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 border border-[#A4262C]/30 shadow-lg">
             <ShieldAlert className="text-[#A4262C] w-10 h-10" />
           </div>
           <h2 className="text-2xl font-bold text-white">Official System Login</h2>
           <p className="text-gray-400 text-xs uppercase tracking-widest mt-2 font-semibold">Authorized Personnel Only</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Username / Email</label>
            <input 
              type="text" 
              placeholder="e.g. admoff.serc@csir.res.in"
              className="w-full p-3 bg-[#3B3A39] border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#0078D4] focus:ring-0 outline-none transition-all hover:bg-[#484644]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
            <div className="relative">
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full p-3 bg-[#3B3A39] border border-gray-600 rounded text-white placeholder-gray-500 focus:border-[#0078D4] focus:ring-0 outline-none transition-all hover:bg-[#484644]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute right-3 top-3.5 text-gray-500" size={18} />
            </div>
          </div>

          {error && <p className="text-[#FDE7E9] text-sm bg-[#A4262C]/20 p-3 rounded text-center border border-[#A4262C]/50 font-medium">{error}</p>}
          
          <button type="submit" className="w-full py-3 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded font-bold transition-all flex items-center justify-center shadow-md">
             <LogIn size={18} className="mr-2"/> Authenticate
          </button>
        </form>

        <div className="mt-8 text-center">
           <span onClick={() => navigate('/')} className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 font-medium transition-colors">Return to Portal Home</span>
        </div>
      </div>
    </div>
  );
};