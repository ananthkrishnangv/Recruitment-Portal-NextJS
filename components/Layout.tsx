import React, { useState } from 'react';
import { User, UserRole, ApplicationStatus } from '../types';
import { LogOut, Menu, X, ShieldCheck, Search, Loader, CheckCircle, Clock, XCircle, AlertCircle, Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Lock } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useApplications } from '../context/ApplicationContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = React.useState(false);
  const [searchAppId, setSearchAppId] = React.useState('');
  const [searchResult, setSearchResult] = React.useState<any | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const { applications } = useApplications();

  const isActive = (path: string) => location.pathname === path;

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchAppId.trim()) return;
    setIsSearching(true);
    setTimeout(() => {
        const app = applications.find(a => a.applicationNumber?.trim().toLowerCase() === searchAppId.trim().toLowerCase());
        setSearchResult(app || 'NOT_FOUND');
        setIsSearching(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#323130] bg-[#FAF9F8]">
      {/* Top GIGW bar */}
      <div className="bg-[#F3F2F1] text-[#323130] text-[11px] py-1.5 px-4 flex justify-between items-center hidden md:flex border-b border-[#EDEBE9]">
        <div className="flex space-x-4 tracking-wide font-semibold opacity-80 uppercase">
          <span>Government of India</span>
          <span className="text-[#C8C6C4]">|</span>
          <span>{config.header.ministryText}</span>
        </div>
        <div className="flex space-x-6 text-[#605E5C] font-semibold uppercase tracking-wider">
          <a href="#" className="hover:text-csir-blue">Screen Reader</a>
          <span className="cursor-pointer hover:text-csir-blue">A- | A | A+</span>
        </div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl shadow-fluent sticky top-0 z-50 border-b border-[#EDEBE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
              <img src={config.header.logoUrl} alt="Logo" className="h-14 w-auto mr-4 group-hover:scale-105 transition-transform" />
              <div className="flex flex-col">
                <span className="text-[#005A9E] font-black text-xl leading-tight uppercase">{config.header.organizationName}</span>
                <span className="text-[#605E5C] text-[10px] font-bold uppercase tracking-[0.1em]">{config.header.organizationSubtitle}</span>
              </div>
            </div>

            <nav className="hidden md:flex space-x-1 items-center">
              <Link to="/" className={`px-4 py-2 rounded text-sm font-bold transition-all ${isActive('/') ? 'text-csir-blue bg-csir-light' : 'text-[#323130] hover:bg-[#F3F2F1]'}`}>HOME</Link>
              <Link to="/posts" className={`px-4 py-2 rounded text-sm font-bold transition-all ${isActive('/posts') ? 'text-csir-blue bg-csir-light' : 'text-[#323130] hover:bg-[#F3F2F1]'}`}>OPENINGS</Link>
              <Link to="/helpdesk" className={`px-4 py-2 rounded text-sm font-bold transition-all ${isActive('/helpdesk') ? 'text-csir-blue bg-csir-light' : 'text-[#323130] hover:bg-[#F3F2F1]'}`}>HELPDESK</Link>
              
              <button onClick={() => setIsStatusModalOpen(true)} className="ml-4 px-5 py-1.5 border-2 border-[#0078D4] text-[#0078D4] hover:bg-csir-blue hover:text-white rounded-sm text-sm font-bold transition-all flex items-center">
                <Search size={14} className="mr-2"/> QUICK STATUS
              </button>

              {user ? (
                <div className="flex items-center ml-4 pl-4 border-l border-[#EDEBE9] space-x-3">
                  <Link to={user.role === UserRole.APPLICANT ? "/dashboard" : "/admin"} className="text-sm font-bold text-[#0078D4] hover:underline uppercase">
                    {user.role === UserRole.APPLICANT ? 'DASHBOARD' : 'ADMIN CONSOLE'}
                  </Link>
                  <div className="h-8 w-8 rounded-full bg-csir-blue text-white flex items-center justify-center text-xs font-bold">{user.name.charAt(0)}</div>
                  <button onClick={onLogout} className="p-2 text-[#605E5C] hover:text-red-600 transition-colors"><LogOut size={18}/></button>
                </div>
              ) : (
                <div className="flex space-x-2 ml-4">
                  <Link to="/login" className="px-5 py-1.5 text-xs font-extrabold bg-white border border-csir-blue text-csir-blue rounded-sm hover:bg-csir-light tracking-widest transition-all">CANDIDATE LOGIN</Link>
                  <Link to="/admin-login" className="px-5 py-1.5 text-xs font-extrabold bg-csir-blue text-white rounded-sm hover:bg-[#005A9E] shadow-sm tracking-widest transition-all flex items-center">
                    <Lock size={12} className="mr-2"/> OFFICIAL LOGIN
                  </Link>
                </div>
              )}
            </nav>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-[#323130] p-2"><Menu size={28} /></button>
          </div>
        </div>
      </header>

      <main className="flex-grow">{children}</main>

      {/* Redesigned Fluent Footer */}
      <footer className="relative mt-12 bg-white/60 backdrop-blur-2xl border-t border-[#EDEBE9]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-csir-blue via-teal-400 to-csir-blue opacity-30"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="bg-csir-blue/10 p-2 rounded-lg"><ShieldCheck className="text-csir-blue w-8 h-8" /></div>
                <h3 className="font-black text-lg uppercase text-csir-blue">{config.header.organizationName}</h3>
              </div>
              <p className="text-[#605E5C] text-sm leading-relaxed font-medium">{config.footer.aboutText}</p>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-[#323130] mb-8 pb-2 border-b-2 border-csir-blue/20 inline-block">NAVIGATE</h4>
              <ul className="space-y-4 text-sm font-bold">
                {config.footer.quickLinks.map(link => (
                  <li key={link.id}><a href={link.url} className="text-[#605E5C] hover:text-csir-blue transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-widest text-[#323130] mb-8 pb-2 border-b-2 border-csir-blue/20 inline-block">RESOURCES</h4>
              <ul className="space-y-4 text-sm font-bold">
                {config.footer.supportLinks.map(link => (
                  <li key={link.id}><a href={link.url} className="text-[#605E5C] hover:text-csir-blue transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="font-black text-xs uppercase tracking-widest text-[#323130] mb-2 pb-2 border-b-2 border-csir-blue/20 inline-block">CONNECT</h4>
              <div className="space-y-4 text-[#605E5C]">
                <div className="flex items-start space-x-3"><MapPin className="text-csir-blue shrink-0 w-5 h-5" /><p className="text-sm font-medium">{config.footer.address}</p></div>
                <div className="flex items-center space-x-3"><Mail className="text-csir-blue shrink-0 w-5 h-5" /><a href={`mailto:${config.footer.contactEmail}`} className="text-sm font-bold text-[#323130]">{config.footer.contactEmail}</a></div>
                <div className="flex items-center space-x-3"><Phone className="text-csir-blue shrink-0 w-5 h-5" /><p className="text-sm font-bold text-[#323130]">+91 44 2254 9000</p></div>
              </div>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-[#EDEBE9] flex flex-col md:flex-row justify-between items-center text-[11px] font-bold text-[#A19F9D] uppercase tracking-widest">
            <p>{config.footer.copyrightText}</p>
            <div className="flex space-x-8"><a href="#">Privacy Policy</a><a href="#">Terms of Use</a></div>
          </div>
        </div>
      </footer>

      {/* QUICK STATUS MODAL */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#F3F2F1]/80 backdrop-blur-md" onClick={() => setIsStatusModalOpen(false)}></div>
          <div className="bg-white rounded shadow-fluent-lg w-full max-w-xl relative overflow-hidden animate-fadeIn border border-[#EDEBE9]">
             <div className="bg-[#FAF9F8] px-6 py-4 flex justify-between items-center border-b border-[#EDEBE9]">
                <h3 className="text-sm font-black text-[#323130] flex items-center uppercase tracking-widest"><Search size={18} className="mr-3 text-csir-blue"/> Tracking Portal</h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-[#605E5C] hover:text-csir-blue"><X size={24}/></button>
             </div>
             <div className="p-8">
                <form onSubmit={handleStatusCheck} className="relative mb-8">
                   <input type="text" className="w-full p-4 pl-5 bg-white font-mono text-sm uppercase tracking-widest" placeholder="CSIR-XXXXX-MMYYYY" value={searchAppId} onChange={(e) => setSearchAppId(e.target.value)} />
                   <button type="submit" className="absolute right-3 top-3 p-1.5 bg-csir-blue text-white rounded hover:bg-[#005A9E]" disabled={isSearching}>
                     {isSearching ? <Loader size={20} className="animate-spin"/> : <Search size={20}/>}
                   </button>
                </form>
                {searchResult === 'NOT_FOUND' && <div className="text-center py-8 bg-[#FDF3F4] text-red-600 font-bold text-sm">RECORD NOT FOUND</div>}
                {searchResult && searchResult !== 'NOT_FOUND' && (
                   <div className="space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-start bg-csir-light/50 p-4 rounded border border-csir-blue/10">
                         <div>
                            <h4 className="font-black text-[#323130] text-lg uppercase">{searchResult.personalDetails.fullName}</h4>
                            <p className="text-xs font-bold text-[#0078D4]">{searchResult.postTitle}</p>
                         </div>
                         <span className="font-mono text-xs font-black bg-white px-2 py-1 border border-[#EDEBE9] rounded">{searchResult.applicationNumber}</span>
                      </div>
                      <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#EDEBE9]">
                          <div className="relative">
                             <div className="absolute -left-[30px] bg-green-100 border-2 border-csir-green rounded-full p-1.5 text-csir-green z-10"><CheckCircle size={14}/></div>
                             <p className="text-xs font-black text-[#323130] uppercase tracking-widest">Application Locked</p>
                             <p className="text-[11px] text-[#605E5C] font-bold">Registration success. Securely stored in GoI data center.</p>
                          </div>
                          <div className="relative">
                             <div className={`absolute -left-[30px] rounded-full p-1.5 border-2 z-10 ${['Submitted', 'Under Scrutiny'].includes(searchResult.status) ? 'bg-[#FFF4CE] border-[#FFB900] text-[#8A662E]' : 'bg-green-100 border-csir-green text-csir-green'}`}>
                                {['Submitted', 'Under Scrutiny'].includes(searchResult.status) ? <Clock size={14}/> : <CheckCircle size={14}/>}
                             </div>
                             <p className="text-xs font-black text-[#323130] uppercase tracking-widest">Administrative Processing</p>
                             <span className="inline-block mt-2 px-4 py-1.5 rounded-sm text-[10px] font-black uppercase tracking-widest bg-csir-light text-csir-blue border border-csir-blue/20">{searchResult.status}</span>
                          </div>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};