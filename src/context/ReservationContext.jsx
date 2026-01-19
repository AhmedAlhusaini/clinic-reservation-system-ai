import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { arrayMove } from '@dnd-kit/sortable';

const ReservationContext = createContext(null);

export const useReservations = () => {
    return useContext(ReservationContext);
};

export const ReservationProvider = ({ children }) => {
    const [reservations, setReservations] = useState(() => {
        const stored = localStorage.getItem('clinic_reservations');
        return stored ? JSON.parse(stored) : [];
    });
    const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Load from local storage - REMOVED redundant effect
    // useEffect(() => {
    //     const storedRes = localStorage.getItem('clinic_reservations');
    //     if (storedRes) {
    //         setReservations(JSON.parse(storedRes));
    //     }
    // }, []);

    // Save to local storage whenever reservations change
    useEffect(() => {
        // We always save, even if empty, to ensure state persistence
        localStorage.setItem('clinic_reservations', JSON.stringify(reservations));
    }, [reservations]);

    const addReservation = (patientData, appointmentDate) => {
        const newReservation = {
            id: Date.now().toString(),
            ...patientData,
            date: appointmentDate || format(new Date(), 'yyyy-MM-dd'), // Default to today if not specified
            status: 'active', // active, cancelled, no-show, completed
            statusReason: null,
            timeSlot: patientData.timeSlot || null, 
            createdAt: new Date().toISOString()
        };
        setReservations(prev => [...prev, newReservation]);
    };

    const removeReservation = (id) => {
        setReservations(prev => prev.filter(r => r.id !== id));
    };

    const updateReservation = (id, updates) => {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    const updateStatus = (id, status, reason = null) => {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status, statusReason: reason, timeSlot: status !== 'active' ? null : r.timeSlot } : r));
    };

    const reorderInSlot = (slot, activeId, overId) => {
        setReservations((prev) => {
             // Get items in this slot
             const slotItems = prev.filter(r => r.timeSlot === slot);
             const oldIndex = slotItems.findIndex(r => r.id === activeId);
             const newIndex = slotItems.findIndex(r => r.id === overId);
             
             if (oldIndex !== -1 && newIndex !== -1) {
                 // Create new sorted array for this slot
                 const newSlotOrder = arrayMove(slotItems, oldIndex, newIndex);
                 
                 // We need to merge this back into the main array.
                 // This is tricky because main array is mixed.
                 // Strategy: Remove old slot items from main, push new ones?
                 // Order in main array usually determines render order if we map filtered.
                 // Yes, filtering preserves relative order.
                 
                 const otherItems = prev.filter(r => r.timeSlot !== slot);
                 // We need to make sure 'newSlotOrder' is appended or inserted?
                 // Actually, if we just concatenate, it works for visualization.
                 return [...otherItems, ...newSlotOrder];
             }
             return prev;
        });
    };

    return (
        <ReservationContext.Provider value={{ reservations, addReservation, removeReservation, updateReservation, reorderInSlot, updateStatus, currentDate }}>
            {children}
        </ReservationContext.Provider>
    );
};
