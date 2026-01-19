import React, { useState, useEffect } from 'react';
import PatientForm from '../components/PatientForm';
import { useReservations } from '../context/ReservationContext';
import { useToast } from '../context/ToastContext';
import { useConfig } from '../context/ConfigContext';
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

const Dashboard = ({ onNavigate }) => {
  const { addReservation, reservations, updateReservation, removeReservation, reorderInSlot, updateStatus } = useReservations();
  const { showToast } = useToast();
  const [editingPatient, setEditingPatient] = useState(null);
  const [quickAddSlot, setQuickAddSlot] = useState(null);
  const [cancelModal, setCancelModal] = useState(null); // { id }
  const [activeId, setActiveId] = useState(null); 

  // Date State
  // Date State - Fix: Use local date to avoid timezone issues
  const [selectedDate, setSelectedDate] = useState(() => {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }); 

  // Helper filter for date 
  const isForDate = (res, dateStr) => {
      if (!res.date) {
          const today = new Date().toISOString().split('T')[0];
          return dateStr === today;
      }
      return res.date === dateStr;
  };

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );



  // --- Filtering ---
  const dayReservations = reservations.filter(r => isForDate(r, selectedDate));
  
  const unassignedReservations = dayReservations.filter(r => !r.timeSlot && r.status === 'active');
  const emergencyReservations = dayReservations.filter(r => r.status === 'emergency' || r.status === 'waitlist'); 
  const archivedReservations = dayReservations.filter(r => r.status === 'cancelled' || r.status === 'no-show');
  const completedReservations = dayReservations.filter(r => r.status === 'completed');
  const scheduleReservations = dayReservations.filter(r => r.status === 'active' && r.timeSlot);

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const { maxPatientsPerSlot, workingDays, exceptions, publicHolidays } = useConfig();

  /* --- Logic: Max Capacity & Sorting --- */
  const MAX_PATIENTS_PER_SLOT = maxPatientsPerSlot || 5;

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const patientId = active.id;
    const activeRes = reservations.find(r => r.id === patientId);
    if (!activeRes) return; // Should not happen

    let targetZone = over.id;
    let targetSlot = null;

    // Detect Target: Is it a generic zone, a slot container, or a patient item?
    if (targetZone.startsWith('slot-')) {
        targetSlot = targetZone.replace('slot-', '');
    } else if (
        targetZone !== 'unassigned-zone' && 
        targetZone !== 'emergency-zone' && 
        targetZone !== 'archive-zone'
    ) {
        // Dropped on another patient item
        const overRes = reservations.find(r => r.id === targetZone);
        if (overRes) {
            if (overRes.timeSlot) {
                targetSlot = overRes.timeSlot; // Dropped on patient in a slot
            } else if (overRes.status === 'emergency') {
                targetZone = 'emergency-zone';
            } else if (!overRes.timeSlot && overRes.status === 'active') {
                targetZone = 'unassigned-zone';
            }
        }
    }

    // 1. Drop to Unassigned Zone
    if (targetZone === 'unassigned-zone') {
        updateStatus(patientId, 'active');
        updateReservation(patientId, { timeSlot: null });
        showToast('Moved to Unassigned', 'success');
        return;
    }

    // 2. Drop to Emergency Zone
    if (targetZone === 'emergency-zone') {
        updateStatus(patientId, 'emergency'); 
        updateReservation(patientId, { timeSlot: null });
        showToast('Moved to Emergency List', 'warning');
        return;
    }

    // 3. Drop to Archive Zone
    if (targetZone === 'archive-zone') {
        setCancelModal({ id: patientId });
        return;
    }

    // 4. Drop to Time Slot (or Patient in Slot)
    if (targetSlot) {
        // A. Check Capacity (Only if moving TO a new slot)
        if (activeRes.timeSlot !== targetSlot) {
             const currentInSlot = reservations.filter(r => isForDate(r, selectedDate) && r.timeSlot === targetSlot && r.status === 'active').length;
             if (currentInSlot >= MAX_PATIENTS_PER_SLOT) {
                 showToast(`Slot ${targetSlot} is full (Max ${MAX_PATIENTS_PER_SLOT})`, 'error');
                 return;
             }
             // Do the move
             updateStatus(patientId, 'active');
             updateReservation(patientId, { timeSlot: targetSlot });
             showToast(`Moved to ${targetSlot}`, 'success');
        } else {
            // B. Reorder within same slot
            // Only reorder if we dropped ON another item (over.id !== slot container)
            if (active.id !== over.id && !over.id.startsWith('slot-')) {
                reorderInSlot(targetSlot, active.id, over.id);
            }
        }
    }
  };

  const handleDelete = (id) => {
      if (window.confirm('Permanently delete this patient record?')) {
          removeReservation(id);
          showToast('Patient deleted', 'success');
      }
  };

  const handleEdit = (reservation) => {
      setEditingPatient(reservation);
  };

  const handleQuickAdd = (slot) => {
      setQuickAddSlot(slot);
  };

  const handleComplete = (id) => {
      updateStatus(id, 'completed');
      showToast('Marked as Completed', 'success');
  };

  const handleConfirmCancel = (statusArg) => {
      if (cancelModal && cancelModal.id) {
          const finalStatus = (statusArg === 'No Show' || statusArg === 'no-show') ? 'no-show' : 'cancelled';
          updateStatus(cancelModal.id, finalStatus, statusArg); 
          
          // Clear time slot if present
          const res = reservations.find(r => r.id === cancelModal.id);
          if (res && res.timeSlot) {
               updateReservation(cancelModal.id, { timeSlot: null });
          }
          showToast(`Marked as ${statusArg}`, 'info');
      }
      setCancelModal(null);
  };

  const handleUpdatePatient = (data) => {
      if (editingPatient) {
          updateReservation(editingPatient.id, data);
          showToast('Patient updated', 'success');
          setEditingPatient(null);
      }
  };

  const handleAddPatient = (data) => {
    const targetDate = data.date || selectedDate;
    
    // 1. Check Capacity for Quick Add (Time Slot)
    if (data.timeSlot) {
        const currentInSlot = reservations.filter(r => isForDate(r, targetDate) && r.timeSlot === data.timeSlot && r.status === 'active').length;
        if (currentInSlot >= MAX_PATIENTS_PER_SLOT) {
             showToast(`Slot ${data.timeSlot} is full (Max ${MAX_PATIENTS_PER_SLOT})! Cannot add.`, 'error');
             setQuickAddSlot(null);
             return; 
        }
    }

    addReservation(data, targetDate);
    if (targetDate !== selectedDate) {
        showToast(`Booked for ${targetDate}`, 'success');
    } else {
        showToast('Patient added', 'success');
    }
    setQuickAddSlot(null);
  };



  // Live Clock State
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-main)' }}>Dashboard</h2>
             
             <div style={{ display: 'flex', items: 'center', gap: '1.5rem' }}>
                {/* Time & Day - Today Layout */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    
                    {/* Today Badge First */}
                    {(() => {
                            const now = new Date();
                            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                            if (selectedDate === todayStr) {
                                return <span style={{ fontSize: '0.85rem', backgroundColor: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '6px', fontWeight: 'bold' }}>Today</span>;
                            }
                            return null;
                    })()}

                    {/* Day Name */}
                    <div style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: '600' }}>
                        {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}
                    </div>

                    {/* Separator and Time */}
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                        - {currentTime}
                    </div>
                </div>

                <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border)' }}></div>

                {/* Date Picker Card */}
                <div className="card" style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)' }}>
                   <Clock size={16} style={{ color: 'var(--secondary)' }}/>
                   <input 
                     type="date" 
                     value={selectedDate} 
                     onChange={(e) => setSelectedDate(e.target.value)}
                     style={{ border: 'none', background: 'transparent', fontWeight: '600', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}
                   />
                </div>

                {/* Patient Count - Click to Navigate */}
                <div 
                    className="card" 
                    onClick={() => onNavigate && onNavigate('settings', 'database')}
                    title="View All Patients Database"
                    style={{ padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: 'var(--bg-surface)' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                   <Users size={16} style={{ color: 'var(--primary)' }}/>
                   <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{dayReservations.length} Patients</span>
                </div>
             </div>
          </div>

          {/* Holiday / Status Indicator */}
          {(() => {
              const dayName = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' });
              const isWorkingDay = workingDays.includes(dayName);
              const exception = exceptions[selectedDate];
              
              const apiHoliday = publicHolidays?.find(h => h.date === selectedDate);
              
              let statusText = null;
              let statusStyle = null;

              if (exception === 'closed') {
                  statusText = '🏖️ Official Holiday / Closed';
                  statusStyle = { color: 'var(--danger)', fontWeight: 'bold' };
              } else if (exception === 'open') {
                  statusText = '✅ Special Working Day';
                  statusStyle = { color: 'var(--success)', fontWeight: 'bold' };
              } else if (apiHoliday) {
                  statusText = `🎉 ${apiHoliday.localName || apiHoliday.name}`;
                  statusStyle = { color: 'var(--secondary)', fontWeight: 'bold' };
              } else if (!isWorkingDay) {
                  statusText = '🏖️ Weekend / Off Day';
                  statusStyle = { color: 'var(--text-muted)' };
              }

              return statusText && (
                  <div style={{ textAlign: 'center', marginTop: '-1rem', marginBottom: '2rem', padding: '0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)', ...statusStyle }}>
                      {statusText}
                  </div>
              );
          })()}

         <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            {/* Left Col */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <PatientForm onSubmit={handleAddPatient} />
              
               {/* Unassigned */}
               <div className="card">
                  <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    Unassigned ({selectedDate})
                  </h3>
                  <DroppableZone id="unassigned-zone" style={{ minHeight: '100px', borderRadius: 'var(--radius)' }}>
                     <SortableContext items={unassignedReservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
                         {unassignedReservations.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>Drop here to unassign</p>
                         ) : (
                            unassignedReservations.map(res => (
                              <DraggablePatient key={res.id} reservation={res} onDelete={handleDelete} onEdit={handleEdit} />
                            ))
                         )}
                     </SortableContext>
                  </DroppableZone>
               </div>

               {/* Emergency / Quick List Zone */}
               <div className="card" style={{ borderColor: 'var(--danger)' }}>
                  <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <AlertCircle size={16} /> Emergency / Quick List ({emergencyReservations.length})
                  </h3>
                  <DroppableZone id="emergency-zone" style={{ 
                      minHeight: '60px', 
                      borderRadius: 'var(--radius)', 
                      border: emergencyReservations.length > 0 ? '2px solid transparent' : '2px dashed var(--danger)', 
                      backgroundColor: 'var(--bg-surface)' 
                  }}>
                     <SortableContext items={emergencyReservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
                         {emergencyReservations.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '0.5rem', textAlign: 'center' }}>Drag Emergency Cases Here</p>
                         ) : (
                            emergencyReservations.map(res => (
                              <DraggablePatient key={res.id} reservation={res} onDelete={handleDelete} onEdit={handleEdit} onComplete={handleComplete} />
                            ))
                         )}
                     </SortableContext>
                  </DroppableZone>
               </div>

               {/* Completed */}
               <div className="card" style={{ borderColor: 'var(--success)' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--success)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} /> Completed ({completedReservations.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                       {completedReservations.map(res => (
                           <div key={res.id} style={{ opacity: 0.7 }}>
                               <DraggablePatient reservation={res} />
                           </div>
                       ))}
                  </div>
               </div>

               {/* Archive */}
               <div className="card" style={{ borderColor: 'var(--border)' }}>
                  <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <AlertCircle size={18} /> Archive / History ({archivedReservations.length})
                  </h3>
                  <DroppableZone id="archive-zone" style={{ minHeight: '80px', border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '0.5rem', backgroundColor: 'var(--bg-body)' }}>
                      <SortableContext items={archivedReservations.map(r => r.id)} strategy={verticalListSortingStrategy}>
                          {archivedReservations.map(res => (
                              <DraggablePatient key={res.id} reservation={res} onDelete={handleDelete} onEdit={handleEdit} showReason={true} />
                          ))}
                      </SortableContext>
                  </DroppableZone>
               </div>
             </div>

            {/* Right Col: Schedule */}
            <div>
              <ScheduleBoard 
                reservations={scheduleReservations} 
                onDelete={handleDelete}
                onEdit={handleEdit}
                onQuickAdd={handleQuickAdd}
                onComplete={handleComplete}
              />
            </div>
         </div>
      </div>

      {/* Modals */}
      {(editingPatient || quickAddSlot) && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ width: '100%', maxWidth: '500px' }}>
                  <PatientForm 
                    initialData={editingPatient || (quickAddSlot ? { timeSlot: quickAddSlot } : null)}  
                    onSubmit={editingPatient ? handleUpdatePatient : handleAddPatient} 
                    onCancel={() => { setEditingPatient(null); setQuickAddSlot(null); }} 
                  />
              </div>
          </div>
      )}
      {cancelModal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
              <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                  <h3>Reason for Cancellation?</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                      <button className="btn" onClick={() => handleConfirmCancel('Cancelled')}>Cancelled</button>
                      <button className="btn" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => handleConfirmCancel('No Show')}>No Show</button>
                      <button className="btn" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }} onClick={() => setCancelModal(null)}>Back</button>
                  </div>
              </div>
          </div>
      )}
       <DragOverlay>
          {activeId ? <PatientCard reservation={reservations.find(r => r.id === activeId)} isOverlay /> : null}
       </DragOverlay>
    </DndContext>
  );
};

export default Dashboard;
