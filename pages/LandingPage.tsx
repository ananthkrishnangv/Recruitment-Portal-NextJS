import React from 'react';
import { PostType, JobPost } from '../types';
import { Briefcase, Calendar, ChevronRight, Users, Award, BookOpen, Megaphone, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useSiteConfig } from '../context/SiteConfigContext';

export const LandingPage: React.FC = () => {
  const { posts } = usePosts();
  const { config } = useSiteConfig();

  return (
    <div className="flex flex-col space-y-12 pb-12">
      {/* Hero Section with Custom Background and Acrylic Cards */}
      <section className="relative pt-32 pb-44 px-4 overflow-hidden bg-[#201F1E]">
        {/* Background Image Layer */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ 
            backgroundImage: `url('${config.landing.heroImageUrl}')`,
            backgroundAttachment: 'fixed' 
          }}
        ></div>
        
        <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#201F1E] to-transparent"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Glass Card for Title */}
          <div className="inline-block p-12 rounded-3xl backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl mb-10 transform transition-all hover:scale-[1.01]">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white tracking-tight leading-tight drop-shadow-lg">
              Shape the Future of <br/>
              <span className="text-[#0078D4] bg-clip-text text-transparent bg-gradient-to-r from-[#0078D4] to-[#50E6FF]">Structural Engineering</span>
            </h1>
            <div className="h-1 w-32 bg-[#0078D4] mx-auto rounded-full mt-6 shadow-[0_0_15px_rgba(0,120,212,0.5)]"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 font-medium leading-relaxed drop-shadow-md">
            Join CSIR-SERC, a premier national laboratory. <br className="hidden md:block"/>
            Contribute to cutting-edge research and nation-building projects.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-5">
             <Link to="/posts" className="bg-[#0078D4] hover:bg-[#106EBE] text-white font-bold py-4 px-10 rounded-full transition-all transform hover:-translate-y-1 hover:shadow-lg text-lg flex items-center justify-center">
               View Openings <ChevronRight className="ml-2" />
             </Link>
             <Link to="/register" className="backdrop-blur-md bg-white/10 border-2 border-white/40 hover:bg-white/20 text-white font-bold py-4 px-10 rounded-full transition-all transform hover:-translate-y-1 hover:shadow-lg text-lg">
               Register Now
             </Link>
          </div>
        </div>

        {/* News Ticker - Acrylic */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/5 backdrop-blur-xl border-t border-white/10 h-14 flex items-center z-20">
           <div className="max-w-7xl mx-auto px-4 flex items-center w-full">
              <div className="flex items-center bg-[#D13438] text-white text-[10px] font-bold px-4 py-1.5 rounded-full mr-6 uppercase tracking-wider shrink-0 shadow-md">
                <Bell size={14} className="mr-2" /> Latest Updates
              </div>
              <div className="overflow-hidden relative w-full h-full flex items-center">
                 <div className="animate-marquee whitespace-nowrap flex items-center text-white/90">
                    {config.news.map((item) => (
                      <span key={item.id} className="mx-8 text-sm font-medium inline-flex items-center">
                        {item.isNew && (
                           <span className="bg-[#FFB900] text-black text-[10px] font-bold px-2 py-0.5 rounded mr-3">NEW</span> 
                        )}
                        {item.text}
                      </span>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Stats/Features - Floating Cards */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 -mt-24 relative z-20">
        <div className="bg-white p-8 rounded-xl shadow-fluent-hover hover:-translate-y-1 transition-all duration-300 border-l-4 border-[#107C10]">
          <div className="bg-[#F1FDF1] w-14 h-14 rounded-full flex items-center justify-center mb-6">
            <Users className="text-[#107C10] h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-[#201F1E]">Equal Opportunity</h3>
          <p className="text-gray-600 leading-relaxed text-sm">Transparent recruitment process adhering strictly to GoI reservation guidelines and roster systems.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-fluent-hover hover:-translate-y-1 transition-all duration-300 border-l-4 border-[#0078D4]">
          <div className="bg-[#EFF6FC] w-14 h-14 rounded-full flex items-center justify-center mb-6">
            <Award className="text-[#0078D4] h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-[#201F1E]">Excellence</h3>
          <p className="text-gray-600 leading-relaxed text-sm">Join a premier national laboratory known for world-class structural engineering research.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-fluent-hover hover:-translate-y-1 transition-all duration-300 border-l-4 border-[#FFB900]">
          <div className="bg-[#FFF9E6] w-14 h-14 rounded-full flex items-center justify-center mb-6">
            <BookOpen className="text-[#FFB900] h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold mb-3 text-[#201F1E]">Growth & Learning</h3>
          <p className="text-gray-600 leading-relaxed text-sm">Ample opportunities for higher education (AcSIR), skill development, and career advancement.</p>
        </div>
      </section>

      {/* Current Openings Preview */}
      <section className="max-w-7xl mx-auto px-4 w-full pt-10">
        <div className="flex justify-between items-end mb-10 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-3xl font-bold text-[#201F1E]">Current Opportunities</h2>
            <p className="text-gray-500 mt-2 font-medium">Explore and apply for open positions</p>
          </div>
          <Link to="/posts" className="text-[#0078D4] font-semibold hover:text-[#106EBE] flex items-center transition-colors group">
            View All Openings <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-fluent border border-transparent hover:border-[#0078D4] hover:shadow-fluent-hover transition-all p-0 flex flex-col group overflow-hidden">
              <div className="h-2 w-full bg-[#0078D4] group-hover:h-3 transition-all"></div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-[#F3F2F1] text-[#201F1E] px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border border-gray-200">
                    {post.type}
                  </span>
                  <span className="text-[#107C10] text-xs font-bold px-2 py-1 bg-[#F1FDF1] rounded border border-[#107C10]/20 flex items-center">
                    <div className="w-2 h-2 bg-[#107C10] rounded-full mr-2 animate-pulse"></div> Active
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-[#201F1E] group-hover:text-[#0078D4] transition-colors mb-2 line-clamp-1" title={post.title}>{post.title}</h3>
                <p className="text-sm text-gray-500 mb-6 line-clamp-2 flex-grow">{post.description}</p>
                
                <div className="space-y-3 text-sm text-gray-700 mb-6">
                  <div className="flex items-center">
                    <Briefcase size={16} className="mr-3 text-gray-400" />
                    <span className="font-medium">{post.department}</span>
                  </div>
                   <div className="flex items-center">
                    <Users size={16} className="mr-3 text-gray-400" />
                    <span><span className="font-bold">{post.vacancies}</span> Vacancies</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="mr-3 text-gray-400" />
                    <span className="text-[#D13438] font-medium">Deadline: {post.lastDate}</span>
                  </div>
                </div>

                <Link to={`/apply/${post.id}`} className="block w-full text-center py-3 border border-[#0078D4] text-[#0078D4] bg-white rounded-lg hover:bg-[#0078D4] hover:text-white transition-all font-semibold">
                  Apply Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Information Strip */}
      <section className="bg-white py-24 px-4 mt-12 shadow-fluent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[#EFF6FC] p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-8 shadow-sm">
             <Megaphone className="text-[#0078D4] w-10 h-10"/>
          </div>
          <h2 className="text-3xl font-bold text-[#201F1E] mb-6">{config.assistance.title}</h2>
          <p className="text-gray-600 mb-10 text-xl leading-relaxed max-w-2xl mx-auto font-light">
            {config.assistance.description}
          </p>
          <div className="flex justify-center gap-6">
            <Link to="/helpdesk" className="px-8 py-3 bg-white border-2 border-gray-200 rounded-full hover:border-[#0078D4] hover:text-[#0078D4] text-gray-700 font-bold transition-all shadow-sm">
              Contact Helpdesk
            </Link>
            <a href="#" className="px-8 py-3 bg-[#0078D4] text-white rounded-full shadow-md hover:bg-[#106EBE] hover:shadow-lg font-bold transition-all">
              Download Guidelines
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};