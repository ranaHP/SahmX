import { create } from 'zustand';
import type { AuthSession, RequestResult, SavedUserProfile } from '../types/api';
import { DEFAULT_BASE_URL, loadHistory, loadSavedProfiles, loadSession, saveHistory, saveSavedProfiles, saveSession, STORAGE_KEYS } from '../utils/storage';

interface AppState {
  baseUrl: string;
  session: AuthSession | null;
  history: RequestResult[];
  savedProfiles: SavedUserProfile[];
  selectedAccountId: string;
  manualLoginName: string;
  theme: 'dark' | 'light';
  autoRefresh: boolean;
  setBaseUrl: (baseUrl: string) => void;
  resetBaseUrl: () => void;
  setSession: (session: AuthSession | null) => void;
  updateSession: (patch: Partial<AuthSession>) => void;
  clearSession: () => void;
  addHistory: (entry: RequestResult) => void;
  clearHistory: () => void;
  saveProfile: (profile: SavedUserProfile) => void;
  deleteProfile: (id: string) => void;
  markProfileUsed: (id: string) => void;
  setSelectedAccountId: (id: string) => void;
  setManualLoginName: (value: string) => void;
  toggleTheme: () => void;
  setAutoRefresh: (value: boolean) => void;
}

const initialTheme = (localStorage.getItem(STORAGE_KEYS.theme) as 'dark' | 'light' | null) ?? 'dark';
document.body.classList.toggle('light', initialTheme === 'light');

export const useAppStore = create<AppState>((set, get) => ({
  baseUrl: localStorage.getItem(STORAGE_KEYS.baseUrl) || DEFAULT_BASE_URL,
  session: loadSession(),
  history: loadHistory(),
  savedProfiles: loadSavedProfiles(),
  selectedAccountId: 'tdwl-icm-1008051',
  manualLoginName: '',
  theme: initialTheme,
  autoRefresh: localStorage.getItem(STORAGE_KEYS.autoRefresh) === 'true',
  setBaseUrl: (baseUrl) => {
    const normalized = baseUrl.trim().replace(/\/$/, '');
    localStorage.setItem(STORAGE_KEYS.baseUrl, normalized);
    set({ baseUrl: normalized });
  },
  resetBaseUrl: () => {
    localStorage.setItem(STORAGE_KEYS.baseUrl, DEFAULT_BASE_URL);
    set({ baseUrl: DEFAULT_BASE_URL });
  },
  setSession: (session) => {
    saveSession(session);
    set({ session });
  },
  updateSession: (patch) => {
    const current = get().session;
    if (!current) return;
    const session = { ...current, ...patch };
    saveSession(session);
    set({ session });
  },
  clearSession: () => {
    saveSession(null);
    set({ session: null });
  },
  addHistory: (entry) => {
    const history = [entry, ...get().history].slice(0, 80);
    saveHistory(history);
    set({ history });
  },
  clearHistory: () => {
    saveHistory([]);
    set({ history: [] });
  },
  saveProfile: (profile) => {
    const profiles = [profile, ...get().savedProfiles.filter((item) => item.id !== profile.id)].slice(0, 12);
    saveSavedProfiles(profiles);
    set({ savedProfiles: profiles });
  },
  deleteProfile: (id) => {
    const profiles = get().savedProfiles.filter((item) => item.id !== id);
    saveSavedProfiles(profiles);
    set({ savedProfiles: profiles });
  },
  markProfileUsed: (id) => {
    const profiles = get().savedProfiles.map((item) => item.id === id ? { ...item, lastUsedAt: Date.now() } : item);
    saveSavedProfiles(profiles);
    set({ savedProfiles: profiles });
  },
  setSelectedAccountId: (selectedAccountId) => set({ selectedAccountId }),
  setManualLoginName: (manualLoginName) => set({ manualLoginName }),
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEYS.theme, theme);
    document.body.classList.toggle('light', theme === 'light');
    set({ theme });
  },
  setAutoRefresh: (autoRefresh) => {
    localStorage.setItem(STORAGE_KEYS.autoRefresh, String(autoRefresh));
    set({ autoRefresh });
  },
}));
