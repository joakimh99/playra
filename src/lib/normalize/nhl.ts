import type { CalendarEvent } from '../types';

export interface NhlTeamRef {
  abbrev: string;
  commonName: { default: string };
  placeName: { default: string };
}

export interface NhlGame {
  id: number;
  gameType: number;
  startTimeUTC: string;
  venue?: { default?: string };
  homeTeam: NhlTeamRef;
  awayTeam: NhlTeamRef;
}

export interface NhlScheduleDay {
  date: string;
  games: NhlGame[];
}

export interface NhlScheduleResponse {
  preSeasonStartDate?: string;
  regularSeasonStartDate?: string;
  regularSeasonEndDate?: string;
  playoffEndDate?: string;
  gameWeek: NhlScheduleDay[];
}

export function nhlGameTitle(game: NhlGame): string {
  return `${game.awayTeam.abbrev} @ ${game.homeTeam.abbrev}`;
}

export function nhlGameSubtitle(game: NhlGame): string {
  const away = `${game.awayTeam.placeName.default} ${game.awayTeam.commonName.default}`;
  const home = `${game.homeTeam.placeName.default} ${game.homeTeam.commonName.default}`;
  return `${away} – ${home}`;
}

export function normalizeNhlGames(games: NhlGame[]): CalendarEvent[] {
  return games
    .filter((g) => g.startTimeUTC)
    .map((g) => ({
      id: `nhl-${g.id}`,
      sport: 'nhl' as const,
      title: nhlGameTitle(g),
      subtitle: nhlGameSubtitle(g),
      start: g.startTimeUTC,
      sessionType: gameTypeLabel(g.gameType),
      meta: {
        homeTeam: `${g.homeTeam.placeName.default} ${g.homeTeam.commonName.default}`,
        awayTeam: `${g.awayTeam.placeName.default} ${g.awayTeam.commonName.default}`,
        homeAbbrev: g.homeTeam.abbrev,
        awayAbbrev: g.awayTeam.abbrev,
        venue: g.venue?.default,
      },
    }));
}

function gameTypeLabel(gameType: number): string {
  switch (gameType) {
    case 1:
      return 'försäsong';
    case 2:
      return 'grundserie';
    case 3:
      return 'slutspel';
    default:
      return 'match';
  }
}
