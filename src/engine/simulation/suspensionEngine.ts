import type { Player, PlayerSuspension, Team } from '../../types';

/**
 * Determines whether a player is currently ineligible to play on the given match date.
 */
export function isPlayerSuspended(player: Player, matchDate?: string): boolean {
  const susp = player.suspension;
  if (!susp || !susp.active) return false;
  if (susp.durationType === 'indefinite' || susp.durationType === 'season') {
    return true;
  }
  if (susp.durationType === 'matches') {
    return (susp.gamesRemaining ?? 0) > 0;
  }
  if (susp.durationType === 'until-date') {
    if (!susp.untilDate) return true;
    const refDate = matchDate || new Date().toISOString().slice(0, 10);
    return refDate <= susp.untilDate;
  }
  return false;
}

/**
 * Computes effective team rating using eligible (non-suspended/non-banned) players.
 * If top starters are suspended, the team weakens proportionally.
 */
export function getEffectiveTeamRating(
  team: Team,
  activeLineupSize = 5,
  matchDate?: string
): number {
  const roster = team.roster ?? [];
  if (roster.length === 0) return team.overallRating;

  const eligible = roster.filter((p) => !isPlayerSuspended(p, matchDate));
  if (eligible.length === 0) {
    // Entire squad suspended/banned -> severe forfeit penalty
    return Math.max(35, team.overallRating - 28);
  }

  if (eligible.length === roster.length) {
    return team.overallRating;
  }

  const slotCount = Math.max(1, Math.min(activeLineupSize, roster.length));
  const fullTop = [...roster]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, slotCount);
  const availTop = [...eligible]
    .sort((a, b) => b.overall - a.overall)
    .slice(0, Math.min(slotCount, eligible.length));

  const fullAvg = fullTop.reduce((s, p) => s + p.overall, 0) / fullTop.length;
  const availAvg = availTop.reduce((s, p) => s + p.overall, 0) / availTop.length;
  const depthPenalty = availTop.length < slotCount ? (slotCount - availTop.length) * 4 : 0;

  return Math.max(35, Math.min(99, Math.round(team.overallRating + (availAvg - fullAvg) - depthPenalty)));
}

/**
 * Decrements match-based suspensions after a team finishes a match.
 * Indefinite, season-long, and date-based suspensions remain untouched (date-based expire automatically past their date).
 */
export function decrementTeamSuspensions(team: Team, matchDate?: string): Team {
  let changed = false;
  const nextRoster = team.roster.map((player) => {
    const susp = player.suspension;
    if (!susp || !susp.active) return player;

    if (susp.durationType === 'matches') {
      const rem = (susp.gamesRemaining ?? 0) - 1;
      changed = true;
      if (rem <= 0) {
        return { ...player, suspension: null };
      }
      return {
        ...player,
        suspension: { ...susp, gamesRemaining: rem },
      };
    }

    if (susp.durationType === 'until-date' && susp.untilDate && matchDate && matchDate > susp.untilDate) {
      changed = true;
      return { ...player, suspension: null };
    }

    return player;
  });

  return changed ? { ...team, roster: nextRoster } : team;
}

export function formatSuspensionBadge(susp: PlayerSuspension): string {
  const prefix = susp.type === 'ban' ? 'BANNED' : 'SUSP';
  if (susp.durationType === 'indefinite') return `${prefix} · INDEFINITE`;
  if (susp.durationType === 'season') return `${prefix} · SEASON`;
  if (susp.durationType === 'until-date') return `${prefix} · UNTIL ${susp.untilDate ?? '?'}`;
  const rem = susp.gamesRemaining ?? 0;
  return `${prefix} · ${rem}G LEFT`;
}

export function countActiveSuspensions(teams: Team[]): number {
  let count = 0;
  for (const t of teams) {
    for (const p of t.roster) {
      if (isPlayerSuspended(p)) count++;
    }
  }
  return count;
}
