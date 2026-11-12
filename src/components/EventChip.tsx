import type { CalendarEvent } from '../lib/types';
import { formatEventTime } from '../lib/dates';
import { SPORT_THEME } from '../lib/sportTheme';

interface Props {
  event: CalendarEvent;
  highlighted?: boolean;
  compact?: boolean;
}

export function EventChip({ event, highlighted, compact }: Props) {
  const theme = SPORT_THEME[event.sport];
  return (
    <article
      className={`event-chip ${highlighted ? 'event-chip--highlight' : ''} ${compact ? 'event-chip--compact' : ''}`}
      style={{ borderLeftColor: theme.border, background: theme.bg }}
      title={`${event.title} – ${event.subtitle}`}
    >
      <span className="event-chip__time">{formatEventTime(event.start)}</span>
      <span className="event-chip__title">{event.title}</span>
      {!compact && <span className="event-chip__subtitle">{event.subtitle}</span>}
      <span className="event-chip__sport" style={{ color: theme.color }}>
        {theme.label}
      </span>
    </article>
  );
}
