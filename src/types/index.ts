export type PlaystyleArchetype = string;

export type BudgetTier =
  | 'Grassroots'
  | 'Challenger'
  | 'Contender'
  | 'Powerhouse'
  | 'Titan';

export type PlayerPosition = string;

export type JerseySilhouette =
  | 'basketball-tank'
  | 'football-pads'
  | 'soccer-kit'
  | 'baseball-button'
  | 'hockey-sweater'
  | 'volleyball-jersey'
  | 'rugby-collar'
  | 'esports-hoodie';

export interface SportPositionSpec {
  code: string;
  name: string;
  countRange: [number, number];
  heightInRange: [number, number];
  weightLbsRange: [number, number];
  archetypes: string[];
  statWeights: { offense: number; defense: number; speed: number; stamina: number; iq: number };
}

export interface ScoringEvent {
  id: string;
  name: string;
  points: number;
  weight: number; // relative frequency per match
}

export interface SportStatDef {
  key: string;
  label: string;
  format: 'int' | 'dec1' | 'pct' | 'avg3';
}

export type WinnerCriterion =
  | 'standings-points'
  | 'win-pct'
  | 'goal-diff'
  | 'goals-for'
  | 'head-to-head';

export type TiebreakerCriterion = 'goal-diff' | 'head-to-head' | 'goals-for' | 'win-pct';

export type OvertimeRule =
  | 'penalties'
  | 'extra-time-penalties'
  | 'golden-goal'
  | 'overtime-periods'
  | 'draws-allowed';

export interface SportRulesDefaults {
  winnerCriterion: WinnerCriterion;
  pointsWin: number;
  pointsOtWin: number;
  pointsDraw: number;
  pointsOtLoss: number;
  pointsLoss: number;
  tiebreakers: TiebreakerCriterion[];
  overtimeRule: OvertimeRule;
  drawsAllowed: boolean;
}

export interface SportDefinition {
  id: string;
  name: string;
  isBuiltIn: boolean;
  terminology: {
    scoreUnit: string; // e.g. "Points", "Goals", "Runs"
    matchUnit: string; // e.g. "Game", "Match"
    venueNoun: string; // e.g. "Arena", "Stadium", "Pitch", "Rink", "Field"
  };
  periodName: string; // e.g. "Quarter", "Half", "Period", "Inning", "Set", "Map"
  periodCount: number;
  periodLengthLabel: string; // e.g. "12 min", "45 min", "20 min"
  rosterSize: { min: number; max: number };
  activeLineupSize: number;
  positions: SportPositionSpec[];
  attributeLabels: {
    offense: string;
    defense: string;
    speed: string;
    stamina: string;
    iq: string;
  };
  statColumns: SportStatDef[];
  scoringEvents: ScoringEvent[];
  expectedScoringEventsPerTeam: number;
  startingScore?: number;
  lowestScoreWins?: boolean;
  playstyles: string[];
  venueTemplates: string[];
  equipmentIconIds: string[];
  jerseySilhouette: JerseySilhouette;
  defaultRules: SportRulesDefaults;
  defaultBreakWeeks?: BreakWeeksConfig;
  accentColor: string;
  ownerId?: string;
  ownerName?: string;
  sharing?: ShareMetadata;
  clonedFromSlug?: string;
}

export interface LogoPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  trim: string;
  colorSchemeKey: string;
}

export interface LogoConfig {
  shieldId: string;
  patternId: string;
  iconId: string;
  accentId: string;
  bannerId: string;
  paletteId: string;
  primary: string;
  secondary: string;
  trim: string;
  monogramText: string;
  dna: string;
}

export type SuspensionDurationType = 'matches' | 'until-date' | 'season' | 'indefinite';

export interface PlayerSuspension {
  id: string;
  type: 'suspension' | 'ban';
  durationType: SuspensionDurationType;
  gamesRemaining?: number;
  totalGames?: number;
  untilDate?: string;
  reason: string;
  issuedAt: string;
  active: boolean;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  jerseyNumber: number;
  position: PlayerPosition;
  age: number;
  height: string;
  weight: number;
  archetype: string;
  overall: number;
  offense: number;
  defense: number;
  speed: number;
  stamina: number;
  iq: number;
  suspension?: PlayerSuspension | null;
}

export interface HistoricalRecord {
  wins: number;
  losses: number;
  draws: number;
  championships: number;
}

