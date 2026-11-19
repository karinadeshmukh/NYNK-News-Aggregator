import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Sparkles,
  User,
  Lock,
  Mail,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Loader2
} from 'lucide-react';

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
      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between bg-white">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#0091FF] flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-wider text-[#0091FF]">
                NYNK Intelligence Access
              </span>
            </div>
            <h2 className="font-serif font-black text-2xl text-gray-950">
              {mode === 'login' ? 'Sign In' : 'Create Your Account'}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Save stories, track your News Diet balance, and access editorial tools.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50 p-1.5 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'login'
                ? 'bg-white text-black shadow-sm font-black'
                : 'text-gray-500 hover:text-black'
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
            className={`flex-1 py-2 rounded-lg transition ${
              mode === 'register'
                ? 'bg-white text-black shadow-sm font-black'
                : 'text-gray-500 hover:text-black'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-800">
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karina Rao"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0091FF]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0091FF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs sm:text-sm text-gray-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0091FF]"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Reader Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('reader')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      role === 'reader'
                        ? 'bg-[#0091FF] text-white border-[#0091FF] shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Reader</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('editor')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      role === 'editor'
                        ? 'bg-black text-white border-black shadow-sm'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Editor</span>
                  </button>
                </div>
              </div>

              {/* Preferred Topics */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-1.5">
                  Favorite Topics
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        selectedTopics.includes(topic)
                          ? 'bg-black text-white border-black'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-[#0091FF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm tracking-wide transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to NYNK' : 'Create NYNK Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Quick Demo Credentials */}
          <div className="pt-3 border-t border-gray-100 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block text-center">
              1-Click Instant Demo Access
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('reader')}
                className="py-1.5 px-3 rounded-lg border border-gray-200 hover:border-black text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Instant Reader
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('editor')}
                className="py-1.5 px-3 rounded-lg border border-gray-200 hover:border-black text-[11px] font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Instant Editor
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
