import React, { useState, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckCircle, Settings, Mail, Plus, Lock, UserCog, Server, Send, Printer, Shield, Briefcase, LifeBuoy, Filter, Download, FileSpreadsheet, AlertTriangle, Upload, Eye, MessageCircle, Share2, ClipboardList, Megaphone, Trash2, Image as ImageIcon, Link as LinkIcon, Edit3, X, TrendingUp, Activity, Camera, Save } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { usePosts } from '../context/PostContext';
import { useNotifications } from '../context/NotificationContext';
import { useHelpdesk } from '../context/HelpdeskContext';
import { useApplications } from '../context/ApplicationContext';
import { User, UserRole, PostStatus, ApplicationStatus, SupportTicket, NewsItem, JobPost, PostType, CustomField, FieldType } from '../types';

interface AdminDashboardProps {
  users?: User[];
  updateUser?: (user: User) => void;
  currentUser?: User;
}

// Fluent UI Colors & Data
const FLUENT_COLORS = ['#0078D4', '#00CC6A', '#FFB900', '#F7630C', '#8E8CD8', '#EF6950'];

// Custom Fluent Tooltip for Charts
const CustomFluentTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-3 border border-slate-200 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-slate-700 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; gradient: string }> = ({ title, value, icon, gradient }) => (
  <div className={`p-6 rounded-3xl shadow-lg text-white ${gradient} transform hover:scale-[1.02] transition-all border border-white/10 relative overflow-hidden group`}>
    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/10 to-transparent"></div>
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-xs font-bold uppercase opacity-90 tracking-widest mb-2 text-blue-50">{title}</p>
        <p className="text-5xl font-black tracking-tight drop-shadow-sm">{value}</p>
      </div>
      <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: "w-8 h-8 text-white" }) : icon}
      </div>
    </div>
  </div>
);

