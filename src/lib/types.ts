export type Sport = 'f1' | 'motogp' | 'nhl';

export interface CalendarEvent {
  id: string;
  sport: Sport;
  /** Visningsnamn på passet/matchen */
  title: string;
  /** Tävling, bana eller matchinfo */
  subtitle: string;
  start: string;
  end?: string;
  sessionType?: string;
  allDay?: boolean;
  meta?: {
    meeting?: string;
    circuit?: string;
    round?: number;
    homeTeam?: string;
    awayTeam?: string;
    homeAbbrev?: string;
    awayAbbrev?: string;
    venue?: string;
  };
}

export interface SportSourceMeta {
  sport: Sport;
  source: string;
  fetchedAt: string;
  limitations: string[];
  sessionCount: number;
  note?: string;
}

export interface NhlTeam {
  abbrev: string;
  name: string;
}

export interface PlayraDataset {
  version: number;
  generatedAt: string;
  timezone: string;
  events: CalendarEvent[];
  nhlTeams: NhlTeam[];
  sources: SportSourceMeta[];
}

export interface TeamPreferences {
  favorite?: string;
  interesting: string[];
}

export type CalendarView = 'week' | 'month';

export interface FilterState {
  sports: Set<Sport>;
  nhlTeams: Set<string> | null;
  highlightTeams: Set<string>;
}
