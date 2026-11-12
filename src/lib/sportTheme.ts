import type { Sport } from './types';

export const SPORT_THEME: Record<
  Sport,
  { label: string; color: string; bg: string; border: string }
> = {
  f1: { label: 'Formel 1', color: '#e10600', bg: 'rgba(225, 6, 0, 0.12)', border: '#e10600' },
  motogp: { label: 'MotoGP', color: '#ff6a00', bg: 'rgba(255, 106, 0, 0.14)', border: '#ff6a00' },
  nhl: { label: 'NHL', color: '#005eb8', bg: 'rgba(0, 94, 184, 0.12)', border: '#005eb8' },
};
