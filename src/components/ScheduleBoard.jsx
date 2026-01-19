import React from 'react';
import DroppableSlot from './DroppableSlot';
import { format, addMinutes, parse } from 'date-fns';

const ScheduleBoard = ({ reservations, onDelete, onEdit, onQuickAdd, onComplete }) => {
  // Generate slots from 3:00 PM to 10:00 PM (1 hour intervals)
  const generateSlots = () => {
    const slots = [];
    let startTime = parse('15:00', 'HH:mm', new Date());
    const endTime = parse('22:00', 'HH:mm', new Date()); // Extended to cover last slot

    while (startTime < endTime) {
      // Use format 'hh:00 a' - 'hh:00 a' range label?
      const nextHour = addMinutes(startTime, 60);
      const label = `${format(startTime, 'h a')} - ${format(nextHour, 'h a')}`;
      slots.push(label);
      startTime = nextHour;
    }
    return slots;
  };

  const timeSlots = generateSlots();

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
        Day Schedule (3 PM - 10 PM)
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