export interface Team {
  id: string;
  seedCode: string;
  sportId: string;
  city: string;
  mascot: string;
  name: string;
  abbreviation: string;
  stadium: string;
  foundedYear: number;
  playstyle: PlaystyleArchetype;
  budgetTier: BudgetTier;
  starRating: number;
  overallRating: number;
  historicalRecord: HistoricalRecord;
  logo: LogoConfig;
  roster: Player[];
  createdAt: string;
  isCustom: boolean;
  ownerId?: string;
  ownerName?: string;
}

export interface TeamLocks {
  shield: boolean;
  pattern: boolean;
  icon: boolean;
  accent: boolean;
  banner: boolean;
  palette: boolean;
  city: boolean;
  mascot: boolean;
  stadium: boolean;
  playstyle: boolean;
  budgetTier: boolean;
  starRating: boolean;
  roster: boolean;
}

export interface RegistryEntry {
  id: string;
  teamName: string;
  logoDna: string;
  seedCode: string;
  source: 'studio' | 'league' | 'cup' | 'import';
  createdAt: string;
}

export interface GlobalRegistryState {
  version: number;
  logoDnas: string[];
  teamNames: string[];
  totalTeamsGenerated: number;
  totalLogosGenerated: number;
  entries: RegistryEntry[];
}

export type CompetitionType = 'league' | 'cup';
export type CompetitionFormat =
  | 'single-rr'
  | 'double-rr'
  | 'group-knockout'
  | 'single-elim'
  | 'double-elim';

export type CompetitionSize = number;

export interface CompetitionRules {
  winnerCriterion: WinnerCriterion;
  pointsWin: number;
  pointsOtWin: number;
  pointsDraw: number;
  pointsOtLoss: number;
  pointsLoss: number;
  tiebreakers: TiebreakerCriterion[];
  overtimeRule: OvertimeRule;
  homeFieldAdvantage: boolean;
  lowestScoreWins?: boolean;
}

export interface BreakWeeksConfig {
  enabled: boolean;
  breaksPerTeam: number;
  windowStartRound: number;
  windowEndRound: number;
  teamBreaks: Record<string, number[]>;
}

export interface ScheduleConfig {
  startDate: string;
  endDateMode: 'auto' | 'fixed';
  endDate: string;
  allowedDays: number[];
  pacingMode: 'games-per-week' | 'min-rest-days';
  gamesPerWeek: number;
  minRestDays: number;
  breakWeeks?: BreakWeeksConfig;
}

export type CompetitionTier =
  | 'Premier'
  | 'Championship'
  | 'Continental'
  | 'Global'
  | 'Invitational'
  | 'Amateur';

export interface CompetitionBranding {
  tier: CompetitionTier;
  accentColor: string;
  trophyStyle: 'classic-cup' | 'shield-plate' | 'crown-chalice' | 'star-obelisk';
}

export interface PreseasonConfig {
  enabled: boolean;
  mode: 'game-count' | 'date-range';
  gamesPerTeam: number; // 1..8
  startDate: string;
  endDate: string;
  frequencyDays: number; // days between exhibition rounds
  matchmaking: 'random' | 'rivals' | 'custom';
  customMatchups?: { homeTeamId: string; awayTeamId: string }[];
  carryOverStats: boolean;
}

export type AdvantageTriggerType =
  | 'preseason-wins'
  | 'preseason-undefeated'
  | 'win-streak'
  | 'margin-of-victory'
  | 'top-seed';

export type AdvantageRewardType =
  | 'bonus-standings-points'
  | 'bonus-win'
  | 'next-match-rating-boost'
  | 'post-game-score-boost'
  | 'home-score-bonus';

export interface AdvantageRule {
  id: string;
  name: string;
  enabled: boolean;
  trigger: AdvantageTriggerType;
  threshold: number; // e.g. 2 wins, 15 margin, 3 streak
  reward: AdvantageRewardType;
  rewardValue: number; // e.g. +3 pts, +1 win, +5 (%), +10 (%)
  description: string;
}

export interface AppliedAdvantage {
  ruleId: string;
  ruleName: string;
  teamId: string;
  detail: string;
  phase: 'preseason' | 'regular' | 'knockout';
}

export interface CompetitionGroup {
  name: string;
  teamIds: string[];
}

