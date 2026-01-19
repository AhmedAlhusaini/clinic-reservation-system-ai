import React from 'react';
import DroppableSlot from './DroppableSlot';
import { format, addMinutes, parse } from 'date-fns';
import { useConfig } from '../context/ConfigContext';

const ScheduleBoard = ({ reservations, onDelete, onEdit, onQuickAdd, onComplete }) => {
  const { startHour, endHour } = useConfig();

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

    while (startTime < endTime) {
      const nextHour = addMinutes(startTime, 60);
      const label = `${format(startTime, 'h a')} - ${format(nextHour, 'h a')}`;
      slots.push(label);
      startTime = nextHour;
    }
    return slots;
  };

  const timeSlots = generateSlots();
  
  // Dynamic Title
  const sLabel = format(parse(startHour || '15:00', 'HH:mm', new Date()), 'h a');
  const eLabel = format(parse(endHour || '22:00', 'HH:mm', new Date()), 'h a');

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        Day Schedule ({sLabel} - {eLabel})
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {timeSlots.map((time) => {
           // Find ALL reservations assigned to this slot
           const assigned = reservations.filter(r => r.timeSlot === time);
           return (
             <DroppableSlot 
                key={time} 
                timeLabel={time} 
                assignedReservations={assigned} 
                onDelete={onDelete}
                onEdit={onEdit}
                onQuickAdd={onQuickAdd}
                onComplete={onComplete}
             />
           );
        })}
      </div>
    </div>
  );
};

export default ScheduleBoard;
