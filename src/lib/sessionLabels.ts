const F1_NAMES: Record<string, string> = {
  'Practice 1': 'Träning 1',
  'Practice 2': 'Träning 2',
  'Practice 3': 'Träning 3',
  Qualifying: 'Kval',
  'Sprint Qualifying': 'Sprintkval',
  Sprint: 'Sprint',
  Race: 'Grand Prix',
  'Day 1': 'Dag 1',
  'Day 2': 'Dag 2',
  'Day 3': 'Dag 3',
};

export function f1SessionLabel(sessionName: string, sessionType?: string): string {
  if (F1_NAMES[sessionName]) return F1_NAMES[sessionName];
  if (sessionName.toLowerCase().includes('qualifying')) return 'Kval';
  if (sessionType === 'Qualifying') return 'Kval';
  if (sessionType === 'Practice') return `Träning (${sessionName})`;
  return sessionName;
}

const MOTO_SHORT: Record<string, string> = {
  FP1: 'FP1',
  FP2: 'FP2',
  FP3: 'FP3',
  FP4: 'FP4',
  PR: 'Practice',
  Q1: 'Q1',
  Q2: 'Q2',
  Q: 'Kval',
  SPR: 'Sprint',
  WUP: 'Warm-up',
  RAC: 'Grand Prix',
};

export function motogpSessionLabel(shortname: string, longName: string): string {
  const key = shortname.toUpperCase();
  if (MOTO_SHORT[key]) return MOTO_SHORT[key];
  if (shortname === 'PR') return 'Practice';
  return longName.replace(/\s+/g, ' ').trim();
}
