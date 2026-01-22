import React from 'react';
import DroppableSlot from './DroppableSlot';
import { format, addMinutes, parse } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useConfig } from '../context/ConfigContext';
import { useLanguage } from '../context/LanguageContext';

const ScheduleBoard = ({ reservations, onDelete, onEdit, onQuickAdd, onComplete }) => {
  const { startHour, endHour } = useConfig();
  const { t, language } = useLanguage();

  // Generate slots dynamically based on Config
  const generateSlots = () => {
    const slots = [];
    // Default fallback if config missing
    const s = startHour || '15:00';
    const e = endHour || '22:00';
    
    let startTime = parse(s, 'HH:mm', new Date());
    const endTime = parse(e, 'HH:mm', new Date());

    // Safety check just in case parse fails or end < start
    if (isNaN(startTime) || isNaN(endTime)) return [];

    const locale = language === 'ar' ? ar : undefined;

    while (startTime < endTime) {
      const nextHour = addMinutes(startTime, 60);
      // Stable ID (English/Invariant) for DB persistence
      const id = `${format(startTime, 'h a')} - ${format(nextHour, 'h a')}`; 
      // Display Label (Localized)
      const display = `${format(startTime, 'h a', { locale })} - ${format(nextHour, 'h a', { locale })}`;
      
      slots.push({ id, display });
      startTime = nextHour;
    }
    return slots;
  };

  const timeSlots = generateSlots();
  
  // Dynamic Title
  const locale = language === 'ar' ? ar : undefined;
  const sLabel = format(parse(startHour || '15:00', 'HH:mm', new Date()), 'h a', { locale });
  const eLabel = format(parse(endHour || '22:00', 'HH:mm', new Date()), 'h a', { locale });

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        {t('daySchedule')} ({sLabel} - {eLabel})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {timeSlots.map((slot) => {
           // Find ALL reservations assigned to this slot (using stable ID)
           const assigned = reservations.filter(r => r.timeSlot === slot.id);
           return (
             <DroppableSlot 
                key={slot.id} 
                slotId={slot.id}
                timeLabel={slot.display} 
                assignedReservations={assigned} 
                onDelete={onDelete}
                onEdit={onEdit}
                onQuickAdd={() => onQuickAdd(slot.id)}
                onComplete={onComplete}
             />
           );
        })}
      </div>
    </div>
  );
};

export default ScheduleBoard;
