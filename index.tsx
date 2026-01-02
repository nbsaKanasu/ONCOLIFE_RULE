import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { SYMPTOMS, SymptomDef, Question, ActionLevel, isHigherSeverity, InputType } from "./symptoms";

// --- Types & Interfaces (UI Specific) ---

type SymptomStatus = 'checking' | 'safe' | 'alert' | 'emergency';
type FontScale = 'small' | 'normal' | 'large' | 'xlarge';
type FilterCategory = 'all' | 'digestive' | 'pain' | 'respiratory' | 'neurological' | 'skin' | 'general';

// Session history for "Recently Checked"
interface SessionHistory {
  symptomId: string;
  timestamp: number;
  result: ActionLevel;
}

// --- Accessibility: Font Size Hook ---
const useFontScale = () => {
  const [fontScale, setFontScale] = useState<FontScale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('oncolife-font-scale') as FontScale) || 'normal';
    }
    return 'normal';
  });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('font-scale-small', 'font-scale-normal', 'font-scale-large', 'font-scale-xlarge');
    html.classList.add(`font-scale-${fontScale}`);
    localStorage.setItem('oncolife-font-scale', fontScale);
  }, [fontScale]);

  return { fontScale, setFontScale };
};

// --- Dark Mode Hook ---
const useDarkMode = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('oncolife-dark-mode');
      if (stored !== null) return stored === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('oncolife-dark-mode', String(isDark));
  }, [isDark]);

  return { isDark, setIsDark, toggleDark: () => setIsDark(prev => !prev) };
};

// --- Session History Hook ---
const useSessionHistory = () => {
  const [history, setHistory] = useState<SessionHistory[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('oncolife-session-history');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          // Only keep last 30 days
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
          return parsed.filter((h: SessionHistory) => h.timestamp > thirtyDaysAgo);
        } catch { return []; }
      }
    }
    return [];
  });

  const addToHistory = (symptomId: string, result: ActionLevel) => {
    setHistory(prev => {
      const updated = [{ symptomId, timestamp: Date.now(), result }, ...prev.filter(h => h.symptomId !== symptomId)].slice(0, 20);
      localStorage.setItem('oncolife-session-history', JSON.stringify(updated));
      return updated;
    });
  };

  const getLastAssessmentDate = (): string | null => {
    if (history.length === 0) return null;
    const date = new Date(history[0].timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('oncolife-session-history');
  };

  return { history, addToHistory, getLastAssessmentDate, clearHistory };
};

// --- Professional Medical SVG Icons ---
const MedicalIcons = {
  Stethoscope: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  ),
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  ChartBar: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  ),
  Clipboard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  Beaker: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  Share: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  Printer: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
    </svg>
  ),
};

// --- Confirmation Dialog Component ---
const ConfirmDialog: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}> = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant = 'warning' }) => {
  if (!isOpen) return null;
  
  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-slate-700 hover:bg-slate-800',
    info: 'bg-slate-600 hover:bg-slate-700'
  };

  return (
    <div className="dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <h3 id="dialog-title" className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6 text-sm">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-md border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-md font-medium text-white transition-colors text-sm ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Accessibility: Screen Reader Announcements ---
const ScreenReaderAnnounce: React.FC<{ message: string; assertive?: boolean }> = ({ message, assertive = false }) => (
  <div
    role="status"
    aria-live={assertive ? "assertive" : "polite"}
    aria-atomic="true"
    className="sr-only"
  >
    {message}
  </div>
);

// --- Components ---

interface Message {
  id: string;
  sender: 'bot' | 'user';
  content: string | React.ReactNode;
  isAlert?: boolean;
  isSystem?: boolean;
  symptomId?: string;
  symptomStatus?: SymptomStatus;
}

const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isBot = message.sender === 'bot';
  
  // Professional status indicators
  const getStatusInfo = (status?: SymptomStatus) => {
    switch(status) {
      case 'checking': return { label: 'In Progress', badgeClass: 'badge-info' };
      case 'safe': return { label: 'Complete - No Action Required', badgeClass: 'badge-safe' };
      case 'alert': return { label: 'Alert - Care Team Notified', badgeClass: 'badge-alert' };
      case 'emergency': return { label: 'Emergency', badgeClass: 'badge-emergency' };
      default: return { label: '', badgeClass: 'bg-slate-100 text-slate-600 border border-slate-200' };
    }
  };
  
  if (message.isSystem) {
    const statusInfo = getStatusInfo(message.symptomStatus);
    return (
      <div className="flex w-full justify-center mb-3 animate-fade-in px-4" role="status" aria-label={statusInfo.label}>
         <span className={`text-xs px-3 py-1.5 rounded-md font-medium flex items-center ${statusInfo.badgeClass}`}>
            {message.symptomStatus === 'checking' && (
              <span className="mr-2 animate-pulse" aria-hidden="true"><MedicalIcons.Clock /></span>
            )}
            {message.symptomStatus === 'safe' && (
              <span className="mr-2" aria-hidden="true"><MedicalIcons.CheckCircle /></span>
            )}
            {message.symptomStatus === 'alert' && (
              <span className="mr-2" aria-hidden="true"><MedicalIcons.AlertTriangle /></span>
            )}
            {message.symptomStatus === 'emergency' && (
              <span className="mr-2" aria-hidden="true"><MedicalIcons.AlertTriangle /></span>
            )}
            {message.content}
         </span>
      </div>
    );
  }

  return (
    <div 
      className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} mb-4 animate-fade-in`}
      role="log"
      aria-label={isBot ? 'Ruby says' : 'Your response'}
    >
      {isBot && (
        <div className="ruby-avatar mr-3 shrink-0" aria-hidden="true">R</div>
      )}
      <div className={`max-w-[80%] leading-relaxed ${
        message.isAlert 
          ? 'bg-red-50 border border-red-200 text-red-900 p-4 rounded-2xl' 
          : isBot 
            ? 'ruby-bubble text-white text-sm' 
            : 'bg-stone-100 text-stone-800 p-4 rounded-2xl rounded-tr-sm text-sm'
      }`}>
        {isBot && !message.isAlert && (
          <span className="text-teal-200 text-xs font-medium block mb-1">Ruby</span>
        )}
        {message.isAlert && <span className="sr-only">Alert: </span>}
        {message.content}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex w-full justify-start mb-4">
    <div className="ruby-avatar mr-3 shrink-0" aria-hidden="true">R</div>
    <div className="ruby-bubble flex space-x-1.5 items-center h-12 px-5">
      <div className="w-2 h-2 bg-white/60 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-white/60 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-white/60 rounded-full typing-dot"></div>
    </div>
  </div>
);

const SymptomCard: React.FC<{ 
    symptom: SymptomDef, 
    onClick: (id: string) => void, 
    variant: 'emergency' | 'common' | 'other', 
    result?: ActionLevel,
    isMultiSelectMode: boolean,
    isSelected: boolean
}> = ({ symptom, onClick, variant, result, isMultiSelectMode, isSelected }) => {
    // Professional medical card styling
    const baseClasses = "medical-card p-4 transition-all duration-200 flex flex-col justify-between w-full text-left group relative min-h-[130px]";
    const styles = {
        emergency: "hover:border-red-300",
        common: "hover:border-slate-400",
        other: "hover:border-slate-400"
    };
    
    const selectedStyle = isSelected ? "ring-2 ring-teal-500 bg-teal-50" : "";
    
    const iconBg = variant === 'emergency' 
      ? 'bg-red-50 text-red-600' 
      : 'bg-teal-50 text-teal-600';

    // Result badge styling
    const getResultBadge = (res: ActionLevel) => {
      switch(res) {
        case 'call_911': return { text: 'Emergency', className: 'badge-emergency' };
        case 'notify_care_team': return { text: 'Alert', className: 'badge-alert' };
        case 'refer_provider': return { text: 'Consult', className: 'badge-info' };
        default: return { text: 'Complete', className: 'badge-safe' };
      }
    };
    
    let badge = null;
    if (result) {
        const resultInfo = getResultBadge(result);
        badge = (
          <span className={`absolute top-3 right-3 text-[10px] font-medium px-2 py-1 rounded ${resultInfo.className}`}>
            {resultInfo.text}
          </span>
        );
    }
    
    const ariaLabel = [
      symptom.name,
      variant === 'emergency' ? 'Urgent assessment' : 'Standard assessment',
      result ? getResultBadge(result).text : '',
      isMultiSelectMode ? (isSelected ? 'Selected' : 'Not selected') : 'Click to assess'
    ].filter(Boolean).join('. ');

    return (
        <button 
          onClick={() => onClick(symptom.id)} 
          className={`${baseClasses} ${styles[variant]} ${selectedStyle}`}
          aria-label={ariaLabel}
          aria-pressed={isMultiSelectMode ? isSelected : undefined}
          role={isMultiSelectMode ? "checkbox" : "button"}
        >
            {badge}
            {isMultiSelectMode && (
                 <div 
                   className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-teal-600 border-teal-600' : 'border-stone-300 bg-white'}`}
                   aria-hidden="true"
                 >
                     {isSelected && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </div>
            )}
            <div className="flex justify-between items-start w-full">
                 <div className={`p-2.5 rounded-lg ${iconBg}`} aria-hidden="true">
                    {symptom.icon}
                </div>
                {!result && !isMultiSelectMode && (
                    <div className="w-6 h-6 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" aria-hidden="true">
                        <MedicalIcons.ArrowRight />
                    </div>
                )}
            </div>
            <div className="mt-3">
                <span className="font-semibold text-slate-800 text-base block leading-tight mb-0.5">{symptom.name}</span>
                <span className="text-[11px] text-slate-500 font-medium">
                  {variant === 'emergency' ? 'Urgent Assessment' : 'Standard Assessment'}
                </span>
            </div>
        </button>
    );
};

