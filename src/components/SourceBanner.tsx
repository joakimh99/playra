import type { SportSourceMeta } from '../lib/types';
import { formatInTimeZone } from 'date-fns-tz';
import { DISPLAY_TZ } from '../lib/dates';
import { sv } from 'date-fns/locale';

interface Props {
  sources: SportSourceMeta[];
  generatedAt: string;
}

export function SourceBanner({ sources, generatedAt }: Props) {
  const updated = formatInTimeZone(generatedAt, DISPLAY_TZ, "d MMM yyyy HH:mm", { locale: sv });
  const notes = sources.flatMap((s) =>
    [...s.limitations, ...(s.note ? [s.note] : [])].map((note) => ({
      sport: s.sport,
      note,
    })),
  );

  return (
    <aside className="source-banner">
      <p className="tiny muted">
        Uppdaterad {updated}
        <br />
        {sources.map((s) => s.source).join(' · ')}
      </p>
      {notes.length > 0 && (
        <details className="source-banner__details">
          <summary>Datakällor &amp; begränsningar</summary>
          <ul className="source-banner__notes">
            {notes.map(({ sport, note }) => (
              <li key={`${sport}-${note}`}>
                <strong>{sport.toUpperCase()}:</strong> {note}
              </li>
            ))}
          </ul>
        </details>
      )}
    </aside>
  );
}
