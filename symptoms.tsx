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
  condition?: (answers: Record<string, any>) => boolean; // Contextual Logic
}

export interface LogicResult {
  action: 'continue' | 'branch' | 'stop';
  triageLevel?: ActionLevel;
  triageMessage?: string;
  branchToSymptomId?: string;
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
  hidden?: boolean;
}

// --- HELPERS ---

export const isHigherSeverity = (current: ActionLevel, newLevel: ActionLevel): boolean => {
    const levels = ['none', 'refer_provider', 'notify_care_team', 'call_911'];
    return levels.indexOf(newLevel) > levels.indexOf(current);
};

// --- STANDARDIZED CONSTANTS ---

export const ORAL_INTAKE_OPTIONS: Option[] = [
    {label: 'I have a reduced appetite but can still eat and drink', value: 'reduced'},
    {label: 'I have had difficulty keeping food or fluids down', value: 'difficulty'},
    {label: 'I can barely eat or drink anything', value: 'barely'},
    {label: 'I have not been able to eat or drink in the last 24 hours', value: 'none'},
    {label: 'I can eat and drink normally', value: 'normal'}
];

export const DEHYDRATION_SIGNS_OPTIONS: Option[] = [
    {label: 'Very dark urine', value: 'dark_urine'},
    {label: 'Amount of urine is a lot less over last 12 hours', value: 'less_urine'},
    {label: 'Very thirsty', value: 'thirsty'},
    {label: 'Lightheaded', value: 'lightheaded'},
    {label: 'HR >100 or BP <100', value: 'vitals'},
    {label: 'None of the above', value: 'none'}
];

// --- MEDICATION OPTIONS ---

const MEDS_NAUSEA: Option[] = [
    {label: 'Compazine (prochlorperazine) 5 mg every 6 hours', value: 'compazine'},
    {label: 'Zofran (ondansetron) 8 mg every 8 hours', value: 'zofran'},
    {label: 'Olanzapine 5 mg daily', value: 'olanzapine'},
    {label: 'Other', value: 'other'},
    {label: 'None', value: 'none'}
];

const MEDS_DIARRHEA: Option[] = [
    {label: 'Imodium (loperamide) 4 mg then 2 mg after each loose stool', value: 'imodium'},
    {label: 'Lomotil (diphenoxylate/atropine) 1-2 tablets', value: 'lomotil'},
    {label: 'Other', value: 'other'},
    {label: 'None', value: 'none'}
];

const MEDS_COUGH: Option[] = [
    {label: 'Robitussin (dextromethorphan) 10-20 mg every 4 hours', value: 'robitussin_10_20'},
    {label: 'Robitussin (dextromethorphan) 30 mg every 6-8 hours', value: 'robitussin_30'},
    {label: 'Other', value: 'other'},
    {label: 'None', value: 'none'}
];

const MEDS_MOUTH: Option[] = [
    {label: 'Magic Mouthwash Rinse 5–10 mL every 4-6 hours', value: 'magic_mouthwash'},
    {label: 'Other', value: 'other'},
    {label: 'None', value: 'none'}
];

