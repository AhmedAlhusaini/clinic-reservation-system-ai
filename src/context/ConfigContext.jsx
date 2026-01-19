import React, { createContext, useContext, useState, useEffect } from 'react';

const ConfigContext = createContext(null);

export const useConfig = () => {
    return useContext(ConfigContext);
};

export const ConfigProvider = ({ children }) => {
    // Custom Form Fields
    const [customFields, setCustomFields] = useState([]);
    // Clinic Info
    const [clinicName, setClinicName] = useState('Pediatric Clinic');
    const [subTitle, setSubTitle] = useState('');
    const [logo, setLogo] = useState(null);

    useEffect(() => {
        const storedFields = localStorage.getItem('clinic_form_fields');
        if (storedFields) setCustomFields(JSON.parse(storedFields));

        const storedName = localStorage.getItem('clinic_name');
        if (storedName) setClinicName(storedName);

        const storedSub = localStorage.getItem('clinic_subtitle');
        if (storedSub) setSubTitle(storedSub);

        const storedLogo = localStorage.getItem('clinic_logo');
        if (storedLogo) setLogo(storedLogo);
    }, []);

    useEffect(() => {
        localStorage.setItem('clinic_form_fields', JSON.stringify(customFields));
    }, [customFields]);

    useEffect(() => {
        localStorage.setItem('clinic_name', clinicName);
    }, [clinicName]);

    useEffect(() => {
        if (subTitle) localStorage.setItem('clinic_subtitle', subTitle);
    }, [subTitle]);

    const addField = (label) => {
        if (!label) return;
        const newField = {
            id: Date.now().toString(),
            label,
            type: 'text'
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
        localStorage.setItem('clinic_subtitle', title);
    };

    const updateLogo = (newLogo) => {
        setLogo(newLogo);
        localStorage.setItem('clinic_logo', newLogo);
    };

    return (
        <ConfigContext.Provider value={{ customFields, addField, removeField, clinicName, updateClinicName, subTitle, updateSubTitle, logo, updateLogo }}>
            {children}
        </ConfigContext.Provider>
    );
};
