

export enum UserRole {
  GUEST = 'GUEST',
  APPLICANT = 'APPLICANT',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR', // Administrative Officer
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
  UNDER_SCRUTINY = 'Under Scrutiny',
  SCRUTINY_REJECTED = 'Rejected in Scrutiny',
  SHORTLISTED_FOR_TEST = 'Shortlisted for Test',
  TESTING_IN_PROGRESS = 'Testing in Progress',
  SELECTED_PROVISIONAL = 'Provisionally Selected',
  SELECTED = 'Selected', 
  REJECTED = 'Rejected',
  ELIGIBLE_INTERVIEW = 'Eligible for Interview'
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  APPLICATION_CLOSED = 'APPLICATION_CLOSED',
  SCRUTINY_IN_PROGRESS = 'SCRUTINY_IN_PROGRESS',
  PENDING_SHORTLIST_APPROVAL = 'PENDING_SHORTLIST_APPROVAL',
  SHORTLIST_APPROVED = 'SHORTLIST_APPROVED',
  TESTING_PHASE = 'TESTING_PHASE',
  PENDING_FINAL_APPROVAL = 'PENDING_FINAL_APPROVAL',
  RESULT_DECLARED = 'RESULT_DECLARED' 
}

export enum Category {
  GEN = 'UR',
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

// Fixed: Added 'logic' property to support conditional field visibility logic in ApplicationForm.tsx
export interface CustomField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    errorMessage?: string;
  };
  logic?: {
    dependsOnFieldId: string;
    condition: 'EQUALS' | 'NOT_EQUALS' | 'CONTAINS';
    value: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  mobile: string;
  aadhaar: string;
  password?: string;
}

export interface VacancyBreakdown {
  ur: number;
  sc: number;
  st: number;
  obc: number;
  ews: number;
  pwd: number;
}

export interface JobPost {
  id: string;
  code: string;
  title: string;
  type: PostType;
  department: string;
  lastDate: string;
  vacancies: number;
  breakdown: VacancyBreakdown;
  description: string;
  status: PostStatus;
  customFields?: CustomField[];
  finalResultPdfUrl?: string;
}

export interface EducationEntry {
  id: string;
  level: string;
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
  applicationNumber?: string;
  submittedDate?: string;
  postId: string | null;
  postTitle?: string;
  status?: ApplicationStatus;
  testMarks?: number;
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
  documents: {
    photo: File | null;
    photoUrl?: string;
    signature: File | null;
    resume: File | null;
    casteCertificate: File | null;
  };
  statementOfPurpose: string;
  customValues: Record<string, string | boolean | File>;
  remarks?: string;
}

export type TicketCategory = 'Application Issue' | 'Document Upload' | 'Photo Upload' | 'PDF Download' | 'Payment' | 'Other';

export interface TicketReply {
  id: string;
  senderId: string;
  senderName: string;
  role: UserRole;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  applicationNumber?: string;
  postId?: string;
  category: TicketCategory;
  subject: string;
  description: string;
  attachment?: File | null;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  replies: TicketReply[];
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
}