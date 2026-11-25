import type {
  CollaboratorEntry,
  CollaboratorPermissions,
  RolePreset,
  ShareMetadata,
  UserProfile,
} from '../../types';

export const DEFAULT_OWNER_PERMISSIONS: CollaboratorPermissions = {
  canView: true,
  canSimulateMatches: true,
  canSimulateSeason: true,
  canUndoSimulations: true,
  canEditTeamsAndRosters: true,
  canEditScheduleAndDates: true,
  canEditRulesAndAdvantages: true,
  canManageCollaborators: true,
};

export const NO_PERMISSIONS: CollaboratorPermissions = {
  canView: false,
  canSimulateMatches: false,
  canSimulateSeason: false,
  canUndoSimulations: false,
  canEditTeamsAndRosters: false,
  canEditScheduleAndDates: false,
  canEditRulesAndAdvantages: false,
  canManageCollaborators: false,
};

export const ROLE_PRESETS: Record<Exclude<RolePreset, 'custom'>, CollaboratorPermissions> = {
  viewer: {
    canView: true,
    canSimulateMatches: false,
    canSimulateSeason: false,
    canUndoSimulations: false,
    canEditTeamsAndRosters: false,
    canEditScheduleAndDates: false,
    canEditRulesAndAdvantages: false,
    canManageCollaborators: false,
  },
  'sim-operator': {
    canView: true,
    canSimulateMatches: true,
    canSimulateSeason: true,
    canUndoSimulations: true,
    canEditTeamsAndRosters: false,
    canEditScheduleAndDates: false,
    canEditRulesAndAdvantages: false,
    canManageCollaborators: false,
  },
  'co-commissioner': {
    canView: true,
    canSimulateMatches: true,
    canSimulateSeason: true,
    canUndoSimulations: true,
    canEditTeamsAndRosters: true,
    canEditScheduleAndDates: true,
    canEditRulesAndAdvantages: true,
    canManageCollaborators: false,
  },
  'full-admin': {
    ...DEFAULT_OWNER_PERMISSIONS,
  },
};

export const PERMISSION_LABELS: {
  key: keyof CollaboratorPermissions;
  label: string;
  description: string;
}[] = [
  { key: 'canView', label: 'View Competition', description: 'View standings, brackets, schedules & stats' },
  { key: 'canSimulateMatches', label: 'Simulate Single Matches', description: 'Run single-game or day-by-day simulations' },
  { key: 'canSimulateSeason', label: 'Simulate Season / Batch', description: 'Run full-season or multi-round batch simulations' },
  { key: 'canUndoSimulations', label: 'Undo Simulations', description: 'Revert or restore past simulation checkpoints' },
  { key: 'canEditTeamsAndRosters', label: 'Edit Teams & Rosters', description: 'Add/remove clubs, logos & player ratings' },
  { key: 'canEditScheduleAndDates', label: 'Edit Schedule & Dates', description: 'Modify start/end dates, match days & fixtures' },
  { key: 'canEditRulesAndAdvantages', label: 'Edit Rules & Advantages', description: 'Modify scoring, tiebreakers & conditional bonuses' },
  { key: 'canManageCollaborators', label: 'Manage Collaborators', description: 'Invite/remove users or edit their permissions' },
];

function normalizeIdentifier(val: string): string {
  return val.trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, '');
}

export function matchesCollaborator(
  entry: CollaboratorEntry,
  user: UserProfile | null
): boolean {
  if (!user) return false;
  const target = normalizeIdentifier(entry.identifier);
  if (!target) return false;
  if (user.email && normalizeIdentifier(user.email) === target) return true;
  if (user.phone && normalizeIdentifier(user.phone) === target) return true;
  if (user.username && normalizeIdentifier(user.username) === target) return true;
  if (user.displayName && normalizeIdentifier(user.displayName) === target) return true;
  return false;
}

/**
 * Resolves effective permissions for the current user against an owned/shared resource.
 */
export function resolveUserPermissions(
  resource: { ownerId?: string; sharing?: ShareMetadata },
  user: UserProfile | null
): CollaboratorPermissions {
  // Unowned local resources created in guest mode are fully editable locally
  if (!resource.ownerId) {
    return { ...DEFAULT_OWNER_PERMISSIONS };
  }

  if (user && resource.ownerId === user.id) {
    return { ...DEFAULT_OWNER_PERMISSIONS };
  }

  const collaborators = resource.sharing?.collaborators ?? [];
  const matched = collaborators.find((c) => matchesCollaborator(c, user));
  if (matched) {
    return { ...matched.permissions };
  }

  const visibility = resource.sharing?.visibility ?? 'private';
  if (visibility === 'public' || visibility === 'unlisted') {
    return { ...ROLE_PRESETS.viewer };
  }

  return { ...NO_PERMISSIONS };
}
