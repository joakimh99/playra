import { describe, expect, it } from 'vitest';
import {
  filterEvents,
  createDefaultFilters,
  eventMatchesSportFilter,
  eventMatchesTeamFilter,
  isEventHighlighted,
  toggleSport,
} from './filters';
import type { CalendarEvent } from './types';

const f1: CalendarEvent = {
  id: 'f1-1',
  sport: 'f1',
  title: 'Kval',
  subtitle: 'Monza',
  start: '2026-09-01T12:00:00Z',
};

const nhl: CalendarEvent = {
  id: 'nhl-1',
  sport: 'nhl',
  title: 'TOR @ MTL',
  subtitle: 'Toronto – Montreal',
  start: '2026-01-01T00:00:00Z',
  meta: { homeAbbrev: 'MTL', awayAbbrev: 'TOR' },
};

describe('filterEvents', () => {
  it('filtrerar på sport', () => {
    let filters = createDefaultFilters();
    filters = toggleSport(filters, 'nhl');
    filters = toggleSport(filters, 'motogp');
    expect(filterEvents([f1, nhl], filters)).toEqual([f1]);
  });

  it('filtrerar NHL på lag', () => {
    const filters = { ...createDefaultFilters(), nhlTeams: new Set(['TOR']) };
    expect(filterEvents([nhl], filters)).toHaveLength(1);
    expect(
      filterEvents([nhl], { ...filters, nhlTeams: new Set(['VAN']) }),
    ).toHaveLength(0);
  });

  it('eventMatchesTeamFilter släpper igenom icke-NHL', () => {
    expect(eventMatchesTeamFilter(f1, new Set(['X']))).toBe(true);
  });

  it('highlight', () => {
    expect(isEventHighlighted(nhl, new Set(['TOR']))).toBe(true);
    expect(isEventHighlighted(nhl, new Set(['BOS']))).toBe(false);
    expect(isEventHighlighted(f1, new Set(['TOR']))).toBe(false);
  });

  it('sport filter tom = inget', () => {
    expect(eventMatchesSportFilter(f1, new Set())).toBe(false);
  });
});
