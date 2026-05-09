import { create } from 'zustand';
import type { AuthSession, RequestResult } from '../types/api';
import { DEFAULT_BASE_URL, loadHistory, loadSession, saveHistory, saveSession, STORAGE_KEYS } from '../utils/storage';

interface AppState {
  baseUrl: string;
  session: AuthSession | null;
  history: RequestResult[];
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
