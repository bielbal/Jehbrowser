import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { tabs, history, settings } from './stores';
import { get } from 'svelte/store';

const SEARCH_ENGINES: Record<string, string> = {
  brave:      'https://search.brave.com/search?q=',
  google:     'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  bing:       'https://www.bing.com/search?q='
};

export function sanitiseUrl(raw: string): string {
  const s = raw.trim();
  if (!s) return 'jeh://newtab';
  if (/^jeh:\/\//.test(s)) return s;
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(s)) return s;
  if (/^localhost(:\d+)?/.test(s) || /^\d{1,3}(\.\d{1,3}){3}/.test(s)) return `http://${s}`;
  if (/^[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+/.test(s) && !s.includes(' ')) return `https://${s}`;
  const engine = get(settings).searchEngine;
  return SEARCH_ENGINES[engine] + encodeURIComponent(s);
}

export function isSecure(url: string): 'secure' | 'insecure' | 'internal' {
  if (url.startsWith('jeh://') || url.startsWith('about:')) return 'internal';
  if (url.startsWith('https://')) return 'secure';
  return 'insecure';
}

export async function createTab(url?: string): Promise<void> {
  const finalUrl = sanitiseUrl(url ?? get(settings).homepage);
  const tab = tabs.open(finalUrl);
  if (finalUrl !== 'jeh://newtab') {
    tabs.patch(tab.id, { loading: true, secureInfo: isSecure(finalUrl) });
    await invoke('create_tab', { tabId: tab.id, url: finalUrl }).catch(() => {
      tabs.patch(tab.id, { loading: false });
    });
  }
}

export async function navigate(tabId: string, raw: string): Promise<void> {
  const url = sanitiseUrl(raw);
  tabs.patch(tabId, { url, loading: true, secureInfo: isSecure(url), canGoBack: false, canGoForward: false });
  if (url.startsWith('jeh://')) { tabs.patch(tabId, { loading: false }); return; }
  await invoke('navigate_tab', { tabId, url }).catch(() => tabs.patch(tabId, { loading: false }));
}

export const goBack    = (id: string) => invoke('tab_back',    { tabId: id }).catch(() => {});
export const goForward = (id: string) => invoke('tab_forward', { tabId: id }).catch(() => {});
export const reload    = (id: string) => invoke('tab_reload',  { tabId: id }).catch(() => {});
export const stopLoad  = (id: string) => invoke('tab_stop',    { tabId: id }).catch(() => {});

export async function closeTab(id: string): Promise<void> {
  await invoke('close_tab', { tabId: id }).catch(() => {});
  tabs.close(id);
}

export async function activateTab(id: string): Promise<void> {
  tabs.activate(id);
  await invoke('activate_tab', { tabId: id }).catch(() => {});
}

export function setupEvents(): () => void {
  const unlisten: Array<() => void> = [];

  listen<{ tab_id: string; url: string; title?: string; favicon?: string; can_go_back: boolean; can_go_forward: boolean }>('nav-event', e => {
    const d = e.payload;
    tabs.patch(d.tab_id, {
      url: d.url, loading: false,
      title: d.title ?? d.url,
      favicon: d.favicon,
      canGoBack: d.can_go_back,
      canGoForward: d.can_go_forward,
      secureInfo: isSecure(d.url)
    });
    if (d.title) history.push({ url: d.url, title: d.title, favicon: d.favicon });
  }).then(fn => unlisten.push(fn));

  listen<{ tab_id: string; loading: boolean }>('load-event', e => {
    tabs.patch(e.payload.tab_id, { loading: e.payload.loading });
  }).then(fn => unlisten.push(fn));

  return () => unlisten.forEach(fn => fn());
}
