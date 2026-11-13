import { useEffect, useMemo, useState } from 'react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { sv } from 'date-fns/locale';
import type { CalendarEvent } from '../lib/types';
import { eventOnLocalDay, monthGridDays, zonedNow } from '../lib/dates';
import { EventChip } from './EventChip';
import { DayAgenda } from './DayAgenda';
import { isEventHighlighted } from '../lib/filters';
import { SPORT_THEME } from '../lib/sportTheme';

interface Props {
  anchor: Date;
  events: CalendarEvent[];
  highlightTeams: Set<string>;
}

function pickDefaultDay(anchor: Date, days: Date[], events: CalendarEvent[]): Date {
  const today = zonedNow();
  if (isSameMonth(today, anchor)) return today;
  const withEvents = days.find(
    (d) => isSameMonth(d, anchor) && events.some((e) => eventOnLocalDay(e.start, d)),
  );
  return withEvents ?? startOfPreferred(anchor, days);
}

function startOfPreferred(anchor: Date, days: Date[]): Date {
  return days.find((d) => isSameMonth(d, anchor)) ?? days[0];
}

export function MonthView({ anchor, events, highlightTeams }: Props) {
  const days = useMemo(() => monthGridDays(anchor), [anchor]);
  const today = zonedNow();
  const [selected, setSelected] = useState(() => pickDefaultDay(anchor, days, events));

  useEffect(() => {
    setSelected(pickDefaultDay(anchor, days, events));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally keyed to month
  }, [anchor]);

  const selectedEvents = events.filter((e) => eventOnLocalDay(e.start, selected));

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
          const isSelected = isSameDay(day, selected);
          const sports = [...new Set(dayEvents.map((e) => e.sport))];
          return (
            <button
              key={day.toISOString()}
              type="button"
              className={`month-cell ${inMonth ? '' : 'month-cell--faded'} ${isToday ? 'month-cell--today' : ''} ${isSelected ? 'month-cell--selected' : ''}`}
              onClick={() => setSelected(day)}
              aria-pressed={isSelected}
              aria-label={`${format(day, 'd MMMM', { locale: sv })}${dayEvents.length ? `, ${dayEvents.length} händelser` : ''}`}
            >
              <span className="month-cell__head">
                {format(day, 'd', { locale: sv })}
              </span>
              <span className="month-cell__dots" aria-hidden={dayEvents.length === 0}>
                {sports.slice(0, 3).map((sport) => (
                  <span
                    key={sport}
                    className="month-cell__dot"
                    style={{ background: SPORT_THEME[sport].border }}
                  />
                ))}
              </span>
              <span className="month-cell__events">
                {dayEvents.slice(0, 3).map((ev) => (
                  <EventChip
                    key={ev.id}
                    event={ev}
                    compact
                    highlighted={isEventHighlighted(ev, highlightTeams)}
                  />
                ))}
                {dayEvents.length > 3 && (
                  <span className="tiny muted">+{dayEvents.length - 3}</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
      <div className="month-view__agenda">
        <DayAgenda day={selected} events={selectedEvents} highlightTeams={highlightTeams} />
      </div>
    </div>
  );
}
