import React, { useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import {
  RotateCcw,
  Maximize2,
  Minimize2,
  Code2,
  Settings,
  Sparkles,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export type SupportedLanguage = 'javascript' | 'python' | 'java' | 'cpp';

interface CodeEditorProps {
  language: SupportedLanguage;
  code: string;
  onChange: (value: string) => void;
  onReset?: () => void;
  onLoadSolution?: () => void;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  isDarkTheme?: boolean;
  height?: string;
}

const LANGUAGE_LABELS: Record<
  SupportedLanguage,
  { label: string; monacoLang: string; icon: React.ComponentType<{ className?: string }> }
> = {
  javascript: { label: 'JavaScript (Node.js)', monacoLang: 'javascript', icon: Layers },
  python: { label: 'Python 3', monacoLang: 'python', icon: Code2 },
  java: { label: 'Java (OpenJDK)', monacoLang: 'java', icon: Terminal },
  cpp: { label: 'C++ (GCC)', monacoLang: 'cpp', icon: Cpu },
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  code,
  onChange,
  onReset,
  onLoadSolution,
  onLanguageChange,
  isDarkTheme = true,
  height = '100%',
}) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const handleEditorMount: OnMount = (editor, monaco) => {
    // Enable soft wrapping, smooth cursor and professional font ligature options
    editor.updateOptions({
      fontSize,
      fontFamily: "'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace",
      tabSize: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      lineNumbers: 'on',
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      padding: { top: 12, bottom: 12 },
    });
  };

  const monacoLanguage = LANGUAGE_LABELS[language]?.monacoLang || 'javascript';

  return (
    <div
      className={`flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-200 ${
        isFullscreen ? 'fixed inset-4 z-50 shadow-2xl' : 'h-full'
      }`}
    >
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
        {/* Left: Language Selector */}
        <div className="flex items-center gap-2">
          {onLanguageChange ? (
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
              {(Object.keys(LANGUAGE_LABELS) as SupportedLanguage[]).map((langKey) => {
                const info = LANGUAGE_LABELS[langKey];
                const Icon = info.icon;
                const isSelected = language === langKey;
                return (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => onLanguageChange(langKey)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{info.label.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {LANGUAGE_LABELS[language]?.label}
            </span>
          )}
        </div>

        {/* Right: Actions (Font size, Reset, Fullscreen) */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          {/* Font Size Pill */}
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
            <span className="text-[11px]">Size:</span>
            <button
              onClick={() => setFontSize((s) => Math.max(12, s - 1))}
              className="w-4 h-4 flex items-center justify-center hover:text-slate-900 dark:hover:text-white rounded"
            >
              -
            </button>
            <span className="font-mono text-slate-800 dark:text-slate-200 px-1">{fontSize}</span>
            <button
              onClick={() => setFontSize((s) => Math.min(20, s + 1))}
              className="w-4 h-4 flex items-center justify-center hover:text-slate-900 dark:hover:text-white rounded"
            >
              +
            </button>
          </div>

          {onLoadSolution && (
            <button
              type="button"
              onClick={onLoadSolution}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-300 dark:border-amber-500/30 rounded-md transition-all shadow-sm"
              title="Load optimal verified placement solution"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Load Solution</span>
            </button>
          )}

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1 px-2.5 py-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
              title="Reset to starter code"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 w-full relative min-h-[360px]">
        <Editor
          height={height}
          language={monacoLanguage}
          value={code}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorMount}
          theme={isDarkTheme ? 'vs-dark' : 'light'}
          loading={
            <div className="h-full flex items-center justify-center text-slate-400 text-sm gap-2">
              <Sparkles className="w-4 h-4 animate-spin text-brand-400" />
              <span>Loading Monaco Code Sandbox...</span>
            </div>
          }
          options={{
            fontSize,
            fontFamily: "'Fira Code', 'JetBrains Mono', 'Menlo', 'Consolas', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            lineNumbers: 'on',
            padding: { top: 12, bottom: 12 },
          }}
        />
      </div>
    </div>
  );
};

