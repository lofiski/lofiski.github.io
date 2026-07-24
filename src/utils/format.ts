/** Date formatting helpers — shared by post cards, post pages, photos and guestbook. */

/** 2026年3月24日 */
export function formatDateLong(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

/** 2026-03-24 */
export function formatDateShort(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr)
    .toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .replace(/\//g, '-')
}
