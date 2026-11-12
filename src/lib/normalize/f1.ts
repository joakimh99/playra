import type { CalendarEvent } from '../types';
import { f1SessionLabel } from '../sessionLabels';

export interface OpenF1Session {
  session_key: number;
  session_type: string;
  session_name: string;
  date_start: string;
  date_end?: string;
  meeting_key?: number;
  circuit_short_name?: string;
  country_name?: string;
  location?: string;
  year?: number;
  is_cancelled?: boolean;
}

const MEETING_CACHE = new Map<number, string>();

export function meetingLabel(s: OpenF1Session): string {
  const parts = [s.location, s.country_name].filter(Boolean);
  const circuit = s.circuit_short_name;
  if (circuit && parts.length) return `${circuit} – ${parts.join(', ')}`;
  return circuit ?? parts.join(', ') ?? 'Formel 1';
}

export function normalizeF1Sessions(sessions: OpenF1Session[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const s of sessions) {
    if (s.is_cancelled) continue;
    if (!s.date_start) continue;
    const meeting = meetingLabel(s);
    if (s.meeting_key != null) {
      MEETING_CACHE.set(s.meeting_key, meeting);
    }
    const title = f1SessionLabel(s.session_name, s.session_type);
    events.push({
      id: `f1-${s.session_key}`,
      sport: 'f1',
      title,
      subtitle: meeting,
      start: s.date_start,
      end: s.date_end,
      sessionType: s.session_type,
      meta: {
        meeting,
        circuit: s.circuit_short_name,
        round: undefined,
      },
    });
  }
  return events;
}
