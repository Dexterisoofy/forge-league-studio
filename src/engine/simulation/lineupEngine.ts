import type { Player, SportDefinition, Team } from '../../types';
import { isPlayerSuspended } from './suspensionEngine';

export type LineupSlotNumber = 1 | 2 | 3 | 4 | 5;

export interface SlotSpec {
  slot: LineupSlotNumber;
  role: string;
  shortLabel: string;
  eligiblePositions: string[];
  minHeightInches: number;
}

export interface StarterAssignment {
  slot: LineupSlotNumber;
  role: string;
  shortLabel: string;
  player: Player;
  fitScore: number;
  schemeBonus: number;
  roleBonus: number;
}

export interface RotationSelection {
  isBasketballRotation: boolean;
  starters: StarterAssignment[];
  sixthMan: Player | null;
  bench: Player[];
  usedThreeGuardFallback: boolean;
}

const SLOT_BASE_SPECS: SlotSpec[] = [
  {
    slot: 1,
    role: 'Primary Ball-Handler',
    shortLabel: 'S1 · BH',
    eligiblePositions: ['PG', 'SG', 'SF'],
    minHeightInches: 0,
  },
  {
    slot: 2,
    role: 'Off-Ball Guard/Wing',
    shortLabel: 'S2 · OB',
    eligiblePositions: ['PG', 'SG', 'SF'],
    minHeightInches: 0,
  },
  {
    slot: 3,
    role: 'Perimeter Wing',
    shortLabel: 'S3 · WG',
    eligiblePositions: ['SG', 'SF', 'PF'],
    minHeightInches: 78, // 6'6"
  },
  {
    slot: 4,
    role: 'Forward',
    shortLabel: 'S4 · FW',
    eligiblePositions: ['SF', 'PF', 'C'],
    minHeightInches: 80, // 6'8"
  },
  {
    slot: 5,
    role: 'Center / Big',
    shortLabel: 'S5 · BG',
    eligiblePositions: ['PF', 'C'],
    minHeightInches: 81, // 6'9" (or 6'8" for Small-Ball Switch)
  },
];

const NATURAL_POS_FOR_SLOT: Record<LineupSlotNumber, string> = {
  1: 'PG',
  2: 'SG',
  3: 'SF',
  4: 'PF',
  5: 'C',
};

/**
 * Parses height strings like `6'6"` or `6'10"` into total inches.
 */
export function parseHeightInches(height: string): number {
  const m = /(\d+)\s*'\s*(\d+)/.exec(height ?? '');
  if (!m) return 78;
  return Number.parseInt(m[1], 10) * 12 + Number.parseInt(m[2], 10);
}

function isSmallBallSwitch(playstyle: string): boolean {
  return playstyle.trim().toLowerCase() === 'small-ball switch';
}

function isBasketballSport(sport: SportDefinition, roster: Player[]): boolean {
  if (sport.id === 'basketball' || sport.jerseySilhouette === 'basketball-tank') {
    return true;
  }
  if (sport.activeLineupSize !== 5) return false;
  const posSet = new Set(roster.map((p) => p.position));
  return ['PG', 'SG', 'SF', 'PF', 'C'].every((c) => posSet.has(c));
}

