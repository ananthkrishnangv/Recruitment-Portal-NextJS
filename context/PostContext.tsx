
import React, { createContext, useContext, useState } from 'react';
import { JobPost, PostType, FieldType, PostStatus } from '../types';

const INITIAL_POSTS: JobPost[] = [
  { 
    id: '1', 
    code: 'SCI-01-2024', 
    title: 'Scientist "C"', 
    type: PostType.SCIENTIST, 
    department: 'Structural Dynamics', 
    lastDate: '2024-12-30', 
    vacancies: 4, 
    breakdown: { ur: 2, sc: 1, st: 0, obc: 1, ews: 0, pwd: 0 },
    description: 'Research in earthquake engineering and structural dynamics.', 
    status: PostStatus.PUBLISHED,
    customFields: [
      { id: 'cf1', label: 'Area of Specialization', type: FieldType.TEXT, required: true, placeholder: 'e.g., Seismic Design' }
    ]
  },
  { 
    id: '2', 
    code: 'TO-02-2024', 
    title: 'Technical Officer', 
    type: PostType.TECHNICAL_OFFICER, 
    department: 'IT Infrastructure', 
    lastDate: '2024-11-25', 
    vacancies: 2, 
    breakdown: { ur: 1, sc: 0, st: 0, obc: 0, ews: 1, pwd: 0 },
    description: 'Managing data center operations and network security.', 
    status: PostStatus.PUBLISHED
  },
  { 
    id: '3', 
    code: 'TA-01-2024', 
    title: 'Technical Assistant', 
    type: PostType.TECHNICAL_ASSISTANT, 
    department: 'Material Testing', 
    lastDate: '2024-07-01', 
    vacancies: 5, 
    breakdown: { ur: 2, sc: 1, st: 1, obc: 1, ews: 0, pwd: 0 },
    description: 'Assisting in lab testing of concrete and steel structures.', 
    status: PostStatus.SHORTLIST_APPROVED 
  }
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
