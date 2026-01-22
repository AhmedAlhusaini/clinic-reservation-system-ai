import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  // Initialize from localStorage or default to 'en'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('clinic_lang') || 'en';
  });

  useEffect(() => {
    // Persist choice
    localStorage.setItem('clinic_lang', language);
    
    // Update document direction and language attribute
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    
    // Optional: Add a class for specific styling hooks if needed
    if (language === 'ar') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'ar') {
      setLanguage(lang);
    }
  };

  // Helper to get translation
  // If key not found, return the key itself
  const t = (key, params = {}) => {
    let text = translations[language][key] || key;
    
    // Simple interpolation: replaces {param} with value
    Object.keys(params).forEach(param => {
       text = text.replace(`{${param}}`, params[param]);
    });

    return text;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isRTL: language === 'ar'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
