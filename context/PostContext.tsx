import React, { createContext, useContext, useState } from 'react';
import { JobPost, PostType, FieldType } from '../types';

const INITIAL_POSTS: JobPost[] = [
  { 
    id: '1', 
    code: 'SCI-01-2024', 
    title: 'Scientist "C"', 
    type: PostType.SCIENTIST, 
    department: 'Structural Dynamics', 
    lastDate: '2024-06-30', 
    vacancies: 4, 
    description: 'Research in earthquake engineering and structural dynamics.', 
    status: 'OPEN',
    customFields: [
      { id: 'cf1', label: 'Area of Specialization', type: FieldType.TEXT, required: true, placeholder: 'e.g., Seismic Design' },
      { id: 'cf2', label: 'GATE Score', type: FieldType.NUMBER, required: false }
    ]
  },
  { 
    id: '2', 
    code: 'TO-02-2024', 
    title: 'Technical Officer', 
    type: PostType.TECHNICAL_OFFICER, 
    department: 'IT Infrastructure', 
    lastDate: '2024-06-25', 
    vacancies: 2, 
    description: 'Managing data center operations and network security.', 
    status: 'OPEN',
    customFields: [
       { id: 'cf3', label: 'Certifications', type: FieldType.DROPDOWN, required: true, options: ['CCNA', 'AWS', 'Azure', 'None'] }
    ]
  },
  { id: '3', code: 'TA-01-2024', title: 'Technical Assistant', type: PostType.TECHNICAL_ASSISTANT, department: 'Material Testing', lastDate: '2024-07-01', vacancies: 10, description: 'Assisting in lab testing of concrete and steel structures.', status: 'OPEN', customFields: [] },
  { id: '4', code: 'TECH-03-2024', title: 'Technician (Electrical)', type: PostType.TECHNICIAN, department: 'Maintenance', lastDate: '2024-07-15', vacancies: 6, description: 'Maintenance of electrical substations and campus wiring.', status: 'OPEN', customFields: [] },
  { id: '5', code: 'SCI-02-2024', title: 'Principal Scientist', type: PostType.SCIENTIST, department: 'Wind Engineering', lastDate: '2024-08-01', vacancies: 1, description: 'Leading research projects in wind tunnel testing.', status: 'OPEN', customFields: [] },
  { id: '6', code: 'TO-04-2024', title: 'Senior Technical Officer', type: PostType.TECHNICAL_OFFICER, department: 'Instrumentation', lastDate: '2024-06-28', vacancies: 3, description: 'Calibration and maintenance of advanced sensors.', status: 'OPEN', customFields: [] },
  { id: '7', code: 'TA-02-2024', title: 'Technical Assistant (Civil)', type: PostType.TECHNICAL_ASSISTANT, department: 'Construction', lastDate: '2024-07-10', vacancies: 8, description: 'Supervision of ongoing civil works in the campus.', status: 'OPEN', customFields: [] },
];

interface PostContextType {
  posts: JobPost[];
  addPost: (post: JobPost) => void;
  updatePost: (post: JobPost) => void;
  deletePost: (id: string) => void;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posts, setPosts] = useState<JobPost[]>(INITIAL_POSTS);

  const addPost = (post: JobPost) => setPosts([...posts, post]);
  
  const updatePost = (updatedPost: JobPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const deletePost = (id: string) => setPosts(posts.filter(p => p.id !== id));

  return (
    <PostContext.Provider value={{ posts, addPost, updatePost, deletePost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
};