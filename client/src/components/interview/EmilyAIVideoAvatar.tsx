import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Radio, RotateCcw, Sparkles, Video, Eye } from 'lucide-react';

interface EmilyAIVideoAvatarProps {
  conversationState: 'connecting' | 'interviewer_speaking' | 'listening' | 'evaluating';
  avatarUrl?: string;
  name?: string;
  role?: string;
  onRepeatQuestion?: () => void;
}

export const EmilyAIVideoAvatar: React.FC<EmilyAIVideoAvatarProps> = ({
  conversationState,
  avatarUrl = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80',
  name = 'Emily Zhou',
  role = 'Senior Software Engineer (Amazon)',
  onRepeatQuestion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const [avatarMode, setAvatarMode] = useState<'animated_ai' | 'live_stream'>('animated_ai');

  // Animation timeline state
  const stateRef = useRef({
    time: 0,
    blinkProgress: 0,
    lastBlinkTime: 0,
    mouthOpen: 0,
    mouthWidth: 0,
    headTilt: 0,
    headNod: 0,
    isSpeaking: false,
    isListening: false,
  });

  stateRef.current.isSpeaking = conversationState === 'interviewer_speaking';
  stateRef.current.isListening = conversationState === 'listening';

  // Load avatar image into offscreen image object
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = avatarUrl;
    img.onload = () => {
      imageRef.current = img;
      setIsImageLoaded(true);
    };
  }, [avatarUrl]);

  // 60 FPS Neural Animation Loop on HTML5 Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let startTime = performance.now();

    const renderFrame = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const s = stateRef.current;
      s.time = elapsed;

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // 1. Natural Breathing & Head Motion
      // Subtle continuous breathing drift (Math.sin)
      const breath = Math.sin(elapsed * 1.5) * 2;
      
      // Listening Nod: periodically nod gently to candidate answers
      if (s.isListening) {
        const nodCycle = (elapsed % 4.5);
        if (nodCycle < 0.8) {
          s.headNod = Math.sin(nodCycle * Math.PI / 0.8) * 4;
        } else {
          s.headNod = 0;
        }
        s.headTilt = Math.sin(elapsed * 0.8) * 0.015;
      } else if (s.isSpeaking) {
        // Natural speech head articulation
        s.headNod = Math.sin(elapsed * 4.2) * 2.5 + Math.sin(elapsed * 2.1) * 1.5;
        s.headTilt = Math.sin(elapsed * 2.8) * 0.02;
      } else {
        s.headNod = breath;
        s.headTilt = 0;
      }

      // 2. Eye Blink Controller (Natural blink every ~3.8 seconds for 160ms)
      if (now - s.lastBlinkTime > 3800) {
        s.blinkProgress = 1;
        s.lastBlinkTime = now;
      }
      if (s.blinkProgress > 0) {
        s.blinkProgress -= 0.12;
        if (s.blinkProgress < 0) s.blinkProgress = 0;
      }

      // 3. Dynamic Mouth / Viseme Opening & Articulation Controller
      if (s.isSpeaking) {
        // Natural speech frequency modulation (open, wide, compress vowels)
        const v1 = Math.sin(elapsed * 14);
        const v2 = Math.cos(elapsed * 22);
        const rawMouth = Math.max(0, (v1 * 0.6 + v2 * 0.4 + 0.3));
        s.mouthOpen = s.mouthOpen * 0.4 + rawMouth * 0.6; // smooth lerp
        s.mouthWidth = 1 + Math.sin(elapsed * 8) * 0.15;
      } else {
        s.mouthOpen = s.mouthOpen * 0.7; // close mouth smoothly
        s.mouthWidth = 1;
      }

      // 4. Render Base Portrait with Head Tilt and Nod
      ctx.save();
      ctx.translate(w / 2, h / 2 + s.headNod);
      ctx.rotate(s.headTilt);

      if (imageRef.current && isImageLoaded) {
        const img = imageRef.current;
        const scale = Math.max(w / img.width, h / img.height);
        const imgW = img.width * scale;
        const imgH = img.height * scale;
        ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH);
      } else {
        // Fallback gradient if image is still downloading
        const grad = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
        grad.addColorStop(0, '#1e2038');
        grad.addColorStop(1, '#0c0d18');
        ctx.fillStyle = grad;
        ctx.fillRect(-w / 2, -h / 2, w, h);
      }

      // 5. Dynamic Eye Blink Overlay
      if (s.blinkProgress > 0.05) {
        const eyeY = -h * 0.08;
        const leftEyeX = -w * 0.11;
        const rightEyeX = w * 0.11;
        const eyeW = w * 0.09;
        const eyeH = h * 0.04 * s.blinkProgress;

        ctx.fillStyle = 'rgba(168, 126, 105, 0.95)';
        // Left Eye Lid
        ctx.beginPath();
        ctx.ellipse(leftEyeX, eyeY, eyeW / 2, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Right Eye Lid
        ctx.beginPath();
        ctx.ellipse(rightEyeX, eyeY, eyeW / 2, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyelash contour
        ctx.strokeStyle = 'rgba(40, 24, 18, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // 6. Realistic Animated Mouth / Visemes Overlay
      if (s.mouthOpen > 0.08) {
        const mouthX = 0;
        const mouthY = h * 0.12;
        const openH = s.mouthOpen * (h * 0.038);
        const openW = (w * 0.09) * s.mouthWidth;

        // Outer Lip Shadow & Contour
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, openW, openH * 1.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(150, 45, 45, 0.35)';
        ctx.filter = 'blur(2px)';
        ctx.fill();
        ctx.restore();

        // Inner Mouth Cavity
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY, openW * 0.85, openH, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#3a0c0e';
        ctx.fill();

        // Visible Upper Teeth
        if (s.mouthOpen > 0.3) {
          ctx.beginPath();
          ctx.ellipse(mouthX, mouthY - openH * 0.45, openW * 0.65, openH * 0.35, 0, 0, Math.PI);
          ctx.fillStyle = '#f8f4eb';
          ctx.fill();
        }

        // Visible Lower Lip Definition
        ctx.beginPath();
        ctx.ellipse(mouthX, mouthY + openH * 0.6, openW * 0.9, openH * 0.4, 0, 0, Math.PI);
        ctx.fillStyle = 'rgba(215, 110, 110, 0.55)';
        ctx.fill();
      }

      ctx.restore();

      // 7. Video Call Subtle Scanline & Studio Lighting Filter
      ctx.fillStyle = 'rgba(12, 14, 25, 0.06)';
      for (let y = 0; y < h; y += 4) {
        ctx.fillRect(0, y, w, 1);
      }

      animFrameIdRef.current = requestAnimationFrame(renderFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isImageLoaded]);

  return (
    <div className="rounded-2xl border border-slate-700/80 bg-[#12131f] overflow-hidden shadow-2xl shrink-0 ring-1 ring-slate-800 flex flex-col">
      {/* Aspect Video Call Frame */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        
        {/* Render Canvas for Real-Time Animated AI Avatar */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Top Video Call Bar: [● 1080p AI VIDEO STREAM] & [60 FPS · 18ms] */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                conversationState === 'interviewer_speaking'
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-emerald-400 animate-pulse'
              } shadow-[0_0_8px_#34d399]`}
            />
            <span className="text-[10px] font-bold text-white tracking-wider flex items-center gap-1">
              <span>1080p AI VIDEO</span>
              <Sparkles className="w-2.5 h-2.5 text-amber-300" />
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md border border-slate-800 text-[9px] font-mono text-slate-300">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            <span>60 FPS · 18ms</span>
          </div>
        </div>

        {/* Bottom Audio/Speaking State Overlay */}
        {conversationState === 'interviewer_speaking' && (
          <>
            <div className="absolute inset-0 border-2 border-emerald-400/90 rounded-2xl pointer-events-none shadow-[inset_0_0_24px_rgba(52,211,153,0.3)] z-10" />
            
            <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto z-20">
              <div className="flex items-end gap-1 px-3 py-1.5 rounded-full bg-black/90 backdrop-blur-md border border-emerald-500/40 shadow-lg">
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-1 h-3.5" />
                <span className="w-1 bg-emerald-300 rounded-full wave-bar-2 h-5" />
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-3 h-3" />
                <span className="w-1 bg-emerald-300 rounded-full wave-bar-4 h-4.5" />
                <span className="w-1 bg-emerald-400 rounded-full wave-bar-5 h-2.5" />
                <span className="text-[10px] font-bold text-emerald-300 ml-1.5 uppercase tracking-wider">
                  Speaking Live
                </span>
              </div>

              {onRepeatQuestion && (
                <button
                  onClick={onRepeatQuestion}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-lg transition-transform hover:scale-105 active:scale-95"
                  title="Replay Emily's voice"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              )}
            </div>
          </>
        )}

        {/* Attentive Listening State when Candidate Speaks */}
        {conversationState === 'listening' && (
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-auto z-20">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-slate-700/80 text-[10px] font-medium text-emerald-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
              <span>Nodding · Listening to you</span>
            </div>

            {onRepeatQuestion && (
              <button
                onClick={onRepeatQuestion}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors"
                title="Repeat Question"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Repeat</span>
              </button>
            )}
          </div>
        )}

        {/* Evaluating State */}
        {conversationState === 'evaluating' && (
          <div className="absolute bottom-2.5 left-2.5 flex items-center gap-2 px-3 py-1 rounded-full bg-black/85 backdrop-blur-md border border-indigo-500/40 text-[10px] font-semibold text-indigo-300 z-20 shadow-md">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>Analyzing Technical Architecture...</span>
          </div>
        )}
      </div>

      {/* Video Call Nameplate & Status Pill */}
      <div className="p-3 bg-[#11121d] flex items-center justify-between border-t border-slate-800">
        <div>
          <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
            <span>{name}</span>
            <span className="text-[10px] font-normal text-slate-400">· Amazon</span>
          </h3>
          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{role}</p>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
            conversationState === 'interviewer_speaking'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
              : conversationState === 'listening'
              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
              : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}
        >
          {conversationState === 'interviewer_speaking'
            ? '● Speaking'
            : conversationState === 'listening'
            ? '● Listening'
            : '● Analyzing'}
        </span>
      </div>
    </div>
  );
};

