import React from "react";

// --- Types & Interfaces ---

export type InputType = 'yes_no' | 'text' | 'number' | 'choice' | 'multiselect';
export type ActionLevel = 'none' | 'refer_provider' | 'notify_care_team' | 'call_911';

export interface Option {
  label: string;
  value: string | boolean | number;
}

export interface Question {
  id: string;
  text: string;
  type: InputType;
  options?: Option[];
}

export interface LogicResult {
  action: 'continue' | 'branch' | 'stop';
  triageLevel?: ActionLevel;
  triageMessage?: string;
  branchToSymptomId?: string;
  skipRemaining?: boolean; 
}

export interface SymptomDef {
  id: string;
  name: string;
  category: 'emergency' | 'common' | 'other';
  icon: React.ReactNode;
  screeningQuestions: Question[];
  evaluateScreening: (answers: Record<string, any>) => LogicResult;
  followUpQuestions?: Question[];
  evaluateFollowUp?: (answers: Record<string, any>) => LogicResult;
  hidden?: boolean; // For progressive disclosure
}

// --- HELPERS ---

export const isHigherSeverity = (current: ActionLevel, newLevel: ActionLevel): boolean => {
    const levels = ['none', 'refer_provider', 'notify_care_team', 'call_911'];
    return levels.indexOf(newLevel) > levels.indexOf(current);
};

// --- ICONS ---
const Icons = {
  Lungs: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Heart: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Bleed: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Drop: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, 
  Brain: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, 
  Head: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
  Stomach: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  Leg: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, 
  Port: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>,
  Water: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Thermometer: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Nausea: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Vomit: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, 
  Poop: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>,
  Sleep: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  Eye: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>,
  Mouth: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Food: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Toilet: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>,
  Rash: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>,
  Pain: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Joint: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  Ache: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
  Swelling: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
  Cough: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>,
  Nerve: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
};

// --- DATA: Strict Logic Implementation ---

