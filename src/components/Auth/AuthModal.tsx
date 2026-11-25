import React, { useState } from 'react';
import {
  CheckCircle2,
  Cloud,
  KeyRound,
  Link2,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  linkAccountProvider,
  requestPhoneOtp,
  sendMagicLink,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  verifyPhoneOtp,
} from '../../lib/auth-db';

type AuthTab = 'email' | 'google' | 'phone' | 'magic';

export const AuthModal: React.FC = () => {
  const {
    user,
    cloudStatus,
    authModalOpen,
    setAuthModalOpen,
    handleUserAuthenticated,
    handleSignOut,
    showToast,
  } = useApp();

  const [tab, setTab] = useState<AuthTab>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [googleEmail, setGoogleEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!authModalOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = isSignUp
        ? await signUpWithEmail(email, password, displayName)
        : await signInWithEmail(email, password);
      handleUserAuthenticated(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = await signInWithGoogle(googleEmail);
      handleUserAuthenticated(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSendOtp = async () => {
    setError(null);
    if (!phone.trim()) {
      setError('Enter a valid phone number.');
      return;
    }
    setBusy(true);
    try {
      const msg = await requestPhoneOtp(phone);
      setOtpSent(true);
      showToast(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send SMS code');
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = await verifyPhoneOtp(phone, otpCode);
      handleUserAuthenticated(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setBusy(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const profile = await sendMagicLink(email);
      handleUserAuthenticated(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Magic link failed');
    } finally {
      setBusy(false);
    }
  };

  const handleLinkCurrent = () => {
    if (!user) return;
    if (tab === 'phone' && phone.trim()) {
      const updated = linkAccountProvider(user, 'phone', { phone });
      handleUserAuthenticated(updated);
      showToast('Linked Phone number to your account');
    } else if (tab === 'google' && googleEmail.trim()) {
      const updated = linkAccountProvider(user, 'google', { email: googleEmail });
      handleUserAuthenticated(updated);
      showToast('Linked Google account');
    } else if (email.trim()) {
      const updated = linkAccountProvider(user, 'email', { email });
      handleUserAuthenticated(updated);
      showToast('Linked Email address');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#131b2c] p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Cloud className="h-4 w-4 text-sky-400" />
              <span className="text-[11px] font-semibold tracking-wider text-sky-300 uppercase">
                {cloudStatus.label}
              </span>
            </div>
            <h2 className="font-display mt-1 text-2xl font-extrabold text-white uppercase">
              {user ? 'Account & Linked Providers' : 'Sign In / Cloud Sync'}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAuthModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {user && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-400" />
                <span className="font-bold text-white">{user.displayName}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/25 cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                Sign Out
              </button>
            </div>
            <div className="text-slate-300">
              {user.email && <div>Email: {user.email}</div>}
              {user.phone && <div>Phone: {user.phone}</div>}
              {user.username && <div>Username: @{user.username}</div>}
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {user.linkedProviders.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 uppercase"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Auth Provider Tabs */}
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs">
          {[
            { id: 'email' as AuthTab, label: 'Email', icon: Mail },
            { id: 'google' as AuthTab, label: 'Google', icon: ShieldCheck },
            { id: 'phone' as AuthTab, label: 'Phone', icon: Phone },
            { id: 'magic' as AuthTab, label: 'Magic', icon: Link2 },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTab(t.id);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1 rounded-lg py-1.5 font-semibold cursor-pointer ${
                  tab === t.id
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}

        {tab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-3 text-xs">
            {isSignUp && (
              <div>
                <label className="mb-1 block text-slate-400">Display Name</label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Commissioner Alex"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            )}
            <div>
              <label className="mb-1 block text-slate-400">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-slate-400">Password</label>
              <input
                type="password"
                required
                minLength={4}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setIsSignUp((v) => !v)}
                className="text-sky-400 hover:underline cursor-pointer"
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
              </button>
              {user && (
                <button
                  type="button"
                  onClick={handleLinkCurrent}
                  className="text-emerald-400 hover:underline cursor-pointer"
                >
                  Link Email
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 cursor-pointer"
            >
              {isSignUp ? 'Create Account & Sync' : 'Sign In with Email'}
            </button>
          </form>
        )}

        {tab === 'google' && (
          <form onSubmit={handleGoogle} className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block text-slate-400">
                Google Account Email {cloudStatus.isCloudConfigured ? '(OAuth Redirect)' : '(Local Demo)'}
              </label>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="commissioner@gmail.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-xl bg-white py-2.5 text-sm font-bold text-slate-950 hover:bg-slate-200 cursor-pointer"
              >
                Continue with Google
              </button>
              {user && (
                <button
                  type="button"
                  onClick={handleLinkCurrent}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-300 cursor-pointer"
                >
                  Link
                </button>
              )}
            </div>
          </form>
        )}

        {tab === 'phone' && (
          <form onSubmit={handleVerifyOtp} className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block text-slate-400">Phone Number (E.164)</label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+15551234567"
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="rounded-lg border border-sky-500/40 bg-sky-500/15 px-3 py-2 font-semibold text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                >
                  Send SMS
                </button>
              </div>
            </div>
            {otpSent && (
              <div>
                <label className="mb-1 block text-slate-400">Verification Code</label>
                <input
                  type="text"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="123456"
                  className="font-mono-code w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>
            )}
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy || !otpSent}
                className="flex-1 rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-40 cursor-pointer"
              >
                Verify Phone &amp; Sign In
              </button>
              {user && (
                <button
                  type="button"
                  onClick={handleLinkCurrent}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-300 cursor-pointer"
                >
                  Link
                </button>
              )}
            </div>
          </form>
        )}

        {tab === 'magic' && (
          <form onSubmit={handleMagicLink} className="space-y-3 text-xs">
            <div>
              <label className="mb-1 block text-slate-400">Email for Instant Magic Link</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-sky-400 cursor-pointer"
            >
              <KeyRound className="h-4 w-4" />
              Send &amp; Sign In via Magic Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
