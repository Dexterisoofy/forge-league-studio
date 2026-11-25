import { createClient, type SupabaseClient, type User as SupabaseUser } from '@supabase/supabase-js';
import { createUuid } from '../../engine/prng';
import type {
  AuthProviderType,
  Competition,
  GlobalRegistryState,
  SportDefinition,
  Team,
  UserProfile,
} from '../../types';
import { getBackendConfig } from './envConfig';

const SESSION_KEY = 'forge_league_auth_session_v1';
const USERS_KEY = 'forge_league_local_users_v1';
const CLOUD_PROFILES_KEY = 'forge_league_cloud_profiles_v1';

interface LocalUserRecord {
  profile: UserProfile;
  passwordHash?: string;
}

export interface UserCloudBundle {
  vault: Team[];
  competitions: Competition[];
  customSports: SportDefinition[];
  registry?: GlobalRegistryState;
  updatedAt: string;
}

let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getBackendConfig();
  if (cfg.provider !== 'supabase' || !cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    return null;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }
  return supabaseClient;
}

function getStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

function readJson<T>(key: string, fallback: T): T {
  const st = getStorage();
  if (!st) return fallback;
  try {
    const raw = st.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, val: unknown): void {
  const st = getStorage();
  if (!st) return;
  try {
    st.setItem(key, JSON.stringify(val));
  } catch {
    // ignore quota errors
  }
}

export function getCurrentUser(): UserProfile | null {
  return readJson<UserProfile | null>(SESSION_KEY, null);
}

function saveSession(user: UserProfile | null): void {
  writeJson(SESSION_KEY, user);
}

function getLocalUsers(): LocalUserRecord[] {
  return readJson<LocalUserRecord[]>(USERS_KEY, []);
}

function saveLocalUsers(users: LocalUserRecord[]): void {
  writeJson(USERS_KEY, users);
}

function mapSupabaseUser(sbUser: SupabaseUser): UserProfile {
  const email = sbUser.email?.trim().toLowerCase();
  const phone = sbUser.phone?.trim();
  const meta = (sbUser.user_metadata ?? {}) as Record<string, unknown>;
  const metaName =
    (typeof meta.full_name === 'string' && meta.full_name) ||
    (typeof meta.name === 'string' && meta.name) ||
    (typeof meta.display_name === 'string' && meta.display_name) ||
    '';
  const rawUsername =
    (typeof meta.username === 'string' && meta.username) ||
    (email ? email.split('@')[0] : phone ? phone.replace(/[^0-9]/g, '') : undefined);

  const providersRaw = Array.isArray(sbUser.app_metadata?.providers)
    ? (sbUser.app_metadata.providers as string[])
    : typeof sbUser.app_metadata?.provider === 'string'
      ? [sbUser.app_metadata.provider]
      : ['email'];

  const linkedProviders: AuthProviderType[] = providersRaw.map((p) => {
    if (p === 'google') return 'google';
    if (p === 'phone') return 'phone';
    return 'email';
  });

  return {
    id: sbUser.id,
    displayName: metaName || (email ? email.split('@')[0] : phone || 'Commissioner'),
    email,
    phone,
    username: rawUsername?.toLowerCase(),
    linkedProviders,
    isGuest: false,
    createdAt: sbUser.created_at ?? new Date().toISOString(),
  };
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function toDbUuid(rawId: string): string {
  if (UUID_REGEX.test(rawId)) return rawId.toLowerCase();
  let h1 = 0x811c9dc5;
  let h2 = 0x12345678;
  for (let i = 0; i < rawId.length; i++) {
    h1 ^= rawId.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193) >>> 0;
    h2 = (Math.imul(h2, 31) + rawId.charCodeAt(i)) >>> 0;
  }
  const p1 = h1.toString(16).padStart(8, '0');
  const p2 = (h2 >>> 16).toString(16).padStart(4, '0');
  const p3 = (h2 & 0x0fff).toString(16).padStart(3, '0');
  const p4 = ((h1 ^ h2) & 0x3fff).toString(16).padStart(3, '0');
  const tail = `${p1}${(h2 >>> 0).toString(16).padStart(8, '0')}`.slice(0, 12).padEnd(12, '0');
  return `${p1}-${p2}-4${p3}-8${p4}-${tail}`;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<UserProfile> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) throw new Error(error.message);
    const profile: UserProfile = data.user
      ? mapSupabaseUser(data.user)
      : {
          id: createUuid(),
          displayName: displayName || email.split('@')[0],
          email: email.trim().toLowerCase(),
          username: email.trim().toLowerCase().split('@')[0],
          linkedProviders: ['email'],
          isGuest: false,
          createdAt: new Date().toISOString(),
        };
    saveSession(profile);
    return profile;
  }

  const users = getLocalUsers();
  const norm = email.trim().toLowerCase();
  const existing = users.find((u) => u.profile.email?.toLowerCase() === norm);
  if (existing) {
    throw new Error('An account with this email already exists. Please sign in.');
  }
  const profile: UserProfile = {
    id: `usr-${createUuid().slice(0, 8)}`,
    displayName: displayName.trim() || norm.split('@')[0],
    email: norm,
    username: norm.split('@')[0],
    linkedProviders: ['email'],
    isGuest: false,
    createdAt: new Date().toISOString(),
  };
  users.push({ profile, passwordHash: password });
  saveLocalUsers(users);
  saveSession(profile);
  return profile;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<UserProfile> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const profile = mapSupabaseUser(data.user);
    saveSession(profile);
    return profile;
  }

  const users = getLocalUsers();
  const norm = email.trim().toLowerCase();
  const found = users.find((u) => u.profile.email?.toLowerCase() === norm);
  if (!found || (found.passwordHash && found.passwordHash !== password)) {
    throw new Error('Invalid email or password.');
  }
  saveSession(found.profile);
  return found.profile;
}

