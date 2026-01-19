import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Trash2, Plus, Save, AlertTriangle, Settings, Users, KeyRound, Key } from 'lucide-react';

const AdminSettings = () => {
  const { customFields, addField, removeField, clinicName, updateClinicName, logo, updateLogo, subTitle, updateSubTitle } = useConfig();
  const { user, users, addUser, removeUser, updateUser } = useAuth();
  const { showToast } = useToast();
  
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [nameInput, setNameInput] = useState(clinicName);
  const [subTitleInput, setSubTitleInput] = useState(subTitle);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'assistant', expiration: '' });

  const handleAddUser = () => {
    // ... (existing)
    if (newUser.username && newUser.password) {
        if (users.some(u => u.username === newUser.username)) {
            showToast('Username already exists', 'error');
            return;
        }
        addUser(newUser);
        setNewUser({ username: '', password: '', role: 'assistant', expiration: '' });
        showToast('User added', 'success');
    } else {
         showToast('Username and Password required', 'error');
    }
  };

  const handleAddField = () => {
    // ...
    if (newFieldLabel.trim()) {
        addField(newFieldLabel);
        setNewFieldLabel('');
        showToast('Field added', 'success');
    }
  };

  const handleUpdateName = () => {
      updateClinicName(nameInput);
      updateSubTitle(subTitleInput);
      showToast('Clinic details updated', 'success');
  };

  const handleUpdatePassword = () => {
    if (!newPassword) return;
    if (user && user.id) {
        updateUser(user.id, { password: newPassword });
        showToast('Password updated', 'success');
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

  // ... (rest)

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem' }}>Settings</h2>

        {/* 0. Branding - OWNER ONLY */}
        {user.role === 'owner' && (
        <div className="card" style={{ marginBottom: '2rem', border: '1px solid var(--primary)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)' }}>
                <Settings size={20} /> General (Owner Only)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Clinic Name:</label>
                        <input 
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Sub Title (Tagline):</label>
                        <input 
                            value={subTitleInput}
                            onChange={(e) => setSubTitleInput(e.target.value)}
                            placeholder="e.g. Dr. Ahmed Elhossainy"
                            style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                        />
                    </div>
                    <button onClick={handleUpdateName} className="btn btn-primary" style={{ alignSelf: 'start', marginTop: '1rem' }}>Save Settings</button>
                </div>
                
                <div>
                     <label style={{ fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>Logo:</label>
                     <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)', textAlign: 'center', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-body)' }}>
                         {logo ? (
                             <img src={logo} alt="Current Logo" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                         ) : (
                             <span style={{ color: 'var(--text-muted)' }}>No logo uploaded</span>
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

        {/* 1. User Management - OWNER & ADMIN */}
        {/* Only Owner can ADD new users, but both can VIEW/EDIT */}
        {(user.role === 'owner' || user.role === 'admin') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
             <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} /> User Management
             </h3>
             
             {/* Add User Form - OWNER ONLY */}
             {user.role === 'owner' && (
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-body)', borderRadius: 'var(--radius)' }}>
                 <input 
                    placeholder="Username"
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                 />
                 <input 
                    placeholder="Password"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                 />
                 <select
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                 >
                     <option value="admin">Admin (Doctor)</option>
                     <option value="assistant">Assistant</option>
                     <option value="owner">Owner</option>
                 </select>
                 <input 
                    type="date"
                    title="Expiration Date"
                    value={newUser.expiration}
                    onChange={e => setNewUser({...newUser, expiration: e.target.value})}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                 />
                 <button onClick={handleAddUser} className="btn btn-primary" title="Add User"><Plus size={16}/></button>
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

        {/* 1. Form Editor - OWNER & ADMIN */}
        {(user.role === 'owner' || user.role === 'admin') && (
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={20} /> Form Editor
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Add extra questions to the patient registration form.</p>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <input 
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="E.g. Symptoms, Notes, Age..."
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                />
                <button onClick={handleAddField} className="btn btn-primary">Add Field</button>
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
                        <span>{field.label}</span>
                        <button onClick={() => removeField(field.id)} style={{ color: 'var(--danger)', background: 'none' }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
        )}

        {/* 2. Password Reset */}
        <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={20} /> Update Password
            </h3>
             <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={`New password for ${user.username || user.role}`}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                />
                <button onClick={handleUpdatePassword} className="btn">Update</button>
            </div>
        </div>

        {/* 3. Danger Zone */}
        <div className="card" style={{ borderColor: 'var(--danger)' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                <AlertTriangle size={20} /> Danger Zone
            </h3>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input 
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}
                />
                <button 
                    onClick={handleWipeData} 
                    className="btn" 
                    style={{ backgroundColor: 'var(--danger)', color: 'white', border: 'none' }}
                    disabled={deleteConfirmation.toLowerCase() !== 'delete'}
                >
                    Wipe Data
                </button>
            </div>
        </div>
    </div>
  );
};

export default AdminSettings;
