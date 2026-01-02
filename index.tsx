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

  return { history, addToHistory, getLastAssessmentDate };
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
    warning: 'bg-amber-600 hover:bg-amber-700',
    info: 'bg-teal-600 hover:bg-teal-700'
  };

  return (
    <div className="dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <h3 id="dialog-title" className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{message}</p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 px-4 rounded-xl font-semibold text-white transition-colors ${variantStyles[variant]}`}
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
  
  // Accessibility: Map status to aria-label and pattern class
  const getStatusAccessibility = (status?: SymptomStatus) => {
    switch(status) {
      case 'checking': return { label: 'Status: In Progress', pattern: '', icon: '🩺', text: 'CHECKING' };
      case 'safe': return { label: 'Status: Safe - No immediate action needed', pattern: 'status-pattern-safe', icon: '✅', text: 'SAFE' };
      case 'alert': return { label: 'Status: Alert - Care team will be notified', pattern: 'status-pattern-alert', icon: '⚠️', text: 'ALERT' };
      case 'emergency': return { label: 'Status: Emergency - Immediate action required', pattern: 'status-pattern-emergency', icon: '🚨', text: 'EMERGENCY' };
      default: return { label: 'System message', pattern: '', icon: '', text: '' };
    }
  };
  
  if (message.isSystem) {
    const statusInfo = getStatusAccessibility(message.symptomStatus);
    return (
      <div className="flex w-full justify-center mb-4 animate-fade-in px-4" role="status" aria-label={statusInfo.label}>
         <span className={`
            text-xs px-3 py-1.5 rounded-full font-bold tracking-wide flex items-center uppercase border shadow-sm
            ${statusInfo.pattern}
            ${message.symptomStatus === 'safe' ? 'bg-green-100 border-green-200 text-green-800' : ''}
            ${message.symptomStatus === 'emergency' ? 'bg-red-100 border-red-200 text-red-800' : ''}
            ${message.symptomStatus === 'alert' ? 'bg-amber-100 border-amber-200 text-amber-800' : ''}
            ${message.symptomStatus === 'checking' ? 'bg-blue-50 border-blue-100 text-blue-800' : ''}
            ${!message.symptomStatus ? 'bg-slate-100 border-slate-200 text-slate-600' : ''}
         `}>
            {message.symptomStatus === 'checking' && <span className="mr-2 text-base animate-pulse" aria-hidden="true">🩺</span>}
            {message.symptomStatus === 'safe' && <span className="mr-2 text-base" aria-hidden="true">✅</span>}
            {message.symptomStatus === 'alert' && <span className="mr-2 text-base" aria-hidden="true">⚠️</span>}
            {message.symptomStatus === 'emergency' && <span className="mr-2 text-base" aria-hidden="true">🚨</span>}
            {/* Accessibility: Text label for colorblind users */}
            {message.symptomStatus && statusInfo.text && (
              <span className="mr-1.5 text-[9px] font-black opacity-70">[{statusInfo.text}]</span>
            )}
            {message.content}
         </span>
      </div>
    );
  }

  return (
    <div 
      className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} mb-3 animate-fade-in`}
      role="log"
      aria-label={isBot ? 'Assistant message' : 'Your response'}
    >
      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm md:text-base shadow-sm leading-relaxed ${
        message.isAlert 
          ? 'bg-red-50 border border-red-200 text-red-900 status-pattern-emergency' 
          : isBot 
            ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none' 
            : 'bg-teal-600 text-white rounded-tr-none shadow-md'
      }`}>
        {message.isAlert && <span className="sr-only">Alert: </span>}
        {message.content}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex w-full justify-start mb-4">
    <div className="bg-white border border-slate-100 p-3.5 rounded-2xl rounded-tl-none flex space-x-1.5 shadow-sm items-center h-12">
      <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
      <div className="w-2 h-2 bg-slate-400 rounded-full typing-dot"></div>
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
    const baseClasses = "p-5 rounded-2xl border transition-all duration-300 transform flex flex-col justify-between w-full text-left group relative overflow-hidden min-h-[150px]";
    const styles = {
        emergency: "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:border-red-200 focus-emergency",
        common: "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200",
        other: "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200"
    };
    
    // Override styles if selected in multi-mode
    const selectedStyle = isSelected ? "ring-2 ring-teal-500 bg-teal-50/50" : "";
    
    const iconBg = variant === 'emergency' ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : variant === 'common' ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100';

    // Accessibility: Result badge with text labels and patterns
    const getResultAccessibility = (res: ActionLevel) => {
      switch(res) {
        case 'call_911': return { text: '⚠ EMERGENCY', label: 'Emergency - Previously checked', className: 'bg-red-100 text-red-700 border-red-200 status-pattern-emergency' };
        case 'notify_care_team': return { text: '⚡ ALERT', label: 'Alert - Care team notified', className: 'bg-amber-100 text-amber-700 border-amber-200 status-pattern-alert' };
        case 'refer_provider': return { text: '📋 CONSULT', label: 'Consult - Discuss with provider', className: 'bg-blue-100 text-blue-700 border-blue-200' };
        default: return { text: '✓ CHECKED', label: 'Checked - No immediate concern', className: 'bg-green-100 text-green-700 border-green-200 status-pattern-safe' };
      }
    };
    
    let badge = null;
    if (result) {
        const resultInfo = getResultAccessibility(result);
        badge = (
          <span 
            className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full border ${resultInfo.className}`}
            aria-label={resultInfo.label}
          >
            {resultInfo.text}
          </span>
        );
    }
    
    // Accessibility: Build comprehensive aria-label
    const ariaLabel = [
      symptom.name,
      variant === 'emergency' ? 'Emergency symptom' : 'Standard symptom',
      result ? getResultAccessibility(result).label : '',
      isMultiSelectMode ? (isSelected ? 'Selected' : 'Not selected') : 'Click to start assessment'
    ].filter(Boolean).join('. ');

    return (
        <button 
          onClick={() => onClick(symptom.id)} 
          className={`${baseClasses} ${styles[variant]} ${selectedStyle} ${!isMultiSelectMode && 'active:scale-95 hover:-translate-y-1'}`}
          aria-label={ariaLabel}
          aria-pressed={isMultiSelectMode ? isSelected : undefined}
          role={isMultiSelectMode ? "checkbox" : "button"}
        >
            {badge}
            {isMultiSelectMode && (
                 <div 
                   className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'}`}
                   aria-hidden="true"
                 >
                     {isSelected && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                 </div>
            )}
            <div className="flex justify-between items-start w-full">
                 <div className={`p-3.5 rounded-2xl transition-colors ${iconBg}`} aria-hidden="true">
                    {symptom.icon}
                </div>
                {!result && !isMultiSelectMode && (
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200" aria-hidden="true">
                        <span className="text-slate-400 font-bold text-lg leading-none">➔</span>
                    </div>
                )}
            </div>
            <div className="mt-4">
                <span className="font-bold text-slate-800 text-lg block leading-tight mb-1 group-hover:text-teal-700 transition-colors">{symptom.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {variant === 'emergency' ? '⚠ Immediate Triage' : '○ Standard Check'}
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
  const [history, setHistory] = useState<Message[]>([
    { id: 'welcome', sender: 'bot', content: "Hello! I'm Ruby, your caring oncology companion. 💚 Let's check on how you're feeling together. Take your time — there's no rush. If this is an emergency, please call 911 right away." }
  ]);
  const [currentSymptomId, setCurrentSymptomId] = useState<string | null>(null);
  const [currentSymptomMsgId, setCurrentSymptomMsgId] = useState<string | null>(null);
  const [stage, setStage] = useState<'selection' | 'screening' | 'followup' | 'complete'>('selection');
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
             addMessage(`Based on what you've shared, I'd also like to ask about ${branchName.toLowerCase()} — this helps me get a complete picture of how you're feeling. 💭`, 'bot');
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
             addMessage("You're doing great! Just a few more questions to make sure we have the full picture... 📋", 'bot');
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
                    addMessage(`Your answers suggest I should also check on ${branchName.toLowerCase()}. This is just to be thorough! 🔍`, 'bot');
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
        let statusText = "✓ All clear for now";
        if (result === 'call_911') statusText = "⚠ Emergency — please call 911";
        else if (result === 'notify_care_team') statusText = "📞 Care team will be notified";
        else if (result === 'refer_provider') statusText = "📋 Discuss at next appointment";
        
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
    symptomResults
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
  const { history, stage, startSession, handleAnswer, isTyping, currentQuestion, reset, continueSession, currentSymptomId, highestSeverity, triageReasons, visitedSymptoms, symptomResults } = useSymptomChecker();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  
  // New UX Features
  const { fontScale, setFontScale } = useFontScale();
  const { isDark, toggleDark } = useDarkMode();
  const { history: sessionHistory, addToHistory, getLastAssessmentDate } = useSessionHistory();
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [emergencyCollapsed, setEmergencyCollapsed] = useState(true); // Start collapsed to reduce anxiety
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false);
  const [announcement, setAnnouncement] = useState('');

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
    reset();
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
        className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200 shrink-0"
        role="banner"
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-teal-500 to-teal-700" aria-hidden="true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M10.5 3C7.46 3 5 5.46 5 8.5C5 12.3 8.5 16 10 17.5L8.5 21H11L12 18.5L13 21H15.5L14 17.5C15.5 16 19 12.3 19 8.5C19 5.46 16.54 3 13.5 3C12.4 3 11.4 3.3 10.5 3ZM12 5C13.93 5 15.5 6.57 15.5 8.5C15.5 10.9 13.5 13.5 12 15C10.5 13.5 8.5 10.9 8.5 8.5C8.5 6.57 10.07 5 12 5Z" />
                  </svg>
                </div>
                <div>
                    <h1 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">OncoLife</h1>
                    <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">Symptom Triage AI</p>
                </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
                {/* Accessibility: Font Size Selector */}
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
                    {isDark ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                    )}
                </button>
                
                <button 
                  onClick={handleShare} 
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" 
                  title="Share App Link"
                  aria-label="Share application link"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
                {stage !== 'selection' ? (
                    <button 
                      onClick={handleExitClick} 
                      className="bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 px-4 rounded-lg transition-all border border-slate-200 shadow-sm hover:shadow active:scale-95"
                      aria-label="Exit current assessment and return to symptom selection"
                    >
                        Exit Chat
                    </button>
                ) : (
                    <div className="flex items-center space-x-2" role="status" aria-label="System status: Online">
                    <span className="relative flex h-2 w-2" aria-hidden="true">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide hidden sm:block">Online</span>
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
        
        {stage === 'selection' ? (
            /* --- DASHBOARD VIEW --- */
            <div className="animate-fade-in pb-20" ref={mainContentRef}>
                {/* Hero / Search Section - Warmer gradient */}
                <div className="hero-gradient px-4 pt-10 pb-12 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay" aria-hidden="true">
                         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" /></svg>
                    </div>
                    <div className="max-w-2xl mx-auto text-center relative z-10">
                        {/* Personalized greeting with last assessment date */}
                        {getLastAssessmentDate() && (
                          <p className="text-emerald-200 text-xs mb-2 font-medium">
                            Welcome back! Last check: {getLastAssessmentDate()}
                          </p>
                        )}
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                          Let's check on how you're feeling 💚
                        </h2>
                        <p className="text-emerald-100 text-sm md:text-base mb-2 opacity-90">
                          Select a symptom below and we'll go through it together.
                        </p>
                        {/* Reassurance messaging */}
                        <p className="text-emerald-200/80 text-xs mb-8 gentle-pulse">
                          Take your time — there's no rush. 🌿
                        </p>
                        
                        {/* Mobile Font Size Selector */}
                        <div className="sm:hidden flex justify-center mb-6">
                          <FontSizeSelector fontScale={fontScale} setFontScale={setFontScale} />
                        </div>
                        
                        <div className="relative max-w-lg mx-auto group mb-4">
                            <label htmlFor="symptom-search" className="sr-only">Search symptoms</label>
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none" aria-hidden="true">
                                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input 
                                id="symptom-search"
                                type="search" 
                                className="block w-full pl-12 pr-4 py-4 rounded-2xl text-slate-900 placeholder-slate-400 bg-white shadow-xl focus:ring-4 focus:ring-teal-500/30 focus:outline-none text-base transition-all"
                                placeholder="Search symptoms (e.g. Fever, Pain)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search symptoms by name"
                                aria-describedby="search-results-count"
                            />
                            <span id="search-results-count" className="sr-only">
                              {filteredSymptoms.length} symptoms found
                            </span>
                        </div>
                        
                        {/* Quick Filter Pills */}
                        <div className="flex flex-wrap justify-center gap-2 mb-4">
                          {[
                            { id: 'all', label: 'All', icon: '🔍' },
                            { id: 'digestive', label: 'Digestive', icon: '🍽️' },
                            { id: 'pain', label: 'Pain', icon: '💢' },
                            { id: 'respiratory', label: 'Breathing', icon: '🫁' },
                            { id: 'neurological', label: 'Neuro', icon: '🧠' },
                            { id: 'skin', label: 'Skin', icon: '🩹' },
                            { id: 'general', label: 'General', icon: '🌡️' },
                          ].map(filter => (
                            <button
                              key={filter.id}
                              onClick={() => setActiveFilter(filter.id as FilterCategory)}
                              className={`filter-pill ${activeFilter === filter.id ? 'active bg-white text-teal-700' : 'bg-teal-800/40 text-teal-100 hover:bg-teal-800/60'}`}
                            >
                              <span className="mr-1">{filter.icon}</span> {filter.label}
                            </button>
                          ))}
                        </div>
                        
                        <div 
                          className="flex justify-center items-center space-x-3 bg-teal-800/50 inline-block p-1 rounded-full backdrop-blur-sm"
                          role="radiogroup"
                          aria-label="Selection mode"
                        >
                             <button 
                                onClick={() => { setIsMultiSelectMode(false); setSelectedSymptoms([]); }}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${!isMultiSelectMode ? 'bg-white text-teal-700 shadow' : 'text-teal-200 hover:text-white'}`}
                                role="radio"
                                aria-checked={!isMultiSelectMode}
                                aria-label="Single symptom check mode"
                             >
                                 Single Check
                             </button>
                             <button 
                                onClick={() => setIsMultiSelectMode(true)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${isMultiSelectMode ? 'bg-white text-teal-700 shadow' : 'text-teal-200 hover:text-white'}`}
                                role="radio"
                                aria-checked={isMultiSelectMode}
                                aria-label="Multiple symptom selection mode"
                             >
                                 Multi-Select
                             </button>
                        </div>
                    </div>
                </div>

                {/* Recently Checked Section */}
                {recentSymptoms.length > 0 && activeFilter === 'all' && !searchQuery && (
                  <div className="bg-amber-50 border-b border-amber-100 py-4">
                    <div className="max-w-5xl mx-auto px-4">
                      <div className="flex items-center mb-3">
                        <span className="text-amber-600 mr-2">🕐</span>
                        <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Recently Checked</span>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {recentSymptoms.map(s => (
                          <button
                            key={s.id}
                            onClick={() => handleCardClick(s.id)}
                            className="shrink-0 px-4 py-2 bg-white rounded-xl border border-amber-200 text-sm font-medium text-amber-800 hover:bg-amber-100 transition-colors shadow-sm flex items-center"
                          >
                            <span className="mr-2">{s.icon}</span>
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Category Jump Nav */}
                <nav 
                  className="bg-white border-b border-slate-100 py-4 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] relative z-20"
                  aria-label="Symptom categories"
                >
                    <div className="max-w-5xl mx-auto px-4">
                        <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1" role="group">
                             <span className="text-xs font-bold text-slate-400 uppercase mr-2 shrink-0 hidden sm:inline-block" id="category-nav-label">Jump to:</span>
                             <button 
                               onClick={() => { setEmergencyCollapsed(false); setTimeout(() => scrollToSection(emergencyRef), 100); }} 
                               className="shrink-0 px-4 py-2 rounded-full bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider border border-red-100 hover:bg-red-100 transition-colors shadow-sm focus-emergency"
                               aria-label="Jump to emergency symptoms section"
                             >
                               ⚠ Emergency
                             </button>
                             <button 
                               onClick={() => scrollToSection(commonRef)} 
                               className="shrink-0 px-4 py-2 rounded-full bg-teal-50 text-teal-600 font-bold text-xs uppercase tracking-wider border border-teal-100 hover:bg-teal-100 transition-colors shadow-sm"
                               aria-label="Jump to common side effects section"
                             >
                               ○ Common Side Effects
                             </button>
                             <button 
                               onClick={() => scrollToSection(otherRef)} 
                               className="shrink-0 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-xs uppercase tracking-wider border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm"
                               aria-label="Jump to general symptoms section"
                             >
                               ◇ General Symptoms
                             </button>
                        </div>
                    </div>
                </nav>

                {/* Cards Container - Reordered: Common first, then Other, Emergency last (collapsible) */}
                <div className="max-w-5xl mx-auto px-4 mt-8 relative z-10 space-y-14">
                    
                    {/* Common Side Effects - First (most relevant for oncology patients) */}
                    {(COMMON_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <section ref={commonRef} className="scroll-mt-32" aria-labelledby="common-heading">
                            <div className="flex items-center mb-6 pb-2 border-b border-slate-100">
                                <span className="bg-teal-100 text-teal-600 p-2 rounded-xl mr-3" aria-hidden="true"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></span>
                                <div>
                                  <h3 id="common-heading" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Common Side Effects</h3>
                                  <p className="text-xs text-slate-400">Treatment-related symptoms we can help with</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Common side effects list">
                                {COMMON_SYMPTOMS.map(s => (
                                    <SymptomCard key={s.id} symptom={s} onClick={handleCardClick} variant="common" result={visitedSymptoms.includes(s.id) ? symptomResults[s.id] : undefined} isMultiSelectMode={isMultiSelectMode} isSelected={selectedSymptoms.includes(s.id)} />
                                ))}
                                {COMMON_SYMPTOMS.length === 0 && <p className="text-slate-400 italic text-sm col-span-full text-center py-8" role="status">No common symptoms match your filter.</p>}
                            </div>
                        </section>
                    )}

                    {/* General & Other Symptoms - Second */}
                    {(OTHER_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <section ref={otherRef} className="scroll-mt-32" aria-labelledby="other-heading">
                            <div className="flex items-center mb-6 pb-2 border-b border-slate-100">
                                <span className="bg-indigo-100 text-indigo-600 p-2 rounded-xl mr-3" aria-hidden="true"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></span>
                                <div>
                                  <h3 id="other-heading" className="text-sm font-bold text-slate-700 uppercase tracking-widest">General Symptoms</h3>
                                  <p className="text-xs text-slate-400">Other concerns you may want to check</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="General symptoms list">
                                {OTHER_SYMPTOMS.map(s => (
                                    <SymptomCard key={s.id} symptom={s} onClick={handleCardClick} variant="other" result={visitedSymptoms.includes(s.id) ? symptomResults[s.id] : undefined} isMultiSelectMode={isMultiSelectMode} isSelected={selectedSymptoms.includes(s.id)} />
                                ))}
                                {OTHER_SYMPTOMS.length === 0 && <p className="text-slate-400 italic text-sm col-span-full text-center py-8" role="status">No general symptoms match your filter.</p>}
                            </div>
                        </section>
                    )}

                    {/* Emergency Symptoms - Last, Collapsible to reduce anxiety */}
                    {(URGENT_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <section ref={emergencyRef} className="scroll-mt-32" aria-labelledby="emergency-heading">
                            <button 
                              onClick={() => setEmergencyCollapsed(!emergencyCollapsed)}
                              className="collapsible-header w-full flex items-center justify-between mb-4 pb-2 border-b border-red-100 hover:bg-red-50/50 rounded-lg p-2 -ml-2 transition-colors"
                              aria-expanded={!emergencyCollapsed}
                            >
                                <div className="flex items-center">
                                  <span className="bg-red-100 text-red-600 p-2 rounded-xl mr-3 status-pattern-emergency" aria-hidden="true"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></span>
                                  <div className="text-left">
                                    <h3 id="emergency-heading" className="text-sm font-bold text-red-700 uppercase tracking-widest">Emergency Symptoms</h3>
                                    <p className="text-xs text-red-400">For urgent concerns — tap to {emergencyCollapsed ? 'expand' : 'collapse'}</p>
                                  </div>
                                </div>
                                <svg className={`w-5 h-5 text-red-400 transition-transform ${emergencyCollapsed ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div className={`collapsible-content ${emergencyCollapsed ? '' : 'expanded'}`}>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Emergency symptoms list">
                                  {URGENT_SYMPTOMS.map(s => (
                                      <SymptomCard key={s.id} symptom={s} onClick={handleCardClick} variant="emergency" result={visitedSymptoms.includes(s.id) ? symptomResults[s.id] : undefined} isMultiSelectMode={isMultiSelectMode} isSelected={selectedSymptoms.includes(s.id)} />
                                  ))}
                                  {URGENT_SYMPTOMS.length === 0 && <p className="text-slate-400 italic text-sm col-span-full text-center py-8" role="status">No emergency symptoms match your filter.</p>}
                              </div>
                            </div>
                        </section>
                    )}
                    
                    <div className="text-center border-t border-slate-200 pt-10 pb-8">
                        <p className="text-xs text-slate-400 mb-1">OncoLife Triage Protocol v3.0 • Clinical Pathways Loaded</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">OncoLife is Powered by KanasuLabs | 2025</p>
                    </div>
                </div>
                
                {isMultiSelectMode && selectedSymptoms.length > 0 && (
                    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in w-full max-w-sm px-4" role="region" aria-live="polite">
                        <button 
                            onClick={handleStartMultiSession}
                            className="w-full bg-slate-900 text-white py-4 rounded-2xl shadow-2xl font-bold text-lg flex items-center justify-center hover:bg-slate-800 transition-all active:scale-95"
                            aria-label={`Start assessment for ${selectedSymptoms.length} selected symptoms`}
                        >
                            <span>Start Assessment ({selectedSymptoms.length})</span>
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
                    <div className="animate-fade-in mt-8 mb-8">
                        {highestSeverity === 'call_911' && (
                            <div 
                              className="bg-red-50 border border-red-100 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden status-pattern-emergency"
                              role="alert"
                              aria-live="assertive"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-20 -mr-10 -mt-10" aria-hidden="true"></div>
                                <div className="text-6xl mb-4 animate-bounce" aria-hidden="true">🚨</div>
                                <h2 className="text-3xl font-extrabold text-red-700 mb-2 tracking-tight">⚠ EMERGENCY</h2>
                                <p className="text-red-800 text-lg font-semibold mb-6">Call 911 or your Care Team right away. This is an emergency.</p>
                                
                                {/* Emergency Action Buttons */}
                                <div className="grid gap-3 mb-6">
                                  {/* Phone Dialer Button - auto-opens phone on mobile */}
                                  <a 
                                    href="tel:911"
                                    className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-xl hover:bg-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
                                  >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    Call 911 Now
                                  </a>
                                  
                                  {/* I've Called 911 Confirmation */}
                                  {!showEmergencyConfirm ? (
                                    <button
                                      onClick={() => setShowEmergencyConfirm(true)}
                                      className="w-full py-3 bg-white text-red-700 rounded-xl font-semibold border-2 border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      I've already called 911
                                    </button>
                                  ) : (
                                    <div className="bg-green-100 border border-green-200 rounded-xl p-4 text-green-800">
                                      <p className="font-semibold flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Confirmed — help is on the way
                                      </p>
                                      <p className="text-sm mt-1 text-green-700">Stay calm. If possible, unlock your door and wait for emergency services.</p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="bg-white rounded-2xl p-5 border border-red-100 text-left shadow-sm">
                                    <p className="text-[10px] text-red-400 uppercase font-bold mb-3 tracking-widest">Clinical Reasoning:</p>
                                    <ul className="space-y-2 text-red-900 text-sm font-medium" aria-label="Reasons for emergency status">
                                        {triageReasons.map((r, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 text-red-500 font-bold" aria-hidden="true">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'notify_care_team' && (
                            <div 
                              className="bg-amber-50 border border-amber-100 rounded-3xl p-8 shadow-xl text-center status-pattern-alert"
                              role="alert"
                              aria-live="polite"
                            >
                                <div className="text-6xl mb-4" aria-hidden="true">⚠️</div>
                                <h2 className="text-3xl font-extrabold text-amber-700 mb-2 tracking-tight">⚡ ALERT - Clinical Alert</h2>
                                <p className="text-amber-900 text-lg font-medium mb-8">I have captured these details and am notifying your care team. Please keep your phone nearby for a call from the clinic.</p>
                                <div className="bg-white rounded-2xl p-5 border border-amber-100 text-left shadow-sm">
                                    <p className="text-[10px] text-amber-400 uppercase font-bold mb-3 tracking-widest">Clinical Reasoning:</p>
                                    <ul className="space-y-2 text-amber-900 text-sm font-medium" aria-label="Reasons for alert status">
                                        {triageReasons.map((r, i) => (
                                             <li key={i} className="flex items-start">
                                                <span className="mr-2 text-amber-500 font-bold" aria-hidden="true">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'refer_provider' && (
                            <div 
                              className="bg-blue-50 border border-blue-100 rounded-3xl p-8 shadow-xl text-center"
                              role="status"
                              aria-live="polite"
                            >
                                <div className="text-6xl mb-4" aria-hidden="true">ℹ️</div>
                                <h2 className="text-3xl font-extrabold text-blue-700 mb-2 tracking-tight">📋 CONSULT - Non-Urgent</h2>
                                <p className="text-blue-900 mb-6 text-lg">Please let your care team know about these symptoms at your next appointment.</p>
                                <p className="text-blue-800 mb-8 text-sm font-medium">This chatbot is not a substitute for medical care. If you feel unsafe, please call 911.</p>
                                <div className="bg-white rounded-2xl p-5 border border-blue-100 text-left shadow-sm">
                                    <p className="text-[10px] text-blue-400 uppercase font-bold mb-3 tracking-widest">Notes:</p>
                                    <ul className="space-y-2 text-blue-900 text-sm font-medium" aria-label="Assessment notes">
                                        {triageReasons.map((r, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 text-blue-500 font-bold" aria-hidden="true">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'none' && (
                            <div 
                              className="bg-green-50 border border-green-100 rounded-3xl p-8 shadow-xl text-center status-pattern-safe"
                              role="status"
                              aria-live="polite"
                            >
                                <div className="text-6xl mb-4" aria-hidden="true">✅</div>
                                <h2 className="text-3xl font-extrabold text-green-700 mb-2 tracking-tight">✓ SAFE - Non-Urgent</h2>
                                <p className="text-green-900 mb-4 text-lg">Please let your care team know about these symptoms at your next appointment.</p>
                                <p className="text-sm text-green-700 font-medium">This chatbot is not a substitute for medical care. If you feel unsafe, please call 911.</p>
                            </div>
                        )}

                        {visitedSymptoms.length > 0 && (
                            <div className="mt-8 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-50">Session Summary</h3>
                                <div className="space-y-4">
                                    {visitedSymptoms.map(sId => {
                                        const sDef = SYMPTOMS[sId];
                                        const res = symptomResults[sId] || 'none';
                                        
                                        let statusColor = "bg-slate-100 text-slate-600";
                                        let statusText = "Checked";
                                        
                                        if (res === 'call_911') { statusColor = "bg-red-100 text-red-700 border border-red-200"; statusText = "Emergency Alert"; }
                                        else if (res === 'notify_care_team') { statusColor = "bg-amber-100 text-amber-700 border border-amber-200"; statusText = "Care Team Alert"; }
                                        else if (res === 'refer_provider') { statusColor = "bg-blue-100 text-blue-700 border border-blue-200"; statusText = "Provider Consult"; }
                                        else if (res === 'none') { statusColor = "bg-green-100 text-green-700 border border-green-200"; statusText = "Safe / No Action"; }

                                        return (
                                            <div key={sId} className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <span className="text-slate-700 font-semibold text-sm">{sDef.name}</span>
                                                </div>
                                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide ${statusColor}`}>
                                                    {statusText}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Session Actions */}
                        <div className="grid gap-3 mt-8">
                            {/* Primary Actions */}
                            <button 
                                onClick={continueSession}
                                className="w-full py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
                            >
                                <span>Check Another Symptom</span>
                                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            </button>

                            {/* Secondary Actions Row */}
                            <div className="grid grid-cols-3 gap-2">
                              {/* Email Summary */}
                              <button 
                                onClick={() => {
                                  const subject = encodeURIComponent('OncoLife Symptom Assessment Summary');
                                  const body = encodeURIComponent(`Symptoms Checked: ${visitedSymptoms.map(s => SYMPTOMS[s].name).join(', ')}\n\nStatus: ${highestSeverity === 'call_911' ? 'Emergency' : highestSeverity === 'notify_care_team' ? 'Alert' : highestSeverity === 'refer_provider' ? 'Consult' : 'Safe'}\n\nNotes:\n${triageReasons.join('\n')}\n\nDate: ${new Date().toLocaleDateString()}`);
                                  window.location.href = `mailto:?subject=${subject}&body=${body}`;
                                }}
                                className="py-3 px-2 bg-white text-slate-700 rounded-xl font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1"
                                title="Email summary to your care team"
                              >
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <span>Email</span>
                              </button>
                              
                              {/* Save as PDF (print) */}
                              <button 
                                onClick={() => window.print()}
                                className="py-3 px-2 bg-white text-slate-700 rounded-xl font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1"
                                title="Save or print summary"
                              >
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                <span>Print/PDF</span>
                              </button>
                              
                              {/* Set Reminder */}
                              <button 
                                onClick={() => {
                                  const reminderTime = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4 hours from now
                                  const title = encodeURIComponent('Symptom Recheck - OncoLife');
                                  const details = encodeURIComponent(`Time to recheck your symptoms: ${visitedSymptoms.map(s => SYMPTOMS[s].name).join(', ')}`);
                                  // Try to open calendar (works on most devices)
                                  const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${reminderTime.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(reminderTime.getTime() + 30*60000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
                                  window.open(calendarUrl, '_blank');
                                }}
                                className="py-3 px-2 bg-white text-slate-700 rounded-xl font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-1"
                                title="Set a reminder to recheck in 4 hours"
                              >
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Remind</span>
                              </button>
                            </div>

                            <button 
                                onClick={reset}
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                End Session & Start Over
                            </button>
                        </div>
                        
                        <div className="text-center mt-10 pb-4">
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">OncoLife is Powered by KanasuLabs | 2025</p>
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>

      {stage !== 'selection' && stage !== 'complete' && (
        <footer 
          className="bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-8 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] w-full shrink-0 z-30 max-h-[55dvh] overflow-y-auto overscroll-contain"
          role="region"
          aria-label="Answer input area"
        >
            <div className="max-w-2xl mx-auto animate-fade-in">
                {currentQuestion?.type === 'yes_no' && (
                <div className="grid grid-cols-5 gap-4" role="group" aria-label="Yes or No answer options">
                    {/* No button - smaller, less prominent */}
                    <button 
                      onClick={() => handleAnswer(false)} 
                      className="col-span-2 p-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 text-lg hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all"
                      aria-label="Answer No"
                    >
                      No
                    </button>
                    {/* Yes button - larger, more prominent (action-triggering) */}
                    <button 
                      onClick={() => handleAnswer(true)} 
                      className="col-span-3 p-5 rounded-2xl bg-teal-600 text-white font-bold text-xl shadow-lg hover:bg-teal-700 active:scale-95 transition-all yes-button-prominent"
                      aria-label="Answer Yes"
                    >
                      Yes ✓
                    </button>
                </div>
                )}

                {currentQuestion?.type === 'choice' && (
                <div className="grid grid-cols-1 gap-3" role="radiogroup" aria-label="Select one option">
                    {currentQuestion.options?.map(opt => (
                        <button 
                        key={opt.value.toString()} 
                        onClick={() => handleAnswer(opt.value)}
                        className="p-4 rounded-2xl border border-slate-200 text-left font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-all shadow-sm active:scale-98 whitespace-normal"
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