export async function signInWithGoogle(googleEmail?: string): Promise<UserProfile | null> {
  const sb = getSupabaseClient();
  if (sb) {
    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: redirectTo ? { redirectTo } : undefined,
    });
    if (error) throw new Error(error.message);
    // Browser redirects to Google OAuth and hydrates session via subscribeSupabaseAuth
    return null;
  }

  const email = (googleEmail?.trim() || 'commissioner@gmail.com').toLowerCase();
  const users = getLocalUsers();
  let found = users.find((u) => u.profile.email?.toLowerCase() === email);
  if (!found) {
    const profile: UserProfile = {
      id: `usr-${createUuid().slice(0, 8)}`,
      displayName: email.split('@')[0],
      email,
      username: email.split('@')[0],
      linkedProviders: ['google'],
      isGuest: false,
      createdAt: new Date().toISOString(),
    };
    found = { profile };
    users.push(found);
    saveLocalUsers(users);
  } else if (!found.profile.linkedProviders.includes('google')) {
    found.profile.linkedProviders = [...found.profile.linkedProviders, 'google'];
    saveLocalUsers(users);
  }
  saveSession(found.profile);
  return found.profile;
}

export async function requestPhoneOtp(phone: string): Promise<string> {
  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.auth.signInWithOtp({ phone });
    if (error) throw new Error(error.message);
    return 'SMS verification code sent.';
  }
  return 'Local Demo Mode: enter any 6-digit code (e.g. 123456) to verify.';
}

export async function verifyPhoneOtp(
  phone: string,
  otpCode: string
): Promise<UserProfile> {
  const sb = getSupabaseClient();
  if (sb) {
    const { data, error } = await sb.auth.verifyOtp({
      phone,
      token: otpCode,
      type: 'sms',
    });
    if (error) throw new Error(error.message);
    const profile: UserProfile = {
      id: data.user?.id ?? createUuid(),
      displayName: phone,
      phone,
      username: phone.replace(/[^0-9]/g, ''),
      linkedProviders: ['phone'],
      isGuest: false,
      createdAt: new Date().toISOString(),
    };
    saveSession(profile);
    return profile;
  }

  if (otpCode.trim().length < 4) {
    throw new Error('Enter a valid verification code (4–6 digits).');
  }

  const cleanPhone = phone.trim();
  const users = getLocalUsers();
  let found = users.find((u) => u.profile.phone === cleanPhone);
  if (!found) {
    const profile: UserProfile = {
      id: `usr-${createUuid().slice(0, 8)}`,
      displayName: cleanPhone,
      phone: cleanPhone,
      username: `user-${cleanPhone.slice(-4)}`,
      linkedProviders: ['phone'],
      isGuest: false,
      createdAt: new Date().toISOString(),
    };
    found = { profile };
    users.push(found);
    saveLocalUsers(users);
  }
  saveSession(found.profile);
  return found.profile;
}

