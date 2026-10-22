<script lang="ts">
  import { tabs } from '../stores';
  import { createTab, closeTab, activateTab } from '../browser';
  import type { Tab } from '../types';

  async function handleClose(e: MouseEvent, id: string) {
    e.stopPropagation();
    await closeTab(id);
  }

  function getTitle(tab: Tab) {
    const t = tab.title || 'New Tab';
    return t.length > 20 ? t.slice(0, 20) + '…' : t;
  }
</script>

<div class="tab-bar" data-tauri-drag-region>
  <div class="tabs-scroll">
    {#each $tabs as tab (tab.id)}
      <button
        class="tab"
        class:active={tab.isActive}
        class:loading={tab.loading}
        class:pinned={tab.pinned}
        on:click={() => activateTab(tab.id)}
        title={tab.title}
        type="button"
      >
        <span class="tab-icon">
          {#if tab.loading}
            <span class="spinner" aria-label="Loading"></span>
          {:else if tab.favicon}
            <img src={tab.favicon} alt="" width="14" height="14" class="favicon" />
          {:else if tab.url === 'jeh://newtab'}
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
          {:else}
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.3"/><path d="M4.5 7h5M7 4.5v5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
          {/if}
        </span>
        {#if !tab.pinned}
          <span class="tab-title">{getTitle(tab)}</span>
        {/if}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="tab-close"
          role="button"
          tabindex="-1"
          aria-label="Close tab"
          on:click|stopPropagation={(e) => handleClose(e, tab.id)}
          on:keydown={(e) => e.key === 'Enter' && handleClose(e as unknown as MouseEvent, tab.id)}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 2l8 8M10 2L2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </span>
      </button>
    {/each}
  </div>

  <button
    class="btn-icon new-tab-btn"
    on:click={() => createTab()}
    title="New tab (Ctrl+T)"
    type="button"
  >
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v12M1 7h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  </button>
</div>

<style>
  .tab-bar {
    height: 38px;
    display: flex;
    align-items: flex-end;
    padding: 0 8px;
    gap: 4px;
    overflow: hidden;
  }

  .tabs-scroll {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    flex: 1;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    padding-bottom: 0;
  }
  .tabs-scroll::-webkit-scrollbar { display: none; }

  .tab {
    display: flex;
    align-items: center;
    gap: 5px;
    height: 30px;
    padding: 0 8px;
    border-radius: 8px 8px 0 0;
    color: var(--color-text-secondary);
    white-space: nowrap;
    flex-shrink: 0;
    min-width: 88px;
    max-width: 180px;
    position: relative;
    transition: background 0.12s, color 0.12s;
  }
  .tab:hover { background: var(--color-elevated); color: var(--color-text-primary); }
  .tab.active { background: var(--color-base); color: var(--color-text-primary); }
  .tab.pinned { min-width: 36px; max-width: 36px; padding: 0 10px; justify-content: center; }

  .tab-icon { display: flex; align-items: center; justify-content: center; flex-shrink: 0; width: 14px; }
  .favicon { width: 14px; height: 14px; object-fit: contain; border-radius: 2px; }

  .spinner {
    width: 11px; height: 11px;
    border: 1.5px solid var(--color-active);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    display: block;
  }

  .tab-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11.5px;
    font-weight: 500;
  }

  .tab-close {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    opacity: 0;
    flex-shrink: 0;
    transition: opacity 0.1s, background 0.1s, color 0.1s;
    cursor: pointer;
  }
  .tab:hover .tab-close,
  .tab.active .tab-close { opacity: 1; }
  .tab-close:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

  .btn-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-muted);
    flex-shrink: 0;
    transition: background 0.12s, color 0.12s;
  }
  .btn-icon:hover { background: var(--color-elevated); color: var(--color-text-primary); }
  .new-tab-btn { align-self: center; margin-bottom: 2px; }
</style>
