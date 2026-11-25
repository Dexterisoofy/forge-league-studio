import { describe, expect, it } from 'vitest';
import {
  createCustomAdvantageRule,
  PRESET_ADVANTAGE_RULES,
} from '../engine/simulation/advantageEngine';
import {
  advanceCupWinner,
  createCup,
  createGroupKnockout,
  seedGroupKnockoutPlayoffs,
  simulateCupScore,
} from '../engine/simulation/cupEngine';
import {
  applyLeagueMatchResult,
  computeStandings,
  createLeague,
  simulateLeagueScore,
} from '../engine/simulation/leagueEngine';
import {
  pushCompetitionSnapshot,
  restoreSnapshotById,
  undoLastSimulation,
} from '../engine/simulation/historyEngine';
import { DEFAULT_PRESEASON_CONFIG } from '../engine/simulation/preseasonEngine';
import {
  buildDefaultRulesForSport,
  DEFAULT_COMPETITION_BRANDING,
  DEFAULT_COMPETITION_RULES,
  DEFAULT_SCHEDULE_CONFIG,
} from '../engine/simulation/scheduler';
import { getBackendConfig } from '../lib/auth-db/envConfig';
import {
  DEFAULT_OWNER_PERMISSIONS,
  NO_PERMISSIONS,
  resolveUserPermissions,
  ROLE_PRESETS,
} from '../lib/auth-db/permissions';
import {
  generateRandomSlug,
  isSlugAvailable,
  parseShareHashRoute,
  sanitizeVanitySlug,
} from '../lib/auth-db/sharing';
import {
  createCompetitionConstraints,
  generateTeamFromSeed,
  generateUniqueTeam,
} from '../engine/generator/teamGenerator';
import { generateRandomSeedCode } from '../engine/prng';
import { createEmptyRegistry, registerTeam } from '../engine/registry/globalRegistry';
import { BUILT_IN_SPORTS } from '../engine/sports/builtInSports';
import { buildJerseySvgString } from '../engine/sports/jerseySvg';
import { getSportById } from '../engine/sports/sportRegistry';
import { parseImportedJson } from '../engine/storage/persistence';
import { ICON_CATEGORIES, ICONS } from '../engine/svg-logo/icons';
import { computeLogoDna } from '../engine/svg-logo/logoDna';
import {
  getContrastColor,
  getPrimaryColorSchemeKey,
  LOGO_PALETTES,
} from '../engine/svg-logo/palettes';
import { PATTERNS } from '../engine/svg-logo/patterns';
import { buildLogoSvgString } from '../engine/svg-logo/renderLogoSvg';
import { SHIELDS } from '../engine/svg-logo/shields';
import type {
  AdvantageRule,
  CompetitionRules,
  PreseasonConfig,
  ScheduleConfig,
  SportDefinition,
  UserProfile,
} from '../types';

function makeUniqueTeams(count: number, sport: SportDefinition = BUILT_IN_SPORTS[0]) {
  let reg = createEmptyRegistry();
  const constraints = createCompetitionConstraints([]);
  const teams = [];
  for (let i = 0; i < count; i++) {
    const res = generateUniqueTeam(reg, { constraints, source: 'league', sport });
    reg = res.registry;
    teams.push(res.team);
  }
  return { teams, reg };
}