export async function sendMagicLink(email: string): Promise<UserProfile | null> {
  const sb = getSupabaseClient();
  if (sb) {
    const emailRedirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}${window.location.pathname}`
        : undefined;
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    });
    if (error) throw new Error(error.message);
    return null;
  }
  const norm = email.trim().toLowerCase();
  const users = getLocalUsers();
  let found = users.find((u) => u.profile.email?.toLowerCase() === norm);
  if (!found) {
    const profile: UserProfile = {
      id: `usr-${createUuid().slice(0, 8)}`,
      displayName: norm.split('@')[0],
      email: norm,
      username: norm.split('@')[0],
      linkedProviders: ['magic-link'],
      isGuest: false,
      createdAt: new Date().toISOString(),
    };
    found = { profile };
    users.push(found);
    saveLocalUsers(users);
  }
  saveSession(found.profile);
  return found.profile;
}

export function subscribeSupabaseAuth(
  onChange: (profile: UserProfile | null) => void
): () => void {
  const sb = getSupabaseClient();
  if (!sb) return () => {};

  const handleSessionUser = (sbUser: SupabaseUser | null | undefined) => {
    if (sbUser) {
      const profile = mapSupabaseUser(sbUser);
      saveSession(profile);
      onChange(profile);
    }
  };

  void sb.auth.getSession().then(({ data }) => {
    handleSessionUser(data.session?.user);
  });

  const { data: listener } = sb.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      saveSession(null);
      onChange(null);
    } else if (session?.user) {
      handleSessionUser(session.user);
    }
  });

  return () => listener.subscription.unsubscribe();
}

export async function syncCompetitionToSupabase(
  comp: Competition,
  userId: string
): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb || !UUID_REGEX.test(userId)) return;

  const dbId = toDbUuid(comp.id);
  const slug = comp.sharing?.slug || `comp-${dbId.slice(0, 8)}`;
  const visibility = comp.sharing?.visibility ?? 'private';

  try {
    await sb.from('competitions').upsert(
      {
        id: dbId,
        owner_id: toDbUuid(comp.ownerId ?? userId),
        sport_id: comp.sportId,
        name: comp.name,
        slug,
        visibility,
        payload: { ...comp, id: dbId, ownerId: toDbUuid(comp.ownerId ?? userId) },
        history: comp.history ?? [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    const collaborators = comp.sharing?.collaborators ?? [];
    await sb
      .from('collaborators')
      .delete()
      .eq('resource_type', 'competition')
      .eq('resource_id', dbId);

    if (collaborators.length > 0) {
      await sb.from('collaborators').insert(
        collaborators.map((c) => ({
          resource_type: 'competition',
          resource_id: dbId,
          invited_by: userId,
          identifier: c.identifier.trim().toLowerCase().replace(/^@+/, ''),
          identifier_type: c.identifierType,
          status: c.status,
          role_preset: c.rolePreset,
          permissions: c.permissions,
        }))
      );
    }
  } catch {
    // Ignore transient network / RLS sync errors cleanly
  }
}

export async function syncSportToSupabase(
  sport: SportDefinition,
  userId: string
): Promise<void> {
  const sb = getSupabaseClient();
  if (!sb || sport.isBuiltIn || !UUID_REGEX.test(userId)) return;

  const dbId = toDbUuid(sport.id);
  const slug = sport.sharing?.slug || `sport-${dbId.slice(0, 8)}`;
  const visibility = sport.sharing?.visibility ?? 'private';

  try {
    await sb.from('custom_sports').upsert(
      {
        id: dbId,
        owner_id: toDbUuid(sport.ownerId ?? userId),
        name: sport.name,
        slug,
        visibility,
        cloned_from_slug: sport.clonedFromSlug ?? null,
        payload: { ...sport, ownerId: toDbUuid(sport.ownerId ?? userId) },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    const collaborators = sport.sharing?.collaborators ?? [];
    await sb
      .from('collaborators')
      .delete()
      .eq('resource_type', 'custom_sport')
      .eq('resource_id', dbId);

    if (collaborators.length > 0) {
      await sb.from('collaborators').insert(
        collaborators.map((c) => ({
          resource_type: 'custom_sport',
          resource_id: dbId,
          invited_by: userId,
          identifier: c.identifier.trim().toLowerCase().replace(/^@+/, ''),
          identifier_type: c.identifierType,
          status: c.status,
          role_preset: c.rolePreset,
          permissions: c.permissions,
        }))
      );
    }
  } catch {
    // Ignore transient network / RLS sync errors cleanly
  }
}

export async function fetchAccessibleCloudResources(): Promise<{
  competitions: Competition[];
  customSports: SportDefinition[];
}> {
  const sb = getSupabaseClient();
  if (!sb) return { competitions: [], customSports: [] };
  try {
    const [compRes, sportRes] = await Promise.all([
      sb.from('competitions').select('payload, history'),
      sb.from('custom_sports').select('payload'),
    ]);
    const competitions = (compRes.data ?? [])
      .map((row): Competition | null => {
        const comp = row.payload as Competition | undefined;
        if (!comp) return null;
        return {
          ...comp,
          history: Array.isArray(row.history)
            ? (row.history as Competition['history'])
            : comp.history ?? [],
        };
      })
      .filter((c): c is Competition => c !== null);
    const customSports = (sportRes.data ?? [])
      .map((row) => row.payload as SportDefinition | undefined)
      .filter((s): s is SportDefinition => Boolean(s));
    return { competitions, customSports };
  } catch {
    return { competitions: [], customSports: [] };
  }
}

export async function fetchCompetitionBySlugFromSupabase(
  slug: string
): Promise<Competition | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('competitions')
      .select('payload, history')
      .eq('slug', slug.toLowerCase())
      .maybeSingle();
    if (error || !data?.payload) return null;
    const comp = data.payload as Competition;
    return {
      ...comp,
      history: Array.isArray(data.history)
        ? (data.history as Competition['history'])
        : comp.history ?? [],
    };
  } catch {
    return null;
  }
}

export async function fetchSportBySlugFromSupabase(
  slug: string
): Promise<SportDefinition | null> {
  const sb = getSupabaseClient();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from('custom_sports')
      .select('payload')
      .eq('slug', slug.toLowerCase())
      .maybeSingle();
    if (error || !data?.payload) return null;
    return data.payload as SportDefinition;
  } catch {
    return null;
  }
}

export function linkAccountProvider(
  user: UserProfile,
  provider: AuthProviderType,
  detail: { email?: string; phone?: string; username?: string }
): UserProfile {
  const updated: UserProfile = {
    ...user,
    email: detail.email ? detail.email.trim().toLowerCase() : user.email,
    phone: detail.phone ? detail.phone.trim() : user.phone,
    username: detail.username ? detail.username.trim().toLowerCase() : user.username,
    linkedProviders: user.linkedProviders.includes(provider)
      ? user.linkedProviders
      : [...user.linkedProviders, provider],
  };

  const users = getLocalUsers();
  const idx = users.findIndex((u) => u.profile.id === updated.id);
  if (idx >= 0) {
    users[idx] = { ...users[idx], profile: updated };
    saveLocalUsers(users);
  }
  saveSession(updated);
  return updated;
}

export async function signOutUser(): Promise<void> {
  const sb = getSupabaseClient();
  if (sb) {
    await sb.auth.signOut();
  }
  saveSession(null);
}

export function syncUserCloudData(userId: string, bundle: UserCloudBundle): void {
  const profiles = readJson<Record<string, UserCloudBundle>>(CLOUD_PROFILES_KEY, {});
  profiles[userId] = bundle;
  writeJson(CLOUD_PROFILES_KEY, profiles);
}

export function loadUserCloudData(userId: string): UserCloudBundle | null {
  const profiles = readJson<Record<string, UserCloudBundle>>(CLOUD_PROFILES_KEY, {});
  return profiles[userId] ?? null;
}
