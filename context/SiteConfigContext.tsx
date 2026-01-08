import React, { createContext, useContext, useState, useEffect } from 'react';
import { LinkItem, NewsItem } from '../types';

export interface SiteConfig {
  header: {
    ministryText: string;
    organizationName: string;
    organizationSubtitle: string;
    parentOrganization: string;
    logoUrl: string;
  };
  footer: {
    aboutText: string;
    address: string;
    copyrightText: string;
    contactEmail: string;
    quickLinks: LinkItem[];
    supportLinks: LinkItem[];
  };
  assistance: {
    title: string;
    description: string;
  };
  landing: {
    heroImageUrl: string;
  };
  smtp: {
    enabled: boolean;
    host: string;
    port: number;
    user: string;
    pass: string;
    fromEmail: string;
  };
  notifications: {
    smsEnabled: boolean;
    whatsappEnabled: boolean;
    // WhatsApp Meta API Config
    whatsapp: {
      provider: string; // 'Meta' | 'Twilio'
      phoneNumberId: string;
      accessToken: string;
      businessAccountId: string;
      templateName: string; // e.g., 'application_update'
    };
    // SMS Gateway Config
    sms: {
      gatewayUrl: string;
      apiKey: string;
      senderId: string; // e.g., 'CSIRTN'
      entityId: string; // DLT Entity ID
      templateId: string; // DLT Template ID
    };
  };
  news: NewsItem[];
}

const DEFAULT_CONFIG: SiteConfig = {
  header: {
    ministryText: "MINISTRY OF SCIENCE & TECHNOLOGY",
    organizationName: "CSIR-SERC",
    organizationSubtitle: "Structural Engineering Research Centre",
    parentOrganization: "Council of Scientific & Industrial Research",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/2/22/CSIR_Logo.svg"
  },
  footer: {
    aboutText: "Council of Scientific & Industrial Research - Structural Engineering Research Centre, Chennai. Pioneering advanced structural engineering solutions for the nation.",
    address: "CSIR Road, Taramani,\nChennai - 600 113\nIndia.",
    copyrightText: "© 2024 CSIR-SERC. All Rights Reserved. | Compliance to GIGW 3.0 | Noto Sans Font",
    contactEmail: "recruit@serc.res.in",
    quickLinks: [
      { id: '1', label: 'About Us', url: '#' },
      { id: '2', label: 'RTI', url: '#' },
      { id: '3', label: 'Tenders', url: '#' },
      { id: '4', label: 'Contact Us', url: '#' }
    ],
    supportLinks: [
      { id: '1', label: 'Recruitment Rules', url: '#' },
      { id: '2', label: 'FAQ', url: '#' },
      { id: '3', label: 'Technical Helpdesk', url: '#' },
      { id: '4', label: 'Sitemap', url: '#' }
    ]
  },
  assistance: {
    title: "Need Assistance?",
    description: "For technical queries regarding the online application portal, please contact our helpdesk. Check the FAQ section before raising a ticket."
  },
  landing: {
    // CSIR-SERC Main Building Image
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/CSIR-SERC_Main_Building.jpg/1200px-CSIR-SERC_Main_Building.jpg"
  },
  smtp: {
    enabled: true,
    host: "smtp.gmail.com",
    port: 587,
    user: "ictserc@gmail.com",
    pass: "yyhoakynckydyybm",
    fromEmail: "ictserc@gmail.com"
  },
  notifications: {
    smsEnabled: false,
    whatsappEnabled: false,
    whatsapp: {
      provider: 'Meta',
      phoneNumberId: '',
      accessToken: '',
      businessAccountId: '',
      templateName: 'application_status_update'
    },
    sms: {
      gatewayUrl: 'https://sms.gov.in/api/v1/send',
      apiKey: '',
      senderId: 'CSIRSC',
      entityId: '',
      templateId: ''
    }
  },
  news: [
    { id: '1', text: "THIS IS A DEMO SITE FOR CSIR-SERC RECRUITMENT", isNew: false },
    { id: '2', text: "Last Date for Scientist 'C' (SCI-01-2024) extended to June 30, 2024", isNew: true },
    { id: '3', text: "Download the latest GIGW 3.0 Compliance Guidelines from Helpdesk", isNew: false },
    { id: '4', text: "Interviews for Technical Officer posts scheduled for July 15th", isNew: false }
  ]
};

interface SiteConfigContextType {
  config: SiteConfig;
  updateConfig: (newConfig: SiteConfig) => void;
  resetConfig: () => void;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    const saved = localStorage.getItem('siteConfig');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Deep merge to ensure new fields (like whatsapp object) are present if old config exists in localstorage
        setConfig({ 
            ...DEFAULT_CONFIG, 
            ...parsed, 
            header: { ...DEFAULT_CONFIG.header, ...parsed.header },
            footer: { ...DEFAULT_CONFIG.footer, ...parsed.footer },
            landing: { ...DEFAULT_CONFIG.landing, ...parsed.landing },
            smtp: { ...DEFAULT_CONFIG.smtp, ...parsed.smtp },
            notifications: { 
              ...DEFAULT_CONFIG.notifications, 
              ...parsed.notifications,
              whatsapp: { ...DEFAULT_CONFIG.notifications.whatsapp, ...parsed.notifications?.whatsapp },
              sms: { ...DEFAULT_CONFIG.notifications.sms, ...parsed.notifications?.sms }
            },
            news: parsed.news || DEFAULT_CONFIG.news
        });
      } catch (e) {
        console.error("Failed to parse site config", e);
      }
    }
  }, []);

  const updateConfig = (newConfig: SiteConfig) => {
    setConfig(newConfig);
    localStorage.setItem('siteConfig', JSON.stringify(newConfig));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    localStorage.removeItem('siteConfig');
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};