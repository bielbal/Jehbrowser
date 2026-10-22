<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { tabs, activeTab, settings, showSettings, showShortcuts, sidebarPanel } from '$lib/stores';
  import { createTab, activateTab, closeTab, goBack, goForward, reload, stopLoad, setupEvents } from '$lib/browser';
  import TabBar from '$lib/components/TabBar.svelte';
  import AddressBar from '$lib/components/AddressBar.svelte';
  import NewTabPage from '$lib/components/NewTabPage.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import SettingsPanel from '$lib/components/SettingsPanel.svelte';
  import ShortcutsModal from '$lib/components/ShortcutsModal.svelte';

  let cleanupEvents: (() => void) | undefined;

  onMount(async () => {
    cleanupEvents = setupEvents();
    if ($tabs.length === 0) await createTab();
  });

  onDestroy(() => cleanupEvents?.());

  function handleKeydown(e: KeyboardEvent) {
    const ctrl = e.ctrlKey || e.metaKey;
    if (ctrl && e.key === 't') { e.preventDefault(); createTab(); }
    else if (ctrl && e.key === 'w') { e.preventDefault(); if ($activeTab) closeTab($activeTab.id); }
    else if ((ctrl && e.key === 'r') || e.key === 'F5') { e.preventDefault(); if ($activeTab) reload($activeTab.id); }
    else if (ctrl && e.key === 'l') { e.preventDefault(); document.querySelector<HTMLInputElement>('.address-input')?.focus(); }
    else if (ctrl && e.shiftKey && e.key === 'B') { e.preventDefault(); settings.patch({ showBookmarksBar: !$settings.showBookmarksBar }); }
    else if (ctrl && e.key === ',') { e.preventDefault(); showSettings.set(true); }
    else if (ctrl && e.key === '?') { e.preventDefault(); showShortcuts.update(v => !v); }
    else if (e.altKey && e.key === 'ArrowLeft')  { e.preventDefault(); if ($activeTab) goBack($activeTab.id); }
    else if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); if ($activeTab) goForward($activeTab.id); }
    else if (ctrl && e.key >= '1' && e.key <= '9') {
      e.preventDefault();
      const idx = parseInt(e.key) - 1;
      const t = $tabs[idx];
      if (t) activateTab(t.id);
    }
  }

  $: isNewTab = !$activeTab || $activeTab.url === 'jeh://newtab';
  $: compact = $settings.density === 'compact';
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="browser-shell" class:compact>
  <div class="chrome">
    <TabBar />
    <AddressBar />
  </div>

  <div class="content-area">
    {#if isNewTab}
      <NewTabPage />
    {/if}

    {#if $sidebarPanel !== 'none'}
      <Sidebar />
    {/if}
  </div>

  {#if $showSettings}
    <SettingsPanel />
  {/if}

  {#if $showShortcuts}
    <ShortcutsModal />
  {/if}
</div>

<style>
  .browser-shell {
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 100vh;
    background: var(--color-base);
    overflow: hidden;
  }

  .chrome {
    flex-shrink: 0;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    z-index: 10;
  }

  .content-area {
    flex: 1;
    display: flex;
    overflow: hidden;
    position: relative;
  }
</style>
