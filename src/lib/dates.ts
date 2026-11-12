import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { sv } from 'date-fns/locale';

export const DISPLAY_TZ = 'Europe/Stockholm';

export function zonedNow(): Date {
  return toZonedTime(new Date(), DISPLAY_TZ);
}

export function formatEventTime(iso: string): string {
  return formatInTimeZone(iso, DISPLAY_TZ, 'HH:mm', { locale: sv });
}

export function formatEventDate(iso: string): string {
  return formatInTimeZone(iso, DISPLAY_TZ, 'EEE d MMM', { locale: sv });
}

export function formatRangeLabel(start: Date, end: Date, view: 'week' | 'month'): string {
  if (view === 'month') {
    return format(start, 'MMMM yyyy', { locale: sv });
  }
  const e = endOfWeek(end, { weekStartsOn: 1 });
  const s = startOfWeek(start, { weekStartsOn: 1 });
  if (isSameMonth(s, e)) {
    return `${format(s, 'd', { locale: sv })}–${format(e, 'd MMMM yyyy', { locale: sv })}`;
  }
  return `${format(s, 'd MMM', { locale: sv })} – ${format(e, 'd MMM yyyy', { locale: sv })}`;
}

export function weekBounds(anchor: Date): { start: Date; end: Date } {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  const end = endOfWeek(anchor, { weekStartsOn: 1 });
  return { start, end };
}

export function monthGridDays(anchor: Date): Date[] {
  const monthStart = startOfMonth(anchor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const monthEnd = endOfMonth(anchor);
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  let d = gridStart;
  while (d <= gridEnd) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export function eventOnLocalDay(eventStartIso: string, day: Date): boolean {
  const zoned = toZonedTime(eventStartIso, DISPLAY_TZ);
  return isSameDay(zoned, day);
}

export function eventsInRange(
  eventStartIso: string,
  rangeStart: Date,
  rangeEnd: Date,
): boolean {
  const t = toZonedTime(eventStartIso, DISPLAY_TZ).getTime();
  const s = startOfWeek(rangeStart, { weekStartsOn: 1 }).getTime();
  const e = endOfWeek(rangeEnd, { weekStartsOn: 1 }).getTime();
  return t >= s && t <= e;
}

export function shiftAnchor(anchor: Date, view: 'week' | 'month', dir: -1 | 1): Date {
  return view === 'week' ? addDays(anchor, dir * 7) : addMonths(anchor, dir);
}
