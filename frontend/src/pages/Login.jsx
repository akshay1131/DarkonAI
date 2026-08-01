import React, { useState } from 'react';
import { Activity, AlertTriangle, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login({ username, password });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Secure authentication service unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05070c] text-slate-100 flex items-center justify-center px-5 py-10">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(34,211,238,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.06)_1px,transparent_1px)] [background-size:42px_42px]" />
      <div className="pointer-events-none absolute -top-48 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[120px]" />

      <section className="relative w-full max-w-md border border-cyan-400/20 bg-slate-950/80 p-7 shadow-[0_0_70px_rgba(34,211,238,0.12)] backdrop-blur-xl sm:p-9">
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center border border-cyan-400/60 bg-cyan-400/10 text-cyan-300">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h1 className="font-mono text-lg font-bold tracking-[0.18em] text-white">DARKON<span className="text-cyan-400">AI</span></h1>
              <p className="mt-0.5 font-mono text-[9px] tracking-[0.18em] text-slate-500">SOC COMMAND ACCESS</p>
            </div>
          </div>
          <Activity className="animate-pulse text-emerald-400" size={19} />
        </div>

        <div className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.2em] text-cyan-400">IDENTITY VERIFICATION</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">Authorize operator session</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">Restricted access to the DarkonAI threat operations console.</p>
        </div>

        {error && (
          <div className="mb-5 flex gap-2 border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            <AlertTriangle className="mt-0.5 shrink-0" size={16} />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-5" onSubmit={submit}>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-slate-400">OPERATOR ID</span>
            <div className="flex items-center border border-slate-700 bg-slate-900/70 focus-within:border-cyan-400">
              <UserRound className="ml-3 text-slate-500" size={17} />
              <input className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-slate-600" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter operator ID" required />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block font-mono text-[10px] tracking-[0.16em] text-slate-400">ACCESS KEY</span>
            <div className="flex items-center border border-slate-700 bg-slate-900/70 focus-within:border-cyan-400">
              <LockKeyhole className="ml-3 text-slate-500" size={17} />
              <input className="w-full bg-transparent px-3 py-3.5 text-sm outline-none placeholder:text-slate-600" autoComplete="current-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter access key" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="mr-3 text-slate-500 hover:text-cyan-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          <button disabled={isSubmitting} className="w-full border border-cyan-300 bg-cyan-400 px-4 py-3.5 font-mono text-xs font-bold tracking-[0.18em] text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'AUTHENTICATING...' : 'AUTHORIZE ACCESS'}
          </button>
        </form>

        <div className="mt-7 flex items-center justify-between border-t border-slate-800 pt-4 font-mono text-[9px] tracking-[0.12em] text-slate-500">
          <span>JWT SECURED</span><span className="text-emerald-500">● SOC ONLINE</span><span>v2.0</span>
        </div>
      </section>
    </div>
  );
}
