import type { TeamPreferences } from './types';

const KEY = 'playra.teamPreferences';

export function loadTeamPreferences(): TeamPreferences {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { interesting: [] };
    const parsed = JSON.parse(raw) as TeamPreferences;
    return {
      favorite: parsed.favorite,
      interesting: Array.isArray(parsed.interesting) ? parsed.interesting : [],
    };
  } catch {
    return { interesting: [] };
  }
}

export function saveTeamPreferences(prefs: TeamPreferences): void {
  localStorage.setItem(KEY, JSON.stringify(prefs));
}