export const SYMPTOMS: Record<string, SymptomDef> = {
  // --- EMERGENCY ---
  'URG-101': {
    id: 'URG-101',
    name: 'Trouble Breathing',
    category: 'emergency',
    icon: Icons.Lungs,
    screeningQuestions: [
      { id: 'q1', text: 'I understand. Are you having Trouble Breathing or Shortness of Breath right now?', type: 'yes_no' }
    ],
    evaluateScreening: (answers) => {
      if (answers['q1'] === true) return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Patient reports Trouble Breathing or Shortness of Breath.' };
      return { action: 'continue' };
    }
  },
  'URG-102': {
    id: 'URG-102',
    name: 'Chest Pain',
    category: 'emergency',
    hidden: true, // Hidden for hierarchy - accessed via "Pain"
    icon: Icons.Heart,
    screeningQuestions: [
      { id: 'q1', text: 'Are you having Chest pain?', type: 'yes_no' }
    ],
    evaluateScreening: (answers) => {
      if (answers['q1'] === true) return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Patient reports Chest Pain.' };
      return { action: 'continue' };
    }
  },
  'URG-103': {
    id: 'URG-103',
    name: 'Bleeding / Bruising',
    category: 'emergency',
    icon: Icons.Bleed,
    screeningQuestions: [
        { id: 'pressure', text: 'Are you bleeding and the bleeding won\'t stop with pressure?', type: 'yes_no' },
        { id: 'stool_urine', text: 'Do you have any blood in your stool or urine?', type: 'yes_no' },
        { id: 'injury', text: 'Did you injure yourself?', type: 'yes_no' },
        { id: 'thinners', text: 'Are you on blood thinners?', type: 'yes_no' },
        { id: 'location', text: 'Is the bruising in one area or all over?', type: 'choice', options: [{label: 'One Area', value: 'one'}, {label: 'All Over', value: 'all'}] },
    ],
    evaluateScreening: (answers) => {
        if (answers['pressure'] === true || answers['stool_urine'] === true) {
            return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Non-stop Bleeding or Significant GI/GU Bleed.' };
        }
        return { action: 'continue' };
    }
  },
  'URG-107': {
      id: 'URG-107',
      name: 'Fainting / Syncope',
      category: 'emergency',
      icon: Icons.Drop,
      screeningQuestions: [
          { id: 'faint', text: 'Have you fainted or felt like you were going to faint?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          if (answers['faint'] === true) return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Patient reports fainting or near-fainting episode.' };
          return { action: 'continue' };
      }
  },
  'URG-108': {
      id: 'URG-108',
      name: 'Altered Mental Status',
      category: 'emergency',
      icon: Icons.Brain,
      screeningQuestions: [
          { id: 'confused', text: 'Are you feeling confused, disoriented, or having trouble speaking?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          if (answers['confused'] === true) return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Patient reports confusion, disorientation, or sudden change.' };
          return { action: 'continue' };
      }
  },
  
  // --- MOVED TO OTHER PER CLINICAL REQUEST ---
  'URG-109': {
      id: 'URG-109',
      name: 'Headache',
      category: 'other',
      hidden: true, // Hidden for hierarchy
      icon: Icons.Head,
      screeningQuestions: [
          { id: 'worst_ever', text: 'Is this the worst headache you’ve ever had?', type: 'yes_no' },
          { id: 'neuro_symptoms', text: 'Do you also have any of these symptoms:', type: 'multiselect', options: [
              {label: 'Blurred or double vision', value: 'vision'},
              {label: 'Trouble speaking or understanding words', value: 'speech'},
              {label: 'One side of your face looks droopy', value: 'face'},
              {label: 'One arm or leg feels weak, heavy, or harder to move than the other', value: 'weakness'},
              {label: 'Trouble walking or keeping your balance', value: 'balance'},
              {label: 'Confusion or trouble staying awake', value: 'confusion'},
              {label: 'None', value: 'none'}
          ]}
      ],
      evaluateScreening: (answers) => {
          const symps = answers['neuro_symptoms'] || [];
          if (answers['worst_ever'] === true || (symps.length > 0 && !symps.includes('none'))) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Severe Headache reported.' };
          }
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Headache reported.' };
      }
  },
  'URG-110': {
      id: 'URG-110',
      name: 'Severe Abdominal Pain',
      category: 'other',
      hidden: true, // Hidden for hierarchy
      icon: Icons.Stomach,
      screeningQuestions: [
          { id: 'pain_scale', text: 'Rate your pain on a scale from 1-10 with 10 being the worst pain.', type: 'number' },
          { id: 'red_flags', text: 'Do you have any of these?', type: 'multiselect', options: [
              {label: 'Fever', value: 'fever'},
              {label: 'Belly swollen/hard', value: 'swollen'},
              {label: 'Repeated vomiting', value: 'vomit'},
              {label: 'Cannot pass gas/stool', value: 'blockage'},
              {label: 'None', value: 'none'}
          ]}
      ],
      evaluateScreening: (answers) => {
          const score = parseInt(answers['pain_scale']);
          const flags = answers['red_flags'] || [];
          // Check pain scale > 7
          if ((!isNaN(score) && score > 7) || (flags.length > 0 && !flags.includes('none'))) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Severe Abdominal Pain (>7/10) or Red Flags.' };
          }
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Abdominal pain reported.' };
      }
  },
  'URG-111': {
      id: 'URG-111',
      name: 'Leg/Calf Pain',
      category: 'other',
      hidden: true, // Hidden for hierarchy
      icon: Icons.Leg,
      screeningQuestions: [
          { id: 'description', text: 'Please explain the symptoms you are having?', type: 'text' }
      ],
      evaluateScreening: (answers) => {
          // Removed 911 trigger for DVT signs as per clinical request. Now captures text and alerts care team.
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Leg pain reported (Review text description).' };
      }
  },
  'URG-114': {
      id: 'URG-114',
      name: 'Port Site Pain',
      category: 'other',
      hidden: true, // Hidden for hierarchy
      icon: Icons.Port,
      screeningQuestions: [
          { id: 'infection_signs', text: 'Do you have redness, drainage, or chills?', type: 'yes_no' },
          { id: 'temp', text: 'What is your temperature? (Number only)', type: 'number' }
      ],
      evaluateScreening: (answers) => {
          const t = parseFloat(answers['temp']);
          if (answers['infection_signs'] === true || (!isNaN(t) && t > 100.3)) {
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Port site infection signs or Fever.' };
          }
           return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Port site pain reported.' };
      }
  },

  // --- COMMON SIDE EFFECTS ---
  'DEH-201': {
    id: 'DEH-201',
    name: 'Dehydration',
    category: 'common',
    icon: Icons.Water,
    screeningQuestions: [
      { id: 'urine_color', text: 'I want to make sure you\'re staying hydrated. What color is your urine?', type: 'choice', options: [{label: 'Clear/Pale', value: 'clear'}, {label: 'Yellow', value: 'yellow'}, {label: 'Dark/Amber', value: 'dark'}] },
      { id: 'urine_amt', text: 'Is the amount of urine a lot less over the last 12 hours?', type: 'yes_no' },
      { id: 'thirsty', text: 'Are you very thirsty?', type: 'yes_no' },
      { id: 'lightheaded', text: 'Are you lightheaded?', type: 'yes_no' },
      { id: 'hr_sbp', text: 'Has a doctor told you your Heart Rate is >100 or BP <100?', type: 'yes_no' }
    ],
    evaluateScreening: (answers) => {
      if (answers['hr_sbp'] === true || answers['thirsty'] === true || answers['lightheaded'] === true || answers['urine_amt'] === true || answers['urine_color'] === 'dark') {
        return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration Signs: HR>100, SBP<100, Thirsty, Lightheaded, or Reduced Urine.' };
      }
      return { action: 'continue' };
    },
    followUpQuestions: [
        { id: 'has_vomiting', text: 'Do you have vomiting?', type: 'yes_no' },
        { id: 'has_diarrhea', text: 'Do you have diarrhea?', type: 'yes_no' },
        { id: 'intake', text: 'Are you able to eat/drink?', type: 'yes_no' },
        { id: 'fever', text: 'Do you have a fever?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
        if (answers['has_vomiting'] === true) return { action: 'branch', branchToSymptomId: 'VOM-204' };
        if (answers['has_diarrhea'] === true) return { action: 'branch', branchToSymptomId: 'DIA-205' };
        if (answers['fever'] === true) return { action: 'branch', branchToSymptomId: 'FEV-202' };
        return { action: 'continue' };
    }
  },
  'FEV-202': {
    id: 'FEV-202',
    name: 'Fever',
    category: 'common',
    icon: Icons.Thermometer,
    screeningQuestions: [
      { id: 'temp', text: 'Fever can be worrying. What is your temperature? (Enter number, e.g., 101.5)', type: 'number' }
    ],
    evaluateScreening: (answers) => {
      const t = parseFloat(answers['temp']);
      // Logic Update: If Temp <= 100.3, STOP immediately with specific message.
      if (!isNaN(t) && t <= 100.3) {
           return { action: 'stop', triageLevel: 'none', triageMessage: 'Please take your temperature frequently, we get concerned if the temperature is >100.3.' };
      }
      // If Temp > 100.3, Continue with Alert
      if (!isNaN(t) && t > 100.3) {
        return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Temp > 100.3F.' };
      }
      return { action: 'continue' };
    },
    followUpQuestions: [
        { id: 'days', text: '1. How many days have you had a fever?', type: 'text' },
        { id: 'breathing', text: '2. Any trouble breathing?', type: 'yes_no' },
        { id: 'symptoms', text: '3. Select all that apply:', type: 'multiselect', options: [
            {label: 'Rapid Heart Rate', value: 'hr'}, {label: 'Nausea', value: 'nausea'}, {label: 'Vomiting', value: 'vomit'}, 
            {label: 'Abdominal Pain', value: 'abd_pain'}, {label: 'Diarrhea', value: 'diarrhea'}, {label: 'Port Redness', value: 'port'}, {label: 'Cough', value: 'cough'},
            {label: 'Dizziness', value: 'dizzy'}, {label: 'Confusion', value: 'confusion'}, {label: 'Burning at urination', value: 'burning'},
            {label: 'None', value: 'none'}
        ]},
        { id: 'intake', text: '4. Have you been able to eat/drink normally?', type: 'choice', options: [
            {label: 'Reduced appetite but can still eat/drink', value: 'reduced'},
            {label: 'Difficulty keeping food or fluids down', value: 'difficulty'},
            {label: 'Barely can eat or drink anything', value: 'barely'},
            {label: 'Not been able to eat/drink in last 24 hours', value: 'none'},
            {label: 'Yes, Normal', value: 'normal'}
        ]},
        { id: 'adl', text: '5. Are you able to perform daily self care like bathing, using the toilet, eating independently?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
        if (answers['breathing'] === true) return { action: 'branch', branchToSymptomId: 'URG-101' };
        
        const symps = answers['symptoms'] || [];
        if (symps.includes('confusion')) return { action: 'branch', branchToSymptomId: 'URG-108' };

        return { action: 'continue' };
    }
  },
  'NAU-203': {
    id: 'NAU-203',
    name: 'Nausea',
    category: 'common',
    icon: Icons.Nausea,
    screeningQuestions: [
      { id: 'days', text: 'I\'m sorry to hear you\'re feeling nauseous. How long has this been going on?', type: 'choice', options: [{label: 'Less than a day', value: '<1'}, {label: 'Last 24 hours', value: '24h'}, {label: '2-3 days', value: '2-3d'}, {label: '>3 days', value: '>3d'}] },
      { id: 'intake', text: 'Have you been able to eat and drink without much difficulty in the last 24 hours?', type: 'choice', options: [
          {label: 'Reduced but can still eat/drink', value: 'reduced'},
          {label: 'Difficulty keeping food/fluids down', value: 'difficulty'},
          {label: 'Cannot eat/drink anything', value: 'severe'},
          {label: 'Not eaten/drunk in 24h', value: 'none'}
      ]},
      { id: 'meds', text: 'What anti-nausea medications are you taking?', type: 'text' },
      { id: 'med_freq', text: 'How often are you taking these medications?', type: 'text' },
      { id: 'severity_post_meds', text: 'Rate your nausea after taking medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
      { id: 'trend', text: 'Is it worsening or staying the same?', type: 'choice', options: [{label: 'Worsening/Same', value: 'bad'}, {label: 'Improving', value: 'good'}]}
    ],
    evaluateScreening: (answers) => {
       // "Intake Almost Nothing/Haven't eaten OR Rating Severe DESPITE meds OR Rating Moderate for ≥3 days and worsening/same"
       const intakeBad = answers['intake'] === 'none' || answers['intake'] === 'severe';
       const sevBad = answers['severity_post_meds'] === 'sev';
       const modChronic = answers['severity_post_meds'] === 'mod' && (answers['days'] === '2-3d' || answers['days'] === '>3d') && answers['trend'] === 'bad';

       if (intakeBad || sevBad || modChronic) {
           return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Intake Issue OR Severe Nausea OR Moderate for ≥3 days.' };
       }
       return { action: 'continue' };
    },
    followUpQuestions: [
        { id: 'vomited', text: 'Have you vomited?', type: 'yes_no' },
        { id: 'cramping', text: 'Do you have abdominal cramping or pain?', type: 'yes_no' },
        { id: 'fluid_retention', text: 'Have you been able to keep fluids or food down for more than 24 hours?', type: 'yes_no' },
        { id: 'dehydration', text: 'Are you experiencing any signs of dehydration?', type: 'multiselect', options: [
            {label: 'Very dark urine', value: 'dark_urine'}, {label: 'Constantly thirsty', value: 'thirsty'}, 
            {label: 'Reduced urination > 12h', value: 'no_urine'}, {label: 'None', value: 'none'}
        ]},
        { id: 'adl', text: 'Are you able to perform daily self care like bathing and dressing yourself?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
        if (answers['vomited'] === true) return { action: 'branch', branchToSymptomId: 'VOM-204' };
        const dehy = answers['dehydration'] || [];
        if (dehy.length > 0 && !dehy.includes('none')) return { action: 'branch', branchToSymptomId: 'DEH-201' };
        return { action: 'continue' };
    }
  },
  'VOM-204': {
      id: 'VOM-204',
      name: 'Vomiting',
      category: 'common',
      icon: Icons.Vomit,
      screeningQuestions: [
          { id: 'days', text: 'Vomiting can be very draining. How many days have you been vomiting?', type: 'text' },
          { id: 'vom_freq', text: 'How many times have you vomited in the last 24 hours?', type: 'choice', options: [{label: '1-2 times', value: 'low'}, {label: '3-5 times', value: 'med'}, {label: '>6 times', value: 'high'}]},
          { id: 'intake_12h', text: 'How is your oral intake over the last 12 hours?', type: 'choice', options: [
              {label: 'Reduced but okay', value: 'ok'}, {label: 'Difficulty keeping food down', value: 'hard'}, 
              {label: 'Barely eat/drink', value: 'barely'}, {label: 'No intake 12 hrs', value: 'none'}
          ]},
          { id: 'meds', text: 'What medications for vomiting are you taking?', type: 'text' },
          { id: 'severity_post_med', text: 'Rate your vomiting after taking medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          // ">6 episodes in 24 hrs AND/OR No oral intake for ≥12 hrs OR Rating Severe DESPITE meds OR Rating Moderate for ≥3 days"
          if (answers['vom_freq'] === 'high' || answers['intake_12h'] === 'none' || answers['severity_post_med'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: '>6 episodes in 24 hrs OR No intake 12h OR Severe.' };
          }
          if (answers['severity_post_med'] === 'mod') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate Vomiting reported.' };
          }
          return { action: 'continue'};
      },
      followUpQuestions: [
          { id: 'abd_pain', text: 'Do you have abdominal pain or cramping?', type: 'yes_no' },
          { id: 'has_diarrhea', text: 'Do you also have diarrhea?', type: 'yes_no' },
          { id: 'has_constipation', text: 'Do you also have constipation?', type: 'yes_no' },
          { id: 'adl', text: 'Are you able to perform daily self care?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['has_diarrhea'] === true) return { action: 'branch', branchToSymptomId: 'DIA-205' }; 
          if (answers['has_constipation'] === true) return { action: 'branch', branchToSymptomId: 'CON-210' };
          return { action: 'continue' };
      }
  },
  'DIA-205': {
      id: 'DIA-205',
      name: 'Diarrhea',
      category: 'common',
      icon: Icons.Poop,
      screeningQuestions: [
          { id: 'days', text: 'I know this is uncomfortable. How many days have you had diarrhea?', type: 'number' },
          { id: 'stools', text: 'How many loose stools have you had in the last 24 hours?', type: 'number' },
          { id: 'stool_type', text: 'Are you experiencing any of these?', type: 'multiselect', options: [
              {label: 'My stool is black', value: 'black'}, {label: 'My stool has blood', value: 'blood'}, {label: 'My stool has mucus', value: 'mucus'}, {label: 'None of the above', value: 'none'}
          ]},
          { id: 'pain', text: 'Are you having any abdominal pain or cramping?', type: 'yes_no' },
          { id: 'pain_sev', text: 'If yes, rate your abdominal pain:', type: 'choice', options: [{label: 'N/A', value: 'na'}, {label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'meds', text: 'What medications for diarrhea are you taking?', type: 'text' },
          { id: 'severity_post_med', text: 'Rate your diarrhea after medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'dehydration_scr', text: 'Any signs of dehydration (dark urine, thirsty)?', type: 'multiselect', options: [{label: 'Dark Urine', value: 'dark'}, {label: 'Thirsty', value: 'thirsty'}, {label: 'Reduced Urine', value: 'reduced'}, {label: 'None', value: 'none'}]},
          { id: 'intake', text: 'Able to eat/drink normally?', type: 'choice', options: [{label: 'Normal', value: 'ok'}, {label: 'Reduced', value: 'reduced'}, {label: 'Difficulty', value: 'diff'}, {label: 'Barely', value: 'barely'}, {label: 'None', value: 'none'}]}
      ],
      evaluateScreening: (answers) => {
          const stools = parseFloat(answers['stools']);
          const types = answers['stool_type'] || [];
          const dehy = answers['dehydration_scr'] || [];
          
          // ">5 loose stools/day"
          if (stools > 5) {
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: '>5 loose stools/day reported.' };
          }
          // "Moderate/Severe abdominal pain"
          if (answers['pain_sev'] === 'mod' || answers['pain_sev'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate/Severe abdominal pain reported.' };
          }
          // "Stool is Bloody/Black/Mucus"
          if (types.includes('black') || types.includes('blood') || types.includes('mucus')) {
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Bloody/Black/Mucus Stool reported.' };
          }
          // "Dehydration signs OR Intake Almost Nothing"
          if ((dehy.length > 0 && !dehy.includes('none')) || answers['intake'] === 'none') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration signs or No Intake.' };
          }
          // "Rating Severe DESPITE meds"
          if (answers['severity_post_med'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Severe Diarrhea despite meds.' };
          }
          
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'adl', text: 'Are you able to do daily activities such as household work, eating and moving around?', type: 'yes_no' },
          { id: 'nausea_check', text: 'Do you have Nausea or Vomiting?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['nausea_check'] === true) return { action: 'branch', branchToSymptomId: 'NAU-203' }; 
          return { action: 'continue' };
      }
  },

  // --- OTHER SYMPTOMS ---
  'CON-210': {
      id: 'CON-210',
      name: 'Constipation',
      category: 'other',
      icon: Icons.Toilet,
      screeningQuestions: [
          { id: 'days', text: 'How many days has it been since you had a bowel movement?', type: 'number' },
          { id: 'gas', text: 'Are you passing gas?', type: 'yes_no' },
          { id: 'severity', text: 'Rate your constipation:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          const days = parseFloat(answers['days']);
          if (!isNaN(days) && days > 2) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'No bowel movement for > 2 days (48 hours).' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'abd_pain', text: 'Are you having any abdominal pain?', type: 'yes_no' },
          { id: 'meds', text: 'What stool softeners or medications are you taking for constipation? If none, say none.', type: 'text' },
          { id: 'med_freq', text: 'How often are you taking medication for constipation?', type: 'text' },
          { id: 'dehydration', text: 'Are you having any signs of dehydration?', type: 'multiselect', options: [
             {label: 'Very dark urine', value: 'dark'}, {label: 'Constantly thirsty', value: 'thirsty'}, 
             {label: 'Reduced urination', value: 'less_urine'}, {label: 'None', value: 'none'}
          ]}
      ],
      evaluateFollowUp: (answers) => {
          if (answers['abd_pain'] === true) {
              return { action: 'branch', branchToSymptomId: 'VOM-204' };
          }
          const dehy = answers['dehydration'] || [];
          if (dehy.length > 0 && !dehy.includes('none')) {
              return { action: 'branch', branchToSymptomId: 'DEH-201' };
          }
          return { action: 'continue' };
      }
  },
  'FAT-206': {
      id: 'FAT-206',
      name: 'Fatigue / Weakness',
      category: 'other',
      icon: Icons.Sleep,
      screeningQuestions: [
          { id: 'interfere', text: 'Does your fatigue interfere with performing daily tasks?', type: 'yes_no' },
          { id: 'severity', text: 'Rate your fatigue', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}] },
          { id: 'days', text: 'How many continuous days have you had this level?', type: 'number' },
          { id: 'trend', text: 'Is it getting worse, staying the same, or improving?', type: 'choice', options: [{label: 'Worse', value: 'worse'}, {label: 'Same', value: 'same'}, {label: 'Improving', value: 'better'}]}
      ],
      evaluateScreening: (answers) => {
          // "Interference to Daily Tasks OR Rating Severe OR Rating Moderate for >= 3 days and worsening/same"
          if (answers['interfere'] === true || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'refer_provider', triageMessage: 'Interference to Daily Tasks OR Rating Severe.' };
          }
          if (answers['severity'] === 'mod' && parseFloat(answers['days']) >= 3 && answers['trend'] !== 'better') {
              return { action: 'continue', triageLevel: 'refer_provider', triageMessage: 'Moderate Fatigue >= 3 days.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'sleep', text: 'How many hours are you sleeping in bed during the day?', type: 'number' },
          { id: 'worsening_day', text: 'Is the fatigue worsening compared to yesterday?', type: 'yes_no' },
          { id: 'adl_self', text: 'Has the fatigue affected your ability to bathe, dress and feed yourself without help?', type: 'yes_no' },
          { id: 'other_symp', text: 'Do you have Fever, Nausea, Vomiting, Diarrhea, or No Appetite?', type: 'multiselect', options: [
              {label: 'Fever', value: 'fever'}, {label: 'Nausea', value: 'nausea'}, {label: 'Vomiting', value: 'vomit'},
              {label: 'Diarrhea', value: 'diarrhea'}, {label: 'No Appetite', value: 'appetite'}, {label: 'None', value: 'none'}
          ]}
      ],
      evaluateFollowUp: (answers) => {
          const symps = answers['other_symp'] || [];
          if (symps.includes('fever')) return { action: 'branch', branchToSymptomId: 'FEV-202' };
          if (symps.includes('nausea')) return { action: 'branch', branchToSymptomId: 'NAU-203' };
          if (symps.includes('vomit')) return { action: 'branch', branchToSymptomId: 'VOM-204' };
          if (symps.includes('diarrhea')) return { action: 'branch', branchToSymptomId: 'DIA-205' };
          if (symps.includes('appetite')) return { action: 'branch', branchToSymptomId: 'APP-209' };
          return { action: 'continue' };
      }
  },
  'EYE-207': {
      id: 'EYE-207',
      name: 'Eye Complaints',
      category: 'other',
      icon: Icons.Eye,
      screeningQuestions: [
          { id: 'new', text: 'Is this a new problem?', type: 'yes_no' },
          { id: 'pain', text: 'Is there any pain? Is there any discharge or excessive tearing?', type: 'yes_no' },
          { id: 'vision', text: 'Are there any NEW problems with your vision?', type: 'yes_no' },
          { id: 'interfere', text: 'Did it interfere with your ability to perform daily tasks?', type: 'yes_no' },
          { id: 'severity', text: 'Rate your symptoms', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['interfere'] === true || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Interference to Daily Tasks OR Rating Severe.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'doctor', text: 'Have you seen an eye doctor for these complaints yet?', type: 'yes_no' }
      ]
  },
  'MSO-208': {
      id: 'MSO-208',
      name: 'Mouth Sores',
      category: 'other',
      icon: Icons.Mouth,
      screeningQuestions: [
          { id: 'intake', text: 'Are you able to eat and drink normally?', type: 'choice', options: [{label: 'Normal/Reduced but ok', value: 'ok'}, {label: 'Difficulty', value: 'diff'}, {label: 'Cannot eat/drink', value: 'none'}]},
          { id: 'severity', text: 'Rate your mouth sores', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'remedy', text: 'What remedies have you tried?', type: 'text' },
          { id: 'freq', text: 'How often have you tried it?', type: 'text' },
          { id: 'helped', text: 'Has it helped?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          // "Not able to eat/drink normally AND/OR Fever OR Rating Severe"
          if (answers['intake'] === 'none' || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Not able to eat/drink normally OR Rating Severe.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'swallow_pain', text: 'Are you having any pain when you swallow?', type: 'yes_no' },
          { id: 'dehydration', text: 'Any signs of dehydration (Dark urine, thirsty)?', type: 'multiselect', options: [{label: 'Dark Urine', value: 'dark'}, {label: 'Thirsty', value: 'thirsty'}, {label: 'None', value: 'none'}]},
          { id: 'fever', text: 'Do you have a fever?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['fever'] === true) return { action: 'branch', branchToSymptomId: 'FEV-202' };
          const dehy = answers['dehydration'] || [];
          if (dehy.length > 0 && !dehy.includes('none')) return { action: 'branch', branchToSymptomId: 'DEH-201' };
          return { action: 'continue' };
      }
  },
  'APP-209': {
      id: 'APP-209',
      name: 'No Appetite',
      category: 'other',
      icon: Icons.Food,
      screeningQuestions: [
          { id: 'weight', text: 'Have you lost weight?', type: 'choice', options: [{label: '< 3lbs in week', value: 'low'}, {label: '> 3lbs in week', value: 'high'}]},
          { id: 'intake', text: 'Are you able to eat and drink normally?', type: 'choice', options: [{label: 'Reduced but ok', value: 'ok'}, {label: 'Eating < half normal', value: 'half'}, {label: 'Cannot eat/drink', value: 'none'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['weight'] === 'high' || answers['intake'] === 'half' || answers['intake'] === 'none') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Recent weight loss >3 lbs in a week OR Eating less than half of usual meals.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'swallow_pain', text: 'Is it painful to swallow?', type: 'yes_no' },
          { id: 'dehydration', text: 'Any signs of dehydration?', type: 'multiselect', options: [{label: 'Dark Urine', value: 'dark'}, {label: 'Thirsty', value: 'thirsty'}, {label: 'None', value: 'none'}]},
          { id: 'other_symp', text: 'Do you have other symptoms?', type: 'multiselect', options: [
              {label: 'Diarrhea', value: 'diarrhea'}, {label: 'Constipation', value: 'constipation'}, {label: 'Mouth Sores', value: 'sores'},
              {label: 'Nausea', value: 'nausea'}, {label: 'Vomiting', value: 'vomit'}, {label: 'None', value: 'none'}
          ]}
      ],
      evaluateFollowUp: (answers) => {
          const symps = answers['other_symp'] || [];
          if (symps.includes('diarrhea')) return { action: 'branch', branchToSymptomId: 'DIA-205' };
          if (symps.includes('constipation')) return { action: 'branch', branchToSymptomId: 'CON-210' };
          if (symps.includes('sores')) return { action: 'branch', branchToSymptomId: 'MSO-208' };
          if (symps.includes('nausea')) return { action: 'branch', branchToSymptomId: 'NAU-203' };
          if (symps.includes('vomit')) return { action: 'branch', branchToSymptomId: 'VOM-204' };

          const dehy = answers['dehydration'] || [];
          if (dehy.length > 0 && !dehy.includes('none')) return { action: 'branch', branchToSymptomId: 'DEH-201' };
          return { action: 'continue' };
      }
  },
  'URI-211': {
      id: 'URI-211',
      name: 'Urinary Problems',
      category: 'other',
      icon: Icons.Toilet,
      screeningQuestions: [
          { id: 'amount', text: 'Has the amount of urine drastically reduced or increased?', type: 'yes_no' },
          { id: 'burning', text: 'Is there any burning during urination?', type: 'yes_no' },
          { id: 'burn_sev', text: 'If burning, rate severity:', type: 'choice', options: [{label: 'N/A', value: 'na'}, {label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'pelvic', text: 'Are you having any pelvic pain with urination?', type: 'yes_no' },
          { id: 'blood', text: 'Do you see any blood in your urine?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          if (answers['blood'] === true || answers['burn_sev'] === 'mod' || answers['burn_sev'] === 'sev' || answers['pelvic'] === true || answers['amount'] === true) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Urine change OR Pelvic Pain OR Blood OR Moderate/Severe burning.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'smell', text: 'Does your urine smell funny?', type: 'yes_no' },
          { id: 'intake', text: 'Are you drinking fluids normally?', type: 'yes_no' },
          { id: 'diabetic', text: 'Are you diabetic?', type: 'yes_no' },
          { id: 'sugar', text: 'If diabetic, what is your blood sugar?', type: 'text' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['intake'] === false) return { action: 'branch', branchToSymptomId: 'DEH-201' };
          return { action: 'continue' };
      }
  },
  'SKI-212': {
      id: 'SKI-212',
      name: 'Skin Rash / Redness',
      category: 'other',
      icon: Icons.Rash,
      screeningQuestions: [
          { id: 'loc', text: 'Where is the rash?', type: 'multiselect', options: [{label: 'Face', value: 'face'}, {label: 'Chest', value: 'chest'}, {label: 'Arms', value: 'arms'}, {label: 'Legs', value: 'legs'}, {label: 'Infusion Site', value: 'infusion'}]},
          { id: 'infusion_sx', text: 'If Infusion Site, do you have:', type: 'multiselect', options: [{label: 'Swelling', value: 'swelling'}, {label: 'Redness', value: 'redness'}, {label: 'Open Wound', value: 'wound'}, {label: 'None', value: 'none'}]},
          { id: 'coverage', text: 'Does the rash cover more than 30% of your body?', type: 'yes_no' },
          { id: 'adl', text: 'Does the rash affect your daily activities (ADLs)?', type: 'yes_no' },
          { id: 'temp', text: 'What is your temperature?', type: 'number' },
          { id: 'severity', text: 'Rate your rash', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          // "Infusion site has Swelling/Open Wound/Fevers/Chills OR Non-infusion site rash affects ADLs OR Temp >100.4F OR Covers >30% of body"
          const inf = answers['infusion_sx'] || [];
          const t = parseFloat(answers['temp']);
          
          const infusionIssue = inf.includes('swelling') || inf.includes('wound');
          const adlIssue = answers['adl'] === true;
          const feverIssue = !isNaN(t) && t > 100.4;
          const coverageIssue = answers['coverage'] === true;

          if (infusionIssue || adlIssue || feverIssue || coverageIssue) {
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Infusion issue OR ADL impact OR Fever OR >30% Coverage.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'days', text: 'How many days have you had a rash?', type: 'number' },
          { id: 'worse', text: 'Is it getting worse?', type: 'yes_no' },
          { id: 'symptoms', text: 'Are you experiencing any of these?', type: 'multiselect', options: [
              {label: 'I feel unwell', value: 'unwell'}, {label: 'Skin cracked', value: 'cracked'}, {label: 'Liquid from rash', value: 'liquid'}, {label: 'None', value: 'none'}
          ]}
      ],
      evaluateFollowUp: (answers) => {
          const symps = answers['symptoms'] || [];
          if (symps.includes('unwell')) return { action: 'branch', branchToSymptomId: 'FEV-202' };
          return { action: 'continue' };
      }
  },
  'PAI-213': {
      id: 'PAI-213',
      name: 'Pain', // Renamed from "Pain / General Aches" for hierarchy
      category: 'other',
      icon: Icons.Pain,
      screeningQuestions: [
          { id: 'loc', text: 'I\'m here to help with your pain. Where does it hurt?', type: 'multiselect', options: [
              {label: 'Chest', value: 'chest'}, {label: 'Head', value: 'head'}, {label: 'Stomach', value: 'stomach'}, 
              {label: 'Legs/Calf', value: 'legs'}, {label: 'Mouth/Throat', value: 'mouth'}, {label: 'Joints/Muscles', value: 'joints'},
              {label: 'Nerve (Burning/Tingling)', value: 'nerve'}, {label: 'General/Fatigue', value: 'fatigue'}, {label: 'Port Site', value: 'port'}
          ]},
          { id: 'severity', text: 'Rate your pain', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'interfere', text: 'Does it interfere with daily activities?', type: 'yes_no' },
          { id: 'fever', text: 'Fever over 100.4F?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          const loc = answers['loc'] || [];
          // Priority Branching based on Location
          if (loc.includes('chest')) return { action: 'branch', branchToSymptomId: 'URG-102' }; // Chest Pain -> URG-102
          if (loc.includes('head')) return { action: 'branch', branchToSymptomId: 'URG-109' }; // Headache
          if (loc.includes('stomach')) return { action: 'branch', branchToSymptomId: 'URG-110' }; // Abdominal
          if (loc.includes('legs')) return { action: 'branch', branchToSymptomId: 'URG-111' }; // Leg/Calf
          if (loc.includes('joints')) return { action: 'branch', branchToSymptomId: 'URG-112' }; // Joints
          if (loc.includes('fatigue')) return { action: 'branch', branchToSymptomId: 'URG-113' }; // General Aches
          if (loc.includes('port')) return { action: 'branch', branchToSymptomId: 'URG-114' }; // Port
          if (loc.includes('mouth')) return { action: 'branch', branchToSymptomId: 'MSO-208' }; // Mouth
          if (loc.includes('nerve')) return { action: 'branch', branchToSymptomId: 'NEU-216' }; // Neuropathy
          
          // "Rated Moderate/Severe AND interferes with ADLs OR Rated Severe OR Fever >100.4F"
          if (answers['severity'] === 'sev' || (answers['severity'] === 'mod' && answers['interfere'] === true) || answers['fever'] === true) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Pain Severity/Interference Met.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'worse', text: 'Is the pain getting worse?', type: 'yes_no' },
          { id: 'numb', text: 'Any numbness/tingling?', type: 'yes_no' },
          { id: 'balance', text: 'Trouble keeping balance or walking?', type: 'yes_no' },
          { id: 'neulasta', text: 'Neulasta within 3 days?', type: 'yes_no' },
          { id: 'port_signs', text: 'IV/port site signs?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['numb'] === true) return { action: 'branch', branchToSymptomId: 'NEU-216' };
          return { action: 'continue' };
      }
  },
  'URG-112': {
      id: 'URG-112',
      name: 'Joint/Muscle Pain',
      category: 'other',
      hidden: true, // Hidden for hierarchy
      icon: Icons.Joint,
      screeningQuestions: [
           { id: 'controlled', text: 'Is it controlled with your usual pain medicine?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
           if (answers['controlled'] === false) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Uncontrolled Pain.' };
           return { action: 'continue' };
      }
  },
  'URG-113': {
      id: 'URG-113',
      name: 'General Aches',
      category: 'other',
      hidden: true, // Hidden for hierarchy
      icon: Icons.Ache,
      screeningQuestions: [
           { id: 'better', text: 'Does it get better with rest/meds?', type: 'yes_no' },
           { id: 'adl', text: 'Has fatigue affected your ability to bathe/dress?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
           if (answers['adl'] === true || answers['better'] === false) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'ADLs affected or not improving.' };
           return { action: 'continue' };
      }
  },
  'SWE-214': {
      id: 'SWE-214',
      name: 'Swelling',
      category: 'other',
      icon: Icons.Swelling,
      screeningQuestions: [
          { id: 'loc', text: 'Where is the swelling?', type: 'text' },
          { id: 'unilateral_leg', text: 'Is the swelling in just one leg?', type: 'yes_no' },
          { id: 'start', text: 'When did the swelling start?', type: 'text' },
          { id: 'redness', text: 'Is there any redness where you have swelling?', type: 'yes_no' },
          { id: 'severity', text: 'Rate your swelling', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          // "Unilateral leg swelling OR Redness OR Pain OR Rating Moderate/Severe"
          if (answers['unilateral_leg'] === true || answers['redness'] === true || answers['severity'] === 'mod' || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Unilateral leg swelling OR Redness OR Rating Moderate/Severe.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'sob', text: 'Do you have Shortness of Breath?', type: 'yes_no' },
          { id: 'clots', text: 'History of blood clots?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['sob'] === true) return { action: 'branch', branchToSymptomId: 'URG-101' };
          return { action: 'continue' };
      }
  },
  'COU-215': {
      id: 'COU-215',
      name: 'Cough',
      category: 'other',
      icon: Icons.Cough,
      screeningQuestions: [
          { id: 'days', text: 'How long have you had the cough?', type: 'text' },
          { id: 'temp', text: 'What is your temperature?', type: 'number' },
          { id: 'mucus', text: 'Is there any mucus with your cough?', type: 'yes_no' },
          { id: 'meds', text: 'What medications have you used to help with your cough?', type: 'text' },
          { id: 'helping', text: 'Is it helping?', type: 'yes_no' },
          { id: 'prevent', text: 'Does the cough prevent you from doing your daily activities?', type: 'yes_no' },
          { id: 'chest_pain', text: 'Do you have chest pain or shortness of breath?', type: 'yes_no' },
          { id: 'o2_check', text: 'Do you have ability to check your oxygen saturation at home?', type: 'yes_no' },
          { id: 'o2', text: 'If yes, what is it? (Enter number, e.g. 95)', type: 'number' },
          { id: 'severity', text: 'Rate your cough', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['chest_pain'] === true) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Chest Pain/Shortness of Breath detected.' };
          }
          const o2 = parseFloat(answers['o2']);
          const temp = parseFloat(answers['temp']);
          const lowO2 = !isNaN(o2) && o2 < 92;
          const highTemp = !isNaN(temp) && temp > 100.4;

          // "Cough prevents ADLs OR Chest Pain/Shortness of Breath OR Temp >100.4F OR O2 sat <92%"
          if (answers['prevent'] === true || highTemp || lowO2) {
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Cough prevents ADLs OR Temp >100.4F OR O2 <92%.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
        { id: 'fever_check', text: 'Do you have a fever?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => { 
          if (answers['fever_check'] === true) return { action: 'branch', branchToSymptomId: 'FEV-202' };
          return { action: 'continue' }; 
      }
  },
  'NEU-216': {
      id: 'NEU-216',
      name: 'Neuropathy (Numbness)',
      category: 'other',
      icon: Icons.Nerve,
      screeningQuestions: [
          { id: 'duration', text: 'How long have you had numbness and tingling?', type: 'text' },
          { id: 'interfere', text: 'Does the numbness/tingling interfere with your normal activities?', type: 'yes_no' },
          { id: 'severity', text: 'Rate your symptoms', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['interfere'] === true || answers['severity'] === 'mod' || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Interference with Normal Activities OR Rating Moderate-Severe.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'motor', text: 'Is it hard to do things like button your shirt, type, write, or walk long distances?', type: 'yes_no' },
          { id: 'worse', text: 'Has the numbness or tingling gotten worse in the past week or moved higher up arms/legs?', type: 'yes_no' },
          { id: 'balance', text: 'Have you had trouble feeling the ground when walking, or felt unsteady or off balance?', type: 'yes_no' },
          { id: 'meds', text: 'Are you taking any medication for neuropathy?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['balance'] === true) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Falls/unsteadiness present. Flag for safety/provider.' };
          return { action: 'continue' };
      }
  }
};