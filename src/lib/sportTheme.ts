import type { Sport } from './types';

export const SPORT_THEME: Record<
  Sport,
  { label: string; color: string; bg: string; border: string }
> = {
  f1: {
    label: 'Formel 1',
    color: '#ff5a5a',
    bg: 'rgba(255, 90, 90, 0.08)',
    border: '#e5484d',
  },
  motogp: {
    label: 'MotoGP',
    color: '#ff8b3d',
    bg: 'rgba(255, 139, 61, 0.08)',
    border: '#f76b15',
  },
  nhl: {
    label: 'NHL',
    color: '#6ea8fe',
    bg: 'rgba(110, 168, 254, 0.08)',
    border: '#3b82f6',
  },
};