const DURATION_OPTIONS_SHORT: Option[] = [
    {label: 'Less than 24 hours', value: '<24h'},
    {label: '1-2 days', value: '1-2d'},
    {label: '3-7 days', value: '3-7d'},
    {label: 'More than a week', value: '>1w'},
    {label: 'More than 3 weeks', value: '>3w'}
];

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
      { id: 'q1', text: 'Are you having Trouble Breathing or Shortness of Breath right now?', type: 'yes_no' }
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
    hidden: true,
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
  
  // --- PAIN SUB-MODULES (Other) ---
  'URG-109': {
      id: 'URG-109',
      name: 'Headache',
      category: 'other',
      hidden: true, 
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
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Severe Headache reported.' };
          }
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Headache reported.' };
      }
  },
  'URG-110': {
      id: 'URG-110',
      name: 'Severe Abdominal Pain',
      category: 'other',
      hidden: true,
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
          if ((!isNaN(score) && score > 7) || (flags.length > 0 && !flags.includes('none'))) {
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Severe Abdominal Pain (>7/10) or Red Flags.' };
          }
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Abdominal pain reported.' };
      }
  },
  'URG-111': {
      id: 'URG-111',
      name: 'Leg/Calf Pain',
      category: 'other',
      hidden: true,
      icon: Icons.Leg,
      screeningQuestions: [
          { id: 'swollen_one_leg', text: 'Is one leg more swollen, red, warm, or painful than the other?', type: 'yes_no' },
          { id: 'worse_walk', text: 'Does the pain get worse when you walk or press on the calf?', type: 'yes_no' },
          { id: 'pain_sev', text: 'Rate your pain', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['swollen_one_leg'] === true || answers['worse_walk'] === true) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Signs of DVT (One leg swollen/painful).' };
          }
           return { action: 'continue', triageLevel: 'refer_provider', triageMessage: 'Leg pain reported.' };
      }
  },
  'URG-112': {
      id: 'URG-112',
      name: 'Joint/Muscle Pain',
      category: 'other',
      hidden: true,
      icon: Icons.Joint,
      screeningQuestions: [
           { id: 'controlled', text: 'Is it controlled with your usual pain medicine?', type: 'yes_no' },
           { id: 'mobility', text: 'Is your pain making it hard to move around or sleep?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
           if (answers['controlled'] === false || answers['mobility'] === true) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Uncontrolled Pain or affects Mobility/Sleep.' };
           return { action: 'continue' };
      }
  },
  'URG-113': {
      id: 'URG-113',
      name: 'General Aches',
      category: 'other',
      hidden: true,
      icon: Icons.Ache,
      screeningQuestions: [
           { id: 'better', text: 'Does it get better with rest/meds?', type: 'yes_no' },
           { id: 'adl', text: 'Has pain affected your ability to bathe/dress?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
           if (answers['adl'] === true || answers['better'] === false) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'ADLs affected or not improving.' };
           return { action: 'continue' };
      }
  },
  'URG-114': {
      id: 'URG-114',
      name: 'Port Site Pain',
      category: 'other',
      hidden: true,
      icon: Icons.Port,
      screeningQuestions: [
          { id: 'redness', text: 'Is the area red?', type: 'yes_no' },
          { id: 'drainage', text: 'Is there any drainage?', type: 'yes_no' },
          { id: 'chills', text: 'Do you have chills?', type: 'yes_no' },
          { id: 'temp', text: 'What is your temperature? (Number only)', type: 'number' }
      ],
      evaluateScreening: (answers) => {
          const t = parseFloat(answers['temp']);
          const signs = answers['redness'] === true || answers['drainage'] === true || answers['chills'] === true;
          if (signs || (!isNaN(t) && t > 100.3)) {
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
    hidden: true,
    icon: Icons.Water,
    screeningQuestions: [
      { id: 'urine_color', text: 'What color is your urine?', type: 'choice', options: [{label: 'Clear/Pale', value: 'clear'}, {label: 'Yellow', value: 'yellow'}, {label: 'Dark/Amber', value: 'dark'}] },
      { id: 'urine_amt', text: 'Is the amount of urine a lot less over the last 12 hours?', type: 'yes_no' },
      { id: 'thirsty', text: 'Are you very thirsty?', type: 'yes_no' },
      { id: 'lightheaded', text: 'Are you lightheaded?', type: 'yes_no' },
      { id: 'hr_sbp', text: 'Has a doctor told you your Heart Rate is >100 or BP <100?', type: 'yes_no' }
    ],
    evaluateScreening: (answers) => {
      if (answers['hr_sbp'] === true || answers['thirsty'] === true || answers['lightheaded'] === true || answers['urine_amt'] === true || answers['urine_color'] === 'dark') {
        return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration Signs detected.' };
      }
      return { action: 'continue' };
    }
  },
  'FEV-202': {
    id: 'FEV-202',
    name: 'Fever',
    category: 'common',
    icon: Icons.Thermometer,
    screeningQuestions: [
      { id: 'temp', text: 'Fever can be worrying. What is your temperature? (Enter number, e.g., 101.5)', type: 'number' },
      { id: 'high_temp_symptoms', text: 'Please select any additional symptoms:', type: 'multiselect', options: [
            {label: 'Rapid Heart Rate', value: 'hr'}, {label: 'Nausea', value: 'nausea'}, {label: 'Vomiting', value: 'vomit'}, 
            {label: 'Abdominal Pain', value: 'abd_pain'}, {label: 'Diarrhea', value: 'diarrhea'}, {label: 'Port Redness', value: 'port'}, {label: 'Cough', value: 'cough'},
            {label: 'Dizziness', value: 'dizzy'}, {label: 'Confusion', value: 'confusion'}, {label: 'Burning at urination', value: 'burning'},
            {label: 'None', value: 'none'}
        ], condition: (a) => parseFloat(a['temp']) > 100.3 
      }
    ],
    evaluateScreening: (answers) => {
      const t = parseFloat(answers['temp']);
      // Case 1: Low grade
      if (!isNaN(t) && t <= 100.3) {
           return { action: 'stop', triageLevel: 'none', triageMessage: 'Please take your temperature frequently, we get concerned if the temperature is >100.3.' };
      }
      // Case 2: High grade (>100.3)
      if (!isNaN(t) && t > 100.3) {
          const symps = answers['high_temp_symptoms'] || [];
          // If multiselect not answered yet, just continue to let user answer
          if (!answers.hasOwnProperty('high_temp_symptoms')) {
              return { action: 'continue' };
          }
          // Eval Checklist
          if (symps.length > 0 && !symps.includes('none')) {
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Fever > 100.3F with associated symptoms.' };
          }
          return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Fever > 100.3F (Elevated Temperature).' };
      }
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
      { id: 'trend', text: 'Is the nausea the same or worsening?', type: 'choice', options: [{label: 'Worsening/Same', value: 'bad'}, {label: 'Improving', value: 'good'}], condition: (a) => a['days'] === '>3d' },
      { id: 'intake', text: 'How is your oral intake?', type: 'choice', options: ORAL_INTAKE_OPTIONS },
      { id: 'meds', text: 'What anti-nausea medications are you taking?', type: 'choice', options: MEDS_NAUSEA },
      { id: 'med_freq', text: 'How often are you taking these medications?', type: 'text', condition: (a) => a['meds'] !== 'none' },
      { id: 'severity_post_meds', text: 'Rate your nausea after taking medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
    ],
    evaluateScreening: (answers) => {
       const intakeBad = answers['intake'] === 'none' || answers['intake'] === 'barely' || answers['intake'] === 'difficulty';
       const sevBad = answers['severity_post_meds'] === 'sev';
       const modChronic = answers['severity_post_meds'] === 'mod' && answers['days'] === '>3d' && answers['trend'] === 'bad';

       if (intakeBad || sevBad || modChronic) {
           return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Intake Issue OR Severe Nausea OR Moderate for ≥3 days Worsening.' };
       }
       return { action: 'continue' };
    },
    followUpQuestions: [
        { id: 'other_symp', text: 'Checking for other symptoms:', type: 'multiselect', options: [
            {label: 'Vomiting', value: 'vomit'}, {label: 'Abdominal Pain', value: 'pain'}, {label: 'Cramping', value: 'cramp'},
            ...DEHYDRATION_SIGNS_OPTIONS
        ]},
        { id: 'adl', text: 'Are you able to perform daily self care like bathing and dressing yourself?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
        const symps = answers['other_symp'] || [];
        if (symps.includes('vomit')) return { action: 'branch', branchToSymptomId: 'VOM-204' };
        // Check dehydration options from the list
        const dehyKeys = DEHYDRATION_SIGNS_OPTIONS.map(o => o.value).filter(v => v !== 'none');
        if (symps.some((s: string) => dehyKeys.includes(s))) return { action: 'branch', branchToSymptomId: 'DEH-201' };
        return { action: 'continue' };
    }
  },
  'VOM-204': {
      id: 'VOM-204',
      name: 'Vomiting',
      category: 'common',
      icon: Icons.Vomit,
      screeningQuestions: [
          { id: 'days', text: 'How many days have you been vomiting?', type: 'number' },
          { id: 'vom_freq', text: 'How many times have you vomited in the last 24 hours?', type: 'choice', options: [{label: '1-2 times', value: 'low'}, {label: '3-5 times', value: 'med'}, {label: '>6 times', value: 'high'}]},
          { id: 'intake_12h', text: 'How is your oral intake over the last 12 hours?', type: 'choice', options: ORAL_INTAKE_OPTIONS },
          { id: 'meds', text: 'What medications for vomiting are you taking?', type: 'choice', options: MEDS_NAUSEA },
          { id: 'med_freq', text: 'How often are you taking them?', type: 'text', condition: (a) => a['meds'] !== 'none' },
          { id: 'severity_post_med', text: 'Rate your vomiting after taking medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
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
          { id: 'adl', text: 'Are you able to perform daily self care?', type: 'yes_no' },
          { id: 'has_constipation', text: 'Do you also have constipation?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
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
          { id: 'days', text: 'How many days have you had diarrhea?', type: 'number' },
          { id: 'trend', text: 'Is it worsening or the same?', type: 'choice', options: [{label: 'Worsening/Same', value: 'bad'}, {label: 'Improving', value: 'good'}], condition: (a) => parseFloat(a['days']) > 3 },
          { id: 'stools', text: 'How many loose stools have you had in the last 24 hours?', type: 'number' },
          { id: 'stool_type', text: 'Are you experiencing any of these?', type: 'multiselect', options: [
              {label: 'My stool is black', value: 'black'}, {label: 'My stool has blood', value: 'blood'}, {label: 'My stool has mucus', value: 'mucus'}, {label: 'None of the above', value: 'none'}
          ]},
          { id: 'pain', text: 'Are you having any abdominal pain or cramping?', type: 'yes_no' },
          { id: 'pain_sev', text: 'Rate your abdominal pain:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}], condition: (a) => a['pain'] === true },
          { id: 'meds', text: 'What medications for diarrhea are you taking?', type: 'choice', options: MEDS_DIARRHEA },
          { id: 'med_freq', text: 'How often are you taking them?', type: 'text', condition: (a) => a['meds'] !== 'none' },
          { id: 'severity_post_med', text: 'Rate your diarrhea after medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'dehydration_scr', text: 'Any signs of dehydration?', type: 'multiselect', options: DEHYDRATION_SIGNS_OPTIONS },
          { id: 'intake', text: 'Able to eat/drink normally?', type: 'choice', options: ORAL_INTAKE_OPTIONS }
      ],
      evaluateScreening: (answers) => {
          const stools = parseFloat(answers['stools']);
          const types = answers['stool_type'] || [];
          const dehy = answers['dehydration_scr'] || [];
          
          if (stools > 5) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: '>5 loose stools/day reported.' };
          if (answers['pain_sev'] === 'mod' || answers['pain_sev'] === 'sev') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate/Severe abdominal pain reported.' };
          if (types.includes('black') || types.includes('blood') || types.includes('mucus')) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Bloody/Black/Mucus Stool reported.' };
          if ((dehy.length > 0 && !dehy.includes('none')) || answers['intake'] === 'none') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration signs or No Intake.' };
          if (answers['severity_post_med'] === 'sev') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Severe Diarrhea despite meds.' };
          
          // Logic for Moderate > 3 days worsening
          if (answers['severity_post_med'] === 'mod' && parseFloat(answers['days']) > 3 && answers['trend'] === 'bad') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate Diarrhea > 3 days and worsening.' };
          }
          
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'adl', text: 'Are you able to do daily activities such as household work, eating and moving around?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          const dehy = answers['dehydration_scr'] || [];
          if (dehy.length > 0 && !dehy.includes('none')) return { action: 'branch', branchToSymptomId: 'DEH-201' };
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
          { id: 'days_gas', text: 'How many days has it been since you passed gas?', type: 'number' },
          { id: 'severity', text: 'Rate your constipation:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          const days = parseFloat(answers['days']);
          const gas = parseFloat(answers['days_gas']);
          if (!isNaN(days) && days > 2) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'No bowel movement for > 2 days (48 hours).' };
          }
          if (!isNaN(gas) && gas > 2) {
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'No gas passed for > 2 days.' };
          }
          if (answers['severity'] === 'sev') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Severe Constipation.' };
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'abd_pain', text: 'Are you having any abdominal pain?', type: 'yes_no' },
          { id: 'pain_sev', text: 'Rate abdominal pain:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}], condition: (a) => a['abd_pain'] === true },
          { id: 'meds', text: 'What stool softeners or medications are you taking?', type: 'text' },
          { id: 'dehydration', text: 'Are you having any signs of dehydration?', type: 'multiselect', options: DEHYDRATION_SIGNS_OPTIONS }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['pain_sev'] === 'mod' || answers['pain_sev'] === 'sev') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Constipation with Mod/Severe Pain.' };
          const dehy = answers['dehydration'] || [];
          if (dehy.length > 0 && !dehy.includes('none')) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Constipation with Dehydration.' };
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
          if (answers['interfere'] === true || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Interference to Daily Tasks OR Rating Severe.' };
          }
          if (answers['severity'] === 'mod' && parseFloat(answers['days']) >= 3 && answers['trend'] !== 'better') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate Fatigue >= 3 days.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'sleep', text: 'How many hours are you sleeping in bed during the day?', type: 'number' },
          { id: 'worsening_day', text: 'Is the fatigue worsening compared to yesterday?', type: 'yes_no' },
          { id: 'adl_self', text: 'Has the fatigue affected your ability to bathe, dress and feed yourself without help?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          return { action: 'continue' };
      }
  },
  'MSO-208': {
      id: 'MSO-208',
      name: 'Mouth Sores',
      category: 'other',
      icon: Icons.Mouth,
      screeningQuestions: [
          { id: 'intake', text: 'Are you able to eat and drink normally?', type: 'choice', options: ORAL_INTAKE_OPTIONS },
          { id: 'severity', text: 'Rate your mouth sores', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'remedy', text: 'What remedies have you tried?', type: 'choice', options: MEDS_MOUTH },
          { id: 'freq', text: 'How often have you tried it?', type: 'text', condition: (a) => a['remedy'] !== 'none' },
          { id: 'helped', text: 'Has it helped?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          if (answers['intake'] === 'none' || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Not able to eat/drink normally OR Rating Severe.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'swallow_pain', text: 'Are you having any pain when you swallow?', type: 'yes_no' },
          { id: 'dehydration', text: 'Any signs of dehydration?', type: 'multiselect', options: DEHYDRATION_SIGNS_OPTIONS },
          { id: 'fever', text: 'Do you have a fever?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['fever'] === true) return { action: 'branch', branchToSymptomId: 'FEV-202' };
          const dehy = answers['dehydration'] || [];
          if (dehy.length > 0 && !dehy.includes('none')) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration signs present.' };
          return { action: 'continue' };
      }
  },
  'APP-209': {
      id: 'APP-209',
      name: 'No Appetite',
      category: 'other',
      icon: Icons.Food,
      screeningQuestions: [
          { id: 'weight', text: 'Have you lost weight?', type: 'choice', options: [{label: '< 3lbs in week', value: 'low'}, {label: '> 3lbs in week', value: 'high'}, {label: 'Not sure', value: 'unsure'}]},
          { id: 'intake', text: 'Are you able to eat and drink normally?', type: 'choice', options: ORAL_INTAKE_OPTIONS }
      ],
      evaluateScreening: (answers) => {
          if (answers['weight'] === 'high' || answers['intake'] === 'difficulty' || answers['intake'] === 'none') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Recent weight loss >3 lbs in a week OR Eating less than half of usual meals.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'swallow_pain', text: 'Is it painful to swallow?', type: 'yes_no' },
          { id: 'dehydration', text: 'Any signs of dehydration?', type: 'multiselect', options: DEHYDRATION_SIGNS_OPTIONS }
      ],
      evaluateFollowUp: (answers) => {
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
          { id: 'burn_sev', text: 'If burning, rate severity:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}], condition: (a) => a['burning'] === true},
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
          { id: 'sugar', text: 'If diabetic, what is your blood sugar?', type: 'number', condition: (a) => a['diabetic'] === true }
      ],
      evaluateFollowUp: (answers) => {
          const sugar = parseFloat(answers['sugar']);
          if (!isNaN(sugar) && (sugar > 250 || sugar < 60)) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Diabetic Blood Sugar >250 or <60.' };
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
          { id: 'infusion_sx', text: 'If Infusion Site, do you have:', type: 'multiselect', options: [{label: 'Swelling', value: 'swelling'}, {label: 'Redness', value: 'redness'}, {label: 'Open Wound', value: 'wound'}, {label: 'None', value: 'none'}], condition: (a) => a['loc']?.includes('infusion') },
          { id: 'face_breath', text: 'Is there any trouble breathing?', type: 'yes_no', condition: (a) => a['loc']?.includes('face') },
          { id: 'coverage', text: 'Does the rash cover more than 30% of your body?', type: 'yes_no' },
          { id: 'adl', text: 'Does the rash affect your daily activities (ADLs)?', type: 'yes_no' },
          { id: 'temp', text: 'What is your temperature?', type: 'number' },
          { id: 'severity', text: 'Rate your rash', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['face_breath'] === true) return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Facial Rash with Breathing Difficulty.' };
          
          const inf = answers['infusion_sx'] || [];
          const t = parseFloat(answers['temp']);
          const infusionIssue = inf.includes('swelling') || inf.includes('wound');
          const adlIssue = answers['adl'] === true;
          const feverIssue = !isNaN(t) && t > 100.3;
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
          if (answers['worse'] === true && parseFloat(answers['days']) > 2) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Worsening rash > 2 days.' };
          return { action: 'continue' };
      }
  },
  'PAI-213': {
      id: 'PAI-213',
      name: 'Pain',
      category: 'other',
      icon: Icons.Pain,
      screeningQuestions: [
          { id: 'loc', text: 'Where does it hurt?', type: 'multiselect', options: [
              {label: 'Chest', value: 'chest'}, {label: 'Head', value: 'head'}, {label: 'Stomach', value: 'stomach'}, 
              {label: 'Legs/Calf', value: 'legs'}, {label: 'Mouth/Throat', value: 'mouth'}, {label: 'Joints/Muscles', value: 'joints'},
              {label: 'Nerve (Burning/Tingling)', value: 'nerve'}, {label: 'General/Fatigue', value: 'fatigue'}, {label: 'Port Site', value: 'port'}
          ]},
          { id: 'severity', text: 'Rate your pain', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'interfere', text: 'Does it interfere with daily activities?', type: 'yes_no' },
          { id: 'fever', text: 'Fever over 100.3F?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          const loc = answers['loc'] || [];
          if (loc.includes('chest')) return { action: 'branch', branchToSymptomId: 'URG-102' };
          if (loc.includes('head')) return { action: 'branch', branchToSymptomId: 'URG-109' };
          if (loc.includes('stomach')) return { action: 'branch', branchToSymptomId: 'URG-110' };
          if (loc.includes('legs')) return { action: 'branch', branchToSymptomId: 'URG-111' };
          if (loc.includes('joints')) return { action: 'branch', branchToSymptomId: 'URG-112' };
          if (loc.includes('fatigue')) return { action: 'branch', branchToSymptomId: 'URG-113' };
          if (loc.includes('port')) return { action: 'branch', branchToSymptomId: 'URG-114' };
          if (loc.includes('mouth')) return { action: 'branch', branchToSymptomId: 'MSO-208' };
          if (loc.includes('nerve')) return { action: 'branch', branchToSymptomId: 'NEU-216' };
          
          if (answers['severity'] === 'sev' || answers['severity'] === 'mod' || answers['fever'] === true) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Pain Severity/Fever Met.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'worse', text: 'Is the pain getting worse?', type: 'yes_no' }
      ]
  },
  'SWE-214': {
      id: 'SWE-214',
      name: 'Swelling',
      category: 'other',
      icon: Icons.Swelling,
      screeningQuestions: [
          { id: 'loc', text: 'Where is the swelling?', type: 'text' },
          { id: 'unilateral_leg', text: 'Is the swelling in just one leg?', type: 'yes_no', condition: (a) => a['loc']?.toLowerCase().includes('leg') },
          { id: 'redness', text: 'Is there any redness where you have swelling?', type: 'yes_no' },
          { id: 'severity', text: 'Rate your swelling', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
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
          { id: 'days', text: 'How long have you had the cough?', type: 'choice', options: DURATION_OPTIONS_SHORT },
          { id: 'temp', text: 'What is your temperature?', type: 'number' },
          { id: 'mucus', text: 'Is there any mucus with your cough?', type: 'yes_no' },
          { id: 'meds', text: 'What medications have you used to help with your cough?', type: 'choice', options: MEDS_COUGH },
          { id: 'helping', text: 'Is it helping?', type: 'yes_no', condition: (a) => a['meds'] !== 'none' },
          { id: 'prevent', text: 'Does the cough prevent you from doing your daily activities?', type: 'yes_no' },
          { id: 'chest_pain', text: 'Do you have chest pain or shortness of breath?', type: 'yes_no' },
          { id: 'o2_check', text: 'Do you have ability to check your oxygen saturation at home?', type: 'yes_no' },
          { id: 'o2', text: 'If yes, what is it? (Enter number, e.g. 95)', type: 'number', condition: (a) => a['o2_check'] === true },
          { id: 'severity', text: 'Rate your cough', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['chest_pain'] === true) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Chest Pain/Shortness of Breath detected.' };
          }
          const o2 = parseFloat(answers['o2']);
          const temp = parseFloat(answers['temp']);
          const lowO2 = !isNaN(o2) && o2 < 92;
          const highTemp = !isNaN(temp) && temp > 100.3;

          if (answers['prevent'] === true || highTemp || lowO2) {
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Cough prevents ADLs OR Temp >100.3F OR O2 <92%.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
      ],
      evaluateFollowUp: (answers) => { 
          return { action: 'continue' }; 
      }
  },
  'NEU-216': {
      id: 'NEU-216',
      name: 'Neuropathy (Numbness)',
      category: 'other',
      icon: Icons.Nerve,
      screeningQuestions: [
          { id: 'duration', text: 'How long have you had numbness and tingling?', type: 'choice', options: [{label: 'Started Today', value: 'today'}, {label: '1-3 days', value: '1-3d'}, {label: '4-7 days', value: '4-7d'}, {label: '> 1 week', value: '>1w'}] },
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
          { id: 'worsening', text: 'Has the numbness or tingling gotten worse in the past week or moved higher up arms/legs?', type: 'yes_no' },
          { id: 'balance', text: 'Have you had trouble feeling the ground when walking, or felt unsteady or off balance?', type: 'yes_no' },
          { id: 'meds', text: 'Are you taking any medication for neuropathy?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          if (answers['balance'] === true) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Falls/unsteadiness present. Flag for safety/provider.' };
          return { action: 'continue' };
      }
  }
};