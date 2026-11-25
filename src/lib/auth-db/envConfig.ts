export type BackendProvider = 'local' | 'supabase' | 'firebase';

export interface BackendEnvConfig {
  provider: BackendProvider;
  appBaseUrl: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseStorageBucket: string;
  firebaseMessagingSenderId: string;
  firebaseAppId: string;
}

function readEnv(key: string): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    return (env?.[key] ?? '').trim();
  } catch {
    return '';
  }
}

export function getBackendConfig(): BackendEnvConfig {
  const rawProvider = readEnv('VITE_BACKEND_PROVIDER').toLowerCase();
  const supabaseUrl = readEnv('VITE_SUPABASE_URL');
  const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY');
  const firebaseApiKey = readEnv('VITE_FIREBASE_API_KEY');
  const firebaseProjectId = readEnv('VITE_FIREBASE_PROJECT_ID');

  let provider: BackendProvider = 'local';
  if (rawProvider === 'supabase' && supabaseUrl && supabaseAnonKey) {
    provider = 'supabase';
  } else if (rawProvider === 'firebase' && firebaseApiKey && firebaseProjectId) {
    provider = 'firebase';
  } else if (!rawProvider) {
    if (supabaseUrl && supabaseAnonKey) provider = 'supabase';
    else if (firebaseApiKey && firebaseProjectId) provider = 'firebase';
  }

  return {
    provider,
    appBaseUrl: readEnv('VITE_APP_BASE_URL'),
    supabaseUrl,
    supabaseAnonKey,
    firebaseApiKey,
    firebaseAuthDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
    firebaseProjectId,
    firebaseStorageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
    firebaseMessagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
    firebaseAppId: readEnv('VITE_FIREBASE_APP_ID'),
  };
}

export function getCloudStatus(): {
  provider: BackendProvider;
  isCloudConfigured: boolean;
  label: string;
} {
  const cfg = getBackendConfig();
  if (cfg.provider === 'supabase') {
    return { provider: 'supabase', isCloudConfigured: true, label: 'Supabase Cloud Sync' };
  }
  if (cfg.provider === 'firebase') {
    return { provider: 'firebase', isCloudConfigured: true, label: 'Firebase Cloud Sync' };
  }
  return { provider: 'local', isCloudConfigured: false, label: 'Local Guest / Demo Sync' };
}
