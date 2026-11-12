import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeF1Sessions } from '../src/lib/normalize/f1';
import { normalizeMotoGpEvents } from '../src/lib/normalize/motogp';
import { normalizeNhlGames, type NhlScheduleResponse } from '../src/lib/normalize/nhl';
import type { PlayraDataset, SportSourceMeta } from '../src/lib/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '../public/data');
const OUT_FILE = join(OUT_DIR, 'schedule.json');

const NHL_SCHEDULE_BASE = 'https://api-web.nhle.com/v1/schedule';
const OPENF1_SESSIONS = 'https://api.openf1.org/v1/sessions';
const MOTOGP_EVENTS = 'https://api.motogp.pulselive.com/motogp/v1/events';
const MOTOGP_SEASONS = 'https://api.motogp.pulselive.com/motogp/v1/results/seasons';

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    throw new Error(`${url} → HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function fetchOpenF1(years: number[]): Promise<{ events: ReturnType<typeof normalizeF1Sessions>; meta: SportSourceMeta }> {
  const limitations: string[] = [];
  const raw: unknown[] = [];
  for (const year of years) {
    try {
      const chunk = await fetchJson<unknown[]>(`${OPENF1_SESSIONS}?year=${year}`);
      raw.push(...chunk);
    } catch (e) {
      limitations.push(`OpenF1 ${year}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }
  const events = normalizeF1Sessions(raw as Parameters<typeof normalizeF1Sessions>[0]);
  if (events.length === 0) {
    limitations.push('Inga F1-pass kunde hämtas från OpenF1.');
  }
  return {
    events,
    meta: {
      sport: 'f1',
      source: 'OpenF1 (api.openf1.org)',
      fetchedAt: new Date().toISOString(),
      limitations,
      sessionCount: events.length,
    },
  };
}

async function fetchMotoGp(): Promise<{ events: ReturnType<typeof normalizeMotoGpEvents>; meta: SportSourceMeta }> {
  const limitations: string[] = [];
  let seasonYear = new Date().getFullYear();
  try {
    const seasons = await fetchJson<{ year: number; current: boolean }[]>(MOTOGP_SEASONS);
    const current = seasons.find((s) => s.current);
    if (current) seasonYear = current.year;
  } catch {
    limitations.push('Kunde inte läsa aktuell MotoGP-säsong; använder kalenderår.');
  }

  let raw: unknown[] = [];
  try {
    raw = await fetchJson<unknown[]>(`${MOTOGP_EVENTS}?seasonYear=${seasonYear}`);
  } catch (e) {
    limitations.push(`MotoGP ${seasonYear}: ${e instanceof Error ? e.message : String(e)}`);
  }

  const events = normalizeMotoGpEvents(raw as Parameters<typeof normalizeMotoGpEvents>[0]);
  return {
    events,
    meta: {
      sport: 'motogp',
      source: 'MotoGP PulseLive (api.motogp.pulselive.com)',
      fetchedAt: new Date().toISOString(),
      limitations,
      sessionCount: events.length,
      note:
        events.length === 0
          ? 'Inga GP-weekends hittades – kontrollera säsong eller API.'
          : 'Endast MotoGP-klassen (MGP), Grand Prix-weekends (kind=GP). Press/show utelämnas.',
    },
  };
}

async function fetchNhlSeason(): Promise<{ events: ReturnType<typeof normalizeNhlGames>; meta: SportSourceMeta; teams: { abbrev: string; name: string }[] }> {
  const limitations: string[] = [];
  const anchor = new Date().toISOString().slice(0, 10);
  let metaResponse: NhlScheduleResponse;
  try {
    metaResponse = await fetchJson<NhlScheduleResponse>(`${NHL_SCHEDULE_BASE}/${anchor}`);
  } catch (e) {
    throw new Error(`NHL metadata: ${e instanceof Error ? e.message : String(e)}`);
  }

  const start = metaResponse.preSeasonStartDate ?? metaResponse.regularSeasonStartDate;
  const end = metaResponse.playoffEndDate ?? metaResponse.regularSeasonEndDate;
  if (!start || !end) {
    limitations.push('Saknar säsongsdatum från NHL API.');
  }

  const seenGameIds = new Set<number>();
  const allGames: NhlScheduleResponse['gameWeek'][0]['games'] = [];

  let cursor = start;
  let safety = 0;
  while (cursor <= end && safety < 80) {
    safety += 1;
    try {
      const week = await fetchJson<NhlScheduleResponse>(`${NHL_SCHEDULE_BASE}/${cursor}`);
      for (const day of week.gameWeek ?? []) {
        for (const game of day.games ?? []) {
          if (!seenGameIds.has(game.id)) {
            seenGameIds.add(game.id);
            allGames.push(game);
          }
        }
      }
      cursor = addDays(cursor, 7);
      await new Promise((r) => setTimeout(r, 80));
    } catch (e) {
      limitations.push(`Vecka från ${cursor}: ${e instanceof Error ? e.message : String(e)}`);
      cursor = addDays(cursor, 7);
    }
  }

  const events = normalizeNhlGames(allGames);
  const teamMap = new Map<string, string>();
  for (const g of allGames) {
    teamMap.set(g.homeTeam.abbrev, `${g.homeTeam.placeName.default} ${g.homeTeam.commonName.default}`);
    teamMap.set(g.awayTeam.abbrev, `${g.awayTeam.placeName.default} ${g.awayTeam.commonName.default}`);
  }
  const teams = [...teamMap.entries()]
    .map(([abbrev, name]) => ({ abbrev, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  return {
    events,
    teams,
    meta: {
      sport: 'nhl',
      source: 'NHL Official Web API (api-web.nhle.com)',
      fetchedAt: new Date().toISOString(),
      limitations,
      sessionCount: events.length,
      note: 'Hämtar säsongen vecka för vecka; playoff-schema kan kompletteras närmare slutspel.',
    },
  };
}

async function main(): Promise<void> {
  const year = new Date().getFullYear();
  const f1Years = [year, year + 1];

  const [f1, motogp, nhl] = await Promise.all([
    fetchOpenF1(f1Years),
    fetchMotoGp(),
    fetchNhlSeason(),
  ]);

  const dataset: PlayraDataset = {
    version: 1,
    generatedAt: new Date().toISOString(),
    timezone: 'Europe/Stockholm',
    events: [...f1.events, ...motogp.events, ...nhl.events].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
    ),
    nhlTeams: nhl.teams,
    sources: [f1.meta, motogp.meta, nhl.meta],
  };

  await mkdir(OUT_DIR, { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(dataset, null, 2), 'utf8');
  console.log(
    `Sparade ${dataset.events.length} händelser (${f1.events.length} F1, ${motogp.events.length} MotoGP, ${nhl.events.length} NHL) → ${OUT_FILE}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
