import React, { createContext, useContext, useState, useEffect } from 'react';

const FormContext = createContext(null);

export const useFormConfig = () => {
    return useContext(FormContext);
};

export const FormProvider = ({ children }) => {
    const [customFields, setCustomFields] = useState([]);

    useEffect(() => {
        const stored = localStorage.getItem('clinic_form_fields');
        if (stored) {
            setCustomFields(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('clinic_form_fields', JSON.stringify(customFields));
    }, [customFields]);

    const addField = (label) => {
        if (!label) return;
        const newField = {
            id: Date.now().toString(),
            label,
            type: 'text' // Simplify to text only for MVP
        };
        setCustomFields(prev => [...prev, newField]);
    };

    const removeField = (id) => {
        setCustomFields(prev => prev.filter(f => f.id !== id));
    };

    return (
        <FormContext.Provider value={{ customFields, addField, removeField }}>
            {children}
        </FormContext.Provider>
    );
};
