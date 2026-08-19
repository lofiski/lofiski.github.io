import { shallowRef, watch } from 'vue'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'

function read(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'light' ? 'light' : 'dark'
  }
  catch {
    // Storage can be unavailable (private mode / blocked cookies)
    return 'dark'
  }
}

/*
 * Module-level state, shared by every caller. This used to be a Pinia store,
 * which meant shipping a state-management library for a single string.
 *
 * The initial value is *not* applied to <html> here: the inline script in
 * index.html already did that before first paint, so re-applying would be a
 * redundant write on every boot.
 */
const theme = shallowRef<Theme>(read())

watch(theme, (t) => {
  document.documentElement.setAttribute('data-theme', t)
  try {
    localStorage.setItem(STORAGE_KEY, t)
  }
  catch { /* ignore — the theme still applies for this session */ }
})

function toggle() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
}

export function useTheme() {
  return { theme, toggle }
}
