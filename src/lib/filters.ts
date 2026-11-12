import type { CalendarEvent, FilterState, Sport } from './types';

export const ALL_SPORTS: Sport[] = ['f1', 'motogp', 'nhl'];

export function createDefaultFilters(): FilterState {
  return {
    sports: new Set(ALL_SPORTS),
    nhlTeams: null,
    highlightTeams: new Set(),
  };
}

export function eventMatchesTeamFilter(event: CalendarEvent, teamAbbrevs: Set<string> | null): boolean {
  if (event.sport !== 'nhl') return true;
  if (teamAbbrevs === null || teamAbbrevs.size === 0) return true;
  const home = event.meta?.homeAbbrev;
  const away = event.meta?.awayAbbrev;
  if (!home || !away) return false;
  return teamAbbrevs.has(home) || teamAbbrevs.has(away);
}

export function eventMatchesSportFilter(event: CalendarEvent, sports: Set<Sport>): boolean {
  if (sports.size === 0) return false;
  return sports.has(event.sport);
}

export function filterEvents(events: CalendarEvent[], filters: FilterState): CalendarEvent[] {
  return events.filter(
    (e) => eventMatchesSportFilter(e, filters.sports) && eventMatchesTeamFilter(e, filters.nhlTeams),
  );
}

export function isEventHighlighted(event: CalendarEvent, highlightTeams: Set<string>): boolean {
  if (event.sport !== 'nhl' || highlightTeams.size === 0) return false;
  const home = event.meta?.homeAbbrev;
  const away = event.meta?.awayAbbrev;
  if (!home || !away) return false;
  return highlightTeams.has(home) || highlightTeams.has(away);
}

export function toggleSport(filters: FilterState, sport: Sport): FilterState {
  const sports = new Set(filters.sports);
  if (sports.has(sport)) sports.delete(sport);
  else sports.add(sport);
  return { ...filters, sports };
}

export function toggleNhlTeam(filters: FilterState, abbrev: string): FilterState {
  const base = filters.nhlTeams ?? new Set<string>();
  const nhlTeams = new Set(base);
  if (nhlTeams.has(abbrev)) nhlTeams.delete(abbrev);
  else nhlTeams.add(abbrev);
  return {
    ...filters,
    nhlTeams: nhlTeams.size === 0 ? null : nhlTeams,
  };
}
