import React from 'react';
import { Briefcase, ChevronRight, Users, Award, Megaphone, ShieldCheck, Database, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export const LandingPage: React.FC = () => {
  const { posts } = usePosts();
  const { config } = useSiteConfig();

  return (
    <div className="flex flex-col space-y-0 pb-12 bg-[#FAF9F8]">
      {/* Light Hero Section with Acrylic Container */}
      <section className="relative pt-24 pb-48 px-4 overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#F3F9FD] to-white"></div>
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-[0.07] grayscale"
          style={{ backgroundImage: `url('${config.landing.heroImageUrl}')` }}
        ></div>
        
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
          {/* Glass Card for Banner Text - Soft Theme */}
          <div className="px-8 py-12 md:px-16 md:py-20 rounded-[2rem] glass-morphism shadow-glass mb-10 max-w-5xl">
            <div className="inline-flex items-center space-x-3 mb-6 bg-csir-blue/5 px-4 py-1.5 rounded-full border border-csir-blue/10">
              <div className="w-2 h-2 bg-csir-blue rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-csir-blue tracking-[0.3em] uppercase">CSIR National Recruitment Node 2024-25</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-black mb-6 text-[#323130] tracking-tight leading-[1.1]">
              Pioneering the Future of <br/>
              <span className="text-csir-blue">Structural Science</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#605E5C] max-w-3xl mx-auto font-bold leading-relaxed mb-10">
              Join a community of elite scientists and engineers. <br className="hidden md:block"/>
              Empowering India's infrastructure through technological innovation.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Link to="/posts" className="bg-csir-blue hover:bg-[#005A9E] text-white font-black py-4 px-10 rounded shadow-fluent-lg transition-all transform hover:-translate-y-1 text-sm tracking-widest uppercase">
                 Explore Vacancies
               </Link>
               <Link to="/register" className="bg-white border-2 border-[#EDEBE9] hover:border-csir-blue text-[#323130] font-black py-4 px-10 rounded transition-all transform hover:-translate-y-1 text-sm tracking-widest uppercase">
                 Register Identity
               </Link>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-white/60 backdrop-blur-xl border-t border-[#EDEBE9] h-14 flex items-center z-20">
           <div className="max-w-7xl mx-auto px-4 flex items-center w-full">
              <div className="flex items-center bg-csir-blue text-white text-[10px] font-black px-4 py-1.5 rounded-sm mr-6 uppercase tracking-widest shrink-0">
                <Megaphone size={14} className="mr-2" /> News Archive
              </div>
              <div className="overflow-hidden relative w-full h-full flex items-center">
                 <div className="animate-marquee whitespace-nowrap text-[#323130] font-bold text-xs uppercase tracking-wider">
                    {config.news.map((item) => (
                      <span key={item.id} className="mx-12 inline-flex items-center">
                        {item.isNew && <span className="bg-[#FFB900] text-[#323130] text-[9px] font-black px-2 py-0.5 rounded mr-3 uppercase">New</span>}
                        {item.text}
                      </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Statistics Section - Light Glassmorphism */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-6 -mt-20 relative z-20">
        {[
          { icon: <Database size={32} />, value: '2,450+', label: 'Applicants', color: 'border-csir-blue' },
          { icon: <Briefcase size={32} />, value: '12+', label: 'Divisions', color: 'border-csir-green' },
          { icon: <Award size={32} />, value: '45+', label: 'Scientist Slots', color: 'border-csir-accent' },
          { icon: <Rocket size={32} />, value: '08', label: 'Mega Projects', color: 'border-teal-500' }
        ].map((stat, i) => (
          <div key={i} className={`glass-card p-8 rounded-2xl shadow-fluent-lg border-t-4 ${stat.color} group hover:bg-white transition-all`}>
            <div className="text-csir-blue mb-4 transform group-hover:scale-110 transition-transform">{stat.icon}</div>
            <p className="text-3xl font-black text-[#323130] mb-1">{stat.value}</p>
            <p className="text-[10px] font-black text-[#A19F9D] uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Jobs Preview */}
      <div className="max-w-7xl mx-auto px-4 mt-24 w-full">
        <div className="flex justify-between items-end border-b-2 border-[#EDEBE9] pb-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#323130] uppercase tracking-tight">Recruitment Drives</h2>
            <p className="text-xs font-bold text-[#A19F9D] uppercase tracking-widest mt-1">Direct recruitment for specialized research roles</p>
          </div>
          <Link to="/posts" className="text-csir-blue text-xs font-black uppercase tracking-widest hover:underline flex items-center">
            View All <ChevronRight size={16} className="ml-1"/>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.slice(0, 3).map((post) => (
            <div key={post.id} className="bg-white border border-[#EDEBE9] p-8 rounded-xl hover:border-csir-blue transition-all group relative">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black text-csir-blue bg-csir-light px-3 py-1 border border-csir-blue/10 uppercase tracking-widest">{post.type}</span>
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">End: {post.lastDate}</span>
              </div>
              <h3 className="text-xl font-black text-[#323130] mb-4 group-hover:text-csir-blue transition-colors uppercase">{post.title}</h3>
              <p className="text-sm text-[#605E5C] mb-8 line-clamp-2">{post.description}</p>
              <Link to={`/apply/${post.id}`} className="inline-flex items-center text-xs font-black uppercase tracking-widest text-[#323130] hover:text-csir-blue">
                Apply Online <ChevronRight size={16} className="ml-2"/>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};