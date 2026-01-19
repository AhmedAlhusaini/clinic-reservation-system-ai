import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    
    // Default users to seed if empty
    const defaultUsers = [
        { id: '1', username: 'admin', role: 'admin', password: 'admin123', expiration: null },
        { id: '2', username: 'assistant', role: 'assistant', password: 'assist123', expiration: null },
        { id: '3', username: 'owner', role: 'owner', password: 'owner123', expiration: null }
    ];

    // Initialize from local storage
    useEffect(() => {
        const storedUser = localStorage.getItem('clinic_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        const storedUsers = localStorage.getItem('clinic_users_db');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            setUsers(defaultUsers);
            localStorage.setItem('clinic_users_db', JSON.stringify(defaultUsers));
        }
    }, []);

    const saveUsers = (newUsers) => {
        setUsers(newUsers);
        localStorage.setItem('clinic_users_db', JSON.stringify(newUsers));
    };

    const login = (role, password, username) => {
        // Find user by username (preferred) or fall back to legacy role-based if username is empty (though Login form requires it)
        // Adjusting logic to support both for backward compat if needed, but primarily username.
        
        let foundUser = users.find(u => u.username === username);
        
        // If no user found by username, and username is one of the default role names, maybe they just typed the role name
        if (!foundUser && (username === 'admin' || username === 'assistant' || username === 'owner')) {
             foundUser = users.find(u => u.role === username);
        }

        // If still not found, check if they match the legacy behavior (username might be empty/ignored in old calls)
        if (!foundUser) {
             foundUser = users.find(u => u.role === role && u.username === role); // Try to match role as username
             // Or just search by role if we want to allow "any admin" (not recommended for dynamic users)
        }

        if (foundUser) {
            // Check password
            if (foundUser.password !== password) return false;
            
            // Check Role
            if (foundUser.role !== role) return false;

            // Check Expiration
            if (foundUser.expiration) {
                const expDate = new Date(foundUser.expiration);
                if (new Date() > expDate) {
                    alert('Account expired. Please contact Super Admin.');
                    return false;
                }
            }

            const userData = { ...foundUser, name: foundUser.username };
            setUser(userData);
            localStorage.setItem('clinic_user', JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('clinic_user');
    };

    const addUser = (newUser) => {
        const updatedUsers = [...users, { ...newUser, id: Date.now().toString() }];
        saveUsers(updatedUsers);
    };

    const removeUser = (id) => {
        const updatedUsers = users.filter(u => u.id !== id);
        saveUsers(updatedUsers);
    };

    const updateUser = (id, updates) => {
         const updatedUsers = users.map(u => u.id === id ? { ...u, ...updates } : u);
         saveUsers(updatedUsers);
    };

    return (
        <AuthContext.Provider value={{ user, users, login, logout, addUser, removeUser, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};
