import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { ApplicationForm } from './pages/ApplicationForm';
import { AdminDashboard } from './pages/AdminDashboard';
import { User, UserRole } from './types';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { PostProvider } from './context/PostContext';
import { ShieldCheck, UserPlus, LogIn, Lock } from 'lucide-react';

// Initial Data with Strong Passwords
const INITIAL_ADMIN: User = { 
  id: 'admin_ict', 
  name: 'System Administrator (ICT)', 
  email: 'ict.serc@csir.res.in', 
  mobile: '9999999999',
  aadhaar: '111111111111', // Still kept for reference/fallback
  role: UserRole.ADMIN,
  password: 'SercAdmin@2024!#Strong' 
};

const INITIAL_SUPERVISOR: User = {
  id: 'supervisor_admoff',
  name: 'Administrative Officer',
  email: 'admoff.serc@csir.res.in',
  mobile: '8888888888',
  aadhaar: '222222222222',
  role: UserRole.SUPERVISOR,
  password: 'SercSuper@2024!#Secure'
};

const MOCK_APPLICANT: User = { 
  id: 'user1', 
  name: 'Priya Engineer', 
  email: 'priya@example.com', 
  mobile: '9876543210',
  aadhaar: '123412341234',
  role: UserRole.APPLICANT,
  // No password needed for mock applicant aadhaar login flow, or can be added
};

// Login Component
const Login: React.FC<{ onLogin: (u: User) => void, users: User[] }> = ({ onLogin, users }) => {
  const [identifier, setIdentifier] = useState(''); // Can be Aadhaar or Email
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let user: User | undefined;

    if (isAdminLogin) {
      // Admin/Supervisor Login via Email & Password
      user = users.find(u => u.email === identifier && (u.role === UserRole.ADMIN || u.role === UserRole.SUPERVISOR));
      
      if (!user) {
        setError('Invalid Email or Account does not have admin privileges.');
        return;
      }

      if (user.password !== password) {
        setError('Incorrect Password.');
        return;
      }
    } else {
      // Applicant Login via Aadhaar
      if (!/^\d{12}$/.test(identifier)) {
        setError('Please enter a valid 12-digit Aadhaar Number.');
        return;
      }
      user = users.find(u => u.aadhaar === identifier && u.role === UserRole.APPLICANT);
      
      if (!user) {
        setError('User not found. Please check Aadhaar number or register.');
        return;
      }
    }

    if (user) {
      onLogin(user);
      navigate((user.role === UserRole.ADMIN || user.role === UserRole.SUPERVISOR) ? '/admin' : '/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
           <div className="bg-csir-light p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
             <ShieldCheck className="text-csir-blue w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-slate-800">
             {isAdminLogin ? 'Official Login' : 'Applicant Login'}
           </h2>
           <p className="text-slate-500 text-sm mt-2">
             {isAdminLogin ? 'For CSIR-SERC Officials Only' : 'Enter Aadhaar Number to access portal'}
           </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isAdminLogin ? 'Official Email ID' : 'Aadhaar Number'} <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              placeholder={isAdminLogin ? "name@csir.res.in" : "12-digit Aadhaar Number"}
              className="w-full p-3 border border-slate-300 rounded focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none transition"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          {isAdminLogin && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input 
                  type="password" 
                  placeholder="Enter Password"
                  className="w-full p-3 border border-slate-300 rounded focus:border-csir-blue focus:ring-1 focus:ring-csir-blue outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Lock className="absolute right-3 top-3 text-slate-400" size={18} />
              </div>
            </div>
          )}

          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          
          <button type="submit" className="w-full py-3 bg-csir-blue text-white rounded font-semibold hover:bg-blue-900 transition flex items-center justify-center">
             <LogIn size={18} className="mr-2"/> {isAdminLogin ? 'Secure Login' : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t text-center text-sm">
           <button 
             onClick={() => { setIsAdminLogin(!isAdminLogin); setError(''); setIdentifier(''); setPassword(''); }}
             className="text-csir-blue font-bold hover:underline"
           >
             {isAdminLogin ? 'Switch to Applicant Login' : 'Official/Admin Login'}
           </button>
        </div>
        
        {!isAdminLogin && (
          <div className="mt-2 text-center text-sm">
            <p className="text-slate-600">Don't have an account? <span onClick={() => navigate('/register')} className="text-csir-blue font-bold cursor-pointer hover:underline">Register Here</span></p>
          </div>
        )}
      </div>
    </div>
  );
};

