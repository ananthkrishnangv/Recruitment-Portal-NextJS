import React, { createContext, useContext, useState } from 'react';
import { ApplicationFormState, ApplicationStatus } from '../types';
import { useNotifications } from './NotificationContext';

interface ApplicationContextType {
  applications: ApplicationFormState[];
  submitApplication: (app: ApplicationFormState) => void;
  getUserApplications: (aadhaar: string) => ApplicationFormState[];
  updateApplicationStatus: (appId: string, status: ApplicationStatus, remarks?: string) => void;
  bulkUpdateStatus: (appIds: string[], status: ApplicationStatus, remarks?: string) => void;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const ApplicationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<ApplicationFormState[]>([]);
  const { notifyStatusChange } = useNotifications();

  const submitApplication = (app: ApplicationFormState) => {
    setApplications(prev => [...prev, app]);
  };

  const getUserApplications = (aadhaar: string) => {
    return applications.filter(app => app.personalDetails.aadhaar === aadhaar);
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus, remarks?: string) => {
    setApplications(prev => prev.map(app => {
      if (app.applicationNumber === appId) {
        // Trigger notification if status changes
        if (app.status !== status) {
            // Logic to construct a User object from application details for notification
            const tempUser = {
                id: app.personalDetails.aadhaar,
                name: app.personalDetails.fullName,
                email: 'applicant@example.com', // In real app, this comes from User table
                mobile: app.personalDetails.mobile,
                aadhaar: app.personalDetails.aadhaar,
                role: 'APPLICANT' as any
            };
            notifyStatusChange(tempUser, status, app.postTitle || 'Job Post');
        }
        return { ...app, status, remarks };
      }
      return app;
    }));
  };

  const bulkUpdateStatus = (appIds: string[], status: ApplicationStatus, remarks?: string) => {
      setApplications(prev => prev.map(app => {
          if (app.applicationNumber && appIds.includes(app.applicationNumber)) {
             return { ...app, status, remarks };
          }
          return app;
      }));
  };

  return (
    <ApplicationContext.Provider value={{ applications, submitApplication, getUserApplications, updateApplicationStatus, bulkUpdateStatus }}>
      {children}
    </ApplicationContext.Provider>
  );
};

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within a ApplicationProvider');
  }
  return context;
};