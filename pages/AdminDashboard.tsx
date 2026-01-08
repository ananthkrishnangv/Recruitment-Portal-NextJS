
import React, { useState, useEffect } from 'react';
import { Users, FileText, CheckCircle, Settings, Mail, Plus, Lock, Send, Briefcase, Filter, Download, Archive, Package, Edit3, Trash2, X, Search, Eye, Smartphone, Database, Megaphone, Share2 } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { usePosts } from '../context/PostContext';
import { useApplications } from '../context/ApplicationContext';
import { useHelpdesk } from '../context/HelpdeskContext';
import { useNotifications } from '../context/NotificationContext';
import { User, UserRole, PostStatus, ApplicationStatus, JobPost, PostType, CustomField, FieldType } from '../types';

interface AdminDashboardProps {
  users?: User[];
  updateUser?: (user: User) => void;
  currentUser?: User;
}

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-fluent border-l-[6px] transition-all hover:scale-[1.02] duration-300" style={{ borderColor: color }}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-black text-[#A19F9D] uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className="text-4xl font-black text-[#323130] tracking-tight">{value}</p>
      </div>
      <div className="p-3 rounded bg-[#FAF9F8] border border-[#EDEBE9]" style={{ color: color }}>{icon}</div>
    </div>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, updateUser, currentUser }) => {
  const { posts, updatePost, addPost } = usePosts();
  const { applications, updateApplicationStatus, bulkUpdateStatus } = useApplications();
  const { tickets, resolveTicket, replyToTicket } = useHelpdesk();
  const { sendWhatsApp, sendSMS } = useNotifications();
  const { config, updateConfig } = useSiteConfig();
  
  const [activeTab, setActiveTab] = useState<'analytics'|'posts'|'scrutiny'|'results'|'approvals'|'outreach'|'helpdesk'|'applicants'>('analytics');
  const [selectedPostId, setSelectedPostId] = useState('');
  const [selectedAppIds, setSelectedAppIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [marksInput, setMarksInput] = useState<Record<string, string>>({});

  const isAO = currentUser?.role === UserRole.SUPERVISOR;
  const isDirector = currentUser?.role === UserRole.DIRECTOR;
  const isAdmin = currentUser?.role === UserRole.ADMIN;

  useEffect(() => {
    if (isDirector) setActiveTab('approvals');
    else if (isAO) setActiveTab('scrutiny');
  }, [isDirector, isAO]);

  const handlePushToDirector = (phase: 'shortlist' | 'final') => {
    if (!selectedPostId) return;
    const post = posts.find(p => p.id === selectedPostId);
    if (post) {
        const nextStatus = phase === 'shortlist' ? PostStatus.PENDING_SHORTLIST_APPROVAL : PostStatus.PENDING_FINAL_APPROVAL;
        updatePost({ ...post, status: nextStatus });
        alert(`Request pushed to Director for ${phase} approval.`);
    }
  };

  const handleDirectorDecision = (postId: string, phase: 'shortlist' | 'final', approved: boolean) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    let nextPostStatus: PostStatus;
    if (phase === 'shortlist') {
        nextPostStatus = approved ? PostStatus.SHORTLIST_APPROVED : PostStatus.SCRUTINY_IN_PROGRESS;
        if (approved) {
           const appIds = applications.filter(a => a.postId === postId && a.status === ApplicationStatus.UNDER_SCRUTINY).map(a => a.applicationNumber!);
           bulkUpdateStatus(appIds, ApplicationStatus.SHORTLISTED_FOR_TEST);
        }
    } else {
        nextPostStatus = approved ? PostStatus.RESULT_DECLARED : PostStatus.TESTING_PHASE;
        if (approved) {
           const appIds = applications.filter(a => a.postId === postId && a.status === ApplicationStatus.SELECTED_PROVISIONAL).map(a => a.applicationNumber!);
           bulkUpdateStatus(appIds, ApplicationStatus.SELECTED);
        }
    }
    updatePost({ ...post, status: nextPostStatus });
    alert(approved ? "Strategically Authorized." : "Reverted for Correction.");
  };

  const handleMasterExport = (post: JobPost) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert(`PACKAGE CREATED: ${post.code}_FULL_DATASET.zip\n\nContains:\n- ${post.code}_Applicants.xlsx\n- Documents_Bundle.bin\n- Photographs_Archive.zip`);
    }, 2000);
  };

  const handleBroadcast = (type: 'WHATSAPP' | 'SMS') => {
      if (selectedAppIds.length === 0) return alert("Select recipients first.");
      const msg = prompt(`Enter ${type} Broadcast Message:`);
      if (!msg) return;
      
      selectedAppIds.forEach(id => {
          const app = applications.find(a => a.applicationNumber === id);
          if (app) {
              if (type === 'WHATSAPP') sendWhatsApp(app.personalDetails.mobile, msg);
              else sendSMS(app.personalDetails.mobile, msg);
          }
      });
      alert(`Broadcast dispatched to ${selectedAppIds.length} candidate nodes.`);
  };

  const renderTabs = () => {
      const tabs = [];
      if (isAdmin || isAO || isDirector) tabs.push({ id: 'analytics', label: 'ANALYTICS' });
      if (isAdmin || isAO) tabs.push({ id: 'posts', label: 'RECRUITMENT DRIVES' });
      if (isAO) {
          tabs.push({ id: 'scrutiny', label: 'SCRUTINY BOARD' });
          tabs.push({ id: 'results', label: 'RESULTS PROCESSING' });
          tabs.push({ id: 'outreach', label: 'OUTREACH' });
          tabs.push({ id: 'helpdesk', label: 'HELPDESK' });
      }
      if (isDirector) tabs.push({ id: 'approvals', label: 'APPROVAL QUEUE' });
      return (
          <div className="flex space-x-2 bg-white p-1.5 rounded shadow-sm border border-[#EDEBE9] w-fit mb-12 overflow-x-auto">
             {tabs.map((tab) => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-8 py-2.5 rounded text-xs font-black tracking-widest transition-all ${activeTab === tab.id ? 'bg-csir-blue text-white shadow-lg' : 'text-[#605E5C] hover:bg-[#FAF9F8]'}`}>{tab.label}</button>
             ))}
          </div>
      );
  };

  return (
    <div className="p-4 md:p-12 max-w-7xl mx-auto pb-32 bg-[#FAF9F8] min-h-screen">
      <div className="flex justify-between items-center mb-12 bg-white px-8 py-8 rounded shadow-fluent border-b-4 border-csir-blue">
        <div className="flex items-center space-x-6">
            <div className="p-4 bg-csir-light rounded-sm"><Briefcase size={36} className="text-csir-blue"/></div>
            <div>
                <h1 className="text-3xl font-black text-[#323130] uppercase tracking-tight">{currentUser?.role} TERMINAL</h1>
                <p className="text-[10px] font-black text-[#A19F9D] mt-1 tracking-[0.4em] uppercase">CSIR-SERC GOVT RECRUITMENT NODE v3.1</p>
            </div>
        </div>
        <div className="flex items-center space-x-4 bg-csir-light px-4 py-2 rounded border border-[#DEECF9]">
            <div className="w-2.5 h-2.5 rounded-full bg-csir-green animate-pulse"></div>
            <span className="text-[10px] font-black uppercase text-csir-blue tracking-widest">Nodal Link Active</span>
        </div>
      </div>

      {renderTabs()}

      {activeTab === 'analytics' && (
        <div className="space-y-12 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Identity Registry" value={applications.length.toString()} icon={<Users size={24}/>} color="#0078D4" />
            <StatCard title="In Scrutiny" value={applications.filter(a => a.status === ApplicationStatus.UNDER_SCRUTINY).length.toString()} icon={<FileText size={24}/>} color="#FFB900" />
            <StatCard title="Authorized" value={applications.filter(a => a.status === ApplicationStatus.SELECTED).length.toString()} icon={<CheckCircle size={24}/>} color="#107C10" />
            <StatCard title="Active Projects" value={posts.filter(p => p.status === PostStatus.PUBLISHED).length.toString()} icon={<Database size={24}/>} color="#D13438" />
          </div>

          <div className="bg-white p-10 rounded-2xl shadow-fluent border border-[#EDEBE9]">
              <div className="flex items-center justify-between mb-10 border-b border-[#EDEBE9] pb-6">
                  <div>
                    <h3 className="font-black text-lg uppercase text-[#323130] flex items-center"><Archive className="mr-3 text-csir-blue" size={24}/> Post Data Export Hub</h3>
                    <p className="text-[10px] font-black text-[#A19F9D] uppercase tracking-widest mt-1">Download Comprehensive Recruitment Dataset (.ZIP)</p>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {posts.map(post => (
                      <div key={post.id} className="p-6 bg-[#FAF9F8] border border-[#EDEBE9] rounded hover:shadow-md transition-all">
                          <div className="flex justify-between items-start mb-4">
                              <span className="text-[9px] font-black bg-white px-2 py-1 border border-[#EDEBE9] rounded uppercase">{post.code}</span>
                              <span className="text-[10px] font-bold text-[#A19F9D]">{applications.filter(a => a.postId === post.id).length} Apps</span>
                          </div>
                          <h4 className="font-black text-sm text-[#323130] uppercase mb-4 truncate">{post.title}</h4>
                          <button onClick={() => handleMasterExport(post)} className="w-full py-2.5 bg-white border-2 border-csir-blue text-csir-blue hover:bg-csir-blue hover:text-white rounded text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center">
                              <Download size={14} className="mr-2"/> Generate Master Zip
                          </button>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
          <div className="bg-white rounded-2xl shadow-fluent border border-[#EDEBE9] overflow-hidden animate-fadeIn">
              <div className="p-8 border-b border-[#EDEBE9] flex justify-between items-center">
                  <h2 className="text-xl font-black uppercase text-[#323130]">Vacancy Roster</h2>
                  <button className="bg-csir-blue text-white px-6 py-2 rounded text-xs font-black uppercase tracking-widest shadow-md">+ Create Post</button>
              </div>
              <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF9F8] text-[#605E5C] font-black uppercase">
                      <tr>
                          <th className="px-8 py-4">Designation</th>
                          <th className="px-8 py-4 text-center">UR</th>
                          <th className="px-8 py-4 text-center">SC</th>
                          <th className="px-8 py-4 text-center">ST</th>
                          <th className="px-8 py-4 text-center">OBC</th>
                          <th className="px-8 py-4 text-center">EWS</th>
                          <th className="px-8 py-4 text-center">Total</th>
                          <th className="px-8 py-4 text-right">Phase</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EDEBE9]">
                      {posts.map(post => (
                          <tr key={post.id} className="hover:bg-[#FAF9F8]">
                              <td className="px-8 py-4">
                                  <div className="font-black text-[#323130] uppercase">{post.title}</div>
                                  <div className="text-[10px] text-[#A19F9D]">{post.code} | {post.department}</div>
                              </td>
                              <td className="px-8 py-4 text-center font-bold">{post.breakdown.ur}</td>
                              <td className="px-8 py-4 text-center font-bold">{post.breakdown.sc}</td>
                              <td className="px-8 py-4 text-center font-bold">{post.breakdown.st}</td>
                              <td className="px-8 py-4 text-center font-bold">{post.breakdown.obc}</td>
                              <td className="px-8 py-4 text-center font-bold">{post.breakdown.ews}</td>
                              <td className="px-8 py-4 text-center"><span className="bg-csir-blue text-white px-2 py-1 rounded-sm font-black">{post.vacancies}</span></td>
                              <td className="px-8 py-4 text-right"><span className="bg-csir-light text-csir-blue px-2 py-1 rounded text-[9px] font-black uppercase border border-csir-blue/10">{post.status}</span></td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      )}

      {activeTab === 'scrutiny' && isAO && (
          <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-[#EDEBE9] flex flex-wrap gap-6 items-center justify-between">
                  <select className="p-3 border border-[#8A8886] rounded-sm text-xs font-black uppercase min-w-[300px] bg-[#FAF9F8]" value={selectedPostId} onChange={(e) => { setSelectedPostId(e.target.value); setSelectedAppIds([]); }}>
                      <option value="">Select Project for Primary Scrutiny</option>
                      {posts.filter(p => p.status === PostStatus.PUBLISHED || p.status === PostStatus.SCRUTINY_IN_PROGRESS).map(p => <option key={p.id} value={p.id}>{p.code} - {p.title}</option>)}
                  </select>
                  <div className="flex items-center gap-3">
                      <button onClick={() => bulkUpdateStatus(selectedAppIds, ApplicationStatus.UNDER_SCRUTINY)} disabled={selectedAppIds.length === 0} className="px-6 py-2.5 bg-[#FFF4CE] text-[#8A662E] text-[10px] font-black uppercase rounded shadow-sm disabled:opacity-30">Mark Eligible</button>
                      <button onClick={() => bulkUpdateStatus(selectedAppIds, ApplicationStatus.SCRUTINY_REJECTED)} disabled={selectedAppIds.length === 0} className="px-6 py-2.5 bg-[#A4262C] text-white text-[10px] font-black uppercase rounded shadow-sm disabled:opacity-30">Reject Nodes</button>
                      <div className="h-8 w-px bg-[#EDEBE9] mx-2"></div>
                      <button onClick={() => handlePushToDirector('shortlist')} disabled={!selectedPostId} className="px-8 py-2.5 bg-csir-blue text-white text-[10px] font-black uppercase rounded shadow-fluent disabled:opacity-30 flex items-center">Push Shortlist to Director <Send size={14} className="ml-2"/></button>
                  </div>
              </div>
              <div className="bg-white rounded shadow-fluent border border-[#EDEBE9] overflow-hidden">
                  <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF9F8] font-black uppercase border-b border-[#EDEBE9]">
                          <tr>
                              <th className="px-6 py-4"><input type="checkbox" className="rounded text-csir-blue" onChange={(e) => { if (e.target.checked && selectedPostId) setSelectedAppIds(applications.filter(a => a.postId === selectedPostId).map(a => a.applicationNumber!)); else setSelectedAppIds([]); }}/></th>
                              <th className="px-6 py-4">App ID</th>
                              <th className="px-6 py-4">Candidate Profile</th>
                              <th className="px-6 py-4">Status Node</th>
                              <th className="px-6 py-4 text-right">Identity</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDEBE9]">
                          {applications.filter(app => !selectedPostId || app.postId === selectedPostId).map(app => (
                              <tr key={app.applicationNumber} className="hover:bg-[#FAF9F8]">
                                  <td className="px-6 py-4"><input type="checkbox" checked={selectedAppIds.includes(app.applicationNumber!)} onChange={(e) => e.target.checked ? setSelectedAppIds([...selectedAppIds, app.applicationNumber!]) : setSelectedAppIds(selectedAppIds.filter(id => id !== app.applicationNumber))} /></td>
                                  <td className="px-6 py-4 font-mono font-black">{app.applicationNumber}</td>
                                  <td className="px-6 py-4">
                                      <div className="font-black uppercase">{app.personalDetails.fullName}</div>
                                      <div className="text-[10px] text-[#A19F9D]">{app.personalDetails.category} | {app.education[0]?.percentage}%</div>
                                  </td>
                                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${app.status === ApplicationStatus.SCRUTINY_REJECTED ? 'bg-[#FDF3F4] text-[#A4262C]' : 'bg-csir-light text-csir-blue'}`}>{app.status}</span></td>
                                  <td className="px-6 py-4 text-right"><button className="text-csir-blue hover:underline font-black uppercase">Inspect</button></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'results' && isAO && (
          <div className="space-y-6 animate-fadeIn">
              <div className="bg-white p-8 rounded-xl shadow-sm border border-[#EDEBE9] flex justify-between items-center">
                  <select className="p-3 border border-[#8A8886] rounded-sm text-xs font-black uppercase min-w-[300px] bg-[#FAF9F8]" value={selectedPostId} onChange={(e) => setSelectedPostId(e.target.value)}>
                      <option value="">Select Project for Result Processing</option>
                      {posts.filter(p => p.status === PostStatus.SHORTLIST_APPROVED || p.status === PostStatus.TESTING_PHASE).map(p => <option key={p.id} value={p.id}>{p.code} - {p.title}</option>)}
                  </select>
                  <div className="flex gap-4">
                      <button onClick={() => bulkUpdateStatus(selectedAppIds, ApplicationStatus.SELECTED_PROVISIONAL)} disabled={selectedAppIds.length === 0} className="px-6 py-2.5 bg-csir-green text-white text-[10px] font-black uppercase rounded shadow-sm disabled:opacity-30">Nominate for Selection</button>
                      <button onClick={() => handlePushToDirector('final')} disabled={!selectedPostId} className="px-8 py-2.5 bg-csir-blue text-white text-[10px] font-black uppercase rounded shadow-fluent disabled:opacity-30">Push Final List to Director</button>
                  </div>
              </div>
              <div className="bg-white rounded shadow-fluent border border-[#EDEBE9] overflow-hidden">
                  <table className="w-full text-xs text-left">
                      <thead className="bg-[#FAF9F8] font-black uppercase border-b border-[#EDEBE9]">
                          <tr>
                              <th className="px-6 py-4">App ID</th>
                              <th className="px-6 py-4">Candidate</th>
                              <th className="px-6 py-4">Written Marks (100)</th>
                              <th className="px-6 py-4">Outcome Node</th>
                              <th className="px-6 py-4 text-right">Select</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EDEBE9]">
                          {applications.filter(app => !selectedPostId || app.postId === selectedPostId).filter(a => a.status === ApplicationStatus.SHORTLISTED_FOR_TEST || a.status === ApplicationStatus.SELECTED_PROVISIONAL).map(app => (
                              <tr key={app.applicationNumber} className="hover:bg-[#FAF9F8]">
                                  <td className="px-6 py-4 font-mono font-black">{app.applicationNumber}</td>
                                  <td className="px-6 py-4 font-black uppercase">{app.personalDetails.fullName}</td>
                                  <td className="px-6 py-4">
                                      <input 
                                        type="number" 
                                        className="p-1.5 border border-[#8A8886] rounded w-24 text-center font-black" 
                                        placeholder="0-100" 
                                        value={marksInput[app.applicationNumber!] || ''}
                                        onChange={(e) => setMarksInput({...marksInput, [app.applicationNumber!]: e.target.value})}
                                      />
                                  </td>
                                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${app.status === ApplicationStatus.SELECTED_PROVISIONAL ? 'bg-green-50 text-csir-green' : 'bg-csir-light text-csir-blue'}`}>{app.status}</span></td>
                                  <td className="px-6 py-4 text-right"><input type="checkbox" checked={selectedAppIds.includes(app.applicationNumber!)} onChange={(e) => e.target.checked ? setSelectedAppIds([...selectedAppIds, app.applicationNumber!]) : setSelectedAppIds(selectedAppIds.filter(id => id !== app.applicationNumber))} /></td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {activeTab === 'outreach' && (
          <div className="space-y-12 animate-fadeIn">
              <div className="bg-white rounded-xl shadow-fluent border border-[#EDEBE9] p-12">
                  <div className="flex items-center mb-12 border-b border-[#EDEBE9] pb-8">
                      <div className="bg-csir-green/10 p-5 rounded mr-6 text-csir-green shadow-inner"><Smartphone size={36}/></div>
                      <div>
                          <h2 className="text-2xl font-black text-[#323130] uppercase tracking-tight">Mass Broadcast Console</h2>
                          <p className="text-[10px] font-black text-[#A19F9D] uppercase tracking-widest mt-1">Multi-channel communication node (WhatsApp / SMS)</p>
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                          <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-4">Step 1: Define Target Nodes</label>
                          <div className="bg-[#FAF9F8] p-6 rounded border border-[#EDEBE9]">
                              <div className="flex items-center gap-4 mb-4">
                                  <Database className="text-[#A19F9D]" size={20}/>
                                  <select className="flex-1 p-2 bg-white border border-[#8A8886] rounded text-xs font-black uppercase" value={selectedPostId} onChange={(e) => setSelectedPostId(e.target.value)}>
                                      <option value="">Fetch from Active Drive</option>
                                      {posts.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                  </select>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black text-csir-blue uppercase">
                                  <span>Selected Dataset Size:</span>
                                  <span>{selectedAppIds.length} Identity Nodes</span>
                              </div>
                          </div>
                      </div>
                      <div className="space-y-6">
                           <label className="block text-[11px] font-black uppercase tracking-[0.2em] mb-4">Step 2: Execute Transmission</label>
                           <div className="flex gap-4">
                               <button onClick={() => handleBroadcast('WHATSAPP')} className="flex-1 py-4 bg-csir-green text-white rounded font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center"><Share2 className="mr-2" size={16}/> WhatsApp</button>
                               <button onClick={() => handleBroadcast('SMS')} className="flex-1 py-4 bg-[#323130] text-white rounded font-black text-xs uppercase tracking-widest shadow-md flex items-center justify-center"><Mail className="mr-2" size={16}/> Govt SMS</button>
                           </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'approvals' && isDirector && (
          <div className="space-y-12 animate-fadeIn">
              <div className="bg-csir-blue p-10 rounded shadow-fluent-lg text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                  <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Directorate Decisions</h2>
                  <p className="text-csir-light/80 font-bold text-sm uppercase tracking-widest">Authorize vetted datasets for recruitment finalization.</p>
              </div>
              <div className="grid gap-6">
                  {posts.filter(p => p.status === PostStatus.PENDING_SHORTLIST_APPROVAL || p.status === PostStatus.PENDING_FINAL_APPROVAL).map(post => (
                      <div key={post.id} className="bg-white p-8 rounded shadow-sm border border-[#EDEBE9] flex justify-between items-center group">
                          <div>
                              <div className="flex items-center gap-4 mb-3">
                                  <h3 className="font-black text-xl text-[#323130] uppercase tracking-tight">{post.title}</h3>
                                  <span className="bg-[#FFF4CE] text-[#8A662E] text-[9px] font-black px-3 py-1 rounded uppercase tracking-[0.2em]">Pending Signature</span>
                              </div>
                              <p className="text-[10px] font-black text-[#A19F9D] uppercase tracking-widest">TYPE: {post.status === PostStatus.PENDING_SHORTLIST_APPROVAL ? 'PHASE 1: SHORTLIST' : 'PHASE 2: FINAL SELECTION'}</p>
                          </div>
                          <div className="flex gap-4">
                              <button onClick={() => handleDirectorDecision(post.id, post.status === PostStatus.PENDING_SHORTLIST_APPROVAL ? 'shortlist' : 'final', false)} className="px-6 py-2.5 border-2 border-[#EDEBE9] text-[#605E5C] hover:bg-[#FDF3F4] rounded font-black text-[10px] uppercase">Revert</button>
                              <button onClick={() => handleDirectorDecision(post.id, post.status === PostStatus.PENDING_SHORTLIST_APPROVAL ? 'shortlist' : 'final', true)} className="px-10 py-2.5 bg-csir-green text-white rounded font-black text-[10px] uppercase shadow-md transition-all">Authorize Drive</button>
                          </div>
                      </div>
                  ))}
                  {posts.filter(p => p.status === PostStatus.PENDING_SHORTLIST_APPROVAL || p.status === PostStatus.PENDING_FINAL_APPROVAL).length === 0 && (
                      <div className="text-center py-24 bg-white rounded border-2 border-dashed border-[#EDEBE9] text-[#A19F9D] font-black uppercase text-xs tracking-[0.4em]">Strategic queue is empty</div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
