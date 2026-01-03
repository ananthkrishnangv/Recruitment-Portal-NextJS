import React from 'react';
import { User, UserRole } from '../types';
import { LogOut, User as UserIcon, Menu, X, ShieldCheck, LifeBuoy } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSiteConfig } from '../context/SiteConfigContext';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { config } = useSiteConfig();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col font-sans text-[#201F1E]">
      {/* GIGW Top Bar */}
      <div className="bg-[#201F1E] text-white text-[11px] py-1.5 px-4 flex justify-between items-center hidden md:flex">
        <div className="flex space-x-4 tracking-wide">
          <span className="font-semibold uppercase opacity-90">Government of India</span>
          <span className="text-gray-400">|</span>
          <span className="font-semibold opacity-90">{config.header.ministryText}</span>
        </div>
        <div className="flex space-x-6 text-gray-300 font-medium">
          <a href="#" className="hover:text-white transition-colors">Skip to Main Content</a>
          <a href="#" className="hover:text-white transition-colors">Screen Reader Access</a>
          <span className="cursor-pointer hover:text-white">A- | A | A+</span>
        </div>
      </div>

      {/* Main Header with Acrylic Effect */}
      <header className="bg-white/85 backdrop-blur-md shadow-fluent sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Section */}
            <div className="flex items-center cursor-pointer group" onClick={() => navigate('/')}>
              <div className="flex-shrink-0 flex items-center">
                {/* Official Logo from Config */}
                <img 
                  src={config.header.logoUrl} 
                  alt="CSIR-SERC Logo" 
                  className="h-14 w-auto mr-4"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                {/* Fallback */}
                <div className="h-12 w-12 relative mr-3 hidden">
                  <div className="w-12 h-12 bg-csir-blue rounded-full flex items-center justify-center text-white font-bold">CSIR</div>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-[#005A9E] font-bold text-lg leading-tight tracking-tight font-sans">{config.header.organizationName}</span>
                  <span className="text-gray-600 text-xs font-semibold uppercase tracking-wide">{config.header.organizationSubtitle}</span>
                </div>
              </div>
            </div>

            {/* Desktop Navigation - Fluent Style */}
            <nav className="hidden md:flex space-x-2 items-center">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/') ? 'bg-[#EFF6FC] text-[#0078D4] font-semibold' : 'text-[#201F1E] hover:bg-[#F3F2F1]'}`}>Home</Link>
              <Link to="/posts" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/posts') ? 'bg-[#EFF6FC] text-[#0078D4] font-semibold' : 'text-[#201F1E] hover:bg-[#F3F2F1]'}`}>Openings</Link>
              <Link to="/helpdesk" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/helpdesk') ? 'bg-[#EFF6FC] text-[#0078D4] font-semibold' : 'text-[#201F1E] hover:bg-[#F3F2F1]'}`}>Helpdesk</Link>
              
              {user ? (
                <div className="flex items-center ml-2 pl-4 border-l border-gray-300 space-x-3">
                  {user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR || user.role === UserRole.DIRECTOR ? (
                    <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/admin') ? 'bg-[#EFF6FC] text-[#0078D4]' : 'text-[#201F1E] hover:bg-[#F3F2F1]'}`}>
                      {user.role === UserRole.ADMIN ? 'System Admin' : user.role === UserRole.SUPERVISOR ? 'Admin Officer' : 'Director Dashboard'}
                    </Link>
                  ) : (
                     <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive('/dashboard') ? 'bg-[#EFF6FC] text-[#0078D4]' : 'text-[#201F1E] hover:bg-[#F3F2F1]'}`}>My Applications</Link>
                  )}
                  
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-[#0078D4] text-white flex items-center justify-center text-xs font-bold shadow-sm">
                      {user.name.charAt(0)}
                    </div>
                    <button 
                      onClick={onLogout}
                      className="p-2 rounded-md hover:bg-[#F3F2F1] text-gray-500 hover:text-red-600 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3 ml-4">
                  <Link to="/login" className="px-5 py-2 text-sm font-semibold text-[#0078D4] bg-white border border-[#0078D4] hover:bg-[#EFF6FC] rounded-md transition-all shadow-sm">Candidate Login</Link>
                  <Link to="/admin-login" className="px-5 py-2 text-sm font-semibold text-white bg-[#0078D4] hover:bg-[#106EBE] rounded-md transition-all shadow-md">Official Login</Link>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-[#0078D4] p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-2 shadow-lg animate-fadeIn">
            <div className="px-4 py-2 space-y-1">
              <Link to="/" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-[#F3F2F1]">Home</Link>
              <Link to="/posts" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-[#F3F2F1]">Current Openings</Link>
              <Link to="/helpdesk" className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-[#F3F2F1]">Helpdesk</Link>
              {user && (
                 <Link to={user.role === UserRole.ADMIN ? "/admin" : "/dashboard"} className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:bg-[#F3F2F1]">Dashboard</Link>
              )}
              {user ? (
                 <button onClick={onLogout} className="w-full text-left block px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
              ) : (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link to="/login" className="block text-center px-3 py-3 rounded-md text-base font-medium border border-[#0078D4] text-[#0078D4]">Candidate Login</Link>
                  <Link to="/admin-login" className="block text-center px-3 py-3 rounded-md text-base font-medium bg-[#0078D4] text-white">Official Login</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-[#F3F2F1] relative">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#201F1E] text-white pt-16 pb-8 border-t-4 border-[#0078D4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
             <h3 className="font-bold text-lg mb-6 flex items-center">
              <ShieldCheck className="mr-3 text-[#0078D4]" /> {config.header.organizationName}
             </h3>
             <p className="text-gray-300 text-sm leading-relaxed">
               {config.footer.aboutText}
             </p>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[#0078D4] uppercase tracking-wider text-xs">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {config.footer.quickLinks.map(link => (
                <li key={link.id}><a href={link.url} className="hover:text-white hover:underline transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>
           <div>
            <h4 className="font-bold mb-6 text-[#0078D4] uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {config.footer.supportLinks.map(link => (
                <li key={link.id}><a href={link.url} className="hover:text-white hover:underline transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6 text-[#0078D4] uppercase tracking-wider text-xs">Contact</h4>
            <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
              {config.footer.address}
              <br/><br/>
              Email: <span className="text-white font-medium">{config.footer.contactEmail}</span>
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-800 text-center text-xs text-gray-500">
          <p>{config.footer.copyrightText}</p>
        </div>
      </footer>
    </div>
  );
};