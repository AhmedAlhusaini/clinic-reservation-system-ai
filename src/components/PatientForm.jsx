import React, { useState } from 'react';
import { MapPin, User, Phone, Baby } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

const PatientForm = ({ onSubmit, initialData, onCancel }) => {
  const { customFields } = useConfig();
  
  // Determine if we are editing an existing patient or adding a new one
  // If initialData has an ID, it's an EDIT. If it just has timeSlot (or null), it's ADD.
  const isEditMode = initialData && initialData.id;

  const [formData, setFormData] = useState({
    childName: '',
    parentName: '',
    phone: '',
    notes: '',
    extras: {},
    age: '',
    gender: '',
    ...initialData // Merge initial data (e.g., timeSlot or full patient)
  });

  // We handle initial data merging in useState init. No effect needed unless props change post-mount.
  // Simple version: just rely on key prop change from parent to reset form, or useEffect if needed.
  // For now, let's keep it simple as parent likely remounts or changes key on edit.
  React.useEffect(() => {
     if (initialData) {
         setFormData(prev => ({ ...prev, ...initialData, extras: initialData.extras || prev.extras || {} }));
     }
  }, [initialData]);

  const handleChange = (e) => {
    // ...
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
  const nameInputRef = React.useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.childName || !formData.phone) return; 
    
    onSubmit(formData);
    
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
            ...initialData // Keep timeSlot if provided
        });
        // Focus back on name input for rapid entry
        if(nameInputRef.current) nameInputRef.current.focus();
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem', fontWeight: '600' }}>
          {isEditMode ? 'Edit Patient' : 'Add Patient'}
      </h3>
      <form onSubmit={handleSubmit}>
        {/* ... */}
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                <Baby size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> 
                Child Name
             </label>
             <input
                ref={nameInputRef}
                name="childName"
                value={formData.childName}
                onChange={handleChange}
                placeholder="Child's Full Name"
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                required
             />
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                <User size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> 
                Parent Name
             </label>
             <input
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Parent's Name"
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
             />
          </div>

          <div>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                <Phone size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> 
                Phone Number
             </label>
             <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01xxxxxxxxx"
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                required
             />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
             <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                <MapPin size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> 
                Address / Location
             </label>
             <input
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Area, Street..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
             />
          </div>

          {/* Custom Fields */}
          {customFields.map(field => (
             <div key={field.id} style={{ gridColumn: '1 / -1' }}>
                 <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>
                    {field.label}
                 </label>
                 <input
                    name={`custom_${field.id}`}
                    value={formData.extras[field.id] || ''}
                    onChange={handleChange}
                    placeholder={`Enter ${field.label}`}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                 />
             </div>
          ))}

        </div>

        <div style={{ marginTop: '1.5rem', textAlign: 'right', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          {onCancel && (
              <button type="button" onClick={onCancel} className="btn">Cancel</button>
          )}
          <button type="submit" className="btn btn-primary">
            {isEditMode ? 'Update Patient' : 'Add Patient'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;
