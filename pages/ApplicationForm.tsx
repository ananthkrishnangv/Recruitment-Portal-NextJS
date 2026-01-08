
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostType, Category, ApplicationFormState, EducationEntry, ExperienceEntry, JobPost, FieldType, CustomField } from '../types';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Save, Wand2, Upload, Trash2, Plus, AlertCircle, FileText, X, Eye, Mail, ClipboardList, Printer, Download, CloudUpload, Image as ImageIcon, FileCheck, ScanLine } from 'lucide-react';
import { generateStatementOfPurpose } from '../services/geminiService';
import { usePosts } from '../context/PostContext';
import { useApplications } from '../context/ApplicationContext';
import { useNotifications } from '../context/NotificationContext';

const STEPS = [
  'Post Selection',
  'Personal Details',
  'Education',
  'Experience',
  'Publications',
  'Additional Info', 
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
  // Removed publications to fix type mismatch with ApplicationFormState
  documents: { photo: null, signature: null, resume: null, casteCertificate: null },
  statementOfPurpose: '',
  customValues: {}
};

// --- FLUENT UPLOAD COMPONENT ---
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
      <label className="text-sm font-semibold text-[#201F1E] mb-2 flex items-center">
        {label} <span className="text-[#A4262C] ml-1">*</span>
      </label>
      
      {!file ? (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 relative group cursor-pointer border rounded-lg transition-all duration-200 ease-out flex flex-col items-center justify-center p-8 text-center
            ${isDragging 
              ? 'border-[#0078D4] bg-[#EFF6FC]' 
              : 'border-gray-300 hover:border-[#0078D4] hover:bg-[#F3F2F1] bg-white'
            }`}
        >
          <div className={`p-4 rounded-full mb-4 transition-colors ${isDragging ? 'bg-white text-[#0078D4]' : 'bg-[#F3F2F1] text-gray-500 group-hover:text-[#0078D4]'}`}>
            {type === 'image' ? <ImageIcon size={28} /> : <CloudUpload size={28} />}
          </div>
          <p className="text-[#201F1E] font-medium mb-1">
            <span className="text-[#0078D4] font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">{subLabel}</p>
          <input 
            ref={inputRef}
            type="file" 
            accept={accept} 
            className="hidden" 
            onChange={(e) => onUpload(e, field)} 
          />
        </div>
      ) : (
        <div className="relative flex-1 bg-white border border-gray-200 rounded-lg p-4 shadow-fluent flex flex-col items-center justify-center overflow-hidden group">
          <button 
            onClick={() => onRemove(field)}
            className="absolute top-2 right-2 p-1.5 bg-white text-gray-400 hover:text-[#A4262C] hover:bg-red-50 rounded-full transition-all z-10 shadow-sm border border-transparent hover:border-red-100"
            title="Remove file"
          >
            <X size={16} />
          </button>

          {type === 'image' && previewUrl ? (
            <div className={`relative ${aspectRatioClass} w-32 border border-gray-200 shadow-md rounded overflow-hidden mb-3 bg-[#F3F2F1]`}>
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="mb-3 p-4 bg-[#FDF3F4] rounded-lg border border-[#FDE7E9]">
               <FileText size={40} className="text-[#A4262C]" />
            </div>
          )}

          <div className="text-center w-full px-2">
            <p className="text-sm font-bold text-[#201F1E] truncate w-full" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-gray-500 mt-1 inline-flex items-center">
              <span className="w-2 h-2 rounded-full bg-[#107C10] mr-2"></span>
              {formatFileSize(file.size)} • Ready
            </p>
          </div>
          
          {type === 'pdf' && previewUrl && (
             <div className="mt-4 w-full h-32 border rounded-lg overflow-hidden bg-gray-50 relative group-hover:shadow-md transition-shadow">
                 <embed src={previewUrl} type="application/pdf" className="w-full h-full pointer-events-none opacity-80" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white/95 backdrop-blur px-3 py-1 rounded text-xs font-semibold text-[#201F1E] shadow-sm border border-gray-200">Preview</span>
                 </div>
             </div>
          )}
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
  const [selectedPost, setSelectedPost] = useState<JobPost | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [previews, setPreviews] = useState<{photo: string | null, signature: string | null, resume: string | null}>({ photo: null, signature: null, resume: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Validation State for Custom Fields
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (postId) {
      const post = posts.find(p => p.id === postId);
      if (post) {
        setSelectedPost(post);
        setFormData(prev => ({ ...prev, postId, postTitle: post.title }));
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

  // Image processing logic
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
      const fileSizeMB = file.size / (1024 * 1024);

      if (fileSizeMB > 50) {
        alert("File size exceeds the 50MB limit.");
        e.target.value = "";
        return;
      }
      
      if (field === 'photo' || field === 'signature') {
         if (!['image/jpeg', 'image/png'].includes(file.type)) {
             alert("Only JPG and PNG formats are allowed for images.");
             e.target.value = "";
             return;
         }
      } else {
         if (file.type !== 'application/pdf') {
             alert("Only PDF files are allowed for documents.");
             e.target.value = "";
             return;
         }
      }

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
    if (previews[field]) URL.revokeObjectURL(previews[field]!);
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
        status: 'Submitted' as any
    };
    
    // Simulate API submission
    setTimeout(() => {
        submitApplication(finalData); // Save to database
        setFormData(finalData); // Update local state for PDF view
        
        // WORKFLOW: Send Notification to Candidate with PDF
        const msg = `Dear ${finalData.personalDetails.fullName}, your application (${appNumber}) for ${finalData.postTitle} has been successfully submitted. Please find your application PDF attached.`;
        sendWhatsApp(finalData.personalDetails.mobile, msg, `https://portal.serc.res.in/apps/${appNumber}.pdf`);
        // Assuming email is available in user profile or custom fields, sending dummy email notification
        sendEmail("applicant@example.com", `Application Submitted: ${appNumber}`, msg);

        setIsSubmitting(false);
        setIsSubmitted(true);
    }, 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Image Helper
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

  // Helper for input styles
  const inputClass = "w-full p-2.5 bg-white border border-gray-300 rounded text-sm text-[#201F1E] hover:border-gray-500 focus:border-[#0078D4] focus:ring-0 transition-all placeholder-gray-400";
  const labelClass = "block text-sm font-semibold text-[#201F1E] mb-1.5";

  const renderCustomFields = () => {
    if (!selectedPost?.customFields || selectedPost.customFields.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
           <p>No additional specific details required for this post.</p>
           <p className="text-sm">Please proceed to the next step.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-[#201F1E] border-b pb-2 flex items-center">
            <span className="bg-[#EFF6FC] p-2 rounded-full mr-3 text-[#0078D4]"><ClipboardList size={20}/></span> 
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
                   <label className={labelClass}>{field.label} {field.required && <span className="text-[#A4262C]">*</span>}</label>
                   <textarea 
                     className={`${inputClass} ${error ? 'border-[#A4262C] bg-[#FDF3F4]' : ''}`}
                     placeholder={field.placeholder}
                     value={value as string}
                     onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                   />
                   {error && <p className="text-xs text-[#A4262C] mt-1">{error}</p>}
                 </div>
               );
             }

             if (field.type === FieldType.DROPDOWN) {
               return (
                 <div key={field.id}>
                   <label className={labelClass}>{field.label} {field.required && <span className="text-[#A4262C]">*</span>}</label>
                   <select 
                     className={`${inputClass}`}
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
                     className="h-5 w-5 text-[#0078D4] border-gray-300 rounded focus:ring-[#0078D4]"
                     checked={!!value}
                     onChange={(e) => handleCustomFieldChange(field, e.target.checked)}
                   />
                   <label className="ml-2 block text-sm font-medium text-[#201F1E]">{field.label} {field.required && <span className="text-[#A4262C]">*</span>}</label>
                 </div>
                );
             }

             if (field.type === FieldType.RADIO) {
                return (
                 <div key={field.id}>
                   <label className={labelClass}>{field.label} {field.required && <span className="text-[#A4262C]">*</span>}</label>
                   <div className="flex space-x-4 mt-2">
                     {field.options?.map((opt) => (
                       <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                         <input 
                           type="radio" 
                           name={field.id}
                           value={opt}
                           checked={value === opt}
                           onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                           className="text-[#0078D4] focus:ring-[#0078D4]"
                         />
                         <span className="text-sm text-[#201F1E]">{opt}</span>
                       </label>
                     ))}
                   </div>
                 </div>
                );
             }

             if (field.type === FieldType.FILE) {
                return (
                  <div key={field.id}>
                     <label className={labelClass}>{field.label} {field.required && <span className="text-[#A4262C]">*</span>}</label>
                     <input 
                       type="file" 
                       accept="application/pdf"
                       className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-[#EFF6FC] file:text-[#0078D4] hover:file:bg-[#DEECF9]"
                       onChange={(e) => {
                          const f = e.target.files?.[0];
                          if(f) {
                              if(f.size > 50 * 1024 * 1024) { alert("File exceeds 50MB"); e.target.value = ""; return; }
                              if(f.type !== "application/pdf") { alert("Only PDF allowed"); e.target.value = ""; return; }
                              handleCustomFieldChange(field, f);
                          }
                       }}
                     />
                     <p className="text-xs text-gray-500 mt-1">PDF Only (Max 50MB)</p>
                     {value && <p className="text-xs text-[#107C10] mt-1 font-semibold">File Selected: {(value as File).name}</p>}
                  </div>
                );
             }

             return (
               <div key={field.id}>
                 <label className={labelClass}>{field.label} {field.required && <span className="text-[#A4262C]">*</span>}</label>
                 <input 
                   type={field.type} 
                   className={`${inputClass} ${error ? 'border-[#A4262C] bg-[#FDF3F4]' : ''}`}
                   placeholder={field.placeholder}
                   value={value as string}
                   onChange={(e) => handleCustomFieldChange(field, e.target.value)}
                   />
                 {error && <p className="text-xs text-[#A4262C] mt-1">{error}</p>}
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
        <div className="p-8 text-center">
           <h2 className="text-xl font-bold mb-4">Select Post</h2>
           <p className="text-gray-500 mb-6">Please go back to "Openings" to select a post if not selected.</p>
           <button onClick={() => navigate('/posts')} className="px-6 py-2 bg-[#0078D4] text-white rounded font-semibold shadow-sm hover:bg-[#106EBE]">Go to Openings</button>
        </div>
      );
      case 1: return (
        <div className="space-y-8 animate-fadeIn">
          <h2 className="text-xl font-semibold text-[#201F1E] border-b border-gray-200 pb-3 flex items-center">
            <span className="bg-[#EFF6FC] p-2 rounded-full mr-3 text-[#0078D4]"><CheckCircle size={20}/></span> 
            Personal Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Full Name</label>
              <input type="text" name="fullName" value={formData.personalDetails.fullName} onChange={handlePersonalChange} className={inputClass} />
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
              <input type="tel" name="mobile" value={formData.personalDetails.mobile} onChange={handlePersonalChange} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Aadhaar Number <span className="text-[#A4262C]">*</span></label>
              <input type="text" name="aadhaar" value={formData.personalDetails.aadhaar} onChange={handlePersonalChange} maxLength={12} placeholder="12-digit UIDAI No." className={inputClass} />
              <p className="text-xs text-gray-500 mt-1">For verification only</p>
            </div>
             <div className="md:col-span-2">
              <label className={labelClass}>Address for Communication</label>
              <textarea name="address" rows={3} value={formData.personalDetails.address} onChange={handlePersonalChange} className={inputClass} />
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="space-y-6">
           <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold text-[#201F1E]">Educational Qualifications</h2>
            <button onClick={addEducation} className="flex items-center text-sm bg-white text-[#0078D4] px-4 py-2 rounded border border-[#0078D4] hover:bg-[#EFF6FC] font-semibold transition-colors"><Plus size={16} className="mr-1"/> Add Education</button>
           </div>
           {formData.education.map((edu, index) => (
             <div key={edu.id} className="p-5 bg-white rounded-lg border border-gray-200 relative group hover:border-[#0078D4] hover:shadow-fluent transition-all">
                <button onClick={() => setFormData({...formData, education: formData.education.filter(e => e.id !== edu.id)})} className="absolute top-3 right-3 text-gray-400 hover:text-[#A4262C] transition-colors"><Trash2 size={18}/></button>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Level</label>
                      <input placeholder="e.g. 10th/PhD" value={edu.level} onChange={e => updateEducation(edu.id, 'level', e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1 lg:col-span-2">
                       <label className="text-xs font-bold text-gray-500 uppercase">Institution / University</label>
                       <input placeholder="University Name" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Year</label>
                      <input placeholder="YYYY" type="number" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-500 uppercase">Score (%)</label>
                      <input placeholder="%" value={edu.percentage} onChange={e => updateEducation(edu.id, 'percentage', e.target.value)} className={inputClass} />
                  </div>
                </div>
             </div>
           ))}
           {formData.education.length === 0 && <div className="text-center py-12 bg-[#F3F2F1] rounded-lg border border-dashed border-gray-300"><p className="text-gray-500 font-medium">Click "Add Education" to enter your qualifications.</p></div>}
        </div>
      );
      case 3: return (
        <div className="space-y-6">
           <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold text-[#201F1E]">Experience Details</h2>
            <button className="flex items-center text-sm bg-white text-[#0078D4] px-4 py-2 rounded border border-[#0078D4] hover:bg-[#EFF6FC] font-semibold transition-colors"><Plus size={16} className="mr-1"/> Add Experience</button>
           </div>
           
           <div className="mt-8 bg-gradient-to-br from-[#EFF6FC] to-white p-6 rounded-xl border border-blue-100 shadow-fluent">
             <div className="flex justify-between items-center mb-4">
               <label className="block text-sm font-bold text-[#201F1E] flex items-center">
                   Statement of Purpose <span className="text-[#A4262C] ml-1">*</span>
               </label>
               <button 
                onClick={handleAiAssist}
                disabled={isAiGenerating}
                className="flex items-center text-xs bg-[#0078D4] text-white px-4 py-2 rounded hover:bg-[#106EBE] shadow-sm disabled:opacity-50 transition-all font-semibold"
               >
                 <Wand2 size={14} className="mr-2" />
                 {isAiGenerating ? 'Generating...' : 'Generate with Gemini AI'}
               </button>
             </div>
             <textarea 
               value={formData.statementOfPurpose}
               onChange={(e) => setFormData({...formData, statementOfPurpose: e.target.value})}
               rows={8}
               className="w-full p-4 border border-gray-300 rounded focus:border-[#0078D4] focus:ring-0 font-sans text-sm leading-relaxed"
               placeholder="Describe your motivation, relevant experience, and suitability for this post..."
             />
             <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">This section helps us understand your career goals.</p>
                <p className="text-xs text-gray-400">{formData.statementOfPurpose.length} chars</p>
             </div>
           </div>
        </div>
      );
      case 5: return renderCustomFields();
      case 6: return (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
             <div>
                <h2 className="text-xl font-bold text-[#201F1E]">Document Upload</h2>
                <p className="text-gray-500 text-sm">Upload clear scanned copies. Ensure files are within the size limit.</p>
             </div>
             <div className="bg-[#EFF6FC] text-[#0078D4] px-4 py-2 rounded text-xs font-semibold flex items-center border border-blue-100">
               <AlertCircle size={16} className="mr-2"/> Max Size: 50MB per file
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div className="md:h-80">
              <FluentUploadZone 
                label="Passport Photo"
                subLabel="JPG/PNG, 3.5 x 4.5 cm"
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

            <div className="md:h-80">
              <FluentUploadZone 
                label="Signature"
                subLabel="JPG/PNG, Dark ink on white paper"
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

            <div className="md:col-span-2 md:h-64">
               <FluentUploadZone 
                  label="Curriculum Vitae / Resume"
                  subLabel="PDF Only. Detailed CV."
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
        <div className="space-y-6 text-center animate-fadeIn">
          <div className="bg-[#F1FDF1] text-[#107C10] p-8 rounded-xl mb-6 border border-green-100 shadow-sm">
            <CheckCircle className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-3xl font-bold">Review Your Application</h2>
            <p className="mt-2 text-[#201F1E]">Please ensure all details are correct. Once submitted, you cannot modify the application.</p>
          </div>
          <div className="text-left bg-white p-8 rounded-xl shadow-fluent border border-gray-200 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
               <div className="border-b pb-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Full Name</label>
                 <p className="font-medium text-lg text-[#201F1E]">{formData.personalDetails.fullName}</p>
               </div>
               <div className="border-b pb-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Post Applied For</label>
                 <p className="font-medium text-lg text-[#201F1E]">{selectedPost?.title}</p>
               </div>
               <div className="border-b pb-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Aadhaar</label>
                 <p className="font-medium text-lg text-[#201F1E]">{formData.personalDetails.aadhaar}</p>
               </div>
               <div className="border-b pb-2">
                 <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Contact</label>
                 <p className="font-medium text-lg text-[#201F1E]">{formData.personalDetails.mobile}</p>
               </div>
               {selectedPost?.customFields?.map(field => {
                  if (!isFieldVisible(field)) return null;
                  let val = formData.customValues[field.id];
                  if (field.type === FieldType.FILE && val) val = (val as File).name;
                  
                  return (
                    <div key={field.id} className="border-b pb-2">
                      <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">{field.label}</label>
                      <p className="font-medium text-lg text-[#201F1E]">{String(val || '-')}</p>
                    </div>
                  );
               })}
            </div>
            
            <div className="bg-[#F3F2F1] p-4 rounded-lg border border-gray-200">
              <h4 className="font-bold text-[#201F1E] mb-3 flex items-center"><FileText size={18} className="mr-2"/> Documents Check</h4>
              <div className="grid grid-cols-3 gap-4">
                  <div className={`flex items-center text-sm font-semibold ${formData.documents.photo ? 'text-[#107C10]' : 'text-[#A4262C]'}`}>
                      {formData.documents.photo ? <CheckCircle size={16} className="mr-2"/> : <AlertCircle size={16} className="mr-2"/>} Photo
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${formData.documents.signature ? 'text-[#107C10]' : 'text-[#A4262C]'}`}>
                      {formData.documents.signature ? <CheckCircle size={16} className="mr-2"/> : <AlertCircle size={16} className="mr-2"/>} Signature
                  </div>
                  <div className={`flex items-center text-sm font-semibold ${formData.documents.resume ? 'text-[#107C10]' : 'text-[#A4262C]'}`}>
                      {formData.documents.resume ? <CheckCircle size={16} className="mr-2"/> : <AlertCircle size={16} className="mr-2"/>} Resume
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
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#0078D4] mb-4"></div>
              <h2 className="text-xl font-bold text-[#201F1E]">Submitting Application...</h2>
              <p className="text-gray-500 mt-2 flex items-center"><Mail size={16} className="mr-2"/> Sending Acknowledgement with PDF...</p>
          </div>
      )
  }

  if (isSubmitted) {
      return (
          <div className="max-w-4xl mx-auto py-8">
              <div className="bg-white shadow-fluent p-10 print:shadow-none print:p-0 rounded-xl">
                  {/* Actions (Hidden in Print) */}
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-gray-200 print:hidden">
                     <div className="flex items-center text-[#107C10]">
                         <CheckCircle size={32} className="mr-3"/>
                         <div>
                             <h2 className="text-xl font-bold text-[#201F1E]">Application Submitted Successfully</h2>
                             <p className="text-sm font-semibold text-gray-700">App ID: {formData.applicationNumber}</p>
                             <p className="text-xs text-gray-500 mt-1">A confirmation has been sent to your Mobile/Email with the PDF attached.</p>
                         </div>
                     </div>
                     <div className="flex space-x-3">
                         <button onClick={() => navigate('/dashboard')} className="px-5 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-50 text-[#201F1E]">Go to Dashboard</button>
                         <button onClick={handlePrint} className="flex items-center px-5 py-2 bg-[#0078D4] text-white rounded font-semibold hover:bg-[#106EBE] shadow-sm">
                             <Download size={16} className="mr-2" /> Download PDF
                         </button>
                     </div>
                  </div>

                  {/* PDF Layout - Standardized */}
                  <div className="print:block pdf-content">
                      <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-8">
                          <div className="w-2/3">
                              <h1 className="text-2xl font-bold text-black uppercase tracking-wide">CSIR-SERC Recruitment</h1>
                              <p className="text-sm text-gray-800">Council of Scientific & Industrial Research</p>
                              <p className="text-sm text-gray-800">Structural Engineering Research Centre, Chennai</p>
                          </div>
                          <div className="text-right">
                               <p className="font-mono text-base font-bold text-black">App No: {formData.applicationNumber}</p>
                               <p className="text-sm text-gray-600">Date: {formData.submittedDate}</p>
                          </div>
                      </div>

                      <div className="flex gap-10">
                          <div className="flex-1 space-y-8">
                              <div>
                                  <h3 className="text-sm font-bold bg-gray-100 p-2 border border-gray-300 uppercase mb-3 text-black">Post Details</h3>
                                  <div className="grid grid-cols-2 gap-y-2 text-sm text-black">
                                      <p><span className="font-bold">Post Applied:</span> {selectedPost?.title}</p>
                                      <p><span className="font-bold">Post Code:</span> {selectedPost?.code}</p>
                                      <p><span className="font-bold">Department:</span> {selectedPost?.department}</p>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-sm font-bold bg-gray-100 p-2 border border-gray-300 uppercase mb-3 text-black">Personal Information</h3>
                                  <div className="grid grid-cols-2 gap-y-2 text-sm text-black">
                                      <p><span className="font-bold">Full Name:</span> {formData.personalDetails.fullName}</p>
                                      <p><span className="font-bold">Date of Birth:</span> {formData.personalDetails.dob}</p>
                                      <p><span className="font-bold">Gender:</span> {formData.personalDetails.gender}</p>
                                      <p><span className="font-bold">Category:</span> {formData.personalDetails.category}</p>
                                      <p><span className="font-bold">Aadhaar:</span> {formData.personalDetails.aadhaar}</p>
                                      <p><span className="font-bold">Mobile:</span> {formData.personalDetails.mobile}</p>
                                      <p className="col-span-2"><span className="font-bold">Address:</span> {formData.personalDetails.address}</p>
                                  </div>
                              </div>

                              <div>
                                  <h3 className="text-sm font-bold bg-gray-100 p-2 border border-gray-300 uppercase mb-3 text-black">Education</h3>
                                  <table className="w-full text-sm border-collapse border border-gray-300">
                                      <thead>
                                          <tr className="bg-gray-50">
                                              <th className="border border-gray-300 px-2 py-1 text-left">Level</th>
                                              <th className="border border-gray-300 px-2 py-1 text-left">Institution</th>
                                              <th className="border border-gray-300 px-2 py-1 text-left">Year</th>
                                              <th className="border border-gray-300 px-2 py-1 text-left">%</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {formData.education.map((e, i) => (
                                              <tr key={i}>
                                                  <td className="border border-gray-300 px-2 py-1">{e.level}</td>
                                                  <td className="border border-gray-300 px-2 py-1">{e.institution}</td>
                                                  <td className="border border-gray-300 px-2 py-1">{e.year}</td>
                                                  <td className="border border-gray-300 px-2 py-1">{e.percentage}</td>
                                              </tr>
                                          ))}
                                      </tbody>
                                  </table>
                              </div>
                          </div>

                          <div className="w-48 flex flex-col items-center space-y-6">
                               <div className="border border-gray-400 p-1 bg-white">
                                   {previews.photo ? (
                                     <img src={previews.photo} alt="Applicant" className="w-[132px] h-[170px] object-cover" /> 
                                   ) : (
                                     <div className="w-[132px] h-[170px] bg-gray-100 flex items-center justify-center text-xs">No Photo</div>
                                   )}
                               </div>
                               <div className="text-center w-full">
                                   <p className="text-xs text-gray-500 mb-2">Signature</p>
                                   {previews.signature ? (
                                        <img src={previews.signature} alt="Sign" className="h-12 w-full object-contain border-b border-black" />
                                   ) : <div className="h-12 w-full border-b border-black"></div>}
                               </div>
                          </div>
                      </div>
                      
                      <div className="mt-16 pt-4 border-t border-black text-xs text-justify text-black">
                          <p className="font-bold mb-1">Declaration:</p>
                          <p>I hereby declare that all the statements made in this application are true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my candidature/appointment is liable to be cancelled/terminated.</p>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Post Details Header */}
      {selectedPost && (
        <div className="bg-white border-l-4 border-[#0078D4] p-8 rounded-lg shadow-fluent mb-10 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#201F1E]">{selectedPost.title}</h1>
            <div className="flex flex-wrap gap-6 mt-3 text-sm text-gray-600 font-medium">
               <span className="flex items-center"><AlertCircle size={16} className="mr-2 text-[#0078D4]" /> Post Code: {selectedPost.code}</span>
               <span className="flex items-center"><ArrowRight size={16} className="mr-2" /> Dept: {selectedPost.department}</span>
               <span className="flex items-center text-[#A4262C]">Deadline: {selectedPost.lastDate}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-0 bg-[#EFF6FC] px-8 py-4 rounded text-center border border-blue-100 min-w-[120px]">
            <span className="block text-3xl font-bold text-[#0078D4]">{selectedPost.vacancies}</span>
            <span className="text-xs text-[#005A9E] uppercase font-bold tracking-wide">Vacancies</span>
          </div>
        </div>
      )}

      {/* Stepper - Fluent Style */}
      <div className="mb-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute left-0 top-1/2 w-full h-[2px] bg-gray-200 -z-10"></div>
          {STEPS.map((step, idx) => {
            const isCompleted = idx < currentStep;
            const isCurrent = idx === currentStep;
            return (
              <div key={idx} className="flex flex-col items-center bg-[#F3F2F1] px-2 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  isCompleted ? 'bg-[#107C10] text-white' : 
                  isCurrent ? 'bg-[#0078D4] text-white ring-4 ring-[#EFF6FC]' : 'bg-white text-gray-400 border-2 border-gray-200'
                }`}>
                  {isCompleted ? <CheckCircle size={16} /> : idx + 1}
                </div>
                <span className={`text-[10px] md:text-xs mt-2 font-medium hidden md:block ${isCurrent ? 'text-[#0078D4] font-bold' : 'text-gray-500'}`}>{step}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg shadow-fluent border border-gray-200 overflow-hidden">
        <div className="p-8 min-h-[400px]">
          {renderStepContent()}
        </div>
        
        {/* Footer Actions */}
        <div className="bg-[#F3F2F1] px-8 py-5 border-t border-gray-200 flex justify-between items-center">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="flex items-center px-6 py-2 bg-white border border-gray-300 rounded text-[#201F1E] hover:bg-gray-50 disabled:opacity-50 transition-colors font-semibold shadow-sm"
          >
            <ArrowLeft size={18} className="mr-2" /> Previous
          </button>
          
          {currentStep === STEPS.length - 1 ? (
            <button 
              onClick={handleSubmit}
              className="flex items-center px-8 py-2 bg-[#107C10] text-white rounded hover:bg-[#0E6C0E] transition-colors shadow-md font-bold text-lg"
            >
              <Save size={20} className="mr-2" /> Submit Application
            </button>
          ) : (
            <button 
              onClick={handleNext}
              className="flex items-center px-8 py-2 bg-[#0078D4] text-white rounded hover:bg-[#106EBE] transition-colors shadow-sm font-semibold"
            >
              Next <ArrowRight size={18} className="ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
