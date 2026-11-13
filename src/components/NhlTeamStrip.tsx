import { toggleNhlTeam } from '../lib/filters';
import type { FilterState, NhlTeam, TeamPreferences } from '../lib/types';

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  teams: NhlTeam[];
  prefs: TeamPreferences;
  onPrefsChange: (p: TeamPreferences) => void;
}

export function NhlTeamStrip({ filters, onChange, teams, prefs, onPrefsChange }: Props) {
  const activeCount = filters.nhlTeams?.size ?? 0;

  return (
    <div className="nhl-strip">
      <div className="nhl-strip__top">
        <label className="nhl-strip__fav">
          <span className="nhl-strip__fav-label">Favorit</span>
          <select
            value={prefs.favorite ?? ''}
            onChange={(e) =>
              onPrefsChange({
                ...prefs,
                favorite: e.target.value || undefined,
              })
            }
          >
            <option value="">Alla lag</option>
            {teams.map((t) => (
              <option key={t.abbrev} value={t.abbrev}>
                {t.abbrev} · {t.name}
              </option>
            ))}
          </select>
        </label>
        {activeCount > 0 && (
          <button
            type="button"
            className="nhl-strip__clear"
            onClick={() => onChange({ ...filters, nhlTeams: null })}
          >
            Rensa ({activeCount})
          </button>
        )}
      </div>
      <div className="nhl-strip__scroll" role="group" aria-label="Filtrera NHL-lag">
        {teams.map((t) => {
          const inFilter = filters.nhlTeams?.has(t.abbrev) ?? false;
          const interesting = prefs.interesting.includes(t.abbrev);
          const isFav = prefs.favorite === t.abbrev;
          return (
            <button
              key={t.abbrev}
              type="button"
              className={`nhl-chip ${inFilter ? 'nhl-chip--on' : ''} ${isFav ? 'nhl-chip--fav' : ''} ${interesting ? 'nhl-chip--star' : ''}`}
              aria-pressed={inFilter}
              onClick={() => onChange(toggleNhlTeam(filters, t.abbrev))}
              title={t.name}
            >
              {(isFav || interesting) && <span className="nhl-chip__star" aria-hidden>★</span>}
              {t.abbrev}
            </button>
          );
        })}
      </div>
    </div>
  );
}
