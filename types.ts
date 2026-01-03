export enum UserRole {
  GUEST = 'GUEST',
  APPLICANT = 'APPLICANT',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  DIRECTOR = 'DIRECTOR'
}

export enum PostType {
  SCIENTIST = 'Scientist',
  TECHNICAL_OFFICER = 'Technical Officer',
  TECHNICIAN = 'Technician',
  TECHNICAL_ASSISTANT = 'Technical Assistant'
}

export enum ApplicationStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  UNDER_SCRUTINY = 'Under Scrutiny', // Notification suppressed
  SCRUTINY_COMPLETED = 'Scrutiny Completed', // Ready for Director
  ELIGIBLE_WRITTEN = 'Eligible for Written Test',
  ELIGIBLE_PRACTICAL = 'Eligible for Practical Test',
  ELIGIBLE_INTERVIEW = 'Eligible for Interview',
  NOT_ELIGIBLE = 'Not Eligible',
  SELECTED = 'Selected', // Final OM sent
  REJECTED = 'Rejected'
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED', // Open for applications
  APPLICATION_CLOSED = 'APPLICATION_CLOSED', // Deadline reached
  SCRUTINY_IN_PROGRESS = 'SCRUTINY_IN_PROGRESS', // Admin Officer working
  PENDING_DIRECTOR_APPROVAL = 'PENDING_DIRECTOR_APPROVAL', // Pushed to Director
  DIRECTOR_APPROVED = 'DIRECTOR_APPROVED', // Back to Admin Officer
  RESULT_DECLARED = 'RESULT_DECLARED' // Final List Uploaded
}

export enum Category {
  GEN = 'GEN',
  OBC = 'OBC',
  SC = 'SC',
  ST = 'ST',
  EWS = 'EWS',
  PWD = 'PWD'
}

export enum FieldType {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  DROPDOWN = 'dropdown',
  TEXTAREA = 'textarea',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  FILE = 'file'
}

export interface FieldValidation {
  pattern?: string; // Regex pattern
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
}

export interface FieldLogic {
  dependsOnFieldId: string;
  condition: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS';
  value: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[]; // For dropdowns/radio
  placeholder?: string;
  validation?: FieldValidation;
  logic?: FieldLogic; // Conditional visibility
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  mobile: string;
  aadhaar: string;
  password?: string; // Added for login verification
}

export interface JobPost {
  id: string;
  code: string;
  title: string;
  type: PostType;
  department: string;
  lastDate: string;
  vacancies: number;
  description: string;
  status: PostStatus;
  customFields?: CustomField[];
  finalResultPdfUrl?: string; // Link to the uploaded OM
}

export interface EducationEntry {
  id: string;
  level: string; // 10th, 12th, PhD, etc.
  institution: string;
  board: string;
  year: string;
  percentage: string;
}

export interface ExperienceEntry {
  id: string;
  organization: string;
  designation: string;
  fromDate: string;
  toDate: string;
  responsibilities: string;
}

export interface ApplicationFormState {
  applicationNumber?: string; // Added for unique ID
  submittedDate?: string;
  postId: string | null;
  postTitle?: string; // Helper for display
  status?: ApplicationStatus; // Track application status
  personalDetails: {
    fullName: string;
    dob: string;
    gender: string;
    category: Category;
    fatherName: string;
    mobile: string;
    aadhaar: string;
    address: string;
    nationality: string;
  };
  education: EducationEntry[];
  experience: ExperienceEntry[];
  publications: string[];
  documents: {
    photo: File | null; // Converted to base64 string for preview/storage usually
    photoUrl?: string; // For the processed image
    signature: File | null;
    resume: File | null;
    casteCertificate: File | null;
  };
  statementOfPurpose: string;
  customValues: Record<string, string | boolean | File>;
  remarks?: string; // For Scrutiny rejection reasons
}

export interface DashboardStats {
  totalApplications: number;
  pendingScrutiny: number;
  eligible: number;
  interviews: number;
}

export interface LinkItem {
  id: string;
  label: string;
  url: string;
}

export interface NewsItem {
  id: string;
  text: string;
  isNew: boolean;
  link?: string;
}

export type TicketCategory = 'Application Issue' | 'Document Upload' | 'Photo Upload' | 'PDF Download' | 'Payment' | 'Other';

export interface TicketReply {
  id: string;
  senderId: string;
  senderName: string; // 'Admin' or User Name
  role: UserRole;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string; // e.g., TKT-12345
  userId: string;
  userName: string; // Snapshot of user name
  applicationNumber?: string; 
  postId?: string;
  category: TicketCategory;
  subject: string;
  description: string; // Initial message
  attachment?: File | null;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  replies: TicketReply[];
}