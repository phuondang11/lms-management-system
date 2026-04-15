<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, ref, onMounted } from 'vue'
import { Menu, LayoutDashboard, Users, BookOpen, ChevronRight, School2 } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const uiStore = useUIStore()
const auth = useAuthStore()

const openMenus = ref<string[]>([])

const toggleMenu = (name: string) => {
  if (openMenus.value.includes(name)) {
    openMenus.value = openMenus.value.filter((n) => n !== name)
  } else {
    openMenus.value.push(name)
  }
}

const menu = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'School', path: '/students', icon: School2 },
  {
    name: 'Lớp học',
    path: '/classes',
    icon: Users,
    isGroup: true,
    children: [
      {
        name: 'Tạo lớp học mới',
        path: '/classes/create',
        roles: ['admin', 'teacher'],
      },
    ],
  },
  { name: 'Lessons', path: '/lessons', icon: BookOpen },
]

const isActive = (item: any) => {
  if (item.path === '/classes') {
    return route.path.startsWith('/classes')
  } else {
    return route.path === item.path
  }
}

const handleMenuClick = (item: any) => {
  if (item.children) {
    toggleMenu(item.name)
    router.push(item.path)
  } else {
    router.push(item.path)
  }

  // ✅ auto close mobile
  if (window.innerWidth < 1024) {
    uiStore.isSidebarOpen = false
  }
}

const filteredMenu = computed(() => {
  return menu.map((item) => {
    if (!item.children) return item

    const children = item.children.filter((child) => {
      if (!child.roles) return true
      return child.roles.includes(auth.user.value?.role || '')
    })

    return {
      ...item,
      children,
    }
  })
})

onMounted(() => {
  if (route.path.startsWith('/classes') && !openMenus.value.includes('Lớp học')) {
    openMenus.value.push('Lớp học')
  }
})
</script>

<template>
  <aside
    :class="[
      'fixed top-0 left-0 h-[100dvh] bg-gray-900 text-gray-300 p-4 z-50',
      'transition-[width,transform] duration-300 ease-in-out',

      // width
      uiStore.isSidebarOpen ? 'w-64' : 'w-20',

      // mobile slide
      uiStore.isSidebarOpen ? 'translate-x-0' : '-translate-x-full',

      // desktop luôn hiện
      'lg:translate-x-0',
    ]"
  >
    <!-- HEADER -->
    <div
      :class="[
        'flex items-center mb-8',
        uiStore.isSidebarOpen ? 'justify-between' : 'justify-center',
      ]"
    >
      <!-- LOGO -->
      <span
        :class="[
          'text-xl font-bold text-white transition-all duration-300',
          uiStore.isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
        ]"
      >
        LMS
      </span>

      <!-- TOGGLE -->
      <button @click="uiStore.toggleSidebar">
        <Menu class="w-7 h-7 border border-gray-600 rounded p-1" />
      </button>
    </div>

    <!-- MENU -->
    <nav class="flex flex-col gap-2">
      <div v-for="item in filteredMenu" :key="item.name">
        <!-- PARENT -->
        <div
          @click="handleMenuClick(item)"
          class="flex items-center justify-between px-4 py-2 rounded-lg transition-all duration-200 group cursor-pointer"
          :class="[
            isActive(item)
              ? 'bg-gray-800 text-white border-l-4 border-blue-500 pl-3'
              : 'hover:bg-gray-800 hover:text-white',
          ]"
        >
          <!-- LEFT -->
          <div
            :class="[
              'flex items-center gap-3 relative group',
              !uiStore.isSidebarOpen && 'justify-center w-full',
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 shrink-0" />

            <!-- TEXT -->
            <span
              :class="[
                'transition-all duration-300',
                uiStore.isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden',
              ]"
            >
              {{ item.name }}
            </span>

            <!-- TOOLTIP (khi collapse) -->
            <span
              v-if="!uiStore.isSidebarOpen"
              class="absolute left-full ml-2 px-2 py-1 text-xs bg-black text-white rounded opacity-0 group-hover:opacity-100 whitespace-nowrap"
            >
              {{ item.name }}
            </span>
          </div>

          <!-- ARROW -->
          <ChevronRight
            v-if="!auth.isStudent() && uiStore.isSidebarOpen && item.children"
            class="w-4 h-4 transition-all duration-200"
            :class="[openMenus.includes(item.name) ? 'rotate-90 text-white' : 'text-gray-400']"
          />
        </div>

        <!-- CHILDREN -->
        <transition name="slide">
          <div
            v-if="item.children && openMenus.includes(item.name) && uiStore.isSidebarOpen"
            class="ml-8 mt-1 flex flex-col gap-1"
          >
            <router-link
              v-for="child in item.children"
              :key="child.path"
              :to="child.path"
              class="px-3 py-2 rounded-lg text-sm transition-all duration-200"
              :class="[
                isActive(child)
                  ? 'bg-blue-100 text-blue-600 font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white',
              ]"
            >
              {{ child.name }}
            </router-link>
          </div>
        </transition>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateY(-5px);
}
.slide-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
