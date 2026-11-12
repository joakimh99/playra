import { describe, expect, it } from 'vitest';
import { normalizeMotoGpDate, normalizeMotoGpEvents } from './motogp';

describe('normalizeMotoGpEvents', () => {
  it('tar endast GP-weekends och racingsessioner för MGP', () => {
    const events = normalizeMotoGpEvents([
      {
        id: 'gp1',
        name: 'TEST',
        kind: 'TEST',
        broadcasts: [
          {
            id: 'b1',
            shortname: 'FP1',
            name: 'Free Practice',
            date_start: '2026-02-27T10:45:00+0700',
            kind: 'PRACTICE',
            category: { acronym: 'MGP' },
          },
        ],
      },
      {
        id: 'gp2',
        name: 'Thailand GP',
        kind: 'GP',
        circuit: { name: 'Chang' },
        broadcasts: [
          {
            id: 'b2',
            shortname: 'FP1',
            name: 'Free Practice Nr. 1',
            date_start: '2026-02-27T10:45:00+0700',
            kind: 'PRACTICE',
            category: { acronym: 'MGP' },
          },
          {
            id: 'b3',
            shortname: 'Q1',
            name: 'Qualifying 1',
            date_start: '2026-02-28T10:50:00+0700',
            kind: 'QUALIFYING',
            category: { acronym: 'MGP' },
          },
          {
            id: 'b4',
            shortname: 'SHOW',
            name: 'Press',
            date_start: '2026-02-28T11:00:00+0700',
            kind: 'PRESS',
            category: { acronym: 'MGP' },
          },
        ],
      },
    ]);
    expect(events).toHaveLength(2);
    expect(events.map((e) => e.title)).toEqual(expect.arrayContaining(['FP1', 'Q1']));
  });
});

describe('normalizeMotoGpDate', () => {
  it('lägger till kolon i tidszon', () => {
    expect(normalizeMotoGpDate('2026-02-27T10:45:00+0700')).toBe('2026-02-27T10:45:00+07:00');
  });
});