describe('Massively Expanded Procedural SVG Logo Engine', () => {
  it('provides at least 30 shields, 20 patterns, 130 icons across 5 categories, and 64 palettes', () => {
    expect(SHIELDS.length).toBeGreaterThanOrEqual(30);
    expect(PATTERNS.length).toBeGreaterThanOrEqual(20);
    expect(ICONS.length).toBeGreaterThanOrEqual(130);
    expect(ICON_CATEGORIES.length).toBe(5);
    expect(LOGO_PALETTES.length).toBeGreaterThanOrEqual(64);
  });

  it('renders every shield, pattern, and icon cleanly into valid SVG markup', () => {
    const base = generateTeamFromSeed('K9X4M2P8Q1').logo;
    for (const shield of SHIELDS) {
      const svg = buildLogoSvgString({ ...base, shieldId: shield.id }, `sh-${shield.id}`);
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    }
    for (const pattern of PATTERNS) {
      const svg = buildLogoSvgString({ ...base, patternId: pattern.id }, `pt-${pattern.id}`);
      expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    }
    for (const icon of ICONS) {
      const svg = buildLogoSvgString({ ...base, iconId: icon.id }, `ic-${icon.id}`);
      expect(svg).toContain('</svg>');
    }
    expect(getContrastColor('#0f172a')).toBe('#ffffff');
    expect(getContrastColor('#f8fafc')).toBe('#0f172a');
  });

  it('computes deterministic Logo DNA fingerprints', () => {
    const team = generateTeamFromSeed('ABC123XYZ9');
    expect(team.logo.dna).toBe(computeLogoDna(team.logo));
  });
});

describe('Compact 10-Character Base36 Seed System & Zero-Duplicate Registry', () => {
  it('generates strictly <= 10-character uppercase Base36 seeds', () => {
    for (let i = 0; i < 40; i++) {
      const seed = generateRandomSeedCode();
      expect(seed.length).toBeLessThanOrEqual(10);
      expect(seed).toMatch(/^[0-9A-Z]{1,10}$/);
    }
  });

  it('reproduces identical teams deterministically from any 10-char seed', () => {
    const a = generateTeamFromSeed('K9X4M2P8Q1');
    const b = generateTeamFromSeed('K9X4M2P8Q1');
    expect(a.seedCode).toBe('K9X4M2P8Q1');
    expect(a.name).toBe(b.name);
    expect(a.logo.dna).toBe(b.logo.dna);
    expect(a.roster.map((p) => p.jerseyNumber)).toEqual(b.roster.map((p) => p.jerseyNumber));
  });

  it('triggers collision re-roll and keeps seeds <= 10 chars', () => {
    const existing = generateTeamFromSeed('COLLIDE99');
    let reg = createEmptyRegistry();
    reg = registerTeam(reg, existing, 'studio');

    const res = generateUniqueTeam(reg, {
      seedPrefix: 'COLLIDE99',
      source: 'studio',
    });

    expect(res.collisionsAvoided).toBeGreaterThanOrEqual(1);
    expect(res.team.seedCode.length).toBeLessThanOrEqual(10);
    expect(res.team.name).not.toBe(existing.name);
  });

  it('maintains 0 duplicate icons, cities, primary color schemes, and DNAs in a 64-team competition', () => {
    const { teams } = makeUniqueTeams(64);
    expect(teams.length).toBe(64);
    expect(new Set(teams.map((t) => t.logo.iconId)).size).toBe(64);
    expect(new Set(teams.map((t) => t.city.toLowerCase())).size).toBe(64);
    expect(new Set(teams.map((t) => getPrimaryColorSchemeKey(t.logo))).size).toBe(64);
    expect(new Set(teams.map((t) => t.logo.dna)).size).toBe(64);
  });
});

describe('Multi-Sport Engine & Custom Sport Creator', () => {
  it('provides 8 distinct built-in sports with sport-specific rosters and jersey SVGs', () => {
    expect(BUILT_IN_SPORTS.length).toBeGreaterThanOrEqual(8);

    for (const sport of BUILT_IN_SPORTS) {
      const team = generateTeamFromSeed(`SP${sport.id.slice(0, 6).toUpperCase()}`, {
        sport,
      });
      expect(team.sportId).toBe(sport.id);
      expect(team.roster.length).toBeGreaterThanOrEqual(sport.rosterSize.min);
      expect(team.roster.length).toBeLessThanOrEqual(sport.rosterSize.max);
      const validCodes = new Set(sport.positions.map((p) => p.code));
      expect(team.roster.every((p) => validCodes.has(p.position))).toBe(true);

      const jersey = buildJerseySvgString(
        sport.jerseySilhouette,
        team.logo.primary,
        team.logo.secondary,
        team.logo.trim
      );
      expect(jersey).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    }
  });

  it('supports custom sports end-to-end with JSON import/export and custom scoring plays', () => {
    const customSport: SportDefinition = {
      ...BUILT_IN_SPORTS[1],
      id: 'custom-blitzball',
      name: 'Blitzball Pro',
      isBuiltIn: false,
      scoringEvents: [
        { id: 'orb', name: 'Orb Goal', points: 3, weight: 70 },
        { id: 'mega', name: 'Mega Strike', points: 7, weight: 30 },
      ],
      expectedScoringEventsPerTeam: 6,
    };

    const parsed = parseImportedJson(JSON.stringify(customSport));
    expect(parsed.customSports.length).toBe(1);
    expect(parsed.customSports[0].name).toBe('Blitzball Pro');

    const resolved = getSportById('custom-blitzball', parsed.customSports);
    expect(resolved.name).toBe('Blitzball Pro');

    const { teams } = makeUniqueTeams(4, resolved);
    const sim = simulateLeagueScore(teams[0], teams[1], true, resolved);
    expect(sim.homeScore).toBeGreaterThanOrEqual(0);
    expect(sim.scoringSummary.length).toBe(2);
  });
});

