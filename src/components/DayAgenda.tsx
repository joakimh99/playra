import { format, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { CalendarEvent } from '../lib/types';
import { EventChip } from './EventChip';
import { isEventHighlighted } from '../lib/filters';

interface Props {
  day: Date;
  events: CalendarEvent[];
  highlightTeams: Set<string>;
}

export function DayAgenda({ day, events, highlightTeams }: Props) {
  const today = new Date();
  const isToday = isSameDay(day, today);

  return (
    <section className={`day-agenda ${isToday ? 'day-agenda--today' : ''}`}>
      <header className="day-agenda__head">
        <h2 className="day-agenda__title">
          {format(day, 'EEEE d MMMM', { locale: sv })}
        </h2>
        <span className="day-agenda__count">
          {events.length === 0 ? 'Inget' : `${events.length} st`}
        </span>
      </header>
      <div className="day-agenda__list">
        {events.length === 0 ? (
          <p className="day-agenda__empty">Inga händelser den här dagen.</p>
        ) : (
          events.map((ev) => (
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
}
