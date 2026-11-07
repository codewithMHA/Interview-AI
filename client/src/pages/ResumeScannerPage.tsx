import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Copy,
  Check,
  Building2,
  Target,
  Briefcase,
  ArrowRight,
  RefreshCw,
  Award,
  Zap,
  Layers,
  ShieldCheck,
  History,
  Lightbulb,
  Upload,
  UploadCloud,
  File,
  X,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import {
  scanResume,
  fetchResumeScanHistory,
  ResumeScanData,
  ScanResumePayload,
} from '@/services/resumeService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';

const SAMPLE_RESUMES: Record<string, string> = {
  software_engineer: `MOHAMMED FAROOQ
mohammed.farooq@email.com | +91 98765 43210 | Bengaluru, India
github.com/mohammed-farooq | linkedin.com/in/mohammed-farooq

EDUCATION
National Institute of Technology (NIT) | B.Tech in Computer Science & Engineering
CGPA: 8.85 / 10.0 | Expected Graduation: June 2026

TECHNICAL SKILLS
Languages: C++, Java, Python, JavaScript, TypeScript, SQL
Frameworks: React.js, Node.js, Express, Next.js, Tailwind CSS
Databases & Tools: PostgreSQL, MongoDB, Redis, Docker, Git, REST APIs, Linux
Core Competencies: Data Structures, Algorithms, Object-Oriented Programming, System Design

PROJECTS
InterviewAI – Intelligent Placement Preparation Platform
• Architected a responsive full-stack platform using React, TypeScript, and Node.js with Monaco code sandbox.
• Integrated Judge0 code execution engine and Google Gemini AI, reducing manual code debugging time by 45%.
• Handled 10,000+ candidate session submissions with sub-100ms API response latency using Redis caching.

Distributed Task Queue & Background Job Worker
• Built an asynchronous task distribution pipeline in Python and Redis handling 5,000+ concurrent requests.
• Implemented exponential backoff retry policies, reducing job failure rate by 32%.
• Deployed microservices using Docker containers and automated CI/CD pipeline with GitHub Actions.

EXPERIENCE
Software Engineering Intern | TechNova Labs (Summer 2025)
• Developed 8 high-performance REST APIs in Express & MongoDB used by 25,000+ active enterprise users.
• Optimized slow relational queries with database indexing, cutting p95 query latency from 420ms to 68ms.
• Collaborated in an Agile Scrum team with daily standups, code reviews, and unit testing via Jest.`,

  frontend: `AARAV SHARMA
aarav.sharma@email.com | +91 91234 56789 | Hyderabad, India
github.com/aarav-sharma | portfolio-aarav.dev

EDUCATION
IIIT Hyderabad | B.Tech Computer Science | CGPA: 8.6 / 10.0 (2022 - 2026)

SKILLS
Frontend: React.js, Next.js, TypeScript, JavaScript (ES6+), Redux Toolkit, Tailwind CSS, HTML5/CSS3
Tools: Vite, Webpack, Jest, React Testing Library, Git, Figma, REST APIs, GraphQL

PROJECTS
E-Commerce Checkout & Performance Engine
• Engineered a mobile-first e-commerce checkout interface in Next.js & TypeScript with 99+ Lighthouse score.
• Reduced client bundle payload by 42% through code-splitting and dynamic component imports.
• Implemented Redux state hydration, eliminating hydration mismatch errors across 12,000+ page views.

Cloud Analytics Dashboard
• Designed interactive SVG & Canvas charting widgets rendering 50,000+ real-time telemetry points at 60 FPS.
• Integrated web worker threads for heavy mathematical computations without blocking UI thread.`,
};

