import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ApplicationForm } from './pages/ApplicationForm';
import { AdminDashboard } from './pages/AdminDashboard';
import { Helpdesk } from './pages/Helpdesk';
import { Login } from './pages/Login';
import { AdminLogin } from './pages/AdminLogin';
import { Register } from './pages/Register';
import { Openings } from './pages/Openings';
import { User, UserRole } from './types';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { PostProvider } from './context/PostContext';
import { ApplicationProvider, useApplications } from './context/ApplicationContext';
import { NotificationProvider } from './context/NotificationContext';
import { HelpdeskProvider } from './context/HelpdeskContext';
import { ShieldCheck, UserPlus, LogIn, Lock } from 'lucide-react';

// Initial Data with Strong Passwords
const INITIAL_ADMIN: User = { 
  id: 'admin_ict', 
  name: 'System Administrator (ICT)', 
  email: 'ictadmin', 
  mobile: '9999999999',
  aadhaar: '111111111111', 
  role: UserRole.ADMIN,
  password: 'Dda5a3d52a#4815' 
};

const INITIAL_DIRECTOR: User = {
  id: 'director_serc',
  name: 'Director CSIR-SERC',
  email: 'director.serc@csir.res.in',
  mobile: '7777777777',
  aadhaar: '333333333333',
  role: UserRole.DIRECTOR,
  password: 'Serc@123456789'
};

const INITIAL_SUPERVISOR: User = {
  id: 'supervisor_admoff',
  name: 'Administrative Officer',
  email: 'admoff.serc@csir.res.in',
  mobile: '8888888888',
  aadhaar: '222222222222',
  role: UserRole.SUPERVISOR,
  password: 'Serc@123456789'
};

const MOCK_APPLICANT: User = { 
  id: 'user1', 
  name: 'Priya Engineer', 
  email: 'priya@example.com', 
  mobile: '9876543210',
  aadhaar: '123412341234',
  role: UserRole.APPLICANT,
};

// Dashboard Component using Context
const ApplicantDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { getUserApplications } = useApplications();
  const myApps = getUserApplications(user.aadhaar);

  return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6 text-slate-800">My Applications</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
              <div className="h-14 w-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center font-bold text-csir-blue text-xl shadow-inner">
                {user.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-xl text-slate-800">{user.name}</h3>
                <p className="text-sm text-slate-500">Aadhaar: {user.aadhaar} | Mobile: {user.mobile}</p>
              </div>
           </div>
           
           {myApps.length > 0 ? (
             <div className="space-y-4">
                {myApps.map((app, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg p-5 flex justify-between items-center hover:bg-slate-50 transition shadow-sm">
                     <div>
                       <p className="font-bold text-csir-blue text-lg">{app.postTitle}</p>
                       <p className="text-xs text-slate-500 mt-1 font-mono">App ID: {app.applicationNumber}</p>
                       <p className="text-xs text-slate-400">Submitted: {app.submittedDate}</p>
                     </div>
                     <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                            app.status === 'Selected' ? 'bg-green-100 text-green-700' : 
                            app.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                            'bg-blue-50 text-blue-700'
                        }`}>
                            {app.status || 'Submitted'}
                        </span>
                        <button className="text-xs text-blue-600 hover:underline">Download PDF</button>
                     </div>
                  </div>
                ))}
             </div>
           ) : (
             <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                 <p className="text-slate-500 mb-2">No active applications found.</p>
                 <a href="#/posts" className="px-4 py-2 bg-csir-blue text-white text-sm rounded hover:bg-blue-900 transition">View Openings</a>
             </div>
           )}
        </div>
      </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([INITIAL_ADMIN, INITIAL_SUPERVISOR, INITIAL_DIRECTOR, MOCK_APPLICANT]);

  const handleLogout = () => setUser(null);

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
    }
  };

  return (
    <SiteConfigProvider>
      <NotificationProvider>
        <PostProvider>
          <ApplicationProvider>
            <HelpdeskProvider>
              <Router>
                <Layout user={user} onLogout={handleLogout}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/posts" element={<Openings />} />
                    
                    {/* Applicant Routes */}
                    <Route path="/login" element={<Login onLogin={setUser} users={users} />} />
                    <Route path="/register" element={<Register users={users} setUsers={setUsers} />} />
                    <Route path="/dashboard" element={
                      user ? <ApplicantDashboard user={user} /> : <Navigate to="/login" />
                    } />
                    <Route path="/apply/:postId" element={user ? <ApplicationForm /> : <Navigate to="/login" />} />
                    <Route path="/helpdesk" element={<Helpdesk user={user} />} />

                    {/* Admin Routes */}
                    <Route path="/admin-login" element={<AdminLogin onLogin={setUser} users={users} />} />
                    <Route 
                      path="/admin" 
                      element={
                        (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERVISOR || user?.role === UserRole.DIRECTOR) 
                        ? <AdminDashboard users={users} updateUser={handleUserUpdate} currentUser={user} /> 
                        : <Navigate to="/admin-login" />
                      } 
                    />
                  </Routes>
                </Layout>
              </Router>
            </HelpdeskProvider>
          </ApplicationProvider>
        </PostProvider>
      </NotificationProvider>
    </SiteConfigProvider>
  );
};

export default App;