'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                }
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signUp = async (email, password, displayName, companyName) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        setUser(result.user);
        await updateProfile(result.user, { displayName });
        await setDoc(doc(db, 'users', result.user.uid), {
            email,
            displayName,
            companyName: companyName || '',
            plan: 'starter',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return result;
    };

    const signIn = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        setUser(result.user);
        return result;
    };

    const signOut = async () => {
        return firebaseSignOut(auth);
    };

    const resetPassword = async (email) => {
        return sendPasswordResetEmail(auth, email);
    };

    const value = {
        user,
        userData,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
