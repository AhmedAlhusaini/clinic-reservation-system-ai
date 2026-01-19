import React, { useState } from 'react';
import PatientForm from '../components/PatientForm';
import { useReservations } from '../context/ReservationContext';
import { useToast } from '../context/ToastContext';
import { Clock, Users, XCircle, AlertCircle, CheckCircle } from 'lucide-react';
import { DndContext, useSensor, useSensors, PointerSensor, useDroppable, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import ScheduleBoard from '../components/ScheduleBoard';
import DraggablePatient, { PatientCard } from '../components/DraggablePatient';

const DroppableZone = ({ id, children, style }) => {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
};

const Dashboard = () => {
  const { addReservation, reservations, updateReservation, removeReservation, reorderInSlot, updateStatus } = useReservations();
  const { showToast } = useToast();
  const [editingPatient, setEditingPatient] = useState(null);
  const [quickAddSlot, setQuickAddSlot] = useState(null);
  const [cancelModal, setCancelModal] = useState(null); 
  const [activeId, setActiveId] = useState(null); // Track dragged item

  const handleAddPatient = (data) => {
    addReservation(data);
    showToast('Patient added', 'success');
    setQuickAddSlot(null);
  };

  const handleUpdatePatient = (data) => {
    if (editingPatient && editingPatient.id) {
        updateReservation(editingPatient.id, data);
        showToast('Patient updated', 'success');
        setEditingPatient(null);
    } else {
        // Fallback for quick add scenario where we might be adding new
        addReservation(data);
        showToast('Patient added', 'success');
        setEditingPatient(null);
        setQuickAddSlot(null);
    }
  };

  const handleDelete = (id) => {
      if (window.confirm('Are you sure you want to delete this patient?')) {
          removeReservation(id);
          showToast('Patient deleted', 'info');
      }
  };

  const handleEdit = (patient) => {
      setEditingPatient(patient);
  };

  const handleQuickAdd = (timeSlot) => {
      setQuickAddSlot(timeSlot);
      // We pass this slot to the form via initialData logic below
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, 
      },
    })
  );

  const handleDragStart = (event) => {
      setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    setActiveId(null);
    const { active, over } = event;
    // ... existing logic


    if (!over) return;

    // source checks
    const activeRes = reservations.find(r => r.id === active.id);
    if (!activeRes) return; // Should not happen

    if (active.id !== over.id) {
        // Zone Checks
        // Specific Zone Drops (Container Level)
        
        // 1. Drop to Unassigned Zone
        if (over.id === 'unassigned-zone') {
             // Reset to active/null slot regardless of where it came from (Archive, Completed, or Slot)
             updateStatus(active.id, 'active'); 
             updateReservation(active.id, { timeSlot: null });
             showToast('Moved to Unassigned', 'success');
             return;
        }
        
        // 2. Drop to Archive Zone
        if (over.id === 'archive-zone') {
             // If coming from Completed or Active, ask to cancel?
             // Or just move to Cancelled state immediately
             setCancelModal({ id: active.id });
             return;
        }

        const overRes = reservations.find(r => r.id === over.id);

        if (overRes) {
            // Drop over another patient
            
            // If dropping over a patient in Unassigned (who has no timeslot)
            if (!overRes.timeSlot) {
                // Target is unassigned
                updateStatus(active.id, 'active');
                updateReservation(active.id, { timeSlot: null });
                showToast('Moved to Unassigned', 'success');
                return;
            }
            
            // If dropping over a completed patient?? (Not sortable yet really, but safety check)
            if (overRes.status === 'completed') {
                // Treat as moving to completed? Or prevent?
                // For now, let's treat it as "moved to unassigned" or just ignore
                return; 
            }

            // Schedule slots
            if (activeRes.timeSlot === overRes.timeSlot) {
                // If we are just reordering in same slot, no status change needed usually
                // BUT if we dragged from archive/completed to here, we must set active
                 if (activeRes.status !== 'active') updateStatus(active.id, 'active');
                reorderInSlot(activeRes.timeSlot, active.id, over.id);
            } else {
                updateReservation(active.id, { timeSlot: overRes.timeSlot });
                if (activeRes.status !== 'active') updateStatus(active.id, 'active');
            }
        } else {
             // Dropped over a time slot container
             // Need to check if over.id is actually a time slot!
             // It could be something else if we aren't careful, but our ScheduleBoard container IDs are time labels.
             
             updateReservation(active.id, { timeSlot: over.id });
             if (activeRes.status !== 'active') updateStatus(active.id, 'active');
        }
    }
  };
  
  const handleConfirmCancel = (reason) => {
      if (cancelModal) {
          updateStatus(cancelModal.id, 'cancelled', reason);
          showToast(`Marked as ${reason}`, 'success');
          setCancelModal(null);
      }
  };

  const handleComplete = (id) => {
      updateStatus(id, 'completed', 'Completed');
      showToast('Patient marked as Completed', 'success');
  };

  const unassignedReservations = reservations.filter(r => !r.timeSlot && r.status === 'active');
  // Archive includes cancelled, no-show
  const archivedReservations = reservations.filter(r => r.status === 'cancelled' || r.status === 'no-show');
  const completedReservations = reservations.filter(r => r.status === 'completed');

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard</h2>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={20} className="text-blue-500" style={{ color: 'var(--primary)' }}/>
                  <span style={{ fontWeight: '600' }}>{reservations.length} Patients</span>
               </div>
               <div className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Clock size={20} style={{ color: 'var(--secondary)' }}/>
                  <span style={{ fontWeight: '600' }}>{new Date().toLocaleDateString()}</span>
               </div>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* Left Col: Registration & Unassigned */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <PatientForm onSubmit={handleAddPatient} />
              
               <div className="card">
                  <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    Unassigned Patients
                  </h3>
                  <DroppableZone id="unassigned-zone" style={{ minHeight: '100px', borderRadius: 'var(--radius)' }}>
                     <SortableContext items={unassignedReservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
                         {unassignedReservations.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>Drop here to unassign</p>
                         ) : (
                            unassignedReservations.map(res => (
                              <DraggablePatient 
                                 key={res.id} 
                                 reservation={res} 
                                 onDelete={handleDelete}
                                 onEdit={handleEdit}
                              />
                            ))
                         )}
                     </SortableContext>
                  </DroppableZone>
               </div>

               {/* Completed Zone */}
               <div className="card" style={{ borderColor: 'var(--success)' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--success)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} /> Completed ({completedReservations.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                       {completedReservations.length === 0 && (
                           <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-light)' }}>
                               No completed patients yet.
                           </div>
                       )}
                       {completedReservations.map(res => (
                           <div key={res.id} style={{ opacity: 0.7 }}>
                               <DraggablePatient 
                                   reservation={res} 
                                   // read only basically
                               />
                           </div>
                       ))}
                  </div>
               </div>

               {/* Archive / History Zone */}
               <div className="card" style={{ borderColor: 'var(--border)' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={18} /> Archive / History
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    Drag here to Cancel or Archive
                  </p>
                  <DroppableZone id="archive-zone" style={{ 
                      minHeight: '80px', 
                      border: '2px dashed var(--border)', 
                      borderRadius: 'var(--radius)', 
                      display: 'flex', flexDirection: 'column', gap: '0.5rem',
                      padding: '0.5rem',
                      backgroundColor: 'var(--bg-body)'
                  }}>
                      {archivedReservations.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-light)' }}>
                              Drop here to Cancel or Remove
                          </div>
                      )}
                      
                      <SortableContext items={archivedReservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
                          {archivedReservations.map(res => (
                              <DraggablePatient 
                                  key={res.id} 
                                  reservation={res} 
                                  onDelete={handleDelete}
                                  onEdit={handleEdit}
                                  // No onComplete here (already archived)
                              />
                          ))}
                      </SortableContext>
                  </DroppableZone>
               </div>
             </div>

            {/* Right Col: Schedule */}
            <div>
              {/* Note: ScheduleBoard and DroppableSlot need to pass down handlers too. We need to refactor them or use Context for handlers to avoid drilling.
                  For MVP speed, let's drill. */}
              <ScheduleBoard 
                reservations={reservations.filter(r => r.status === 'active')} 
                onDelete={handleDelete}
                onEdit={handleEdit}
                onQuickAdd={handleQuickAdd}
                onComplete={handleComplete}
              />
            </div>
         </div>
      </div>

      {/* Edit / Quick Add Modal Overlay */}
      {(editingPatient || quickAddSlot) && (
          <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
          }}>
              <div style={{ width: '100%', maxWidth: '500px' }}>
                  <PatientForm 
                    initialData={editingPatient || (quickAddSlot ? { timeSlot: quickAddSlot } : null)}  
                    onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient} 
                    onCancel={() => {
                        setEditingPatient(null);
                        setQuickAddSlot(null);
                    }} 
                  />
              </div>
          </div>
      )}
      {/* Cancel Reason Modal */}
      {cancelModal && (
          <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000
          }}>
              <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                  <h3>Reason for Cancellation?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn" onClick={() => handleConfirmCancel('Cancelled')}>Cancelled</button>
                      <button className="btn" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleConfirmCancel('No Show')}>No Show</button>
                      {/* Completed and Unregistered removed as per 1.7.4 request - use Drag or Check button instead */}
                      <button className="btn" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }} onClick={() => setCancelModal(null)}>Back to Schedule</button>
                  </div>
              </div>
          </div>
      )}
       {/* Overlay for smooth dragging */}
       <DragOverlay>
          {activeId ? (
              <PatientCard 
                  reservation={reservations.find(r => r.id === activeId)} 
                  isOverlay 
              />
          ) : null}
       </DragOverlay>
    </DndContext>
  );
};

export default Dashboard;
