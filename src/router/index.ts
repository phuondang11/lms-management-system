import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Students from '@/views/Students.vue'
import { useAuthStore } from '@/stores/authStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/pages/Login.vue'),
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: Dashboard,
        },

        // ===== STUDENTS (GLOBAL - giữ lại nếu cần)
        {
          path: 'students',
          name: 'Students',
          component: Students,
        },

        // ===== CLASSES ROOT =====
        {
          path: 'classes',
          children: [
            {
              path: '',
              name: 'Classes',
              component: () => import('@/pages/Classes.vue'),
            },

            {
              path: 'create',
              name: 'CreateClass',
              component: () => import('@/pages/CreateClass.vue'),
            },

            {
              path: 'trash',
              name: 'StudentTrash',
              component: () => import('@/pages/StudentTrash.vue'),
            },

            {
              path: ':id',
              name: 'ClassDetail',
              component: () => import('@/pages/ClassDetail.vue'),
            },

            // ===== STUDENT (NESTED TRONG CLASS) =====
            {
              path: 'student/:id/edit',
              name: 'StudentEdit',
              component: () => import('@/pages/StudentEdit.vue'),
            },
          ],
        },
      ],
    },
  ],
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (!auth.user.value && to.path !== '/login') {
    return next('/login')
  }
  next()
})

export default router
