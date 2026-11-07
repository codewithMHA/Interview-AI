import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Github, Linkedin, Twitter, Code, Terminal, Brain, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#07070c] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Sparkles className="h-4.5 w-4.5" />
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-0.5">
                <span>Interview</span>
                <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 bg-clip-text text-transparent font-black">
                  AI
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5" />
              </span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Engineered for students preparing for Tier-1, Unicorn, and product-based software engineering campus placements.
            </p>
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-brand-500 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Placement Modules
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/ai-interview" className="hover:text-brand-500 transition-colors font-medium text-indigo-600 dark:text-indigo-400">AI Interview (Voice)</Link></li>
              <li><Link to="/coding" className="hover:text-brand-500 transition-colors">DSA & Coding Sandbox</Link></li>
              <li><Link to="/practice-sandbox" className="hover:text-brand-500 transition-colors">Judge0 Code Playground</Link></li>
              <li><Link to="/placement-modules" className="hover:text-brand-500 transition-colors">Placement Engineering Tracks</Link></li>
              <li><Link to="/questions" className="hover:text-brand-500 transition-colors">149+ Core Question Bank</Link></li>
              <li><Link to="/roadmap" className="hover:text-brand-500 transition-colors">30-Day Adaptive Roadmap</Link></li>
              <li><Link to="/resume-scanner" className="hover:text-brand-500 transition-colors">ATS Resume Intelligence</Link></li>
            </ul>
          </div>

          {/* Curriculum */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              CSE Curriculum
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/questions?category=Data+Structures+%26+Algorithms" className="hover:text-brand-500 transition-colors">Data Structures & Algorithms</Link></li>
              <li><Link to="/questions?category=Database" className="hover:text-brand-500 transition-colors">Database Management Systems</Link></li>
              <li><Link to="/questions?category=Computer+Science" className="hover:text-brand-500 transition-colors">Operating Systems & Linux</Link></li>
              <li><Link to="/questions?topic=Computer+Networks" className="hover:text-brand-500 transition-colors">Computer Networks</Link></li>
              <li><Link to="/questions?topic=System+Design" className="hover:text-brand-500 transition-colors">Full-Stack System Design</Link></li>
            </ul>
          </div>

          {/* Architecture & Tech Stack */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Architecture
            </h4>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-brand-500" />
                <span>Gemini API Secure Proxy</span>
              </div>
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                <span>Judge0 Code Execution</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-3.5 h-3.5 text-blue-500" />
                <span>React 18 + TypeScript + Vite</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                <span>JWT + Bcrypt Auth Security</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
            <p>© {new Date().getFullYear()} InterviewAI Platform. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
              <span>Architected & Built with</span>
              <span className="text-rose-500 animate-pulse">❤️</span>
              <span>by</span>
              <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs">
                Mohammed
              </span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <span>Production-grade REST Architecture</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

