import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent } from '@/components/common/Card';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage('');
    setIsLoading(true);

    try {
      await register(formData.name, formData.email, formData.password, formData.confirmPassword);
      // New users proceed to career onboarding
      navigate('/career-setup');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Start Your Placement Prep</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Free access to AI mock interviews and curated CSE roadmaps
          </p>
        </div>

        <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
          <CardContent className="p-6 md:p-8">
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                placeholder="student@university.edu"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={handleChange}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                leftIcon={<ShieldCheck className="w-4 h-4" />}
                required
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Create Student Account
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
