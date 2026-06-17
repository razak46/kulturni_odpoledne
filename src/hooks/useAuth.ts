import { useState, useEffect } from 'react';

export interface AuthUser {
  id: number;
  username: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setUser(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string): Promise<string | null> => {
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      const data = await r.json();
      if (r.ok) { setUser({ id: 0, username: data.username }); return null; }
      return data.error ?? 'Přihlášení selhalo';
    } catch {
      return 'Nelze se připojit k serveru';
    }
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<string | null> => {
    try {
      const r = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await r.json();
      return r.ok ? null : (data.error ?? 'Chyba');
    } catch {
      return 'Nelze se připojit k serveru';
    }
  };

  return { user, loading, login, logout, changePassword };
}
