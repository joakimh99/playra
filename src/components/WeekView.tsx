import { addDays, format, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { CalendarEvent } from '../lib/types';
import { eventOnLocalDay, weekBounds } from '../lib/dates';
import { EventChip } from './EventChip';
import { isEventHighlighted } from '../lib/filters';

interface Props {
  anchor: Date;
  events: CalendarEvent[];
  highlightTeams: Set<string>;
}

export function WeekView({ anchor, events, highlightTeams }: Props) {
  const { start } = weekBounds(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const today = new Date();

  return (
    <div className="week-view">
      {days.map((day) => {
        const dayEvents = events.filter((e) => eventOnLocalDay(e.start, day));
        const isToday = isSameDay(day, today);
        return (
          <section key={day.toISOString()} className={`week-day ${isToday ? 'week-day--today' : ''}`}>
            <header className="week-day__head">
              <span className="week-day__dow">{format(day, 'EEE', { locale: sv })}</span>
              <span className="week-day__num">{format(day, 'd MMM', { locale: sv })}</span>
            </header>
            <div className="week-day__events">
              {dayEvents.length === 0 ? (
                <p className="muted tiny">Inget</p>
              ) : (
                dayEvents.map((ev) => (
                  <EventChip
                    key={ev.id}
                    event={ev}
                    highlighted={isEventHighlighted(ev, highlightTeams)}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
