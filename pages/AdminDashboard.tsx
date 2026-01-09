
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Settings, Mail, Plus, Lock, Send, Briefcase, Filter, Download, Archive, Package, Edit3, Trash2, X, Search, Eye, Smartphone, Database, Megaphone, Share2, LayoutDashboard, ClipboardList, Activity, LifeBuoy, MoreVertical, TrendingUp, ArrowUpRight, Rocket, Save, RefreshCw, MessageCircle } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { usePosts } from '../context/PostContext';
import { useApplications } from '../context/ApplicationContext';
import { useHelpdesk } from '../context/HelpdeskContext';
import { useNotifications } from '../context/NotificationContext';
import { User, UserRole, PostStatus, ApplicationStatus, JobPost, PostType, CustomField, FieldType, SupportTicket } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

interface AdminDashboardProps {
  users?: User[];
  updateUser?: (user: User) => void;
  currentUser?: User;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; colorClass: string; trend?: string }> = ({ title, value, icon, colorClass, trend }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${colorClass} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      {trend && (
        <span className="flex items-center text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
          <ArrowUpRight size={12} className="mr-1"/> {trend}
        </span>
      )}
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-4xl font-heading font-black text-slate-900 tracking-tighter">{value}</p>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, updateUser, currentUser }) => {
  const { posts, updatePost, addPost } = usePosts();
  const { applications, updateApplicationStatus, bulkUpdateStatus } = useApplications();
  const { tickets, resolveTicket, replyToTicket } = useHelpdesk();
  const { sendWhatsApp, sendSMS, sendEmail } = useNotifications();
  const { config, updateConfig } = useSiteConfig();
  
  const [activeTab, setActiveTab] = useState<'analytics'|'posts'|'scrutiny'|'results'|'outreach'|'helpdesk'|'applicants'|'settings'>('analytics');
  const [selectedPostId, setSelectedPostId] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [hoverTicketId, setHoverTicketId] = useState<string | null>(null);
  const [quickReplyMsg, setQuickReplyMsg] = useState('');
  
  // Outreach State
  const [outreachMessage, setOutreachMessage] = useState('');
  const [outreachChannels, setOutreachChannels] = useState<{email: boolean, whatsapp: boolean, telegram: boolean}>({ email: true, whatsapp: false, telegram: false });

  // Settings State
  const [settingsForm, setSettingsForm] = useState(config);

  const isAO = currentUser?.role === UserRole.SUPERVISOR;
  const isDirector = currentUser?.role === UserRole.DIRECTOR;
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isDirector) setActiveTab('analytics');
    else if (isAO) setActiveTab('scrutiny');
  }, [isDirector, isAO]);

  const handlePushToDirector = (phase: 'shortlist' | 'final') => {
    if (!selectedPostId) return;
    const post = posts.find(p => p.id === selectedPostId);
    if (post) {
        const nextStatus = phase === 'shortlist' ? PostStatus.PENDING_SHORTLIST_APPROVAL : PostStatus.PENDING_FINAL_APPROVAL;
        updatePost({ ...post, status: nextStatus });
        alert(`Strategic push dispatched to Director for ${phase} review.`);
    }
  };

  const handleOutreachSend = () => {
    if(!outreachMessage.trim()) return alert("Message body empty.");
    if(selectedAppIds.length === 0) return alert("No recipients selected.");

    const apps = applications.filter(a => selectedAppIds.includes(a.applicationNumber!));
    
    apps.forEach(app => {
        const mobile = app.personalDetails.mobile;
        const email = "applicant@example.com"; // In real scenario, fetch from User table
        
        if(outreachChannels.whatsapp) sendWhatsApp(mobile, outreachMessage);
        if(outreachChannels.email) sendEmail(email, "CSIR-SERC Notification", outreachMessage);
        // Telegram logic would go here
    });
    alert(`Broadcast sent to ${apps.length} candidates via [${Object.keys(outreachChannels).filter(k => (outreachChannels as any)[k]).join(', ')}]`);
    setOutreachMessage('');
  };

  const handleQuickReply = (ticketId: string) => {
      if(!quickReplyMsg.trim()) return;
      // In a real app we need the User object. Assuming 'currentUser' is available and valid.
      if(currentUser) {
          replyToTicket(ticketId, currentUser, quickReplyMsg);
          setQuickReplyMsg('');
          setHoverTicketId(null);
          alert("Reply sent instantly!");
      }
  };

  const handleBackup = (type: 'DB' | 'DOCS' | 'FULL') => {
      alert(`Initiating ${type} Backup sequence...`);
      setTimeout(() => {
          alert(`Backup Successful! \nFile: csir_backup_${type.toLowerCase()}_${new Date().toISOString().slice(0,10)}.zip`);
      }, 2000);
  };

  const saveSettings = () => {
      updateConfig(settingsForm);
      alert("System Configuration Updated Successfully.");
  };

  // Mock data for charts
  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 1200 },
  ];

  const sidebarItems = [
    { id: 'analytics', label: 'Overview', icon: <LayoutDashboard size={18}/>, roles: [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.DIRECTOR] },
    { id: 'posts', label: 'Job Drives', icon: <Briefcase size={18}/>, roles: [UserRole.ADMIN, UserRole.SUPERVISOR] },
    { id: 'scrutiny', label: 'Scrutiny Board', icon: <ClipboardList size={18}/>, roles: [UserRole.SUPERVISOR] },
    { id: 'results', label: 'Testing Center', icon: <Activity size={18}/>, roles: [UserRole.SUPERVISOR] },
    { id: 'outreach', label: 'Outreach', icon: <Megaphone size={18}/>, roles: [UserRole.SUPERVISOR] },
    { id: 'helpdesk', label: 'Help Center', icon: <LifeBuoy size={18}/>, roles: [UserRole.SUPERVISOR] },
    { id: 'applicants', label: 'Candidate Pool', icon: <Users size={18}/>, roles: [UserRole.ADMIN] },
    { id: 'settings', label: 'System Config', icon: <Settings size={18}/>, roles: [UserRole.ADMIN] }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50/50">
      {/* Dashboard Sidebar */}
      <aside className="w-full lg:w-72 bg-white border-r border-slate-200 p-6 flex flex-col z-40">
        <div className="flex items-center px-4 mb-10">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-100 mr-4">
             <Rocket size={20} />
          </div>
          <div className="flex flex-col">
             <span className="font-heading font-black text-slate-900 uppercase text-xs tracking-widest">Command Node</span>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">v4.0.2 Stable</span>
          </div>
        </div>

        <nav className="space-y-2 flex-grow">
          {sidebarItems.filter(item => item.roles.includes(currentUser?.role as UserRole)).map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center px-4 py-3 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span className={`mr-3 ${activeTab === item.id ? 'text-brand-400' : 'text-slate-300'}`}>
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-10 p-5 bg-slate-50 rounded-3xl border border-slate-100">
           <div className="flex items-center mb-3">
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-black shadow-sm mr-3">
                 {currentUser?.name.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                 <span className="text-xs font-black text-slate-900 truncate">{currentUser?.name}</span>
                 <span className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest">{currentUser?.role}</span>
              </div>
           </div>
           <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-brand-500"></div>
           </div>
        </div>
      </aside>

      {/* Main Dashboard Workspace */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
           <div>
              <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Administrative Terminal</h1>
              <p className="text-slate-500 font-medium mt-1 uppercase text-[10px] tracking-[0.3em]">Institutional Recruitment Core Infrastructure</p>
           </div>
           <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></div> Secure Link Node 02 Active
              </div>
           </div>
        </header>

        {activeTab === 'analytics' && (
          <div className="space-y-10 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Registries" value={applications.length.toString()} icon={<Users size={22}/>} colorClass="bg-blue-50 text-blue-600" trend="+12.5%" />
              <StatCard title="Scrutiny Queue" value={applications.filter(a => a.status === ApplicationStatus.UNDER_SCRUTINY).length.toString()} icon={<FileText size={22}/>} colorClass="bg-amber-50 text-amber-600" />
              <StatCard title="Authorized" value={applications.filter(a => a.status === ApplicationStatus.SELECTED).length.toString()} icon={<CheckCircle size={22}/>} colorClass="bg-emerald-50 text-emerald-600" trend="+4.1%" />
              <StatCard title="Active Projects" value={posts.filter(p => p.status === PostStatus.PUBLISHED).length.toString()} icon={<TrendingUp size={22}/>} colorClass="bg-indigo-50 text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="font-heading font-black text-slate-900 text-xl tracking-tight">Registration Frequency</h3>
                     <select className="bg-slate-50 border-0 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl text-slate-500">
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                     </select>
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-brand-500/20 rounded-full blur-[80px]"></div>
                  <div className="relative z-10">
                    <h3 className="font-heading font-black text-xl mb-4 tracking-tight">System Export</h3>
                    <p className="text-white/60 text-sm font-medium mb-8 leading-relaxed">Commit and download full institutional datasets including all candidate artifacts and academic registries.</p>
                  </div>
                  <div className="space-y-4 relative z-10">
                     {posts.slice(0, 2).map(p => (
                       <button key={p.id} onClick={() => alert('Generating package for ' + p.code)} className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-between transition-all border border-white/10 group">
                          <div className="flex items-center text-left">
                             <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                <Archive size={18} className="text-brand-400" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-bold truncate w-32">{p.title}</span>
                                <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{p.code}</span>
                             </div>
                          </div>
                          <Download size={16} className="text-white/40 group-hover:text-white" />
                       </button>
                     ))}
                     <button className="w-full py-4 text-brand-400 text-xs font-black uppercase tracking-widest hover:text-brand-300 transition-colors">Manage All Datasets</button>
                  </div>
               </div>
            </div>
          </div>
        )}

        {/* OUTREACH TAB */}
        {activeTab === 'outreach' && (
           <div className="space-y-8 animate-fadeIn">
               <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                   <h2 className="text-2xl font-heading font-black text-slate-900 mb-6">Communication Hub</h2>
                   
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                       <div className="space-y-6">
                           <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Target Audience</label>
                               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                                   <select 
                                        className="w-full bg-transparent border-none text-sm font-bold focus:ring-0"
                                        value={selectedPostId}
                                        onChange={(e) => setSelectedPostId(e.target.value)}
                                   >
                                       <option value="">Select Recruitment Drive...</option>
                                       {posts.map(p => <option key={p.id} value={p.id}>{p.code} - {p.title}</option>)}
                                   </select>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 max-h-60 overflow-y-auto">
                                    {applications.filter(a => !selectedPostId || a.postId === selectedPostId).map(app => (
                                        <div key={app.applicationNumber} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                                            <div className="flex items-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="rounded text-brand-600 mr-3"
                                                    checked={selectedAppIds.includes(app.applicationNumber!)}
                                                    onChange={(e) => e.target.checked ? setSelectedAppIds([...selectedAppIds, app.applicationNumber!]) : setSelectedAppIds(selectedAppIds.filter(id => id !== app.applicationNumber!))}
                                                />
                                                <div>
                                                    <p className="text-xs font-bold text-slate-800">{app.personalDetails.fullName}</p>
                                                    <p className="text-[10px] text-slate-500">{app.applicationNumber}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] bg-white px-2 py-1 rounded border">{app.status}</span>
                                        </div>
                                    ))}
                                    {applications.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No candidates found.</p>}
                               </div>
                               <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs font-bold text-brand-600">{selectedAppIds.length} Recipients Selected</p>
                                    <button onClick={() => setSelectedAppIds(applications.filter(a => !selectedPostId || a.postId === selectedPostId).map(a => a.applicationNumber!))} className="text-[10px] font-black uppercase text-slate-400 hover:text-brand-600">Select All</button>
                               </div>
                           </div>
                       </div>

                       <div className="space-y-6">
                           <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Transmission Channels</label>
                               <div className="flex gap-4">
                                   {['email', 'whatsapp', 'telegram'].map(channel => (
                                       <button 
                                            key={channel}
                                            onClick={() => setOutreachChannels({...outreachChannels, [channel]: !outreachChannels[channel as keyof typeof outreachChannels]})}
                                            className={`flex-1 py-3 rounded-xl border-2 text-xs font-black uppercase tracking-widest flex items-center justify-center transition-all ${
                                                outreachChannels[channel as keyof typeof outreachChannels] 
                                                ? 'border-brand-600 bg-brand-50 text-brand-700' 
                                                : 'border-slate-200 text-slate-400 hover:border-slate-300'
                                            }`}
                                       >
                                           {channel === 'email' && <Mail size={16} className="mr-2"/>}
                                           {channel === 'whatsapp' && <MessageCircle size={16} className="mr-2"/>}
                                           {channel === 'telegram' && <Send size={16} className="mr-2"/>}
                                           {channel}
                                       </button>
                                   ))}
                               </div>
                           </div>
                           
                           <div>
                               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Message Body</label>
                               <textarea 
                                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-brand-500/20 outline-none h-40 resize-none"
                                    placeholder="Type your notification here..."
                                    value={outreachMessage}
                                    onChange={(e) => setOutreachMessage(e.target.value)}
                               />
                           </div>

                           <button 
                                onClick={handleOutreachSend}
                                disabled={selectedAppIds.length === 0}
                                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-slate-200"
                            >
                               Dispatch Broadcast
                           </button>
                       </div>
                   </div>
               </div>
           </div>
        )}

        {/* HELPDESK TAB */}
        {activeTab === 'helpdesk' && (
           <div className="space-y-8 animate-fadeIn">
               <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                   <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                       <h2 className="text-2xl font-heading font-black text-slate-900">Support Tickets</h2>
                       <div className="flex gap-2">
                           <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100">{tickets.filter(t => t.status === 'OPEN').length} Open</span>
                           <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold border border-green-100">{tickets.filter(t => t.status === 'RESOLVED').length} Resolved</span>
                       </div>
                   </div>
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <tr>
                               <th className="px-8 py-4">Ticket ID</th>
                               <th className="px-8 py-4">User</th>
                               <th className="px-8 py-4">Category</th>
                               <th className="px-8 py-4">Subject</th>
                               <th className="px-8 py-4">Status</th>
                               <th className="px-8 py-4 text-right">Action</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                           {tickets.map(ticket => (
                               <tr key={ticket.id} className="hover:bg-slate-50/50 group relative">
                                   <td className="px-8 py-4 font-mono font-bold text-slate-600">{ticket.id}</td>
                                   <td className="px-8 py-4 font-bold text-slate-800">{ticket.userName}</td>
                                   <td className="px-8 py-4">{ticket.category}</td>
                                   <td className="px-8 py-4">
                                       <span 
                                            className="cursor-pointer border-b border-dashed border-slate-300 hover:border-brand-500 hover:text-brand-600 transition-colors"
                                            onMouseEnter={() => setHoverTicketId(ticket.id)}
                                       >
                                           {ticket.subject}
                                       </span>
                                       
                                       {/* HOVER POPUP FOR QUICK REPLY */}
                                       {hoverTicketId === ticket.id && (
                                           <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-6 animate-fadeIn" onMouseLeave={() => setHoverTicketId(null)}>
                                               <div className="mb-4">
                                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Description</p>
                                                   <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-32 overflow-y-auto">{ticket.description}</p>
                                               </div>
                                               <textarea 
                                                    className="w-full p-3 border border-slate-200 rounded-xl text-xs mb-3 focus:border-brand-500 outline-none"
                                                    placeholder="Quick Reply..."
                                                    value={quickReplyMsg}
                                                    onChange={(e) => setQuickReplyMsg(e.target.value)}
                                               />
                                               <div className="flex justify-between items-center">
                                                    <button onClick={() => setHoverTicketId(null)} className="text-xs font-bold text-slate-400 hover:text-slate-600">Close</button>
                                                    <button onClick={() => handleQuickReply(ticket.id)} className="px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-brand-700">Send Reply</button>
                                               </div>
                                           </div>
                                       )}
                                   </td>
                                   <td className="px-8 py-4"><span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${ticket.status === 'OPEN' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{ticket.status}</span></td>
                                   <td className="px-8 py-4 text-right">
                                       <button className="text-brand-600 font-bold text-xs hover:underline">Manage</button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
               </div>
           </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && isAdmin && (
            <div className="space-y-8 animate-fadeIn">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                        <h2 className="text-2xl font-heading font-black text-slate-900">System Configuration</h2>
                        <button onClick={saveSettings} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 shadow-lg shadow-slate-200 flex items-center">
                            <Save size={16} className="mr-2"/> Save Changes
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Branding */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center"><Rocket size={16} className="mr-2 text-brand-500"/> Portal Branding</h3>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Organization Name</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={settingsForm.header.organizationName} onChange={(e) => setSettingsForm({...settingsForm, header: {...settingsForm.header, organizationName: e.target.value}})} />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Logo URL</label>
                                <div className="flex gap-2">
                                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={settingsForm.header.logoUrl} onChange={(e) => setSettingsForm({...settingsForm, header: {...settingsForm.header, logoUrl: e.target.value}})} />
                                    <div className="w-12 h-12 bg-slate-100 rounded-lg border border-slate-200 p-1 flex items-center justify-center"><img src={settingsForm.header.logoUrl} className="max-w-full max-h-full"/></div>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Banner Image URL</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={settingsForm.landing.bannerUrl} onChange={(e) => setSettingsForm({...settingsForm, landing: {...settingsForm.landing, bannerUrl: e.target.value}})} />
                            </div>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center"><Megaphone size={16} className="mr-2 text-brand-500"/> Notification Gateways</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border-2 cursor-pointer ${settingsForm.notifications.whatsappEnabled ? 'border-green-500 bg-green-50' : 'border-slate-200'}`} onClick={() => setSettingsForm({...settingsForm, notifications: {...settingsForm.notifications, whatsappEnabled: !settingsForm.notifications.whatsappEnabled}})}>
                                    <p className="font-bold text-xs">WhatsApp API</p>
                                    <p className="text-[10px] text-slate-500">{settingsForm.notifications.whatsappEnabled ? 'Enabled' : 'Disabled'}</p>
                                </div>
                                <div className={`p-4 rounded-xl border-2 cursor-pointer ${settingsForm.notifications.telegramEnabled ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`} onClick={() => setSettingsForm({...settingsForm, notifications: {...settingsForm.notifications, telegramEnabled: !settingsForm.notifications.telegramEnabled}})}>
                                    <p className="font-bold text-xs">Telegram Bot</p>
                                    <p className="text-[10px] text-slate-500">{settingsForm.notifications.telegramEnabled ? 'Enabled' : 'Disabled'}</p>
                                </div>
                            </div>
                            {settingsForm.notifications.whatsappEnabled && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">WhatsApp Access Token</label>
                                    <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={settingsForm.notifications.whatsapp.accessToken} onChange={(e) => setSettingsForm({...settingsForm, notifications: {...settingsForm.notifications, whatsapp: {...settingsForm.notifications.whatsapp, accessToken: e.target.value}}})} />
                                </div>
                            )}
                             {settingsForm.notifications.telegramEnabled && (
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Telegram Bot Token</label>
                                    <input type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={settingsForm.notifications.telegram.botToken} onChange={(e) => setSettingsForm({...settingsForm, notifications: {...settingsForm.notifications, telegram: {...settingsForm.notifications.telegram, botToken: e.target.value}}})} />
                                </div>
                            )}
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">SMTP Host</label>
                                <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" value={settingsForm.smtp.host} onChange={(e) => setSettingsForm({...settingsForm, smtp: {...settingsForm.smtp, host: e.target.value}})} />
                            </div>
                        </div>

                        {/* Backups */}
                        <div className="md:col-span-2 space-y-6 pt-6 border-t border-slate-100">
                             <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center"><Database size={16} className="mr-2 text-brand-500"/> Backup & Retention</h3>
                             <div className="flex gap-4">
                                 <button onClick={() => handleBackup('DB')} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-brand-300 transition-all text-left group">
                                     <Database className="text-slate-400 group-hover:text-brand-500 mb-2" size={24} />
                                     <p className="font-bold text-sm text-slate-800">SQL Dump</p>
                                     <p className="text-[10px] text-slate-500">Full database schema & data</p>
                                 </button>
                                 <button onClick={() => handleBackup('DOCS')} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-brand-300 transition-all text-left group">
                                     <FileText className="text-slate-400 group-hover:text-brand-500 mb-2" size={24} />
                                     <p className="font-bold text-sm text-slate-800">Artifacts Zip</p>
                                     <p className="text-[10px] text-slate-500">Photos, Signatures, PDFs</p>
                                 </button>
                                 <button onClick={() => handleBackup('FULL')} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 hover:border-brand-300 transition-all text-left group">
                                     <Package className="text-slate-400 group-hover:text-brand-500 mb-2" size={24} />
                                     <p className="font-bold text-sm text-slate-800">Full System Snapshot</p>
                                     <p className="text-[10px] text-slate-500">Code + DB + Assets</p>
                                 </button>
                             </div>
                             <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-xl">
                                 <div>
                                     <p className="font-bold text-sm">Automated Schedule</p>
                                     <p className="text-[10px] text-slate-400">Frequency: {settingsForm.backups.frequency}</p>
                                 </div>
                                 <select 
                                    className="bg-slate-800 border border-slate-700 text-xs font-bold rounded-lg p-2"
                                    value={settingsForm.backups.frequency}
                                    onChange={(e) => setSettingsForm({...settingsForm, backups: {...settingsForm.backups, frequency: e.target.value as any}})}
                                 >
                                     <option value="DAILY">Daily (02:00 AM)</option>
                                     <option value="WEEKLY">Weekly (Sun 03:00 AM)</option>
                                     <option value="MONTHLY">Monthly (1st)</option>
                                 </select>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* RECRUITMENT DRIVES TAB (Existing Logic) */}
        {activeTab === 'posts' && (
          <div className="space-y-8 animate-fadeIn">
            {/* ... Existing Post List Code ... */}
             <div className="bg-white p-4 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="flex items-center flex-1 px-4">
                  <Search size={18} className="text-slate-300 mr-3" />
                  <input type="text" placeholder="Filter active drives..." className="bg-transparent border-0 focus:ring-0 text-sm font-bold text-slate-700 placeholder-slate-300 w-full" />
               </div>
               <button className="bg-brand-600 text-white px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all flex items-center active:scale-95">
                  <Plus size={18} className="mr-2" /> New Drive initiation
               </button>
            </div>
            {/* Added just one item to render for context */}
             <div className="grid grid-cols-1 gap-6">
              {posts.map(post => (
                <div key={post.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                  <div className="flex flex-col md:flex-row items-center p-2">
                    <div className="p-8 flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-lg">
                          {post.code}
                        </span>
                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest bg-brand-50 px-2 py-1 rounded-lg border border-brand-100">
                          {post.status}
                        </span>
                      </div>
                      <h4 className="text-2xl font-heading font-black text-slate-900 group-hover:text-brand-600 transition-colors mb-2">{post.title}</h4>
                      <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{post.department} • Total Vacancies: {post.vacancies}</p>
                    </div>

                    <div className="bg-slate-50 md:bg-transparent p-6 md:p-8 flex items-center space-x-2">
                       <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-brand-600 hover:border-brand-200 hover:shadow-lg transition-all active:scale-90" title="Edit Drive">
                          <Edit3 size={20}/>
                       </button>
                       <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:shadow-lg transition-all active:scale-90" title="View Statistics">
                          <Activity size={20}/>
                       </button>
                       <button className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-600 hover:border-red-200 hover:shadow-lg transition-all active:scale-90" title="Deactivate">
                          <Trash2 size={20}/>
                       </button>
                       <div className="px-2">
                          <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all active:scale-90">
                             <MoreVertical size={20}/>
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