function computeSchemeArchetypeBonus(
  player: Player,
  playstyle: string,
  slot: LineupSlotNumber
): number {
  const arch = player.archetype.toLowerCase();
  const scheme = playstyle.trim().toLowerCase();

  if (scheme === 'small-ball switch') {
    if (
      arch.includes('3-and-d') ||
      arch.includes('two-way') ||
      arch.includes('stretch') ||
      arch.includes('point forward')
    ) {
      return 4;
    }
    if (arch.includes('perimeter') || arch.includes('slasher') || arch.includes('pick-and-roll')) {
      return 3;
    }
    if (slot <= 2 && arch.includes('floor general')) return 2;
    return 1;
  }

  if (scheme === 'pace & space' || scheme === 'run & gun') {
    if (
      arch.includes('sharpshooter') ||
      arch.includes('stretch') ||
      arch.includes('floor general') ||
      arch.includes('scoring guard')
    ) {
      return 4;
    }
    if (arch.includes('3-and-d') || arch.includes('shot creator') || arch.includes('slasher')) {
      return 3;
    }
    if (arch.includes('pick-and-roll')) return 2;
    return 1;
  }

  if (scheme === 'grindhouse defense') {
    if (
      arch.includes('rim protector') ||
      arch.includes('perimeter hawk') ||
      arch.includes('3-and-d') ||
      arch.includes('two-way')
    ) {
      return 4;
    }
    if (arch.includes('enforcer') || arch.includes('glass cleaner')) {
      return 3;
    }
    return 1;
  }

  if (scheme === 'motion offense') {
    if (
      arch.includes('floor general') ||
      arch.includes('point forward') ||
      arch.includes('sharpshooter') ||
      arch.includes('two-way')
    ) {
      return 4;
    }
    if (arch.includes('stretch') || arch.includes('shot creator')) {
      return 3;
    }
    return 1;
  }

  if (scheme === 'twin towers') {
    if (
      arch.includes('rim protector') ||
      arch.includes('post scorer') ||
      arch.includes('glass cleaner') ||
      arch.includes('enforcer')
    ) {
      return 4;
    }
    if (arch.includes('pick-and-roll') || arch.includes('floor general')) {
      return 3;
    }
    return 1;
  }

  // Generic custom scheme fallback: reward spacing/playmaking/two-way archetypes
  if (arch.includes('two-way') || arch.includes('floor general') || arch.includes('3-and-d')) {
    return 3;
  }
  return 1;
}

function computeRoleAttributeBonus(player: Player, slot: LineupSlotNumber): number {
  let rawAttr: number;
  if (slot === 1) {
    // Primary Ball-Handler: PLAYM (iq)
    rawAttr = player.iq;
  } else if (slot === 2) {
    // Off-Ball Guard/Wing: SCORI (offense)
    rawAttr = player.offense;
  } else if (slot === 3) {
    // Perimeter Wing: PERIM (defense) + ATHLE (speed)
    rawAttr = (player.defense + player.speed) / 2;
  } else if (slot === 4) {
    // Forward: PERIM (defense) + ATHLE (speed) + MOTOR (stamina)
    rawAttr = (player.defense + player.speed + player.stamina) / 3;
  } else {
    // Center / Big: rim/interior defense + motor/scoring anchor
    rawAttr = (player.defense * 0.5 + player.stamina * 0.25 + player.offense * 0.25);
  }
  return Math.max(0, Math.min(3, ((rawAttr - 55) / 40) * 3));
}

function scoreCandidateForSlot(
  player: Player,
  playstyle: string,
  slot: LineupSlotNumber
): { fitScore: number; schemeBonus: number; roleBonus: number } {
  const schemeBonus = computeSchemeArchetypeBonus(player, playstyle, slot);
  const roleBonus = computeRoleAttributeBonus(player, slot);
  const fitScore = Number((player.overall + schemeBonus + roleBonus).toFixed(2));
  return { fitScore, schemeBonus, roleBonus };
}

function passesLineupGuardrails(
  chosen: Player[],
  bigMinInches: number,
  threeGuardFallback: boolean
): boolean {
  // Never start 3 players with the same primary position
  const posCounts = new Map<string, number>();
  for (const p of chosen) {
    const c = (posCounts.get(p.position) ?? 0) + 1;
    if (c > 2) return false;
    posCounts.set(p.position, c);
  }

  // Max 2 guards under 6'6" (relaxed to 3 in extreme-imbalance fallback)
  const smallGuards = chosen.filter(
    (p) => (p.position === 'PG' || p.position === 'SG') && parseHeightInches(p.height) < 78
  ).length;
  if (smallGuards > (threeGuardFallback ? 3 : 2)) return false;

  // At least 2 wings/forwards >= 6'6" with POS in [SG, SF, PF] (relaxed to >= 1 in fallback)
  const wingsForwards = chosen.filter(
    (p) => ['SG', 'SF', 'PF'].includes(p.position) && parseHeightInches(p.height) >= 78
  ).length;
  if (wingsForwards < (threeGuardFallback ? 1 : 2)) return false;

  // At least 1 frontcourt big >= 6'9" (or 6'8" under Small-Ball Switch) with POS in [PF, C]
  const bigs = chosen.filter(
    (p) => ['PF', 'C'].includes(p.position) && parseHeightInches(p.height) >= bigMinInches
  ).length;
  if (bigs < (threeGuardFallback ? 0 : 1)) return false;

  return true;
}

