import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/HomePage.vue'),
      meta: { title: '' },
    },
    {
      path: '/blog',
      component: () => import('@/pages/BlogPage.vue'),
      meta: { title: 'Blog' },
    },
    {
      path: '/blog/:slug',
      component: () => import('@/pages/PostPage.vue'),
      meta: { title: '' },
    },
    {
      path: '/projects',
      component: () => import('@/pages/ProjectsPage.vue'),
      meta: { title: 'Projects' },
    },
    {
      path: '/photos',
      component: () => import('@/pages/PhotosPage.vue'),
      meta: { title: 'Photos' },
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

export default router
