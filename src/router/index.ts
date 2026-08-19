import { createRouter, createWebHashHistory } from 'vue-router'
import { siteConfig } from '@/config/site'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/HomePage.vue'),
    },
    {
      path: '/blog',
      component: () => import('@/pages/BlogPage.vue'),
      meta: { title: '博客' },
    },
    {
      // Title is set by PostPage once the frontmatter resolves
      path: '/blog/:slug',
      component: () => import('@/pages/PostPage.vue'),
    },
    {
      path: '/projects',
      component: () => import('@/pages/ProjectsPage.vue'),
      meta: { title: '项目' },
    },
    {
      path: '/photos',
      component: () => import('@/pages/PhotosPage.vue'),
      meta: { title: '照片' },
    },
    {
      path: '/guestbook',
      component: () => import('@/pages/GuestbookPage.vue'),
      meta: { title: '留言板' },
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/pages/NotFoundPage.vue'),
      meta: { title: '404' },
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

/** `meta.title` was declared but never applied — the tab title stayed static on every route. */
export function setDocumentTitle(pageTitle?: string) {
  document.title = pageTitle ? `${pageTitle} · ${siteConfig.name}` : siteConfig.name
}

router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  // Post pages resolve their own title asynchronously; don't stomp it here
  if (title !== undefined || !to.path.startsWith('/blog/')) setDocumentTitle(title)
})

export default router
