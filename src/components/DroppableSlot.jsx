import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import DraggablePatient from './DraggablePatient';

import { Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DroppableSlot = ({ timeLabel, slotId, assignedReservations = [], onDelete, onEdit, onQuickAdd, onComplete }) => {
  const { t } = useLanguage();
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${slotId || timeLabel}`, 
  });

  const style = {
    minHeight: '120px', 
    border: '1px dashed var(--border)',
    borderRadius: 'var(--radius)',
    backgroundColor: isOver ? 'var(--primary-light)' : 'var(--bg-surface)',
    display: 'flex',
    flexDirection: 'column', 
    padding: '0.5rem',
    transition: 'background-color 0.2s',
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{ 
          marginBottom: '0.5rem',
          fontWeight: '600', 
          color: 'var(--text-muted)',
          borderBottom: '1px solid var(--border)',
          paddingBottom: '0.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
      }}>
        <span>{timeLabel}</span>
        <button 
            onClick={() => onQuickAdd && onQuickAdd(timeLabel)}
            style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer', 
                color: 'var(--primary)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center'
            }}
            title={t('quickAdd')}
        >
            <Plus size={16} />
        </button>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <SortableContext 
            items={assignedReservations.map(r => r.id)} 
            strategy={verticalListSortingStrategy}
        >
            {assignedReservations.length > 0 ? (
                assignedReservations.map(res => (
                    <DraggablePatient 
                        key={res.id} 
                        reservation={res} 
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onComplete={onComplete}
                    />
                ))
            ) : (
                <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', fontStyle: 'italic', padding: '0.5rem' }}>
                    {t('available')}
                </div>
            )}
        </SortableContext>
      </div>
    </div>
  );
};

export default DroppableSlot;
