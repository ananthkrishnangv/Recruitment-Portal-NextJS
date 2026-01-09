import React, { useState } from 'react';
import { usePosts } from '../context/PostContext';
import { PostType, PostStatus } from '../types';
import { Briefcase, Calendar, Search, Filter, Users, ArrowRight, AlertCircle, MapPin, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Openings: React.FC = () => {
  const { posts } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || post.type === filterType;
    const isVisible = post.status !== PostStatus.DRAFT; 
    return matchesSearch && matchesType && isVisible;
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen bg-slate-50/30">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-heading font-black text-slate-900 mb-6 tracking-tight">Active Opportunities</h1>
        <p className="text-slate-500 font-medium text-lg leading-relaxed">
          Embark on a rewarding journey in scientific research. We are looking for innovators, researchers, and dedicated technical staff.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-card border border-slate-200 mb-12 flex flex-col md:flex-row gap-4 sticky top-24 z-40">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18}/>
          <input 
            type="text" 
            placeholder="Search by role or post code..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm font-medium"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-72">
          <div className="relative w-full">
            <Filter size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
            <select 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl appearance-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none text-sm font-bold text-slate-700 cursor-pointer"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {Object.values(PostType).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-8">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-[2rem] border border-slate-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group relative overflow-hidden flex flex-col md:flex-row p-2">
               
               <div className="p-8 md:p-10 flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-6">
                      <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                          {post.code}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border ${
                          post.type === PostType.SCIENTIST 
                            ? 'bg-brand-50 border-brand-100 text-brand-700' 
                            : 'bg-amber-50 border-amber-100 text-amber-700'
                      }`}>
                          {post.type}
                      </span>
                  </div>

                  <h3 className="text-3xl font-heading font-black text-slate-900 group-hover:text-brand-600 transition-colors mb-4 leading-tight">
                      {post.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm font-bold mb-8">
                      <div className="flex items-center">
                        <Briefcase size={18} className="mr-2 text-brand-500" />
                        <span>{post.department}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={18} className="mr-2 text-brand-500" />
                        <span>Chennai, Tamil Nadu</span>
                      </div>
                  </div>

                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 max-w-3xl">
                      {post.description}
                  </p>
               </div>

               {/* Right Stats & Actions */}
               <div className="w-full md:w-80 bg-slate-50 md:bg-slate-50/50 p-8 md:p-10 rounded-[1.5rem] flex flex-col justify-center border-l-0 md:border-l border-slate-100">
                  <div className="space-y-6 mb-10">
                      <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center">
                            <Users size={14} className="mr-2"/> Slots
                          </span>
                          <span className="font-black text-slate-900 text-2xl">{post.vacancies}</span>
                      </div>
                      <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center">
                            <Calendar size={14} className="mr-2"/> Deadline
                          </span>
                          <span className="font-black text-red-500 text-sm">{post.lastDate}</span>
                      </div>
                  </div>
                  
                  {post.status === PostStatus.PUBLISHED ? (
                      <Link 
                          to={`/apply/${post.id}`} 
                          className="flex items-center justify-center w-full py-5 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 hover:shadow-brand-200 transition-all active:scale-95"
                      >
                          Begin Application <ArrowRight size={20} className="ml-3 group-hover:translate-x-1 transition-transform"/>
                      </Link>
                  ) : (
                      <div className="flex items-center justify-center w-full py-5 bg-slate-200 text-slate-400 rounded-2xl font-black uppercase tracking-widest cursor-not-allowed border border-slate-300">
                          Closed <AlertCircle size={20} className="ml-3"/>
                      </div>
                  )}
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <Search className="text-slate-300" size={32}/>
            </div>
            <h3 className="text-2xl font-heading font-black text-slate-900 mb-2">No Matching Positions</h3>
            <p className="text-slate-400 font-medium">Try adjusting your search filters or check back later.</p>
            <button 
                onClick={() => {setSearchTerm(''); setFilterType('ALL');}}
                className="mt-8 text-brand-600 font-black uppercase tracking-widest text-sm hover:underline"
            >
                Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};