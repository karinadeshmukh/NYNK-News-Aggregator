import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Sparkles, User, Lock, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

const AVAILABLE_TOPICS = ['Technology', 'Economy', 'Governance', 'National', 'World'];
const PERSPECTIVES = ['Official', 'Left', 'Center', 'Right'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'reader' | 'editor'>('reader');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Technology', 'Economy']);
  const [selectedPerspectives, setSelectedPerspectives] = useState<string[]>([
    'Official',
    'Left',
    'Center',
    'Right'
  ]);

  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Invalid credentials');
        }
      } else {
        const res = await register({
          email,
          name,
          password,
          role,
          preferred_topics: selectedTopics,
          preferred_perspectives: selectedPerspectives
        });
        if (res.success) {
          onClose();
        } else {
          setErrorMsg(res.error || 'Failed to create account');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTopic = (t: string) => {
    setSelectedTopics((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const togglePerspective = (p: string) => {
    setSelectedPerspectives((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleQuickDemoLogin = async (demoRole: 'reader' | 'editor') => {
    setErrorMsg('');
    setIsSubmitting(true);
    const demoEmail = demoRole === 'editor' ? 'editor@nynk.news' : 'reader@nynk.news';
    const demoPass = demoRole === 'editor' ? 'editorSecret123' : 'readerPassword123';

    // First attempt login, if not exists then register
    let res = await login(demoEmail, demoPass);
    if (!res.success) {
      res = await register({
        email: demoEmail,
        name: demoRole === 'editor' ? 'NYNK Editor' : 'NYNK Reader',
        password: demoPass,
        role: demoRole
      });
    }

    setIsSubmitting(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Demo login failed');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-cream-50 border-2 border-slate-900 rounded-3xl shadow-retro-lg flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-900/10 flex items-start justify-between bg-white">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-[#FDE2E4] text-rose-950 border border-rose-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>NYNK Membership</span>
            </div>
            <h2 className="font-serif font-black text-2xl text-slate-900">
              {mode === 'login' ? 'Sign In to nynk.' : 'Join the Club'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Save stories, personalize perspective feeds, and access editorial tools.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full border border-slate-300 hover:border-slate-900 text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-900/10 bg-cream-100 p-1.5">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
              mode === 'login'
                ? 'bg-slate-900 text-white shadow-retro-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-full transition ${
              mode === 'register'
                ? 'bg-slate-900 text-white shadow-retro-sm'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-rose-100 border border-rose-300 text-xs font-semibold text-rose-900">
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karina Rao"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>
          </div>

          {/* Registration Extra Fields: Role and Preferences */}
          {mode === 'register' && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              {/* Role selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Account Type / Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('reader')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      role === 'reader'
                        ? 'bg-[#E0F2FE] border-sky-400 text-sky-950 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    📖 Reader
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('editor')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      role === 'editor'
                        ? 'bg-[#E8DFF5] border-purple-400 text-purple-950 shadow-sm'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    ✏️ Editor / Curator
                  </button>
                </div>
              </div>

              {/* Topics of Interest */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Favorite Topics
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TOPICS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTopic(t)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold border transition ${
                        selectedTopics.includes(t)
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-full text-xs font-black uppercase tracking-wider text-slate-900 bg-white border-2 border-slate-900 shadow-retro hover:translate-x-0.5 hover:translate-y-0.5 transition disabled:opacity-50 mt-4"
          >
            {isSubmitting
              ? 'Processing...'
              : mode === 'login'
              ? 'Sign In to Account →'
              : 'Complete Registration →'}
          </button>

          {/* Demo Login Shortcuts */}
          <div className="pt-4 border-t border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2 text-center">
              Quick 1-Click Demo Profiles:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('reader')}
                className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-[#E0F2FE] hover:bg-[#BAE6FD] border border-sky-300 text-sky-950 transition"
              >
                Sign In as Reader
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('editor')}
                className="flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold bg-[#DCFCE7] hover:bg-[#BBF7D0] border border-emerald-300 text-emerald-950 transition"
              >
                Sign In as Editor
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

