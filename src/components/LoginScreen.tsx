import { useState } from 'react';

interface Props {
  onLogin: (username: string, password: string) => Promise<string | null>;
}

export function LoginScreen({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError('');
    const err = await onLogin(username.trim(), password);
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl px-8 py-10 w-full max-w-sm shadow-lg">
        <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-1 text-center">Kulturní odpoledne</h1>
        <p className="text-[13px] text-[#9B9B9B] text-center mb-8">Přihlaste se pro přístup k aplikaci</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B] block mb-1.5">
              Uživatelské jméno
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B] block mb-1.5">
              Heslo
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors"
            />
          </div>

          {error && (
            <p className="text-[13px] text-[#C8102E] bg-[#FFF0F0] border border-[#F5C6C6] rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !username.trim() || !password}
            className="w-full bg-[#1A1A1A] text-white rounded-xl py-3 text-[15px] font-semibold disabled:opacity-40 active:scale-95 transition-all mt-2"
          >
            {loading ? 'Přihlašuji…' : 'Přihlásit se'}
          </button>
        </form>
      </div>
    </div>
  );
}
