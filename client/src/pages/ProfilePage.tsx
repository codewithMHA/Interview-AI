import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Github,
  Linkedin,
  Award,
  Flame,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  Code2,
  ArrowRight,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: profile?.name || user?.name || '',
    college: profile?.college || '',
    degree: profile?.degree || 'B.Tech in Computer Science',
    graduationYear: profile?.graduationYear || new Date().getFullYear() + 1,
    targetRole: profile?.targetRole || 'Software Engineer',
    experienceLevel: profile?.experienceLevel || 'Beginner',
    programmingLanguages: profile?.programmingLanguages?.join(', ') || 'JavaScript, Python, C++',
    skills: profile?.skills?.join(', ') || 'Data Structures, Algorithms, React, Node.js',
    githubProfile: profile?.githubProfile || '',
    linkedinProfile: profile?.linkedinProfile || '',
    profilePicture: profile?.profilePicture || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || user?.name || '',
        college: profile.college || '',
        degree: profile.degree || 'B.Tech in Computer Science',
        graduationYear: profile.graduationYear || new Date().getFullYear() + 1,
        targetRole: profile.targetRole || 'Software Engineer',
        experienceLevel: profile.experienceLevel || 'Beginner',
        programmingLanguages: profile.programmingLanguages?.join(', ') || 'JavaScript, Python',
        skills: profile.skills?.join(', ') || 'Data Structures, Algorithms, React',
        githubProfile: profile.githubProfile || '',
        linkedinProfile: profile.linkedinProfile || '',
        profilePicture: profile.profilePicture || '',
      });
    }
  }, [profile, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const splitLangs = formData.programmingLanguages
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const splitSkills = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await updateProfile({
        name: formData.name,
        college: formData.college,
        degree: formData.degree,
        graduationYear: Number(formData.graduationYear),
        targetRole: formData.targetRole as any,
        experienceLevel: formData.experienceLevel as any,
        programmingLanguages: splitLangs,
        skills: splitSkills,
        githubProfile: formData.githubProfile,
        linkedinProfile: formData.linkedinProfile,
        profilePicture: formData.profilePicture,
      });

      setSuccessMessage('Profile information updated successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header Hero Card - Responsive to Light & Dark Theme */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-brand-900 dark:via-indigo-950 dark:to-slate-900 text-white shadow-xl relative overflow-hidden border border-emerald-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{formData.name || 'Student Candidate'}</h1>
                <Badge variant="purple" size="sm">CSE Candidate</Badge>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="info" size="sm">
                  {formData.targetRole || 'Software Engineer'}
                </Badge>
                <Badge variant="outline" size="sm" className="text-slate-300 border-slate-700">
                  Class of {formData.graduationYear}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
              <span className="text-xs text-slate-300 block">Streak</span>
              <span className="text-lg font-bold text-amber-400 flex items-center gap-1">
                <Flame className="w-4 h-4" /> {profile?.streakCount || 1} Days
              </span>
            </div>
            <div className="px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
              <span className="text-xs text-slate-300 block">XP Points</span>
              <span className="text-lg font-bold text-emerald-400 flex items-center gap-1">
                <Award className="w-4 h-4" /> {profile?.xpPoints || 100} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-300 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm dark:bg-rose-950/40 dark:border-rose-900/50 dark:text-rose-300 animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* Active Placement Plan & Career Setup Wizard Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 dark:from-slate-800/90 dark:to-brand-950/40 border border-brand-200/80 dark:border-brand-800/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-600 text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Active Placement Strategy & Roadmap
            </span>
            <Badge variant="success" size="sm">Configured in DB</Badge>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {formData.targetRole} Preparation Plan ({formData.experienceLevel} Tier)
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Your customized 30-day curriculum, coding difficulty calibrations, and mock interview rubrics are active. Track your daily milestones in the 30-Day Adaptive Roadmap or re-calibrate your skills anytime.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate('/career-setup')}
            className="border-brand-300 dark:border-brand-750 text-brand-700 dark:text-brand-300"
          >
            Re-run Setup Wizard
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => navigate('/roadmap')}
            className="bg-brand-600 hover:bg-brand-700 text-white"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View 30-Day Roadmap
          </Button>
        </div>
      </div>

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Academics & Personal Info */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <GraduationCap className="w-5 h-5" />
              <CardTitle>Academic & Personal Information</CardTitle>
            </div>
            <CardDescription>
              Details about your university, degree, and graduation timeline.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="College / University Name"
                name="college"
                placeholder="e.g. National Institute of Technology"
                value={formData.college}
                onChange={handleChange}
                leftIcon={<GraduationCap className="w-4 h-4" />}
              />

              <Input
                label="Degree / Major"
                name="degree"
                placeholder="e.g. B.Tech Computer Science"
                value={formData.degree}
                onChange={handleChange}
                leftIcon={<Briefcase className="w-4 h-4" />}
              />

              <Input
                label="Graduation Year"
                name="graduationYear"
                type="number"
                placeholder="2026"
                value={formData.graduationYear}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Placement Career Profile */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <Briefcase className="w-5 h-5" />
              <CardTitle>Placement Target & Technical Stack</CardTitle>
            </div>
            <CardDescription>
              Target job role, current experience tier, and technology competencies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Job Role
                </label>
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="Data Analyst">Data Analyst</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Experience Tier
                </label>
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                >
                  <option value="Beginner">Beginner (Foundations & Syntax)</option>
                  <option value="Intermediate">Intermediate (Project & DSA Ready)</option>
                  <option value="Advanced">Advanced (Competitive & Tier-1 Ready)</option>
                </select>
              </div>
            </div>

            <Input
              label="Programming Languages (comma-separated)"
              name="programmingLanguages"
              placeholder="JavaScript, Python, C++, Java"
              value={formData.programmingLanguages}
              onChange={handleChange}
              leftIcon={<Code2 className="w-4 h-4" />}
              helperText="Languages available in your Monaco coding sandbox"
            />

            <Input
              label="Skills & Technical Topics (comma-separated)"
              name="skills"
              placeholder="React, Node.js, Data Structures, Algorithms, MongoDB, SQL"
              value={formData.skills}
              onChange={handleChange}
              leftIcon={<Layers className="w-4 h-4" />}
              helperText="Used to generate personalized mock interview questions and roadmap topics"
            />
          </CardContent>
        </Card>

        {/* Section 3: Professional Profiles & Links */}
        <Card className="border border-slate-200 dark:border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
              <LinkIcon className="w-5 h-5" />
              <CardTitle>Professional Links & Portfolios</CardTitle>
            </div>
            <CardDescription>
              Link your GitHub and LinkedIn for resume and behavioral evaluation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="GitHub Profile URL"
                name="githubProfile"
                placeholder="https://github.com/username"
                value={formData.githubProfile}
                onChange={handleChange}
                leftIcon={<Github className="w-4 h-4" />}
              />

              <Input
                label="LinkedIn Profile URL"
                name="linkedinProfile"
                placeholder="https://linkedin.com/in/username"
                value={formData.linkedinProfile}
                onChange={handleChange}
                leftIcon={<Linkedin className="w-4 h-4" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
            size="lg"
            className="px-8 shadow-lg shadow-brand-500/20"
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

