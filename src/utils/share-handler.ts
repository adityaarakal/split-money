/**
 * Share Handler Utility
 * 
 * Handles shared content from other apps via Web Share Target API
 */

export interface SharedData {
  title?: string;
  text?: string;
  url?: string;
}

/**
 * Get shared data from URL parameters (Share Target API)
 */
export function getSharedData(): SharedData | null {
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get('title');
  const text = urlParams.get('text');
  const url = urlParams.get('url');

  if (!title && !text && !url) {
    return null;
  }

  return {
    title: title || undefined,
    text: text || undefined,
    url: url || undefined,
  };
}

/**
 * Check if current page was opened via share target
 */
export function isShareTarget(): boolean {
  return window.location.search.includes('action=share');
}

/**
 * Clear share data from URL
 */
export function clearShareData(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('action');
  url.searchParams.delete('title');
  url.searchParams.delete('text');
  url.searchParams.delete('url');
  window.history.replaceState({}, '', url.toString());
}
