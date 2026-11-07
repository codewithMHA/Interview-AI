import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Sun,
  Moon,
  Menu,
  X,
  Code2,
  Layers,
  Bot,
  LineChart,
  ArrowRight,
  User,
  LogOut,
  Compass,
  LayoutDashboard,
  BookOpen,
  Terminal,
  ChevronDown,
  Check,
  Flame,
  Award,
  FileText,
  Zap,
  Home
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'practice' | 'placement' | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Auto-close any dropdowns when route changes
  useEffect(() => {
    setOpenDropdown(null);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Click-outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = (menu: 'practice' | 'placement') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(menu);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 160);
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  const isRouteActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  const isPracticeActive =
    isRouteActive('/coding') ||
    isRouteActive('/practice') ||
    isRouteActive('/practice-sandbox') ||
    isRouteActive('/playground') ||
    isRouteActive('/problems') ||
    isRouteActive('/questions');

  const isPlacementActive =
    isRouteActive('/placement-modules') ||
    isRouteActive('/roadmap') ||
    isRouteActive('/resume-scanner') ||
    isRouteActive('/resume') ||
    isRouteActive('/ai-interview') ||
    isRouteActive('/mock-interview') ||
    isRouteActive('/resume-interview');

  const isAnalyticsActive = isRouteActive('/analytics');
  const isDashboardActive = isRouteActive('/dashboard');
  const isAIChatActive = isRouteActive('/chat') || isRouteActive('/ai-mentor');
  const isHomeActive = currentPath === '/';

  const practiceItems = [
    {
      title: 'Coding Challenges',
      subtitle: 'Monaco editor with multi-language test assertions',
      href: '/coding',
      icon: Code2,
      badge: 'Popular',
      badgeVariant: 'brand' as const,
      isActive: isRouteActive('/coding') || isRouteActive('/problems'),
    },
    {
      title: 'Code Playground',
      subtitle: 'Multi-language compiler (C++, Java, Python, JS)',
      href: '/practice-sandbox',
      icon: Terminal,
      badge: 'Compiler',
      badgeVariant: 'success' as const,
      isActive: isRouteActive('/practice-sandbox') || isRouteActive('/playground'),
    },
    {
      title: 'Question Bank',
      subtitle: '300+ Core CS & Company interview Q&A',
      href: '/questions',
      icon: BookOpen,
      badge: '300+ Qs',
      badgeVariant: 'purple' as const,
      isActive: isRouteActive('/questions'),
    },
  ];

  const placementItems = [
    {
      title: 'AI Interview',
      subtitle: 'Real-time voice & video placement interview',
      href: '/ai-interview',
      icon: Bot,
      badge: 'Voice AI',
      badgeVariant: 'brand' as const,
      isActive: isRouteActive('/ai-interview') || isRouteActive('/resume-interview') || isRouteActive('/mock-interview'),
    },
    {
      title: 'Placement Modules',
      subtitle: '7 specialized interview tracks (96 Qs)',
      href: '/placement-modules',
      icon: Layers,
      badge: '96 Qs',
      badgeVariant: 'warning' as const,
      isActive: isRouteActive('/placement-modules'),
    },
    {
      title: '30-Day Roadmap',
      subtitle: 'Structured day-by-day learning schedule',
      href: '/roadmap',
      icon: Compass,
      badge: 'Curriculum',
      badgeVariant: 'info' as const,
      isActive: isRouteActive('/roadmap'),
    },
    {
      title: 'AI Resume & ATS Scanner',
      subtitle: 'ATS score, skill gap & Google X-Y-Z rewrites',
      href: '/resume-scanner',
      icon: FileText,
      badge: 'ATS Score',
      badgeVariant: 'brand' as const,
      isActive: isRouteActive('/resume-scanner') || isRouteActive('/resume'),
    },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#07070c]/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo - Styled Modern Wordmark & Icon */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <Sparkles className="h-5 w-5 fill-white/20 animate-pulse" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#07070c]" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                <span>Interview</span>
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent font-black drop-shadow-xs">
                  AI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 animate-pulse" />
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 -mt-1">
                Autonomous Placement OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Clean, Modern & Dropdown Grouped */}
          <nav ref={dropdownRef} className="hidden lg:flex items-center gap-1.5">
            {/* 1. Home Link */}
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isHomeActive
                  ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-xs dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <Home className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Home</span>
            </Link>

            {/* 2. Practice Dropdown (Coding Challenges, Code Playground, Question Bank) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('practice')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'practice' ? null : 'practice')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isPracticeActive
                    ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-xs dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <Code2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Practice</span>
                {isPracticeActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'practice' ? 'rotate-180 text-brand-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Practice Dropdown Menu */}
              {openDropdown === 'practice' && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-72 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl p-2 z-50 animate-slide-up"
                  onMouseEnter={() => handleMouseEnter('practice')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Coding & Problem Solving
                  </div>
                  <div className="space-y-1">
                    {practiceItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            item.isActive
                              ? 'bg-brand-50/90 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 text-brand-700 dark:text-brand-300'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              item.isActive
                                ? 'bg-brand-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold truncate">{item.title}</span>
                              {item.isActive ? (
                                <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                              ) : (
                                <Badge variant={item.badgeVariant} size="sm">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-1">
                              {item.subtitle}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Placement Prep Dropdown (Placement Modules, Mock Interview, 30-Day Roadmap) */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('placement')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'placement' ? null : 'placement')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isPlacementActive
                    ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-xs dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Placement Prep</span>
                {isPlacementActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                )}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    openDropdown === 'placement' ? 'rotate-180 text-brand-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Placement Dropdown Menu */}
              {openDropdown === 'placement' && (
                <div
                  className="absolute top-full left-0 mt-1.5 w-76 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl p-2 z-50 animate-slide-up"
                  onMouseEnter={() => handleMouseEnter('placement')}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    Interview & Placement Preparation
                  </div>
                  <div className="space-y-1">
                    {placementItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                            item.isActive
                              ? 'bg-brand-50/90 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/60 text-brand-700 dark:text-brand-300'
                              : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              item.isActive
                                ? 'bg-brand-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold truncate">{item.title}</span>
                              {item.isActive ? (
                                <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
                              ) : (
                                <Badge variant={item.badgeVariant} size="sm">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-1">
                              {item.subtitle}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. AI Mentor (Direct Link) */}
            <Link
              to="/chat"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isAIChatActive
                  ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-xs dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>AI Mentor</span>
              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white leading-none shadow-xs">
                24/7
              </span>
            </Link>

            {/* 5. Analytics (Direct Link) */}
            <Link
              to="/analytics"
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                isAnalyticsActive
                  ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-xs dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <LineChart className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Analytics</span>
              {isAnalyticsActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              )}
            </Link>

            {/* 6. Dashboard (Direct Link for authenticated users) */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                  isDashboardActive
                    ? 'bg-brand-50 text-brand-700 border-brand-200 shadow-xs dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-800/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border-transparent dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Dashboard</span>
                {isDashboardActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
                )}
              </Link>
            )}
          </nav>

          {/* Actions & Theme Toggle & Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Quick Streak Badge if authenticated */}
            {isAuthenticated && profile && (
              <div
                title="Current Practice Streak"
                className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-semibold"
              >
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span>{profile.streakCount || 1}d</span>
              </div>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <div ref={profileMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors border border-slate-200 dark:border-slate-800"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[110px] truncate">
                    {user?.name?.split(' ')[0] || 'Student'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 animate-slide-up"
                  >
                    <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <div className="p-1 space-y-0.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-brand-500" />
                        Dashboard
                      </Link>

                      <Link
                        to="/roadmap"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Compass className="w-3.5 h-3.5 text-brand-500" />
                        Placement Roadmap
                      </Link>

                      <Link
                        to="/analytics"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <LineChart className="w-3.5 h-3.5 text-brand-500" />
                        Analytics & Badges
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-brand-500" />
                        Student Profile
                      </Link>

                      <Link
                        to="/career-setup"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                        Career Setup Wizard
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <div className="p-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>

                <Link to="/register">
                  <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Get Started Free
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-950/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Home Link */}
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
              isHomeActive
                ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-bold'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Home className="w-4 h-4 text-brand-500" />
              <span>Home</span>
            </div>
          </Link>

          {isAuthenticated ? (
            <div className="p-3 rounded-xl bg-slate-100/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500">{user?.email}</p>
              </div>
              {profile && (
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>{profile.streakCount || 1}d</span>
                </div>
              )}
            </div>
          ) : null}

          {/* Category 2: Practice & Sandbox */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Coding & Practice
            </div>
            {practiceItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    item.isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span>{item.title}</span>
                  </div>
                  {item.isActive ? (
                    <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  ) : (
                    <Badge variant={item.badgeVariant} size="sm">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Category 3: Placement Prep */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Placement Preparation
            </div>
            {placementItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    item.isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-brand-500" />
                    <span>{item.title}</span>
                  </div>
                  {item.isActive ? (
                    <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                  ) : (
                    <Badge variant={item.badgeVariant} size="sm">{item.badge}</Badge>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Category 4: Analytics & Dashboard */}
          <div className="space-y-1 pt-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
              Performance
            </div>
            {/* Mobile AI Mentor */}
            <Link
              to="/chat"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                isAIChatActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bot className="w-4 h-4 text-brand-500" />
                <span>AI Placement Mentor</span>
              </div>
              <Badge variant="brand" size="sm">24/7</Badge>
            </Link>

            <Link
              to="/analytics"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                isAnalyticsActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LineChart className="w-4 h-4 text-brand-500" />
                <span>Analytics & Badges</span>
              </div>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold ${
                    isDashboardActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/70 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="w-4 h-4 text-brand-500" />
                    <span>Dashboard</span>
                  </div>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <User className="w-4 h-4 text-brand-500" />
                  <span>Student Profile</span>
                </Link>

                <Link
                  to="/career-setup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
                >
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  <span>Career Setup Wizard</span>
                </Link>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                onClick={handleLogout}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
