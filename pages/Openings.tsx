import React, { useState } from 'react';
import { usePosts } from '../context/PostContext';
import { PostType, PostStatus } from '../types';
import { Briefcase, Calendar, Search, Filter, Users, ArrowRight, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Openings: React.FC = () => {
  const { posts } = usePosts();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter logic
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          post.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || post.type === filterType;
    // Only show published posts to applicants usually, but for demo showing all except Drafts might be useful or just Published
    const isVisible = post.status !== PostStatus.DRAFT; 
    return matchesSearch && matchesType && isVisible;
  });

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 min-h-screen bg-slate-50">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Current Job Openings</h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Explore career opportunities at CSIR-SERC. Join us in our mission to excel in structural engineering research and nation-building.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 justify-between items-center sticky top-24 z-10">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-3.5 text-slate-400 group-focus-within:text-csir-blue transition-colors" size={20}/>
          <input 
            type="text" 
            placeholder="Search by Post Title or Code..." 
            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-csir-blue focus:border-transparent outline-none transition-all bg-slate-50 focus:bg-white"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter size={20} className="text-slate-500"/>
          <select 
            className="p-3 border border-slate-300 rounded-lg text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-csir-blue outline-none w-full md:w-64 cursor-pointer"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="ALL">All Departments / Types</option>
            {Object.values(PostType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <div key={post.id} className="bg-white rounded-xl border border-slate-200 hover:shadow-lg transition-all hover:border-csir-blue group flex flex-col md:flex-row overflow-hidden">
               {/* Left Indicator */}
               <div className={`w-2 md:w-2 ${post.type === PostType.SCIENTIST ? 'bg-blue-600' : 'bg-amber-500'}`}></div>
               
               <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                 <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-1 rounded">
                            {post.code}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            post.type === PostType.SCIENTIST ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                            {post.type}
                        </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 group-hover:text-csir-blue transition-colors mb-2">
                        {post.title}
                    </h3>
                    <div className="flex items-center text-slate-600 text-sm mb-4">
                        <Briefcase size={16} className="mr-2 text-slate-400" />
                        <span className="font-medium">{post.department}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                        {post.description}
                    </p>
                 </div>

                 {/* Divider */}
                 <div className="hidden md:block w-px bg-slate-100 mx-2"></div>

                 {/* Right Actions */}
                 <div className="w-full md:w-64 flex flex-col justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                            <span className="text-slate-500 flex items-center"><Users size={16} className="mr-2"/> Vacancies</span>
                            <span className="font-bold text-slate-800 text-lg">{post.vacancies}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm bg-slate-50 p-2 rounded">
                            <span className="text-slate-500 flex items-center"><Calendar size={16} className="mr-2"/> Deadline</span>
                            <span className="font-bold text-red-600">{post.lastDate}</span>
                        </div>
                    </div>
                    
                    {post.status === PostStatus.PUBLISHED ? (
                        <Link 
                            to={`/apply/${post.id}`} 
                            className="flex items-center justify-center w-full py-3 bg-csir-blue text-white rounded-lg font-bold shadow-md hover:bg-blue-900 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                        >
                            Apply Now <ArrowRight size={18} className="ml-2"/>
                        </Link>
                    ) : (
                        <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-lg font-bold cursor-not-allowed border border-slate-200 flex items-center justify-center">
                            Applications Closed <AlertCircle size={16} className="ml-2"/>
                        </button>
                    )}
                 </div>
               </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-xl border-2 border-dashed border-slate-200">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="text-slate-300" size={32}/>
            </div>
            <h3 className="text-lg font-medium text-slate-900">No openings found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria.</p>
            <button 
                onClick={() => {setSearchTerm(''); setFilterType('ALL');}}
                className="mt-4 text-csir-blue font-semibold hover:underline"
            >
                Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};