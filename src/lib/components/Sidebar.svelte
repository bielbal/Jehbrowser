<script lang="ts">
  import { sidebarPanel, bookmarks, history, activeTab } from '../stores';
  import { navigate } from '../browser';
  import type { Bookmark, HistoryEntry } from '../types';

  let searchQuery = '';

  function close() { sidebarPanel.set('none'); }

  function open(url: string) {
    if ($activeTab) navigate($activeTab.id, url);
    close();
  }

  function formatDate(ts: number) {
    const d = new Date(ts);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  $: filteredBookmarks = searchQuery
    ? $bookmarks.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.url.includes(searchQuery))
    : $bookmarks;

  $: filteredHistory = searchQuery
    ? $history.filter(h => h.title?.toLowerCase().includes(searchQuery.toLowerCase()) || h.url.includes(searchQuery))
    : $history;

  $: items = ($sidebarPanel === 'bookmarks' ? filteredBookmarks : filteredHistory) as Array<Bookmark | HistoryEntry>;
</script>

<aside class="sidebar" style="animation: fadeIn 0.15s ease;">
  <div class="sidebar-header">
    <h2 class="sidebar-title">
      {$sidebarPanel === 'bookmarks' ? 'Bookmarks' : 'History'}
    </h2>
    <button class="icon-btn" on:click={close} type="button" title="Close">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
    </button>
  </div>

  <div class="sidebar-search">
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="6.5" cy="6.5" r="4" stroke="currentColor" stroke-width="1.2"/><path d="M9.5 9.5l2.5 2.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
    <input
      bind:value={searchQuery}
      placeholder="Search..."
      class="search-input"
      type="text"
      autocomplete="off"
    />
  </div>

  <div class="sidebar-content">
    {#if $sidebarPanel === 'history' && $history.length > 0}
      <button class="clear-btn" on:click={() => history.clear()} type="button">
        Clear all history
      </button>
    {/if}

    {#if items.length === 0}
      <div class="empty">
        <span class="empty-icon">{$sidebarPanel === 'bookmarks' ? '⭐' : '🕐'}</span>
        <p>{searchQuery ? 'No results' : $sidebarPanel === 'bookmarks' ? 'No bookmarks yet' : 'No history yet'}</p>
      </div>
    {:else}
      {#each items as item (item.id)}
        <button class="entry" on:click={() => open(item.url)} type="button">
          {#if item.favicon}
            <img src={item.favicon} alt="" width="16" height="16" class="entry-favicon" />
          {:else}
            <span class="entry-globe">🌐</span>
          {/if}
          <div class="entry-text">
            <span class="entry-title">{item.title || item.url}</span>
            <span class="entry-url">{item.url}</span>
          </div>
          {#if $sidebarPanel === 'bookmarks'}
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <span
              class="remove-btn"
              role="button"
              tabindex="-1"
              title="Remove"
              on:click|stopPropagation={() => bookmarks.remove(item.id)}
              on:keydown={(e) => e.key === 'Enter' && bookmarks.remove(item.id)}
            >
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </span>
          {:else}
            <span class="entry-time">{formatDate(('visitedAt' in item) ? item.visitedAt : 0)}</span>
          {/if}
        </button>
      {/each}
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 290px;
    min-width: 290px;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .sidebar-title { font-size: 13px; font-weight: 600; margin: 0; }

  .icon-btn {
    width: 28px; height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    transition: background 0.1s, color 0.1s;
  }
  .icon-btn:hover { background: var(--color-elevated); color: var(--color-text-primary); }

  .sidebar-search {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
    flex-shrink: 0;
  }

  .search-input {
    flex: 1;
    font-size: 12px;
    color: var(--color-text-primary);
  }
  .search-input::placeholder { color: var(--color-text-muted); }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 6px;
  }

  .clear-btn {
    width: 100%;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 11px;
    color: #ef4444;
    text-align: left;
    margin-bottom: 4px;
    transition: background 0.1s;
  }
  .clear-btn:hover { background: rgba(239,68,68,0.1); }

  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 48px 16px;
    gap: 8px;
    color: var(--color-text-muted);
    text-align: center;
  }
  .empty-icon { font-size: 28px; }
  .empty p { font-size: 12px; margin: 0; }

  .entry {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 8px;
    width: 100%;
    text-align: left;
    transition: background 0.1s;
    color: var(--color-text-primary);
  }
  .entry:hover { background: var(--color-elevated); }

  .entry-favicon { flex-shrink: 0; object-fit: contain; border-radius: 2px; }
  .entry-globe { font-size: 14px; flex-shrink: 0; width: 16px; text-align: center; }

  .entry-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .entry-title {
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .entry-url {
    font-size: 10px;
    color: var(--color-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .remove-btn {
    width: 22px; height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    opacity: 0;
    flex-shrink: 0;
    cursor: pointer;
    transition: opacity 0.1s, background 0.1s, color 0.1s;
  }
  .entry:hover .remove-btn { opacity: 1; }
  .remove-btn:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

  .entry-time {
    font-size: 10px;
    color: var(--color-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
