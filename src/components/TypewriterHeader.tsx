import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Activity } from 'lucide-react';

interface TypewriterHeaderProps {
  phrases?: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

const DEFAULT_PHRASES = [
  'In Smart Referral you can...',
  'Seamlessly scan patient QR codes...',
  'Monitor hospital inventory...',
  'Securely manage medical records...',
  'Triage emergency transfers in real-time...',
  'Access offline-ready digital passes...',
];

export const TypewriterHeader: React.FC<TypewriterHeaderProps> = ({
  phrases = DEFAULT_PHRASES,
  typingSpeed = 65,
  deletingSpeed = 35,
  pauseTime = 1800,
}) => {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);

  // Blinking cursor
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 530);
    return () => clearInterval(cursorInterval);
  }, []);

  // Typing & deleting loop
  useEffect(() => {
    const fullText = phrases[phraseIndex];

    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      if (currentText.length < fullText.length) {
        timer = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length + 1));
        }, typingSpeed);
      } else {
        // Finished typing full phrase, pause then start deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      if (currentText.length > 0) {
        timer = setTimeout(() => {
          setCurrentText(fullText.substring(0, currentText.length - 1));
        }, deletingSpeed);
      } else {
        // Finished deleting, switch to next phrase
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      }
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <div className="w-full mb-5 text-center">
      {/* Dynamic Animated Typing Box */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50/90 border border-teal-200/80 shadow-xs mb-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-600"></span>
        </span>
        <span className="text-[11px] font-bold tracking-wide uppercase text-teal-900">
          Smart Referral Feature Showcase
        </span>
      </div>

      <div className="h-14 flex items-center justify-center px-4 py-1.5 rounded-2xl bg-slate-900 text-white shadow-md border border-slate-800">
        <p className="text-sm sm:text-base font-semibold tracking-tight text-teal-200 flex items-center justify-center gap-1.5 flex-wrap">
          <span className="text-white font-normal">{currentText}</span>
          <span
            className={`inline-block w-0.5 h-4 sm:h-5 bg-teal-400 transition-opacity duration-100 ${
              cursorVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </p>
      </div>
    </div>
  );
};
