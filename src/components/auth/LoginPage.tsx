import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Building2, Shield, Lock, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useApp();

  const [email, setEmail] = useState('bd@commercial.local');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your corporate email address.');
      return;
    }

    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    // Realistic brief network delay simulation
    setTimeout(() => {
      const result = login(email.trim().toLowerCase(), password, rememberMe);
      setIsLoading(false);
      if (!result.success) {
        setError(result.error || 'Invalid email or password.');
      }
    }, 450);
  };

  const handleSelectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Logo & Title */}
        <div className="flex justify-center mb-3">
          <img
            src="/assets/aistudio/TACTIC_BANNER_119b3f82.png"
            alt="TACTIC - Task and Corrective Tracking Integrated Control"
            className="h-16 sm:h-20 w-auto max-w-[280px] sm:max-w-[320px] object-contain drop-shadow-2xs"
          />
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-[#172B4D] tracking-tight">
          Commercial Management System
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Internal Commercial Platform · Record · Control · Monitor
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Main White Login Card */}
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xs border border-slate-200 rounded-2xl">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            <div>
              <Input
                label="Corporate Email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="user@commercial.local"
                leftIcon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                required
                isPassword
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                leftIcon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-[#0070C0] focus:ring-[#0070C0] w-3.5 h-3.5"
                />
                <span>Remember me</span>
              </label>

              <span className="text-[11px] text-slate-400">
                Default: password123
              </span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                className="w-full py-2.5"
              >
                Sign in to Dashboard
              </Button>
            </div>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Quick Sign-in (Demo Accounts)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSelectDemoUser('admin@commercial.local')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  email === 'admin@commercial.local'
                    ? 'border-[#0070C0] bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[#172B4D]">Super Admin</div>
                <div className="text-[10px] text-slate-400 truncate">admin@commercial.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('head@commercial.local')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  email === 'head@commercial.local'
                    ? 'border-[#0070C0] bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[#172B4D]">Head Dept</div>
                <div className="text-[10px] text-slate-400 truncate">head@commercial.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('bd@commercial.local')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  email === 'bd@commercial.local'
                    ? 'border-[#0070C0] bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[#172B4D]">Business Dev</div>
                <div className="text-[10px] text-slate-400 truncate">bd@commercial.local</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectDemoUser('kam@commercial.local')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  email === 'kam@commercial.local'
                    ? 'border-[#0070C0] bg-blue-50/50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="font-bold text-[#172B4D]">Key Account</div>
                <div className="text-[10px] text-slate-400 truncate">kam@commercial.local</div>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] text-slate-400">
          TACTIC · Commercial Management System · Pancaran Group
        </div>
      </div>
    </div>
  );
};
