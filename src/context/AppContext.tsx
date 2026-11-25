import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createRng, createUuid, generateRandomSeedCode, normalizeSeedCode } from '../engine/prng';
import { computeTeamOverall, generateRoster } from '../engine/generator/rosterGenerator';
import {
  deriveAbbreviation,
  generateTeamFromSeed,
  generateUniqueTeam,
} from '../engine/generator/teamGenerator';
import {
  hasLogoDna,
  hasTeamName,
  loadRegistry,
  registerMany,
  registerTeam,
  resetRegistry,
} from '../engine/registry/globalRegistry';
import { BUILT_IN_SPORTS } from '../engine/sports/builtInSports';
import {
  getAllSports,
  getSportById,
  loadCustomSports,
  saveCustomSports,
} from '../engine/sports/sportRegistry';
import {
  loadCompetitions,
  loadVault,
  saveCompetitions,
  saveVault,
} from '../engine/storage/persistence';
import { computeLogoDna } from '../engine/svg-logo/logoDna';
import {
  createDefaultShareMetadata,
  getCloudStatus,
  getCurrentUser,
  loadUserCloudData,
  parseShareHashRoute,
  signOutUser,
  syncUserCloudData,
  type BackendProvider,
} from '../lib/auth-db';
import type {
  Competition,
  GlobalRegistryState,
  LogoConfig,
  SportDefinition,
  Team,
  TeamLocks,
  UserProfile,
} from '../types';

export type AppTab =
  | 'studio'
  | 'vault'
  | 'competitions'
  | 'sports'
  | 'community'
  | 'registry';

const SHOWCASE_COMMUNITY_SPORTS: SportDefinition[] = [
  {
    ...JSON.parse(JSON.stringify(BUILT_IN_SPORTS[1])),
    id: 'community-blitzball-2026',
    name: 'Hyperball 2026 (Community)',
    isBuiltIn: false,
    ownerId: 'community-showcase',
    ownerName: 'ForgeLeague Official',
    sharing: {
      slug: 'hyperball-2026',
      isCustomSlug: true,
      visibility: 'public',
      collaborators: [],
    },
    terminology: { scoreUnit: 'Points', matchUnit: 'Match', venueNoun: 'Arena' },
    periodName: 'Quarter',
    periodCount: 4,
    periodLengthLabel: '10 min',
    rosterSize: { min: 10, max: 14 },
    activeLineupSize: 5,
    scoringEvents: [
      { id: 'hb2', name: 'Zone Goal', points: 2, weight: 60 },
      { id: 'hb4', name: 'Overdrive Shot', points: 4, weight: 28 },
      { id: 'hb1', name: 'Penalty Toss', points: 1, weight: 12 },
    ],
    expectedScoringEventsPerTeam: 14,
    jerseySilhouette: 'esports-hoodie',
    accentColor: '#38bdf8',
  },
  {
    ...JSON.parse(JSON.stringify(BUILT_IN_SPORTS[0])),
    id: 'community-arena-futsal',
    name: 'Arena Futsal 5s (Community)',
    isBuiltIn: false,
    ownerId: 'community-showcase',
    ownerName: 'Metro Commissioner',
    sharing: {
      slug: 'arena-futsal-5s',
      isCustomSlug: true,
      visibility: 'public',
      collaborators: [],
    },
    terminology: { scoreUnit: 'Goals', matchUnit: 'Match', venueNoun: 'Arena' },
    periodName: 'Half',
    periodCount: 2,
    periodLengthLabel: '20 min',
    rosterSize: { min: 10, max: 12 },
    activeLineupSize: 5,
    expectedScoringEventsPerTeam: 3.4,
    jerseySilhouette: 'soccer-kit',
    accentColor: '#f59e0b',
  },
];

const DEFAULT_LOCKS: TeamLocks = {
  shield: false,
  pattern: false,
  icon: false,
  accent: false,
  banner: false,
  palette: false,
  city: false,
  mascot: false,
  stadium: false,
  playstyle: false,
  budgetTier: false,
  starRating: false,
  roster: false,
};

