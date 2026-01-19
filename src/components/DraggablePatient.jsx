import React, { forwardRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Edit, CheckCircle } from 'lucide-react';

// Dumb component for display (used in list and overlay)
export const PatientCard = forwardRef(({ reservation, onDelete, onEdit, onComplete, isOverlay, showReason, style, ...props }, ref) => {
    return (
        <div
            ref={ref}
            style={{
                ...style,
                backgroundColor: isOverlay ? '#ffffff' : 'var(--bg-surface)',
                boxShadow: isOverlay ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : (style?.boxShadow || 'var(--shadow)'),
                zIndex: isOverlay ? 99999 : 'auto',
                opacity: 1,
                border: isOverlay ? '2px solid var(--primary)' : 
                        (reservation.status === 'emergency' ? '1px solid var(--border)' : 
                         (reservation.status === 'cancelled' || reservation.status === 'no-show') ? '1px solid var(--border)' :
                         '1px solid var(--border)'),
                scale: isOverlay ? 1.05 : 1,
                padding: '0.75rem',
                borderRadius: 'var(--radius)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                touchAction: 'none', 
                position: 'relative',
                cursor: isOverlay ? 'grabbing' : 'grab',
            }}
            {...props}
        >
          <div 
             style={{ 
                cursor: isOverlay ? 'grabbing' : 'grab', 
                color: 'var(--text-light)', 
                display: 'flex', 
                alignItems: 'center',
                height: '100%' 
            }}
            className="drag-handle"
          >
            <GripVertical size={16} />
          </div>
    
          <div style={{ flex: 1, userSelect: 'none' }}>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{reservation.childName}</div>
            
            {/* Phone Badge */}
            <div style={{ 
                display: 'inline-flex', 
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface)', 
                border: '1px solid var(--primary)', 
                color: 'var(--primary)', 
                fontSize: '0.7rem', 
                borderRadius: '1rem', 
                padding: '0.1rem 0.5rem',
                marginTop: '0.25rem',
                fontWeight: '600'
            }}>
                {reservation.phone}
            </div>

            {/* Emergency Badge */}
            {reservation.status === 'emergency' && (
                <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    backgroundColor: 'var(--danger-light, #fee2e2)', 
                    color: 'var(--danger)', 
                    fontSize: '0.7rem', 
                    borderRadius: '1rem', 
                    padding: '0.1rem 0.5rem',
                    fontWeight: '700',
                    marginLeft: '0.5rem',
                    border: '1px solid var(--danger)'
                }}>
                    URGENT
                </div>
            )}

            {/* Archive Reason Badges (No Show vs Cancelled) */}
            {showReason && (reservation.status === 'no-show' || reservation.status === 'cancelled') && (
                 <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    backgroundColor: reservation.status === 'no-show' ? '#f3f4f6' : '#fff7ed', 
                    color: reservation.status === 'no-show' ? '#374151' : '#c2410c', 
                    fontSize: '0.7rem', 
                    borderRadius: '1rem', 
                    padding: '0.1rem 0.5rem',
                    fontWeight: '700',
                    marginLeft: '0.5rem',
                    border: reservation.status === 'no-show' ? '1px solid #9ca3af' : '1px solid #fb923c'
                }}>
                    {reservation.status === 'no-show' ? 'NO SHOW' : 'CANCELLED'}
                </div>
            )}

            {/* Extras hidden as per Release 1.7.4 request 
               "inline details only phon" -> "make it word in backgroud or inline color different + phonse number"
            */}
          </div>
    
          {/* Actions - hide actions in overlay to reduce noise? User didn't ask, but it looks cleaner. Let's keep them static. */}
          {!isOverlay && (
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {onComplete && (
                  <button 
                      onPointerDown={(e) => { e.stopPropagation(); }}
                      onClick={() => onComplete(reservation.id)}
                      style={{ color: 'var(--success)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                      title="Mark as Complete"
                  >
                      <CheckCircle size={16} />
                  </button>
                )}
                <button 
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    onClick={() => onEdit && onEdit(reservation)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
                    title="Edit"
                >
                    <Edit size={14} />
                </button>
                <button 
                    onPointerDown={(e) => { e.stopPropagation(); }}
                    onClick={() => onDelete && onDelete(reservation.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--danger)' }}
                    title="Delete"
                >
                    <Trash2 size={14} />
                </button>
              </div>
          )}
        </div>
    );
});

const DraggablePatient = ({ reservation, onDelete, onEdit, onComplete, showReason }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: reservation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1, // Dim the original item while dragging
  };

  return (
      <PatientCard 
          ref={setNodeRef}
          style={style}
          reservation={reservation}
          onDelete={onDelete}
          onEdit={onEdit}
          onComplete={onComplete}
          showReason={showReason}
          {...attributes}
          {...listeners}
      />
  );
};

export default DraggablePatient;
