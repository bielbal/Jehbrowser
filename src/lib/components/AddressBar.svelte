<script lang="ts">
  import { activeTab, sidebarPanel, bookmarks as bmStore, showSettings } from '../stores';
  import { navigate, goBack, goForward, reload, stopLoad, isSecure } from '../browser';
  import { bookmarks } from '../stores';

  let inputValue = '';
  let focused = false;
  let inputEl: HTMLInputElement;

  $: if ($activeTab && !focused) {
    inputValue = $activeTab.url === 'jeh://newtab' ? '' : $activeTab.url;
  }

  $: isBookmarked = $activeTab ? bmStore.has($activeTab.url) : false;
  $: secure = $activeTab ? isSecure($activeTab.url) : 'internal' as const;
  $: loading = $activeTab?.loading ?? false;

  function handleFocus() {
    focused = true;
    inputValue = $activeTab?.url === 'jeh://newtab' ? '' : ($activeTab?.url ?? '');
    setTimeout(() => inputEl?.select(), 0);
  }

  function handleBlur() {
    focused = false;
    if ($activeTab) inputValue = $activeTab.url === 'jeh://newtab' ? '' : $activeTab.url;
  }

  async function submit() {
    if (!$activeTab || !inputValue.trim()) return;
    inputEl?.blur();
    await navigate($activeTab.id, inputValue);
  }

  function toggleBookmark() {
    if (!$activeTab || $activeTab.url === 'jeh://newtab') return;
    if (isBookmarked) {
      const bm = $bmStore.find(b => b.url === $activeTab!.url);
      if (bm) bookmarks.remove(bm.id);
    } else {
      bookmarks.add({ url: $activeTab.url, title: $activeTab.title, favicon: $activeTab.favicon });
    }
  }

  function toggleSidebar(panel: 'bookmarks' | 'history') {
    sidebarPanel.update(p => p === panel ? 'none' : panel);
  }

  $: secureLabel = secure === 'secure' ? 'Connection secure' : secure === 'internal' ? 'Jeh Browser' : 'Connection not secure';
</script>

<div class="nav-bar">
  <div class="nav-left">
    <button
      class="nav-btn"
      disabled={!$activeTab?.canGoBack}
      on:click={() => $activeTab && goBack($activeTab.id)}
      title="Back (Alt+←)"
      type="button"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button
      class="nav-btn"
      disabled={!$activeTab?.canGoForward}
      on:click={() => $activeTab && goForward($activeTab.id)}
      title="Forward (Alt+→)"
      type="button"
    >
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button
      class="nav-btn"
      on:click={() => $activeTab && (loading ? stopLoad($activeTab.id) : reload($activeTab.id))}
      title={loading ? 'Stop' : 'Reload (Ctrl+R)'}
      type="button"
    >
      {#if loading}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="6" height="6" rx="1.5" fill="currentColor"/></svg>
      {:else}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 8A5 5 0 1 1 8 3c1.5 0 2.8.66 3.73 1.7M13 3v3h-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      {/if}
    </button>
  </div>

  <div class="address-pill" class:focused>
    <button
      class="security-badge"
      class:secure={secure === 'secure'}
      class:insecure={secure === 'insecure'}
      class:internal={secure === 'internal'}
      title={secureLabel}
      type="button"
    >
      {#if secure === 'secure'}
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><rect x="2.5" y="6" width="9" height="6.5" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M4.5 6V4.5a2.5 2.5 0 1 1 5 0V6" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>
      {:else if secure === 'insecure'}
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.2"/><path d="M7 4.5v3M7 9.2v.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
      {:else}
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1.5l5.2 2.85v3.3c0 3.1-2.2 6-5.2 6.85-3-0.85-5.2-3.75-5.2-6.85v-3.3z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>
      {/if}
    </button>

    <!-- svelte-ignore a11y-autofocus -->
    <input
      bind:this={inputEl}
      bind:value={inputValue}
      class="address-input"
      type="text"
      placeholder="Search or enter address"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      autofocus
      on:focus={handleFocus}
      on:blur={handleBlur}
      on:keydown={(e) => { if (e.key === 'Enter') submit(); else if (e.key === 'Escape') inputEl?.blur(); }}
    />

    <button
      class="pill-btn"
      class:bookmarked={isBookmarked}
      on:click={toggleBookmark}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark (Ctrl+D)'}
      type="button"
    >
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 2h8a1 1 0 0 1 1 1v9.5l-4.5-2.7L3 12.5V3a1 1 0 0 1 1-1z"
          stroke={isBookmarked ? 'var(--color-accent)' : 'currentColor'}
          stroke-width="1.2"
          stroke-linejoin="round"
          fill={isBookmarked ? 'var(--color-accent)' : 'none'}
        />
      </svg>
    </button>
  </div>

  <div class="nav-right">
    <button class="nav-btn" on:click={() => toggleSidebar('bookmarks')} title="Bookmarks" type="button">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
    </button>
    <button class="nav-btn" on:click={() => toggleSidebar('history')} title="History" type="button">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M8 5.5v3l2 1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    </button>
    <button class="nav-btn" on:click={() => showSettings.set(true)} title="Settings (Ctrl+,)" type="button">
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.3"/><path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.3 1.3M11.3 11.3l1.3 1.3M3.4 12.6l1.3-1.3M11.3 4.7l1.3-1.3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    </button>
  </div>
</div>

<style>
  .nav-bar {
    height: 50px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 12px;
  }

  .nav-left, .nav-right {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  .nav-btn {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
    transition: background 0.12s, color 0.12s;
  }
  .nav-btn:hover:not(:disabled) { background: var(--color-elevated); color: var(--color-text-primary); }
  .nav-btn:disabled { opacity: 0.35; cursor: default; }

  .address-pill {
    flex: 1;
    height: 36px;
    background: var(--color-elevated);
    border-radius: 100px;
    border: 1.5px solid transparent;
    display: flex;
    align-items: center;
    padding: 0 6px 0 10px;
    gap: 6px;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }
  .address-pill.focused {
    background: var(--color-base);
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-muted);
  }

  .security-badge {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--color-text-muted);
    transition: background 0.1s, color 0.1s;
  }
  .security-badge.secure  { color: #22c55e; }
  .security-badge.insecure { color: #f59e0b; }
  .security-badge.internal { color: var(--color-accent); }
  .security-badge:hover { background: var(--color-active); }

  .address-input {
    flex: 1;
    font-size: 13px;
    font-weight: 400;
    color: var(--color-text-primary);
    min-width: 0;
  }
  .address-input::placeholder { color: var(--color-text-muted); }

  .pill-btn {
    width: 26px;
    height: 26px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: background 0.1s, color 0.1s;
  }
  .pill-btn:hover { background: var(--color-active); color: var(--color-text-primary); }
  .pill-btn.bookmarked { color: var(--color-accent); }
</style>
