import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../context/ReservationContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, Trash2, Plus, Save, AlertTriangle, Settings, Users, Key, Clock, Edit, MapPin, Database, XCircle, Globe } from 'lucide-react';

const AdminSettings = ({ initialSection }) => {
    // Auto-scroll effect
    React.useEffect(() => {
        if (initialSection) {
            let attempts = 0;
            const interval = setInterval(() => {
                const el = document.getElementById(initialSection);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight effect
                    el.style.transition = 'box-shadow 0.3s';
                    el.style.boxShadow = '0 0 0 4px var(--primary-light)';
                    setTimeout(() => el.style.boxShadow = 'none', 1000);
                    clearInterval(interval);
                }
                attempts++;
                if (attempts > 20) clearInterval(interval); // Stop after 2 seconds
            }, 100);
            return () => clearInterval(interval);
        }
    }, [initialSection]);

  const { 
      customFields, addField, removeField, 
      clinicName, updateClinicName, 
      logo, updateLogo, 
      subTitle, updateSubTitle,
      workingDays, startHour, endHour, updateSchedule, maxPatientsPerSlot,
      exceptions, updateException,
      defaultLabels, updateDefaultLabel
  } = useConfig();
  
  const { user, users, addUser, removeUser, updateUser } = useAuth();
  const { reservations } = useReservations(); // Access all data
  const { showToast } = useToast();
  const { t, language, changeLanguage } = useLanguage();
  
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [nameInput, setNameInput] = useState(clinicName);
  const [subTitleInput, setSubTitleInput] = useState(subTitle);
  const [searchTerm, setSearchTerm] = useState(''); // New Search State
  
  // Schedule Local State
  const [days, setDays] = useState(workingDays || []);
  const [sHour, setSHour] = useState(startHour || '15:00');
  const [eHour, setEHour] = useState(endHour || '22:00');
  const [maxP, setMaxP] = useState(maxPatientsPerSlot || 5);

  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'assistant', expiration: '' });

  const allDays = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const getDayLabel = (d) => {
      const map = {
          'sat': 'saturday', 'sun': 'sunday', 'mon': 'monday', 'tue': 'tuesday', 
          'wed': 'wednesday', 'thu': 'thursday', 'fri': 'friday'
      };
      return t(map[d.toLowerCase()] || d.toLowerCase());
  };

  const handleSaveSchedule = () => {
      updateSchedule(days, sHour, eHour, maxP);
      showToast(t('scheduleSaved'), 'success');
  };

  const toggleDay = (day) => {
      if (days.includes(day)) {
          setDays(days.filter(d => d !== day));
      } else {
          setDays([...days, day]);
      }
  };

  const handleAddUser = () => {
    if (newUser.username && newUser.password) {
        if (users.some(u => u.username === newUser.username)) {
            showToast('Username already exists', 'error');
            return;
        }
        addUser(newUser);
        setNewUser({ username: '', password: '', role: 'assistant', expiration: '' });
        showToast(t('userAdded'), 'success');
    } else {
         showToast('Username and Password required', 'error');
    }
  };

  const handleAddField = () => {
    if (newFieldLabel.trim()) {
        addField(newFieldLabel);
        setNewFieldLabel('');
        showToast(t('fieldAdded'), 'success');
    }
  };

  const handleUpdateName = () => {
      updateClinicName(nameInput);
      updateSubTitle(subTitleInput);
      showToast(t('clinicUpdated'), 'success');
  };

  const handleUpdatePassword = () => {
    if (!newPassword) return;
    if (user && user.id) {
        updateUser(user.id, { password: newPassword });
        showToast(t('passwordUpdated'), 'success');
        setNewPassword('');
    }
  };

  const handleWipeData = () => {
     if (deleteConfirmation.toLowerCase() === 'delete') {
         localStorage.removeItem('clinic_reservations');
         localStorage.removeItem('clinic_date');
         window.location.reload();
     } else {
         showToast('Type "delete" correctly to confirm', 'error');
     }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem' }}>{t('settings')}</h2>

        {/* Language Switcher */}
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={20} /> {t('language')}
            </h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                    onClick={() => changeLanguage('en')}
                    className="btn"
                    style={{ 
                        backgroundColor: language === 'en' ? 'var(--primary)' : 'var(--bg-body)',
                        color: language === 'en' ? 'white' : 'var(--text-main)',
                        borderColor: language === 'en' ? 'var(--primary)' : 'var(--border)'
                    }}
                >
                    {t('english')}
                </button>
                <button 
                    onClick={() => changeLanguage('ar')}
                    className="btn"
                    style={{ 
                        backgroundColor: language === 'ar' ? 'var(--primary)' : 'var(--bg-body)',
                        color: language === 'ar' ? 'white' : 'var(--text-main)',
                        borderColor: language === 'ar' ? 'var(--primary)' : 'var(--border)'
                    }}
                >
                    {t('arabic')}
                </button>
            </div>
        </div>

        {/* 0. Branding - OWNER ONLY */}
        {user.role === 'owner' && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Settings size={20} /> {t('brandingOwner')}
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>{t('clinicName')}</label>
                        <input 
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>{t('subTitle')}</label>
                        <input 
                            value={subTitleInput}
                            onChange={(e) => setSubTitleInput(e.target.value)}
                            placeholder={t('taglinePlaceholder')}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <button onClick={handleUpdateName} className="btn btn-primary" style={{ alignSelf: 'start', marginTop: '1rem' }}>{t('saveBranding')}</button>
                </div>
                
                <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>{t('logo')}</label>
                     <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
                         {logo ? (
                             <img src={logo} alt={t('currentLogo')} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                         ) : (
                             <span style={{ color: 'var(--text-muted)' }}>{t('noLogo')}</span>
                         )}
                     </div>
                     <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                if (file.size > 500000) { // 500kb limit
                                    showToast('Image too large (Max 500kb)', 'error');
                                    return;
                                }
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    updateLogo(reader.result);
                                    showToast('Logo updated!', 'success');
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                        style={{ width: '100%' }}
                     />
                </div>
            </div>
        </div>
        )}

        {/* 0.5 Schedule Settings - OWNER & ADMIN */}
        {(user.role === 'owner' || user.role === 'admin') && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--secondary)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--secondary)' }}>
                <Clock size={20} /> {t('scheduleConfig')}
            </h3>
            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>{t('workingDays')}</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {allDays.map(day => (
                        <button 
                            key={day} 
                            onClick={() => toggleDay(day)}
                            className="btn"
                            style={{ 
                                backgroundColor: days.includes(day) ? 'var(--secondary)' : 'var(--bg-body)',
                                color: days.includes(day) ? 'white' : 'var(--text-main)',
                                borderColor: days.includes(day) ? 'var(--secondary)' : 'var(--border)'
                            }}
                        >
                            {getDayLabel(day)}
                        </button>
                    ))}
                </div>
            </div>
            
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '1rem' }}>
                <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>{t('startHour')}</label>
                     <input 
                        type="time" 
                        value={sHour}
                        onChange={(e) => setSHour(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                     />
                </div>
                <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>{t('endHour')}</label>
                     <input 
                        type="time" 
                        value={eHour}
                        onChange={(e) => setEHour(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                     />
                </div>
                <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>{t('maxPatients')}</label>
                     <input  
                        type="number" 
                        min="1"
                        max="20"
                        value={maxP}
                        onChange={(e) => setMaxP(e.target.value)}
                        style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: '80px' }}
                     />
                </div>
            </div>
            
            <div style={{ padding: '1rem', border: '1px dashed var(--secondary)', borderRadius: 'var(--radius)', marginBottom: '1rem', backgroundColor: 'var(--bg-surface)' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: 'var(--secondary)' }}>{t('exceptions')}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{t('manualExceptionTip')}</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                        type="date"
                        id="exception-date"
                        style={{ padding: '0.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    />
                    <button onClick={() => {
                        const d = document.getElementById('exception-date').value;
                        if(d) updateException(d, 'open');
                    }} className="btn btn-sm" style={{ fontSize: '0.8rem', backgroundColor: 'var(--success)', color: 'white', border: 'none' }}>{t('forceOpen')}</button>
                    
                    <button onClick={() => {
                        const d = document.getElementById('exception-date').value;
                        if(d) updateException(d, 'closed');
                    }} className="btn btn-sm" style={{ fontSize: '0.8rem', backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}>{t('forceClose')}</button>
                </div>
                
                {/* List current exceptions */}
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {Object.entries(exceptions || {}).map(([date, status]) => (
                        <div key={date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.25rem', background: 'var(--bg-body)', borderRadius: '4px' }}>
                            <span>{date}: <strong>{status.toUpperCase()}</strong></span>
                            <button onClick={() => updateException(date, null)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>x</button>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={() => {
                    const confirmed = window.confirm(
                        "⚠️ ATTENTION: Changing schedule settings (especially Start/End hours) may misalign or clear existing slot records for today.\n\nAre you sure you want to proceed?"
                    );
                    if (confirmed) {
                        handleSaveSchedule();
                    }
                }} 
                className="btn" 
                style={{ backgroundColor: 'var(--secondary)', color: 'white', border: 'none', width: '100%' }}
            >
                {t('saveSchedule')}
            </button>
        </div>
        )}

        {/* 1. User Management - OWNER & ADMIN */}
        {(user.role === 'owner' || user.role === 'admin') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> {t('userManagement')}
             </h3>
             
             {/* Add User Form - OWNER ONLY */}
             {user.role === 'owner' && (
             <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr) minmax(120px, 1fr) minmax(140px, 1fr) auto', gap: '0.75rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                 <input 
                    placeholder={t('usernamePlaceholder')}
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    className="form-control"
                    style={{ padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'white' }}
                 />
                 <input 
                    placeholder={t('password')}
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="form-control"
                    style={{ padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'white' }}
                 />
                 <select
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className="form-select"
                    style={{ padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'white' }}
                 >
                     <option value="admin">{t('roleAdmin')}</option>
                     <option value="assistant">{t('roleAssistant')}</option>
                     <option value="owner">{t('roleOwner')}</option>
                 </select>
                 <input 
                    type="date"
                    title="Expiration Date"
                    value={newUser.expiration}
                    onChange={e => setNewUser({...newUser, expiration: e.target.value})}
                    className="form-control"
                    style={{ padding: '0.6rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)', backgroundColor: 'white' }}
                 />
                 <button onClick={handleAddUser} className="btn" title="Add User" style={{ width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', backgroundColor: '#0090e7', color: 'white', border: 'none' }}><Plus size={24}/></button>
             </div>
             )}

             {/* User List */}
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                 {users.map(u => (
                     <div key={u.id} style={{ 
                         display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                         padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)'
                     }}>
                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                             <span style={{ fontWeight: 'bold' }}>{u.username}</span>
                             <span style={{ fontSize: '0.8rem', padding: '0.1rem 0.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', border: '1px solid var(--border)' }}>{u.role}</span>
                             {u.expiration && (
                                 <span style={{ fontSize: '0.8rem', color: new Date(u.expiration) < new Date() ? 'var(--danger)' : 'var(--text-muted)' }}>
                                     Exp: {u.expiration} {new Date(u.expiration) < new Date() && '(Expired)'}
                                 </span>
                             )}
                         </div>
                         <div style={{ display: 'flex', gap: '0.5rem' }}>
                             {/* Edit User (Name & Password) */}
                             <button onClick={() => {
                                 const newName = prompt(`Enter new username for ${u.username}:`, u.username);
                                 if (newName !== null) {
                                     const newPass = prompt(`Enter new password for ${newName} (leave empty to keep current):`);
                                     const updates = {};
                                     if (newName && newName !== u.username) updates.username = newName;
                                     if (newPass) updates.password = newPass;

                                     if (Object.keys(updates).length > 0) {
                                         updateUser(u.id, updates);
                                         showToast(`User ${u.username} updated`, 'success');
                                     }
                                 }
                             }} className="btn" style={{ padding: '0.25rem', color: 'var(--primary)', borderColor: 'var(--border)' }} title="Edit User (Name/Password)">
                                 <Key size={16} />
                             </button>
                             
                             {/* Delete - OWNER & ADMIN can remove */}
                             <button onClick={() => {
                                 let msg = `Are you sure you want to delete user ${u.username}?`;
                                 if (user.role !== 'owner') {
                                     msg += `\n\nWARNING: You currently cannot add new users (Owner only). If you delete this user, you cannot recreate them.`;
                                 }
                                 if(window.confirm(msg)) removeUser(u.id);
                             }} className="btn" style={{ padding: '0.25rem', color: 'var(--danger)', borderColor: 'var(--border)' }} title="Remove User">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
        )}

        {/* 1.5 Standard Field Labels - OWNER & ADMIN */}
        {(user.role === 'owner' || user.role === 'admin') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit size={20} /> {t('standardLabels')}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('renameDefaultFields')}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                 {/* Child Name */}
                 <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>{t('childNameLabel')}</label>
                     <input 
                        value={defaultLabels.childName?.[language === 'ar' ? 'ar' : 'en'] || ''}
                        onChange={(e) => updateDefaultLabel('childName', e.target.value, language === 'ar' ? 'ar' : 'en')}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                     />
                 </div>

                 {/* Parent Name */}
                 <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>{t('parentNameLabel')}</label>
                     <input 
                        value={defaultLabels.parentName?.[language === 'ar' ? 'ar' : 'en'] || ''}
                        onChange={(e) => updateDefaultLabel('parentName', e.target.value, language === 'ar' ? 'ar' : 'en')}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                     />
                 </div>

                 {/* Phone */}
                 <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>{t('phoneLabel')}</label>
                     <input 
                        value={defaultLabels.phone?.[language === 'ar' ? 'ar' : 'en'] || ''}
                        onChange={(e) => updateDefaultLabel('phone', e.target.value, language === 'ar' ? 'ar' : 'en')}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                     />
                 </div>

                 {/* Notes */}
                 <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem' }}>{t('noteLabel')}</label>
                     <input 
                        value={defaultLabels.notes?.[language === 'ar' ? 'ar' : 'en'] || ''}
                        onChange={(e) => updateDefaultLabel('notes', e.target.value, language === 'ar' ? 'ar' : 'en')}
                        style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                     />
                 </div>
            </div>
        </div>
        )}

        {/* 2. Form Editor - OWNER & ADMIN */}
        {(user.role === 'owner' || user.role === 'admin') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} /> {t('formEditor')}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{t('addExtraQuestions')}</p>
            
            {/* Form Editor */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                    
                    {/* Label */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{t('label')}</label>
                        <input 
                            value={newFieldLabel}
                            onChange={(e) => setNewFieldLabel(e.target.value)}
                            placeholder={t('labelPlaceholder')}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{t('type')}</label>
                         <select
                            id="new-field-type"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                         >
                             <option value="text">{t('textType')}</option>
                             <option value="number">{t('numberType')}</option>
                             <option value="select">{t('dropdownType')}</option>
                         </select>
                    </div>

                    {/* Required */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{t('required')}</label>
                        <input type="checkbox" id="new-field-required" style={{ marginTop: '0.7rem', transform: 'scale(1.2)' }} />
                    </div>

                    <button onClick={() => {
                        const type = document.getElementById('new-field-type').value;
                        const isRequired = document.getElementById('new-field-required').checked;
                        // For select options, we could add a simple prompt/modal in future or complex UI. 
                        // For now, let's keep it simple: If select, maybe prompt? Or simple input below.
                        let options = [];
                        if (type === 'select') {
                            const optStr = prompt('Enter options separated by comma (e.g. Male, Female):');
                            if (optStr) options = optStr.split(',').map(s => s.trim());
                        }

                        if (newFieldLabel.trim()) {
                            addField(newFieldLabel, type, options, isRequired);
                            setNewFieldLabel('');
                            showToast('Field added', 'success');
                            // Reset defaults
                            document.getElementById('new-field-required').checked = false;
                            document.getElementById('new-field-type').value = 'text';
                        }
                    }} className="btn btn-primary" style={{ marginBottom: '2px' }}>{t('add')}</button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {customFields.map(field => (
                    <div key={field.id} style={{ 
                        padding: '0.75rem', 
                        backgroundColor: 'var(--bg-body)', 
                        borderRadius: 'var(--radius)',
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <span style={{ fontWeight: '600' }}>{field.label}</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '4px' }}>
                                {field.type.toUpperCase()}
                            </span>
                            {field.required && <span style={{ fontSize: '0.7rem', color: 'var(--danger)', fontWeight: 'bold' }}>*Required</span>}
                            {field.options && field.options.length > 0 && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>[{field.options.join(', ')}]</span>
                            )}
                        </div>
                        <button onClick={() => removeField(field.id)} style={{ color: 'var(--danger)', background: 'none' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
        )}

        {/* 2.5 All Patients Database - OWNER & ADMIN */}
        {(user.role === 'owner' || user.role === 'admin') && (
        <div id="database" className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={20} /> {t('database')}
            </h3>
            
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                 <div style={{ position: 'relative', flex: 1 }}>
                    <input 
                        type="text"
                        placeholder={t('searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', paddingInlineEnd: '2rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        dir="auto"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            style={{ position: 'absolute', insetInlineEnd: '0.5rem', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <XCircle size={16} />
                        </button>
                    )}
                 </div>
            </div>
            
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-surface)', borderBottom: '2px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t('date')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t('patientName')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t('phone')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t('status')}</th>
                            <th style={{ padding: '0.75rem', textAlign: 'start' }}>{t('location')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations
                            .filter(r => {
                                if (!searchTerm) return true;
                                const lower = searchTerm.toLowerCase().trim();
                                const name = (r.childName || '').toLowerCase();
                                const parent = (r.parentName || '').toLowerCase();
                                const phone = (r.phone || '').toLowerCase();
                                const date = (r.date || '').toLowerCase();
                                return name.includes(lower) || parent.includes(lower) || phone.includes(lower) || date.includes(lower);
                            })
                            .sort((a,b) => new Date(b.date || '9999-12-31') - new Date(a.date || '9999-12-31')) // Newest first
                            .map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: '400', color: 'var(--text-main)' }}>{r.date || 'N/A'}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: '500', color: 'var(--text-main)' }}>{r.childName}</td>
                                    <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{r.phone}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ 
                                            padding: '0.25rem 0.75rem', 
                                            borderRadius: '4px',
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            backgroundColor: r.status === 'completed' ? '#00b865' : // Green
                                                             r.status === 'active' || r.status === 'emergency' ? '#0090e7' : // Blue
                                                             'white', // Changed for Cancelled
                                            color: r.status === 'completed' ? 'white' : 
                                                   r.status === 'active' || r.status === 'emergency' ? 'white' : 
                                                   '#ff4d4f', // Red text for cancelled
                                            border: (r.status === 'cancelled' || r.status === 'no-show') ? '1px solid #ff4d4f' : 'none',
                                            display: 'inline-block',
                                            minWidth: '80px',
                                            textAlign: 'center'
                                        }}>
                                            {r.status?.toUpperCase() || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        {r.mapsUrl ? (
                                            <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#00b865', textDecoration: 'none', fontWeight: '600', fontSize: '0.85rem' }}>
                                                <MapPin size={14} /> {t('openMap')}
                                            </a>
                                        ) : (
                                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        }
                        {reservations.length === 0 && <tr><td colSpan="5" style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>{t('noRecords')}</td></tr>}
                    </tbody>
                </table>
            </div>
            
            {/* Database Summary */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                 <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{t('total')}: {reservations.length}</div>
                 <div style={{ width: '1px', background: 'var(--border)' }}></div>
                 <div style={{ color: '#00b865', fontWeight: '500' }}>{t('completed')}: {reservations.filter(r => r.status === 'completed').length}</div>
                 <div style={{ color: '#0090e7', fontWeight: '500' }}>{t('active')}: {reservations.filter(r => r.status === 'active' || r.status === 'emergency').length}</div>
                 <div style={{ color: '#ff4d4f', fontWeight: '500' }}>{t('cancelled')}: {reservations.filter(r => r.status === 'cancelled' || r.status === 'no-show').length}</div>
            </div>
        </div>
        )}

        {/* 2. Password Reset */}
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={20} /> {t('updatePassword')}
            </h3>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                    autoComplete="new-password"
                />
                <button onClick={handleUpdatePassword} className="btn">{t('update')}</button>
            </div>
        </div>

        {/* 3. Danger Zone */}
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                <AlertTriangle size={20} /> {t('dangerZone')}
            </h3>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder={t('wipeConfirm')}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                />
                <button 
                    onClick={handleWipeData} 
                    className="btn" 
                    style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}
                    disabled={deleteConfirmation.toLowerCase() !== t('deleteKeyword').toLowerCase()}
                >
                    {t('wipeData')}
                </button>
            </div>
        </div>
    </div>
  );
};

export default AdminSettings;
