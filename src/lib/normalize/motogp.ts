import type { CalendarEvent } from '../types';
import { motogpSessionLabel } from '../sessionLabels';

const RACING_KINDS = new Set(['PRACTICE', 'QUALIFYING', 'WARM_UP', 'RACE']);

export interface MotoGpBroadcast {
  id: string;
  shortname: string;
  name: string;
  date_start: string;
  date_end?: string;
  kind: string;
  category?: { acronym?: string; name?: string };
}

export interface MotoGpEvent {
  id: string;
  name: string;
  kind?: string;
  circuit?: { name?: string };
  sponsored_name?: string | null;
  broadcasts?: MotoGpBroadcast[];
}

export function motogpMeetingTitle(event: MotoGpEvent): string {
  const circuit = event.circuit?.name;
  const gpName = (event.sponsored_name ?? event.name).trim();
  if (circuit) return `${gpName} (${circuit})`;
  return gpName;
}

export function normalizeMotoGpEvents(raw: MotoGpEvent[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const event of raw) {
    if (event.kind !== 'GP') continue;
    const meeting = motogpMeetingTitle(event);
    for (const b of event.broadcasts ?? []) {
      if (b.category?.acronym !== 'MGP') continue;
      if (!RACING_KINDS.has(b.kind)) continue;
      if (!b.date_start) continue;
      events.push({
        id: `motogp-${event.id}-${b.id}`,
        sport: 'motogp',
        title: motogpSessionLabel(b.shortname, b.name),
        subtitle: meeting,
        start: normalizeMotoGpDate(b.date_start),
        end: b.date_end ? normalizeMotoGpDate(b.date_end) : undefined,
        sessionType: b.kind,
        meta: {
          meeting,
          circuit: event.circuit?.name,
        },
      });
    }
  }
  return events;
}

/** PulseLive använder ibland +0700 utan kolon – gör ISO-kompatibel. */
export function normalizeMotoGpDate(raw: string): string {
  const m = raw.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})([+-]\d{2})(\d{2})$/);
  if (m) {
    return `${m[1]}${m[2]}:${m[3]}`;
  }
  return raw;
}
