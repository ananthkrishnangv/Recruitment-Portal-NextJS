import React from 'react';
import { PostType, JobPost } from '../types';
import { Briefcase, Calendar, ChevronRight, Users, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePosts } from '../context/PostContext';

export const LandingPage: React.FC = () => {
  const { posts } = usePosts();

  return (
    <div className="flex flex-col space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-csir-blue text-white py-20 px-4">
        <div className="absolute inset-0 bg-blue-900 opacity-50 pattern-grid-lg"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Join the Future of Engineering Science</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-10">
            Apply for prestigious scientific and technical positions at CSIR-SERC. 
            Contribute to nation-building through advanced research.
          </p>
          <div className="flex justify-center space-x-4">
             <Link to="/posts" className="bg-csir-accent hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-full transition-transform transform hover:scale-105 shadow-lg">
               View Openings
             </Link>
             <Link to="/register" className="bg-transparent border-2 border-white hover:bg-white hover:text-csir-blue text-white font-semibold py-3 px-8 rounded-full transition-colors">
               Register Now
             </Link>
          </div>
        </div>
      </section>

      {/* Stats/Features */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 -mt-20 relative z-20">
        <div className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-csir-green">
          <Users className="text-csir-green mb-4 h-10 w-10" />
          <h3 className="text-xl font-bold mb-2">Equal Opportunity</h3>
          <p className="text-slate-600">Transparent recruitment process adhering to GoI reservation guidelines.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-csir-blue">
          <Award className="text-csir-blue mb-4 h-10 w-10" />
          <h3 className="text-xl font-bold mb-2">Excellence</h3>
          <p className="text-slate-600">Join a premier lab known for cutting-edge structural engineering research.</p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border-b-4 border-csir-accent">
          <BookOpen className="text-csir-accent mb-4 h-10 w-10" />
          <h3 className="text-xl font-bold mb-2">Growth</h3>
          <p className="text-slate-600">Ample opportunities for higher education and professional development.</p>
        </div>
      </section>

      {/* Current Openings Preview */}
      <section className="max-w-7xl mx-auto px-4 w-full">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">Current Recruitment Drives</h2>
            <p className="text-slate-500 mt-2">Applications invited for the following posts</p>
          </div>
          <Link to="/posts" className="text-csir-blue font-semibold hover:underline flex items-center">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg border border-slate-200 hover:border-csir-blue hover:shadow-md transition-all p-6 group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${post.type === PostType.SCIENTIST ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                  {post.type}
                </span>
                <span className="text-green-600 text-xs font-bold px-2 py-1 bg-green-50 rounded">Active</span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 group-hover:text-csir-blue transition-colors mb-2">{post.title}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{post.description}</p>
              
              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <div className="flex items-center">
                  <Briefcase size={16} className="mr-2 text-slate-400" />
                  <span>{post.department}</span>
                </div>
                 <div className="flex items-center">
                  <Users size={16} className="mr-2 text-slate-400" />
                  <span>{post.vacancies} Vacancies</span>
                </div>
                <div className="flex items-center">
                  <Calendar size={16} className="mr-2 text-slate-400" />
                  <span className="text-red-600">Closing: {post.lastDate}</span>
                </div>
              </div>

              <Link to={`/apply/${post.id}`} className="block w-full text-center py-2 border border-csir-blue text-csir-blue rounded hover:bg-csir-blue hover:text-white transition-colors font-medium">
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Information Strip */}
      <section className="bg-slate-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Need Assistance?</h2>
          <p className="text-slate-600 mb-8">
            For technical queries regarding the online application portal, please contact our helpdesk.
            Check the FAQ section before raising a ticket.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-2 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 text-slate-700">Read Guidelines</button>
            <button className="px-6 py-2 bg-white border border-slate-300 rounded shadow-sm hover:bg-slate-50 text-slate-700">Contact Helpdesk</button>
          </div>
        </div>
      </section>
    </div>
  );
};