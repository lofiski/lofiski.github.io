import { shallowRef, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

/*
 * needle is a paper-first system — warm paper is the ground and ink is the
 * mark — so 'light' is the default and 'dark' is the opt-in ink mode.
 */
function read(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  }
  catch {
    // Storage can be unavailable (private mode / blocked cookies)
    return 'light'
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
