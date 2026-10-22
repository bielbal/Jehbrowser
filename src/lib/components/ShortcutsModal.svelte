<script lang="ts">
  import { showShortcuts } from '../stores';

  const SHORTCUTS = [
    { keys: ['Ctrl', 'T'],     label: 'New tab' },
    { keys: ['Ctrl', 'W'],     label: 'Close tab' },
    { keys: ['Ctrl', 'R'],     label: 'Reload' },
    { keys: ['Ctrl', 'L'],     label: 'Focus address bar' },
    { keys: ['Ctrl', 'D'],     label: 'Bookmark page' },
    { keys: ['Ctrl', ','],     label: 'Open settings' },
    { keys: ['Ctrl', '?'],     label: 'Keyboard shortcuts' },
    { keys: ['Alt', '←'],      label: 'Go back' },
    { keys: ['Alt', '→'],      label: 'Go forward' },
    { keys: ['Ctrl', '1–9'],   label: 'Switch to tab N' },
  ];

  function close() { showShortcuts.set(false); }

  function handleKey(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKey} />

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="overlay"
  on:click={(e) => { if ((e.target as HTMLElement).classList.contains('overlay')) close(); }}
  on:keydown={() => {}}
  role="dialog"
  aria-modal="true"
  aria-label="Keyboard shortcuts"
  tabindex="-1"
>
  <div class="modal" style="animation: fadeIn 0.18s ease;">
    <div class="modal-header">
      <h2 class="modal-title">Keyboard Shortcuts</h2>
      <button class="icon-btn" on:click={close} type="button" aria-label="Close shortcuts">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </div>
    <div class="modal-body">
      {#each SHORTCUTS as s}
        <div class="shortcut-row">
          <span class="shortcut-label">{s.label}</span>
          <span class="shortcut-keys">
            {#each s.keys as key, i}
              {#if i > 0}<span class="plus">+</span>{/if}
              <kbd>{key}</kbd>
            {/each}
          </span>
        </div>
      {/each}
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

  .modal {
    width: 340px;
    max-width: 95vw;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 18px 14px;
    border-bottom: 1px solid var(--color-border);
  }

  .modal-title { font-size: 14px; font-weight: 600; margin: 0; }

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

  .modal-body {
    padding: 8px;
  }

  .shortcut-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 10px;
    border-radius: 7px;
    transition: background 0.1s;
  }
  .shortcut-row:hover { background: var(--color-elevated); }

  .shortcut-label {
    font-size: 12.5px;
    color: var(--color-text-primary);
  }

  .shortcut-keys {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 22px;
    padding: 0 6px;
    background: var(--color-elevated);
    border: 1px solid var(--color-border);
    border-radius: 5px;
    font-family: inherit;
    font-size: 11px;
    font-weight: 500;
    color: var(--color-text-secondary);
    box-shadow: 0 1px 0 var(--color-border);
  }

  .plus {
    font-size: 10px;
    color: var(--color-text-muted);
  }
</style>
