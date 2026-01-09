import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Added ApplicationStatus to types import
import { PostType, Category, ApplicationFormState, ApplicationStatus, EducationEntry, ExperienceEntry, JobPost, FieldType, CustomField } from '../types';
// Added missing lucide-react icons: Fingerprint, Layers, Loader, XCircle, Search, Calendar, Rocket
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, Wand2, Upload, Trash2, Plus, AlertCircle, FileText, X, Eye, Mail, ClipboardList, Printer, Download, CloudUpload, Image as ImageIcon, FileCheck, ScanLine, Sparkles, Fingerprint, Layers, Loader, XCircle, Search, Calendar, Rocket } from 'lucide-react';
import { generateStatementOfPurpose } from '../services/geminiService';
import { usePosts } from '../context/PostContext';
import { useApplications } from '../context/ApplicationContext';
import { useNotifications } from '../context/NotificationContext';

const STEPS = [
  'Post Selection',
  'Identity',
  'Academics',
  'Work Experience',
  'SOP',
  'Specifics', 
  'Artifacts',
  'Verification'
];

const INITIAL_STATE: ApplicationFormState = {
  postId: null,
  personalDetails: {
    fullName: '', dob: '', gender: '', category: Category.GEN, fatherName: '', mobile: '', aadhaar: '', address: '', nationality: 'Indian'
  },
  education: [],
  experience: [],
  documents: { photo: null, signature: null, resume: null, casteCertificate: null },
  statementOfPurpose: '',
  customValues: {}
};

// --- MODERN UPLOAD COMPONENT ---
interface FluentUploadProps {
  label: string;
  subLabel: string;
  accept: string;
  field: keyof ApplicationFormState['documents'];
  previewUrl: string | null;
  file: File | null;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>, field: any) => void;
  onRemove: (field: any) => void;
  type: 'image' | 'pdf';
  aspectRatioClass?: string; 
}