describe('Preseason Isolation & Conditional If/Then Advantage Rules', () => {
  it('tracks preseason separately and triggers preseason carryover + margin bonus advantages', () => {
    const basketball = getSportById('basketball');
    const { teams } = makeUniqueTeams(4, basketball);
    const preseason: PreseasonConfig = {
      ...DEFAULT_PRESEASON_CONFIG,
      enabled: true,
      gamesPerTeam: 2,
      carryOverStats: false,
    };

    const rules: AdvantageRule[] = [
      { ...PRESET_ADVANTAGE_RULES[0], enabled: true, threshold: 2, rewardValue: 3 }, // 2+ preseason wins -> +3 pts
      createCustomAdvantageRule({
        name: 'Blowout Bonus',
        enabled: true,
        trigger: 'margin-of-victory',
        threshold: 10,
        reward: 'bonus-standings-points',
        rewardValue: 2,
      }),
    ];

    let league = createLeague(
      'Hoops Preseason Test',
      teams,
      'single-rr',
      buildDefaultRulesForSport(basketball),
      DEFAULT_SCHEDULE_CONFIG,
      DEFAULT_COMPETITION_BRANDING,
      basketball.id,
      preseason,
      rules
    );

    const preMatches = league.matches.filter((m) => m.bracket === 'preseason');
    expect(preMatches.length).toBe(4);

    // Give teams[0] 2 preseason wins (100-80 each)
    for (const pm of preMatches) {
      const t0Home = pm.homeTeamId === teams[0].id;
      const t0Away = pm.awayTeamId === teams[0].id;
      const hs = t0Home ? 100 : t0Away ? 80 : 90;
      const as = t0Away ? 100 : t0Home ? 80 : 85;
      league = applyLeagueMatchResult(league, pm.id, hs, as, basketball);
    }

    // Preseason carryover should have triggered for teams[0]
    expect(league.preseasonProcessed).toBe(true);
    expect(league.appliedAdvantages.some((a) => a.teamId === teams[0].id)).toBe(true);

    // Regular season stats must remain empty since carryOverStats=false
    expect(Object.keys(league.regularPlayerStats ?? {}).length).toBe(0);
    expect(Object.keys(league.preseasonPlayerStats ?? {}).length).toBeGreaterThan(0);

    // Regular season standings before any regular games: teams[0] starts with 3 bonus points
    const regBefore = computeStandings(
      league.teams,
      league.matches,
      league.rules,
      league.appliedAdvantages,
      'regular',
      league.advantageRules
    );
    const t0Row = regBefore.find((r) => r.teamId === teams[0].id)!;
    expect(t0Row.played).toBe(0);
    expect(t0Row.bonusPoints).toBe(3);
    expect(t0Row.points).toBe(3);

    // Play a regular season match with 15-pt margin to trigger Blowout Bonus (+2 pts)
    const firstReg = league.matches.find((m) => m.bracket !== 'preseason')!;
    league = applyLeagueMatchResult(league, firstReg.id, 110, 95, basketball);
    const regAfter = computeStandings(
      league.teams,
      league.matches,
      league.rules,
      league.appliedAdvantages,
      'regular',
      league.advantageRules
    );
    const winnerRow = regAfter.find((r) => r.teamId === firstReg.homeTeamId)!;
    expect(winnerRow.bonusPoints).toBeGreaterThanOrEqual(2);
  });
});