export interface PlayerSeasonStats {
  playerId: string;
  teamId: string;
  gamesPlayed: number;
  stats: Record<string, number>;
}

export interface Match {
  id: string;
  round: number;
  roundName: string;
  slotIndex: number;
  scheduledDate?: string;
  bracket?: 'preseason' | 'league' | 'group' | 'knockout' | 'winners' | 'losers' | 'grand-final';
  groupName?: string;
  isBye?: boolean;
  isOvertime?: boolean;
  homeTeamId: string | null;
  awayTeamId: string | null;
  homeScore: number | null;
  awayScore: number | null;
  penaltyWinnerId: string | null;
  resolutionNote?: string | null;
  scoringSummary?: string[];
  appliedAdvantages?: AppliedAdvantage[];
  played: boolean;
  winnerId: string | null;
  nextMatchId?: string | null;
  nextMatchSlot?: 'home' | 'away' | null;
  loserNextMatchId?: string | null;
  loserNextMatchSlot?: 'home' | 'away' | null;
}

export interface StandingRow {
  teamId: string;
  played: number;
  won: number;
  otWon: number;
  drawn: number;
  otLost: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  winPct: number;
  points: number;
  bonusPoints: number;
  bonusWins: number;
  activeAdvantages: string[];
  form: ('W' | 'D' | 'L')[];
}

export interface CupRound {
  round: number;
  name: string;
  matches: Match[];
}

export interface Competition {
  id: string;
  name: string;
  sportId: string;
  type: CompetitionType;
  format: CompetitionFormat;
  size: CompetitionSize;
  doubleRoundRobin?: boolean;
  rules: CompetitionRules;
  schedule: ScheduleConfig;
  branding: CompetitionBranding;
  preseason: PreseasonConfig;
  advantageRules: AdvantageRule[];
  appliedAdvantages: AppliedAdvantage[];
  preseasonProcessed?: boolean;
  preseasonPlayerStats?: Record<string, PlayerSeasonStats>;
  regularPlayerStats?: Record<string, PlayerSeasonStats>;
  resolvedBreakWeeks?: Record<number, string[]>;
  groupCount?: number;
  groups?: CompetitionGroup[];
  knockoutSeeded?: boolean;
  teams: Team[];
  matches: Match[];
  championId: string | null;
  history?: SimulationSnapshot[];
  ownerId?: string;
  ownerName?: string;
  sharing?: ShareMetadata;
  createdAt: string;
  updatedAt: string;
}

export type AuthProviderType = 'guest' | 'email' | 'google' | 'phone' | 'magic-link';

export interface UserProfile {
  id: string;
  displayName: string;
  email?: string;
  phone?: string;
  username?: string;
  linkedProviders: AuthProviderType[];
  isGuest: boolean;
  createdAt: string;
}

export type VisibilityLevel = 'private' | 'unlisted' | 'public';

export type RolePreset =
  | 'viewer'
  | 'sim-operator'
  | 'co-commissioner'
  | 'full-admin'
  | 'custom';

export interface CollaboratorPermissions {
  canView: boolean;
  canSimulateMatches: boolean;
  canSimulateSeason: boolean;
  canUndoSimulations: boolean;
  canEditTeamsAndRosters: boolean;
  canEditScheduleAndDates: boolean;
  canEditRulesAndAdvantages: boolean;
  canManageCollaborators: boolean;
}

export interface CollaboratorEntry {
  id: string;
  identifier: string;
  identifierType: 'email' | 'google' | 'phone' | 'username';
  status: 'pending' | 'active';
  rolePreset: RolePreset;
  permissions: CollaboratorPermissions;
  invitedAt: string;
}

export interface ShareMetadata {
  slug: string;
  isCustomSlug: boolean;
  visibility: VisibilityLevel;
  collaborators: CollaboratorEntry[];
}

export interface SimulationSnapshot {
  id: string;
  label: string;
  timestamp: string;
  teams?: Team[];
  matches: Match[];
  championId: string | null;
  appliedAdvantages: AppliedAdvantage[];
  preseasonProcessed?: boolean;
  preseasonPlayerStats?: Record<string, PlayerSeasonStats>;
  regularPlayerStats?: Record<string, PlayerSeasonStats>;
  knockoutSeeded?: boolean;
}

export interface CompetitionConstraints {
  usedIcons: Set<string>;
  usedCities: Set<string>;
  usedColorSchemes: Set<string>;
}