const FluentUploadZone: React.FC<FluentUploadProps> = ({ 
  label, subLabel, accept, field, previewUrl, file, onUpload, onRemove, type, aspectRatioClass 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(e.dataTransfer.files[0]);
      
      const syntheticEvent = {
        target: { files: dataTransfer.files, value: '' }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      onUpload(syntheticEvent, field);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full">
      <label className="text-xs font-black text-slate-800 uppercase tracking-widest mb-3 flex items-center">
        {label} <span className="text-red-500 ml-1">*</span>
      </label>
      
      {!file ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 relative group cursor-pointer border-2 border-dashed rounded-3xl transition-all duration-300 ease-out flex flex-col items-center justify-center p-10 text-center
            ${isDragging 
              ? 'border-brand-500 bg-brand-50' 
              : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50 bg-white'
            }`}
        >
          <div className={`p-5 rounded-2xl mb-4 transition-all duration-300 ${isDragging ? 'bg-white text-brand-600 scale-110 shadow-lg shadow-brand-100' : 'bg-slate-100 text-slate-400 group-hover:text-brand-500 group-hover:scale-110'}`}>
            {type === 'image' ? <ImageIcon size={32} /> : <CloudUpload size={32} />}
          </div>
          <p className="text-slate-900 font-bold mb-1">
            <span className="text-brand-600">Select file</span> or drag here
          </p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{subLabel}</p>
          <input 
            ref={inputRef}
            type="file" 
            accept={accept} 
            className="hidden" 
            onChange={(e) => onUpload(e, field)} 
          />
        </div>
      ) : (
        <div className="relative flex-1 bg-white border border-slate-200 rounded-3xl p-6 shadow-card flex flex-col items-center justify-center overflow-hidden group">
          <button 
            onClick={() => onRemove(field)}
            className="absolute top-4 right-4 p-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-all z-20 shadow-sm"
            title="Remove file"
          >
            <X size={16} />
          </button>

          {type === 'image' && previewUrl ? (
            <div className={`relative ${aspectRatioClass} w-40 border-4 border-white shadow-xl rounded-2xl overflow-hidden mb-4 bg-slate-50`}>
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="mb-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
               <FileText size={48} className="text-brand-600" />
            </div>
          )}

          <div className="text-center w-full px-2">
            <p className="text-sm font-black text-slate-900 truncate w-full" title={file.name}>
              {file.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-widest flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 shadow-sm animate-pulse"></span>
              {formatFileSize(file.size)} • Ready for submission
            </p>
          </div>
        </div>
      )}
    </div>
  );
};


export const ApplicationForm: React.FC = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { posts } = usePosts();
  const { submitApplication } = useApplications();
  const { sendWhatsApp, sendEmail } = useNotifications();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<ApplicationFormState>(INITIAL_STATE);
  const [selectedPost] = useState<JobPost | null>(() => posts.find(p => p.id === postId) || null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [previews, setPreviews] = useState<{photo: string | null, signature: string | null, resume: string | null}>({ photo: null, signature: null, resume: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (postId) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setFormData(prev => ({ ...prev, postId, postTitle: post.title }));
        if (currentStep === 0) setCurrentStep(1); 
      } else {
        navigate('/posts');
      }
    }
  }, [postId, navigate, currentStep, posts]);

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  };
  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handlePersonalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      personalDetails: { ...formData.personalDetails, [e.target.name]: e.target.value }
    });
  };

  const handleCustomFieldChange = (field: CustomField, value: any) => {
    setFormData({
      ...formData,
      customValues: { ...formData.customValues, [field.id]: value }
    });
  };

  const processImage = (file: File, widthRatio: number, heightRatio: number, callback: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const targetWidth = 413; 
        const targetHeight = 531;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
           const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
           const x = (targetWidth / scale - img.width) / 2;
           const y = (targetHeight / scale - img.height) / 2;
           ctx.drawImage(img, x * scale, y * scale, img.width * scale, img.height * scale);
           callback(canvas.toDataURL('image/jpeg', 0.9));
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData.documents) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        documents: { ...formData.documents, [field]: file }
      });

      if (field === 'photo') {
        processImage(file, 35, 45, (url) => {
            setPreviews(prev => ({ ...prev, photo: url }));
            setFormData(prev => ({ ...prev, documents: { ...prev.documents, photoUrl: url, photo: file }}));
        });
      } 
      else if (field === 'signature') {
         const url = URL.createObjectURL(file);
         setPreviews(prev => ({ ...prev, signature: url }));
      }
      else if (field === 'resume') {
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
    setPreviews(prev => ({ ...prev, [field]: null }));
  };

  const generateAppNumber = () => {
    const random = Math.floor(10000 + Math.random() * 90000);
    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `CSIR-${random}-${month}${year}`;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const appNumber = generateAppNumber();
    const finalData = { 
        ...formData, 
        applicationNumber: appNumber, 
        submittedDate: new Date().toLocaleDateString(),
        status: ApplicationStatus.SUBMITTED
    };
    
    setTimeout(() => {
        submitApplication(finalData);
        setFormData(finalData);
        const msg = `Dear ${finalData.personalDetails.fullName}, your application (${appNumber}) for ${finalData.postTitle} has been successfully submitted.`;
        sendWhatsApp(finalData.personalDetails.mobile, msg);
        setIsSubmitting(false);
        setIsSubmitted(true);
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

  const inputClass = "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all outline-none placeholder-slate-400";
  const labelClass = "block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1";

  const renderStepContent = () => {
    switch(currentStep) {
      case 1: return (
        <div className="space-y-10 animate-fadeIn">
          <div className="flex items-center space-x-4 mb-6">
             <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><Fingerprint size={28}/></div>
             <div>
                <h2 className="text-2xl font-heading font-black text-slate-900">Identity Details</h2>
                <p className="text-slate-500 text-sm font-medium">Verify your personal information accurately</p>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <label className={labelClass}>Full Legal Name</label>
              <input type="text" name="fullName" value={formData.personalDetails.fullName} onChange={handlePersonalChange} className={inputClass} placeholder="As per official documents" />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" name="dob" value={formData.personalDetails.dob} onChange={handlePersonalChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category" value={formData.personalDetails.category} onChange={handlePersonalChange} className={inputClass}>
                {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Mobile Number</label>
              <input type="tel" name="mobile" value={formData.personalDetails.mobile} onChange={handlePersonalChange} className={inputClass} placeholder="10-digit mobile" />
            </div>
            <div>
              <label className={labelClass}>Aadhaar Number</label>
              <input type="text" name="aadhaar" value={formData.personalDetails.aadhaar} onChange={handlePersonalChange} maxLength={12} placeholder="12-digit UIDAI Number" className={inputClass} />
            </div>
             <div className="md:col-span-2">
              <label className={labelClass}>Residential Address</label>
              <textarea name="address" rows={3} value={formData.personalDetails.address} onChange={handlePersonalChange} className={inputClass} placeholder="Complete mailing address" />
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-8 animate-fadeIn">
           <div className="flex justify-between items-end border-b border-slate-100 pb-6 mb-8">
            <div>
                <h2 className="text-2xl font-heading font-black text-slate-900">Academic Trajectory</h2>
                <p className="text-slate-500 text-sm font-medium">Add your educational qualifications from 10th standard onwards</p>
            </div>
            <button onClick={addEducation} className="flex items-center px-4 py-2 bg-brand-50 text-brand-600 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-brand-100 transition-colors">
              <Plus size={16} className="mr-2"/> Add Row
            </button>
           </div>
           {formData.education.map((edu, index) => (
             <div key={edu.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative group hover:bg-white hover:shadow-xl transition-all duration-300">
                <button 
                  onClick={() => setFormData({...formData, education: formData.education.filter(e => e.id !== edu.id)})} 
                  className="absolute -top-3 -right-3 p-2 bg-white text-slate-300 hover:text-red-500 rounded-full border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16}/>
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                      <label className={labelClass}>Level</label>
                      <input placeholder="e.g. B.Tech" value={edu.level} onChange={e => setFormData({...formData, education: formData.education.map(ed => ed.id === edu.id ? {...ed, level: e.target.value} : ed)})} className={inputClass} />
                  </div>
                  <div className="lg:col-span-2">
                       <label className={labelClass}>Institution / Board</label>
                       <input placeholder="University Name" value={edu.institution} onChange={e => setFormData({...formData, education: formData.education.map(ed => ed.id === edu.id ? {...ed, institution: e.target.value} : ed)})} className={inputClass} />
                  </div>
                  <div className="lg:col-span-1">
                      <label className={labelClass}>Score (%)</label>
                      <input placeholder="Percentage" value={edu.percentage} onChange={e => setFormData({...formData, education: formData.education.map(ed => ed.id === edu.id ? {...ed, percentage: e.target.value} : ed)})} className={inputClass} />
                  </div>
                </div>
             </div>
           ))}
           {formData.education.length === 0 && (
             <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <Layers className="mx-auto text-slate-200 mb-4" size={48} />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No academic data entered yet</p>
             </div>
           )}
        </div>
      );
      case 4: return (
        <div className="space-y-8 animate-fadeIn">
           <div className="flex items-center space-x-4 mb-6">
             <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl"><Sparkles size={28}/></div>
             <div>
                <h2 className="text-2xl font-heading font-black text-slate-900">Statement of Purpose</h2>
                <p className="text-slate-500 text-sm font-medium">Narrate your career vision and suitability for CSIR-SERC</p>
             </div>
           </div>
           
           <div className="bg-white p-2 rounded-[2rem] border border-slate-200 shadow-card">
             <div className="bg-slate-900 text-white p-6 rounded-[1.8rem] flex justify-between items-center mb-2">
               <div>
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Need help writing?</p>
                  <p className="text-sm font-bold">Use our Gemini AI assistant to draft your SOP</p>
               </div>
               <button 
                onClick={handleAiAssist}
                disabled={isAiGenerating}
                className="flex items-center text-xs bg-white text-slate-900 px-5 py-3 rounded-xl hover:bg-slate-100 transition-all font-black uppercase tracking-widest disabled:opacity-50"
               >
                 {isAiGenerating ? <Loader size={16} className="mr-2 animate-spin" /> : <Wand2 size={16} className="mr-2" />}
                 {isAiGenerating ? 'Drafting...' : 'AI Generate'}
               </button>
             </div>
             <textarea 
               value={formData.statementOfPurpose}
               onChange={(e) => setFormData({...formData, statementOfPurpose: e.target.value})}
               rows={10}
               className="w-full p-8 bg-white border-0 focus:ring-0 text-slate-700 text-base leading-relaxed resize-none rounded-b-[2rem]"
               placeholder="Describe your motivation, relevant experience, and suitability for this post..."
             />
           </div>
        </div>
      );
      case 6: return (
        <div className="space-y-12 animate-fadeIn">
          <div className="flex items-center justify-between">
             <div>
                <h2 className="text-2xl font-heading font-black text-slate-900">Application Artifacts</h2>
                <p className="text-slate-500 text-sm font-medium">Upload required documents in high resolution</p>
             </div>
             <div className="bg-brand-50 text-brand-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-brand-100">
               Max: 50MB / File
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96">
              <FluentUploadZone 
                label="Passport Photograph"
                subLabel="Clear face, white background"
                accept="image/jpeg,image/png"
                field="photo"
                previewUrl={previews.photo}
                file={formData.documents.photo}
                onUpload={handleFileChange}
                onRemove={removeFile}
                type="image"
                aspectRatioClass="aspect-[3.5/4.5]"
              />
            </div>

            <div className="h-96">
              <FluentUploadZone 
                label="Digital Signature"
                subLabel="Black ink on white paper"
                accept="image/jpeg,image/png"
                field="signature"
                previewUrl={previews.signature}
                file={formData.documents.signature}
                onUpload={handleFileChange}
                onRemove={removeFile}
                type="image"
                aspectRatioClass="aspect-[3/1]"
              />
            </div>

            <div className="md:col-span-2 h-72">
               <FluentUploadZone 
                  label="Scientific CV / Resume"
                  subLabel="Detailed experience and publications in PDF"
                  accept="application/pdf"
                  field="resume"
                  previewUrl={previews.resume}
                  file={formData.documents.resume}
                  onUpload={handleFileChange}
                  onRemove={removeFile}
                  type="pdf"
                />
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-12 animate-fadeIn py-10">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
               <FileCheck size={40} />
            </div>
            <h2 className="text-4xl font-heading font-black text-slate-900 mb-4">Final Submission</h2>
            <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Please meticulously review your data. Verified applications cannot be amended post-submission.</p>
          </div>

          <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Applicant Identity</p>
                 <p className="text-xl font-bold text-slate-900">{formData.personalDetails.fullName}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Target Position</p>
                 <p className="text-xl font-bold text-slate-900">{selectedPost?.title}</p>
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verification UID</p>
                 <p className="text-xl font-mono font-bold text-slate-900">{formData.personalDetails.aadhaar}</p>
               </div>
            </div>
            
            <div className="pt-10 border-t border-slate-200">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Artifact Status</p>
               <div className="flex flex-wrap gap-4">
                  {[
                    { label: 'Passport Photo', exists: !!formData.documents.photo },
                    { label: 'Signature', exists: !!formData.documents.signature },
                    { label: 'Curriculum Vitae', exists: !!formData.documents.resume }
                  ].map((doc, idx) => (
                    <div key={idx} className={`flex items-center px-6 py-3 rounded-2xl border text-sm font-bold ${doc.exists ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-red-50 border-red-100 text-red-700'}`}>
                      {doc.exists ? <CheckCircle size={16} className="mr-2"/> : <XCircle size={16} className="mr-2"/>} {doc.label}
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      );
      default: return <div className="py-32 text-center text-slate-300 font-bold uppercase tracking-widest">Section content loading...</div>;
    }
  };

  if (isSubmitted) {
      return (
          <div className="max-w-5xl mx-auto py-20 px-4">
              <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                  <div className="bg-emerald-600 p-12 text-center text-white relative">
                      <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                      <CheckCircle size={80} className="mx-auto mb-8 animate-bounce" />
                      <h1 className="text-4xl md:text-5xl font-heading font-black mb-4">Registration Successful</h1>
                      <p className="text-white/80 font-medium text-lg">Application has been officially registered in the CSIR-SERC database.</p>
                  </div>
                  
                  <div className="p-12 space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                          <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Application Number</p>
                              <p className="text-3xl font-mono font-black text-slate-900 bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block">{formData.applicationNumber}</p>
                          </div>
                          <div className="space-y-4">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">What's Next?</p>
                              <p className="text-slate-600 font-medium leading-relaxed">A confirmation has been dispatched to your registered communication nodes. You can track your scrutiny progress via the portal using your App ID.</p>
                          </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-slate-100">
                          <button onClick={() => navigate('/dashboard')} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-slate-800 transition-all active:scale-95">Go to Dashboard</button>
                          <button onClick={() => window.print()} className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest hover:border-slate-400 transition-all active:scale-95 flex items-center justify-center">
                            <Download size={20} className="mr-3" /> Save Application PDF
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      {/* Dynamic Header */}
      {selectedPost && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-fluent-lg mb-10 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:p-10 flex-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Scientific Recruitment Node</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-heading font-black text-slate-900 mb-4">{selectedPost.title}</h1>
              <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
                 <span className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center"><Search size={12} className="mr-2 text-brand-500" /> {selectedPost.code}</span>
                 <span className="px-3 py-1 bg-slate-50 rounded-lg border border-slate-100 flex items-center"><Layers size={12} className="mr-2 text-brand-500" /> {selectedPost.department}</span>
                 <span className="px-3 py-1 bg-red-50 rounded-lg border border-red-100 text-red-600 flex items-center"><Calendar size={12} className="mr-2" /> Deadline: {selectedPost.lastDate}</span>
              </div>
            </div>
            <div className="bg-brand-600 px-10 py-10 md:w-64 flex flex-col items-center justify-center text-center text-white relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <Rocket className="w-40 h-40 rotate-[25deg] absolute -right-10 -bottom-10" />
              </div>
              <span className="text-4xl font-heading font-black mb-1 leading-none">{selectedPost.vacancies}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total Slots</span>
            </div>
          </div>
        </div>
      )}

      {/* Modern Stepper */}
      <div className="mb-12 overflow-x-auto pb-4">
        <div className="flex justify-between items-center min-w-[800px] relative px-4">
          <div className="absolute left-0 right-0 h-1 bg-slate-100 top-5 -z-10 rounded-full mx-10"></div>
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={idx} className="flex flex-col items-center group">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500 ${
                  isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 
                  isCurrent ? 'bg-brand-600 text-white shadow-xl shadow-brand-100 scale-110' : 'bg-white text-slate-300 border-2 border-slate-100'
                }`}>
                  {isCompleted ? <CheckCircle size={18} /> : idx + 1}
                </div>
                <span className={`text-[10px] font-black mt-3 uppercase tracking-widest ${isCurrent ? 'text-brand-600' : 'text-slate-400'}`}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-card min-h-[500px] flex flex-col">
        <div className="p-8 md:p-16 flex-grow">
          {isSubmitting ? (
            <div className="py-32 flex flex-col items-center justify-center text-center animate-fadeIn">
               <div className="w-24 h-24 border-4 border-slate-100 border-t-brand-600 rounded-full animate-spin mb-10"></div>
               <h2 className="text-3xl font-heading font-black text-slate-900 mb-4 tracking-tight">Processing Application</h2>
               <p className="text-slate-500 font-medium text-lg">Encrypting artifacts and committing records to core database...</p>
            </div>
          ) : renderStepContent()}
        </div>
        
        {!isSubmitting && (
          <div className="p-8 md:px-16 md:py-10 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center rounded-b-[3rem]">
            <button 
              onClick={handlePrev} 
              disabled={currentStep <= 1}
              className="flex items-center px-8 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-900 hover:border-slate-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              <ArrowLeft size={18} className="mr-3" /> Back
            </button>
            
            {currentStep === STEPS.length - 1 ? (
              <button 
                onClick={handleSubmit}
                className="flex items-center px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-95"
              >
                <Save size={20} className="mr-3" /> Finalize & Submit
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="flex items-center px-10 py-4 bg-brand-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-700 transition-all active:scale-95"
              >
                Next <ArrowRight size={20} className="ml-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};