describe('Deep Competition Scheduling, Tiebreakers & Brackets', () => {
  it('supports odd team count (7 teams) Single Round-Robin with weekday calendar', () => {
    const { teams } = makeUniqueTeams(7);
    const schedule: ScheduleConfig = {
      startDate: '2026-08-01',
      endDateMode: 'auto',
      endDate: '2026-08-01',
      allowedDays: [6],
      pacingMode: 'min-rest-days',
      gamesPerWeek: 1,
      minRestDays: 6,
    };
    let league = createLeague(
      'Lucky 7 League',
      teams,
      'single-rr',
      DEFAULT_COMPETITION_RULES,
      schedule,
      DEFAULT_COMPETITION_BRANDING
    );

    expect(league.matches.length).toBe(21);
    for (const m of league.matches) {
      const day = new Date(`${m.scheduledDate}T00:00:00Z`).getUTCDay();
      expect(day).toBe(6);
      league = applyLeagueMatchResult(league, m.id, 1, 0);
    }
    expect(league.championId).not.toBeNull();
  });

  it('respects custom points and head-to-head tiebreaker priority', () => {
    const { teams } = makeUniqueTeams(3);
    const rules: CompetitionRules = {
      ...DEFAULT_COMPETITION_RULES,
      pointsWin: 2,
      pointsDraw: 1,
      pointsLoss: 0,
      tiebreakers: ['head-to-head', 'goal-diff', 'goals-for'],
    };
    let league = createLeague(
      'Custom Rules League',
      teams,
      'single-rr',
      rules,
      DEFAULT_SCHEDULE_CONFIG,
      DEFAULT_COMPETITION_BRANDING
    );

    const [t0, t1, t2] = teams;
    for (const m of league.matches) {
      const pair = [m.homeTeamId, m.awayTeamId];
      if (pair.includes(t0.id) && pair.includes(t1.id)) {
        league = applyLeagueMatchResult(
          league,
          m.id,
          m.homeTeamId === t0.id ? 1 : 0,
          m.awayTeamId === t0.id ? 1 : 0
        );
      } else if (pair.includes(t0.id) && pair.includes(t2.id)) {
        league = applyLeagueMatchResult(
          league,
          m.id,
          m.homeTeamId === t2.id ? 1 : 0,
          m.awayTeamId === t2.id ? 1 : 0
        );
      } else {
        league = applyLeagueMatchResult(
          league,
          m.id,
          m.homeTeamId === t1.id ? 5 : 0,
          m.awayTeamId === t1.id ? 5 : 0
        );
      }
    }

    const standings = computeStandings(league.teams, league.matches, rules);
    expect(standings.findIndex((s) => s.teamId === t0.id)).toBeLessThan(
      standings.findIndex((s) => s.teamId === t1.id)
    );
  });

  it('progresses an odd 11-team Single-Elimination Cup and 6-team Double-Elimination Cup to Champions', () => {
    const { teams: t11 } = makeUniqueTeams(11);
    let cup11 = createCup('11-Club Cup', t11, 'single-elim');
    const map11 = new Map(cup11.teams.map((t) => [t.id, t]));
    for (let pass = 0; pass < 20; pass++) {
      const playable = cup11.matches.filter((m) => !m.played && m.homeTeamId && m.awayTeamId);
      if (playable.length === 0) break;
      playable.sort((a, b) => a.round - b.round);
      const m = playable[0];
      const sim = simulateCupScore(map11.get(m.homeTeamId!)!, map11.get(m.awayTeamId!)!, cup11.rules);
      cup11 = advanceCupWinner(cup11, m.id, sim.homeScore, sim.awayScore, sim.penaltyWinnerId, sim.resolutionNote);
    }
    expect(cup11.championId).not.toBeNull();

    const { teams: t6 } = makeUniqueTeams(6);
    let cup6 = createCup('6-Team Double Elim', t6, 'double-elim');
    const map6 = new Map(cup6.teams.map((t) => [t.id, t]));
    for (let pass = 0; pass < 30; pass++) {
      const playable = cup6.matches.filter((m) => !m.played && m.homeTeamId && m.awayTeamId);
      if (playable.length === 0) break;
      playable.sort((a, b) => a.round - b.round);
      const m = playable[0];
      const sim = simulateCupScore(map6.get(m.homeTeamId!)!, map6.get(m.awayTeamId!)!, cup6.rules);
      cup6 = advanceCupWinner(cup6, m.id, sim.homeScore, sim.awayScore, sim.penaltyWinnerId, sim.resolutionNote);
    }
    expect(cup6.championId).not.toBeNull();
  });

  it('progresses a 12-team Group Stage + Knockout Cup to a champion', () => {
    const { teams } = makeUniqueTeams(12);
    let comp = createGroupKnockout('Continental 12', teams, 3);
    const teamMap = new Map(comp.teams.map((t) => [t.id, t]));
    for (const m of comp.matches.filter((gm) => gm.bracket === 'group')) {
      comp = applyLeagueMatchResult(comp, m.id, 2, 1);
    }
    comp = seedGroupKnockoutPlayoffs(comp);
    for (let pass = 0; pass < 20; pass++) {
      const playable = comp.matches.filter(
        (m) => m.bracket === 'knockout' && !m.played && m.homeTeamId && m.awayTeamId
      );
      if (playable.length === 0) break;
      playable.sort((a, b) => a.round - b.round);
      const m = playable[0];
      const sim = simulateCupScore(teamMap.get(m.homeTeamId!)!, teamMap.get(m.awayTeamId!)!, comp.rules);
      comp = advanceCupWinner(comp, m.id, sim.homeScore, sim.awayScore, sim.penaltyWinnerId, sim.resolutionNote);
    }
    expect(comp.championId).not.toBeNull();
  });

  it('enforces explicit custom break weeks for specific teams and auto-staggered sport breaks', () => {
    const { teams } = makeUniqueTeams(6);
    // Explicit breaks: Team 0 rests on Matchday 2 & 4; Team 1 rests on Matchday 3
    const explicitSchedule: ScheduleConfig = {
      ...DEFAULT_SCHEDULE_CONFIG,
      breakWeeks: {
        enabled: true,
        breaksPerTeam: 0,
        windowStartRound: 2,
        windowEndRound: 6,
        teamBreaks: {
          [teams[0].id]: [2, 4],
          'slot-1': [3],
        },
      },
    };

    const league = createLeague(
      'Break Weeks League',
      teams,
      'single-rr',
      DEFAULT_COMPETITION_RULES,
      explicitSchedule,
      DEFAULT_COMPETITION_BRANDING
    );

    // Total pairings preserved: 6*5/2 = 15 matches
    expect(league.matches.length).toBe(15);
    const pairs = new Set(
      league.matches.map((m) => [m.homeTeamId, m.awayTeamId].sort().join(':'))
    );
    expect(pairs.size).toBe(15);

    // Team 0 must NOT play in round 2 or 4
    const t0In2Or4 = league.matches.some(
      (m) =>
        (m.round === 2 || m.round === 4) &&
        (m.homeTeamId === teams[0].id || m.awayTeamId === teams[0].id)
    );
    expect(t0In2Or4).toBe(false);

    // Team 1 must NOT play in round 3
    const t1In3 = league.matches.some(
      (m) =>
        m.round === 3 &&
        (m.homeTeamId === teams[1].id || m.awayTeamId === teams[1].id)
    );
    expect(t1In3).toBe(false);

    // No team plays twice in the same round
    const roundMap = new Map<number, Set<string>>();
    for (const m of league.matches) {
      if (!roundMap.has(m.round)) roundMap.set(m.round, new Set());
      const seen = roundMap.get(m.round)!;
      expect(seen.has(m.homeTeamId!)).toBe(false);
      expect(seen.has(m.awayTeamId!)).toBe(false);
      seen.add(m.homeTeamId!);
      seen.add(m.awayTeamId!);
    }

    expect(league.resolvedBreakWeeks?.[2]).toContain(teams[0].id);
    expect(league.resolvedBreakWeeks?.[4]).toContain(teams[0].id);
    expect(league.resolvedBreakWeeks?.[3]).toContain(teams[1].id);

    // Auto-staggered break weeks from a Custom Sport's defaultBreakWeeks
    const customSport: SportDefinition = {
      ...BUILT_IN_SPORTS[0],
      id: 'custom-break-sport',
      name: 'BreakBall',
      isBuiltIn: false,
      defaultBreakWeeks: {
        enabled: true,
        breaksPerTeam: 1,
        windowStartRound: 2,
        windowEndRound: 6,
        teamBreaks: {},
      },
    };
    const autoLeague = createLeague(
      'Auto Break League',
      teams,
      'single-rr',
      buildDefaultRulesForSport(customSport),
      { ...DEFAULT_SCHEDULE_CONFIG, breakWeeks: customSport.defaultBreakWeeks },
      DEFAULT_COMPETITION_BRANDING,
      customSport.id
    );
    expect(autoLeague.matches.length).toBe(15);
    const allRestingTeams = Object.values(autoLeague.resolvedBreakWeeks ?? {}).flat();
    for (const t of teams) {
      expect(allRestingTeams).toContain(t.id);
    }
  });
});