function searchOptimalLineup(
  eligible: Player[],
  playstyle: string,
  bigMinInches: number,
  threeGuardFallback: boolean
): StarterAssignment[] | null {
  const slots: SlotSpec[] = SLOT_BASE_SPECS.map((s) => {
    if (s.slot === 5) {
      return { ...s, minHeightInches: bigMinInches };
    }
    if (s.slot === 3 && threeGuardFallback) {
      return {
        ...s,
        eligiblePositions: ['PG', 'SG', 'SF', 'PF'],
        minHeightInches: 0,
      };
    }
    return s;
  });

  // Rank top candidates per slot to keep backtracking fast (6^5 max)
  const slotCandidates = slots.map((spec) => {
    return eligible
      .filter(
        (p) =>
          spec.eligiblePositions.includes(p.position) &&
          parseHeightInches(p.height) >= spec.minHeightInches
      )
      .map((p) => ({
        player: p,
        ...scoreCandidateForSlot(p, playstyle, spec.slot),
      }))
      .sort((a, b) => {
        if (Math.abs(b.fitScore - a.fitScore) > 0.001) return b.fitScore - a.fitScore;
        const aNat = a.player.position === NATURAL_POS_FOR_SLOT[spec.slot] ? 1 : 0;
        const bNat = b.player.position === NATURAL_POS_FOR_SLOT[spec.slot] ? 1 : 0;
        return bNat - aNat;
      })
      .slice(0, 7);
  });

  if (slotCandidates.some((list) => list.length === 0)) {
    return null;
  }

  let bestScore = -Infinity;
  let bestTieScore = -1;
  let bestAssignment: StarterAssignment[] | null = null;

  const usedIds = new Set<string>();
  const current: StarterAssignment[] = [];

  const dfs = (slotIdx: number, accScore: number, natCount: number) => {
    if (slotIdx === 5) {
      const players = current.map((c) => c.player);
      if (!passesLineupGuardrails(players, bigMinInches, threeGuardFallback)) return;
      if (
        accScore > bestScore + 0.001 ||
        (Math.abs(accScore - bestScore) <= 0.001 && natCount > bestTieScore)
      ) {
        bestScore = accScore;
        bestTieScore = natCount;
        bestAssignment = current.map((c) => ({ ...c }));
      }
      return;
    }

    // Upper-bound prune
    let optimMax = accScore;
    for (let j = slotIdx; j < 5; j++) {
      optimMax += slotCandidates[j][0].fitScore;
    }
    if (optimMax < bestScore - 0.001) return;

    const spec = slots[slotIdx];
    for (const cand of slotCandidates[slotIdx]) {
      if (usedIds.has(cand.player.id)) continue;
      usedIds.add(cand.player.id);
      current.push({
        slot: spec.slot,
        role: spec.role,
        shortLabel: spec.shortLabel,
        player: cand.player,
        fitScore: cand.fitScore,
        schemeBonus: cand.schemeBonus,
        roleBonus: cand.roleBonus,
      });
      const isNat = cand.player.position === NATURAL_POS_FOR_SLOT[spec.slot] ? 1 : 0;
      dfs(slotIdx + 1, accScore + cand.fitScore, natCount + isNat);
      current.pop();
      usedIds.delete(cand.player.id);
    }
  };

  dfs(0, 0, 0);
  return bestAssignment;
}

function designateSixthMan(eligible: Player[], starterIds: Set<string>): Player | null {
  const bench = eligible.filter((p) => !starterIds.has(p.id));
  if (bench.length === 0) return null;

  // Highest-OVR non-starting guard/scorer (preferring PG/SG/SF), tie-broken by scoring offense
  const guardScorerBench = bench.filter((p) => ['PG', 'SG', 'SF'].includes(p.position));
  const pool = guardScorerBench.length > 0 ? guardScorerBench : bench;
  return [...pool].sort((a, b) => {
    if (b.overall !== a.overall) return b.overall - a.overall;
    return b.offense - a.offense;
  })[0];
}

