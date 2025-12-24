import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, FileText, CheckCircle, Clock, Settings, Mail, Save, LayoutTemplate, PenTool, Plus, Trash2, Lock, UserCog, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { usePosts } from '../context/PostContext';
import { FieldType, CustomField, User, UserRole } from '../types';

interface AdminDashboardProps {
  users?: User[];
  updateUser?: (user: User) => void;
  currentUser?: User;
}

const data = [
  { name: 'Scientist', applications: 120, vacancies: 4 },
  { name: 'Tech Officer', applications: 85, vacancies: 2 },
  { name: 'Technician', applications: 450, vacancies: 15 },
  { name: 'Tech Asst', applications: 230, vacancies: 10 },
];

const categoryData = [
  { name: 'General', value: 400 },
  { name: 'OBC', value: 300 },
  { name: 'SC', value: 150 },
  { name: 'ST', value: 50 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-bold text-slate-800 mt-1">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        {React.cloneElement(icon as React.ReactElement, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
      </div>
    </div>
  </div>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, updateUser, currentUser }) => {
  const { config, updateConfig } = useSiteConfig();
  const { posts, updatePost } = usePosts();
  const [localConfig, setLocalConfig] = useState(config);
  const [saveStatus, setSaveStatus] = useState('');
  
  // Form Builder State
  const [selectedPostId, setSelectedPostId] = useState<string>(posts[0]?.id || '');
  const [newField, setNewField] = useState<Partial<CustomField>>({ type: FieldType.TEXT, required: false });
  const [showAdvanced, setShowAdvanced] = useState(false);

  // User Management State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPassword, setEditPassword] = useState('');

  const handleConfigChange = (section: 'header' | 'footer', field: string, value: string) => {
    setLocalConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveConfiguration = () => {
    updateConfig(localConfig);
    setSaveStatus('Saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handleAddField = () => {
    if (!selectedPostId || !newField.label) return;
    
    const postToUpdate = posts.find(p => p.id === selectedPostId);
    if (!postToUpdate) return;

    const fieldToAdd: CustomField = {
      id: `cf-${Date.now()}`,
      label: newField.label,
      type: newField.type || FieldType.TEXT,
      required: !!newField.required,
      placeholder: newField.placeholder,
      options: newField.options ? (newField.options as unknown as string).split(',').map(s => s.trim()) : undefined,
      validation: newField.validation,
      logic: newField.logic
    };

    const updatedPost = {
      ...postToUpdate,
      customFields: [...(postToUpdate.customFields || []), fieldToAdd]
    };

    updatePost(updatedPost);
    setNewField({ type: FieldType.TEXT, required: false, label: '', placeholder: '', options: undefined, validation: undefined, logic: undefined }); 
    setShowAdvanced(false);
  };

  const handleDeleteField = (fieldId: string) => {
    const postToUpdate = posts.find(p => p.id === selectedPostId);
    if (!postToUpdate) return;

    const updatedPost = {
      ...postToUpdate,
      customFields: postToUpdate.customFields?.filter(f => f.id !== fieldId)
    };
    updatePost(updatedPost);
  };

  const handleUpdatePassword = (userId: string) => {
    if(!updateUser || !users) return;
    const userToUpdate = users.find(u => u.id === userId);
    if (userToUpdate && editPassword) {
        updateUser({ ...userToUpdate, password: editPassword });
        alert(`Password updated for ${userToUpdate.name}`);
        setEditPassword('');
        setEditingUserId(null);
    }
  };

  const selectedPostForBuilder = posts.find(p => p.id === selectedPostId);
  const adminUsers = users?.filter(u => u.role === UserRole.ADMIN || u.role === UserRole.SUPERVISOR) || [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Recruitment Dashboard</h1>
        <div className="flex space-x-2">
            <button className="px-4 py-2 bg-white border rounded shadow-sm text-sm hover:bg-slate-50">Download Report</button>
            <button className="px-4 py-2 bg-csir-blue text-white rounded shadow-sm text-sm hover:bg-blue-800">New Post</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Applications" value="885" icon={<FileText />} color="text-blue-600" />
        <StatCard title="Under Scrutiny" value="124" icon={<Clock />} color="text-yellow-600" />
        <StatCard title="Eligible Candidates" value="450" icon={<CheckCircle />} color="text-green-600" />
        <StatCard title="Interviews Scheduled" value="45" icon={<Users />} color="text-purple-600" />
      </div>

      {/* Account Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center">
           <UserCog className="text-slate-500 mr-2" size={20}/>
           <h3 className="font-bold text-slate-700">Official Account Management</h3>
        </div>
        <div className="p-6">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email (Login ID)</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Password</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {adminUsers.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-csir-blue">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {editingUserId === u.id ? (
                                        <input 
                                          type="text" 
                                          className="border p-1 rounded w-full" 
                                          placeholder="New Strong Password" 
                                          value={editPassword}
                                          onChange={(e) => setEditPassword(e.target.value)}
                                        />
                                    ) : (
                                        <span className="font-mono text-xs">••••••••••</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {editingUserId === u.id ? (
                                        <div className="flex justify-end space-x-2">
                                            <button onClick={() => handleUpdatePassword(u.id)} className="text-green-600 hover:text-green-900">Save</button>
                                            <button onClick={() => { setEditingUserId(null); setEditPassword(''); }} className="text-gray-500 hover:text-gray-700">Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => { setEditingUserId(u.id); setEditPassword(u.password || ''); }} className="text-csir-blue hover:text-blue-900">Change Password</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="mt-4 text-xs text-slate-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                <span className="font-bold">Note:</span> Default Credentials.<br/>
                Admin: ict.serc@csir.res.in / SercAdmin@2024!#Strong<br/>
                Supervisor: admoff.serc@csir.res.in / SercSuper@2024!#Secure
            </p>
        </div>
      </div>

      {/* Dynamic Form Builder */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center">
           <PenTool className="text-slate-500 mr-2" size={20}/>
           <h3 className="font-bold text-slate-700">Dynamic Form Builder</h3>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Post to Edit Form:</label>
            <select 
              className="w-full md:w-1/2 p-2 border rounded text-sm focus:border-csir-blue outline-none"
              value={selectedPostId}
              onChange={(e) => setSelectedPostId(e.target.value)}
            >
              {posts.map(p => <option key={p.id} value={p.id}>{p.code} - {p.title}</option>)}
            </select>
          </div>

          {selectedPostForBuilder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Existing Fields List */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200">
                <h4 className="font-semibold text-sm text-slate-700 mb-4">Current Custom Fields</h4>
                {(!selectedPostForBuilder.customFields || selectedPostForBuilder.customFields.length === 0) && (
                  <p className="text-xs text-slate-500 italic">No custom fields added yet.</p>
                )}
                <ul className="space-y-2">
                  {selectedPostForBuilder.customFields?.map(field => (
                    <li key={field.id} className="bg-white p-3 rounded shadow-sm border border-slate-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium text-sm text-slate-800 block">{field.label}</span>
                          <span className="text-xs text-slate-500 uppercase font-semibold">{field.type} {field.required ? '(Required)' : ''}</span>
                        </div>
                        <button onClick={() => handleDeleteField(field.id)} className="text-red-500 hover:text-red-700 p-1">
                          <Trash2 size={16} />
                        </button>
                      </div>
                      {/* Logic Indicator */}
                      {field.logic && (
                         <div className="mt-2 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100 flex items-center">
                            <Sliders size={10} className="mr-1"/> 
                            Shows if Field "{selectedPostForBuilder.customFields?.find(f => f.id === field.logic?.dependsOnFieldId)?.label.substring(0, 15)}..." {field.logic.condition} "{field.logic.value}"
                         </div>
                      )}
                      {/* Validation Indicator */}
                      {field.validation && (
                        <div className="mt-1 text-xs text-slate-400">
                          {field.validation.pattern && <span>Regex Pattern Active. </span>}
                          {field.validation.maxLength && <span>Max: {field.validation.maxLength} chars.</span>}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Add New Field Form */}
              <div className="border border-slate-200 p-4 rounded bg-white">
                <h4 className="font-semibold text-sm text-slate-700 mb-4">Add New Field</h4>
                <div className="space-y-3">
                   <div>
                     <label className="block text-xs font-medium text-slate-600 mb-1">Field Label</label>
                     <input 
                        type="text" 
                        className="w-full p-2 border rounded text-sm" 
                        value={newField.label || ''}
                        onChange={(e) => setNewField({...newField, label: e.target.value})}
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Field Type</label>
                        <select 
                           className="w-full p-2 border rounded text-sm"
                           value={newField.type}
                           onChange={(e) => setNewField({...newField, type: e.target.value as FieldType})}
                        >
                           {Object.values(FieldType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                     </div>
                     <div className="flex items-center pt-5">
                        <input 
                           type="checkbox" 
                           id="req"
                           className="mr-2"
                           checked={newField.required}
                           onChange={(e) => setNewField({...newField, required: e.target.checked})}
                        />
                        <label htmlFor="req" className="text-sm text-slate-600">Required Field</label>
                     </div>
                   </div>
                   
                   {(newField.type === FieldType.DROPDOWN || newField.type === FieldType.RADIO) && (
                     <div>
                       <label className="block text-xs font-medium text-slate-600 mb-1">Options (comma separated)</label>
                       <input 
                          type="text" 
                          placeholder="Option 1, Option 2, Option 3"
                          className="w-full p-2 border rounded text-sm" 
                          onChange={(e) => setNewField({...newField, options: (e.target.value as unknown as string[])})}
                        />
                     </div>
                   )}

                   <div>
                     <label className="block text-xs font-medium text-slate-600 mb-1">Placeholder</label>
                     <input 
                        type="text" 
                        className="w-full p-2 border rounded text-sm" 
                        value={newField.placeholder || ''}
                        onChange={(e) => setNewField({...newField, placeholder: e.target.value})}
                      />
                   </div>

                   {/* Advanced Options Toggle */}
                   <div className="border-t pt-2 mt-2">
                     <button 
                       type="button"
                       className="flex items-center text-xs font-bold text-csir-blue hover:text-blue-800"
                       onClick={() => setShowAdvanced(!showAdvanced)}
                     >
                        {showAdvanced ? <ChevronUp size={14} className="mr-1"/> : <ChevronDown size={14} className="mr-1"/>}
                        Advanced Options (Logic & Validation)
                     </button>

                     {showAdvanced && (
                        <div className="mt-3 space-y-3 bg-slate-50 p-3 rounded border border-slate-200">
                          {/* Conditional Logic */}
                          <div className="border-b pb-2 mb-2">
                             <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Conditional Visibility</h5>
                             <div className="grid grid-cols-3 gap-2">
                                <select 
                                  className="text-xs p-1 border rounded"
                                  onChange={(e) => setNewField({...newField, logic: { ...newField.logic, dependsOnFieldId: e.target.value } as any})}
                                >
                                  <option value="">Depends On...</option>
                                  {selectedPostForBuilder.customFields?.map(f => (
                                     <option key={f.id} value={f.id}>{f.label}</option>
                                  ))}
                                </select>
                                <select 
                                   className="text-xs p-1 border rounded"
                                   onChange={(e) => setNewField({...newField, logic: { ...newField.logic, condition: e.target.value } as any})}
                                >
                                   <option value="EQUALS">Equals</option>
                                   <option value="NOT_EQUALS">Not Equals</option>
                                </select>
                                <input 
                                  type="text" 
                                  placeholder="Value" 
                                  className="text-xs p-1 border rounded"
                                  onChange={(e) => setNewField({...newField, logic: { ...newField.logic, value: e.target.value } as any})}
                                />
                             </div>
                          </div>

                          {/* Validation */}
                          <div>
                             <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Validation Rules</h5>
                             <div className="space-y-2">
                                <input 
                                  type="text" 
                                  placeholder="Regex Pattern (e.g. ^[0-9]{10}$)" 
                                  className="w-full text-xs p-1 border rounded"
                                  onChange={(e) => setNewField({...newField, validation: { ...newField.validation, pattern: e.target.value }})}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                   <input 
                                     type="number" 
                                     placeholder="Min Length" 
                                     className="text-xs p-1 border rounded"
                                     onChange={(e) => setNewField({...newField, validation: { ...newField.validation, minLength: parseInt(e.target.value) }})}
                                   />
                                   <input 
                                     type="number" 
                                     placeholder="Max Length" 
                                     className="text-xs p-1 border rounded"
                                     onChange={(e) => setNewField({...newField, validation: { ...newField.validation, maxLength: parseInt(e.target.value) }})}
                                   />
                                </div>
                                <input 
                                  type="text" 
                                  placeholder="Error Message (e.g. Invalid Format)" 
                                  className="w-full text-xs p-1 border rounded"
                                  onChange={(e) => setNewField({...newField, validation: { ...newField.validation, errorMessage: e.target.value }})}
                                />
                             </div>
                          </div>
                        </div>
                     )}
                   </div>

                   <button 
                      onClick={handleAddField}
                      className="w-full py-2 bg-csir-blue text-white rounded hover:bg-blue-900 transition flex justify-center items-center text-sm font-medium"
                   >
                     <Plus size={16} className="mr-2"/> Add Field to Form
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};