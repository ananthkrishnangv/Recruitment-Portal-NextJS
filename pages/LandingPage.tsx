
import React from 'react';
import { Briefcase, ChevronRight, Users, Award, Megaphone, ShieldCheck, Database, Rocket, Fingerprint, Search, ArrowRight, FileCheck, Upload, PenTool, CheckCircle, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export const LandingPage: React.FC = () => {
  const { posts } = usePosts();
  const { config } = useSiteConfig();

  const steps = [
    { id: 1, icon: <Fingerprint />, title: "Registration", desc: "Create a secure account using your Aadhaar UID.", tip: "Uses GoI UIDAI Verification node." },
    { id: 2, icon: <Briefcase />, title: "Select Post", desc: "Choose the active vacancy that fits your profile.", tip: "Filter by Scientists or Technical categories." },
    { id: 3, icon: <PenTool />, title: "Fill Details", desc: "Complete the 7-step form (Personal, Academic, Experience).", tip: "Auto-save enabled at every step." },
    { id: 4, icon: <Upload />, title: "Artifacts", desc: "Upload Photo, Signature, and CV securely.", tip: "Max 50MB per file. Encrypted storage." },
    { id: 5, icon: <FileCheck />, title: "Submit", desc: "Finalize your application for scrutiny.", tip: "Cannot be edited after this stage." },
    { id: 6, icon: <FileText />, title: "Download", desc: "Get your PDF acknowledgement instantly.", tip: "Keep this safe for interviews." },
    { id: 7, icon: <Search />, title: "Track Status", desc: "Monitor your application status real-time.", tip: "Use the 'Status' button in menu." },
  ];

  return (
    <div className="flex flex-col space-y-0 pb-12 bg-white overflow-hidden">
      {/* Dynamic Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-32 md:pb-52 px-4 overflow-hidden">
        {/* Abstract Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-50 rounded-full blur-[120px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center space-x-2 mb-8 bg-slate-900/5 px-4 py-1.5 rounded-full border border-slate-200">
              <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
              <span className="text-[10px] font-extrabold text-slate-600 tracking-[0.2em] uppercase font-heading">CSIR Nodal Recruitment System 2024</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-heading font-black mb-8 text-slate-900 tracking-tight leading-[0.95] max-w-5xl">
              Engineering <span className="text-brand-600">The Future</span> of Nations.
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mb-12">
              Join the pinnacle of structural engineering research. Empowering India's infrastructure through world-class scientific innovation and talent.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-5 w-full sm:w-auto">
               <Link to="/posts" className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-slate-200 transition-all transform hover:-translate-y-1 active:scale-95 text-base flex items-center justify-center">
                 Explore Vacancies <Search size={18} className="ml-3 opacity-60" />
               </Link>
               <Link to="/register" className="bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-900 font-bold py-4 px-10 rounded-2xl transition-all transform hover:-translate-y-1 active:scale-95 text-base flex items-center justify-center">
                 Register Profile <Fingerprint size={18} className="ml-3 text-slate-400" />
               </Link>
            </div>
          </div>
        </div>

        {/* News Marquee */}
        <div className="absolute bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-200 h-16 flex items-center z-20 overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 flex items-center w-full">
              <div className="flex items-center bg-white border border-slate-200 text-slate-900 text-[10px] font-black px-4 py-2 rounded-xl mr-6 uppercase tracking-widest shrink-0 shadow-sm">
                <Megaphone size={14} className="mr-2 text-brand-500" /> Updates
              </div>
              <div className="overflow-hidden relative w-full h-full flex items-center">
                 <div className="animate-marquee whitespace-nowrap text-slate-500 font-bold text-xs uppercase tracking-wider">
                    {config.news.map((item) => (
                      <span key={item.id} className="mx-12 inline-flex items-center">
                        {item.isNew && <span className="bg-brand-500 text-white text-[9px] font-black px-2 py-0.5 rounded-lg mr-3 shadow-sm">New</span>}
                        {item.text}
                      </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 -mt-16 md:-mt-24 relative z-30">
        {[
          { icon: <Database size={28} />, value: '2.4K+', label: 'Applicants', color: 'bg-blue-50 text-blue-600' },
          { icon: <Briefcase size={28} />, value: '12+', label: 'Divisions', color: 'bg-emerald-50 text-emerald-600' },
          { icon: <Award size={28} />, value: '45+', label: 'Openings', color: 'bg-amber-50 text-amber-600' },
          { icon: <Rocket size={28} />, value: '08', label: 'Mega Projects', color: 'bg-indigo-50 text-indigo-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 md:p-8 rounded-3xl shadow-card border border-slate-100 hover:shadow-xl transition-all duration-300 group">
            <div className={`${stat.color} w-14 h-14 flex items-center justify-center rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
              {stat.icon}
            </div>
            <p className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-1 leading-none">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* PROCESS FLOW GRAPHICAL EXPLANATION */}
      <section className="max-w-7xl mx-auto px-4 mt-32">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-heading font-black text-slate-900 tracking-tight">How to Apply?</h2>
           <p className="text-slate-500 mt-2 font-medium">Seamless digital application workflow in 7 simple steps.</p>
        </div>
        
        <div className="relative">
           {/* Connecting Line */}
           <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
           
           <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6 relative z-10">
              {steps.map((step, idx) => (
                  <div key={step.id} className="group relative flex flex-col items-center">
                      <div className="w-16 h-16 bg-white border-2 border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 group-hover:border-brand-500 group-hover:text-brand-600 group-hover:shadow-xl group-hover:shadow-brand-100 transition-all duration-300 z-10 relative">
                          {step.icon}
                          <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center text-[10px] font-black border border-white group-hover:bg-brand-600 group-hover:text-white transition-colors">
                              {step.id}
                          </div>
                      </div>
                      <h4 className="mt-6 font-black text-xs uppercase tracking-widest text-slate-900">{step.title}</h4>
                      
                      {/* Tooltip Popup on Hover */}
                      <div className="absolute bottom-full mb-4 w-48 bg-slate-900 text-white p-4 rounded-xl text-center opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 shadow-xl z-20 pointer-events-none">
                          <p className="text-xs font-bold mb-1">{step.desc}</p>
                          <p className="text-[10px] text-slate-400 border-t border-slate-700 pt-2 mt-2">{step.tip}</p>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5 w-3 h-3 bg-slate-900 rotate-45"></div>
                      </div>
                  </div>
              ))}
           </div>
        </div>
      </section>

      {/* Jobs Showcase */}
      <div className="max-w-7xl mx-auto px-4 mt-32 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b-2 border-slate-100 pb-10 mb-12">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-heading font-black text-slate-900 tracking-tight mb-4">Immediate Vacancies</h2>
            <p className="text-slate-500 font-medium">Direct recruitment for specialized research roles at Structural Engineering Research Centre, Chennai.</p>
          </div>
          <Link to="/posts" className="text-brand-600 text-sm font-bold uppercase tracking-widest hover:text-brand-700 transition-colors flex items-center group">
            View All Vacancies <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post) => (
            <div key={post.id} className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:border-brand-300 hover:bg-white hover:shadow-2xl transition-all duration-500 group flex flex-col h-full">
              <div className="flex justify-between items-start mb-8">
                <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {post.type}
                </div>
                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
                  Deadline: {post.lastDate}
                </div>
              </div>
              
              <h3 className="text-2xl font-heading font-black text-slate-900 mb-4 group-hover:text-brand-600 transition-colors leading-tight">
                {post.title}
              </h3>
              
              <p className="text-slate-500 text-sm mb-10 line-clamp-3 leading-relaxed flex-grow">
                {post.description}
              </p>
              
              <Link 
                to={`/apply/${post.id}`} 
                className="inline-flex items-center justify-center w-full py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-900 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 group-hover:shadow-lg group-hover:shadow-brand-100 transition-all active:scale-95"
              >
                Apply for Position <ArrowRight size={16} className="ml-2"/>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