describe('Simulation History, Granular Permissions, Sharing & Env Config', () => {
  it('pushes deep snapshots with a 20-state cap and restores/undoes cleanly', () => {
    const { teams } = makeUniqueTeams(4);
    let comp = createLeague(
      'Undo Test League',
      teams,
      'single-rr',
      DEFAULT_COMPETITION_RULES,
      DEFAULT_SCHEDULE_CONFIG,
      DEFAULT_COMPETITION_BRANDING
    );

    // Push 22 snapshots sequentially while simulating first match only on snapshot 1
    comp = pushCompetitionSnapshot(comp, 'Before match 1');
    const firstMatchId = comp.matches[0].id;
    comp = applyLeagueMatchResult(comp, firstMatchId, 3, 1);
    expect(comp.matches[0].played).toBe(true);

    // Push 21 more snapshots -> history length must stay capped at 20
    for (let i = 2; i <= 22; i++) {
      comp = pushCompetitionSnapshot(comp, `Checkpoint ${i}`);
    }
    expect(comp.history?.length).toBe(20);
    expect(comp.history?.[0].label).toBe('Checkpoint 3');

    // Undo restores latest checkpoint and shrinks history by 1
    const undone = undoLastSimulation(comp);
    expect(undone.history?.length).toBe(19);

    // Restore by explicit checkpoint id drops later checkpoints
    const targetSnap = undone.history![4];
    const restored = restoreSnapshotById(undone, targetSnap.id);
    expect(restored.history?.length).toBe(4);

    // Verify a single-match undo reverts played state
    let singleComp = createLeague(
      'Single Undo League',
      teams,
      'single-rr',
      DEFAULT_COMPETITION_RULES,
      DEFAULT_SCHEDULE_CONFIG,
      DEFAULT_COMPETITION_BRANDING
    );
    singleComp = pushCompetitionSnapshot(singleComp, 'Pre-Sim');
    singleComp = applyLeagueMatchResult(singleComp, singleComp.matches[0].id, 2, 0);
    expect(singleComp.matches[0].played).toBe(true);
    const reverted = undoLastSimulation(singleComp);
    expect(reverted.matches[0].played).toBe(false);
    expect(reverted.matches[0].homeScore).toBeNull();
  });

  it('resolves granular collaborator permissions by owner, identifier, preset, and visibility', () => {
    const ownerUser: UserProfile = {
      id: 'user-owner-1',
      displayName: 'Commissioner',
      email: 'commish@example.com',
      username: 'commish',
      linkedProviders: ['email'],
      isGuest: false,
      createdAt: '2026-01-01T00:00:00Z',
    };
    const simOperatorUser: UserProfile = {
      id: 'user-sim-2',
      displayName: 'Sim Operator',
      email: 'sim@example.com',
      phone: '+15551234567',
      username: 'simop',
      linkedProviders: ['phone'],
      isGuest: false,
      createdAt: '2026-01-01T00:00:00Z',
    };
    const strangerUser: UserProfile = {
      id: 'user-stranger-3',
      displayName: 'Stranger',
      email: 'stranger@example.com',
      linkedProviders: ['google'],
      isGuest: false,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const ownedResource = {
      ownerId: ownerUser.id,
      sharing: {
        slug: 'friday-night-premier',
        isCustomSlug: true,
        visibility: 'private' as const,
        collaborators: [
          {
            id: 'collab-1',
            identifier: '+1 555 123 4567',
            identifierType: 'phone' as const,
            status: 'active' as const,
            rolePreset: 'custom' as const,
            permissions: {
              ...ROLE_PRESETS['sim-operator'],
              canEditScheduleAndDates: true,
            },
            invitedAt: '2026-01-02T00:00:00Z',
          },
        ],
      },
    };

    expect(resolveUserPermissions(ownedResource, ownerUser)).toEqual(DEFAULT_OWNER_PERMISSIONS);

    const collabPerms = resolveUserPermissions(ownedResource, simOperatorUser);
    expect(collabPerms.canSimulateMatches).toBe(true);
    expect(collabPerms.canUndoSimulations).toBe(true);
    expect(collabPerms.canEditScheduleAndDates).toBe(true);
    expect(collabPerms.canManageCollaborators).toBe(false);

    // Private resource grants no access to uninvited users
    expect(resolveUserPermissions(ownedResource, strangerUser)).toEqual(NO_PERMISSIONS);

    // Unlisted or public grants viewer permissions to non-collaborators
    const publicResource = {
      ...ownedResource,
      sharing: { ...ownedResource.sharing, visibility: 'public' as const },
    };
    expect(resolveUserPermissions(publicResource, strangerUser)).toEqual(ROLE_PRESETS.viewer);
    expect(resolveUserPermissions(publicResource, null)).toEqual(ROLE_PRESETS.viewer);
  });

  it('handles random/vanity slugs, availability checks, share hash parsing, and default env config', () => {
    const slug = generateRandomSlug(8);
    expect(slug).toMatch(/^[a-z0-9]{8}$/);
    expect(sanitizeVanitySlug('  Friday Night Premier!! 2026  ')).toBe('friday-night-premier-2026');

    expect(parseShareHashRoute('#/l/friday-night-premier')).toEqual({
      kind: 'league',
      slug: 'friday-night-premier',
    });
    expect(parseShareHashRoute('#/sport/hyperball-2026')).toEqual({
      kind: 'sport',
      slug: 'hyperball-2026',
    });
    expect(parseShareHashRoute('#/invalid')).toBeNull();

    const { teams } = makeUniqueTeams(4);
    const league = createLeague(
      'Slug League',
      teams,
      'single-rr',
      DEFAULT_COMPETITION_RULES,
      DEFAULT_SCHEDULE_CONFIG,
      DEFAULT_COMPETITION_BRANDING
    );
    league.sharing = {
      slug: 'taken-slug',
      isCustomSlug: true,
      visibility: 'public',
      collaborators: [],
    };
    expect(isSlugAvailable('taken-slug', [league], [])).toBe(false);
    expect(isSlugAvailable('taken-slug', [league], [], league.id)).toBe(true);
    expect(isSlugAvailable('fresh-slug', [league], [])).toBe(true);
    expect(isSlugAvailable('ab', [league], [])).toBe(false);

    // Without Vite env secrets configured, backend config cleanly falls back to local mode
    const cfg = getBackendConfig();
    expect(cfg.provider).toBe('local');
    expect(cfg.supabaseUrl).toBe('');
    expect(cfg.firebaseApiKey).toBe('');
  });
});
