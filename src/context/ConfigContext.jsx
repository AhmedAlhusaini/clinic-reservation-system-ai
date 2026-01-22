import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

const ConfigContext = createContext(null);

export const useConfig = () => {
    return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
    const { t, language } = useLanguage();

    // Custom Form Fields
    const [customFields, setCustomFields] = useState(() => {
        const stored = localStorage.getItem('clinic_form_fields');
        return stored ? JSON.parse(stored) : [];
    });
    // Clinic Info
    const [clinicName, setClinicName] = useState(() => localStorage.getItem('clinic_name') || t('defaultClinicName'));
    const [subTitle, setSubTitle] = useState(() => localStorage.getItem('clinic_subtitle') || '');
    const [logo, setLogo] = useState(() => localStorage.getItem('clinic_logo') || null);
    
    // Update default name if language changes and no custom name saved
    useEffect(() => {
        if (!localStorage.getItem('clinic_name')) {
            setClinicName(t('defaultClinicName'));
        }
    }, [language, t]);
    
    // Schedule Settings (Lazy Init to prevent reset on refresh)
    const [workingDays, setWorkingDays] = useState(() => {
        const stored = localStorage.getItem('clinic_working_days');
        return stored ? JSON.parse(stored) : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'];
    });
    const [startHour, setStartHour] = useState(() => localStorage.getItem('clinic_start_hour') || '15:00');
    const [endHour, setEndHour] = useState(() => localStorage.getItem('clinic_end_hour') || '22:00');
    const [exceptions, setExceptions] = useState(() => {
        const stored = localStorage.getItem('clinic_exceptions');
        return stored ? JSON.parse(stored) : {};
    });
    const [maxPatientsPerSlot, setMaxPatientsPerSlot] = useState(() => {
        const stored = localStorage.getItem('clinic_max_patients');
        return stored ? parseInt(stored) : 5;
    });
    
    const [publicHolidays, setPublicHolidays] = useState([]); // Fetched via API, standard init is fine

    // Default Field Labels
    const [defaultLabels, setDefaultLabels] = useState(() => {
        const stored = localStorage.getItem('clinic_default_labels');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Migration: Check if values are strings (old format) and convert to object
            if (typeof parsed.childName === 'string') {
                return {
                    childName: { en: parsed.childName, ar: 'اسم الطفل' },
                    parentName: { en: parsed.parentName, ar: 'اسم ولي الأمر' },
                    phone: { en: parsed.phone, ar: 'رقم الهاتف' },
                    notes: { en: parsed.notes, ar: 'ملاحظات / التشخيص' }
                };
            }
            return parsed;
        }
        return {
            childName: { en: 'Child Name', ar: 'اسم الطفل' },
            parentName: { en: 'Parent Name', ar: 'اسم ولي الأمر' },
            phone: { en: 'Phone Number', ar: 'رقم الهاتف' },
            notes: { en: 'Notes / Diagnosis', ar: 'ملاحظات / التشخيص' }
        };
    });

    // --- Effects for Loading from LocalStorage ---
    useEffect(() => {
        // Fetch Holidays (with Fallback) - logic remains
        const fetchHolidays = async () => {
             // ... existing holiday fetch logic ...
             const year = new Date().getFullYear();
             try {
                const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/EG`);
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setPublicHolidays(data);
                        return;
                    } 
                    throw new Error('API data empty');
                } 
                throw new Error('API request failed');
            } catch (error) {
                // Fallback
                setPublicHolidays([
                    { date: `${year}-01-07`, localName: "Coptic Christmas" },
                    { date: `${year}-01-25`, localName: "Revolution Day" },
                    { date: `${year}-03-31`, localName: "Eid al-Fitr (Estimated)" }, 
                    { date: `${year}-04-21`, localName: "Sham Ennessim" },
                    { date: `${year}-04-25`, localName: "Sinai Liberation Day" },
                    { date: `${year}-05-01`, localName: "Labour Day" },
                    { date: `${year}-06-06`, localName: "Eid al-Adha (Estimated)" },
                    { date: `${year}-06-30`, localName: "June 30 Revolution Day" },
                    { date: `${year}-07-08`, localName: "Islamic New Year" },
                    { date: `${year}-07-23`, localName: "Revolution Day" },
                    { date: `${year}-09-15`, localName: "Prophet's Birthday" },
                    { date: `${year}-10-06`, localName: "Armed Forces Day" }
                ]);
            }
        };
        fetchHolidays();
        
        // Removed redundant localStorage gets since we use Lazy Init now
    }, []);

    // --- Effects for Saving to LocalStorage ---
    useEffect(() => {
        localStorage.setItem('clinic_form_fields', JSON.stringify(customFields));
    }, [customFields]);

    useEffect(() => {
        localStorage.setItem('clinic_name', clinicName);
    }, [clinicName]);

    useEffect(() => {
        if (subTitle !== undefined) localStorage.setItem('clinic_subtitle', subTitle);
    }, [subTitle]);

    useEffect(() => {
        if (logo !== undefined) localStorage.setItem('clinic_logo', logo);
    }, [logo]); 

    useEffect(() => {
        localStorage.setItem('clinic_working_days', JSON.stringify(workingDays));
    }, [workingDays]);

    useEffect(() => {
        localStorage.setItem('clinic_start_hour', startHour);
    }, [startHour]);

    useEffect(() => {
        localStorage.setItem('clinic_end_hour', endHour);
    }, [endHour]);

    useEffect(() => {
        localStorage.setItem('clinic_exceptions', JSON.stringify(exceptions));
    }, [exceptions]);

    // --- Handler Functions ---

  const addField = (label, type = 'text', options = [], required = false) => {
    const newField = {
        id: Date.now().toString(),
        label,
        type,
        options,
        required
    };
    setCustomFields(prev => [...prev, newField]);
  };

    const removeField = (id) => {
        setCustomFields(prev => prev.filter(f => f.id !== id));
    };

    const updateClinicName = (name) => {
        setClinicName(name);
    };

    const updateSubTitle = (title) => {
        setSubTitle(title);
    };

    const updateLogo = (newLogo) => {
        setLogo(newLogo);
    };

    const updateSchedule = (days, start, end, maxPatients) => {
        setWorkingDays(days);
        setStartHour(start);
        setEndHour(end);
        if (maxPatients) {
            setMaxPatientsPerSlot(parseInt(maxPatients));
            localStorage.setItem('clinic_max_patients', maxPatients);
        }
    };
    
    const updateMaxPatientsPerSlot = (num) => {
        setMaxPatientsPerSlot(num);
        localStorage.setItem('clinic_max_patients', num);
    };

    const updateException = (dateStr, status) => {
        // status: 'open', 'closed', or null (to remove)
        setExceptions(prev => {
            const next = { ...prev };
            if (status === null) {
                delete next[dateStr];
            } else {
                next[dateStr] = status;
            }
            return next;
        });
    };

    const updateDefaultLabel = (key, newLabel, lang) => {
        setDefaultLabels(prev => {
            const currentItem = prev[key];
            // Ensure currentItem is an object (migration safety)
            const safeItem = typeof currentItem === 'string' ? { en: currentItem, ar: currentItem } : (currentItem || {});
            
            const nextItem = { ...safeItem, [lang]: newLabel };
            const next = { ...prev, [key]: nextItem };
            localStorage.setItem('clinic_default_labels', JSON.stringify(next));
            return next;
        });
    };

    return (
        <ConfigContext.Provider value={{ 
            customFields, addField, removeField, 
            clinicName, updateClinicName, 
            subTitle, updateSubTitle, 
            logo, updateLogo,
            workingDays, startHour, endHour, updateSchedule, 
            maxPatientsPerSlot, updateMaxPatientsPerSlot,
            exceptions, updateException,
            defaultLabels, updateDefaultLabel,
            publicHolidays
        }}>
            {children}
        </ConfigContext.Provider>
    );
};