const ProgressBar: React.FC<{ stage: string }> = ({ stage }) => {
  const steps = [
    { id: 'screening', label: 'Triage', active: stage === 'screening' || stage === 'followup' || stage === 'complete' },
    { id: 'followup', label: 'Assess', active: stage === 'followup' || stage === 'complete' },
    { id: 'complete', label: 'Result', active: stage === 'complete' }
  ];

  // Find current step for screen readers
  const currentStep = steps.findIndex(s => 
    (s.id === 'screening' && stage === 'screening') ||
    (s.id === 'followup' && stage === 'followup') ||
    (s.id === 'complete' && stage === 'complete')
  ) + 1;

  return (
    <nav 
      className="w-full max-w-xs mx-auto mb-4 px-6"
      aria-label={`Assessment progress: Step ${currentStep} of ${steps.length}`}
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={steps.length}
    >
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1.5 left-0 w-full h-0.5 bg-slate-200 -z-10" aria-hidden="true"></div>
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2 z-10">
             <div 
               className={`w-3 h-3 rounded-full border-[3px] transition-colors duration-500 ${step.active ? 'bg-white border-teal-600 box-content' : 'bg-slate-200 border-slate-200'}`}
               aria-hidden="true"
             ></div>
             <span 
               className={`text-[9px] font-bold mt-1 uppercase tracking-wider transition-colors duration-300 ${step.active ? 'text-teal-700' : 'text-slate-300'}`}
               aria-current={step.id === stage ? 'step' : undefined}
             >
               {step.label}
             </span>
          </div>
        ))}
      </div>
    </nav>
  );
};