export const ResumeScannerPage: React.FC = () => {
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [resumeText, setResumeText] = useState<string>('');
  const [targetRole, setTargetRole] = useState<string>('Software Engineer');
  const [targetCompany, setTargetCompany] = useState<string>('Amazon');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ResumeScanData | null>(null);
  const [scanHistory, setScanHistory] = useState<ResumeScanData[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedBulletIdx, setCopiedBulletIdx] = useState<number | null>(null);

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const history = await fetchResumeScanHistory();
      setScanHistory(history);
      if (history.length > 0 && !scanResult) {
        setScanResult(history[0]);
      }
    } catch (err) {
      console.warn('Could not load scan history:', err);
    }
  };

  const handleFileProcess = (file: File) => {
    const isPdf =
      file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage =
      file.type.startsWith('image/') ||
      /\.(png|jpe?g|webp)$/i.test(file.name);

    if (!isPdf && !isImage) {
      setErrorMessage(
        'Please upload a PDF document (.pdf) or an image (.png, .jpg, .jpeg, .webp).'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit. Please upload a smaller file.');
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setFileBase64(result);
      if (isImage) {
        setFilePreviewUrl(result);
      } else {
        setFilePreviewUrl(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileBase64(null);
    setFilePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScan = async () => {
    if (inputMode === 'file') {
      if (!selectedFile || !fileBase64) {
        setErrorMessage('Please upload a PDF or Image resume file before scanning.');
        return;
      }
    } else {
      if (!resumeText.trim() || resumeText.trim().length < 30) {
        setErrorMessage(
          'Please paste at least 30 characters of your resume or project bullets.'
        );
        return;
      }
    }

    setIsScanning(true);
    setErrorMessage(null);

    try {
      const payload: ScanResumePayload = {
        targetRole,
        targetCompany,
      };

      if (inputMode === 'file' && fileBase64) {
        payload.fileData = fileBase64;
        payload.fileName = selectedFile?.name;
        payload.fileType =
          selectedFile?.type ||
          (selectedFile?.name.toLowerCase().endsWith('.pdf')
            ? 'application/pdf'
            : 'image/png');
        if (resumeText.trim().length >= 30) {
          payload.resumeText = resumeText;
        }
      } else {
        payload.resumeText = resumeText;
      }

      const result = await scanResume(payload);
      setScanResult(result);
      setScanHistory((prev) => [result, ...prev]);
    } catch (err: any) {
      console.error('Resume scan failed:', err);
      setErrorMessage(
        err?.response?.data?.error ||
          'Failed to scan resume. Please ensure your backend is running and try again.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBulletIdx(idx);
    setTimeout(() => setCopiedBulletIdx(null), 2000);
  };

  const loadSample = (type: string) => {
    if (SAMPLE_RESUMES[type]) {
      setInputMode('text');
      setResumeText(SAMPLE_RESUMES[type]);
      setErrorMessage(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Hero Header - Responsive to Light & Dark Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-brand-950 dark:via-slate-900 dark:to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/20 dark:border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-semibold border border-brand-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Placement Resume & ATS Compatibility Engine</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Resume & ATS Placement Scanner
            </h1>

            <p className="text-xs sm:text-sm text-slate-300">
              Upload your resume as a <span className="text-brand-400 font-bold">PDF, Image, or Plain Text</span> to scan against top campus recruiter algorithms (Amazon, Google, Microsoft, TCS) with instant skill-gap detection, ATS score, and Google X-Y-Z bullet rewrites.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="p-2.5 rounded-xl bg-brand-500/20 text-brand-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">PDF & Image Multimodal AI</p>
              <p className="text-[11px] text-slate-400">Google X-Y-Z Formula Rubrics</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Input & Role Config */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-4">
          <Card className="border border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    Resume Input
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Choose file upload (PDF/Image) or paste text directly.
                  </CardDescription>
                </div>

                {/* Quick Sample Loaders */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400">Sample:</span>
                  <button
                    type="button"
                    onClick={() => loadSample('software_engineer')}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300 hover:underline"
                  >
                    SDE
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSample('frontend')}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-300 hover:underline"
                  >
                    Frontend
                  </button>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="grid grid-cols-2 gap-2 mt-3 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setInputMode('file')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    inputMode === 'file'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF / Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    inputMode === 'text'
                      ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Paste Plain Text</span>
                </button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Target Role & Company Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-brand-500" /> Target Role
                  </label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Software Engineer">Software Engineer (SDE)</option>
                    <option value="Full Stack Developer">Full Stack Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Data Engineer">Data Engineer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500" /> Target Company
                  </label>
                  <select
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Amazon">Amazon (Leadership & Impact)</option>
                    <option value="Google">Google (Algorithmic Depth & Scale)</option>
                    <option value="Microsoft">Microsoft (Clean Design & Cloud)</option>
                    <option value="Walmart">Walmart (High Concurrency & SQL)</option>
                    <option value="TCS Digital">TCS Digital / Prime (Core CS)</option>
                    <option value="General Tier-1">General Tier-1 Product Company</option>
                  </select>
                </div>
              </div>

              {/* Input Mode 1: File Upload (PDF / Image) */}
              {inputMode === 'file' ? (
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {!selectedFile ? (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
                        isDragging
                          ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 scale-[1.01]'
                          : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 bg-slate-50/50 dark:bg-slate-900/50'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Click to upload or drag & drop resume
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Supports <strong>PDF</strong> documents and <strong>PNG, JPG, WEBP</strong> images (max 10MB)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="outline" size="sm" className="font-mono text-[10px]">.PDF</Badge>
                        <Badge variant="outline" size="sm" className="font-mono text-[10px]">.PNG</Badge>
                        <Badge variant="outline" size="sm" className="font-mono text-[10px]">.JPG</Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0">
                            {selectedFile.type.includes('pdf') ||
                            selectedFile.name.toLowerCase().endsWith('.pdf') ? (
                              <File className="w-5 h-5 text-rose-500" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                              {selectedFile.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {formatFileSize(selectedFile.size)} ·{' '}
                              <span className="text-emerald-500 font-semibold">Ready for ATS scan</span>
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={clearFile}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Image Thumbnail Preview if image */}
                      {filePreviewUrl && (
                        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-48 flex items-center justify-center bg-black/5 dark:bg-black/30">
                          <img
                            src={filePreviewUrl}
                            alt="Resume preview"
                            className="object-contain max-h-48 w-full"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        <span>Multimodal AI will read document layout directly</span>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                        >
                          Change File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Input Mode 2: Plain Text */
                <div className="space-y-1.5">
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume contents, education, technical skills, projects, and work experience here..."
                    rows={12}
                    className="w-full text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{resumeText.length} characters</span>
                    <span>Minimum 30 characters</span>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <Button
                size="md"
                variant="primary"
                className="w-full gap-2 shadow-md"
                onClick={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing ATS Compatibility & Skills...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>
                      {inputMode === 'file' && selectedFile
                        ? `Scan ${selectedFile.name.length > 20 ? 'File' : selectedFile.name} with AI`
                        : 'Run AI ATS Resume Scan'}
                    </span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Past Scans History Drawer */}
          {scanHistory.length > 1 && (
            <Card className="border border-slate-200 dark:border-slate-800">
              <CardHeader className="py-3">
                <CardTitle className="text-xs flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  Recent Scans History
                </CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-slate-100 dark:divide-slate-800 text-xs py-0">
                {scanHistory.slice(0, 4).map((scan, idx) => (
                  <div
                    key={idx}
                    onClick={() => setScanResult(scan)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:text-brand-600 transition-colors"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {scan.targetRole} · {scan.targetCompany}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {scan.fileInfo?.fileName ? `📄 ${scan.fileInfo.fileName} · ` : ''}
                        {scan.createdAt ? new Date(scan.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-brand-600 dark:text-brand-400">
                        {scan.overallScore}%
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 3. Results Section */}
        <div className="lg:col-span-6 space-y-4">
          {scanResult ? (
            <>
              {/* ATS Score Overview Card */}
              <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-900 dark:from-brand-900 dark:via-indigo-900 dark:to-slate-900 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase font-bold tracking-wider text-brand-300">
                        ATS Compatibility Score
                      </p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-extrabold text-white">
                          {scanResult.overallScore}%
                        </span>
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {scanResult.overallScore >= 80
                            ? 'Top 10% Ready'
                            : scanResult.overallScore >= 60
                            ? 'Competitive'
                            : 'Needs Polish'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <Badge variant="purple" size="md">
                        {scanResult.targetCompany}
                      </Badge>
                      <p className="text-[11px] text-slate-300 mt-1">
                        {scanResult.targetRole}
                      </p>
                      {scanResult.fileInfo?.fileName && (
                        <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end gap-1">
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[120px]">{scanResult.fileInfo.fileName}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Summary Feedback */}
                  <p className="text-xs text-slate-200 mt-3 bg-white/10 p-3 rounded-xl border border-white/10 leading-relaxed">
                    {scanResult.summaryFeedback}
                  </p>
                </div>

                <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Skills Match</p>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                      {scanResult.skillsAnalysis.matchPercentage}%
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Action Verbs</p>
                    <p className="text-base font-extrabold text-brand-600 dark:text-brand-400">
                      {scanResult.atsCompatibility.actionVerbsScore}%
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Metrics Included</p>
                    <p className="text-base font-extrabold text-amber-500">
                      {scanResult.atsCompatibility.quantifiableMetricsPresent ? '✓ Yes' : '✗ No'}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Company Fit</p>
                    <p className="text-base font-extrabold text-purple-500">
                      {scanResult.companyAlignment.alignmentScore}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Skills Gap Analysis Card */}
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-500" />
                    Skills & Keyword Match Analysis
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Matched keywords found in your resume vs high-value skills expected by campus recruiters.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                      ✓ Detected Skills in Your Resume ({scanResult.skillsAnalysis.matchedSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scanResult.skillsAnalysis.matchedSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {scanResult.skillsAnalysis.missingSkills.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block mb-1.5">
                        ⚠️ High-Yield Missing Skills for {scanResult.targetRole}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scanResult.skillsAnalysis.missingSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          >
                            + {skill}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Adding these keywords in project descriptions will directly increase your ATS ranking score.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Google X-Y-Z Bullet Point Optimizer */}
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        Google X-Y-Z Bullet Point Optimizer
                      </CardTitle>
                      <CardDescription className="text-xs">
                        "Accomplished [X] as measured by [Y] by doing [Z]" – Google's golden recruitment formula.
                      </CardDescription>
                    </div>
                    <Badge variant="purple" size="sm">
                      Google Formula
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {scanResult.bulletImprovements.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Before (Weak / Passive):
                        </span>
                        <p className="text-slate-600 dark:text-slate-400 line-through">
                          "{bullet.original}"
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                            ✓ Google X-Y-Z Rewrite:
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(bullet.improved, idx)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline"
                          >
                            {copiedBulletIdx === idx ? (
                              <>
                                <Check className="w-3 h-3" /> Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                        <p className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                          "{bullet.improved}"
                        </p>
                      </div>

                      <p className="text-[10px] text-slate-400">
                        <strong>Why it works:</strong> {bullet.reason}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Company Alignment & Recruiter Insight */}
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      {scanResult.targetCompany} Hiring Bar Evaluation
                    </CardTitle>
                    <Badge variant="brand" size="sm">
                      {scanResult.companyAlignment.alignmentScore}% Match
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-1">
                    <span className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Recruiter Expectation:
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {scanResult.companyAlignment.feedback}
                    </p>
                  </div>

                  {scanResult.companyAlignment.missingCompanyKeywords.length > 0 && (
                    <div className="space-y-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                        Keywords {scanResult.targetCompany} Recruiter Looks For:
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {scanResult.companyAlignment.missingCompanyKeywords.map((kw, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actionable ATS Checklist */}
              <Card className="border border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Actionable ATS Fixes Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  {scanResult.checklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5"
                    >
                      {item.status === 'passed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {item.item}
                          </span>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                              item.priority === 'High'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {item.priority} Priority
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="h-full min-h-[400px] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                No Resume Scanned Yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
                Upload your PDF or Image resume, or paste text to test how the AI scans skills, formats ATS scores, and rewrites bullets with the Google X-Y-Z formula.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadSample('software_engineer')}
              >
                Load Sample SDE Resume
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeScannerPage;
