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
    <div className="w-full mb-4 text-center">
      {/* Clean blended typing text with high contrast */}
      <div className="min-h-[32px] flex items-center justify-center px-3 py-1">
        <p className="text-xs sm:text-sm font-semibold tracking-tight text-slate-700 flex items-center justify-center gap-1 flex-wrap">
          <span className="text-slate-900 font-bold">{currentText}</span>
          <span
            className={`inline-block w-0.5 h-4 bg-teal-600 transition-opacity duration-100 ${
              cursorVisible ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </p>
      </div>
    </div>
  );
};