/**
 * Selects realistic starters (and Sixth Man for Basketball teams) respecting positional,
 * height, scheme-fit, talent-gap (> 14 OVR), and suspension eligibility rules.
 */
export function selectTeamRotation(
  team: Team,
  sport: SportDefinition,
  matchDate?: string
): RotationSelection {
  const eligible = team.roster.filter((p) => !isPlayerSuspended(p, matchDate));

  if (!isBasketballSport(sport, team.roster) || eligible.length <= 5) {
    const sorted = [...eligible].sort((a, b) => b.overall - a.overall);
    const count = Math.max(0, Math.min(sport.activeLineupSize, sorted.length));
    const starterSlice = sorted.slice(0, count);
    const starterIds = new Set(starterSlice.map((p) => p.id));
    return {
      isBasketballRotation: false,
      starters: starterSlice.map((player, idx) => ({
        slot: Math.min(5, idx + 1) as LineupSlotNumber,
        role: player.position,
        shortLabel: `S${idx + 1}`,
        player,
        fitScore: player.overall,
        schemeBonus: 0,
        roleBonus: 0,
      })),
      sixthMan: null,
      bench: team.roster
        .filter((p) => !starterIds.has(p.id))
        .sort((a, b) => b.overall - a.overall),
      usedThreeGuardFallback: false,
    };
  }

  const bigMinInches = isSmallBallSwitch(team.playstyle) ? 80 : 81;

  const strictLineup = searchOptimalLineup(eligible, team.playstyle, bigMinInches, false);
  let chosen = strictLineup;
  let usedThreeGuardFallback = false;

  if (strictLineup) {
    // Check talent gap override (> 14 OVR): if an eligible bench guard is > 14 OVR better than
    // a starting frontcourt player, allow a 3-guard lineup override.
    const starterIds = new Set(strictLineup.map((s) => s.player.id));
    const frontcourtStarters = strictLineup.filter(
      (s) => s.slot >= 3 || ['SF', 'PF', 'C'].includes(s.player.position)
    );
    const minFrontOvr =
      frontcourtStarters.length > 0
        ? Math.min(...frontcourtStarters.map((s) => s.player.overall))
        : 99;
    const highOvrBenchGuard = eligible
      .filter(
        (p) =>
          !starterIds.has(p.id) &&
          ['PG', 'SG'].includes(p.position) &&
          p.overall - minFrontOvr > 14
      )
      .sort((a, b) => b.overall - a.overall)[0];

    if (highOvrBenchGuard) {
      const threeGuardLineup = searchOptimalLineup(
        eligible,
        team.playstyle,
        bigMinInches,
        true
      );
      if (threeGuardLineup) {
        chosen = threeGuardLineup;
        usedThreeGuardFallback = true;
      }
    }
  } else {
    // Relaxed 3-guard / height fallback if roster lacks balanced size
    chosen = searchOptimalLineup(eligible, team.playstyle, bigMinInches, true);
    usedThreeGuardFallback = Boolean(chosen);
  }

  // Final structural safety fallback for extreme synthetic rosters
  if (!chosen) {
    const sorted = [...eligible].sort((a, b) => b.overall - a.overall).slice(0, 5);
    chosen = SLOT_BASE_SPECS.slice(0, sorted.length).map((spec, idx) => ({
      slot: spec.slot,
      role: spec.role,
      shortLabel: spec.shortLabel,
      player: sorted[idx],
      fitScore: sorted[idx].overall,
      schemeBonus: 0,
      roleBonus: 0,
    }));
  }

  const orderedStarters = [...chosen].sort((a, b) => a.slot - b.slot);
  const starterIds = new Set(orderedStarters.map((s) => s.player.id));
  const sixthMan = designateSixthMan(eligible, starterIds);
  const bench = team.roster
    .filter((p) => !starterIds.has(p.id) && p.id !== sixthMan?.id)
    .sort((a, b) => b.overall - a.overall);

  return {
    isBasketballRotation: true,
    starters: orderedStarters,
    sixthMan,
    bench,
    usedThreeGuardFallback,
  };
}
