import { ALL_SPORTS, toggleNhlTeam, toggleSport } from '../lib/filters';
import { SPORT_THEME } from '../lib/sportTheme';
import type { FilterState, NhlTeam, Sport, TeamPreferences } from '../lib/types';

interface Props {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  teams: NhlTeam[];
  prefs: TeamPreferences;
  onPrefsChange: (p: TeamPreferences) => void;
}

export function FilterBar({ filters, onChange, teams, prefs, onPrefsChange }: Props) {
  const nhlOn = filters.sports.has('nhl');

  return (
    <div className="filter-bar">
      <fieldset className="filter-group">
        <legend>Sporter</legend>
        <div className="chip-row">
          {ALL_SPORTS.map((sport: Sport) => {
            const active = filters.sports.has(sport);
            const theme = SPORT_THEME[sport];
            return (
              <button
                key={sport}
                type="button"
                className={`filter-chip ${active ? 'filter-chip--on' : ''}`}
                aria-pressed={active}
                style={active ? { borderColor: theme.border, color: theme.color } : undefined}
                onClick={() => onChange(toggleSport(filters, sport))}
              >
                {theme.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {nhlOn && (
        <fieldset className="filter-group">
          <legend>NHL – lagfilter</legend>
          <p className="muted tiny">
            Välj lag för att visa endast deras matcher. Favorit och intressanta lag sparas lokalt.
          </p>
          <div className="team-prefs">
            <label>
              Favoritlag
              <select
                value={prefs.favorite ?? ''}
                onChange={(e) =>
                  onPrefsChange({
                    ...prefs,
                    favorite: e.target.value || undefined,
                  })
                }
              >
                <option value="">—</option>
                {teams.map((t) => (
                  <option key={t.abbrev} value={t.abbrev}>
                    {t.name} ({t.abbrev})
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="team-grid">
            {teams.map((t) => {
              const inFilter = filters.nhlTeams?.has(t.abbrev) ?? false;
              const interesting = prefs.interesting.includes(t.abbrev);
              const isFav = prefs.favorite === t.abbrev;
              return (
                <div key={t.abbrev} className="team-grid__item">
                  <button
                    type="button"
                    className={`team-btn ${inFilter ? 'team-btn--filter' : ''} ${interesting ? 'team-btn--interesting' : ''} ${isFav ? 'team-btn--fav' : ''}`}
                    onClick={() => onChange(toggleNhlTeam(filters, t.abbrev))}
                    title="Filtrera matcher"
                  >
                    {t.abbrev}
                  </button>
                  <button
                    type="button"
                    className="team-star"
                    aria-pressed={interesting}
                    title="Markera som intressant"
                    onClick={() => {
                      const set = new Set(prefs.interesting);
                      if (set.has(t.abbrev)) set.delete(t.abbrev);
                      else set.add(t.abbrev);
                      onPrefsChange({ ...prefs, interesting: [...set] });
                    }}
                  >
                    ★
                  </button>
                </div>
              );
            })}
          </div>
          {filters.nhlTeams && filters.nhlTeams.size > 0 && (
            <button type="button" className="link-btn" onClick={() => onChange({ ...filters, nhlTeams: null })}>
              Rensa lagfilter
            </button>
          )}
        </fieldset>
      )}
    </div>
  );
}
