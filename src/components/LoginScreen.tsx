import { useState } from 'react';

interface Props {
  onLogin: (username: string, password: string) => Promise<string | null>;
}

type Mode = 'login' | 'change-password';

export function LoginScreen({ onLogin }: Props) {
  const [mode, setMode] = useState<Mode>('login');

  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl px-8 py-10 w-full max-w-sm shadow-lg">
        <h1 className="text-[22px] font-bold text-[#1A1A1A] mb-1 text-center">Kulturní odpoledne</h1>
        <p className="text-[13px] text-[#9B9B9B] text-center mb-8">
          {mode === 'login' ? 'Přihlaste se pro přístup k aplikaci' : 'Změna hesla'}
        </p>

        {mode === 'login'
          ? <LoginForm onLogin={onLogin} onSwitchMode={() => setMode('change-password')} />
          : <ChangePasswordForm onDone={() => setMode('login')} />
        }
      </div>
    </div>
  );
}

// ── Login form ────────────────────────────────────────────────────────────────

function LoginForm({
  onLogin,
  onSwitchMode,
}: {
  onLogin: (u: string, p: string) => Promise<string | null>;
  onSwitchMode: () => void;
}) {
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Uživatelské jméno">
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          className={inputCls}
        />
      </Field>
      <Field label="Heslo">
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          className={inputCls}
        />
      </Field>

      {error && <ErrorBox message={error} />}

      <button
        type="submit"
        disabled={loading || !username.trim() || !password}
        className={primaryBtn}
      >
        {loading ? 'Přihlašuji…' : 'Přihlásit se'}
      </button>

      <button
        type="button"
        onClick={onSwitchMode}
        className="w-full text-center text-[13px] text-[#9B9B9B] underline underline-offset-2 mt-1"
      >
        Změnit heslo
      </button>
    </form>
  );
}

// ── Change-password form ──────────────────────────────────────────────────────

function ChangePasswordForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername]       = useState('');
  const [current, setCurrent]         = useState('');
  const [next, setNext]               = useState('');
  const [confirm, setConfirm]         = useState('');
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState(false);
  const [loading, setLoading]         = useState(false);

  const mismatch = next && confirm && next !== confirm;
  const tooShort = next.length > 0 && next.length < 8;
  const canSubmit = username.trim() && current && next.length >= 8 && next === confirm && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError('');
    try {
      const r = await fetch('/api/auth/change-password-unauthenticated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), currentPassword: current, newPassword: next }),
      });
      const data = await r.json();
      if (r.ok) {
        setSuccess(true);
        setTimeout(onDone, 2000);
      } else {
        setError(data.error ?? 'Nepodařilo se změnit heslo');
        setLoading(false);
      }
    } catch {
      setError('Nelze se připojit k serveru');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-4 space-y-2">
        <div className="text-[32px]">✓</div>
        <p className="text-[14px] font-medium text-[#1A1A1A]">Heslo bylo změněno</p>
        <p className="text-[13px] text-[#9B9B9B]">Přesměrování na přihlášení…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Uživatelské jméno">
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          autoCapitalize="none"
          className={inputCls}
        />
      </Field>
      <Field label="Aktuální heslo">
        <input
          type="password"
          value={current}
          onChange={e => setCurrent(e.target.value)}
          autoComplete="current-password"
          className={inputCls}
        />
      </Field>
      <Field label="Nové heslo" hint={tooShort ? 'Minimálně 8 znaků' : undefined}>
        <input
          type="password"
          value={next}
          onChange={e => setNext(e.target.value)}
          autoComplete="new-password"
          className={`${inputCls} ${tooShort ? 'border-[#C8102E]' : ''}`}
        />
      </Field>
      <Field label="Zopakovat nové heslo" hint={mismatch ? 'Hesla se neshodují' : undefined}>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          autoComplete="new-password"
          className={`${inputCls} ${mismatch ? 'border-[#C8102E]' : ''}`}
        />
      </Field>

      {error && <ErrorBox message={error} />}

      <button type="submit" disabled={!canSubmit} className={primaryBtn}>
        {loading ? 'Ukládám…' : 'Uložit nové heslo'}
      </button>
      <button
        type="button"
        onClick={onDone}
        className="w-full text-center text-[13px] text-[#9B9B9B] underline underline-offset-2"
      >
        Zpět na přihlášení
      </button>
    </form>
  );
}

// ── Shared primitives ─────────────────────────────────────────────────────────

const inputCls = 'w-full border border-[#E8E8E8] rounded-xl px-4 py-3 text-[15px] text-[#1A1A1A] focus:outline-none focus:border-[#1A1A1A] transition-colors';
const primaryBtn = 'w-full bg-[#1A1A1A] text-white rounded-xl py-3 text-[15px] font-semibold disabled:opacity-40 active:scale-95 transition-all';

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-[11px] uppercase tracking-wide text-[#9B9B9B]">{label}</label>
        {hint && <span className="text-[11px] text-[#C8102E]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <p className="text-[13px] text-[#C8102E] bg-[#FFF0F0] border border-[#F5C6C6] rounded-lg px-3 py-2">
      {message}
    </p>
  );
}
