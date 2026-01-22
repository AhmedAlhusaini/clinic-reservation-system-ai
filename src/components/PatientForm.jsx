import React, { useState, useRef } from 'react';
import { MapPin, User, Phone, Baby, Sparkles, Calendar, Clock, Loader, AlertCircle, FileText } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useReservations } from '../context/ReservationContext';
import { findNextAvailableSlot } from '../utils/scheduler';
import { useLanguage } from '../context/LanguageContext';

const PatientForm = ({ onSubmit, initialData, onCancel }) => {
  const { customFields, workingDays, startHour, endHour, defaultLabels } = useConfig();
  const { reservations } = useReservations();
  const { t, language } = useLanguage();
  
  // Determine if we are editing an existing patient or adding a new one
  const isEditMode = initialData && initialData.id;

  // Helper to translate default labels
  const getLabel = (key) => {
     const val = defaultLabels?.[key];
     if (val && typeof val === 'object') {
         return val[language] || val['en'] || '';
     }
     return val || '';
  };

  const [formData, setFormData] = useState({
    childName: '',
    parentName: '',
    phone: '',
    notes: '',
    extras: {},
    age: '',
    gender: '',
    address: '',
    ...initialData // Merge initial data
  });

  const [suggestedSlot, setSuggestedSlot] = useState(null); // { date, slot }
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  React.useEffect(() => {
     if (initialData) {
         setFormData(prev => ({ ...prev, ...initialData, extras: initialData.extras || prev.extras || {} }));
     }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('custom_')) {
        const fieldId = name.replace('custom_', '');
        setFormData(prev => ({
            ...prev,
            extras: { ...prev.extras, [fieldId]: value }
        }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Ref for auto-focus
  const nameInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.childName || !formData.phone) return;
    
    // Basic Phone Validation
    const phoneRegex = /^[0-9+\-\s()]*$/;
    if (!phoneRegex.test(formData.phone) || formData.phone.length < 5) {
        alert("Please enter a valid phone number (digits only)."); 
        return;
    }
    
    // Merge suggestion if present
    const finalData = {
        ...formData,
        date: suggestedSlot?.date || formData.date || null,
        timeSlot: suggestedSlot?.slot || formData.timeSlot || null,
        mapsUrl: formData.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address)}` : null
    };

    onSubmit(finalData);
    
    // Reset form if NOT in edit mode (Add Mode)
    if (!isEditMode) {
        setFormData({
            childName: '',
            parentName: '',
            phone: '',
            notes: '',
            extras: {},
            age: '',
            gender: '',
            address: '',
            ...initialData 
        });
        setSuggestedSlot(null);
        if(nameInputRef.current) nameInputRef.current.focus();
    }
  };

  const handleFindSlot = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
          // Artificial delay for UX feeling (optional, but nice)
          // await new Promise(r => setTimeout(r, 500));
          
          const result = await findNextAvailableSlot(reservations, workingDays, startHour, endHour);
          if (result) {
              setSuggestedSlot(result);
          } else {
              setSearchError('No slots available in the next 30 days.');
          }
      } catch (err) {
          console.error(err);
          setSearchError('Error calculating schedule.');
      } finally {
          setIsSearching(false);
      }
  };

  const clearSuggestion = () => {
      setSuggestedSlot(null);
      setSearchError(null);
  };

  const [showNotes, setShowNotes] = useState(!!(initialData?.notes));

  const toggleNotes = () => {
      setShowNotes(prev => !prev);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
          {isEditMode ? t('editPatient') : t('addPatient')}
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                <Baby size={16} style={{ display: 'inline', marginInlineEnd: '0.25rem' }}/> 
                {getLabel('childName', 'Child Name')}
             </label>
             <input
                ref={nameInputRef}
                name="childName"
                value={formData.childName}
                onChange={handleChange}
                placeholder={getLabel('childName', 'Child Name')}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                required
             />
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                <User size={16} style={{ display: 'inline', marginInlineEnd: '0.25rem' }}/> 
                {getLabel('parentName', 'Parent Name')}
             </label>
             <input
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder={getLabel('parentName', 'Parent Name')}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
             />
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                <Phone size={16} style={{ display: 'inline', marginInlineEnd: '0.25rem' }}/> 
                {getLabel('phone', 'Phone Number')}
             </label>
             <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={getLabel('phone', 'Phone Number')}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                required
             />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    <MapPin size={16} style={{ display: 'inline', marginInlineEnd: '0.25rem' }}/> 
                    {t('address')}
                </label>
                {formData.address && (
                    <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(formData.address)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: '0.75rem', color: 'var(--primary)', textDecoration: 'none' }}
                    >
                        {t('openMap')} ↗
                    </a>
                )}
             </div>
             <input
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder={t('addressPlaceholder')}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
             />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
             <div style={{ marginBottom: '1rem' }}>
             <button type="button" onClick={toggleNotes} className="btn-text" style={{ padding: 0, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                 <FileText size={16} /> 
                 {showNotes ? t('hideNotes') : `${t('add')} ${getLabel('notes', 'Notes / Diagnosis')}`}
             </button>
             {showNotes && (
                 <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={getLabel('notes', 'Notes / Diagnosis')}
                    rows={3}
                    className="form-control"
                    style={{ marginTop: '0.5rem', width: '100%', resize: 'none' }}
                 />
             )}
           </div>
          </div>

          {/* Custom Fields */}
          {/* Custom Fields */}
          {customFields.map(field => (
             <div key={field.id} style={{ gridColumn: '1 / -1' }}>
                 <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--danger)' }}>*</span>}
                 </label>
                 
                 {field.type === 'select' ? (
                     <select
                        name={`custom_${field.id}`}
                        value={formData.extras[field.id] || ''}
                        onChange={handleChange}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        required={field.required}
                     >
                         <option value="">{t('selectOption')} {field.label}...</option>
                         {field.options && field.options.map((opt, idx) => (
                             <option key={idx} value={opt}>{opt}</option>
                         ))}
                     </select>
                 ) : (
                     <input
                        type={field.type === 'number' ? 'number' : 'text'}
                        name={`custom_${field.id}`}
                        value={formData.extras[field.id] || ''}
                        onChange={handleChange}
                        placeholder={`Enter ${field.label}`}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        required={field.required}
                     />
                 )}
             </div>
          ))}

        </div>

        {/* Smart Scheduling Section REMOVED per user request v2.2 */}
        {/*
        {!isEditMode && !initialData?.timeSlot && (
            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface)', border: '1px dashed var(--secondary)', borderRadius: 'var(--radius)' }}>
                 ...
            </div>
        )}
        */
        }

        <div style={{ marginTop: '1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {onCancel && (
              <button type="button" onClick={onCancel} className="btn">{t('cancel')}</button>
          )}
          <button type="submit" className="btn btn-primary">
            {isEditMode ? t('updatePatient') : ((suggestedSlot || formData.timeSlot) ? `${t('book')} ${suggestedSlot?.slot || formData.timeSlot}` : t('addToUnassigned'))}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
