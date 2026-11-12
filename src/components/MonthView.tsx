import { format, isSameDay, isSameMonth } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { CalendarEvent } from '../lib/types';
import { eventOnLocalDay, monthGridDays } from '../lib/dates';
import { EventChip } from './EventChip';
import { isEventHighlighted } from '../lib/filters';

interface Props {
  anchor: Date;
  events: CalendarEvent[];
  highlightTeams: Set<string>;
}

export function MonthView({ anchor, events, highlightTeams }: Props) {
  const days = monthGridDays(anchor);
  const today = new Date();

  return (
    <div className="month-view">
      <div className="month-view__weekdays">
        {['mån', 'tis', 'ons', 'tor', 'fre', 'lör', 'sön'].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="month-view__grid">
        {days.map((day) => {
          const inMonth = isSameMonth(day, anchor);
          const dayEvents = events.filter((e) => eventOnLocalDay(e.start, day));
          const isToday = isSameDay(day, today);
          return (
            <section
              key={day.toISOString()}
              className={`month-cell ${inMonth ? '' : 'month-cell--faded'} ${isToday ? 'month-cell--today' : ''}`}
            >
              <header className="month-cell__head">
                {format(day, 'd', { locale: sv })}
              </header>
              <div className="month-cell__events">
                {dayEvents.slice(0, 4).map((ev) => (
                  <EventChip
                    key={ev.id}
                    event={ev}
                    compact
                    highlighted={isEventHighlighted(ev, highlightTeams)}
                  />
                ))}
                {dayEvents.length > 4 && (
                  <p className="tiny muted">+{dayEvents.length - 4} till</p>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
