import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, ArrowRight, Shield } from 'lucide-react';
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="College / Student Email"
                type="email"
                placeholder="name@example.com"
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
                  <Link
                    to="/register"
                    className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Need a new account? Sign up
                  </Link>
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
