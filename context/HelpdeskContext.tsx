import React, { createContext, useContext, useState } from 'react';
import { SupportTicket, TicketCategory, TicketReply, User, UserRole } from '../types';
import { useNotifications } from './NotificationContext';

interface HelpdeskContextType {
  tickets: SupportTicket[];
  createTicket: (user: User, data: { appId?: string; postId?: string; category: TicketCategory; subject: string; message: string; attachment?: File | null }) => void;
  replyToTicket: (ticketId: string, user: User, message: string) => void;
  resolveTicket: (ticketId: string) => void;
  getTicketsByUser: (userId: string) => SupportTicket[];
}

const HelpdeskContext = createContext<HelpdeskContextType | undefined>(undefined);

export const HelpdeskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const { sendEmail, sendSMS } = useNotifications();

  const createTicket = (user: User, data: { appId?: string; postId?: string; category: TicketCategory; subject: string; message: string; attachment?: File | null }) => {
    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(10000 + Math.random() * 90000)}`,
      userId: user.aadhaar, // Using Aadhaar as unique user ID
      userName: user.name,
      applicationNumber: data.appId,
      postId: data.postId,
      category: data.category,
      subject: data.subject,
      description: data.message,
      attachment: data.attachment,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      replies: []
    };

    setTickets(prev => [newTicket, ...prev]);

    // Notification to User
    const msg = `Your Helpdesk Ticket ${newTicket.id} regarding '${newTicket.category}' has been created successfully.`;
    sendSMS(user.mobile, msg);
    if(user.email) sendEmail(user.email, `Ticket Created: ${newTicket.id}`, msg);
  };

  const replyToTicket = (ticketId: string, user: User, message: string) => {
    const reply: TicketReply = {
      id: Date.now().toString(),
      senderId: user.id,
      senderName: user.role === UserRole.APPLICANT ? user.name : 'Administrative Officer',
      role: user.role,
      message: message,
      timestamp: new Date().toISOString()
    };

    setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
            // If Admin replies, trigger notification to candidate
            if (user.role !== UserRole.APPLICANT) {
                // Find candidate details (Simulated here, in real app fetch from DB)
                // We use the basic details stored in ticket or assume we have access
                // For this demo, we assume the 'user' object passed to createTicket had contact info, 
                // but here we might need to look it up. 
                // Simplified: Just log the notification intent
                console.log(`[Notification] Sending update for ${ticketId} to candidate.`);
            }
            return { ...t, replies: [...t.replies, reply], status: 'OPEN' }; // Re-open if replied
        }
        return t;
    }));
  };

  const resolveTicket = (ticketId: string) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'RESOLVED' } : t));
  };

  const getTicketsByUser = (userId: string) => {
    return tickets.filter(t => t.userId === userId);
  };

  return (
    <HelpdeskContext.Provider value={{ tickets, createTicket, replyToTicket, resolveTicket, getTicketsByUser }}>
      {children}
    </HelpdeskContext.Provider>
  );
};

export const useHelpdesk = () => {
  const context = useContext(HelpdeskContext);
  if (!context) {
    throw new Error('useHelpdesk must be used within a HelpdeskProvider');
  }
  return context;
};