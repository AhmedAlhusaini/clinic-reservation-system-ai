import React, { createContext, useContext, useState, useEffect } from 'react';
import { format, isToday, parseISO } from 'date-fns';
import { arrayMove } from '@dnd-kit/sortable';

const ReservationContext = createContext(null);

export const useReservations = () => {
    return useContext(ReservationContext);
};

export const ReservationProvider = ({ children }) => {
    const [reservations, setReservations] = useState([]);
    const [currentDate, setCurrentDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    // Load from local storage and check date
    useEffect(() => {
        const storedRes = localStorage.getItem('clinic_reservations');
        const storedDate = localStorage.getItem('clinic_date');
        
        if (storedDate && storedRes) {
            // Check if stored date is today
            if (storedDate === format(new Date(), 'yyyy-MM-dd')) {
                 setReservations(JSON.parse(storedRes));
            } else {
                 // New day, clear reservations
                 localStorage.removeItem('clinic_reservations');
                 localStorage.setItem('clinic_date', format(new Date(), 'yyyy-MM-dd'));
                 setReservations([]);
            }
        } else {
             localStorage.setItem('clinic_date', format(new Date(), 'yyyy-MM-dd'));
        }
    }, []);

    // Save to local storage whenever reservations change
    useEffect(() => {
        if (reservations.length > 0) {
            localStorage.setItem('clinic_reservations', JSON.stringify(reservations));
        }
    }, [reservations]);

    const addReservation = (patientData) => {
        const newReservation = {
            id: Date.now().toString(),
            ...patientData,
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
