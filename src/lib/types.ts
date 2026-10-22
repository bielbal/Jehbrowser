export interface Tab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  loading: boolean;
  isActive: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
  pinned?: boolean;
  secureInfo?: 'secure' | 'insecure' | 'internal';
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  createdAt: number;
  folder?: string;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitedAt: number;
}

export interface BrowserSettings {
  theme: 'dark' | 'light' | 'system';
  accent: 'violet' | 'indigo' | 'blue' | 'cyan' | 'green' | 'amber' | 'rose' | 'purple';
  density: 'compact' | 'comfortable';
  homepage: string;
  searchEngine: 'brave' | 'google' | 'duckduckgo' | 'bing';
  showBookmarksBar: boolean;
  newTabBackground: 'gradient' | 'solid' | 'image';
}

export type SidebarPanel = 'none' | 'bookmarks' | 'history' | 'downloads';