const Register: React.FC<{ users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }> = ({ users, setUsers }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', mobile: '', aadhaar: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const { name, value } = e.target;
     if ((name === 'mobile' || name === 'aadhaar') && !/^\d*$/.test(value)) return;
     setFormData({ ...formData, [name]: value });
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.aadhaar.length !== 12) {
      setError('Aadhaar number must be exactly 12 digits.');
      return;
    }
    if (formData.mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (users.some(u => u.aadhaar === formData.aadhaar)) {
      setError('This Aadhaar Number is already registered. Please login.');
      return;
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      aadhaar: formData.aadhaar,
      role: UserRole.APPLICANT
    };

    setUsers([...users, newUser]);
    alert('Registration Successful! Please login with your Aadhaar number.');
    navigate('/login');
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] py-10">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
           <div className="bg-green-50 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
             <UserPlus className="text-green-600 w-8 h-8" />
           </div>
           <h2 className="text-2xl font-bold text-slate-800">Applicant Registration</h2>
           <p className="text-slate-500 text-sm mt-2">Create an account to apply for positions.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2 border rounded" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mobile <span className="text-red-500">*</span></label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} maxLength={10} className="w-full p-2 border rounded" required placeholder="10 digits" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Aadhaar <span className="text-red-500">*</span></label>
              <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleChange} maxLength={12} className="w-full p-2 border rounded" required placeholder="12 digits" />
            </div>
          </div>
          
          {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded">{error}</p>}
          
          <button type="submit" className="w-full py-3 bg-green-600 text-white rounded font-semibold hover:bg-green-700 transition">
             Register
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
           Already registered? <span onClick={() => navigate('/login')} className="text-csir-blue font-bold cursor-pointer hover:underline">Login here</span>
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([INITIAL_ADMIN, INITIAL_SUPERVISOR, MOCK_APPLICANT]);

  const handleLogout = () => setUser(null);

  const handleUserUpdate = (updatedUser: User) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
    // If updating currently logged in user, update session state too
    if (user && user.id === updatedUser.id) {
        setUser(updatedUser);
    }
  };

  return (
    <SiteConfigProvider>
      <PostProvider>
        <Router>
          <Layout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/posts" element={<LandingPage />} />
              
              <Route path="/login" element={<Login onLogin={setUser} users={users} />} />
              <Route path="/register" element={<Register users={users} setUsers={setUsers} />} />

              {/* Protected Applicant Routes */}
              <Route path="/apply/:postId" element={user ? <ApplicationForm /> : <Navigate to="/login" />} />
              <Route path="/dashboard" element={
                user ? (
                  <div className="max-w-4xl mx-auto py-10 px-4">
                    <h1 className="text-2xl font-bold mb-6">My Applications</h1>
                    <div className="bg-white p-6 rounded shadow border">
                       <div className="flex items-center space-x-4 mb-4">
                          <div className="h-12 w-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg">{user.name}</h3>
                            <p className="text-sm text-slate-500">Aadhaar: {user.aadhaar} | Mobile: {user.mobile}</p>
                          </div>
                       </div>
                      <p className="text-slate-500">No active applications found. Check <a href="#/posts" className="text-csir-blue underline">Openings</a> to start a new application.</p>
                    </div>
                  </div>
                ) : <Navigate to="/login" />
              } />

              {/* Protected Admin Routes - Accessible by ADMIN and SUPERVISOR */}
              <Route 
                path="/admin" 
                element={
                  (user?.role === UserRole.ADMIN || user?.role === UserRole.SUPERVISOR) 
                  ? <AdminDashboard users={users} updateUser={handleUserUpdate} currentUser={user} /> 
                  : <Navigate to="/login" />
                } 
              />
            </Routes>
          </Layout>
        </Router>
      </PostProvider>
    </SiteConfigProvider>
  );
};

export default App;