import React, { useState } from 'react';
import { User, UserRole } from '../types';
// Added missing Rocket and ShieldCheck icons to lucide-react imports
import { UserPlus, ArrowRight, Fingerprint, Mail, Smartphone, User as UserIcon, Rocket, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
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
      setError('Aadhaar must be 12 digits.');
      return;
    }
    if (formData.mobile.length !== 10) {
      setError('Mobile must be 10 digits.');
      return;
    }

    if (users.some(u => u.aadhaar === formData.aadhaar)) {
      setError('UID already registered.');
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
    navigate('/login');
  };

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none placeholder-slate-300";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Left Side Info */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
           <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-500/10 rounded-full blur-[100px]"></div>
           <div className="relative z-10">
              <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-brand-500/20">
                 <Rocket size={24}/>
              </div>
              <h1 className="text-5xl font-heading font-black tracking-tight mb-8">Official <span className="text-brand-500">Identity</span> Registry.</h1>
              <p className="text-white/60 font-medium leading-relaxed max-w-sm mb-12">Register your credentials to apply for scientist and technical officer positions across the institutional network.</p>
              
              <div className="space-y-6">
                {[
                  { icon: <ShieldCheck size={18}/>, title: 'Encrypted Records', desc: 'UIDAI-standard nodal point encryption' },
                  { icon: <Mail size={18}/>, title: 'Realtime Alerts', desc: 'Status updates via SMS and Email' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4">
                     <div className="p-3 bg-white/5 rounded-xl text-brand-400 border border-white/10">{item.icon}</div>
                     <div>
                        <p className="text-sm font-black uppercase tracking-widest">{item.title}</p>
                        <p className="text-white/40 text-xs font-bold">{item.desc}</p>
                     </div>
                  </div>
                ))}
              </div>
           </div>
           
           <div className="relative z-10 pt-10 border-t border-white/5">
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">CSIR-SERC Digital Core</p>
           </div>
        </div>

        {/* Right Side Form */}
        <div className="p-10 md:p-16">
          <div className="mb-12">
             <h2 className="text-3xl font-heading font-black text-slate-900 mb-2 tracking-tight">Create Identity</h2>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verify and commmit registration</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            <div className="relative">
              <label className={labelClass}>Full Legal Name</label>
              <div className="relative">
                 <UserIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"/>
                 <input type="text" name="name" value={formData.name} onChange={handleChange} className={`${inputClass} pl-12`} required placeholder="As per Aadhaar" />
              </div>
            </div>

            <div className="relative">
              <label className={labelClass}>Email Address</label>
              <div className="relative">
                 <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"/>
                 <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputClass} pl-12`} required placeholder="name@domain.com" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className={labelClass}>Mobile Number</label>
                <div className="relative">
                   <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"/>
                   <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} maxLength={10} className={`${inputClass} pl-12`} required placeholder="10 digits" />
                </div>
              </div>
              <div className="relative">
                <label className={labelClass}>Aadhaar UID</label>
                <div className="relative">
                   <Fingerprint size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"/>
                   <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} maxLength={12} className={`${inputClass} pl-12`} required placeholder="12 digits" />
                </div>
              </div>
            </div>
            
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase text-center border border-red-100">{error}</div>}
            
            <button type="submit" className="w-full py-5 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center text-sm">
               Register Identity <ArrowRight size={18} className="ml-3 opacity-50"/>
            </button>
          </form>

          <p className="mt-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
             Already in the system? <Link to="/login" className="text-brand-600 font-black hover:underline transition-colors">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};