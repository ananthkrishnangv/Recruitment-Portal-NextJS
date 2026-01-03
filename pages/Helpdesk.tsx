import React, { useState } from 'react';
import { useApplications } from '../context/ApplicationContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { User, TicketCategory, SupportTicket, TicketReply, UserRole } from '../types';
import { LifeBuoy, Mail, AlertCircle, CheckCircle, Upload, X, FileText, Send, User as UserIcon, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePosts } from '../context/PostContext';
import { useHelpdesk } from '../context/HelpdeskContext';

interface HelpdeskProps {
  user: User | null;
}

const CATEGORIES: TicketCategory[] = ['Application Issue', 'Document Upload', 'Photo Upload', 'PDF Download', 'Payment', 'Other'];

export const Helpdesk: React.FC<HelpdeskProps> = ({ user }) => {
  const { getUserApplications } = useApplications();
  const { config } = useSiteConfig();
  const { posts } = usePosts();
  const { tickets, createTicket, getTicketsByUser, replyToTicket } = useHelpdesk();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('list');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState<{
    appId: string;
    postId: string;
    category: TicketCategory;
    subject: string;
    message: string;
    attachment: File | null;
  }>({ appId: '', postId: '', category: 'Other', subject: '', message: '', attachment: null });
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [lastTicketId, setLastTicketId] = useState('');

  if (!user) {
      return (
          <div className="max-w-4xl mx-auto py-20 px-4 text-center">
              <div className="bg-white p-10 rounded-xl shadow-lg border border-slate-200">
                  <LifeBuoy className="w-16 h-16 text-csir-blue mx-auto mb-4" />
                  <h1 className="text-2xl font-bold text-slate-800 mb-2">Technical Helpdesk</h1>
                  <p className="text-slate-600 mb-6">Please login to access the ticketing system.</p>
                  <button onClick={() => navigate('/login')} className="px-6 py-2 bg-csir-blue text-white rounded hover:bg-blue-900">Login to Continue</button>
              </div>
          </div>
      );
  }

  const userApps = getUserApplications(user.aadhaar);
  const myTickets = getTicketsByUser(user.aadhaar);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
      setFormData({...formData, attachment: e.target.files[0]});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) return;

    createTicket(user, formData);
    
    // Reset and Switch view
    setIsSubmitted(true);
    setFormData({ appId: '', postId: '', category: 'Other', subject: '', message: '', attachment: null });
  };

  const handleReply = () => {
      if(!selectedTicket || !replyMessage.trim()) return;
      replyToTicket(selectedTicket.id, user, replyMessage);
      setReplyMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
       <div className="flex items-center justify-between mb-8">
           <div className="flex items-center">
             <div className="bg-csir-light p-3 rounded-full mr-4">
               <LifeBuoy className="text-csir-blue w-8 h-8" />
             </div>
             <div>
               <h1 className="text-3xl font-bold text-slate-800">Support & Helpdesk</h1>
               <p className="text-slate-500">Manage your queries and get support</p>
             </div>
           </div>
           
           <div className="flex space-x-2 bg-white p-1 rounded-lg border border-slate-200">
               <button 
                  onClick={() => {setActiveTab('list'); setSelectedTicket(null);}} 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'list' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                   My Tickets
               </button>
               <button 
                  onClick={() => setActiveTab('create')} 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-csir-blue text-white' : 'text-slate-600 hover:bg-slate-50'}`}
               >
                   + Raise Ticket
               </button>
           </div>
       </div>

       {/* CREATE TICKET VIEW */}
       {activeTab === 'create' && (
         isSubmitted ? (
            <div className="max-w-2xl mx-auto py-20 px-4 text-center animate-fadeIn">
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 shadow-sm">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Ticket Raised Successfully</h2>
                    <p className="text-green-700 mb-6">
                        Your query has been recorded. You can track status in the "My Tickets" tab.
                    </p>
                    <button onClick={() => { setIsSubmitted(false); setActiveTab('list'); }} className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition">View My Tickets</button>
                </div>
            </div>
         ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2">
                 <div className="bg-white rounded-lg shadow-md border border-slate-200 p-8">
                     <h2 className="text-xl font-semibold mb-6 border-b pb-2 text-slate-700">New Ticket Details</h2>
                     <form onSubmit={handleSubmit} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-1">Issue Category <span className="text-red-500">*</span></label>
                                 <select 
                                   className="w-full border p-2.5 rounded-lg text-sm focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none bg-slate-50"
                                   value={formData.category}
                                   onChange={(e) => setFormData({...formData, category: e.target.value as TicketCategory})}
                                 >
                                     {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                 </select>
                             </div>
                             
                             <div>
                                 <label className="block text-sm font-bold text-slate-700 mb-1">Related Application</label>
                                 <select 
                                   className="w-full border p-2.5 rounded-lg text-sm focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none bg-slate-50"
                                   value={formData.appId}
                                   onChange={(e) => {
                                       const app = userApps.find(a => a.applicationNumber === e.target.value);
                                       setFormData({...formData, appId: e.target.value, postId: app?.postId || ''});
                                   }}
                                 >
                                     <option value="">-- Select Application (if any) --</option>
                                     {userApps.map(app => (
                                         <option key={app.applicationNumber} value={app.applicationNumber}>
                                             {app.applicationNumber} - {app.postTitle}
                                         </option>
                                     ))}
                                 </select>
                             </div>
                         </div>
                         
                         {/* Fallback to select post manually if no app selected */}
                         {!formData.appId && (
                           <div>
                               <label className="block text-sm font-bold text-slate-700 mb-1">Related Post (If application not yet submitted)</label>
                               <select 
                                 className="w-full border p-2.5 rounded-lg text-sm focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none bg-slate-50"
                                 value={formData.postId}
                                 onChange={(e) => setFormData({...formData, postId: e.target.value})}
                               >
                                   <option value="">-- Select Post --</option>
                                   {posts.map(post => (
                                       <option key={post.id} value={post.id}>
                                           {post.code} - {post.title}
                                       </option>
                                   ))}
                               </select>
                           </div>
                         )}

                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">Subject <span className="text-red-500">*</span></label>
                             <input 
                               type="text" 
                               className="w-full border p-2.5 rounded-lg text-sm focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none"
                               placeholder="Brief description of the issue"
                               value={formData.subject}
                               onChange={(e) => setFormData({...formData, subject: e.target.value})}
                               required
                             />
                         </div>

                         <div>
                             <label className="block text-sm font-bold text-slate-700 mb-1">Message Details <span className="text-red-500">*</span></label>
                             <textarea 
                               className="w-full border p-2.5 rounded-lg text-sm focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none min-h-[120px]"
                               placeholder="Describe your issue in detail..."
                               value={formData.message}
                               onChange={(e) => setFormData({...formData, message: e.target.value})}
                               required
                             />
                         </div>
                         
                         <button type="submit" className="w-full bg-gradient-to-r from-csir-blue to-blue-800 text-white py-3 rounded-lg hover:shadow-lg transition font-bold flex justify-center items-center">
                             <Mail size={18} className="mr-2" /> Generate Ticket
                         </button>
                     </form>
                 </div>
             </div>
             
             {/* Sidebar Info */}
             <div>
                 <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg p-6 border border-slate-200 shadow-sm sticky top-28">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center text-lg"><AlertCircle size={20} className="mr-2 text-csir-accent"/> Help Center</h3>
                     <div className="space-y-4 text-sm text-slate-600">
                         <div className="bg-blue-50 p-3 rounded border border-blue-100">
                             <p className="font-semibold text-csir-blue mb-1">Response Time</p>
                             <p>Tickets are usually responded to within 24-48 working hours.</p>
                         </div>
                         <ul className="space-y-2 list-disc pl-4 marker:text-csir-accent">
                             <li>Check FAQ before raising.</li>
                             <li>Provide accurate screenshots if possible.</li>
                             <li>Status updates will be sent via SMS/Email.</li>
                         </ul>
                     </div>
                 </div>
             </div>
           </div>
         )
       )}

       {/* TICKET LIST VIEW */}
       {activeTab === 'list' && (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
               {/* Left: List of Tickets */}
               <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                   <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                       My Tickets ({myTickets.length})
                   </div>
                   <div className="overflow-y-auto flex-1 p-2 space-y-2">
                       {myTickets.length === 0 ? (
                           <div className="text-center py-10 text-slate-400 text-sm">No tickets found.</div>
                       ) : (
                           myTickets.map(t => (
                               <div 
                                 key={t.id} 
                                 onClick={() => setSelectedTicket(t)}
                                 className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-sm ${selectedTicket?.id === t.id ? 'bg-blue-50 border-csir-blue' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                               >
                                   <div className="flex justify-between mb-1">
                                       <span className="font-bold text-xs text-slate-600">{t.id}</span>
                                       <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${t.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{t.status}</span>
                                   </div>
                                   <h4 className="font-semibold text-sm text-slate-800 line-clamp-1">{t.subject}</h4>
                                   <p className="text-xs text-slate-500 mt-1">{t.category}</p>
                                   <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(t.createdAt).toLocaleDateString()}</p>
                               </div>
                           ))
                       )}
                   </div>
               </div>

               {/* Right: Conversation Detail */}
               <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                   {selectedTicket ? (
                       <>
                           <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
                               <div>
                                   <h3 className="font-bold text-lg text-slate-800">{selectedTicket.subject}</h3>
                                   <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                                       <span>Ticket ID: {selectedTicket.id}</span>
                                       <span>•</span>
                                       <span>{selectedTicket.category}</span>
                                       {selectedTicket.applicationNumber && <span>• App ID: {selectedTicket.applicationNumber}</span>}
                                   </div>
                               </div>
                               <span className={`px-3 py-1 rounded text-xs font-bold ${selectedTicket.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                   {selectedTicket.status}
                               </span>
                           </div>

                           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                               {/* Initial Description */}
                               <div className="flex flex-col space-y-1">
                                   <div className="flex items-end space-x-2">
                                       <div className="bg-blue-100 p-2 rounded-full"><UserIcon size={16} className="text-blue-700"/></div>
                                       <div className="bg-white p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-slate-200 shadow-sm max-w-[80%]">
                                           <p className="text-sm text-slate-800 whitespace-pre-line">{selectedTicket.description}</p>
                                       </div>
                                   </div>
                                   <span className="text-[10px] text-slate-400 ml-12">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                               </div>

                               {/* Replies */}
                               {selectedTicket.replies.map((reply) => (
                                   <div key={reply.id} className={`flex flex-col space-y-1 ${reply.role !== UserRole.APPLICANT ? 'items-end' : 'items-start'}`}>
                                       <div className={`flex items-end space-x-2 ${reply.role !== UserRole.APPLICANT ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                           <div className={`p-2 rounded-full ${reply.role !== UserRole.APPLICANT ? 'bg-amber-100' : 'bg-blue-100'}`}>
                                               {reply.role !== UserRole.APPLICANT ? <Shield size={16} className="text-amber-700"/> : <UserIcon size={16} className="text-blue-700"/>}
                                           </div>
                                           <div className={`p-3 rounded-xl border shadow-sm max-w-[80%] ${
                                               reply.role !== UserRole.APPLICANT 
                                               ? 'bg-amber-50 border-amber-100 rounded-tl-xl rounded-bl-xl rounded-br-none' 
                                               : 'bg-white border-slate-200 rounded-tr-xl rounded-br-xl rounded-bl-none'
                                           }`}>
                                               <p className="text-xs font-bold mb-1 text-slate-500">{reply.senderName} ({reply.role})</p>
                                               <p className="text-sm text-slate-800 whitespace-pre-line">{reply.message}</p>
                                           </div>
                                       </div>
                                       <span className={`text-[10px] text-slate-400 ${reply.role !== UserRole.APPLICANT ? 'mr-12' : 'ml-12'}`}>{new Date(reply.timestamp).toLocaleString()}</span>
                                   </div>
                               ))}
                           </div>

                           <div className="p-4 border-t border-slate-200 bg-white">
                               {selectedTicket.status === 'RESOLVED' ? (
                                   <div className="text-center text-sm text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                                       This ticket has been resolved. Please raise a new ticket for further queries.
                                   </div>
                               ) : (
                                   <div className="flex items-center space-x-2">
                                       <input 
                                         type="text" 
                                         className="flex-1 border border-slate-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-csir-blue focus:ring-1 focus:ring-csir-blue"
                                         placeholder="Type your reply..."
                                         value={replyMessage}
                                         onChange={(e) => setReplyMessage(e.target.value)}
                                         onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                                       />
                                       <button 
                                          onClick={handleReply}
                                          disabled={!replyMessage.trim()}
                                          className="p-2 bg-csir-blue text-white rounded-full hover:bg-blue-800 disabled:opacity-50 transition"
                                       >
                                           <Send size={18} />
                                       </button>
                                   </div>
                               )}
                           </div>
                       </>
                   ) : (
                       <div className="flex flex-col items-center justify-center h-full text-slate-400">
                           <LifeBuoy size={48} className="mb-4 opacity-50"/>
                           <p>Select a ticket to view details</p>
                       </div>
                   )}
               </div>
           </div>
       )}
    </div>
  );
};