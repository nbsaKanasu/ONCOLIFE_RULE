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

// Helper to parse vitals from text input and check for concerning values
export const parseVitalsFromText = (vitalsText: string): { hrHigh: boolean; bpLow: boolean } => {
    if (!vitalsText) return { hrHigh: false, bpLow: false };
    
    const text = vitalsText.toLowerCase();
    let hrHigh = false;
    let bpLow = false;
    
    // Try to extract HR value
    const hrMatch = text.match(/hr[:\s]*(\d+)/i) || text.match(/heart\s*rate[:\s]*(\d+)/i) || text.match(/pulse[:\s]*(\d+)/i);
    if (hrMatch) {
        const hr = parseInt(hrMatch[1]);
        if (!isNaN(hr) && hr > 100) hrHigh = true;
    }
    
    // Try to extract BP systolic value
    const bpMatch = text.match(/bp[:\s]*(\d+)/i) || text.match(/blood\s*pressure[:\s]*(\d+)/i) || text.match(/(\d+)\s*\/\s*\d+/);
    if (bpMatch) {
        const sbp = parseInt(bpMatch[1]);
        if (!isNaN(sbp) && sbp < 100) bpLow = true;
    }
    
    return { hrHigh, bpLow };
};

// --- STANDARDIZED CONSTANTS ---

export const ORAL_INTAKE_OPTIONS: Option[] = [
    {label: 'I have a reduced appetite but can still eat and drink', value: 'reduced'},
    {label: 'I have had difficulty keeping food or fluids down', value: 'difficulty'},
    {label: 'I can barely eat or drink anything', value: 'barely'},
    {label: 'I have not been able to eat or drink in the last 24 hours', value: 'none'},
    {label: 'I can eat and drink normally', value: 'normal'}
];

// 12-hour specific version for Vomiting module
export const ORAL_INTAKE_OPTIONS_12H: Option[] = [
    {label: 'I have a reduced appetite but can still eat and drink', value: 'reduced'},
    {label: 'I have had difficulty keeping food or fluids down', value: 'difficulty'},
    {label: 'I can barely eat or drink anything', value: 'barely'},
    {label: 'I have not been able to eat or drink in the last 12 hours', value: 'none'},
    {label: 'I can eat and drink normally', value: 'normal'}
];

