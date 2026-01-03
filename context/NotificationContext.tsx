import React, { createContext, useContext, useState } from 'react';
import { User, ApplicationStatus } from '../types';

interface NotificationContextType {
  sendWhatsApp: (mobile: string, message: string, pdfLink?: string) => void;
  sendSMS: (mobile: string, message: string) => void;
  sendEmail: (email: string, subject: string, message: string, attachment?: any) => void;
  notifyCandidates: (postTitle: string, message: string, type: 'NEW_POST' | 'UPDATE' | 'SELECTION') => void;
  notifyStatusChange: (applicant: User, status: ApplicationStatus, postTitle: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  // Simulation of external API calls
  const sendWhatsApp = (mobile: string, message: string, pdfLink?: string) => {
    console.log(`[WhatsApp Sent] To: ${mobile} | Msg: ${message} ${pdfLink ? `| PDF: ${pdfLink}` : ''}`);
    // In real app: await fetch('/api/whatsapp/send', ...)
  };

  const sendSMS = (mobile: string, message: string) => {
    console.log(`[SMS Sent] To: ${mobile} | Msg: ${message}`);
  };

  const sendEmail = (email: string, subject: string, message: string) => {
    console.log(`[Email Sent] To: ${email} | Subject: ${subject} | Body: ${message}`);
  };

  const notifyCandidates = (postTitle: string, message: string, type: 'NEW_POST' | 'UPDATE' | 'SELECTION') => {
    console.log(`[Broadcast] Type: ${type} | Post: ${postTitle} | Msg: ${message}`);
    // Logic to fetch all registered users and loop sendWhatsApp/sendEmail
  };

  const notifyStatusChange = (applicant: any, status: ApplicationStatus, postTitle: string) => {
    // Constraint: Notification will not be sent during scrutinizing
    if (status === ApplicationStatus.UNDER_SCRUTINY) {
      console.log(`[Notification Suppressed] Scrutiny phase for ${applicant.name}`);
      return;
    }

    const msg = `Dear ${applicant.name}, the status of your application for ${postTitle} has been updated to: ${status}.`;
    
    // Check if it's a selection status for WhatsApp PDF
    if (status === ApplicationStatus.SELECTED || status === ApplicationStatus.ELIGIBLE_INTERVIEW) {
       sendWhatsApp(applicant.mobile, msg, "https://portal.serc.res.in/docs/selection_om.pdf");
       sendEmail(applicant.email, "Application Update - CSIR-SERC", msg);
    } else {
       sendWhatsApp(applicant.mobile, msg);
       sendSMS(applicant.mobile, msg);
    }
  };

  return (
    <NotificationContext.Provider value={{ sendWhatsApp, sendSMS, sendEmail, notifyCandidates, notifyStatusChange }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};