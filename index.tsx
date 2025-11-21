import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";

// --- Types & Interfaces ---

type InputType = 'yes_no' | 'text' | 'number' | 'choice' | 'multiselect';
type ActionLevel = 'none' | 'refer_provider' | 'notify_care_team' | 'call_911';
type SymptomStatus = 'checking' | 'safe' | 'alert' | 'emergency';

interface Option {
  label: string;
  value: string | boolean | number;
}

interface Question {
  id: string;
  text: string;
  type: InputType;
  options?: Option[];
}

interface LogicResult {
  action: 'continue' | 'branch' | 'stop';
  triageLevel?: ActionLevel;
  triageMessage?: string;
  branchToSymptomId?: string;
  skipRemaining?: boolean; // Short-circuits screening if critical threshold met
}

interface SymptomDef {
  id: string;
  name: string;
  category: 'emergency' | 'common' | 'other';
  icon: React.ReactNode;
  screeningQuestions: Question[];
  evaluateScreening: (answers: Record<string, any>) => LogicResult;
  followUpQuestions?: Question[];
  evaluateFollowUp?: (answers: Record<string, any>) => LogicResult;
}

// --- ICONS ---
const Icons = {
  Lungs: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Heart: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  Bleed: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Drop: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>, // Syncope/Person
  Brain: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>, // Altered Mental
  Head: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Headache
  Stomach: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
  Leg: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, // Pain/Bolt
  Port: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg>,
  Water: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  Thermometer: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Nausea: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Vomit: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, // Generic alert
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

// --- HELPERS ---

const isHigherSeverity = (current: ActionLevel, newLevel: ActionLevel): boolean => {
    const levels = ['none', 'refer_provider', 'notify_care_team', 'call_911'];
    return levels.indexOf(newLevel) > levels.indexOf(current);
};

// --- DATA: Strict Logic Implementation ---

const SYMPTOMS: Record<string, SymptomDef> = {
  // --- EMERGENCY ---
  'URG-101': {
    id: 'URG-101',
    name: 'Trouble Breathing',
    category: 'emergency',
    icon: Icons.Lungs,
    screeningQuestions: [
      { id: 'q1', text: 'Are you having Trouble Breathing or Shortness of Breath?', type: 'yes_no' }
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
        { id: 'stool_urine', text: 'Do you have a significant amount of blood in your stool or urine?', type: 'yes_no' },
        { id: 'injury', text: 'Did you injure yourself?', type: 'yes_no' },
        { id: 'thinners', text: 'Are you on blood thinners?', type: 'yes_no' },
        { id: 'location', text: 'Is the bruising in one area or all over?', type: 'choice', options: [{label: 'One Area', value: 'one'}, {label: 'All Over', value: 'all'}] },
    ],
    evaluateScreening: (answers) => {
        if (answers['pressure'] === true || answers['stool_urine'] === true) {
            return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Non-stop Bleeding or Significant GI/GU Bleed.' };
        }
        if (answers['location']) {
             return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Reports of bleeding/bruising (Alert Flow Stops).' };
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
  
  // --- PAIN SUB-MODULES (Listed as Emergency for quick access if critical) ---
  'URG-109': {
      id: 'URG-109',
      name: 'Headache',
      category: 'emergency',
      icon: Icons.Head,
      screeningQuestions: [
          { id: 'worst_ever', text: 'Is this the worst headache you’ve ever had, or did it start suddenly and very strongly?', type: 'yes_no' },
          { id: 'neuro_symptoms', text: 'Do you also have any of these?', type: 'multiselect', options: [
              {label: 'Blurred/Double Vision', value: 'vision'},
              {label: 'Trouble speaking', value: 'speech'},
              {label: 'Face droopy', value: 'face'},
              {label: 'Arm/Leg weak or heavy', value: 'weakness'},
              {label: 'Balance trouble', value: 'balance'},
              {label: 'None', value: 'none'}
          ]}
      ],
      evaluateScreening: (answers) => {
          const symps = answers['neuro_symptoms'] || [];
          if (answers['worst_ever'] === true || (symps.length > 0 && !symps.includes('none'))) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Severe Headache with Neuro signs (Possible Stroke/Aneurysm).' };
          }
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Headache reported.' };
      }
  },
  'URG-110': {
      id: 'URG-110',
      name: 'Severe Abdominal Pain',
      category: 'emergency',
      icon: Icons.Stomach,
      screeningQuestions: [
          { id: 'severe', text: 'Is your stomach pain very strong or getting worse quickly?', type: 'yes_no' },
          { id: 'red_flags', text: 'Do you have any of these?', type: 'multiselect', options: [
              {label: 'Fever', value: 'fever'},
              {label: 'Belly swollen/hard', value: 'swollen'},
              {label: 'Repeated vomiting', value: 'vomit'},
              {label: 'Cannot pass gas/stool', value: 'blockage'},
              {label: 'None', value: 'none'}
          ]}
      ],
      evaluateScreening: (answers) => {
          const flags = answers['red_flags'] || [];
          if (answers['severe'] === true || (flags.length > 0 && !flags.includes('none'))) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Severe Abdominal Pain with Red Flags (Possible Obstruction/Infection).' };
          }
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Abdominal pain reported.' };
      }
  },
  'URG-111': {
      id: 'URG-111',
      name: 'Leg/Calf Pain',
      category: 'emergency',
      icon: Icons.Leg,
      screeningQuestions: [
          { id: 'dvt_signs', text: 'Is one leg more swollen, red, warm, or painful than the other?', type: 'yes_no' },
          { id: 'worse_walk', text: 'Does the pain get worse when you walk or press on the calf?', type: 'yes_no' }
      ],
      evaluateScreening: (answers) => {
          if (answers['dvt_signs'] === true || answers['worse_walk'] === true) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Leg pain with DVT signs (Swelling, Redness, Warmth).' };
          }
          return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Leg pain reported.' };
      }
  },
  'URG-114': {
      id: 'URG-114',
      name: 'Port Site Pain',
      category: 'emergency',
      icon: Icons.Port,
      screeningQuestions: [
          { id: 'infection_signs', text: 'Do you have redness, drainage, or chills?', type: 'yes_no' },
          { id: 'temp', text: 'What is your temperature? (Number only)', type: 'number' }
      ],
      evaluateScreening: (answers) => {
          const t = parseFloat(answers['temp']);
          if (answers['infection_signs'] === true || (!isNaN(t) && t > 100.3)) {
              return { action: 'stop', triageLevel: 'call_911', triageMessage: 'Port site infection signs or Fever.' };
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
      { id: 'urine_color', text: 'What color is your urine?', type: 'choice', options: [{label: 'Clear/Pale', value: 'clear'}, {label: 'Yellow', value: 'yellow'}, {label: 'Dark/Amber', value: 'dark'}] },
      { id: 'urine_amt', text: 'Is the amount of urine a lot less over the last 12 hours?', type: 'yes_no' },
      { id: 'thirsty', text: 'Are you very thirsty?', type: 'yes_no' },
      { id: 'lightheaded', text: 'Are you lightheaded?', type: 'yes_no' },
      { id: 'hr_sbp', text: 'Has a doctor told you your Heart Rate is >100 or BP <100?', type: 'yes_no' }
    ],
    evaluateScreening: (answers) => {
      if (answers['hr_sbp'] === true || answers['thirsty'] === true || answers['lightheaded'] === true || answers['urine_amt'] === true || answers['urine_color'] === 'dark') {
        return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration Signs: HR>100, SBP<100, Thirsty, Lightheaded, or Reduced Urine.', skipRemaining: true };
      }
      return { action: 'continue' };
    },
    followUpQuestions: [
        { id: 'vom_diarrhea', text: 'Do you have vomiting or diarrhea?', type: 'yes_no' },
        { id: 'intake', text: 'Are you able to eat/drink?', type: 'yes_no' },
        { id: 'fever', text: 'Do you have a fever?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
        if (answers['vom_diarrhea'] === true) return { action: 'branch', branchToSymptomId: 'VOM-204' };
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
      { id: 'temp', text: '1. What is your temperature? (Enter number, e.g., 101.5)', type: 'number' },
      { id: 'meds', text: '2. What medications have you taken to lower your temperature? If none, state none.', type: 'text' },
      { id: 'med_freq', text: '3. If taking medications, what did you take and how often?', type: 'text' }
    ],
    evaluateScreening: (answers) => {
      const t = parseFloat(answers['temp']);
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
            {label: 'None', value: 'none'}
        ]},
        { id: 'neuro', text: '4. Are you experiencing Dizziness, Confusion, or Burning at urination?', type: 'yes_no' },
        { id: 'intake', text: '5. Have you been able to eat/drink normally?', type: 'choice', options: [
            {label: 'Reduced appetite but can still eat/drink', value: 'reduced'},
            {label: 'Difficulty keeping food or fluids down', value: 'difficulty'},
            {label: 'Barely can eat or drink anything', value: 'barely'},
            {label: 'Not been able to eat/drink in last 24 hours', value: 'none'},
            {label: 'Yes, Normal', value: 'normal'}
        ]},
        { id: 'adl', text: '6. Are you able to perform daily self care like bathing, using the toilet, eating independently?', type: 'yes_no' }
    ],
    evaluateFollowUp: (answers) => {
        if (answers['breathing'] === true) return { action: 'branch', branchToSymptomId: 'URG-101' };
        // Removed branches for Nausea, Vomit, Diarrhea, Cough as per user request to only do cross symptom if applicable (specified in rules)
        return { action: 'continue' };
    }
  },
  'NAU-203': {
    id: 'NAU-203',
    name: 'Nausea',
    category: 'common',
    icon: Icons.Nausea,
    screeningQuestions: [
      { id: 'days', text: 'How many days have you been nauseated?', type: 'choice', options: [{label: 'Less than a day', value: '<1'}, {label: 'Last 24 hours', value: '24h'}, {label: '2-3 days', value: '2-3d'}, {label: '>3 days', value: '>3d'}] },
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
           return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Intake Issue OR Severe Nausea OR Moderate for ≥3 days.', skipRemaining: true };
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
          { id: 'days', text: 'How many days have you been vomiting?', type: 'text' },
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: '>6 episodes in 24 hrs OR No intake 12h OR Severe.', skipRemaining: true };
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
          { id: 'days', text: 'How many days have you had diarrhea?', type: 'number' },
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
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: '>5 loose stools/day reported.', skipRemaining: true };
          }
          // "Moderate/Severe abdominal pain"
          if (answers['pain_sev'] === 'mod' || answers['pain_sev'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Moderate/Severe abdominal pain reported.', skipRemaining: true };
          }
          // "Stool is Bloody/Black/Mucus"
          if (types.includes('black') || types.includes('blood') || types.includes('mucus')) {
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Bloody/Black/Mucus Stool reported.', skipRemaining: true };
          }
          // "Dehydration signs OR Intake Almost Nothing"
          if ((dehy.length > 0 && !dehy.includes('none')) || answers['intake'] === 'none') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Dehydration signs or No Intake.', skipRemaining: true };
          }
          // "Rating Severe DESPITE meds"
          if (answers['severity_post_med'] === 'sev') {
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Severe Diarrhea despite meds.', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'No bowel movement for > 2 days (48 hours).', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'refer_provider', triageMessage: 'Interference to Daily Tasks OR Rating Severe.', skipRemaining: true };
          }
          if (answers['severity'] === 'mod' && parseFloat(answers['days']) >= 3 && answers['trend'] !== 'better') {
              return { action: 'continue', triageLevel: 'refer_provider', triageMessage: 'Moderate Fatigue >= 3 days.', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Interference to Daily Tasks OR Rating Severe.', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Not able to eat/drink normally OR Rating Severe.', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Recent weight loss >3 lbs in a week OR Eating less than half of usual meals.', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Urine change OR Pelvic Pain OR Blood OR Moderate/Severe burning.', skipRemaining: true };
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
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Infusion issue OR ADL impact OR Fever OR >30% Coverage.', skipRemaining: true };
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
      name: 'Pain / General Aches',
      category: 'other',
      icon: Icons.Pain,
      screeningQuestions: [
          { id: 'loc', text: 'Where is your pain?', type: 'multiselect', options: [
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Pain Severity/Interference Met.', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Unilateral leg swelling OR Redness OR Rating Moderate/Severe.', skipRemaining: true };
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
               return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Cough prevents ADLs OR Temp >100.4F OR O2 <92%.', skipRemaining: true };
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
              return { action: 'continue', triageLevel: 'notify_care_team', triageMessage: 'Interference with Normal Activities OR Rating Moderate-Severe.', skipRemaining: true };
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
  
  if (message.isSystem) {
    return (
      <div className="flex w-full justify-center mb-4 animate-fade-in px-4">
         <span className={`
            text-xs px-3 py-1.5 rounded-full font-bold tracking-wide flex items-center uppercase border shadow-sm
            ${message.symptomStatus === 'safe' ? 'bg-green-100 border-green-200 text-green-800' : ''}
            ${message.symptomStatus === 'emergency' ? 'bg-red-100 border-red-200 text-red-800' : ''}
            ${message.symptomStatus === 'alert' ? 'bg-amber-100 border-amber-200 text-amber-800' : ''}
            ${message.symptomStatus === 'checking' ? 'bg-blue-50 border-blue-100 text-blue-800' : ''}
            ${!message.symptomStatus ? 'bg-slate-100 border-slate-200 text-slate-600' : ''}
         `}>
            {message.symptomStatus === 'checking' && <span className="mr-2 text-base animate-pulse">🩺</span>}
            {message.symptomStatus === 'safe' && <span className="mr-2 text-base">✅</span>}
            {message.symptomStatus === 'alert' && <span className="mr-2 text-base">⚠️</span>}
            {message.symptomStatus === 'emergency' && <span className="mr-2 text-base">🚨</span>}
            {message.content}
         </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full ${isBot ? 'justify-start' : 'justify-end'} mb-3 animate-fade-in`}>
      <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm md:text-base shadow-sm leading-relaxed ${
        message.isAlert 
          ? 'bg-red-50 border border-red-200 text-red-900' 
          : isBot 
            ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none' 
            : 'bg-teal-600 text-white rounded-tr-none shadow-md'
      }`}>
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

const SymptomCard: React.FC<{ symptom: SymptomDef, onClick: (id: string) => void, variant: 'emergency' | 'common' | 'other' }> = ({ symptom, onClick, variant }) => {
    const baseClasses = "p-5 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 active:scale-95 flex flex-col justify-between w-full text-left group relative overflow-hidden min-h-[150px]";
    const styles = {
        emergency: "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:border-red-200",
        common: "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:border-teal-200",
        other: "bg-white border-slate-100 shadow-sm hover:shadow-lg hover:border-indigo-200"
    };
    
    const iconBg = variant === 'emergency' ? 'bg-red-50 text-red-600 group-hover:bg-red-100' : variant === 'common' ? 'bg-teal-50 text-teal-600 group-hover:bg-teal-100' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100';

    return (
        <button onClick={() => onClick(symptom.id)} className={`${baseClasses} ${styles[variant]}`}>
            <div className="flex justify-between items-start w-full">
                 <div className={`p-3.5 rounded-2xl transition-colors ${iconBg}`}>
                    {symptom.icon}
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                   <span className="text-slate-400 font-bold text-lg leading-none">➔</span>
                </div>
            </div>
            <div className="mt-4">
                <span className="font-bold text-slate-800 text-lg block leading-tight mb-1 group-hover:text-teal-700 transition-colors">{symptom.name}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{variant === 'emergency' ? 'Immediate Triage' : 'Standard Check'}</span>
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

  return (
    <div className="w-full max-w-xs mx-auto mb-4 px-6">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1.5 left-0 w-full h-0.5 bg-slate-200 -z-10"></div>
        {steps.map((step, idx) => (
          <div key={step.id} className="flex flex-col items-center bg-slate-50 px-2 z-10">
             <div className={`w-3 h-3 rounded-full border-[3px] transition-colors duration-500 ${step.active ? 'bg-white border-teal-600 box-content' : 'bg-slate-200 border-slate-200'}`}></div>
             <span className={`text-[9px] font-bold mt-1 uppercase tracking-wider transition-colors duration-300 ${step.active ? 'text-teal-700' : 'text-slate-300'}`}>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Logic Hook ---
// (Unchanged Logic from previous iteration, keeping all strict rules)
const useSymptomChecker = () => {
  const [history, setHistory] = useState<Message[]>([
    { id: 'welcome', sender: 'bot', content: 'Hello. I am the OncoLife Assistant. Please select a symptom below. If this is a medical emergency, call 911 immediately.' }
  ]);
  const [currentSymptomId, setCurrentSymptomId] = useState<string | null>(null);
  const [currentSymptomMsgId, setCurrentSymptomMsgId] = useState<string | null>(null);
  const [stage, setStage] = useState<'selection' | 'screening' | 'followup' | 'complete'>('selection');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [visitedSymptoms, setVisitedSymptoms] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [highestSeverity, setHighestSeverity] = useState<ActionLevel>('none');
  const [triageReasons, setTriageReasons] = useState<string[]>([]);
  
  // Track severity per symptom for the summary
  const [symptomResults, setSymptomResults] = useState<Record<string, ActionLevel>>({});

  const addMessage = (text: string | React.ReactNode, sender: 'bot' | 'user', isAlert = false, isSystem = false, symptomId?: string, symptomStatus?: SymptomStatus) => {
    const id = Date.now().toString();
    setHistory(prev => [...prev, { id, sender, content: text, isAlert, isSystem, symptomId, symptomStatus }]);
    return id;
  };

  const updateTriage = (level: ActionLevel, reason?: string) => {
      setHighestSeverity(prev => isHigherSeverity(prev, level) ? level : prev);
      if (reason && !triageReasons.includes(reason)) {
          setTriageReasons(prev => [...prev, reason]);
      }
      
      // Update the specific result for the current symptom
      if (currentSymptomId) {
          setSymptomResults(prev => {
              const current = prev[currentSymptomId] || 'none';
              return { ...prev, [currentSymptomId]: isHigherSeverity(current, level) ? level : current };
          });
      }
  };

  const startSymptom = (symptomId: string) => {
    // Loop Guard
    if (visitedSymptoms.includes(symptomId)) {
        addMessage(`(System Note: Symptom '${SYMPTOMS[symptomId].name}' already checked, skipping to prevent loop)`, 'bot', false, true);
        completeSession();
        return;
    }

    const symptom = SYMPTOMS[symptomId];
    setCurrentSymptomId(symptomId);
    setStage('screening');
    setCurrentQuestionIndex(0);
    setAnswers({}); 
    setVisitedSymptoms(prev => [...prev, symptomId]);
    setSymptomResults(prev => ({ ...prev, [symptomId]: 'none' })); // Initialize as safe
    
    // Add System Message for Symptom Start and track ID
    const msgId = addMessage(`Checking: ${symptom.name}`, 'bot', false, true, symptomId, 'checking');
    setCurrentSymptomMsgId(msgId);
    
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      askQuestion(symptom.screeningQuestions[0]);
    }, 600);
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

    let displayAnswer = answer;
    if (currentQ.type === 'yes_no') displayAnswer = answer ? 'Yes' : 'No';
    if (currentQ.type === 'choice') displayAnswer = currentQ.options?.find(o => o.value === answer)?.label || answer;
    if (Array.isArray(answer)) displayAnswer = answer.join(', ') || 'None';
    addMessage(displayAnswer, 'user');

    // === DYNAMIC EVALUATION STEP ===
    let skipRemaining = false;
    if (stage === 'screening') {
        const result = symptom.evaluateScreening(newAnswers);
        
        // Immediate Stop Conditions
        if (result.action === 'stop' || result.triageLevel === 'call_911') {
            updateTriage(result.triageLevel!, result.triageMessage);
            completeSession();
            return;
        }
        
        // Triage Level Increase
        if (result.triageLevel && isHigherSeverity(highestSeverity, result.triageLevel)) {
             updateTriage(result.triageLevel, result.triageMessage);
        }
        
        // Short-circuit logic (Alert met)
        if (result.skipRemaining) {
            skipRemaining = true;
            addMessage("Based on your answer, this requires medical attention. I am skipping remaining screening questions to check for related complications.", 'bot', false, true);
        }
    }
    // ===============================

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (!skipRemaining && currentQuestionIndex < currentQList.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        askQuestion(currentQList[currentQuestionIndex + 1]);
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
        completeSession();
        return;
    }

    if (result.action === 'branch' && result.branchToSymptomId) {
        if (visitedSymptoms.includes(result.branchToSymptomId)) {
            completeSession();
            return;
        }
        addMessage(`Based on your answers, we need to check ${SYMPTOMS[result.branchToSymptomId].name}.`, 'bot', false, true);
        setTimeout(() => startSymptom(result.branchToSymptomId!), 800);
        return;
    }

    if (symptom.followUpQuestions && symptom.followUpQuestions.length > 0) {
        setStage('followup');
        setCurrentQuestionIndex(0);
        addMessage("I need to ask a few follow-up questions.", 'bot');
        setTimeout(() => askQuestion(symptom.followUpQuestions![0]), 500);
    } else {
        completeSession();
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
              completeSession();
              return;
          }

          if (result.action === 'branch' && result.branchToSymptomId) {
              if (visitedSymptoms.includes(result.branchToSymptomId)) {
                  completeSession();
                  return;
              }
              addMessage(`Checking related symptom: ${SYMPTOMS[result.branchToSymptomId].name}`, 'bot', false, true);
              setTimeout(() => startSymptom(result.branchToSymptomId!), 800);
              return;
          }
      }
      completeSession();
  };

  const completeSession = () => {
    // Update previous symptom message status
    setHistory(prev => prev.map(msg => {
        if (msg.symptomStatus === 'checking') {
            let status: SymptomStatus = 'safe';
            // Determine status based on current highest severity
            if (highestSeverity === 'call_911') status = 'emergency';
            else if (highestSeverity === 'notify_care_team' || highestSeverity === 'refer_provider') status = 'alert';
            return { ...msg, symptomStatus: status };
        }
        return msg;
    }));

    setStage('complete');
  };

  const reset = () => {
    setCurrentSymptomId(null);
    setCurrentSymptomMsgId(null);
    setStage('selection');
    setAnswers({});
    setHighestSeverity('none');
    setTriageReasons([]);
    setVisitedSymptoms([]);
    setSymptomResults({});
    setHistory([{ id: Date.now().toString(), sender: 'bot', content: 'Hello. I am the OncoLife Assistant. Please select a symptom below.' }]);
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
    highestSeverity,
    triageReasons,
    startSymptom,
    visitedSymptoms,
    symptomResults
  };
};

// --- Main UI ---

function App() {
  const { history, stage, startSymptom, handleAnswer, isTyping, currentQuestion, reset, currentSymptomId, highestSeverity, triageReasons, visitedSymptoms, symptomResults } = useSymptomChecker();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [textInput, setTextInput] = useState('');
  const [multiSelect, setMultiSelect] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // References for scroll
  const emergencyRef = useRef<HTMLDivElement>(null);
  const commonRef = useRef<HTMLDivElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isTyping, stage]);

  const handleSubmitText = () => {
    if (!textInput.trim()) return;
    handleAnswer(textInput);
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

  // Filter Logic
  const filteredSymptoms = Object.values(SYMPTOMS).filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const URGENT_SYMPTOMS = filteredSymptoms.filter(s => s.category === 'emergency');
  const COMMON_SYMPTOMS = filteredSymptoms.filter(s => s.category === 'common');
  const OTHER_SYMPTOMS = filteredSymptoms.filter(s => s.category === 'other');

  return (
    <div className="flex flex-col h-screen w-full mx-auto overflow-hidden font-sans text-slate-900 bg-slate-50">
      {/* Sticky Header with Glassmorphism */}
      <div className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all duration-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
                {/* Logo Icon */}
                <div className="w-9 h-9 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-teal-500 to-teal-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M10.5 3C7.46 3 5 5.46 5 8.5C5 12.3 8.5 16 10 17.5L8.5 21H11L12 18.5L13 21H15.5L14 17.5C15.5 16 19 12.3 19 8.5C19 5.46 16.54 3 13.5 3C12.4 3 11.4 3.3 10.5 3ZM12 5C13.93 5 15.5 6.57 15.5 8.5C15.5 10.9 13.5 13.5 12 15C10.5 13.5 8.5 10.9 8.5 8.5C8.5 6.57 10.07 5 12 5Z" />
                  </svg>
                </div>
                <div>
                    <h1 className="font-bold text-slate-800 text-lg leading-tight tracking-tight">OncoLife</h1>
                    <p className="text-slate-400 text-[10px] font-bold tracking-wider uppercase">Symptom Triage AI</p>
                </div>
            </div>
            <div className="flex items-center space-x-3">
                <button onClick={handleShare} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Share App Link">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                </button>
                {stage !== 'selection' ? (
                    <button onClick={reset} className="bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold py-2 px-4 rounded-lg transition-all border border-slate-200 shadow-sm hover:shadow active:scale-95">
                        Exit Chat
                    </button>
                ) : (
                    <div className="flex items-center space-x-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                        </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide hidden sm:block">Online</span>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 scrollbar-hide" ref={scrollRef}>
        
        {stage === 'selection' ? (
            /* --- DASHBOARD VIEW --- */
            <div className="animate-fade-in pb-20">
                
                {/* Hero / Search Section */}
                <div className="bg-teal-700 px-4 pt-10 pb-24 relative overflow-hidden bg-gradient-to-br from-teal-700 to-teal-900">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none mix-blend-overlay">
                         <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" /></svg>
                    </div>
                    <div className="max-w-2xl mx-auto text-center relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">How are you feeling?</h2>
                        <p className="text-teal-100 text-sm md:text-base mb-8 opacity-90">Select a symptom below to start your professional safety assessment.</p>
                        
                        <div className="relative max-w-lg mx-auto group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input 
                                type="text" 
                                className="block w-full pl-12 pr-4 py-4 rounded-2xl text-slate-900 placeholder-slate-400 bg-white shadow-xl focus:ring-4 focus:ring-teal-500/30 focus:outline-none text-base transition-all"
                                placeholder="Search symptoms (e.g. Fever, Pain)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Sticky Category Nav */}
                <div className="sticky top-[60px] z-30 bg-slate-50/95 backdrop-blur-md border-b border-slate-200/60 px-4 py-3 overflow-x-auto flex gap-2 justify-start md:justify-center -mt-10 md:-mt-0 rounded-t-3xl md:rounded-none shadow-sm no-scrollbar">
                     <button onClick={() => scrollToSection(emergencyRef)} className="shrink-0 px-4 py-1.5 rounded-full bg-red-50 text-red-600 font-bold text-[11px] uppercase tracking-wider border border-red-100 hover:bg-red-100 transition-colors shadow-sm">Emergency</button>
                     <button onClick={() => scrollToSection(commonRef)} className="shrink-0 px-4 py-1.5 rounded-full bg-teal-50 text-teal-600 font-bold text-[11px] uppercase tracking-wider border border-teal-100 hover:bg-teal-100 transition-colors shadow-sm">Common Side Effects</button>
                     <button onClick={() => scrollToSection(otherRef)} className="shrink-0 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-bold text-[11px] uppercase tracking-wider border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm">General Symptoms</button>
                </div>

                {/* Cards Container */}
                <div className="max-w-5xl mx-auto px-4 mt-8 relative z-10">
                    
                    {/* Emergency Section */}
                    {(URGENT_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <div ref={emergencyRef} className="mb-10 scroll-mt-28">
                            <div className="flex items-center mb-4 pb-2">
                                <span className="bg-red-100 text-red-600 p-1.5 rounded-lg mr-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></span>
                                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Emergency Symptoms</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {URGENT_SYMPTOMS.map(s => (
                                    <SymptomCard key={s.id} symptom={s} onClick={startSymptom} variant="emergency" />
                                ))}
                                {URGENT_SYMPTOMS.length === 0 && <p className="text-slate-400 italic text-sm col-span-full text-center py-8">No emergency symptoms match your search.</p>}
                            </div>
                        </div>
                    )}

                    {/* Common Section */}
                    {(COMMON_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <div ref={commonRef} className="mb-10 scroll-mt-28">
                            <div className="flex items-center mb-4 pb-2">
                                <span className="bg-teal-100 text-teal-600 p-1.5 rounded-lg mr-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg></span>
                                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Common Side Effects</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {COMMON_SYMPTOMS.map(s => (
                                    <SymptomCard key={s.id} symptom={s} onClick={startSymptom} variant="common" />
                                ))}
                                {COMMON_SYMPTOMS.length === 0 && <p className="text-slate-400 italic text-sm col-span-full text-center py-8">No common symptoms match your search.</p>}
                            </div>
                        </div>
                    )}

                    {/* Other Section */}
                    {(OTHER_SYMPTOMS.length > 0 || searchQuery === '') && (
                        <div ref={otherRef} className="mb-12 scroll-mt-28">
                            <div className="flex items-center mb-4 pb-2">
                                <span className="bg-indigo-100 text-indigo-600 p-1.5 rounded-lg mr-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg></span>
                                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">General & Other Symptoms</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {OTHER_SYMPTOMS.map(s => (
                                    <SymptomCard key={s.id} symptom={s} onClick={startSymptom} variant="other" />
                                ))}
                                {OTHER_SYMPTOMS.length === 0 && <p className="text-slate-400 italic text-sm col-span-full text-center py-8">No other symptoms match your search.</p>}
                            </div>
                        </div>
                    )}
                    
                    <div className="text-center border-t border-slate-200 pt-10 pb-8">
                        <p className="text-xs text-slate-400 mb-1">OncoLife Triage Protocol v1.2 • 27 Clinical Pathways Loaded</p>
                        <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">OncoLife is Powered by KanasuLabs | 2025</p>
                    </div>
                </div>
            </div>
        ) : (
            /* --- CHAT VIEW --- */
            <div className="p-4 max-w-2xl mx-auto w-full pb-32">
                {/* Progress Bar */}
                <div className="sticky top-0 bg-slate-50 z-10 pt-4 pb-2">
                   <ProgressBar stage={stage} />
                </div>

                {history.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                
                {/* Completion Result Card */}
                {stage === 'complete' && (
                    <div className="animate-fade-in mt-8 mb-8">
                        {highestSeverity === 'call_911' && (
                            <div className="bg-red-50 border border-red-100 rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full blur-3xl opacity-20 -mr-10 -mt-10"></div>
                                <div className="text-6xl mb-4 animate-bounce">🚨</div>
                                <h2 className="text-3xl font-extrabold text-red-700 mb-2 tracking-tight">Emergency Detected</h2>
                                <p className="text-red-800 text-lg font-semibold mb-8">Please call 911 or go to the ER immediately.</p>
                                <div className="bg-white rounded-2xl p-5 border border-red-100 text-left shadow-sm">
                                    <p className="text-[10px] text-red-400 uppercase font-bold mb-3 tracking-widest">Clinical Reasoning:</p>
                                    <ul className="space-y-2 text-red-900 text-sm font-medium">
                                        {triageReasons.map((r, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 text-red-500 font-bold">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'notify_care_team' && (
                            <div className="bg-amber-50 border border-amber-100 rounded-3xl p-8 shadow-xl text-center">
                                <div className="text-6xl mb-4">⚠️</div>
                                <h2 className="text-3xl font-extrabold text-amber-700 mb-2 tracking-tight">Notify Care Team</h2>
                                <p className="text-amber-900 text-lg font-medium mb-8">Contact your oncology provider immediately.</p>
                                <div className="bg-white rounded-2xl p-5 border border-amber-100 text-left shadow-sm">
                                    <p className="text-[10px] text-amber-400 uppercase font-bold mb-3 tracking-widest">Clinical Reasoning:</p>
                                    <ul className="space-y-2 text-amber-900 text-sm font-medium">
                                        {triageReasons.map((r, i) => (
                                             <li key={i} className="flex items-start">
                                                <span className="mr-2 text-amber-500 font-bold">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'refer_provider' && (
                            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-8 shadow-xl text-center">
                                <div className="text-6xl mb-4">ℹ️</div>
                                <h2 className="text-3xl font-extrabold text-blue-700 mb-2 tracking-tight">Contact Provider</h2>
                                <p className="text-blue-900 mb-8 text-lg">Contact your provider during office hours for guidance.</p>
                                <div className="bg-white rounded-2xl p-5 border border-blue-100 text-left shadow-sm">
                                    <p className="text-[10px] text-blue-400 uppercase font-bold mb-3 tracking-widest">Notes:</p>
                                    <ul className="space-y-2 text-blue-900 text-sm font-medium">
                                        {triageReasons.map((r, i) => (
                                            <li key={i} className="flex items-start">
                                                <span className="mr-2 text-blue-500 font-bold">•</span> {r}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {highestSeverity === 'none' && (
                            <div className="bg-green-50 border border-green-100 rounded-3xl p-8 shadow-xl text-center">
                                <div className="text-6xl mb-4">✅</div>
                                <h2 className="text-3xl font-extrabold text-green-700 mb-2 tracking-tight">No Urgent Issues</h2>
                                <p className="text-green-900 mb-4 text-lg">Based on your answers, no immediate action is required.</p>
                                <p className="text-sm text-green-700 font-medium">Monitor your symptoms. If they worsen, start a new check.</p>
                            </div>
                        )}

                        {/* Assessment Summary List */}
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

                        <button 
                            onClick={reset}
                            className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                            Start New Assessment
                        </button>
                        
                        <div className="text-center mt-10 pb-4">
                            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">OncoLife is Powered by KanasuLabs | 2025</p>
                        </div>
                    </div>
                )}
            </div>
        )}
      </div>

      {/* Input Controls (Only shown during chat) */}
      {stage !== 'selection' && stage !== 'complete' && (
        <div className="bg-white/90 backdrop-blur-md border-t border-slate-200 p-4 pb-8 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] shrink-0 z-30 absolute bottom-0 w-full">
            <div className="max-w-2xl mx-auto animate-fade-in">
                {currentQuestion?.type === 'yes_no' && (
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => handleAnswer(false)} className="p-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 text-lg hover:border-slate-300 hover:bg-slate-50 active:scale-95 transition-all">No</button>
                    <button onClick={() => handleAnswer(true)} className="p-4 rounded-2xl bg-teal-600 text-white font-bold text-lg shadow-lg hover:bg-teal-700 active:scale-95 transition-all hover:shadow-teal-500/30">Yes</button>
                </div>
                )}

                {currentQuestion?.type === 'choice' && (
                <div className="grid grid-cols-1 gap-2">
                    {currentQuestion.options?.map(opt => (
                        <button 
                        key={opt.value.toString()} 
                        onClick={() => handleAnswer(opt.value)}
                        className="p-4 rounded-2xl border border-slate-200 text-left font-semibold text-slate-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-800 transition-all shadow-sm active:scale-98"
                        >
                        {opt.label}
                        </button>
                    ))}
                </div>
                )}

                {currentQuestion?.type === 'multiselect' && (
                <div className="space-y-3">
                    {currentQuestion.options?.map(opt => (
                    <button
                        key={opt.value.toString()}
                        onClick={() => toggleMultiSelect(opt.value as string)}
                        className={`w-full p-3.5 rounded-2xl border text-left font-medium transition-all flex justify-between items-center shadow-sm active:scale-[0.99] ${
                        multiSelect.includes(opt.value as string) 
                            ? 'bg-teal-600 border-teal-600 text-white ring-2 ring-teal-300 ring-offset-1' 
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        {opt.label}
                        {multiSelect.includes(opt.value as string) && (
                            <span className="bg-white text-teal-600 rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm">✓</span>
                        )}
                    </button>
                    ))}
                    <button 
                    onClick={handleMultiSelectSubmit}
                    className="w-full p-4 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-all mt-2 active:scale-95 hover:shadow-xl"
                    >
                    Confirm Selection
                    </button>
                </div>
                )}

                {(currentQuestion?.type === 'text' || currentQuestion?.type === 'number') && (
                <div className="flex space-x-3">
                    <input 
                    type={currentQuestion.type === 'number' ? 'number' : 'text'} 
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={currentQuestion.type === 'number' ? "Enter number..." : "Type your answer..."}
                    className="flex-1 p-4 rounded-2xl border border-slate-200 text-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-inner bg-slate-50"
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitText()}
                    autoFocus
                    />
                    <button 
                    onClick={handleSubmitText}
                    className="px-6 bg-teal-600 text-white rounded-2xl font-bold shadow-lg hover:bg-teal-700 active:scale-95 transition-all"
                    >
                    <span className="hidden sm:inline">Send</span>
                    <span className="sm:hidden">➜</span>
                    </button>
                </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);