interface AppContextValue {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  user: UserProfile | null;
  cloudStatus: { provider: BackendProvider; isCloudConfigured: boolean; label: string };
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  handleUserAuthenticated: (profile: UserProfile) => void;
  handleSignOut: () => Promise<void>;
  sharedRoute: { kind: 'league' | 'sport'; slug: string } | null;
  clearSharedRoute: () => void;
  communitySports: SportDefinition[];
  cloneCommunitySport: (sport: SportDefinition) => SportDefinition;
  customSports: SportDefinition[];
  allSports: SportDefinition[];
  activeSportId: string;
  activeSport: SportDefinition;
  selectActiveSport: (sportId: string, regenerateTeam?: boolean) => void;
  getSport: (sportId?: string) => SportDefinition;
  saveCustomSport: (sport: SportDefinition) => void;
  deleteCustomSport: (sportId: string) => void;
  activeTeam: Team;
  setActiveTeam: React.Dispatch<React.SetStateAction<Team>>;
  updateActiveLogo: (patch: Partial<LogoConfig>) => void;
  updateActiveTeamFields: (patch: Partial<Team>) => void;
  locks: TeamLocks;
  toggleLock: (key: keyof TeamLocks) => void;
  resetLocks: () => void;
  lastCollisionsAvoided: number;
  randomizeActiveTeam: (sportOverride?: SportDefinition) => void;
  loadTeamFromSeed: (seedCode: string) => void;
  vault: Team[];
  saveActiveToVault: () => void;
  saveTeamToVault: (team: Team) => void;
  removeFromVault: (teamId: string) => void;
  editVaultTeam: (team: Team) => void;
  competitions: Competition[];
  addCompetition: (comp: Competition) => void;
  updateCompetition: (comp: Competition) => void;
  deleteCompetition: (compId: string) => void;
  registry: GlobalRegistryState;
  registerNewTeam: (team: Team, source?: 'studio' | 'league' | 'cup' | 'import') => void;
  registerMultipleTeams: (teams: Team[], source: 'studio' | 'league' | 'cup' | 'import') => void;
  updateRegistryDirect: (next: GlobalRegistryState) => void;
  clearGlobalRegistry: () => void;
  importPayload: (
    teams: Team[],
    competitions: Competition[],
    sports?: SportDefinition[]
  ) => { teamsAdded: number; compsAdded: number; sportsAdded: number };
  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('studio');
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const cloudStatus = useMemo(() => getCloudStatus(), []);

