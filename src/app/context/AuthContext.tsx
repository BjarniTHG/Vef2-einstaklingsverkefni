'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export type User = {
    id: number;
    name: string;
    role: string;
} | null;

type AuthContextType = {
    user: User;
    refreshSession: () => Promise<void>;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children }: {children: ReactNode }) => {
    const [user, setUser] = useState<User>(null);
    const router = useRouter();

    const refreshSession = async () => {
        try {
            const res = await fetch('/api/auth/session');
            const data = await res.json();
            setUser(data.user);
        } catch(error){
            console.error('Ekki tókst að endurnýja sessionið', error);
            setUser(null);
        }
    };

    const login = async (email: string, password: string) => {
        try{
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if(response.ok){
                await refreshSession();
                return { success: true };
            } else{
                return { success: false, error: data.error || 'Villa við innskráningu'};
            }
        } catch(error){
            console.error('Login villa: ', error);
            return { success: false, error: 'Villa inn í catch blocki í login functioni í AuthContext.tsx'};
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            if(response.ok){
                setUser(null);
                router.push('/');
            }
        } catch(error){
            console.error('Villa við útskráningu í logout functioni í AuthContext.tsx: ', error);
        }
    };

    useEffect(() => {
        refreshSession();
    }, []);

    return (
        <AuthContext.Provider value ={{ user, refreshSession, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(context === undefined){
        throw new Error('useAuth verður að vera notað innan AuthProvider');
    }
    return context;
}