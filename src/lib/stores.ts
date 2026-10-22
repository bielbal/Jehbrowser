import { writable, derived, get } from 'svelte/store';
import type { Tab, Bookmark, HistoryEntry, BrowserSettings, SidebarPanel } from './types';

const nanoid = () => Math.random().toString(36).slice(2, 10);

// ── Tabs ──────────────────────────────────────────────────────────────────────

function createTabStore() {
  const { subscribe, update } = writable<Tab[]>([]);

  return {
    subscribe,
    open(url = 'jeh://newtab'): Tab {
      const tab: Tab = {
        id: nanoid(), url, title: 'New Tab',
        loading: false, isActive: false,
        canGoBack: false, canGoForward: false,
        secureInfo: 'internal'
      };
      update(tabs => {
        tabs.forEach(t => t.isActive = false);
        tab.isActive = true;
        return [...tabs, tab];
      });
      return tab;
    },
    close(id: string) {
      update(tabs => {
        const idx = tabs.findIndex(t => t.id === id);
        const filtered = tabs.filter(t => t.id !== id);
        if (filtered.length === 0) return filtered;
        if (tabs[idx]?.isActive) {
          const next = filtered[Math.min(idx, filtered.length - 1)];
          if (next) next.isActive = true;
        }
        return filtered;
      });
    },
    activate(id: string) {
      update(tabs => tabs.map(t => ({ ...t, isActive: t.id === id })));
    },
    patch(id: string, data: Partial<Tab>) {
      update(tabs => tabs.map(t => t.id === id ? { ...t, ...data } : t));
    },
    getAll() { return get({ subscribe }); }
  };
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

function createBookmarkStore() {
  const stored: Bookmark[] = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem('jeh-bookmarks') ?? '[]')
    : [];
  const { subscribe, update } = writable<Bookmark[]>(stored);
  const persist = (v: Bookmark[]) => { try { localStorage.setItem('jeh-bookmarks', JSON.stringify(v)); } catch { /* noop */ } };

  return {
    subscribe,
    add(data: Omit<Bookmark, 'id' | 'createdAt'>) {
      const bm: Bookmark = { ...data, id: nanoid(), createdAt: Date.now() };
      update(v => { const n = [...v, bm]; persist(n); return n; });
    },
    remove(id: string) {
      update(v => { const n = v.filter(b => b.id !== id); persist(n); return n; });
    },
    has(url: string): boolean {
      return get({ subscribe }).some(b => b.url === url);
    }
  };
}

// ── History ───────────────────────────────────────────────────────────────────

function createHistoryStore() {
  const stored: HistoryEntry[] = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem('jeh-history') ?? '[]')
    : [];
  const { subscribe, update } = writable<HistoryEntry[]>(stored);
  const persist = (v: HistoryEntry[]) => { try { localStorage.setItem('jeh-history', JSON.stringify(v)); } catch { /* noop */ } };

  return {
    subscribe,
    push(data: Omit<HistoryEntry, 'id' | 'visitedAt'>) {
      const entry: HistoryEntry = { ...data, id: nanoid(), visitedAt: Date.now() };
      update(v => {
        const filtered = v.filter(e => e.url !== data.url);
        const n = [entry, ...filtered].slice(0, 500);
        persist(n);
        return n;
      });
    },
    clear() {
      update(() => { persist([]); return []; });
    }
  };
}

// ── Settings ──────────────────────────────────────────────────────────────────

function createSettingsStore() {
  const defaults: BrowserSettings = {
    theme: 'dark', accent: 'violet', density: 'comfortable',
    homepage: 'jeh://newtab', searchEngine: 'brave',
    showBookmarksBar: false, newTabBackground: 'gradient'
  };
  const stored: BrowserSettings = typeof localStorage !== 'undefined'
    ? { ...defaults, ...JSON.parse(localStorage.getItem('jeh-settings') ?? '{}') }
    : defaults;
  const { subscribe, update } = writable<BrowserSettings>(stored);

  function apply(s: BrowserSettings) {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    html.setAttribute('data-theme', s.theme === 'system' ? (prefersDark ? 'dark' : 'light') : s.theme);
    html.setAttribute('data-accent', s.accent);
    html.setAttribute('data-density', s.density);
  }

  apply(stored);

  return {
    subscribe,
    set(s: BrowserSettings) {
      update(() => {
        try { localStorage.setItem('jeh-settings', JSON.stringify(s)); } catch { /* noop */ }
        apply(s);
        return s;
      });
    },
    patch(data: Partial<BrowserSettings>) {
      update(s => {
        const n = { ...s, ...data };
        try { localStorage.setItem('jeh-settings', JSON.stringify(n)); } catch { /* noop */ }
        apply(n);
        return n;
      });
    }
  };
}

export const tabs = createTabStore();
export const bookmarks = createBookmarkStore();
export const history = createHistoryStore();
export const settings = createSettingsStore();
export const sidebarPanel = writable<SidebarPanel>('none');
export const showSettings = writable(false);
export const showShortcuts = writable(false);

export const activeTab = derived(tabs, $tabs => $tabs.find(t => t.isActive) ?? null);
