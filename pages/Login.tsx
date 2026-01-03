import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

    // Applicant Login via Aadhaar
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
    <div 
      className="flex items-center justify-center min-h-[85vh] bg-cover bg-center bg-fixed relative"
      style={{ backgroundImage: `url('${config.landing.heroImageUrl}')` }}
    >
      {/* Dark Acrylic Overlay */}
      <div className="absolute inset-0 bg-[#201F1E]/60 backdrop-blur-md"></div>

      {/* Fluent Card */}
      <div className="relative z-10 w-full max-w-md p-10 rounded-2xl bg-white/90 border border-white/20 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
           <div className="bg-[#EFF6FC] p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-5 shadow-sm border border-[#0078D4]/20">
             <ShieldCheck className="text-[#0078D4] w-10 h-10" />
           </div>
           <h2 className="text-3xl font-bold text-[#201F1E]">Candidate Login</h2>
           <p className="text-gray-500 text-sm mt-2 font-medium">Use your Aadhaar Number to access the portal</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#201F1E] mb-2">
              Aadhaar Number
            </label>
            <input 
              type="text" 
              placeholder="12-digit Aadhaar Number"
              className="w-full p-3.5 bg-white border border-gray-300 rounded text-[#201F1E] placeholder-gray-400 focus:border-[#0078D4] focus:ring-0 outline-none transition-all font-bold tracking-wide shadow-sm hover:border-gray-400"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              maxLength={12}
            />
          </div>

          {error && <p className="text-[#A4262C] bg-[#FDF3F4] border border-[#FDE7E9] p-3 rounded text-sm text-center font-medium">{error}</p>}
          
          <button type="submit" className="w-full py-3.5 bg-[#0078D4] hover:bg-[#106EBE] text-white rounded font-bold shadow-md transition-all transform hover:scale-[1.01] flex items-center justify-center">
             <LogIn size={20} className="mr-2"/> Login Securely
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-500 text-sm font-medium">
              New Applicant? <span onClick={() => navigate('/register')} className="text-[#0078D4] font-bold cursor-pointer hover:underline hover:text-[#106EBE] transition-colors">Register Here</span>
            </p>
        </div>
        
        <div className="mt-4 text-center">
           <span onClick={() => navigate('/admin-login')} className="text-gray-400 text-xs cursor-pointer hover:text-gray-600 font-medium">Official System Login</span>
        </div>
      </div>
    </div>
  );
};