  const [customSports, setCustomSports] = useState<SportDefinition[]>(() => loadCustomSports());
  const [activeSportId, setActiveSportId] = useState<string>('basketball');
  const [registry, setRegistry] = useState<GlobalRegistryState>(() => loadRegistry());
  const [vault, setVault] = useState<Team[]>(() => loadVault());
  const [competitions, setCompetitions] = useState<Competition[]>(() => loadCompetitions());
  const [locks, setLocks] = useState<TeamLocks>(DEFAULT_LOCKS);
  const [lastCollisionsAvoided, setLastCollisionsAvoided] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [sharedRoute, setSharedRoute] = useState<{ kind: 'league' | 'sport'; slug: string } | null>(() => {
    if (typeof window === 'undefined') return null;
    return parseShareHashRoute(window.location.hash);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onHashChange = () => {
      const parsed = parseShareHashRoute(window.location.hash);
      if (parsed) {
        setSharedRoute(parsed);
        if (parsed.kind === 'league') setActiveTab('competitions');
        if (parsed.kind === 'sport') setActiveTab('community');
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const clearSharedRoute = useCallback(() => {
    setSharedRoute(null);
    if (typeof window !== 'undefined' && window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const allSports = useMemo(() => getAllSports(customSports), [customSports]);
  const activeSport = useMemo(
    () => getSportById(activeSportId, customSports),
    [activeSportId, customSports]
  );

  const communitySports = useMemo(() => {
    const publicUserSports = customSports.filter(
      (s) => s.sharing?.visibility === 'public'
    );
    const seen = new Set(publicUserSports.map((s) => s.id));
    return [
      ...publicUserSports,
      ...SHOWCASE_COMMUNITY_SPORTS.filter((s) => !seen.has(s.id)),
    ];
  }, [customSports]);

  const getSport = useCallback(
    (sportId?: string) => {
      const target = sportId ?? activeSportId;
      const comm = SHOWCASE_COMMUNITY_SPORTS.find((s) => s.id === target);
      if (comm) return comm;
      return getSportById(target, customSports);
    },
    [activeSportId, customSports]
  );

  const [activeTeam, setActiveTeam] = useState<Team>(() => {
    const initialRegistry = loadRegistry();
    const initialSport = getSportById('basketball', loadCustomSports());
    const res = generateUniqueTeam(initialRegistry, {
      source: 'studio',
      sport: initialSport,
    });
    setRegistry(res.registry);
    return res.team;
  });

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    saveVault(vault);
  }, [vault]);

  useEffect(() => {
    saveCompetitions(competitions);
  }, [competitions]);

  useEffect(() => {
    saveCustomSports(customSports);
  }, [customSports]);

  // Sync user creations to cloud profile storage automatically when signed in
  useEffect(() => {
    if (!user || user.isGuest) return;
    syncUserCloudData(user.id, {
      vault,
      competitions,
      customSports,
      registry,
      updatedAt: new Date().toISOString(),
    });
  }, [user, vault, competitions, customSports, registry]);

  const handleUserAuthenticated = useCallback(
    (profile: UserProfile) => {
      setUser(profile);
      setAuthModalOpen(false);
      const cloud = loadUserCloudData(profile.id);
      if (cloud) {
        if (cloud.vault.length > 0) {
          setVault((prev) => {
            const ids = new Set(prev.map((t) => t.id));
            return [...prev, ...cloud.vault.filter((t) => !ids.has(t.id))];
          });
        }
        if (cloud.competitions.length > 0) {
          setCompetitions((prev) => {
            const ids = new Set(prev.map((c) => c.id));
            return [...prev, ...cloud.competitions.filter((c) => !ids.has(c.id))];
          });
        }
        if (cloud.customSports.length > 0) {
          setCustomSports((prev) => {
            const ids = new Set(prev.map((s) => s.id));
            return [...prev, ...cloud.customSports.filter((s) => !ids.has(s.id))];
          });
        }
      }
      showToast(`Signed in as ${profile.displayName}`);
    },
    [showToast]
  );

  const handleSignOut = useCallback(async () => {
    await signOutUser();
    setUser(null);
    showToast('Signed out — switched to local guest mode');
  }, [showToast]);

  const randomizeActiveTeam = useCallback(
    (sportOverride?: SportDefinition) => {
      const targetSport = sportOverride ?? activeSport;
      const res = generateUniqueTeam(registry, {
        locks,
        baseTeam: activeTeam,
        source: 'studio',
        sport: targetSport,
      });
      if (user) {
        res.team.ownerId = user.id;
        res.team.ownerName = user.displayName;
      }
      setRegistry(res.registry);
      setActiveTeam(res.team);
      setLastCollisionsAvoided(res.collisionsAvoided);
    },
    [registry, locks, activeTeam, activeSport, user]
  );

  const selectActiveSport = useCallback(
    (sportId: string, regenerateTeam = true) => {
      setActiveSportId(sportId);
      const nextSport = getSport(sportId);
      if (regenerateTeam) {
        const res = generateUniqueTeam(registry, {
          locks,
          baseTeam: activeTeam,
          source: 'studio',
          sport: nextSport,
        });
        setRegistry(res.registry);
        setActiveTeam(res.team);
        setLastCollisionsAvoided(res.collisionsAvoided);
      } else {
        setActiveTeam((prev) => ({ ...prev, sportId }));
      }
      showToast(`Active sport switched to ${nextSport.name}`);
    },
    [getSport, registry, locks, activeTeam, showToast]
  );

  const saveCustomSport = useCallback(
    (sport: SportDefinition) => {
      const normalized: SportDefinition = {
        ...sport,
        isBuiltIn: false,
        ownerId: sport.ownerId ?? user?.id,
        ownerName: sport.ownerName ?? user?.displayName,
        sharing: sport.sharing ?? createDefaultShareMetadata(),
      };
      setCustomSports((prev) => {
        const idx = prev.findIndex((s) => s.id === normalized.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = normalized;
          return copy;
        }
        return [normalized, ...prev];
      });
      setActiveSportId(normalized.id);
      showToast(`Saved custom sport "${normalized.name}"`);
    },
    [user, showToast]
  );

  const cloneCommunitySport = useCallback(
    (sourceSport: SportDefinition): SportDefinition => {
      const cloned: SportDefinition = {
        ...JSON.parse(JSON.stringify(sourceSport)),
        id: `custom-${createUuid().slice(0, 8)}`,
        name: `${sourceSport.name.replace(/\s*\(Community\)$/i, '')} (Copy)`,
        isBuiltIn: false,
        ownerId: user?.id,
        ownerName: user?.displayName,
        clonedFromSlug: sourceSport.sharing?.slug,
        sharing: createDefaultShareMetadata(),
      };
      setCustomSports((prev) => [cloned, ...prev]);
      setActiveSportId(cloned.id);
      showToast(`Imported "${cloned.name}" into your Sport Library`);
      return cloned;
    },
    [user, showToast]
  );

  const deleteCustomSport = useCallback(
    (sportId: string) => {
      setCustomSports((prev) => prev.filter((s) => s.id !== sportId));
      if (activeSportId === sportId) {
        setActiveSportId('soccer');
      }
      showToast('Deleted custom sport');
    },
    [activeSportId, showToast]
  );

  const updateActiveLogo = useCallback((patch: Partial<LogoConfig>) => {
    setActiveTeam((prev) => {
      const merged = { ...prev.logo, ...patch };
      const dna = computeLogoDna(merged);
      return {
        ...prev,
        isCustom: true,
        logo: { ...merged, dna },
      };
    });
  }, []);

  const updateActiveTeamFields = useCallback(
    (patch: Partial<Team>) => {
      setActiveTeam((prev) => {
        const sport = getSportById(patch.sportId ?? prev.sportId, customSports);
        const city = patch.city ?? prev.city;
        const mascot = patch.mascot ?? prev.mascot;
        const name = patch.name ?? `${city} ${mascot}`;
        const abbreviation = patch.abbreviation ?? deriveAbbreviation(city, mascot);
        const roster = patch.roster ?? prev.roster;
        const overallRating = computeTeamOverall(roster, sport.activeLineupSize);
        const logo = {
          ...prev.logo,
          monogramText: abbreviation,
        };
        logo.dna = computeLogoDna(logo);
        return {
          ...prev,
          ...patch,
          city,
          mascot,
          name,
          abbreviation,
          roster,
          overallRating,
          logo,
          isCustom: true,
        };
      });
    },
    [customSports]
  );

  const toggleLock = useCallback((key: keyof TeamLocks) => {
    setLocks((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const resetLocks = useCallback(() => {
    setLocks(DEFAULT_LOCKS);
  }, []);

  const loadTeamFromSeed = useCallback(
    (seedCode: string) => {
      const trimmed = normalizeSeedCode(seedCode);
      if (!trimmed) return;
      const team = generateTeamFromSeed(trimmed, {
        locks,
        baseTeam: activeTeam,
        sport: activeSport,
      });
      setActiveTeam(team);
      if (!hasLogoDna(registry, team.logo.dna) || !hasTeamName(registry, team.name)) {
        const nextReg = registerTeam(registry, team, 'studio');
        setRegistry(nextReg);
      }
      showToast(`Loaded ${activeSport.name} franchise from seed ${trimmed}`);
    },
    [locks, activeTeam, activeSport, registry, showToast]
  );

  const saveTeamToVault = useCallback(
    (team: Team) => {
      const normalized: Team = {
        ...team,
        sportId: team.sportId || activeSportId,
        ownerId: team.ownerId ?? user?.id,
        ownerName: team.ownerName ?? user?.displayName,
        logo: { ...team.logo, dna: computeLogoDna(team.logo) },
      };
      setVault((prev) => {
        const idx = prev.findIndex((t) => t.id === normalized.id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = normalized;
          return copy;
        }
        return [normalized, ...prev];
      });
      const nextReg = registerTeam(registry, normalized, 'studio');
      setRegistry(nextReg);
      showToast(`Saved "${normalized.name}" to Franchise Vault`);
    },
    [activeSportId, user, registry, showToast]
  );

  const saveActiveToVault = useCallback(() => {
    saveTeamToVault(activeTeam);
  }, [activeTeam, saveTeamToVault]);

  const removeFromVault = useCallback(
    (teamId: string) => {
      setVault((prev) => prev.filter((t) => t.id !== teamId));
      showToast('Removed team from Franchise Vault');
    },
    [showToast]
  );

  const editVaultTeam = useCallback((team: Team) => {
    if (team.sportId) {
      setActiveSportId(team.sportId);
    }
    setActiveTeam({ ...team });
    setActiveTab('studio');
  }, []);

  const addCompetition = useCallback(
    (comp: Competition) => {
      const owned: Competition = {
        ...comp,
        ownerId: comp.ownerId ?? user?.id,
        ownerName: comp.ownerName ?? user?.displayName,
        sharing: comp.sharing ?? createDefaultShareMetadata(),
        history: comp.history ?? [],
      };
      setCompetitions((prev) => [owned, ...prev]);
      showToast(`Created ${owned.type === 'league' ? 'League' : 'Cup'}: ${owned.name}`);
    },
    [user, showToast]
  );

  const updateCompetition = useCallback((comp: Competition) => {
    setCompetitions((prev) => prev.map((c) => (c.id === comp.id ? comp : c)));
  }, []);

  const deleteCompetition = useCallback(
    (compId: string) => {
      setCompetitions((prev) => prev.filter((c) => c.id !== compId));
      showToast('Deleted competition');
    },
    [showToast]
  );

  const registerNewTeam = useCallback(
    (team: Team, source: 'studio' | 'league' | 'cup' | 'import' = 'studio') => {
      setRegistry((prev) => registerTeam(prev, team, source));
    },
    []
  );

  const registerMultipleTeams = useCallback(
    (teams: Team[], source: 'studio' | 'league' | 'cup' | 'import') => {
      setRegistry((prev) => registerMany(prev, teams, source));
    },
    []
  );

  const updateRegistryDirect = useCallback((next: GlobalRegistryState) => {
    setRegistry(next);
  }, []);

  const clearGlobalRegistry = useCallback(() => {
    const empty = resetRegistry();
    setRegistry(empty);
    showToast('Global Registry reset — duplicate history cleared');
  }, [showToast]);

  const importPayload = useCallback(
    (
      importedTeams: Team[],
      importedComps: Competition[],
      importedSports: SportDefinition[] = []
    ) => {
      let teamsAdded = 0;
      let compsAdded = 0;
      let sportsAdded = 0;
      let reg = registry;

      if (importedSports.length > 0) {
        setCustomSports((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const merged = [...prev];
          for (const s of importedSports) {
            if (!existingIds.has(s.id)) {
              merged.unshift({
                ...s,
                isBuiltIn: false,
                ownerId: user?.id,
                ownerName: user?.displayName,
                sharing: s.sharing ?? createDefaultShareMetadata(),
              });
              sportsAdded++;
            }
          }
          return merged;
        });
      }

      if (importedTeams.length > 0) {
        const sanitizedTeams = importedTeams.map((t) => {
          const sp = getSportById(t.sportId || 'soccer', customSports);
          return {
            ...t,
            id: t.id || createUuid(),
            sportId: t.sportId || 'soccer',
            seedCode: t.seedCode || generateRandomSeedCode(),
            ownerId: t.ownerId ?? user?.id,
            roster:
              t.roster && t.roster.length > 0
                ? t.roster
                : generateRoster(createRng(t.seedCode || t.name), t.starRating || 3, sp),
          };
        });

        setVault((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const merged = [...prev];
          for (const t of sanitizedTeams) {
            if (!existingIds.has(t.id)) {
              merged.unshift(t);
              teamsAdded++;
            }
          }
          return merged;
        });

        reg = registerMany(reg, sanitizedTeams, 'import');
      }

      if (importedComps.length > 0) {
        setCompetitions((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const merged = [...prev];
          for (const c of importedComps) {
            if (!existingIds.has(c.id)) {
              merged.unshift({
                ...c,
                sharing: c.sharing ?? createDefaultShareMetadata(),
                history: c.history ?? [],
              });
              compsAdded++;
            }
          }
          return merged;
        });

        for (const c of importedComps) {
          reg = registerMany(reg, c.teams, 'import');
        }
      }

      setRegistry(reg);
      showToast(
        `Imported ${teamsAdded} team(s), ${compsAdded} competition(s), ${sportsAdded} sport(s)`
      );
      return { teamsAdded, compsAdded, sportsAdded };
    },
    [registry, customSports, user, showToast]
  );

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        cloudStatus,
        authModalOpen,
        setAuthModalOpen,
        handleUserAuthenticated,
        handleSignOut,
        sharedRoute,
        clearSharedRoute,
        communitySports,
        cloneCommunitySport,
        customSports,
        allSports,
        activeSportId,
        activeSport,
        selectActiveSport,
        getSport,
        saveCustomSport,
        deleteCustomSport,
        activeTeam,
        setActiveTeam,
        updateActiveLogo,
        updateActiveTeamFields,
        locks,
        toggleLock,
        resetLocks,
        lastCollisionsAvoided,
        randomizeActiveTeam,
        loadTeamFromSeed,
        vault,
        saveActiveToVault,
        saveTeamToVault,
        removeFromVault,
        editVaultTeam,
        competitions,
        addCompetition,
        updateCompetition,
        deleteCompetition,
        registry,
        registerNewTeam,
        registerMultipleTeams,
        updateRegistryDirect,
        clearGlobalRegistry,
        importPayload,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