// --- Accessibility: Font Size Selector Component ---
const FontSizeSelector: React.FC<{ fontScale: FontScale; setFontScale: (scale: FontScale) => void }> = ({ fontScale, setFontScale }) => {
  const sizes: { value: FontScale; label: string; icon: string }[] = [
    { value: 'small', label: 'Small text', icon: 'A' },
    { value: 'normal', label: 'Normal text', icon: 'A' },
    { value: 'large', label: 'Large text', icon: 'A' },
    { value: 'xlarge', label: 'Extra large text', icon: 'A' },
  ];

  return (
    <div 
      className="flex items-center space-x-1 bg-slate-100 rounded-lg p-1"
      role="group"
      aria-label="Text size selector"
    >
      {sizes.map((size, idx) => (
        <button
          key={size.value}
          onClick={() => setFontScale(size.value)}
          className={`px-2 py-1 rounded transition-all font-bold ${
            fontScale === size.value 
              ? 'bg-white text-teal-700 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
          style={{ fontSize: `${10 + idx * 2}px` }}
          aria-label={size.label}
          aria-pressed={fontScale === size.value}
          title={size.label}
        >
          {size.icon}
        </button>
      ))}
    </div>
  );
};

// --- Logic Hook ---

const useSymptomChecker = () => {
  const [history, setHistory] = useState<Message[]>([]);
  const [currentSymptomId, setCurrentSymptomId] = useState<string | null>(null);
  const [currentSymptomMsgId, setCurrentSymptomMsgId] = useState<string | null>(null);
  const [stage, setStage] = useState<'emergency_prescreen' | 'selection' | 'screening' | 'followup' | 'complete'>('emergency_prescreen');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Local answers for current module
  const [answers, setAnswers] = useState<Record<string, any>>({});
  // Global answers to persist shared data across modules
  const [globalAnswers, setGlobalAnswers] = useState<Record<string, any>>({});
  
  const [visitedSymptoms, setVisitedSymptoms] = useState<string[]>([]);
  const [symptomQueue, setSymptomQueue] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [highestSeverity, setHighestSeverity] = useState<ActionLevel>('none');
  const [triageReasons, setTriageReasons] = useState<string[]>([]);
  
  const [symptomResults, setSymptomResults] = useState<Record<string, ActionLevel>>({});
  
  // Emergency prescreen state
  const [prescreenComplete, setPrescreenComplete] = useState(false);
  const [emergencyTriggered, setEmergencyTriggered] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState<string>('');

  const addMessage = (text: string | React.ReactNode, sender: 'bot' | 'user', isAlert = false, isSystem = false, symptomId?: string, symptomStatus?: SymptomStatus) => {
    const id = Date.now().toString();
    setHistory(prev => [...prev, { id, sender, content: text, isAlert, isSystem, symptomId, symptomStatus }]);
    return id;
  };

  const updateTriage = (level: ActionLevel, reason?: string) => {
      setHighestSeverity(prev => isHigherSeverity(prev, level) ? level : prev);
      if (reason) {
          setTriageReasons(prev => {
              if (prev.includes(reason)) return prev;
              return [...prev, reason];
          });
      }
      if (currentSymptomId) {
          setSymptomResults(prev => {
              const current = prev[currentSymptomId] || 'none';
              return { ...prev, [currentSymptomId]: isHigherSeverity(current, level) ? level : current };
          });
      }
  };

  const startSession = (symptomIds: string[]) => {
      // Priority Routing: If both Nausea (NAU-203) and Vomiting (VOM-204) are selected,
      // process Vomiting first as per oncologist requirement
      const priorityOrder: Record<string, number> = {
          'VOM-204': 1,  // Vomiting should come before Nausea
          'NAU-203': 2,  // Nausea comes after Vomiting
      };
      
      const sortedIds = [...symptomIds].sort((a, b) => {
          const aPriority = priorityOrder[a] ?? 999;
          const bPriority = priorityOrder[b] ?? 999;
          return aPriority - bPriority;
      });
      
      setSymptomQueue(sortedIds);
      if (sortedIds.length > 0) {
          const firstId = sortedIds[0];
          startSymptomLogic(firstId);
      }
  };

  // Helper to find the next unanswered, valid question
  const findNextUnansweredQuestion = (list: Question[], startIndex: number, currentAnswers: Record<string, any>): number => {
      let idx = startIndex;
      while(idx < list.length) {
          const q = list[idx];
          const hasAnswer = currentAnswers.hasOwnProperty(q.id);
          const conditionMet = !q.condition || q.condition(currentAnswers);
          
          // If condition is met AND we don't have an answer yet, this is the one
          if (conditionMet && !hasAnswer) {
              return idx;
          }
          idx++;
      }
      return -1; // No questions left to ask
  };

  const startSymptomLogic = (symptomId: string, transitionReason?: string) => {
    if (visitedSymptoms.includes(symptomId)) {
        addMessage(`(We've already reviewed ${SYMPTOMS[symptomId].name} — moving on)`, 'bot', false, true);
        completeSingleSymptom();
        return;
    }

    const symptom = SYMPTOMS[symptomId];
    setCurrentSymptomId(symptomId);
    setStage('screening');
    
    // Initialize answers with global knowledge
    const initialAnswers = { ...globalAnswers };
    setAnswers(initialAnswers);
    
    setVisitedSymptoms(prev => [...prev, symptomId]);
    setSymptomResults(prev => ({ ...prev, [symptomId]: 'none' })); 
    
    // Warmer transition message if branching
    if (transitionReason) {
        addMessage(transitionReason, 'bot');
    }
    
    const msgId = addMessage(`Let's talk about: ${symptom.name}`, 'bot', false, true, symptomId, 'checking');
    setCurrentSymptomMsgId(msgId);
    
    // Determine start index by skipping already answered questions
    const startIdx = findNextUnansweredQuestion(symptom.screeningQuestions, 0, initialAnswers);

    if (startIdx !== -1) {
        setCurrentQuestionIndex(startIdx);
        setIsTyping(true);
        setTimeout(() => {
            setIsTyping(false);
            askQuestion(symptom.screeningQuestions[startIdx]);
        }, 600);
    } else {
        // All screening questions answered globally, run evaluation immediately
        setTimeout(() => runScreeningEvaluation(initialAnswers), 100);
    }
  };

  const askQuestion = (q: Question) => {
    addMessage(q.text, 'bot');
  };

  const handleAnswer = (answer: any) => {
    if (!currentSymptomId) return;
    
    const symptom = SYMPTOMS[currentSymptomId];
    const currentQList = stage === 'screening' ? symptom.screeningQuestions : symptom.followUpQuestions;
    if (!currentQList) return;
    const currentQ = currentQList[currentQuestionIndex];
    
    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);
    
    // Update global answers persistence
    setGlobalAnswers(prev => ({ ...prev, [currentQ.id]: answer }));

    let displayAnswer = answer;
    if (currentQ.type === 'yes_no') displayAnswer = answer ? 'Yes' : 'No';
    if (currentQ.type === 'choice') displayAnswer = currentQ.options?.find(o => o.value === answer)?.label || answer;
    if (Array.isArray(answer)) displayAnswer = answer.join(', ') || 'None';
    addMessage(displayAnswer, 'user');

    if (stage === 'screening') {
        const result = symptom.evaluateScreening(newAnswers);
        
        if (result.action === 'stop' || result.triageLevel === 'call_911') {
            if (result.triageLevel) updateTriage(result.triageLevel, result.triageMessage);
            if (result.action === 'stop' && result.triageLevel === 'none' && result.triageMessage) {
                 addMessage(result.triageMessage, 'bot');
            }
            completeSingleSymptom();
            return;
        }
        
        if (result.triageLevel && isHigherSeverity(highestSeverity, result.triageLevel)) {
             updateTriage(result.triageLevel, result.triageMessage);
        }
    }

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      // Determine next question index using Logic Engine and Global Skip
      const nextIdx = findNextUnansweredQuestion(currentQList, currentQuestionIndex + 1, newAnswers);
      
      if (nextIdx !== -1) {
        setCurrentQuestionIndex(nextIdx);
        askQuestion(currentQList[nextIdx]);
      } else {
        if (stage === 'screening') runScreeningEvaluation(newAnswers);
        else runFollowUpEvaluation(newAnswers);
      }
    }, 600);
  };

  const runScreeningEvaluation = (finalAnswers: Record<string, any>) => {
    if (!currentSymptomId) return;
    const symptom = SYMPTOMS[currentSymptomId];
    const result = symptom.evaluateScreening(finalAnswers);

    if (result.triageLevel && result.triageMessage) {
        updateTriage(result.triageLevel, result.triageMessage);
    }

    if (result.action === 'stop' || result.triageLevel === 'call_911') {
        completeSingleSymptom();
        return;
    }
    
    if (result.action === 'branch' && result.branchToSymptomId) {
        if (!visitedSymptoms.includes(result.branchToSymptomId)) {
             const branchName = SYMPTOMS[result.branchToSymptomId].name;
             addMessage(`Based on what you've shared, Ruby needs to ask about ${branchName.toLowerCase()} too — this helps me get a complete picture. 💎`, 'bot');
             setSymptomQueue(prev => [result.branchToSymptomId!, ...prev.filter(id => id !== result.branchToSymptomId!)]);
        }
        completeSingleSymptom();
        return;
    }

    if (symptom.followUpQuestions && symptom.followUpQuestions.length > 0) {
        setStage('followup');
        
        // Find first unanswered followup
        const firstIdx = findNextUnansweredQuestion(symptom.followUpQuestions, 0, finalAnswers);
        
        if (firstIdx !== -1) {
             addMessage("You're doing great! Just a few more questions from Ruby to make sure we cover everything. 💎", 'bot');
             setCurrentQuestionIndex(firstIdx);
             setTimeout(() => askQuestion(symptom.followUpQuestions![firstIdx]), 500);
        } else {
             // All followup questions already answered globally
             runFollowUpEvaluation(finalAnswers);
        }
    } else {
        completeSingleSymptom();
    }
  };

  const runFollowUpEvaluation = (finalAnswers: Record<string, any>) => {
      if (!currentSymptomId) return;
      const symptom = SYMPTOMS[currentSymptomId];
      
      if (symptom.evaluateFollowUp) {
          const result = symptom.evaluateFollowUp(finalAnswers);
          
          if (result.triageLevel && result.triageMessage) {
            updateTriage(result.triageLevel, result.triageMessage);
          }

          if (result.action === 'stop' || result.triageLevel === 'call_911') {
              completeSingleSymptom();
              return;
          }

          if (result.action === 'branch' && result.branchToSymptomId) {
               if (!visitedSymptoms.includes(result.branchToSymptomId)) {
                    const branchName = SYMPTOMS[result.branchToSymptomId].name;
                    addMessage(`Ruby noticed something — let me also check on ${branchName.toLowerCase()} to be thorough. 💎`, 'bot');
                    setSymptomQueue(prev => [result.branchToSymptomId!, ...prev.filter(id => id !== result.branchToSymptomId!)]);
               }
          }
      }
      completeSingleSymptom();
  };

  const completeSingleSymptom = () => {
    setHistory(prev => prev.map(msg => {
        if (msg.symptomStatus === 'checking' && msg.symptomId === currentSymptomId) {
            const res = symptomResults[currentSymptomId!] || 'none';
            let status: SymptomStatus = 'safe';
            if (res === 'call_911') status = 'emergency';
            else if (res === 'notify_care_team' || res === 'refer_provider') status = 'alert';
            return { ...msg, symptomStatus: status };
        }
        return msg;
    }));

    if (currentSymptomId) {
        const result = symptomResults[currentSymptomId] || 'none';
        const name = SYMPTOMS[currentSymptomId].name;
        let statusText = "Assessment Complete - No Action Required";
        if (result === 'call_911') statusText = "EMERGENCY - Call 911 Immediately";
        else if (result === 'notify_care_team') statusText = "Alert - Care Team Notified";
        else if (result === 'refer_provider') statusText = "Consult - Discuss at Next Appointment";
        
        addMessage(`${name} — ${statusText}`, 'bot', false, true);
    }
    
    const nextQueue = symptomQueue.filter(id => id !== currentSymptomId);
    setSymptomQueue(nextQueue);
    
    if (nextQueue.length > 0) {
        const nextId = nextQueue[0];
        setTimeout(() => startSymptomLogic(nextId), 1000);
    } else {
        setStage('complete');
    }
  };

  const reset = () => {
    setCurrentSymptomId(null);
    setCurrentSymptomMsgId(null);
    setStage('selection');
    setAnswers({});
    setGlobalAnswers({});
    setHighestSeverity('none');
    setTriageReasons([]);
    setVisitedSymptoms([]);
    setSymptomResults({});
    setSymptomQueue([]);
    setHistory([{ id: Date.now().toString(), sender: 'bot', content: 'Hello. I am Ruby, your compassionate oncology assistant. Please select a symptom below so I can help you. If this is a medical emergency, call 911 immediately.' }]);
  };

  const continueSession = () => {
      setStage('selection');
      setCurrentSymptomId(null);
      setAnswers({});
      addMessage("Please select another symptom from the dashboard.", 'bot');
  };

  // Emergency prescreen handlers
  const handlePrescreenComplete = (hasEmergency: boolean, selectedEmergencies: string[]) => {
    setPrescreenComplete(true);
    if (hasEmergency && selectedEmergencies.length > 0) {
      setEmergencyTriggered(true);
      // Map the emergency symptoms to readable names
      const emergencyLabels: Record<string, string> = {
        'breathing': 'Trouble breathing or shortness of breath',
        'chest_pain': 'Chest pain or pressure',
        'bleeding': 'Severe bleeding that won\'t stop',
        'fainting': 'Fainting or feeling like you\'ll faint',
        'confusion': 'Confusion or trouble speaking',
        'stroke': 'Signs of stroke (face drooping, arm weakness)'
      };
      const reasons = selectedEmergencies.map(e => emergencyLabels[e] || e).join(', ');
      setEmergencyReason(reasons);
      setHighestSeverity('call_911');
      setTriageReasons([`Patient reports urgent symptoms: ${reasons}`]);
      setStage('complete');
    } else {
      setStage('selection');
      addMessage("Hi, I'm Ruby! 💎 Great — let's check on how you're feeling. Select a symptom below and I'll guide you through some questions.", 'bot');
    }
  };

  const resetToPrescreen = () => {
    setHistory([]);
    setStage('emergency_prescreen');
    setPrescreenComplete(false);
    setEmergencyTriggered(false);
    setEmergencyReason('');
    setHighestSeverity('none');
    setTriageReasons([]);
    setCurrentSymptomId(null);
    setAnswers({});
    setGlobalAnswers({});
    setVisitedSymptoms([]);
    setSymptomQueue([]);
    setSymptomResults({});
  };

  return {
    history,
    stage,
    currentSymptomId,
    currentQuestion: currentSymptomId 
      ? (stage === 'screening' 
          ? SYMPTOMS[currentSymptomId].screeningQuestions[currentQuestionIndex] 
          : SYMPTOMS[currentSymptomId].followUpQuestions?.[currentQuestionIndex])
      : null,
    handleAnswer,
    isTyping,
    reset,
    continueSession,
    highestSeverity,
    triageReasons,
    startSession,
    visitedSymptoms,
    symptomResults,
    // Emergency prescreen
    handlePrescreenComplete,
    resetToPrescreen,
    emergencyTriggered,
    emergencyReason
  };
};

// --- Main UI ---

// Quick filter categories mapping
const FILTER_CATEGORIES: Record<FilterCategory, string[]> = {
  all: [],
  digestive: ['NAU-203', 'VOM-204', 'DIA-205', 'CON-206', 'APP-209'],
  pain: ['PAI-213', 'URG-111', 'URG-112', 'URG-113'],
  respiratory: ['URG-101', 'COU-215'],
  neurological: ['URG-102', 'NEU-216', 'NEU-304'],
  skin: ['SKI-212', 'URG-114'],
  general: ['FEV-202', 'MSO-208', 'URI-211', 'SLE-217']
};

function App() {
  const { history, stage, startSession, handleAnswer, isTyping, currentQuestion, reset, continueSession, currentSymptomId, highestSeverity, triageReasons, visitedSymptoms, symptomResults, handlePrescreenComplete, resetToPrescreen, emergencyTriggered, emergencyReason } = useSymptomChecker();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  // New UX Features
  const { fontScale, setFontScale } = useFontScale();
  const { isDark, toggleDark } = useDarkMode();
  const { history: sessionHistory, addToHistory, getLastAssessmentDate, clearHistory } = useSessionHistory();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [emergencyCollapsed, setEmergencyCollapsed] = useState(true);
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [announcement, setAnnouncement] = useState('');
  
  // Emergency prescreen state
  const [prescreenChecks, setPrescreenChecks] = useState<string[]>([]);

  const emergencyRef = useRef<HTMLDivElement>(null);
  const commonRef = useRef<HTMLDivElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  // Handle exit with confirmation if mid-assessment
  const handleExitClick = () => {
    if (stage !== 'selection' && stage !== 'complete') {
      setShowExitConfirm(true);
    } else {
      reset();
    }
  };
  
  const confirmExit = () => {
    setShowExitConfirm(false);
    setPrescreenChecks([]);
    resetToPrescreen();
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    const toast = document.createElement('div');
    toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-50 animate-fade-in';
    toast.innerText = 'Link copied to clipboard!';
    document.body.appendChild(toast);
    setTimeout(() => {
        if(document.body.contains(toast)) document.body.removeChild(toast);
    }, 2000);
  };
  
  // Save to session history when completing
  useEffect(() => {
    if (stage === 'complete') {
      visitedSymptoms.forEach(sId => {
        addToHistory(sId, symptomResults[sId] || 'none');
      });
    }
  }, [stage]);

  useEffect(() => {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
            if (stage === 'selection') {
                 scrollRef.current.scrollTop = 0;
            } else {
                 scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }
        }
      }, 100); 
      return () => clearTimeout(timer);
  }, [history, isTyping, stage, currentQuestion]);

  const handleSubmitText = () => {
    if (!textInput.trim()) return;
    
    let processedInput = textInput.trim();

    // Data Integrity Check: Negative Numbers
    if (currentQuestion?.type === 'number') {
        const val = parseFloat(processedInput);
        if (val < 0) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-50 animate-fade-in';
            toast.innerText = 'Please enter a positive number.';
            document.body.appendChild(toast);
            setTimeout(() => {
                if(document.body.contains(toast)) document.body.removeChild(toast);
            }, 2000);
            return;
        }
    } else if (currentQuestion?.type === 'text') {
        processedInput = processedInput.toLowerCase();
    }

    handleAnswer(processedInput);
    setTextInput('');
  };

  const handleMultiSelectSubmit = () => {
    handleAnswer(multiSelect);
    setMultiSelect([]);
  };

  const toggleMultiSelect = (val: string) => {
    setMultiSelect(prev => 
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };
  
  const handleCardClick = (id: string) => {
      if (isMultiSelectMode) {
          setSelectedSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
      } else {
          startSession([id]);
      }
  };
  
  const handleStartMultiSession = () => {
      if (selectedSymptoms.length > 0) {
          startSession(selectedSymptoms);
          setSelectedSymptoms([]);
          setIsMultiSelectMode(false);
      }
  };

  // Filter symptoms by search query and active category filter
  const filteredSymptoms = Object.values(SYMPTOMS).filter(s => {
    if (s.hidden) return false;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || FILTER_CATEGORIES[activeFilter].includes(s.id);
    return matchesSearch && matchesFilter;
  });

  const URGENT_SYMPTOMS = filteredSymptoms.filter(s => s.category === 'emergency');
  const COMMON_SYMPTOMS = filteredSymptoms.filter(s => s.category === 'common');
  const OTHER_SYMPTOMS = filteredSymptoms.filter(s => s.category === 'other');
  
  // Get recently checked symptoms for quick access
  const recentSymptoms = sessionHistory.slice(0, 3).map(h => SYMPTOMS[h.symptomId]).filter(Boolean);

  return (
    <div className="flex flex-col h-[100dvh] w-full mx-auto overflow-hidden font-sans text-slate-900 bg-slate-50">
      {/* Accessibility: Skip to main content link */}
      <a 
        href="#main-content" 
        className="skip-link"
        onClick={(e) => {
          e.preventDefault();
          mainContentRef.current?.focus();
          mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
        }}
      >
        Skip to main content
      </a>
      
      {/* Accessibility: Screen reader announcements */}
      <ScreenReaderAnnounce message={announcement} />
      
      {/* Sticky Header */}
      <header 
        className="sticky top-0 z-40 w-full bg-white border-b border-stone-200 shrink-0"
        role="banner"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="ruby-avatar w-9 h-9 text-base" aria-hidden="true">R</div>
                <div>
                    <h1 className="font-semibold text-stone-800 text-base leading-tight">OncoLife</h1>
                    <p className="text-teal-600 text-[10px] font-semibold">Ruby — Your Care Assistant</p>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                {/* Font Size Selector */}
                <div className="hidden sm:block">
                  <FontSizeSelector fontScale={fontScale} setFontScale={setFontScale} />
                </div>
                
                {/* Dark Mode Toggle */}
                <button 
                  onClick={toggleDark} 
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" 
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {isDark ? <MedicalIcons.Sun /> : <MedicalIcons.Moon />}
                </button>
                
                <button 
                  onClick={handleShare} 
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" 
                  title="Share"
                  aria-label="Share application link"
                >
                    <MedicalIcons.Share />
                </button>
                {stage !== 'selection' && stage !== 'emergency_prescreen' ? (
                    <button 
                      onClick={handleExitClick} 
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium py-2 px-3 rounded-lg transition-colors"
                      aria-label="Exit current assessment"
                    >
                        Exit
                    </button>
                ) : (
                    <div className="flex items-center space-x-2" role="status" aria-label="System status: Online">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                    <span className="text-xs font-medium text-slate-500 hidden sm:block">Online</span>
                    </div>
                )}
            </div>
        </div>
      </header>

      <main 
        id="main-content"
        className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide" 
        ref={scrollRef}
        tabIndex={-1}
        role="main"
        aria-label={stage === 'selection' ? 'Symptom selection dashboard' : 'Symptom assessment conversation'}
      >
        
        {/* Exit Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showExitConfirm}
          title="Leave Assessment?"
          message="You have an assessment in progress. Your answers will be lost if you leave now. Are you sure you want to exit?"
          confirmText="Yes, Exit"
          cancelText="Continue Assessment"
          onConfirm={confirmExit}
          onCancel={() => setShowExitConfirm(false)}
          variant="warning"
        />
        
        {/* === EMERGENCY PRESCREEN === */}
        {stage === 'emergency_prescreen' ? (
          <div className="animate-fade-in min-h-full flex flex-col">
            {/* Ruby Header */}
            <div className="ruby-header px-4 pt-10 pb-8 text-center">
              <div className="ruby-avatar w-20 h-20 mx-auto mb-4 text-3xl shadow-lg">R</div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Hi, I'm Ruby! 💎
              </h1>
              <p className="text-teal-100 text-sm max-w-md mx-auto">
                Before we start, let me make sure you're safe.
              </p>
      </div>

            {/* Emergency Check */}
            <div className="flex-1 bg-white px-4 py-8">
              <div className="max-w-md mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                  <h2 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                    <MedicalIcons.AlertTriangle />
                    <span className="ml-2">Are you experiencing any of these RIGHT NOW?</span>
                  </h2>
                  
                  <div className="space-y-3">
                    {[
                      { id: 'breathing', label: 'Trouble breathing or shortness of breath', icon: '🫁' },
                      { id: 'chest_pain', label: 'Chest pain or pressure', icon: '💔' },
                      { id: 'bleeding', label: 'Severe bleeding that won\'t stop', icon: '🩸' },
                      { id: 'fainting', label: 'Fainting or feeling like you\'ll faint', icon: '😵' },
                      { id: 'confusion', label: 'Confusion or trouble speaking', icon: '🧠' },
                      { id: 'stroke', label: 'Face drooping, arm weakness, slurred speech', icon: '⚠️' },
                    ].map(item => (
                      <label 
                        key={item.id}
                        className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          prescreenChecks.includes(item.id) 
                            ? 'border-red-500 bg-red-100' 
                            : 'border-stone-200 hover:border-red-300 hover:bg-red-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={prescreenChecks.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setPrescreenChecks(prev => [...prev, item.id]);
                            } else {
                              setPrescreenChecks(prev => prev.filter(i => i !== item.id));
                            }
                          }}
                          className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mr-3 transition-all ${
                          prescreenChecks.includes(item.id) 
                            ? 'bg-red-600 border-red-600' 
                            : 'border-stone-300 bg-white'
                        }`}>
                          {prescreenChecks.includes(item.id) && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium text-stone-700">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="space-y-3">
                  {prescreenChecks.length > 0 ? (
                    <button
                      onClick={() => handlePrescreenComplete(true, prescreenChecks)}
                      className="w-full py-4 bg-red-600 text-white rounded-xl font-semibold text-lg hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <MedicalIcons.AlertTriangle />
                      I need help NOW
                    </button>
                  ) : (
                    <button
                      onClick={() => handlePrescreenComplete(false, [])}
                      className="btn-ruby w-full flex items-center justify-center"
                    >
                      None of these — Continue
                      <span className="ml-2"><MedicalIcons.ArrowRight /></span>
                    </button>
                  )}
                </div>
                
                <p className="text-center text-stone-500 text-xs mt-6">
                  If you're unsure, it's always safer to call 911.
                </p>
              </div>
            </div>
          </div>
        ) : stage === 'selection' ? (
            /* --- DASHBOARD VIEW --- */
            <div className="animate-fade-in pb-20" ref={mainContentRef}>
                {/* Ruby Header - Simplified since we came from prescreen */}
                <div className="ruby-header px-4 pt-6 pb-6 text-center">
                    <div className="max-w-3xl mx-auto flex items-center justify-center">
                        <div className="ruby-avatar w-10 h-10 text-lg mr-3">R</div>
                        <div className="text-left">
                          <h2 className="text-xl font-bold text-white">
                            Select a Symptom
                          </h2>
                          <p className="text-teal-200 text-xs">
                            Ruby will guide you through the assessment
                          </p>
                        </div>
                    </div>
                </div>
                
                {/* Search & Filters */}
                <div className="bg-white border-b border-stone-200 px-4 py-5">
                    <div className="max-w-3xl mx-auto">
                        {/* Mobile Font Size Selector */}
                        <div className="sm:hidden flex justify-center mb-4">
                          <FontSizeSelector fontScale={fontScale} setFontScale={setFontScale} />
                        </div>
                        
                        {/* Search */}
                        <div className="relative max-w-md mx-auto mb-4">
                            <label htmlFor="symptom-search" className="sr-only">Search symptoms</label>
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
                                <svg className="h-5 w-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input 
                                id="symptom-search"
                                type="search" 
                                className="block w-full pl-12 pr-4 py-3 rounded-xl text-stone-900 placeholder-stone-400 bg-stone-50 border border-stone-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none text-sm transition-all"
                                placeholder="Search symptoms..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search symptoms by name"
                                aria-describedby="search-results-count"
                            />
                            <span id="search-results-count" className="sr-only">
                              {filteredSymptoms.length} symptoms found
                            </span>
                        </div>
                        
                        {/* Filter Pills */}
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {[
                            { id: 'all', label: 'All' },
                            { id: 'digestive', label: 'Digestive' },
                            { id: 'pain', label: 'Pain' },
                            { id: 'respiratory', label: 'Breathing' },
                            { id: 'neurological', label: 'Neuro' },
                            { id: 'skin', label: 'Skin' },
                            { id: 'general', label: 'General' },
                          ].map(filter => (
                            <button
                              key={filter.id}
                              onClick={() => setActiveFilter(filter.id as FilterCategory)}
                              className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                            >
                              {filter.label}
                            </button>
                          ))}
                        </div>
                        
                        {/* Mode Toggle */}
                        <div 
                          className="flex justify-center items-center space-x-2 bg-stone-100 inline-flex p-1 rounded-full mx-auto"
                          role="radiogroup"
                          aria-label="Selection mode"
                        >
                             <button 
                                onClick={() => { setIsMultiSelectMode(false); setSelectedSymptoms([]); }}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${!isMultiSelectMode ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600 hover:text-stone-800'}`}
                                role="radio"
                                aria-checked={!isMultiSelectMode}
                                aria-label="Single symptom mode"
                             >
                                 Single Assessment
                             </button>
                             <button 
                                onClick={() => setIsMultiSelectMode(true)}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${isMultiSelectMode ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-600 hover:text-stone-800'}`}
                                role="radio"
                                aria-checked={isMultiSelectMode}
                                aria-label="Multiple symptom mode"
                             >
                                 Multiple Symptoms
                             </button>
                        </div>
                    </div>
                </div>

                {/* Recently Assessed Section */}
                {recentSymptoms.length > 0 && activeFilter === 'all' && !searchQuery && (
                  <div className="bg-slate-50 border-b border-slate-200 py-3">
                    <div className="max-w-5xl mx-auto px-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <span className="text-slate-500 mr-2"><MedicalIcons.Clock /></span>
                          <span className="text-xs font-medium text-slate-600">Recent Assessments</span>
                        </div>
                        <button 
                          onClick={clearHistory}
                          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                          title="Clear history"
                        >
                          Clear
                        </button>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {recentSymptoms.map(s => (
                          <button
                            key={s.id}
                            onClick={() => handleCardClick(s.id)}
                            className="shrink-0 px-3 py-1.5 bg-white rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:border-slate-400 transition-colors flex items-center"
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Navigation */}
                <nav 
                  className="bg-white border-b border-slate-200 py-3"
                  aria-label="Symptom categories"
                >
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="flex items-center space-x-2 overflow-x-auto pb-1" role="group">
                             <span className="text-xs font-medium text-slate-500 mr-2 shrink-0 hidden sm:inline-block">Categories:</span>
                             <button 
                               onClick={() => scrollToSection(commonRef)} 
                               className="shrink-0 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-colors"
                               aria-label="Jump to common side effects section"
                             >
                               Common Side Effects
                             </button>
                             <button 
                               onClick={() => scrollToSection(otherRef)} 
                               className="shrink-0 px-3 py-1.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-colors"
                               aria-label="Jump to general symptoms section"
                             >
                               General Symptoms
                             </button>
                        </div>
                    </div>
                </nav>

                {/* Cards Container */}
                <div className="max-w-5xl mx-auto px-4 mt-6 relative z-10 space-y-10">
                    
                    {/* Common Side Effects */}
                    {(COMMON_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <section ref={commonRef} className="scroll-mt-32" aria-labelledby="common-heading">
                            <div className="flex items-center mb-4 pb-2 border-b border-slate-200">
                                <span className="bg-slate-100 text-slate-600 p-2 rounded-lg mr-3" aria-hidden="true"><MedicalIcons.Beaker /></span>
                                <div>
                                  <h3 id="common-heading" className="text-sm font-semibold text-slate-800">Common Side Effects</h3>
                                  <p className="text-xs text-slate-500">Treatment-related symptoms</p>
                            </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="Common side effects list">
                                {COMMON_SYMPTOMS.map(s => (
                                    <SymptomCard key={s.id} symptom={s} onClick={handleCardClick} variant="common" result={visitedSymptoms.includes(s.id) ? symptomResults[s.id] : undefined} isMultiSelectMode={isMultiSelectMode} isSelected={selectedSymptoms.includes(s.id)} />
                                ))}
                                {COMMON_SYMPTOMS.length === 0 && <p className="text-slate-400 text-sm col-span-full text-center py-6" role="status">No symptoms match your filter.</p>}
                            </div>
                        </section>
                    )}

                    {/* General Symptoms */}
                    {(OTHER_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <section ref={otherRef} className="scroll-mt-32" aria-labelledby="other-heading">
                            <div className="flex items-center mb-4 pb-2 border-b border-slate-200">
                                <span className="bg-slate-100 text-slate-600 p-2 rounded-lg mr-3" aria-hidden="true"><MedicalIcons.Clipboard /></span>
                                <div>
                                  <h3 id="other-heading" className="text-sm font-semibold text-slate-800">General Symptoms</h3>
                                  <p className="text-xs text-slate-500">Other symptoms to assess</p>
                            </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="list" aria-label="General symptoms list">
                                {OTHER_SYMPTOMS.map(s => (
                                    <SymptomCard key={s.id} symptom={s} onClick={handleCardClick} variant="other" result={visitedSymptoms.includes(s.id) ? symptomResults[s.id] : undefined} isMultiSelectMode={isMultiSelectMode} isSelected={selectedSymptoms.includes(s.id)} />
                                ))}
                                {OTHER_SYMPTOMS.length === 0 && <p className="text-slate-400 text-sm col-span-full text-center py-6" role="status">No symptoms match your filter.</p>}
                            </div>
                        </section>
                    )}

                    {/* Note: Urgent symptoms removed - now handled in Emergency Prescreen */}
                    
                    <div className="text-center border-t border-slate-200 pt-8 pb-6">
                        <p className="text-xs text-slate-500 mb-1">OncoLife Clinical Assessment System v3.0</p>
                        <p className="text-[10px] text-slate-400 font-medium">Powered by KanasuLabs | 2025</p>
                    </div>
                </div>
                
                {isMultiSelectMode && selectedSymptoms.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in w-full max-w-sm px-4" role="region" aria-live="polite">
                        <button 
                            onClick={handleStartMultiSession}
                            className="btn-ruby w-full flex items-center justify-center"
                            aria-label={`Start assessment for ${selectedSymptoms.length} selected symptoms`}
                        >
                            <span>Ruby, check {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? 's' : ''}</span>
                            <span className="ml-2"><MedicalIcons.ArrowRight /></span>
                        </button>
                    </div>
                )}
            </div>
        ) : (
            /* --- CHAT VIEW --- */
            <div className="p-4 max-w-2xl mx-auto w-full" ref={mainContentRef}>
                <div className="sticky top-0 bg-slate-50 z-10 pt-4 pb-2">
                   <ProgressBar stage={stage} />
                </div>

                <div role="log" aria-live="polite" aria-label="Chat conversation">
                {history.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                </div>
                {isTyping && <TypingIndicator />}
                
                {stage === 'complete' && (
                    <div className="animate-fade-in mt-6 mb-6">
                        {highestSeverity === 'call_911' && (
                            <div 
                              className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
                              role="alert"
                              aria-live="assertive"
                            >
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                                  <MedicalIcons.AlertTriangle />
                                </div>
                                <h2 className="text-xl font-semibold text-red-800 mb-2">Emergency Action Required</h2>
                                <p className="text-red-700 mb-6">Call 911 or your Care Team right away. This is an emergency.</p>
                                
                                {/* Emergency Action Buttons */}
                                <div className="grid gap-3 mb-6">
                                  <a 
                                    href="tel:911"
                                    className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold text-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                                  >
                                    <MedicalIcons.Phone />
                                    Call 911 Now
                                  </a>
                                  
                                  {/* I've Called 911 Confirmation */}
                                  {!showEmergencyConfirm ? (
                                    <button
                                      onClick={() => setShowEmergencyConfirm(true)}
                                      className="w-full py-3 bg-white text-red-700 rounded-lg font-medium border border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                    >
                                      <MedicalIcons.CheckCircle />
                                      I've already called 911
                                    </button>
                                  ) : (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                                      <p className="font-medium flex items-center gap-2 text-sm">
                                        <MedicalIcons.CheckCircle />
                                        Confirmed — help is on the way
                                      </p>
                                      <p className="text-sm mt-1 text-green-700">Stay calm. If possible, unlock your door and wait for emergency services.</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-white rounded-lg p-4 border border-red-100 text-left">
                                    <p className="text-xs text-red-500 font-medium mb-2">Clinical Reasoning</p>
                                    <ul className="space-y-1.5 text-red-800 text-sm" aria-label="Reasons for emergency status">
                                        {triageReasons.map((r, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 text-red-400" aria-hidden="true">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'notify_care_team' && (
                            <div 
                              className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center"
                              role="alert"
                              aria-live="polite"
                            >
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                                  <MedicalIcons.AlertTriangle />
                                </div>
                                <h2 className="text-xl font-semibold text-amber-800 mb-2">Care Team Alert</h2>
                                <p className="text-amber-700 mb-6">Your care team has been notified. Please keep your phone nearby for a call from the clinic.</p>
                                <div className="bg-white rounded-lg p-4 border border-amber-100 text-left">
                                    <p className="text-xs text-amber-500 font-medium mb-2">Clinical Reasoning</p>
                                    <ul className="space-y-1.5 text-amber-800 text-sm" aria-label="Reasons for alert status">
                                        {triageReasons.map((r, i) => (
                                             <li key={i} className="flex items-start">
                                                <span className="mr-2 text-amber-400" aria-hidden="true">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'refer_provider' && (
                            <div 
                              className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center"
                              role="status"
                              aria-live="polite"
                            >
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                                  <MedicalIcons.Clipboard />
                                </div>
                                <h2 className="text-xl font-semibold text-blue-800 mb-2">Provider Consultation Recommended</h2>
                                <p className="text-blue-700 mb-4">Please discuss these symptoms with your care team at your next appointment.</p>
                                <p className="text-blue-600 mb-6 text-sm">This assessment is not a substitute for medical care. If you feel unsafe, please call 911.</p>
                                <div className="bg-white rounded-lg p-4 border border-blue-100 text-left">
                                    <p className="text-xs text-blue-500 font-medium mb-2">Assessment Notes</p>
                                    <ul className="space-y-1.5 text-blue-800 text-sm" aria-label="Assessment notes">
                                        {triageReasons.map((r, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 text-blue-400" aria-hidden="true">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'none' && (
                            <div 
                              className="bg-green-50 border border-green-200 rounded-lg p-6 text-center"
                              role="status"
                              aria-live="polite"
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                  <MedicalIcons.CheckCircle />
                                </div>
                                <h2 className="text-xl font-semibold text-green-800 mb-2">Assessment Complete</h2>
                                <p className="text-green-700 mb-3">No immediate action required. Please mention these symptoms at your next appointment.</p>
                                <p className="text-sm text-green-600">This assessment is not a substitute for medical care. If you feel unsafe, please call 911.</p>
                            </div>
                        )}

                        {/* Session Summary - includes prescreen if emergency triggered */}
                        {(visitedSymptoms.length > 0 || emergencyTriggered) && (
                            <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4">
                                <h3 className="text-xs font-medium text-slate-500 mb-3 pb-2 border-b border-slate-100">Session Summary</h3>
                                <div className="space-y-3">
                                    {/* Show emergency prescreen if triggered */}
                                    {emergencyTriggered && emergencyReason && (
                                      <div className="flex items-center justify-between bg-red-50 p-2 rounded-lg border border-red-200">
                                        <span className="text-red-800 font-medium text-sm">Emergency Prescreen: {emergencyReason}</span>
                                        <span className="text-xs font-medium px-2 py-1 rounded badge-emergency">
                                          Emergency
                                        </span>
                                      </div>
                                    )}
                                    {visitedSymptoms.map(sId => {
                                        const sDef = SYMPTOMS[sId];
                                        const res = symptomResults[sId] || 'none';
                                        
                                        let statusClass = "badge-info";
                                        let statusText = "Checked";
                                        
                                        if (res === 'call_911') { statusClass = "badge-emergency"; statusText = "Emergency"; }
                                        else if (res === 'notify_care_team') { statusClass = "badge-alert"; statusText = "Alert"; }
                                        else if (res === 'refer_provider') { statusClass = "badge-info"; statusText = "Consult"; }
                                        else if (res === 'none') { statusClass = "badge-safe"; statusText = "Complete"; }

                                        return (
                                            <div key={sId} className="flex items-center justify-between">
                                                <span className="text-slate-700 font-medium text-sm">{sDef.name}</span>
                                                <span className={`text-xs font-medium px-2 py-1 rounded ${statusClass}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Session Actions */}
                        <div className="grid gap-3 mt-6">
                            <button 
                                onClick={continueSession}
                                className="btn-ruby w-full flex items-center justify-center"
                            >
                                <span>Ask Ruby About Another Symptom</span>
                                <span className="ml-2"><MedicalIcons.Plus /></span>
                            </button>

                            {/* Secondary Actions Row */}
                            <div className="grid grid-cols-3 gap-2">
                              <button 
                                onClick={() => {
                                  const subject = encodeURIComponent('OncoLife Symptom Assessment Summary');
                                  const body = encodeURIComponent(`Symptoms Checked: ${visitedSymptoms.map(s => SYMPTOMS[s].name).join(', ')}\n\nStatus: ${highestSeverity === 'call_911' ? 'Emergency' : highestSeverity === 'notify_care_team' ? 'Alert' : highestSeverity === 'refer_provider' ? 'Consult' : 'Safe'}\n\nNotes:\n${triageReasons.join('\n')}\n\nDate: ${new Date().toLocaleDateString()}`);
                                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                }}
                                className="py-2.5 px-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                title="Email summary"
                              >
                                <MedicalIcons.Mail />
                                <span>Email</span>
                              </button>
                              
                              <button 
                                onClick={() => window.print()}
                                className="py-2.5 px-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                title="Print summary"
                              >
                                <MedicalIcons.Printer />
                                <span>Print</span>
                              </button>
                              
                              <button 
                                onClick={() => {
                                  const reminderTime = new Date(Date.now() + 4 * 60 * 60 * 1000);
                                  const title = encodeURIComponent('Symptom Recheck - OncoLife');
                                  const details = encodeURIComponent(`Time to recheck your symptoms: ${visitedSymptoms.map(s => SYMPTOMS[s].name).join(', ')}`);
                                  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${reminderTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(reminderTime.getTime() + 30*60000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
                                  window.open(calendarUrl, '_blank');
                                }}
                                className="py-2.5 px-2 bg-white text-slate-700 rounded-lg font-medium text-sm border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                title="Set reminder"
                              >
                                <MedicalIcons.Clock />
                                <span>Remind</span>
                              </button>
                            </div>

                            <button 
                                onClick={() => { setPrescreenChecks([]); resetToPrescreen(); }}
                                className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all"
                            >
                                End Session
                            </button>
                        </div>
                        
                        <div className="text-center mt-8 pb-4">
                            <p className="text-xs text-slate-400">OncoLife Clinical Assessment | KanasuLabs 2025</p>
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>

      {stage !== 'selection' && stage !== 'complete' && (
        <footer 
          className="bg-white border-t border-slate-200 p-4 pb-8 w-full shrink-0 z-30 max-h-[55dvh] overflow-y-auto"
          role="region"
          aria-label="Answer input area"
        >
            <div className="max-w-2xl mx-auto animate-fade-in">
                {currentQuestion?.type === 'yes_no' && (
                <div className="grid grid-cols-5 gap-3" role="group" aria-label="Yes or No answer options">
                    <button 
                      onClick={() => handleAnswer(false)} 
                      className="col-span-2 p-3 rounded-xl border border-stone-200 font-medium text-stone-600 hover:border-stone-300 hover:bg-stone-50 active:scale-98 transition-all"
                      aria-label="Answer No"
                    >
                      No
                    </button>
                    <button 
                      onClick={() => handleAnswer(true)} 
                      className="col-span-3 p-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 text-white font-semibold shadow-md hover:shadow-lg active:scale-98 transition-all"
                      aria-label="Answer Yes"
                    >
                      Yes
                    </button>
                </div>
                )}

                {currentQuestion?.type === 'choice' && (
                <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Select one option">
                    {currentQuestion.options?.map(opt => (
                        <button 
                        key={opt.value.toString()} 
                        onClick={() => handleAnswer(opt.value)}
                        className="p-4 rounded-xl border border-stone-200 text-left font-medium text-stone-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-all active:scale-98 whitespace-normal"
                        role="radio"
                        aria-checked="false"
                        aria-label={`Select ${opt.label}`}
                        >
                        {opt.label}
                        </button>
                    ))}
                </div>
                )}

                {currentQuestion?.type === 'multiselect' && (
                <div className="space-y-3" role="group" aria-label="Select all that apply">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-500 font-medium" id="multiselect-hint">Select all that apply</p>
                      {/* Select All / Clear All batch actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMultiSelect(currentQuestion.options?.map(o => o.value as string) || [])}
                          className="text-xs text-teal-600 hover:text-teal-800 font-semibold px-2 py-1 rounded hover:bg-teal-50 transition-colors"
                          type="button"
                        >
                          Select All
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                          onClick={() => setMultiSelect([])}
                          className="text-xs text-slate-500 hover:text-slate-700 font-semibold px-2 py-1 rounded hover:bg-slate-100 transition-colors"
                          type="button"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                    {currentQuestion.options?.map(opt => (
                    <button
                        key={opt.value.toString()}
                        onClick={() => toggleMultiSelect(opt.value as string)}
                        className={`w-full p-3 rounded-2xl border text-left font-medium transition-all flex justify-between items-center shadow-sm active:scale-[0.99] whitespace-normal ${
                        multiSelect.includes(opt.value as string) 
                            ? 'bg-teal-600 border-teal-600 text-white ring-2 ring-teal-300 ring-offset-1' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                        role="checkbox"
                        aria-checked={multiSelect.includes(opt.value as string)}
                        aria-describedby="multiselect-hint"
                        aria-label={`${opt.label}${multiSelect.includes(opt.value as string) ? ' (selected)' : ''}`}
                    >
                        <span className="flex-1 pr-2">{opt.label}</span>
                        {multiSelect.includes(opt.value as string) && (
                            <span className="bg-white text-teal-600 rounded-full w-6 h-6 flex shrink-0 items-center justify-center font-bold text-sm" aria-hidden="true">✓</span>
                        )}
                    </button>
                    ))}
                    <button 
                    onClick={handleMultiSelectSubmit}
                    className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all mt-2 active:scale-95 hover:shadow-xl"
                    aria-label={`Confirm selection of ${multiSelect.length} item${multiSelect.length !== 1 ? 's' : ''}`}
                    disabled={multiSelect.length === 0}
                    >
                    {multiSelect.length === 0 ? 'Select at least one option' : `Confirm Selection (${multiSelect.length})`}
                    </button>
                </div>
                )}

                {/* Temperature input - special formatting */}
                {currentQuestion?.type === 'number' && currentQuestion.id.includes('temp') && (
                <div className="flex space-x-3">
                    <label htmlFor="temp-input" className="sr-only">Enter temperature in Fahrenheit</label>
                    <div className="temp-input-wrapper flex-1">
                    <input 
                      id="temp-input"
                      type="number" 
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="98.6"
                      min="90"
                      max="110"
                      step="0.1"
                      inputMode="decimal"
                      className="w-full p-4 rounded-2xl border border-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-inner bg-slate-50"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
                      autoFocus
                      aria-label="Enter temperature in Fahrenheit"
                      />
                    </div>
                    <button 
                    onClick={handleSubmitText}
                    className="px-6 bg-teal-600 text-white rounded-2xl font-bold shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
                    aria-label="Submit temperature"
                    >
                    <span className="hidden sm:inline">Submit</span>
                    <span className="sm:hidden" aria-hidden="true">➜</span>
                    </button>
                </div>
                )}
                
                {/* Regular text/number input (non-temperature) */}
                {(currentQuestion?.type === 'text' || (currentQuestion?.type === 'number' && !currentQuestion.id.includes('temp'))) && (
                <div className="flex space-x-3">
                    <label htmlFor="answer-input" className="sr-only">
                      {currentQuestion.type === 'number' ? 'Enter a number' : 'Type your answer'}
                    </label>
                    <input 
                    id="answer-input"
                    type={currentQuestion.type === 'number' ? 'number' : 'text'} 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={currentQuestion.type === 'number' ? "Enter number..." : "Type your answer..."}
                    min="0"
                    inputMode={currentQuestion.type === 'number' ? 'numeric' : 'text'}
                    className="flex-1 p-4 rounded-2xl border border-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-inner bg-slate-50"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
                    autoFocus
                    aria-label={currentQuestion.type === 'number' ? 'Enter a number' : 'Type your answer'}
                    aria-describedby="input-hint"
                    />
                    <span id="input-hint" className="sr-only">Press Enter or click Send to submit</span>
                    <button 
                    onClick={handleSubmitText}
                    className="px-6 bg-teal-600 text-white rounded-2xl font-bold shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
                    aria-label="Submit answer"
                    >
                    <span className="hidden sm:inline">Send</span>
                    <span className="sm:hidden" aria-hidden="true">➜</span>
                    </button>
                </div>
                )}
            </div>
        </footer>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);