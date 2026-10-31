'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface StudentUser {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  token?: string;
}

export interface StudentTicket {
  teamId: string;
  token: string;
  teamName?: string;
}

interface StudentAuthContextType {
  user: StudentUser | null;
  ticket: StudentTicket | null;
  loading: boolean;
  login: (userData: StudentUser) => Promise<StudentTicket | null>;
  logout: () => void;
  refreshTicket: () => Promise<StudentTicket | null>;
}

const STORAGE_KEY = 'student_auth_session';
const TICKET_STORAGE_KEY = 'student_ticket_session';

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined);

export function StudentAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [ticket, setTicket] = useState<StudentTicket | null>(null);
  const [loading, setLoading] = useState(true);

  const checkTicketForUser = useCallback(async (u: StudentUser): Promise<StudentTicket | null> => {
    try {
      const res = await fetch('/api/public/find-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          googleToken: u.token,
          googleId: u.googleId,
          verifiedEmail: u.email,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.teamId && data.token) {
          const t: StudentTicket = {
            teamId: data.teamId,
            token: data.token,
            teamName: data.teamName,
          };
          setTicket(t);
          localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(t));
          return t;
        }
      } else {
        setTicket(null);
        localStorage.removeItem(TICKET_STORAGE_KEY);
      }
    } catch (err) {
      console.warn('Failed to sync student ticket:', err);
    }
    return null;
  }, []);

  // Initialize session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const storedTicket = localStorage.getItem(TICKET_STORAGE_KEY);

      if (storedTicket) {
        try {
          setTicket(JSON.parse(storedTicket));
        } catch {}
      }

      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Refresh ticket in background
        checkTicketForUser(parsed);
      }
    } catch (err) {
      console.error('Failed to load student auth session:', err);
    } finally {
      setLoading(false);
    }
  }, [checkTicketForUser]);

  const login = async (userData: StudentUser): Promise<StudentTicket | null> => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    const t = await checkTicketForUser(userData);
    return t;
  };

  const logout = () => {
    setUser(null);
    setTicket(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TICKET_STORAGE_KEY);
  };

  const refreshTicket = async (): Promise<StudentTicket | null> => {
    if (!user) return null;
    return await checkTicketForUser(user);
  };

  return (
    <StudentAuthContext.Provider
      value={{
        user,
        ticket,
        loading,
        login,
        logout,
        refreshTicket,
      }}
    >
      {children}
    </StudentAuthContext.Provider>
  );
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext);
  if (!context) {
    throw new Error('useStudentAuth must be used within a StudentAuthProvider');
  }
  return context;
}
