import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostType, Category, ApplicationFormState, EducationEntry, ExperienceEntry, JobPost, FieldType, CustomField } from '../types';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, Wand2, Upload, Trash2, Plus, AlertCircle, FileText, X, Eye, Mail, ClipboardList } from 'lucide-react';
import { generateStatementOfPurpose } from '../services/geminiService';
import { usePosts } from '../context/PostContext';

const STEPS = [
  'Post Selection',
  'Personal Details',
  'Education',
  'Experience',
  'Publications',
  'Additional Info', // New Step for Custom Fields
  'Documents',
  'Review & Submit'
];

const INITIAL_STATE: ApplicationFormState = {
  postId: null,
  personalDetails: {
    fullName: '', dob: '', gender: '', category: Category.GEN, fatherName: '', mobile: '', aadhaar: '', address: '', nationality: 'Indian'
  },
  education: [],
  experience: [],
  publications: [],
  documents: { photo: null, signature: null, resume: null, casteCertificate: null },
  statementOfPurpose: '',
  customValues: {}
};

export const ApplicationForm: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts } = usePosts();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormState>(INITIAL_STATE);
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [previews, setPreviews] = useState<{photo: string | null, signature: string | null, resume: string | null}>({ photo: null, signature: null, resume: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation State for Custom Fields
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (postId) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setSelectedPost(post);
        setFormData(prev => ({ ...prev, postId }));
        if (currentStep === 0) setCurrentStep(1); 
      } else {
        alert("Invalid Post Selected. Redirecting to Openings.");
        navigate('/posts');
      }
    }
  }, [postId, navigate, currentStep, posts]);

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handlePrev = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      personalDetails: { ...formData.personalDetails, [e.target.name]: e.target.value }
    });
  };

  const validateCustomField = (field: CustomField, value: any) => {
    if (!field.validation) return null;
    const { pattern, minLength, maxLength, errorMessage } = field.validation;
    
    if (typeof value === 'string') {
       if (minLength && value.length < minLength) return `Minimum ${minLength} characters required.`;
       if (maxLength && value.length > maxLength) return `Maximum ${maxLength} characters allowed.`;
       if (pattern) {
         try {
           const regex = new RegExp(pattern);
           if (!regex.test(value)) return errorMessage || 'Invalid format.';
         } catch (e) { console.error("Invalid Regex in field config", e); }
       }
    }
    return null;
  };

  const handleCustomFieldChange = (field: CustomField, value: any) => {
    setFormData({
      ...formData,
      customValues: { ...formData.customValues, [field.id]: value }
    });
    
    // Validate on change
    const error = validateCustomField(field, value);
    if (error) {
       setCustomErrors(prev => ({ ...prev, [field.id]: error }));
    } else {
       const newErrors = { ...customErrors };
       delete newErrors[field.id];
       setCustomErrors(newErrors);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData.documents) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        documents: { ...formData.documents, [field]: file }
      });

      // Generate preview for images and PDF
      if (field === 'photo' || field === 'signature') {
        const url = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [field]: url }));
      } else if (field === 'resume') {
        const url = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, resume: url }));
      }
    }
  };

  const removeFile = (field: keyof typeof formData.documents) => {
    setFormData({
      ...formData,
      documents: { ...formData.documents, [field]: null }
    });
    if (previews[field]) URL.revokeObjectURL(previews[field]!);
    setPreviews(prev => ({ ...prev, [field]: null }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate SMTP Email sending
    setTimeout(() => {
        alert(`Application Submitted Successfully!\n\nAn email confirmation has been sent to ${formData.personalDetails.fullName || 'applicant'} via SMTP (simulated).`);
        setIsSubmitting(false);
        navigate('/');
    }, 2000);
  };

  const handleAiAssist = async () => {
    setIsAiGenerating(true);
    const educationSummary = formData.education.map(e => `${e.level} from ${e.institution}`).join(', ');
    const experienceSummary = formData.experience.map(e => `${e.designation} at ${e.organization}`).join(', ');
    
    const sop = await generateStatementOfPurpose(experienceSummary, educationSummary, selectedPost?.title || "Scientist Position");
    setFormData(prev => ({ ...prev, statementOfPurpose: sop }));
    setIsAiGenerating(false);
  };

  const addEducation = () => {
    const newEdu: EducationEntry = { id: Date.now().toString(), level: '', institution: '', board: '', year: '', percentage: '' };
    setFormData({ ...formData, education: [...formData.education, newEdu] });
  };

  const updateEducation = (id: string, field: keyof EducationEntry, value: string) => {
    setFormData({
      ...formData,
      education: formData.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  // Logic to determine if a field should be shown
  const isFieldVisible = (field: CustomField) => {
    if (!field.logic) return true;
    
    const { dependsOnFieldId, condition, value } = field.logic;
    const dependencyValue = String(formData.customValues[dependsOnFieldId] || '');

    switch (condition) {
      case 'EQUALS': return dependencyValue === value;
      case 'NOT_EQUALS': return dependencyValue !== value;
      case 'CONTAINS': return dependencyValue.includes(value);
      default: return true;
    }
  };

  const renderCustomFields = () => {
    if (!selectedPost?.customFields || selectedPost.customFields.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500">
           <p>No additional specific details required for this post.</p>
           <p className="text-sm">Please proceed to the next step.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 flex items-center">
            <span className="bg-blue-100 p-2 rounded-full mr-3 text-csir-blue"><ClipboardList size={20}/></span> 
            Additional Details for {selectedPost.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {selectedPost.customFields.map((field) => {
             if (!isFieldVisible(field)) return null;

             const value = formData.customValues[field.id] || '';
             const error = customErrors[field.id];
             
             if (field.type === FieldType.TEXTAREA) {
               return (
                 <div key={field.id} className="md:col-span-2">
                   <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                   <textarea 
                     className={`w-full p-2 border rounded outline-none ${error ? 'border-red-500 bg-red-50' : 'focus:border-csir-blue'}`}
                     placeholder={field.placeholder}
                     value={value as string}
                     onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                   />
                   {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                 </div>
               );
             }

             if (field.type === FieldType.DROPDOWN) {
               return (
                 <div key={field.id}>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                   <select 
                     className="w-full p-2 border rounded focus:border-csir-blue outline-none"
                     value={value as string}
                     onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                   >
                     <option value="">Select Option</option>
                     {field.options?.map((opt) => (
                       <option key={opt} value={opt}>{opt}</option>
                     ))}
                   </select>
                 </div>
               );
             }

             if (field.type === FieldType.CHECKBOX) {
                return (
                 <div key={field.id} className="flex items-center mt-6">
                   <input 
                     type="checkbox" 
                     className="h-4 w-4 text-csir-blue border-slate-300 rounded"
                     checked={!!value}
                     onChange={(e) => handleCustomFieldChange(field, e.target.checked)}
                   />
                   <label className="ml-2 block text-sm font-medium text-slate-700">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                 </div>
                );
             }

             if (field.type === FieldType.RADIO) {
                return (
                 <div key={field.id}>
                   <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                   <div className="flex space-x-4 mt-2">
                     {field.options?.map((opt) => (
                       <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                         <input 
                           type="radio" 
                           name={field.id}
                           value={opt}
                           checked={value === opt}
                           onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                           className="text-csir-blue focus:ring-csir-blue"
                         />
                         <span className="text-sm text-slate-700">{opt}</span>
                       </label>
                     ))}
                   </div>
                 </div>
                );
             }

             if (field.type === FieldType.FILE) {
                return (
                  <div key={field.id}>
                     <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                     <input 
                       type="file" 
                       className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-csir-blue hover:file:bg-blue-100"
                       onChange={(e) => handleCustomFieldChange(field, e.target.files?.[0])}
                     />
                     {value && <p className="text-xs text-green-600 mt-1">File Selected: {(value as File).name}</p>}
                  </div>
                );
             }

             return (
               <div key={field.id}>
                 <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} {field.required && <span className="text-red-500">*</span>}</label>
                 <input 
                   type={field.type} 
                   className={`w-full p-2 border rounded outline-none ${error ? 'border-red-500 bg-red-50' : 'focus:border-csir-blue'}`}
                   placeholder={field.placeholder}
                   value={value as string}
                   onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                 />
                 {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
               </div>
             );
          })}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0: return (
        <div className="p-6">
           <h2 className="text-xl font-bold mb-4">Select Post</h2>
           <p>Please go back to "Openings" to select a post if not selected.</p>
           <button onClick={() => navigate('/posts')} className="mt-4 px-4 py-2 bg-csir-blue text-white rounded">Go to Openings</button>
        </div>
      );
      case 1: return (
        <div className="space-y-6 animate-fadeIn">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 flex items-center">
            <span className="bg-blue-100 p-2 rounded-full mr-3 text-csir-blue"><CheckCircle size={20}/></span> 
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" name="fullName" value={formData.personalDetails.fullName} onChange={handlePersonalChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-csir-blue focus:ring focus:ring-blue-200 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Date of Birth</label>
              <input type="date" name="dob" value={formData.personalDetails.dob} onChange={handlePersonalChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-csir-blue focus:ring focus:ring-blue-200 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Category</label>
              <select name="category" value={formData.personalDetails.category} onChange={handlePersonalChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-csir-blue focus:ring focus:ring-blue-200 p-2 border">
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Mobile Number</label>
              <input type="tel" name="mobile" value={formData.personalDetails.mobile} onChange={handlePersonalChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-csir-blue focus:ring focus:ring-blue-200 p-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Aadhaar Number <span className="text-red-500">*</span></label>
              <input type="text" name="aadhaar" value={formData.personalDetails.aadhaar} onChange={handlePersonalChange} maxLength={12} placeholder="12-digit UIDAI No." className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-csir-blue focus:ring focus:ring-blue-200 p-2 border" />
              <p className="text-xs text-slate-500 mt-1">For verification only (Local)</p>
            </div>
             <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700">Address for Communication</label>
              <textarea name="address" rows={3} value={formData.personalDetails.address} onChange={handlePersonalChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-csir-blue focus:ring focus:ring-blue-200 p-2 border" />
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6">
           <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold text-slate-800">Educational Qualifications</h2>
            <button onClick={addEducation} className="flex items-center text-sm bg-csir-light text-csir-blue px-3 py-1 rounded hover:bg-blue-100 font-medium border border-csir-blue"><Plus size={16} className="mr-1"/> Add Education</button>
           </div>
           {formData.education.map((edu, index) => (
             <div key={edu.id} className="p-4 bg-slate-50 rounded border border-slate-200 relative group hover:border-blue-300 transition-colors">
                <button onClick={() => setFormData({...formData, education: formData.education.filter(e => e.id !== edu.id)})} className="absolute top-2 right-2 text-red-500 hover:text-red-700 opacity-50 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="space-y-1">
                      <label className="text-xs text-slate-500">Level</label>
                      <input placeholder="e.g. 10th/PhD" value={edu.level} onChange={e => updateEducation(edu.id, 'level', e.target.value)} className="w-full p-2 border rounded focus:border-csir-blue outline-none" />
                  </div>
                  <div className="space-y-1 lg:col-span-2">
                       <label className="text-xs text-slate-500">Institution / University</label>
                       <input placeholder="University Name" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="w-full p-2 border rounded focus:border-csir-blue outline-none" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-slate-500">Year</label>
                      <input placeholder="YYYY" type="number" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} className="w-full p-2 border rounded focus:border-csir-blue outline-none" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs text-slate-500">Score (%)</label>
                      <input placeholder="%" value={edu.percentage} onChange={e => updateEducation(edu.id, 'percentage', e.target.value)} className="w-full p-2 border rounded focus:border-csir-blue outline-none" />
                  </div>
                </div>
             </div>
           ))}
           {formData.education.length === 0 && <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200"><p className="text-slate-500">Click "Add Education" to enter your qualifications.</p></div>}
        </div>
      );
      case 3: return (
        <div className="space-y-6">
           <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold text-slate-800">Experience Details</h2>
            <button className="flex items-center text-sm bg-csir-light text-csir-blue px-3 py-1 rounded hover:bg-blue-100 font-medium border border-csir-blue"><Plus size={16} className="mr-1"/> Add Experience</button>
           </div>
           
           <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
               <label className="block text-sm font-bold text-slate-800 flex items-center">
                   Statement of Purpose <span className="text-red-500 ml-1">*</span>
               </label>
               <button 
                onClick={handleAiAssist}
                disabled={isAiGenerating}
                className="flex items-center text-xs bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full hover:shadow-md disabled:opacity-50 transition-all"
               >
                 <Wand2 size={14} className="mr-1" />
                 {isAiGenerating ? 'Generating...' : 'Generate with Gemini AI'}
               </button>
             </div>
             <textarea 
               value={formData.statementOfPurpose}
               onChange={(e) => setFormData({...formData, statementOfPurpose: e.target.value})}
               rows={8}
               className="w-full p-4 border border-slate-200 rounded-md focus:ring-2 focus:ring-purple-200 focus:border-purple-500 font-sans text-sm leading-relaxed"
               placeholder="Describe your motivation, relevant experience, and suitability for this post..."
             />
             <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-slate-500">This section helps us understand your career goals.</p>
                <p className="text-xs text-slate-400">{formData.statementOfPurpose.length} chars</p>
             </div>
           </div>
        </div>
      );
      case 5: return renderCustomFields();
      case 6: return (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-slate-800 border-b pb-2">Document Upload</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Photo Upload with Preview */}
            <div className={`group relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${previews.photo ? 'border-csir-blue bg-blue-50/50' : 'border-slate-300 hover:border-csir-blue hover:bg-slate-50'}`}>
              <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {previews.photo && <button onClick={() => removeFile('photo')} className="bg-white p-1 rounded-full shadow hover:text-red-600"><X size={16}/></button>}
              </div>
              
              <div className="mb-4 flex justify-center">
                  {previews.photo ? (
                    <img src={previews.photo} alt="Preview" className="h-32 w-32 object-cover rounded-full border-4 border-white shadow-md" />
                  ) : (
                    <div className="h-24 w-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <Upload size={32} />
                    </div>
                  )}
              </div>
              
              <h3 className="font-semibold text-slate-800 mb-1">Passport Photo</h3>
              <p className="text-xs text-slate-500 mb-4">JPG, PNG (Max 200KB)</p>
              
              {!previews.photo && (
                <label className="cursor-pointer inline-block px-4 py-2 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
                    Select Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'photo')} />
                </label>
              )}
            </div>

            {/* Signature Upload with Preview */}
            <div className={`group relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${previews.signature ? 'border-csir-blue bg-blue-50/50' : 'border-slate-300 hover:border-csir-blue hover:bg-slate-50'}`}>
               <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {previews.signature && <button onClick={() => removeFile('signature')} className="bg-white p-1 rounded-full shadow hover:text-red-600"><X size={16}/></button>}
              </div>

               <div className="mb-4 flex justify-center items-center h-32">
                  {previews.signature ? (
                    <img src={previews.signature} alt="Preview" className="max-h-24 max-w-full object-contain border border-slate-200 bg-white p-2 rounded" />
                  ) : (
                    <div className="h-16 w-32 bg-slate-100 rounded flex items-center justify-center text-slate-400">
                        <Upload size={32} />
                    </div>
                  )}
              </div>

              <h3 className="font-semibold text-slate-800 mb-1">Signature</h3>
              <p className="text-xs text-slate-500 mb-4">JPG, PNG (Max 50KB)</p>
              
              {!previews.signature && (
                 <label className="cursor-pointer inline-block px-4 py-2 bg-white border border-slate-300 rounded text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm">
                    Select Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'signature')} />
                </label>
              )}
            </div>

            {/* Resume Upload with PDF Preview */}
            <div className="md:col-span-2">
                <div className={`border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${previews.resume ? 'border-csir-blue bg-blue-50/30' : 'border-slate-300 hover:border-csir-blue hover:bg-slate-50'}`}>
                   <div className="flex flex-col items-center">
                       <div className="p-3 bg-blue-100 text-csir-blue rounded-full mb-3">
                           <FileText size={24} />
                       </div>
                       <h3 className="font-semibold text-slate-800">Curriculum Vitae / Resume</h3>
                       <p className="text-xs text-slate-500 mb-4">PDF Format Only (Max 2MB)</p>
                       
                       {!previews.resume ? (
                           <label className="cursor-pointer px-6 py-2 bg-csir-blue text-white rounded shadow hover:bg-blue-800 transition-colors text-sm font-medium">
                               Upload PDF
                               <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileChange(e, 'resume')} />
                           </label>
                       ) : (
                           <div className="w-full flex flex-col items-center">
                               <div className="flex items-center space-x-2 text-sm text-green-700 font-medium mb-4 bg-green-50 px-4 py-1 rounded-full border border-green-200">
                                   <CheckCircle size={14}/> <span>File Selected: {formData.documents.resume?.name}</span>
                                   <button onClick={() => removeFile('resume')} className="ml-2 text-red-500 hover:text-red-700"><X size={14}/></button>
                               </div>
                               <div className="w-full h-96 border rounded-lg overflow-hidden bg-slate-200 shadow-inner">
                                   <embed src={previews.resume} type="application/pdf" width="100%" height="100%" />
                               </div>
                           </div>
                       )}
                   </div>
                </div>
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-6 text-center animate-fadeIn">
          <div className="bg-green-50 text-green-800 p-8 rounded-xl mb-6 border border-green-100">
            <CheckCircle className="mx-auto h-20 w-20 text-green-500 mb-4" />
            <h2 className="text-3xl font-bold">Review Your Application</h2>
            <p className="mt-2 text-green-700">Please ensure all details are correct. Once submitted, you cannot modify the application.</p>
          </div>
          <div className="text-left bg-white p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
               <div className="border-b pb-2">
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Full Name</label>
                 <p className="font-medium text-lg text-slate-800">{formData.personalDetails.fullName}</p>
               </div>
               <div className="border-b pb-2">
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Post Applied For</label>
                 <p className="font-medium text-lg text-slate-800">{selectedPost?.title}</p>
               </div>
               <div className="border-b pb-2">
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Aadhaar</label>
                 <p className="font-medium text-lg text-slate-800">{formData.personalDetails.aadhaar}</p>
               </div>
               <div className="border-b pb-2">
                 <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Contact</label>
                 <p className="font-medium text-lg text-slate-800">{formData.personalDetails.mobile}</p>
               </div>
               {/* Custom Fields Review */}
               {selectedPost?.customFields?.map(field => {
                  if (!isFieldVisible(field)) return null;
                  let val = formData.customValues[field.id];
                  if (field.type === FieldType.FILE && val) val = (val as File).name;
                  
                  return (
                    <div key={field.id} className="border-b pb-2">
                      <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">{field.label}</label>
                      <p className="font-medium text-lg text-slate-800">{String(val || '-')}</p>
                    </div>
                  );
               })}
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg">
              <h4 className="font-bold text-slate-700 mb-3 flex items-center"><FileText size={18} className="mr-2"/> Documents Check</h4>
              <div className="grid grid-cols-3 gap-4">
                  <div className={`flex items-center text-sm ${formData.documents.photo ? 'text-green-600' : 'text-red-500'}`}>
                      {formData.documents.photo ? <CheckCircle size={16} className="mr-1"/> : <AlertCircle size={16} className="mr-1"/>} Photo
                  </div>
                  <div className={`flex items-center text-sm ${formData.documents.signature ? 'text-green-600' : 'text-red-500'}`}>
                      {formData.documents.signature ? <CheckCircle size={16} className="mr-1"/> : <AlertCircle size={16} className="mr-1"/>} Signature
                  </div>
                  <div className={`flex items-center text-sm ${formData.documents.resume ? 'text-green-600' : 'text-red-500'}`}>
                      {formData.documents.resume ? <CheckCircle size={16} className="mr-1"/> : <AlertCircle size={16} className="mr-1"/>} Resume
                  </div>
              </div>
            </div>
          </div>
        </div>
      );
      default: return <div>Step content coming soon...</div>;
    }
  };

  if (isSubmitting) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-csir-blue mb-4"></div>
              <h2 className="text-xl font-bold text-slate-800">Submitting Application...</h2>
              <p className="text-slate-500 mt-2 flex items-center"><Mail size={16} className="mr-2"/> Sending Confirmation Email via SMTP</p>
          </div>
      )
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      {/* Post Details Header */}
      {selectedPost && (
        <div className="bg-white border-l-4 border-csir-blue p-6 rounded shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{selectedPost.title}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
               <span className="flex items-center"><AlertCircle size={14} className="mr-1 text-csir-accent" /> Post Code: {selectedPost.code}</span>
               <span className="flex items-center"><ArrowRight size={14} className="mr-1" /> Dept: {selectedPost.department}</span>
               <span className="flex items-center text-red-600 font-medium">Deadline: {selectedPost.lastDate}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-blue-50 px-6 py-3 rounded-lg text-center border border-blue-100">
            <span className="block text-3xl font-bold text-csir-blue">{selectedPost.vacancies}</span>
            <span className="text-xs text-blue-800 uppercase font-bold tracking-wide">Vacancies</span>
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -z-10 rounded"></div>
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={idx} className="flex flex-col items-center bg-slate-50 px-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                  isCompleted ? 'bg-green-500 text-white scale-100' : 
                  isCurrent ? 'bg-csir-blue text-white scale-110 ring-4 ring-blue-100' : 'bg-white text-slate-400 border-2 border-slate-200'
                }`}>
                  {isCompleted ? <CheckCircle size={20} /> : idx + 1}
                </div>
                <span className={`text-[10px] md:text-xs mt-2 uppercase tracking-wide hidden md:block ${isCurrent ? 'font-bold text-csir-blue' : 'text-slate-400'}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-8 min-h-[400px]">
          {renderStepContent()}
        </div>
        
        {/* Footer Actions */}
        <div className="bg-slate-50 px-8 py-5 border-t flex justify-between items-center">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="flex items-center px-6 py-2.5 border border-slate-300 rounded-md text-slate-700 hover:bg-white disabled:opacity-50 transition-colors font-medium shadow-sm"
          >
            <ArrowLeft size={18} className="mr-2" /> Previous
          </button>
          
          {currentStep === STEPS.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="flex items-center px-8 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-md font-bold text-lg"
            >
              <Save size={20} className="mr-2" /> Submit Application
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex items-center px-8 py-2.5 bg-csir-blue text-white rounded-md hover:bg-blue-900 transition-colors shadow-md font-medium"
            >
              Next <ArrowRight size={18} className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};