import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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
    const profile: UserProfile = {
      id: data.user?.id ?? createUuid(),
      displayName: displayName || email.split('@')[0],
      email,
      username: email.split('@')[0],
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
    const profile: UserProfile = {
      id: data.user.id,
      displayName:
        (data.user.user_metadata?.display_name as string) ||
        email.split('@')[0],
      email: data.user.email ?? email,
      username: email.split('@')[0],
      linkedProviders: ['email'],
      isGuest: false,
      createdAt: data.user.created_at ?? new Date().toISOString(),
    };
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

export async function signInWithGoogle(googleEmail?: string): Promise<UserProfile> {
  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw new Error(error.message);
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

export async function sendMagicLink(email: string): Promise<UserProfile> {
  const sb = getSupabaseClient();
  if (sb) {
    const { error } = await sb.auth.signInWithOtp({ email });
    if (error) throw new Error(error.message);
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