// --- POST CREATOR COMPONENT ---
const PostCreator: React.FC<{ onCancel: () => void, onSave: (post: JobPost) => void }> = ({ onCancel, onSave }) => {
  const [step, setStep] = useState(1);
  const [postData, setPostData] = useState<Partial<JobPost>>({
    id: Date.now().toString(),
    code: '', title: '', type: PostType.SCIENTIST, department: '',
    vacancies: 1, lastDate: '', description: '', status: PostStatus.DRAFT,
    customFields: []
  });

  // Custom Field State
  const [newField, setNewField] = useState<Partial<CustomField>>({
    id: '', label: '', type: FieldType.TEXT, required: false, options: [], placeholder: ''
  });
  const [fieldLogic, setFieldLogic] = useState<{ enabled: boolean, dependsOn: string, condition: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS', value: string }>({
    enabled: false, dependsOn: '', condition: 'EQUALS', value: ''
  });

  const addField = () => {
    if(!newField.label) return alert("Label is required");
    const field: CustomField = {
      id: `field_${Date.now()}`,
      label: newField.label!,
      type: newField.type || FieldType.TEXT,
      required: newField.required || false,
      placeholder: newField.placeholder,
      options: newField.options,
      logic: fieldLogic.enabled ? {
        dependsOnFieldId: fieldLogic.dependsOn,
        condition: fieldLogic.condition,
        value: fieldLogic.value
      } : undefined
    };
    setPostData({ ...postData, customFields: [...(postData.customFields || []), field] });
    setNewField({ label: '', type: FieldType.TEXT, required: false, options: [], placeholder: '' });
    setFieldLogic({ enabled: false, dependsOn: '', condition: 'EQUALS', value: '' });
  };

  const removeField = (id: string) => {
    setPostData({ ...postData, customFields: postData.customFields?.filter(f => f.id !== id) });
  };

  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl animate-fadeIn">
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <div>
            <h3 className="text-2xl font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">Create Recruitment Drive</h3>
            <p className="text-slate-500 text-sm">Configure job details and dynamic application form</p>
        </div>
        <button onClick={onCancel} className="p-2 bg-slate-100 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"><X size={20}/></button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Post Code</label><input type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={postData.code} onChange={e => setPostData({...postData, code: e.target.value})} placeholder="e.g. SCI-05-2024"/></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Post Title</label><input type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={postData.title} onChange={e => setPostData({...postData, title: e.target.value})} placeholder="e.g. Senior Scientist"/></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label><select className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={postData.type} onChange={e => setPostData({...postData, type: e.target.value as PostType})}>{Object.values(PostType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Department</label><input type="text" className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={postData.department} onChange={e => setPostData({...postData, department: e.target.value})} /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Vacancies</label><input type="number" className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={postData.vacancies} onChange={e => setPostData({...postData, vacancies: parseInt(e.target.value)})} /></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Last Date</label><input type="date" className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" value={postData.lastDate} onChange={e => setPostData({...postData, lastDate: e.target.value})} /></div>
        <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label><textarea className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" rows={3} value={postData.description} onChange={e => setPostData({...postData, description: e.target.value})} /></div>
      </div>

      <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 mb-8">
        <h4 className="font-bold text-slate-700 mb-4 flex items-center"><ListIcon className="mr-2 text-blue-600" size={18}/> Custom Form Fields & Logic</h4>
        
        {/* Field Builder */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
          <div><label className="text-xs font-bold text-slate-500">Label</label><input type="text" className="w-full p-2 border rounded-lg text-sm" value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})} placeholder="e.g. PhD Thesis Title"/></div>
          <div><label className="text-xs font-bold text-slate-500">Type</label><select className="w-full p-2 border rounded-lg text-sm" value={newField.type} onChange={e => setNewField({...newField, type: e.target.value as FieldType})}>{Object.values(FieldType).map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div className="flex items-center mb-2"><input type="checkbox" checked={newField.required} onChange={e => setNewField({...newField, required: e.target.checked})} className="mr-2 rounded text-blue-600"/><label className="text-sm font-semibold">Required</label></div>
        </div>

        {/* Dropdown Options */}
        {(newField.type === FieldType.DROPDOWN || newField.type === FieldType.RADIO) && (
             <div className="mb-4">
                 <label className="text-xs font-bold text-slate-500">Options (Comma separated)</label>
                 <input type="text" className="w-full p-2 border rounded-lg text-sm" placeholder="Option 1, Option 2, Option 3" onChange={e => setNewField({...newField, options: e.target.value.split(',').map(s => s.trim())})}/>
             </div>
        )}

        {/* Logic Builder */}
        <div className="bg-white p-4 rounded-xl border border-blue-100 mb-4 shadow-sm">
           <div className="flex items-center mb-3">
              <input type="checkbox" id="logicToggle" checked={fieldLogic.enabled} onChange={e => setFieldLogic({...fieldLogic, enabled: e.target.checked})} className="mr-2 rounded text-blue-600"/>
              <label htmlFor="logicToggle" className="text-sm font-bold text-blue-800">Enable Conditional Logic (Show this field if...)</label>
           </div>
           {fieldLogic.enabled && (
             <div className="grid grid-cols-3 gap-2">
                <select className="p-2 border rounded-lg text-sm bg-slate-50" value={fieldLogic.dependsOn} onChange={e => setFieldLogic({...fieldLogic, dependsOn: e.target.value})}>
                   <option value="">Select Field</option>
                   {postData.customFields?.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
                <select className="p-2 border rounded-lg text-sm bg-slate-50" value={fieldLogic.condition} onChange={e => setFieldLogic({...fieldLogic, condition: e.target.value as any})}>
                   <option value="EQUALS">Equals</option>
                   <option value="NOT_EQUALS">Not Equals</option>
                   <option value="CONTAINS">Contains</option>
                </select>
                <input type="text" className="p-2 border rounded-lg text-sm bg-slate-50" placeholder="Value..." value={fieldLogic.value} onChange={e => setFieldLogic({...fieldLogic, value: e.target.value})}/>
             </div>
           )}
        </div>

        <button onClick={addField} className="w-full py-2.5 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-black transition flex items-center justify-center"><Plus size={16} className="inline mr-2"/> Add Field to Form</button>

        {/* Field List */}
        <div className="mt-4 space-y-2">
          {postData.customFields?.map((f, i) => (
             <div key={f.id} className="flex justify-between items-center bg-white p-3 border border-slate-200 rounded-lg text-sm shadow-sm">
                <div>
                   <span className="font-bold text-slate-700">{i+1}. {f.label}</span> <span className="text-xs text-slate-400 font-mono ml-2 uppercase">[{f.type}]</span>
                   {f.logic && <div className="text-xs text-blue-600 mt-1 flex items-center"><Share2 size={12} className="mr-1"/> Shows if "{postData.customFields?.find(x => x.id === f.logic?.dependsOnFieldId)?.label}" {f.logic.condition} "{f.logic.value}"</div>}
                </div>
                <button onClick={() => removeField(f.id)} className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
             </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-slate-100">
         <button onClick={onCancel} className="px-6 py-2.5 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
         <button onClick={() => onSave(postData as JobPost)} className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">Create Recruitment Drive</button>
      </div>
    </div>
  );
};

function ListIcon(props: { className: string, size: number }) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, updateUser, currentUser }) => {
  const { posts, updatePost, addPost } = usePosts();
  const { applications, bulkUpdateStatus } = useApplications();
  const { notifyCandidates, sendWhatsApp, sendEmail } = useNotifications();
  const { tickets, replyToTicket, resolveTicket } = useHelpdesk();
  const { config, updateConfig } = useSiteConfig();
  
  const [activeTab, setActiveTab] = useState<'analytics'|'posts'|'scrutiny'|'approvals'|'results'|'communication'|'helpdesk'|'settings'|'applicants'>('analytics');
  
  // Post Management State
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Scrutiny State
  const [selectedPostId, setSelectedPostId] = useState('');
  const [scrutinyFilter, setScrutinyFilter] = useState('ALL');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  
  // Communication State
  const [commFile, setCommFile] = useState<File | null>(null);
  const [commMessage, setCommMessage] = useState('');
  
  // Helpdesk State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [adminReply, setAdminReply] = useState('');

  // News Ticker State
  const [newNewsText, setNewNewsText] = useState('');
  const [isNewsImportant, setIsNewsImportant] = useState(false);
  
  // Branding State
  const [newLogoUrl, setNewLogoUrl] = useState(config.header.logoUrl);
  const [newBannerUrl, setNewBannerUrl] = useState(config.landing.heroImageUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  // Role checks
  const isSystemAdmin = currentUser?.role === UserRole.ADMIN;
  const isAdminOfficer = currentUser?.role === UserRole.SUPERVISOR;
  const isDirector = currentUser?.role === UserRole.DIRECTOR;

  useEffect(() => {
    // Default tabs based on role
    if (isDirector) setActiveTab('approvals');
    else if (isAdminOfficer) setActiveTab('scrutiny');
    else setActiveTab('analytics');
  }, [isDirector, isAdminOfficer]);

  // --- Handlers ---

  const handleCreatePost = (newPost: JobPost) => {
    addPost(newPost);
    setIsCreatingPost(false);
    alert("Recruitment Drive Created Successfully!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (ev.target?.result) {
                if (type === 'logo') {
                    setLogoFile(file);
                    setNewLogoUrl(ev.target.result as string);
                } else {
                    setBannerFile(file);
                    setNewBannerUrl(ev.target.result as string);
                }
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleUpdateBranding = () => {
    updateConfig({
      ...config,
      header: { ...config.header, logoUrl: newLogoUrl },
      landing: { ...config.landing, heroImageUrl: newBannerUrl }
    });
    alert("Branding Updated Successfully!");
  };

  // 1. Scrutiny Handlers
  const handleBulkStatusUpdate = (status: ApplicationStatus) => {
      if (selectedAppIds.length === 0) return;
      if (confirm(`Are you sure you want to change status of ${selectedAppIds.length} applicants to ${status}?`)) {
          bulkUpdateStatus(selectedAppIds, status);
          setSelectedAppIds([]);
      }
  };

  const handlePushToDirector = () => {
      if (!selectedPostId) return;
      const post = posts.find(p => p.id === selectedPostId);
      if (post) {
          updatePost({ ...post, status: PostStatus.PENDING_DIRECTOR_APPROVAL });
          alert(`Recruitment Drive for ${post.title} has been pushed to Director for approval.`);
      }
  };

  // 2. Director Handlers
  const handleDirectorDecision = (postId: string, approved: boolean) => {
      const post = posts.find(p => p.id === postId);
      if (post) {
          updatePost({ 
              ...post, 
              status: approved ? PostStatus.DIRECTOR_APPROVED : PostStatus.SCRUTINY_IN_PROGRESS 
          });
          alert(approved ? "Approved. Sent back to Admin Officer for next steps." : "Rejected. Sent back for re-scrutiny.");
      }
  };

  const handleRequestCandidateList = () => {
    alert("Request sent to Administrative Officer to prepare and upload the specific candidate list.");
  };

  // 3. Final Result Handler
  const handleDeclareResult = (postId: string) => {
      const post = posts.find(p => p.id === postId);
      if (post) {
          // In a real app, we would upload the file here
          updatePost({ ...post, status: PostStatus.RESULT_DECLARED, finalResultPdfUrl: '#' });
          
          // Notify selected candidates
          notifyCandidates(post.title, "Final Results Declared. Check portal.", "SELECTION");
          alert("Result Declared. Notifications sent to selected candidates.");
      }
  };

  // 4. Communication Handler (Excel Upload)
  const handleBulkCommSend = () => {
      if (!commFile || !commMessage) {
          alert("Please upload an Excel/CSV file and enter a message.");
          return;
      }
      // Simulate reading Excel
      setTimeout(() => {
          alert(`Processing file ${commFile.name}... Sent messages to extracted contacts.`);
          setCommFile(null);
          setCommMessage('');
      }, 1500);
  };

  // 5. News Ticker Handlers
  const handleAddNews = () => {
    if(!newNewsText.trim()) return;
    const newItem: NewsItem = {
      id: Date.now().toString(),
      text: newNewsText,
      isNew: isNewsImportant
    };
    updateConfig({
      ...config,
      news: [...config.news, newItem]
    });
    setNewNewsText('');
    setIsNewsImportant(false);
  };

  const handleDeleteNews = (id: string) => {
    updateConfig({
      ...config,
      news: config.news.filter(item => item.id !== id)
    });
  };

  // --- Render Functions ---

  const renderTabs = () => {
      const tabs = [];
      // Enabled for Director too now
      if (isSystemAdmin || isAdminOfficer || isDirector) tabs.push({ id: 'analytics', label: 'Reports & Analytics' });
      if (isSystemAdmin || isAdminOfficer) tabs.push({ id: 'posts', label: 'Post Management' });
      if (isSystemAdmin) tabs.push({ id: 'applicants', label: 'Candidate Management' });
      if (isAdminOfficer) {
          tabs.push({ id: 'scrutiny', label: 'Scrutiny Board' });
          tabs.push({ id: 'results', label: 'Final Results' });
          tabs.push({ id: 'communication', label: 'Communication Console' });
          tabs.push({ id: 'helpdesk', label: 'Helpdesk' });
      }
      if (isDirector) tabs.push({ id: 'approvals', label: 'Director Approvals' });
      if (isSystemAdmin) tabs.push({ id: 'settings', label: 'System Settings' });

      return (
          <div className="flex space-x-2 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-slate-200 w-fit mb-8 overflow-x-auto">
             {tabs.map((tab) => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)} 
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
                 >
                    {tab.label}
                 </button>
             ))}
          </div>
      );
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-20 bg-[#F0F2F5] min-h-screen font-sans">
      
      {/* Header with Gradient Text */}
      <div className="flex justify-between items-center mb-8 bg-white/60 backdrop-blur-xl p-6 rounded-3xl border border-white/40 shadow-sm">
        <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0078D4] via-[#50E6FF] to-[#0078D4] flex items-center tracking-tight">
                {isDirector && <Shield className="mr-3 text-[#0078D4]" size={36}/>}
                {isSystemAdmin && <Settings className="mr-3 text-[#0078D4]" size={36}/>}
                {isAdminOfficer && <Briefcase className="mr-3 text-[#0078D4]" size={36}/>}
                
                {isDirector ? 'Director Dashboard' : isSystemAdmin ? 'System Administration' : 'Administrative Console'}
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-semibold tracking-wide uppercase pl-12">
                {isSystemAdmin ? 'Portal Configuration & Access Control' : 
                 isAdminOfficer ? 'Recruitment Workflow & Scrutiny' :
                 'Strategic Oversight & Approval'}
            </p>
        </div>
        <div className="hidden md:flex items-center space-x-3 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs font-bold text-slate-600">System Operational</span>
        </div>
      </div>

      {renderTabs()}

      {/* 1. REPORTS & ANALYTICS - UPDATED FLUENT UI */}
      {activeTab === 'analytics' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Applicants" value={applications.length.toString()} icon={<Users />} gradient="bg-gradient-to-br from-blue-600 to-indigo-700" />
            <StatCard title="Pending Scrutiny" value={applications.filter(a => a.status === ApplicationStatus.SUBMITTED).length.toString()} icon={<FileText />} gradient="bg-gradient-to-br from-amber-400 to-orange-500" />
            <StatCard title="Active Drives" value={posts.filter(p => p.status === PostStatus.PUBLISHED).length.toString()} icon={<Activity />} gradient="bg-gradient-to-br from-emerald-500 to-teal-700" />
            <StatCard title="Selected" value={applications.filter(a => a.status === ApplicationStatus.SELECTED).length.toString()} icon={<CheckCircle />} gradient="bg-gradient-to-br from-purple-500 to-fuchsia-700" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             {/* Main Bar Chart - Applications per Post */}
             <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-slate-800 text-lg flex items-center">
                    <TrendingUp className="mr-2 text-blue-600" /> Applications by Post
                  </h3>
                  <select className="bg-slate-50 border-none text-xs rounded-lg p-2 text-slate-500 font-bold cursor-pointer hover:bg-slate-100 transition-colors outline-none">
                    <option>Last 30 Days</option>
                    <option>All Time</option>
                  </select>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={posts.map(p => ({ name: p.code, count: applications.filter(a => a.postId === p.id).length }))} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.5}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} dy={10} />
                      <YAxis tick={{fontSize: 11, fill: '#64748b'}} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomFluentTooltip />} cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="count" fill="url(#colorBar)" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </div>
             
             {/* Demographics Pie Chart */}
             <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20">
                <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center">
                    <Users className="mr-2 text-green-600"/> Applicant Demographics
                </h3>
                <div className="flex items-center justify-center h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'General', value: 45 },
                          { name: 'OBC', value: 30 },
                          { name: 'SC', value: 15 },
                          { name: 'ST', value: 5 },
                          { name: 'EWS', value: 5 },
                        ]}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {FLUENT_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomFluentTooltip />} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
             </div>

             {/* Application Trend Area Chart */}
             <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 lg:col-span-2">
                <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center">
                    <Activity className="mr-2 text-purple-600"/> Submission Timeline
                </h3>
                <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { day: 'Mon', apps: 12 }, { day: 'Tue', apps: 19 }, { day: 'Wed', apps: 3 }, 
                      { day: 'Thu', apps: 25 }, { day: 'Fri', apps: 45 }, { day: 'Sat', apps: 30 }, { day: 'Sun', apps: 10 }
                    ]}>
                      <defs>
                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                      <CartesianGrid vertical={false} stroke="#f1f5f9" />
                      <Tooltip content={<CustomFluentTooltip />} />
                      <Area type="monotone" dataKey="apps" stroke="#8884d8" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
             
             {/* Download Lists Section - Fluent Redesign */}
             <div className="lg:col-span-2 bg-gradient-to-r from-slate-100 to-slate-200 p-8 rounded-3xl border border-slate-200">
                <h3 className="font-bold text-slate-700 mb-6 flex items-center"><Download className="mr-2"/> Export Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts.map(post => (
                        <div key={post.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1">
                            <div className="mb-3">
                                <span className="font-bold text-sm text-slate-800 block truncate">{post.code}</span>
                                <span className="text-xs text-slate-500 font-medium">{applications.filter(a => a.postId === post.id).length} Applicants</span>
                            </div>
                            <div className="flex space-x-2 mt-2">
                                <button className="flex-1 text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 py-2 rounded-xl hover:bg-emerald-100 font-bold transition-colors">Excel</button>
                                <button className="flex-1 text-xs bg-red-50 text-red-600 border border-red-100 py-2 rounded-xl hover:bg-red-100 font-bold transition-colors">PDF</button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* POST MANAGEMENT */}
      {activeTab === 'posts' && (isSystemAdmin || isAdminOfficer) && (
        <div className="space-y-6 animate-fadeIn">
           {isCreatingPost ? (
              <PostCreator onCancel={() => setIsCreatingPost(false)} onSave={handleCreatePost} />
           ) : (
             <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-fluent border border-white/50">
               <div className="flex justify-between items-center mb-8">
                 <div>
                   <h2 className="text-2xl font-bold text-slate-800">Recruitment Drive Management</h2>
                   <p className="text-slate-500 text-sm">Create, edit and manage job openings and their dynamic forms.</p>
                 </div>
                 <button onClick={() => setIsCreatingPost(true)} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all flex items-center transform hover:-translate-y-0.5">
                    <Plus size={20} className="mr-2"/> Create New Drive
                 </button>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  {posts.map(post => (
                    <div key={post.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex justify-between items-center hover:shadow-md transition-all group">
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="font-bold text-lg text-slate-800 group-hover:text-blue-600 transition-colors">{post.title}</h4>
                             <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${post.status === PostStatus.PUBLISHED ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{post.status}</span>
                          </div>
                          <p className="text-sm text-slate-500">Code: <span className="font-mono">{post.code}</span> | Dept: {post.department} | Deadline: {post.lastDate}</p>
                       </div>
                       <div className="flex gap-2">
                          <button className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"><Edit3 size={18}/></button>
                          <button className="p-2 text-red-600 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
           )}
        </div>
      )}

      {/* 2. SCRUTINY BOARD (Admin Officer) */}
      {activeTab === 'scrutiny' && isAdminOfficer && (
          <div className="space-y-6 animate-fadeIn">
              {/* Controls */}
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex items-center gap-4">
                      <select 
                        className="p-3 border rounded-xl text-sm min-w-[250px] bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedPostId}
                        onChange={(e) => { setSelectedPostId(e.target.value); setSelectedAppIds([]); }}
                      >
                          <option value="">-- Select Post to Scrutinize --</option>
                          {posts.map(p => <option key={p.id} value={p.id}>{p.code} - {p.title}</option>)}
                      </select>
                      
                      <div className="flex items-center space-x-3 border-l pl-6">
                          <Filter size={18} className="text-slate-400"/>
                          <select className="p-3 border rounded-xl text-sm bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" value={scrutinyFilter} onChange={(e) => setScrutinyFilter(e.target.value)}>
                              <option value="ALL">All Status</option>
                              <option value={ApplicationStatus.SUBMITTED}>Pending Scrutiny</option>
                              <option value={ApplicationStatus.ELIGIBLE_WRITTEN}>Eligible</option>
                              <option value={ApplicationStatus.REJECTED}>Rejected</option>
                          </select>
                      </div>
                  </div>

                  <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleBulkStatusUpdate(ApplicationStatus.ELIGIBLE_WRITTEN)}
                        disabled={selectedAppIds.length === 0}
                        className="px-5 py-2.5 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                      >
                          Mark Eligible
                      </button>
                      <button 
                        onClick={() => handleBulkStatusUpdate(ApplicationStatus.REJECTED)}
                        disabled={selectedAppIds.length === 0}
                        className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold shadow-sm transition-transform hover:-translate-y-0.5"
                      >
                          Reject Selected
                      </button>
                      <div className="h-8 w-px bg-slate-200 mx-2"></div>
                      <button 
                        onClick={handlePushToDirector}
                        className="px-6 py-2.5 bg-indigo-600 text-white text-sm rounded-xl hover:bg-indigo-700 font-bold shadow-md flex items-center transition-transform hover:-translate-y-0.5"
                      >
                          Push to Director <Send size={16} className="ml-2"/>
                      </button>
                  </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-3xl shadow-fluent border border-slate-200 overflow-hidden">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                          <tr>
                              <th className="px-6 py-5 w-10">
                                  <input 
                                    type="checkbox" 
                                    className="rounded text-blue-600 focus:ring-blue-500"
                                    onChange={(e) => {
                                        if (e.target.checked && selectedPostId) {
                                            const ids = applications
                                                .filter(a => a.postId === selectedPostId)
                                                .map(a => a.applicationNumber!);
                                            setSelectedAppIds(ids);
                                        } else {
                                            setSelectedAppIds([]);
                                        }
                                    }}
                                  />
                              </th>
                              <th className="px-6 py-5">App ID</th>
                              <th className="px-6 py-5">Candidate</th>
                              <th className="px-6 py-5">Qualification</th>
                              <th className="px-6 py-5">Status</th>
                              <th className="px-6 py-5 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                          {applications
                             .filter(app => !selectedPostId || app.postId === selectedPostId)
                             .filter(app => scrutinyFilter === 'ALL' || app.status === scrutinyFilter)
                             .map(app => (
                              <tr key={app.applicationNumber} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4">
                                      <input 
                                        type="checkbox" 
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                        checked={selectedAppIds.includes(app.applicationNumber!)}
                                        onChange={(e) => {
                                            if (e.target.checked) setSelectedAppIds([...selectedAppIds, app.applicationNumber!]);
                                            else setSelectedAppIds(selectedAppIds.filter(id => id !== app.applicationNumber));
                                        }}
                                      />
                                  </td>
                                  <td className="px-6 py-4 font-mono font-medium text-slate-700">{app.applicationNumber}</td>
                                  <td className="px-6 py-4">
                                      <div className="font-bold text-slate-800">{app.personalDetails.fullName}</div>
                                      <div className="text-xs text-slate-500 mt-0.5">{app.personalDetails.category} | {app.personalDetails.gender}</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <div className="text-slate-700">{app.education[0]?.level}</div>
                                      <div className="text-xs text-slate-500 font-medium">{app.education[0]?.percentage}%</div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          app.status === ApplicationStatus.REJECTED ? 'bg-red-100 text-red-700' :
                                          app.status === ApplicationStatus.ELIGIBLE_WRITTEN ? 'bg-green-100 text-green-700' :
                                          'bg-amber-100 text-amber-700'
                                      }`}>
                                          {app.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <button className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-semibold text-xs flex items-center justify-end ml-auto transition-colors"><Eye size={14} className="mr-1"/> Details</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {applications.filter(app => !selectedPostId || app.postId === selectedPostId).length === 0 && (
                      <div className="p-12 text-center text-slate-400">
                          <Filter size={48} className="mx-auto mb-4 opacity-20"/>
                          <p>No applications found. Select a post to load data.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* 3. DIRECTOR APPROVALS */}
      {activeTab === 'approvals' && isDirector && (
          <div className="space-y-6 animate-fadeIn">
              <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-2">Director's Approval Dashboard</h2>
                    <p className="text-purple-200 text-lg">Review shortlisted candidates and approve recruitment drives.</p>
                  </div>
                  <button onClick={handleRequestCandidateList} className="bg-white text-purple-900 px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-purple-50 transition-transform hover:-translate-y-0.5 flex items-center relative z-10">
                      <ClipboardList className="mr-2" size={20} /> Request Candidate List
                  </button>
              </div>

              <div className="grid gap-6">
                  {posts.filter(p => p.status === PostStatus.PENDING_DIRECTOR_APPROVAL).map(post => (
                      <div key={post.id} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 flex justify-between items-center">
                          <div>
                              <div className="flex items-center gap-3 mb-2">
                                  <h3 className="font-bold text-xl text-slate-800">{post.title}</h3>
                                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Action Required</span>
                              </div>
                              <p className="text-slate-500">Code: <span className="font-mono text-slate-700 font-medium">{post.code}</span> | Vacancies: <span className="font-bold text-slate-700">{post.vacancies}</span></p>
                              <p className="text-sm text-slate-600 mt-4 bg-slate-50 inline-block px-4 py-2 rounded-lg border border-slate-100">
                                  Shortlisted Candidates: <span className="font-bold text-indigo-600">{applications.filter(a => a.postId === post.id && a.status === ApplicationStatus.ELIGIBLE_WRITTEN).length}</span>
                              </p>
                          </div>
                          <div className="flex gap-4">
                              <button 
                                onClick={() => handleDirectorDecision(post.id, false)}
                                className="px-6 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 font-bold transition-colors"
                              >
                                  Reject List
                              </button>
                              <button 
                                onClick={() => handleDirectorDecision(post.id, true)}
                                className="px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold shadow-lg hover:shadow-green-500/30 transition-transform hover:-translate-y-0.5"
                              >
                                  Approve List
                              </button>
                          </div>
                      </div>
                  ))}
                  {posts.filter(p => p.status === PostStatus.PENDING_DIRECTOR_APPROVAL).length === 0 && (
                      <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                          <CheckCircle className="mx-auto mb-4 opacity-20" size={64}/>
                          <p className="text-lg">No pending approvals at this time.</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* 4. FINAL RESULTS (Admin Officer) */}
      {activeTab === 'results' && isAdminOfficer && (
           <div className="space-y-6 animate-fadeIn">
               <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-fluent border border-white/50">
                   <h3 className="font-bold text-xl text-slate-800 mb-6">Upload Final Results</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {posts.filter(p => p.status === PostStatus.DIRECTOR_APPROVED).map(post => (
                           <div key={post.id} className="border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-md transition-shadow">
                               <div className="flex justify-between items-start mb-6">
                                   <div>
                                       <h4 className="font-bold text-lg text-slate-800">{post.title}</h4>
                                       <p className="text-xs text-slate-500 font-mono mt-1">{post.code}</p>
                                   </div>
                                   <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">Approved by Director</span>
                               </div>
                               
                               <div className="space-y-4">
                                   <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors group">
                                       <Upload className="mx-auto text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" size={24}/>
                                       <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Upload Signed OM (PDF)</p>
                                   </div>
                                   <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 cursor-pointer transition-colors group">
                                       <FileSpreadsheet className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-3 transition-colors" size={24}/>
                                       <p className="text-xs text-slate-600 font-bold uppercase tracking-wide">Upload Selection Sheet (Excel)</p>
                                   </div>
                                   <button 
                                      onClick={() => handleDeclareResult(post.id)}
                                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
                                   >
                                       Declare Result
                                   </button>
                               </div>
                           </div>
                       ))}
                   </div>
               </div>
           </div>
      )}

      {/* 5. COMMUNICATION CONSOLE (Admin Officer) */}
      {activeTab === 'communication' && isAdminOfficer && (
          <div className="space-y-6 animate-fadeIn">
              <div className="bg-white rounded-3xl shadow-fluent border border-slate-200 p-10">
                  <div className="flex items-center mb-8">
                      <div className="bg-green-100 p-4 rounded-2xl mr-5 text-green-600 shadow-sm"><MessageCircle size={32}/></div>
                      <div>
                          <h2 className="text-2xl font-bold text-slate-800">Bulk Notification Sender</h2>
                          <p className="text-slate-500">Send manual WhatsApp/Email blasts by uploading a contact list.</p>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-5">
                          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">1. Upload Recipient List (Excel/CSV)</label>
                          <div className="border border-slate-300 rounded-xl p-2 bg-slate-50">
                              <input 
                                type="file" 
                                accept=".csv, .xlsx, .xls"
                                onChange={(e) => setCommFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-white file:text-slate-700 hover:file:bg-slate-100 cursor-pointer"
                              />
                          </div>
                          <p className="text-xs text-slate-400">Format: Name, Mobile, Email (Headers required)</p>
                          
                          {commFile && (
                              <div className="flex items-center text-sm text-green-700 bg-green-50 p-3 rounded-xl border border-green-200">
                                  <FileSpreadsheet size={18} className="mr-2"/> <span className="font-semibold">{commFile.name}</span> ready to process.
                              </div>
                          )}
                      </div>

                      <div className="space-y-5">
                           <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">2. Compose Message</label>
                           <textarea 
                              rows={5} 
                              className="w-full border border-slate-300 rounded-xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-slate-50 focus:bg-white transition-colors"
                              placeholder="Type your message here..."
                              value={commMessage}
                              onChange={(e) => setCommMessage(e.target.value)}
                           ></textarea>
                           
                           <div className="flex items-center justify-between pt-2">
                               <div className="flex items-center space-x-6">
                                   <label className="flex items-center text-sm font-semibold text-slate-700 cursor-pointer">
                                       <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" defaultChecked/> WhatsApp
                                   </label>
                                   <label className="flex items-center text-sm font-semibold text-slate-700 cursor-pointer">
                                       <input type="checkbox" className="mr-2 rounded text-blue-600 focus:ring-blue-500" defaultChecked/> Email
                                   </label>
                               </div>
                               <button 
                                  onClick={handleBulkCommSend}
                                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 flex items-center shadow-md transition-transform hover:-translate-y-0.5"
                                >
                                   <Send size={18} className="mr-2"/> Send Broadcast
                               </button>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* HELPDESK MANAGEMENT (Admin Officer) */}
      {activeTab === 'helpdesk' && isAdminOfficer && (
          <div className="bg-white rounded-3xl shadow-fluent border border-slate-200 overflow-hidden flex h-[750px] animate-fadeIn">
              {/* Ticket List */}
              <div className="w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col">
                  <div className="p-6 border-b border-slate-100 font-bold text-lg text-slate-700 bg-white">
                      Support Tickets
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                      {tickets.map(t => (
                           <div 
                              key={t.id} 
                              onClick={() => setSelectedTicket(t)}
                              className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${selectedTicket?.id === t.id ? 'bg-white border-blue-500 ring-2 ring-blue-100 shadow-md' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                           >
                               <div className="flex justify-between mb-2">
                                   <span className="font-bold text-xs text-slate-500 font-mono">{t.id}</span>
                                   <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${t.status === 'OPEN' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{t.status}</span>
                               </div>
                               <h4 className="font-bold text-sm text-slate-800 line-clamp-1 mb-1">{t.subject}</h4>
                               <p className="text-xs text-slate-500">{t.userName}</p>
                               <p className="text-[10px] text-slate-400 mt-2 text-right">{new Date(t.createdAt).toLocaleDateString()}</p>
                           </div>
                      ))}
                  </div>
              </div>

              {/* Ticket Detail / Reply */}
              <div className="w-2/3 flex flex-col bg-white">
                  {selectedTicket ? (
                      <>
                        <div className="p-8 border-b border-slate-100 flex justify-between items-start bg-slate-50/30 backdrop-blur-sm">
                             <div>
                                 <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedTicket.subject}</h2>
                                 <p className="text-sm text-slate-500">
                                     From: <span className="font-bold text-slate-700">{selectedTicket.userName}</span> | Category: <span className="text-blue-600 font-medium">{selectedTicket.category}</span>
                                 </p>
                                 <div className="mt-3 flex space-x-3">
                                     <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">App ID: {selectedTicket.applicationNumber || 'N/A'}</span>
                                     <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 border border-slate-200">Post: {selectedTicket.postId || 'N/A'}</span>
                                 </div>
                             </div>
                             <div className="flex flex-col items-end space-y-3">
                                 {selectedTicket.status === 'OPEN' && (
                                     <button onClick={() => resolveTicket(selectedTicket.id)} className="text-xs bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition flex items-center font-bold">
                                         <CheckCircle size={14} className="mr-2"/> Mark Resolved
                                     </button>
                                 )}
                                 <span className="text-xs text-slate-400 font-medium">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                             </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {/* Original Message */}
                            <div className="flex flex-col space-y-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-2">Original Request</span>
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-slate-800 text-sm whitespace-pre-line leading-relaxed shadow-sm">
                                    {selectedTicket.description}
                                </div>
                            </div>

                            {/* Conversation */}
                            {selectedTicket.replies.map((reply) => (
                                <div key={reply.id} className={`flex flex-col ${reply.role === UserRole.APPLICANT ? 'items-start' : 'items-end'}`}>
                                    <div className={`max-w-[80%] p-5 rounded-2xl text-sm border shadow-sm ${
                                        reply.role === UserRole.APPLICANT 
                                        ? 'bg-white border-slate-200 text-slate-800 rounded-bl-none' 
                                        : 'bg-blue-600 border-blue-600 text-white rounded-br-none shadow-blue-200'
                                    }`}>
                                        <p className={`text-xs font-bold mb-2 ${reply.role === UserRole.APPLICANT ? 'text-slate-500' : 'text-blue-100'}`}>{reply.senderName}</p>
                                        <p className="whitespace-pre-line leading-relaxed">{reply.message}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-400 mt-2 mx-2 font-medium">{new Date(reply.timestamp).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                             <div className="flex flex-col space-y-3">
                                 <textarea 
                                     className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-csir-blue outline-none text-sm shadow-sm bg-white"
                                     rows={3}
                                     placeholder="Type reply to candidate... (An SMS/Email notification will be sent)"
                                     value={adminReply}
                                     onChange={(e) => setAdminReply(e.target.value)}
                                 ></textarea>
                                 <div className="flex justify-end">
                                     <button 
                                        onClick={() => {
                                            if(currentUser && selectedTicket && adminReply.trim()) {
                                                replyToTicket(selectedTicket.id, currentUser, adminReply);
                                                setAdminReply('');
                                            }
                                        }}
                                        disabled={!adminReply.trim()}
                                        className="bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-black disabled:opacity-50 transition flex items-center"
                                     >
                                         <Send size={16} className="mr-2"/> Send Reply
                                     </button>
                                 </div>
                             </div>
                        </div>
                      </>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-full text-slate-300">
                          <LifeBuoy size={64} className="mb-4 opacity-50"/>
                          <p className="text-lg font-medium">Select a ticket to view conversation</p>
                      </div>
                  )}
              </div>
          </div>
      )}

      {/* SETTINGS & USERS (System Admin Only) */}
      {(activeTab === 'settings') && isSystemAdmin && (
          <div className="space-y-8 animate-fadeIn">
              
              {/* BRANDING CONFIGURATION - UPDATED WITH UPLOAD */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-fluent border border-white/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
                  <h2 className="text-2xl font-bold mb-8 flex items-center text-slate-800">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3 text-indigo-600"><ImageIcon size={24}/></div>
                    Branding & Appearance
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     {/* Logo Upload */}
                     <div className="space-y-4">
                        <label className="block text-sm font-extrabold text-slate-700 uppercase tracking-wider">Organization Logo</label>
                        <div className="relative group">
                            <div className="h-32 w-full border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden group-hover:border-indigo-400 transition-colors">
                                {newLogoUrl ? (
                                    <img src={newLogoUrl} alt="Logo Preview" className="h-full object-contain p-2" />
                                ) : (
                                    <span className="text-slate-400 text-xs">No Logo Set</span>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                                    <Camera className="text-white drop-shadow-lg" size={32} />
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">URL</span>
                            <input 
                                type="text" 
                                className="flex-1 p-2 bg-transparent border-b border-slate-200 text-sm focus:border-indigo-500 outline-none transition-colors" 
                                value={newLogoUrl} 
                                onChange={e => setNewLogoUrl(e.target.value)}
                                placeholder="https://..." 
                            />
                        </div>
                     </div>

                     {/* Banner Upload */}
                     <div className="space-y-4">
                        <label className="block text-sm font-extrabold text-slate-700 uppercase tracking-wider">Landing Page Banner</label>
                        <div className="relative group">
                            <div className="h-32 w-full border-2 border-dashed border-slate-300 rounded-2xl flex items-center justify-center bg-slate-50 overflow-hidden group-hover:border-indigo-400 transition-colors">
                                {newBannerUrl ? (
                                    <img src={newBannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-slate-400 text-xs">No Banner Set</span>
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer">
                                    <Camera className="text-white drop-shadow-lg" size={32} />
                                </div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => handleImageUpload(e, 'banner')}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">URL</span>
                            <input 
                                type="text" 
                                className="flex-1 p-2 bg-transparent border-b border-slate-200 text-sm focus:border-indigo-500 outline-none transition-colors" 
                                value={newBannerUrl} 
                                onChange={e => setNewBannerUrl(e.target.value)} 
                                placeholder="https://..."
                            />
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                      <button 
                        onClick={handleUpdateBranding} 
                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center"
                      >
                          <Save className="mr-2" size={18}/> Save Branding Settings
                      </button>
                  </div>
              </div>

              {/* News Ticker Management */}
              <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-fluent border border-white/50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400"></div>
                  <h2 className="text-2xl font-bold mb-8 flex items-center text-slate-800">
                      <div className="p-2 bg-amber-100 rounded-lg mr-3 text-amber-600"><Megaphone size={24}/></div>
                      News Ticker Management
                  </h2>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-1 space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                          <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide">Compose News</h3>
                          <textarea 
                              className="w-full p-4 border-none bg-white rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-amber-400 outline-none resize-none"
                              rows={4}
                              placeholder="Enter news text to scroll on landing page..."
                              value={newNewsText}
                              onChange={(e) => setNewNewsText(e.target.value)}
                          />
                          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm">
                              <input 
                                  type="checkbox" 
                                  id="isNewsImportant" 
                                  checked={isNewsImportant}
                                  onChange={(e) => setIsNewsImportant(e.target.checked)}
                                  className="w-5 h-5 rounded text-amber-500 focus:ring-amber-400 border-gray-300"
                              />
                              <label htmlFor="isNewsImportant" className="text-sm font-semibold text-slate-700 cursor-pointer">Mark as Important (NEW)</label>
                          </div>
                          <button 
                              onClick={handleAddNews}
                              disabled={!newNewsText.trim()}
                              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold text-sm hover:bg-black disabled:opacity-50 transition shadow-lg flex justify-center items-center"
                          >
                              <Plus size={18} className="mr-2"/> Add to Ticker
                          </button>
                      </div>

                      <div className="lg:col-span-2">
                          <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wide mb-4">Active News Items</h3>
                          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                              {config.news.map((item) => (
                                  <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:shadow-md transition-all group">
                                      <div className="flex items-center space-x-4">
                                          <div className={`w-2 h-2 rounded-full ${item.isNew ? 'bg-amber-500' : 'bg-slate-300'}`}></div>
                                          {item.isNew && <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2 py-1 rounded-md">NEW</span>}
                                          <p className="text-sm text-slate-700 font-medium line-clamp-1">{item.text}</p>
                                      </div>
                                      <button 
                                          onClick={() => handleDeleteNews(item.id)}
                                          className="text-slate-300 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                      >
                                          <Trash2 size={18}/>
                                      </button>
                                  </div>
                              ))}
                              {config.news.length === 0 && (
                                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                      <Megaphone size={40} className="mb-3 opacity-20"/>
                                      <p className="text-sm italic">No active news items.</p>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* APPLICANT MANAGEMENT (System Admin) - As per flowchart "Candidate Registration" */}
      {(activeTab === 'applicants') && isSystemAdmin && (
          <div className="bg-white rounded-3xl shadow-fluent border border-slate-200 p-8 animate-fadeIn">
              <h2 className="text-2xl font-bold mb-6 flex items-center text-slate-800"><Users className="mr-3 text-blue-600"/> Candidate Management</h2>
              <p className="text-slate-500 mb-6">Manage registered applicant accounts, reset passwords, or block suspicious users.</p>
              
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs">
                          <tr>
                              <th className="px-6 py-4">Name</th>
                              <th className="px-6 py-4">Aadhaar</th>
                              <th className="px-6 py-4">Mobile</th>
                              <th className="px-6 py-4">Email</th>
                              <th className="px-6 py-4">Role</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                          {users?.filter(u => u.role === UserRole.APPLICANT).map(u => (
                              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 font-bold text-slate-700">{u.name}</td>
                                  <td className="px-6 py-4 font-mono text-slate-500">{u.aadhaar}</td>
                                  <td className="px-6 py-4 text-slate-600">{u.mobile}</td>
                                  <td className="px-6 py-4 text-slate-600">{u.email}</td>
                                  <td className="px-6 py-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">{u.role}</span></td>
                                  <td className="px-6 py-4 text-right">
                                      <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors">Edit</button>
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  {users?.filter(u => u.role === UserRole.APPLICANT).length === 0 && (
                      <div className="p-8 text-center text-slate-400 italic">No registered applicants yet.</div>
                  )}
              </div>
          </div>
      )}

    </div>
  );
};