import { useEffect, useMemo, useState } from 'react';
import { addDays, format, isSameDay } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { CalendarEvent } from '../lib/types';
import { eventOnLocalDay, weekBounds, zonedNow } from '../lib/dates';
import { EventChip } from './EventChip';
import { DayAgenda } from './DayAgenda';
import { isEventHighlighted } from '../lib/filters';

interface Props {
  anchor: Date;
  events: CalendarEvent[];
  highlightTeams: Set<string>;
}

function pickDefaultDay(days: Date[], events: CalendarEvent[]): Date {
  const today = zonedNow();
  const todayInWeek = days.find((d) => isSameDay(d, today));
  if (todayInWeek) return todayInWeek;
  const withEvents = days.find((d) => events.some((e) => eventOnLocalDay(e.start, d)));
  return withEvents ?? days[0];
}

export function WeekView({ anchor, events, highlightTeams }: Props) {
  const weekKey = format(weekBounds(anchor).start, 'yyyy-MM-dd');
  const days = useMemo(() => {
    const { start } = weekBounds(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- weekKey is the stable week identity
  }, [weekKey]);

  const today = zonedNow();
  const [selected, setSelected] = useState(() => pickDefaultDay(days, events));

  useEffect(() => {
    setSelected(pickDefaultDay(days, events));
    // Only reset selection when the week changes — not on every render/filter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  const selectedEvents = events.filter((e) => eventOnLocalDay(e.start, selected));

  return (
    <>
      <div className="week-view week-view--desktop">
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
                  <p className="week-day__empty">—</p>
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

      <div className="week-view-mobile">
        <div className="day-strip" role="tablist" aria-label="Veckodagar">
          {days.map((day) => {
            const count = events.filter((e) => eventOnLocalDay(e.start, day)).length;
            const isToday = isSameDay(day, today);
            const isSelected = isSameDay(day, selected);
            return (
              <button
                key={day.toISOString()}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`day-strip__day ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
                onClick={() => setSelected(day)}
              >
                <span className="day-strip__dow">{format(day, 'EEE', { locale: sv })}</span>
                <span className="day-strip__num">{format(day, 'd')}</span>
                <span className={`day-strip__mark ${count > 0 ? 'has-events' : ''}`} aria-hidden />
              </button>
            );
          })}
        </div>
        <DayAgenda day={selected} events={selectedEvents} highlightTeams={highlightTeams} />
      </div>
    </>
  );
}
