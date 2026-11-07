import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent } from '@/components/common/Card';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const destination = (location.state as any)?.from?.pathname || '/dashboard';
  const redirectedFromPrivate = Boolean((location.state as any)?.from?.pathname);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate(destination);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle1ClickDemoLogin = async () => {
    setIsDemoLoading(true);
    setErrorMessage('');
    try {
      await login('student@placement.edu', 'Placement2026!');
      navigate(destination);
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsDemoLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('student@placement.edu');
    setPassword('Placement2026!');
    setErrorMessage('');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 py-12 bg-grid-pattern relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 fill-white/20 animate-pulse" />
            </div>
            <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
              <span>Interview</span>
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent font-black">
                AI
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 animate-pulse" />
            </span>
          </Link>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Student Sign In</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your interview room, roadmap, and student dashboard
          </p>
        </div>

        {/* Private Route Notice if redirected */}
        {redirectedFromPrivate && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5 shadow-xs">
            <Shield className="w-4 h-4 shrink-0 text-amber-500" />
            <div>
              <strong>Private Feature Access:</strong> Please sign in or register to launch this feature and save your interview recordings & progress.
            </div>
          </div>
        )}

        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            {/* 1-Click Demo Action Button */}
            <button
              type="button"
              onClick={handle1ClickDemoLogin}
              disabled={isDemoLoading}
              className="w-full mb-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-brand-500/20 hover:from-amber-500/30 hover:to-brand-500/30 text-amber-700 dark:text-amber-300 border border-amber-500/35 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{isDemoLoading ? 'Signing in as Demo Student...' : '⚡ 1-Click Demo Login (Instant Access)'}</span>
            </button>

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-750" />
              <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Or With Credentials
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-750" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="College / Student Email"
                type="email"
                placeholder="student@placement.edu"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <div className="space-y-1">
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />
                <div className="flex justify-end">
                  <a href="#forgot" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Account
              </Button>
            </form>

            {/* Quick autofill helper */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-xs text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors inline-flex items-center gap-1 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Auto-fill demo credentials in form
              </button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            state={location.state}
            className="font-semibold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Register new account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
