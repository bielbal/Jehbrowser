<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { settings, activeTab } from '../stores';
  import { navigate } from '../browser';

  let time = '';
  let greeting = '';
  let searchQuery = '';
  let interval: ReturnType<typeof setInterval>;

  const QUICK_LINKS = [
    { label: 'GitHub', url: 'https://github.com', icon: '⚡' },
    { label: 'YouTube', url: 'https://youtube.com', icon: '▶' },
    { label: 'Twitter', url: 'https://x.com', icon: '✕' },
    { label: 'Reddit', url: 'https://reddit.com', icon: '⊛' },
    { label: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'Y' },
    { label: 'MDN', url: 'https://developer.mozilla.org', icon: '⊙' },
  ];

  function updateTime() {
    const d = new Date();
    time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const h = d.getHours();
    greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }

  onMount(() => { updateTime(); interval = setInterval(updateTime, 1000); });
  onDestroy(() => clearInterval(interval));

  async function handleSearch(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchQuery.trim() && $activeTab) {
      await navigate($activeTab.id, searchQuery);
      searchQuery = '';
    }
  }

  async function openLink(url: string) {
    if ($activeTab) await navigate($activeTab.id, url);
  }
</script>

<div class="newtab" class:gradient={$settings.newTabBackground === 'gradient'}>
  <div class="newtab-content">
    <div class="clock">{time}</div>
    <p class="greeting">{greeting}</p>

    <div class="search-wrap">
      <svg class="search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.4"/>
        <path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
      </svg>
      <input
        bind:value={searchQuery}
        class="search-input"
        type="text"
        placeholder="Search the web..."
        on:keydown={handleSearch}
        autocomplete="off"
        spellcheck="false"
      />
    </div>

    <div class="quick-links">
      {#each QUICK_LINKS as link}
        <button class="quick-link" on:click={() => openLink(link.url)} type="button">
          <span class="quick-link-icon">{link.icon}</span>
          <span class="quick-link-label">{link.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .newtab {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-base);
  }

  .newtab.gradient {
    background: radial-gradient(ellipse 80% 60% at 50% 30%,
      color-mix(in srgb, var(--color-accent) 12%, transparent),
      transparent 70%),
      var(--color-base);
  }

  .newtab-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 24px;
    animation: fadeIn 0.4s ease;
  }

  .clock {
    font-size: 72px;
    font-weight: 300;
    letter-spacing: -2px;
    color: var(--color-text-primary);
    line-height: 1;
  }

  .greeting {
    font-size: 16px;
    color: var(--color-text-secondary);
    font-weight: 400;
    margin: 0;
  }

  .search-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 500px;
    max-width: 90vw;
    height: 48px;
    background: var(--color-surface);
    border: 1.5px solid var(--color-border);
    border-radius: 100px;
    padding: 0 16px;
    transition: border-color 0.15s, box-shadow 0.15s;
  }

  .search-wrap:focus-within {
    border-color: var(--color-accent);
    box-shadow: 0 0 0 3px var(--color-accent-muted);
  }

  .search-icon { color: var(--color-text-muted); flex-shrink: 0; }

  .search-input {
    flex: 1;
    font-size: 14px;
    color: var(--color-text-primary);
  }
  .search-input::placeholder { color: var(--color-text-muted); }

  .quick-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: center;
    max-width: 560px;
  }

  .quick-link {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 12px;
    width: 80px;
    border-radius: 12px;
    transition: background 0.12s;
    color: var(--color-text-secondary);
  }
  .quick-link:hover { background: var(--color-elevated); color: var(--color-text-primary); }

  .quick-link-icon {
    width: 36px;
    height: 36px;
    background: var(--color-elevated);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: background 0.12s;
  }
  .quick-link:hover .quick-link-icon { background: var(--color-active); }

  .quick-link-label { font-size: 11px; font-weight: 500; }
</style>