export const DEHYDRATION_SIGNS_OPTIONS: Option[] = [
    {label: 'Dark urine', value: 'dark_urine'},
    {label: 'Reduced urination for over 12 hours', value: 'less_urine'},
    {label: 'Constantly feeling thirsty', value: 'thirsty'},
    {label: 'Feeling lightheaded', value: 'lightheaded'},
    {label: 'I know my Heart Rate/Blood Pressure', value: 'vitals_known'},
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
    {label: 'Lomotil (diphenoxylate/atropine) 1-2 tablets up to 4 times daily', value: 'lomotil'},
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
        { id: 'stool_urine', text: 'Do you have any blood in your stool or urine?', type: 'choice', options: [
            {label: 'No', value: 'no'},
            {label: 'A little', value: 'little'},
            {label: 'A significant amount (about a cup)', value: 'significant'}
        ]},
        { id: 'injury', text: 'Did you injure yourself?', type: 'yes_no' },
        { id: 'thinners', text: 'Are you on blood thinners?', type: 'yes_no' },
        { id: 'location', text: 'Is the bruising in one area or all over your body?', type: 'choice', options: [
            {label: 'One area', value: 'one'}, 
            {label: 'All over', value: 'all'}
        ]}
    ],
    evaluateScreening: (answers) => {
        // Alert: Q1 = YES OR Q2 = "A significant amount"
        if (answers['pressure'] === true || answers['stool_urine'] === 'significant') {
            return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Non-stop bleeding or significant blood in stool/urine. Call 911 or Care Team immediately.' };
        }
        // Minor bleeding - notify care team
        if (answers['stool_urine'] === 'little') {
            return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Minor blood in stool/urine reported.' };
        }
        return { action: 'stop', triageLevel: 'none', triageMessage: 'Bruising reported - no significant bleeding.' };
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
          { id: 'worst_ever', text: 'Is this the worst headache of your life?', type: 'yes_no' },
          { id: 'vision_confusion', text: 'Are you experiencing any vision changes or confusion with this headache?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          // Alert: Q1 = YES OR Q2 = YES
          if (answers['worst_ever'] === true || answers['vision_confusion'] === true) {
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Severe headache reported: worst ever or with vision changes/confusion. Notify Care Team immediately.' };
          }
          return { action: 'stop', triageLevel: 'none', triageMessage: 'Headache reported - no red flag symptoms.' };
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
              {label: 'Other', value: 'other'},
              {label: 'None', value: 'none'}
          ]},
          { id: 'red_flags_other', text: 'Please describe:', type: 'text', condition: (a) => a['red_flags']?.includes('other') }
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
      name: 'Leg / Calf Pain',
      category: 'other',
      hidden: true,
      icon: Icons.Leg,
      screeningQuestions: [
          { id: 'swollen_one_leg', text: 'Is one leg more swollen, red, warm, or painful than the other?', type: 'yes_no' },
          { id: 'worse_walk', text: 'Does the pain get worse when you walk or press on your calf?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          // Alert: Any YES (Q1 or Q2) → DVT CONCERN
          if (answers['swollen_one_leg'] === true || answers['worse_walk'] === true) {
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'DVT CONCERN: One leg more swollen/painful or pain worsens with walking/pressure. Notify Care Team immediately.' };
          }
          return { action: 'stop', triageLevel: 'none', triageMessage: 'Leg pain reported - no DVT signs.' };
      }
      // Note: No Long FU needed per spec (Urgent priority)
  },
  'URG-112': {
      id: 'URG-112',
      name: 'Joint/Muscle Pain',
      category: 'other',
      hidden: true,
      icon: Icons.Joint,
      screeningQuestions: [
           { id: 'mobility', text: 'Is your pain making it hard to move around or sleep?', type: 'yes_no' },
           { id: 'controlled', text: 'Is the pain controlled with your usual pain medicine?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
           // Alert: Hard to move/sleep OR NOT controlled
           if (answers['mobility'] === true || answers['controlled'] === false) {
               return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Pain affects mobility/sleep or not controlled with usual medicine.' };
           }
           // Non-urgent: Controlled and no sleep/movement impact
           return { action: 'stop', triageLevel: 'none', triageMessage: 'Please let your care team know about these symptoms at your next appointment. If the pain prevents movement, please return and update me.' };
      }
  },
  'URG-113': {
      id: 'URG-113',
      name: 'General Aches & Fatigue',
      category: 'other',
      hidden: true,
      icon: Icons.Ache,
      screeningQuestions: [
           { id: 'better', text: 'Does the fatigue or aching get better with rest, hydration, or over-the-counter medicine?', type: 'yes_no' },
           { id: 'adl', text: 'Has the fatigue affected your ability to bathe, dress, or feed yourself without help?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
           // Alert: NO to Q1 (Doesn't get better) OR YES to Q2 (Can't perform ADLs)
           if (answers['better'] === false || answers['adl'] === true) {
               return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Fatigue is common, but inability to perform self-care is a priority for your care team.' };
           }
           // Non-urgent: YES to Q1 AND NO to Q2
           return { action: 'stop', triageLevel: 'none', triageMessage: 'Fatigue reported but manageable with rest/hydration.' };
      }
  },
  'URG-114': {
      id: 'URG-114',
      name: 'Port/IV Site',
      category: 'other',
      hidden: true,
      icon: Icons.Port,
      screeningQuestions: [
          { id: 'site_signs', text: 'Is there any new redness, swelling, or drainage at your port or IV site?', type: 'yes_no' },
          { id: 'site_pain', text: 'Is the site painful to the touch or feeling hot?', type: 'yes_no' },
          { id: 'port_temp', text: 'What is your temperature? (Number only)', type: 'number' }
      ],
      evaluateScreening: (answers) => {
          const t = parseFloat(answers['port_temp']);
          const hasFever = !isNaN(t) && t > 100.3;
          const hasSigns = answers['site_signs'] === true || answers['site_pain'] === true;
          
          // If port/IV site issue COMBINED with Fever → URGENT escalation
          if (hasSigns && hasFever) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Port/IV site infection signs WITH Fever - URGENT. Contact care team immediately or go to ER.' };
          }
          
          // Alert: YES to either site question
          if (hasSigns) {
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: 'Port/IV site shows signs of possible infection (redness, swelling, drainage, pain, or heat).' };
          }
          
          // Check for fever alone - branch to Fever module
          if (hasFever) {
              return { action: 'branch', branchToSymptomId: 'FEV-202' };
          }
          
          return { action: 'stop', triageLevel: 'none', triageMessage: 'Port/IV site checked - no concerning signs.' };
      }
  },
  // --- NEW: Falls & Balance (NEU-304) ---
  'NEU-304': {
      id: 'NEU-304',
      name: 'Falls & Balance',
      category: 'other',
      hidden: true,
      icon: Icons.Brain,
      screeningQuestions: [
          { id: 'falls', text: 'Have you had any falls since your last visit?', type: 'yes_no' },
          { id: 'neuro_signs', text: 'Are you experiencing any new dizziness, confusion, or trouble with your balance?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          // Alert: YES to either question
          if (answers['falls'] === true || answers['neuro_signs'] === true) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Falls or new neurological symptoms (dizziness, confusion, balance issues).' };
          }
          return { action: 'stop', triageLevel: 'none', triageMessage: 'No falls or balance issues reported.' };
      },
      followUpQuestions: [
          { id: 'head_hit', text: 'Did you hit your head?', type: 'yes_no', condition: (a) => a['falls'] === true },
          { id: 'blood_thinners', text: 'Are you currently on any blood thinners?', type: 'yes_no', condition: (a) => a['falls'] === true }
      ],
      evaluateFollowUp: (answers) => {
          // High Priority Alert: Head hit + blood thinners
          if (answers['head_hit'] === true && answers['blood_thinners'] === true) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'HIGH PRIORITY: Fall with head injury while on blood thinners - immediate evaluation required.' };
          }
          // Standard head injury still concerning
          if (answers['head_hit'] === true) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Fall with head injury - needs evaluation.' };
          }
          return { action: 'continue' };
      }
  },

  // --- EYE COMPLAINTS ---
  'EYE-207': {
      id: 'EYE-207',
      name: 'Eye Complaints',
      category: 'other',
      icon: Icons.Eye,
      screeningQuestions: [
          { id: 'new_concern', text: 'Is this eye concern new?', type: 'yes_no' },
          { id: 'symptoms', text: 'Are you experiencing any of the following?', type: 'multiselect', options: [
              {label: 'Pain', value: 'pain'},
              {label: 'Discharge', value: 'discharge'},
              {label: 'Excessive tearing', value: 'tearing'},
              {label: 'None', value: 'none'}
          ]},
          { id: 'vision_problems', text: 'Are you having any NEW problems with your vision?', type: 'yes_no' },
          { id: 'interfere', text: 'Does this interfere with your daily tasks?', type: 'yes_no' },
          { id: 'severity', text: 'Rate your symptoms:', type: 'choice', options: [
              {label: 'Mild', value: 'mild'}, 
              {label: 'Moderate', value: 'mod'}, 
              {label: 'Severe', value: 'sev'}
          ]}
      ],
      evaluateScreening: (answers) => {
          // Alert: Interfere daily tasks = YES OR Rate = Severe
          if (answers['interfere'] === true || answers['severity'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Eye symptoms interfere with daily tasks or rated severe.' };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'eye_doctor', text: 'Have you seen an eye doctor for this yet?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          return { action: 'continue' };
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
      { id: 'urine_color', text: 'What color is your urine?', type: 'choice', options: [
          {label: 'Clear', value: 'clear'}, 
          {label: 'Pale Yellow', value: 'pale'}, 
          {label: 'Dark', value: 'dark'}
      ]},
      { id: 'urine_amt', text: 'Is the amount of urine a lot less over the last 12 hours?', type: 'yes_no' },
      { id: 'thirsty', text: 'Are you feeling very thirsty?', type: 'yes_no' },
      { id: 'lightheaded', text: 'Are you feeling lightheaded?', type: 'yes_no' },
      { id: 'vitals_known', text: 'Do you know your heart rate or blood pressure? Please state if yes.', type: 'text' }
    ],
    evaluateScreening: (answers) => {
      // Parse vitals from text input
      const vitals = parseVitalsFromText(answers['vitals_known'] || '');
      
      // Alert: HR ≥100 OR SBP ≤100 OR Thirsty OR Lightheaded OR Less urine OR Dark urine
      if (vitals.hrHigh || vitals.bpLow || answers['thirsty'] === true || answers['lightheaded'] === true || answers['urine_amt'] === true || answers['urine_color'] === 'dark') {
        let message = 'Dehydration signs detected: ';
        const reasons = [];
        if (vitals.hrHigh) reasons.push('HR ≥100');
        if (vitals.bpLow) reasons.push('SBP ≤100');
        if (answers['thirsty'] === true) reasons.push('Very thirsty');
        if (answers['lightheaded'] === true) reasons.push('Lightheaded');
        if (answers['urine_amt'] === true) reasons.push('Reduced urine output');
        if (answers['urine_color'] === 'dark') reasons.push('Dark urine');
        message += reasons.join(', ') + '.';
        return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: message };
      }
      return { action: 'continue' };
    },
    followUpQuestions: [
      { id: 'vomiting_check', text: 'Have you been vomiting?', type: 'yes_no' },
      { id: 'diarrhea_check', text: 'Have you had diarrhea?', type: 'yes_no' },
      { id: 'intake', text: 'How is your oral intake (eating and drinking)?', type: 'choice', options: ORAL_INTAKE_OPTIONS },
      { id: 'fever_check', text: 'Do you have a fever?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
      // Cross-reference to other symptoms
      if (answers['vomiting_check'] === true) return { action: 'branch', branchToSymptomId: 'VOM-204' };
      if (answers['diarrhea_check'] === true) return { action: 'branch', branchToSymptomId: 'DIA-205' };
      if (answers['fever_check'] === true) return { action: 'branch', branchToSymptomId: 'FEV-202' };
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
      { id: 'fever_duration', text: 'How long have you had this fever?', type: 'choice', 
        options: [
          {label: 'Just started today', value: 'today'},
          {label: '1-2 days', value: '1-2d'},
          {label: '3+ days', value: '3+d'}
        ],
        condition: (a) => parseFloat(a['temp']) > 100.3 
      },
      { id: 'fever_meds', text: 'What medications have you taken to lower your temperature?', type: 'choice', 
        options: [
          {label: 'Tylenol (Acetaminophen)', value: 'tylenol'},
          {label: 'Advil/Motrin (Ibuprofen)', value: 'ibuprofen'},
          {label: 'Aspirin', value: 'aspirin'},
          {label: 'Other medication', value: 'other'},
          {label: 'None - I have not taken anything', value: 'none'}
        ]
      },
      { id: 'fever_meds_detail', text: 'What did you take and how often?', type: 'text', 
        condition: (a) => a['fever_meds'] && a['fever_meds'] !== 'none' 
      },
      { id: 'high_temp_symptoms', text: 'Are you experiencing any of these additional symptoms?', type: 'multiselect', 
        options: [
          {label: 'Heart rate > 100', value: 'hr'}, 
          {label: 'Nausea', value: 'nausea'}, 
          {label: 'Vomiting', value: 'vomit'}, 
          {label: 'Abdominal Pain', value: 'abd_pain'}, 
          {label: 'Diarrhea', value: 'diarrhea'}, 
          {label: 'Port Redness', value: 'port'}, 
          {label: 'Cough', value: 'cough'},
          {label: 'Dizziness', value: 'dizzy'}, 
          {label: 'Confusion', value: 'confusion'}, 
          {label: 'Burning with urination', value: 'burning'},
          {label: 'Chills or shaking', value: 'chills'},
          {label: 'Other', value: 'other'},
          {label: 'None of these', value: 'none'}
        ], 
        condition: (a) => parseFloat(a['temp']) > 100.3 
      },
      { id: 'high_temp_symptoms_other', text: 'Please describe the other symptom:', type: 'text', 
        condition: (a) => parseFloat(a['temp']) > 100.3 && a['high_temp_symptoms']?.includes('other') 
      }
    ],
    evaluateScreening: (answers) => {
      const t = parseFloat(answers['temp']);
      const meds = answers['fever_meds'];
      
      // Must answer medication question first
      if (!answers.hasOwnProperty('fever_meds')) {
          return { action: 'continue' };
      }
      
      // Case 1: Low grade (≤100.3) - still collect med info but lower concern
      if (!isNaN(t) && t <= 100.3) {
           let message = `Temperature ${t}°F is below fever threshold (100.3°F). `;
           if (meds && meds !== 'none') {
               message += `Patient taking ${meds}${answers['fever_meds_detail'] ? ': ' + answers['fever_meds_detail'] : ''}.`;
           } else {
               message += 'No fever medications taken.';
           }
           return { action: 'stop', triageLevel: 'none', triageMessage: message + ' Continue to monitor temperature.' };
      }
      
      // Case 2: High grade (>100.3) - need additional symptoms
      if (!isNaN(t) && t > 100.3) {
          // Wait for all conditional questions to be answered
          if (!answers.hasOwnProperty('high_temp_symptoms')) {
              return { action: 'continue' };
          }
          
          const symps = answers['high_temp_symptoms'] || [];
          const duration = answers['fever_duration'] || 'unknown';
          
          let message = `Fever ${t}°F (Duration: ${duration}). `;
          if (meds && meds !== 'none') {
              message += `Taking ${meds}${answers['fever_meds_detail'] ? ': ' + answers['fever_meds_detail'] : ''}. `;
          } else {
              message += 'No fever medications taken. ';
          }
          
          // Check for concerning symptoms
          if (symps.length > 0 && !symps.includes('none')) {
              message += `Associated symptoms: ${symps.filter((s: string) => s !== 'none').join(', ')}.`;
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: message };
          }
          
          // High fever alone is still concerning
          message += 'No additional symptoms reported.';
          return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: message };
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
      { id: 'med_freq', text: 'How often are you taking these medications?', type: 'text', condition: (a) => a['meds'] === 'other' },
      { id: 'severity_post_meds', text: 'Rate your nausea after taking medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}], condition: (a) => a['meds'] !== 'none' }
    ],
    evaluateScreening: (answers) => {
       // Alert: Oral intake "Barely eat/drink" or "Nothing for 24 hours"
       const intakeBad = answers['intake'] === 'none' || answers['intake'] === 'barely';
       
       // Alert: Duration ≥ 3 days AND (Worsening or Same)
       const chronicWorsening = answers['days'] === '>3d' && answers['trend'] === 'bad';

       if (intakeBad || chronicWorsening) {
           return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Oral intake barely/none OR Duration ≥3 days and worsening/same.' };
       }
       return { action: 'continue' };
    },
    followUpQuestions: [
        { id: 'vomiting_check', text: 'Have you vomited?', type: 'yes_no' },
        { id: 'abd_pain', text: 'Do you have abdominal pain or cramping?', type: 'yes_no' },
        { id: 'dehydration_signs', text: 'Any signs of dehydration?', type: 'multiselect', options: DEHYDRATION_SIGNS_OPTIONS },
        { id: 'vitals_input', text: 'Please enter your Heart Rate and/or Blood Pressure (e.g., HR: 95, BP: 110/70):', type: 'text', condition: (a) => a['dehydration_signs']?.includes('vitals_known') },
        { id: 'adl', text: 'Are you able to perform daily self care like bathing and dressing yourself?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
        if (answers['vomiting_check'] === true) return { action: 'branch', branchToSymptomId: 'VOM-204' };
        
        const symps = answers['dehydration_signs'] || [];
        const dehyKeys = DEHYDRATION_SIGNS_OPTIONS.map(o => o.value).filter(v => v !== 'none' && v !== 'vitals_known');
        
        // Check for vitals concern if they provided vitals
        if (symps.includes('vitals_known') && answers['vitals_input']) {
            const vitals = parseVitalsFromText(answers['vitals_input']);
            if (vitals.hrHigh || vitals.bpLow) return { action: 'branch', branchToSymptomId: 'DEH-201' };
        }
        
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
          { id: 'intake', text: 'How is your oral intake over the last 12 hours?', type: 'choice', options: ORAL_INTAKE_OPTIONS_12H },
          { id: 'meds', text: 'What medications for vomiting are you taking?', type: 'choice', options: MEDS_NAUSEA },
          { id: 'med_freq', text: 'How often are you taking them?', type: 'text', condition: (a) => a['meds'] === 'other' },
          { id: 'severity_post_med', text: 'Rate your vomiting after taking medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}], condition: (a) => a['meds'] !== 'none' }
      ],
      evaluateScreening: (answers) => {
          if (answers['vom_freq'] === 'high' || answers['intake'] === 'none' || answers['severity_post_med'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: '>6 episodes in 24 hrs OR No intake 12h OR Severe.' };
          }
          if (answers['severity_post_med'] === 'mod') { 
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate Vomiting reported.' };
          }
          return { action: 'continue'};
      },
      followUpQuestions: [
          { id: 'abd_pain', text: 'Do you have abdominal pain or cramping?', type: 'yes_no' },
          { id: 'adl', text: 'Are you able to perform daily self care?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          return { action: 'continue' };
      }
  },
  'DIA-205': {
      id: 'DIA-205',
      name: 'Diarrhea',
      category: 'common',
      icon: Icons.Poop,
      screeningQuestions: [
          { id: 'preface', text: 'Now let\'s talk about your diarrhea. How many days have you had diarrhea?', type: 'number' },
          { id: 'trend', text: 'Is it worsening or the same?', type: 'choice', options: [{label: 'Worsening/Same', value: 'bad'}, {label: 'Improving', value: 'good'}], condition: (a) => parseFloat(a['preface']) >= 3 },
          { id: 'stools', text: 'How many loose stools have you had in the last 24 hours?', type: 'number' },
          { id: 'stool_type', text: 'Are you experiencing any of these?', type: 'multiselect', options: [
              {label: 'My stool is black', value: 'black'}, {label: 'My stool has blood', value: 'blood'}, {label: 'My stool has mucus', value: 'mucus'}, {label: 'Other', value: 'other'}, {label: 'None of the above', value: 'none'}
          ]},
          { id: 'stool_type_other', text: 'Please describe:', type: 'text', condition: (a) => a['stool_type']?.includes('other') },
          { id: 'abd_pain', text: 'Are you having any abdominal pain or cramping?', type: 'yes_no' },
          { id: 'abd_pain_sev', text: 'Rate your abdominal pain:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}], condition: (a) => a['abd_pain'] === true },
          { id: 'meds', text: 'What medications for diarrhea are you taking?', type: 'choice', options: MEDS_DIARRHEA },
          { id: 'med_freq', text: 'How often are you taking them?', type: 'text', condition: (a) => a['meds'] === 'other' },
          { id: 'severity_post_med', text: 'Rate your diarrhea after medication:', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}], condition: (a) => a['meds'] !== 'none' },
          { id: 'dehydration_signs', text: 'Any signs of dehydration?', type: 'multiselect', options: DEHYDRATION_SIGNS_OPTIONS },
          { id: 'vitals_input', text: 'Please enter your Heart Rate and/or Blood Pressure (e.g., HR: 95, BP: 110/70):', type: 'text', condition: (a) => a['dehydration_signs']?.includes('vitals_known') },
          { id: 'intake', text: 'Able to eat/drink normally?', type: 'choice', options: ORAL_INTAKE_OPTIONS }
      ],
      evaluateScreening: (answers) => {
          const stools = parseFloat(answers['stools']);
          const types = answers['stool_type'] || [];
          const dehy = answers['dehydration_signs'] || [];
          const days = parseFloat(answers['preface']);
          
          // Alert: >5 loose stools/day
          if (stools > 5) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: '>5 loose stools/day reported.' };
          
          // Alert: Bloody/Black/Mucus stool
          if (types.includes('black') || types.includes('blood') || types.includes('mucus')) return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Bloody/Black/Mucus Stool reported.' };
          
          // Alert: Moderate Pain ≥ 3 days AND (Worsening/Same)
          if (answers['abd_pain_sev'] === 'mod' && !isNaN(days) && days >= 3 && answers['trend'] === 'bad') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate abdominal pain for ≥3 days and worsening/same.' };
          }
          
          // Alert: Severe abdominal pain
          if (answers['abd_pain_sev'] === 'sev') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Severe abdominal pain reported.' };
          
          // Alert: Dehydration signs or no intake
          if ((dehy.length > 0 && !dehy.includes('none')) || answers['intake'] === 'none') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration signs or No Intake.' };
          
          // Alert: Severe diarrhea despite meds
          if (answers['severity_post_med'] === 'sev') return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Severe Diarrhea despite meds.' };
          
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'adl', text: 'Are you able to do daily activities such as household work, eating and moving around?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => {
          const dehy = answers['dehydration_signs'] || [];
          const dehyKeys = DEHYDRATION_SIGNS_OPTIONS.map(o => o.value).filter(v => v !== 'none' && v !== 'vitals_known');
          
          // Check for vitals concern
          if (dehy.includes('vitals_known') && answers['vitals_input']) {
              const vitals = parseVitalsFromText(answers['vitals_input']);
              if (vitals.hrHigh || vitals.bpLow) return { action: 'branch', branchToSymptomId: 'DEH-201' };
          }
          
          if (dehy.some((s: string) => dehyKeys.includes(s))) return { action: 'branch', branchToSymptomId: 'DEH-201' };
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
          { id: 'days_bm', text: 'How many days has it been since your last bowel movement?', type: 'number' },
          { id: 'days_gas', text: 'How many days has it been since you passed gas?', type: 'number' },
          { id: 'discomfort', text: 'Rate your discomfort:', type: 'choice', options: [
              {label: 'Mild', value: 'mild'}, 
              {label: 'Moderate', value: 'mod'}, 
              {label: 'Severe', value: 'sev'}
          ]}
      ],
      evaluateScreening: (answers) => {
          const daysBM = parseFloat(answers['days_bm']);
          const daysGas = parseFloat(answers['days_gas']);
          
          // Alert: > 2 days since BM/Gas OR Severe pain
          if ((!isNaN(daysBM) && daysBM > 2) || (!isNaN(daysGas) && daysGas > 2) || answers['discomfort'] === 'sev') {
              let reasons = [];
              if (!isNaN(daysBM) && daysBM > 2) reasons.push(`No BM for ${daysBM} days`);
              if (!isNaN(daysGas) && daysGas > 2) reasons.push(`No gas for ${daysGas} days`);
              if (answers['discomfort'] === 'sev') reasons.push('Severe discomfort');
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: `Constipation alert: ${reasons.join(', ')}.` };
          }
          return { action: 'stop', triageLevel: 'none', triageMessage: 'Mild constipation - continue monitoring.' };
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
          { id: 'intake', text: 'How is your oral intake (eating and drinking)?', type: 'choice', options: ORAL_INTAKE_OPTIONS },
          { id: 'weight_loss', text: 'Have you lost more than 3 pounds in the last week?', type: 'yes_no' },
          { id: 'discomfort', text: 'Rate your discomfort:', type: 'choice', options: [
              {label: 'Mild', value: 'mild'}, 
              {label: 'Moderate', value: 'mod'}, 
              {label: 'Severe', value: 'sev'}
          ]}
      ],
      evaluateScreening: (answers) => {
          // Alert: No intake OR >3lbs loss OR Severe pain
          if (answers['intake'] === 'none' || answers['weight_loss'] === true || answers['discomfort'] === 'sev') {
              let reasons = [];
              if (answers['intake'] === 'none') reasons.push('Unable to eat/drink');
              if (answers['weight_loss'] === true) reasons.push('>3lbs weight loss this week');
              if (answers['discomfort'] === 'sev') reasons.push('Severe pain');
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: `Mouth sores alert: ${reasons.join(', ')}.` };
          }
          return { action: 'stop', triageLevel: 'none', triageMessage: 'Mouth sores reported - manageable.' };
      }
  },
  'APP-209': {
      id: 'APP-209',
      name: 'No Appetite',
      category: 'other',
      icon: Icons.Food,
      screeningQuestions: [
          { id: 'intake', text: 'How is your oral intake (eating and drinking)?', type: 'choice', options: ORAL_INTAKE_OPTIONS },
          { id: 'weight_loss', text: 'Have you lost more than 3 pounds in the last week?', type: 'yes_no' },
          { id: 'discomfort', text: 'Rate your discomfort:', type: 'choice', options: [
              {label: 'Mild', value: 'mild'}, 
              {label: 'Moderate', value: 'mod'}, 
              {label: 'Severe', value: 'sev'}
          ]}
      ],
      evaluateScreening: (answers) => {
          // Alert: No intake OR >3lbs loss OR Severe pain
          if (answers['intake'] === 'none' || answers['weight_loss'] === true || answers['discomfort'] === 'sev') {
              let reasons = [];
              if (answers['intake'] === 'none') reasons.push('Unable to eat/drink');
              if (answers['weight_loss'] === true) reasons.push('>3lbs weight loss this week');
              if (answers['discomfort'] === 'sev') reasons.push('Severe discomfort');
              return { action: 'stop', triageLevel: 'notify_care_team', triageMessage: `No appetite alert: ${reasons.join(', ')}.` };
          }
          return { action: 'stop', triageLevel: 'none', triageMessage: 'Reduced appetite reported - continue monitoring.' };
      }
  },
  'URI-211': {
      id: 'URI-211',
      name: 'Urinary Problems',
      category: 'other',
      icon: Icons.Toilet,
      screeningQuestions: [
          { id: 'amount', text: 'Has the amount of urine you produce drastically reduced or increased?', type: 'yes_no' },
          { id: 'burning', text: 'Do you have burning with urination?', type: 'choice', options: [
              {label: 'No', value: 'no'},
              {label: 'Mild', value: 'mild'}, 
              {label: 'Moderate', value: 'mod'}, 
              {label: 'Severe', value: 'sev'}
          ]},
          { id: 'pelvic', text: 'Are you having pelvic pain with urination?', type: 'yes_no' },
          { id: 'blood', text: 'Do you see any blood in your urine?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          // Alert: Q1 = YES OR Q3 = YES OR Q4 = YES OR Burning = Moderate/Severe
          const burningAlert = answers['burning'] === 'mod' || answers['burning'] === 'sev';
          if (answers['amount'] === true || answers['pelvic'] === true || answers['blood'] === true || burningAlert) {
              let reasons = [];
              if (answers['amount'] === true) reasons.push('Drastic urine change');
              if (answers['pelvic'] === true) reasons.push('Pelvic pain');
              if (answers['blood'] === true) reasons.push('Blood in urine');
              if (burningAlert) reasons.push(`${answers['burning']} burning with urination`);
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: `Urinary problems: ${reasons.join(', ')}.` };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'smell', text: 'Does your urine have an unusual smell?', type: 'yes_no' },
          { id: 'fluid_intake_normal', text: 'Are you drinking your normal amount of fluids?', type: 'yes_no' },
          { id: 'diabetic', text: 'Are you diabetic?', type: 'yes_no' },
          { id: 'sugar', text: 'If so, what is your blood sugar level?', type: 'number', condition: (a) => a['diabetic'] === true }
      ],
      evaluateFollowUp: (answers) => {
          const sugar = parseFloat(answers['sugar']);
          if (!isNaN(sugar) && (sugar > 250 || sugar < 60)) {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Diabetic with Blood Sugar >250 or <60.' };
          }
          // Branch to Dehydration check if not drinking normally
          if (answers['fluid_intake_normal'] === false) {
              return { action: 'branch', branchToSymptomId: 'DEH-201' };
          }
          return { action: 'continue' };
      }
  },
  'SKI-212': {
      id: 'SKI-212',
      name: 'Skin Rash / Redness',
      category: 'other',
      icon: Icons.Rash,
      screeningQuestions: [
          { id: 'loc', text: 'Where is the rash?', type: 'multiselect', options: [{label: 'Face', value: 'face'}, {label: 'Chest', value: 'chest'}, {label: 'Arms', value: 'arms'}, {label: 'Legs', value: 'legs'}, {label: 'Infusion Site', value: 'infusion'}, {label: 'Other', value: 'other'}]},
          { id: 'loc_other', text: 'Please describe the location:', type: 'text', condition: (a) => a['loc']?.includes('other') },
          { id: 'infusion_sx', text: 'If Infusion Site, do you have:', type: 'multiselect', options: [{label: 'Swelling', value: 'swelling'}, {label: 'Redness', value: 'redness'}, {label: 'Open Wound', value: 'wound'}, {label: 'Other', value: 'other'}, {label: 'None', value: 'none'}], condition: (a) => a['loc']?.includes('infusion') },
          { id: 'infusion_sx_other', text: 'Please describe:', type: 'text', condition: (a) => a['loc']?.includes('infusion') && a['infusion_sx']?.includes('other') },
          { id: 'face_breath', text: 'Is there any trouble breathing?', type: 'yes_no', condition: (a) => a['loc']?.includes('face') },
          { id: 'coverage', text: 'Does the rash cover more than 30% of your body?', type: 'yes_no' },
          { id: 'adl', text: 'Does the rash affect your daily activities (ADLs)?', type: 'yes_no' },
          { id: 'rash_temp', text: 'What is your temperature?', type: 'number' },
          { id: 'severity', text: 'Rate your rash', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]}
      ],
      evaluateScreening: (answers) => {
          if (answers['face_breath'] === true) return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Facial Rash with Breathing Difficulty.' };
          
          const inf = answers['infusion_sx'] || [];
          const t = parseFloat(answers['rash_temp']);
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
              {label: 'I feel unwell', value: 'unwell'}, {label: 'Skin cracked', value: 'cracked'}, {label: 'Liquid from rash', value: 'liquid'}, {label: 'Other', value: 'other'}, {label: 'None', value: 'none'}
          ]},
          { id: 'symptoms_other', text: 'Please describe:', type: 'text', condition: (a) => a['symptoms']?.includes('other') }
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
              {label: 'Nerve (Burning/Tingling)', value: 'nerve'}, {label: 'General/Fatigue', value: 'fatigue'}, {label: 'Port Site', value: 'port'},
              {label: 'Other', value: 'other'}
          ]},
          { id: 'loc_other', text: 'Please describe the location:', type: 'text', condition: (a) => a['loc']?.includes('other') },
          { id: 'severity', text: 'Rate your pain', type: 'choice', options: [{label: 'Mild', value: 'mild'}, {label: 'Moderate', value: 'mod'}, {label: 'Severe', value: 'sev'}]},
          { id: 'interfere', text: 'Does it interfere with daily activities?', type: 'yes_no' },
          { id: 'pain_temp', text: 'What is your temperature? (Number)', type: 'number' }
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
          
          const t = parseFloat(answers['pain_temp']);
          const fever = !isNaN(t) && t > 100.3;
          
          if (answers['severity'] === 'sev' || answers['severity'] === 'mod' || fever) {
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
          { id: 'days', text: 'How long have you had this cough?', type: 'choice', options: DURATION_OPTIONS_SHORT },
          { id: 'cough_temp', text: 'What is your temperature?', type: 'number' },
          { id: 'mucus', text: 'Are you coughing up any mucus?', type: 'choice', options: [
              {label: 'No', value: 'no'},
              {label: 'Clear', value: 'clear'},
              {label: 'Yellow-Green', value: 'yellow_green'},
              {label: 'Blood-streaked or Pink', value: 'blood'}
          ]},
          { id: 'meds', text: 'What medications are you using for your cough?', type: 'choice', options: MEDS_COUGH },
          { id: 'helping', text: 'Is the medication helping?', type: 'yes_no', condition: (a) => a['meds'] && a['meds'] !== 'none' }
      ],
      evaluateScreening: (answers) => {
          const temp = parseFloat(answers['cough_temp']);
          const highTemp = !isNaN(temp) && temp >= 100.3;
          const bloodMucus = answers['mucus'] === 'blood';
          const longDuration = answers['days'] === '>1w' || answers['days'] === '>3w';
          
          // Alert: Temp ≥ 100.3°F OR Blood/Pink mucus OR Duration > 1 week
          if (highTemp || bloodMucus || longDuration) {
              let reasons = [];
              if (highTemp) reasons.push(`Temp ${temp}°F`);
              if (bloodMucus) reasons.push('Blood-streaked/pink mucus');
              if (longDuration) reasons.push('Duration > 1 week');
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: `Cough alert: ${reasons.join(', ')}.` };
          }
          return { action: 'continue' };
      },
      followUpQuestions: [
          { id: 'chest_sob', text: 'Are you having chest pain or shortness of breath?', type: 'yes_no' },
          { id: 'exposure', text: 'Have you been around anyone with a recent respiratory illness?', type: 'yes_no' }
      ],
      evaluateFollowUp: (answers) => { 
          // Branch to emergency if chest pain or SOB
          if (answers['chest_sob'] === true) {
              return { action: 'branch', branchToSymptomId: 'URG-101' };
          }
          return { action: 'continue' }; 
      }
  },
  'NEU-216': {
      id: 'NEU-216',
      name: 'Neuropathy (Numbness)',
      category: 'other',
      icon: Icons.Nerve,
      screeningQuestions: [
          { id: 'duration', text: 'How long have you had numbness and tingling?', type: 'choice', options: [{label: 'Started Today', value: 'today'}, {label: '1-3 days', value: '1-3d'}, {label: '4-7 days', value: '4-7d'}, {label: '> 1 week', value: '>1w'}, {label: 'Other', value: 'other'}] },
          { id: 'duration_other', text: 'Please describe:', type: 'text', condition: (a) => a['duration'] === 'other' },
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