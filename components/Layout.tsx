import React, { useState } from 'react';
import { User, UserRole, ApplicationStatus } from '../types';
import { LogOut, Menu, X, ShieldCheck, Search, Loader, CheckCircle, Clock, XCircle, AlertCircle, Facebook, Twitter, Linkedin, Mail, Phone, MapPin, Lock, Globe, ExternalLink } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      {/* Utility Top Bar */}
      <div className="bg-slate-900 text-white/80 text-[11px] py-1.5 px-4 hidden md:flex justify-between items-center z-[60]">
        <div className="flex items-center space-x-4 font-medium uppercase tracking-wider">
          <span className="flex items-center"><Globe size={12} className="mr-1.5" /> Government of India</span>
          <span className="text-white/20">|</span>
          <span>{config.header.ministryText}</span>
        </div>
        <div className="flex space-x-6 items-center">
          <a href="#" className="hover:text-white transition-colors">Skip to main content</a>
          <span className="text-white/20">|</span>
          <div className="flex items-center space-x-3">
             <button className="hover:text-white">Screen Reader</button>
             <button className="hover:text-white font-bold">A-</button>
             <button className="hover:text-white font-bold">A</button>
             <button className="hover:text-white font-bold">A+</button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div 
              className="flex items-center cursor-pointer group" 
              onClick={() => navigate('/')}
            >
              <div className="bg-white p-1 rounded-lg border border-slate-100 shadow-sm mr-4 group-hover:scale-105 transition-transform duration-300">
                <img src={config.header.logoUrl} alt="Logo" className="h-12 w-auto" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-900 font-extrabold text-xl leading-tight font-heading tracking-tight">
                  {config.header.organizationName}
                </span>
                <span className="text-slate-500 text-[11px] font-semibold uppercase tracking-[0.1em]">
                  {config.header.organizationSubtitle}
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 items-center">
              {[
                { name: 'Home', path: '/' },
                { name: 'Openings', path: '/posts' },
                { name: 'Helpdesk', path: '/helpdesk' }
              ].map((item) => (
                <Link 
                  key={item.name}
                  to={item.path} 
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive(item.path) 
                      ? 'text-brand-600 bg-brand-50' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="h-6 w-px bg-slate-200 mx-3"></div>

              <button 
                onClick={() => setIsStatusModalOpen(true)} 
                className="flex items-center px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Search size={16} className="mr-2 text-slate-400"/> Status
              </button>

              {user ? (
                <div className="flex items-center ml-2 pl-4 border-l border-slate-200 space-x-3">
                  <Link 
                    to={user.role === UserRole.APPLICANT ? "/dashboard" : "/admin"} 
                    className="flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-all shadow-md active:scale-95"
                  >
                    {user.role === UserRole.APPLICANT ? 'Dashboard' : 'Admin Console'}
                  </Link>
                  <button 
                    onClick={onLogout} 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Logout"
                  >
                    <LogOut size={20}/>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 ml-4">
                  <Link 
                    to="/login" 
                    className="px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/admin-login" 
                    className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-all shadow-sm active:scale-95 flex items-center"
                  >
                    <Lock size={14} className="mr-2"/> Official
                  </Link>
                </div>
              )}
            </nav>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-4 px-4 space-y-2 animate-fadeIn z-40 relative">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 rounded-lg text-slate-700 font-semibold hover:bg-slate-50">Home</Link>
          <Link to="/posts" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 rounded-lg text-slate-700 font-semibold hover:bg-slate-50">Openings</Link>
          <Link to="/helpdesk" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 rounded-lg text-slate-700 font-semibold hover:bg-slate-50">Helpdesk</Link>
          <div className="pt-4 flex flex-col space-y-2">
            {!user ? (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 text-center bg-slate-100 rounded-lg font-bold">Login</Link>
                <Link to="/admin-login" onClick={() => setIsMobileMenuOpen(false)} className="block p-3 text-center bg-brand-600 text-white rounded-lg font-bold">Official Login</Link>
              </>
            ) : (
              <button onClick={onLogout} className="p-3 text-center text-red-600 font-bold border border-red-200 rounded-lg">Logout</button>
            )}
          </div>
        </div>
      )}

      <main className="flex-grow">{children}</main>

      {/* Refined Footer */}
      <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center">
                <img src={config.header.logoUrl} alt="Logo" className="h-10 w-auto mr-3 grayscale opacity-70" />
                <span className="font-heading font-extrabold text-lg tracking-tight text-slate-900">
                  {config.header.organizationName}
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                {config.footer.aboutText}
              </p>
              <div className="flex space-x-4">
                {[Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-all">
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-heading font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Navigation</h4>
              <ul className="space-y-3">
                {config.footer.quickLinks.map(link => (
                  <li key={link.id}>
                    <a href={link.url} className="text-slate-500 hover:text-brand-600 text-sm flex items-center group">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 group-hover:bg-brand-500 transition-all"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-heading font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Resources</h4>
              <ul className="space-y-3">
                {config.footer.supportLinks.map(link => (
                  <li key={link.id}>
                    <a href={link.url} className="text-slate-500 hover:text-brand-600 text-sm flex items-center group">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2 group-hover:bg-brand-500 transition-all"></span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="font-heading font-bold text-slate-900 mb-6 text-sm uppercase tracking-widest">Connect</h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-sm text-slate-500">
                  <MapPin size={18} className="text-slate-300 mt-0.5 shrink-0" />
                  <p>{config.footer.address}</p>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-500">
                  <Mail size={18} className="text-slate-300 shrink-0" />
                  <a href={`mailto:${config.footer.contactEmail}`} className="hover:text-brand-600 transition-colors font-medium">
                    {config.footer.contactEmail}
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-500">
                  <Phone size={18} className="text-slate-300 shrink-0" />
                  <p className="font-medium">+91 44 2254 9000</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-400 text-xs font-medium">
              {config.footer.copyrightText}
            </p>
            <div className="flex items-center space-x-6 text-xs font-semibold text-slate-500">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>

      {/* STATUS CHECK MODAL */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn" onClick={() => setIsStatusModalOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-fluent-lg w-full max-w-lg relative overflow-hidden animate-slideUp border border-slate-200">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center font-heading">
                   <Search size={20} className="mr-3 text-brand-500"/> Check Application Status
                </h3>
                <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-2 hover:bg-white rounded-full transition-all">
                  <X size={20}/>
                </button>
             </div>
             <div className="p-8">
                <form onSubmit={handleStatusCheck} className="relative mb-8">
                   <div className="relative">
                     <input 
                       type="text" 
                       className="w-full p-4 pl-5 border-2 border-slate-200 rounded-xl font-mono text-sm uppercase tracking-widest focus:border-brand-500 transition-all outline-none" 
                       placeholder="CSIR-XXXXX-MMYYYY" 
                       value={searchAppId} 
                       onChange={(e) => setSearchAppId(e.target.value)} 
                     />
                     <button 
                        type="submit" 
                        className="absolute right-2 top-2 p-2.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all shadow-md shadow-brand-200 disabled:opacity-50" 
                        disabled={isSearching}
                      >
                       {isSearching ? <Loader size={20} className="animate-spin"/> : <Search size={20}/>}
                     </button>
                   </div>
                   <p className="mt-2 text-xs text-slate-400 font-medium ml-1">Example: CSIR-12345-062024</p>
                </form>

                {searchResult === 'NOT_FOUND' && (
                  <div className="bg-red-50 border border-red-100 p-6 rounded-xl text-center animate-shake">
                    <AlertCircle className="mx-auto text-red-500 mb-2" size={32} />
                    <p className="text-red-700 font-bold">Application Record Not Found</p>
                    <p className="text-red-600/70 text-xs mt-1">Please verify the Application Number and try again.</p>
                  </div>
                )}

                {searchResult && searchResult !== 'NOT_FOUND' && (
                   <div className="space-y-6 animate-fadeIn">
                      <div className="bg-brand-50/50 p-6 rounded-2xl border border-brand-100 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-5">
                            <ShieldCheck size={80} className="text-brand-900" />
                         </div>
                         <div className="relative z-10">
                            <h4 className="font-heading font-extrabold text-slate-900 text-xl uppercase mb-1">
                              {searchResult.personalDetails.fullName}
                            </h4>
                            <p className="text-brand-700 font-bold text-sm">
                              {searchResult.postTitle}
                            </p>
                            <div className="mt-4 pt-4 border-t border-brand-100 flex justify-between items-end">
                               <div>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Application ID</p>
                                  <p className="font-mono text-sm font-black text-slate-700">{searchResult.applicationNumber}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Submitted On</p>
                                  <p className="text-sm font-bold text-slate-700">{searchResult.submittedDate || 'N/A'}</p>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="relative pl-8 space-y-10 py-2">
                          <div className="absolute left-[11px] top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>
                          
                          <div className="relative">
                             <div className="absolute -left-[32px] bg-green-100 border-4 border-white rounded-full p-1.5 text-green-600 z-10 shadow-sm">
                               <CheckCircle size={16}/>
                             </div>
                             <h5 className="text-sm font-bold text-slate-900">Application Received</h5>
                             <p className="text-xs text-slate-500 font-medium">Successfully securely stored in the national database.</p>
                          </div>

                          <div className="relative">
                             <div className={`absolute -left-[32px] rounded-full p-1.5 border-4 border-white z-10 shadow-sm ${
                               ['Submitted', 'Under Scrutiny'].includes(searchResult.status) 
                                 ? 'bg-amber-100 text-amber-600' 
                                 : 'bg-green-100 text-green-600'
                             }`}>
                                {['Submitted', 'Under Scrutiny'].includes(searchResult.status) ? <Clock size={16}/> : <CheckCircle size={16}/>}
                             </div>
                             <h5 className="text-sm font-bold text-slate-900">Verification Phase</h5>
                             <div className="mt-2 flex">
                               <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-600 shadow-sm">
                                 {searchResult.status}
                               </span>
                             </div>
                          </div>
                      </div>
                   </div>
                )}
             </div>
             <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">CSIR-SERC Recruitment 2024</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};