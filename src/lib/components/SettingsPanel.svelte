<script lang="ts">
  import { settings, showSettings } from '../stores';
  import type { BrowserSettings } from '../types';

  const ACCENTS: Array<{ key: BrowserSettings['accent']; color: string; label: string }> = [
    { key: 'violet', color: '#6366f1', label: 'Violet' },
    { key: 'indigo', color: '#818cf8', label: 'Indigo' },
    { key: 'blue',   color: '#3b82f6', label: 'Blue'   },
    { key: 'cyan',   color: '#06b6d4', label: 'Cyan'   },
    { key: 'green',  color: '#22c55e', label: 'Green'  },
    { key: 'amber',  color: '#f59e0b', label: 'Amber'  },
    { key: 'rose',   color: '#f43f5e', label: 'Rose'   },
    { key: 'purple', color: '#a855f7', label: 'Purple' },
  ];

  const ENGINES = [
    { key: 'brave',      label: 'Brave Search', url: 'search.brave.com' },
    { key: 'google',     label: 'Google',       url: 'google.com' },
    { key: 'duckduckgo', label: 'DuckDuckGo',   url: 'duckduckgo.com' },
    { key: 'bing',       label: 'Bing',         url: 'bing.com' },
  ] as const;

  function close() { showSettings.set(false); }

  function handleOverlay(e: MouseEvent) {
    if ((e.target as HTMLElement).classList.contains('overlay')) close();
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="overlay" on:click={handleOverlay} on:keydown={() => {}} role="dialog" aria-modal="true" tabindex="-1">
  <div class="panel" style="animation: fadeIn 0.18s ease;">
    <div class="panel-header">
      <h2 class="panel-title">Settings</h2>
      <button class="icon-btn" on:click={close} type="button" aria-label="Close settings">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>

    <div class="panel-body">
      <section class="section">
        <h3 class="section-title">Appearance</h3>
        <div class="field">
          <span class="field-label">Theme</span>
          <div class="btn-group" role="group" aria-label="Theme">
            {#each ['dark', 'light', 'system'] as t}
              <button
                class="choice-btn"
                class:active={$settings.theme === t}
                on:click={() => settings.patch({ theme: t as BrowserSettings['theme'] })}
                type="button"
              >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
            {/each}
          </div>
        </div>

        <div class="field">
          <span class="field-label">Accent color</span>
          <div class="accent-grid">
            {#each ACCENTS as a}
              <button
                class="accent-dot"
                class:active={$settings.accent === a.key}
                style="background: {a.color}"
                on:click={() => settings.patch({ accent: a.key })}
                title={a.label}
                type="button"
              >
                {#if $settings.accent === a.key}
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <div class="field">
          <span class="field-label">Density</span>
          <div class="btn-group" role="group" aria-label="Density">
            {#each ['comfortable', 'compact'] as d}
              <button
                class="choice-btn"
                class:active={$settings.density === d}
                on:click={() => settings.patch({ density: d as BrowserSettings['density'] })}
                type="button"
              >{d.charAt(0).toUpperCase() + d.slice(1)}</button>
            {/each}
          </div>
        </div>

        <div class="field">
          <span class="field-label">New tab background</span>
          <div class="btn-group" role="group" aria-label="New tab background">
            {#each ['gradient', 'solid'] as bg}
              <button
                class="choice-btn"
                class:active={$settings.newTabBackground === bg}
                on:click={() => settings.patch({ newTabBackground: bg as BrowserSettings['newTabBackground'] })}
                type="button"
              >{bg.charAt(0).toUpperCase() + bg.slice(1)}</button>
            {/each}
          </div>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">Search & Navigation</h3>
        <div class="field">
          <span class="field-label">Search engine</span>
          <div class="engines">
            {#each ENGINES as e}
              <button
                class="engine-btn"
                class:active={$settings.searchEngine === e.key}
                on:click={() => settings.patch({ searchEngine: e.key })}
                type="button"
              >
                <span class="engine-label">{e.label}</span>
                <span class="engine-url">{e.url}</span>
              </button>
            {/each}
          </div>
        </div>
      </section>

      <section class="section">
        <h3 class="section-title">Privacy</h3>
        <p class="privacy-note">
          Bookmarks and history are stored locally in your browser only.
          No data is sent to external servers.
        </p>
      </section>
    </div>
  </div>
</div>

<style>
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    backdrop-filter: blur(4px);
  }

  .panel {
    width: 420px;
    max-width: 95vw;
    max-height: 80vh;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
  }

  .panel-title { font-size: 15px; font-weight: 600; margin: 0; }

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

  .panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .section { display: flex; flex-direction: column; gap: 14px; }
  .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-muted); margin: 0; }

  .field { display: flex; flex-direction: column; gap: 8px; }
  .field-label { font-size: 12px; color: var(--color-text-secondary); font-weight: 500; }

  .btn-group {
    display: flex;
    gap: 4px;
    background: var(--color-elevated);
    padding: 3px;
    border-radius: 8px;
    width: fit-content;
  }

  .choice-btn {
    padding: 5px 14px;
    border-radius: 6px;
    font-size: 12px;
    color: var(--color-text-secondary);
    transition: background 0.1s, color 0.1s;
  }
  .choice-btn.active {
    background: var(--color-surface);
    color: var(--color-text-primary);
    font-weight: 500;
    box-shadow: var(--shadow-sm);
  }

  .accent-grid {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .accent-dot {
    width: 28px; height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s, box-shadow 0.1s;
    border: 2px solid transparent;
  }
  .accent-dot:hover { transform: scale(1.1); }
  .accent-dot.active { border-color: white; box-shadow: 0 0 0 2px rgba(255,255,255,0.3); }

  .engines {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .engine-btn {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1.5px solid var(--color-border);
    transition: border-color 0.1s, background 0.1s;
    text-align: left;
  }
  .engine-btn.active { border-color: var(--color-accent); background: var(--color-accent-muted); }
  .engine-btn:hover:not(.active) { background: var(--color-elevated); }

  .engine-label { font-size: 13px; font-weight: 500; }
  .engine-url { font-size: 11px; color: var(--color-text-muted); }

  .privacy-note {
    font-size: 12px;
    color: var(--color-text-secondary);
    line-height: 1.6;
    background: var(--color-elevated);
    padding: 12px;
    border-radius: 8px;
    margin: 0;
  }
</style>
