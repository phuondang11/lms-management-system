<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed, ref } from 'vue'
import { Bell, HelpCircle, Settings, LogOut } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/authStore'

const showDropdown = ref(false)
const auth = useAuthStore()
const uiStore = useUIStore()

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const logout = () => {
  auth.logout()
  window.location.href = '/login'
}

const route = useRoute()

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/attendance': 'Attendance',
  '/scores': 'Scores',
  '/lessons': 'Lessons',
}

const pageTitle = computed(() => {
  return titleMap[route.path] || 'Dashboard'
})
</script>

<template>
  <header class="h-16 flex items-center justify-between bg-white border-b px-4 md:px-6">
    <!-- LEFT -->
    <div class="flex items-center gap-4">
      <!-- ✅ HAMBURGER (QUAN TRỌNG) -->
      <button class="lg:hidden text-2xl" @click="uiStore.isSidebarOpen = true">☰</button>

      <!-- TITLE -->
      <div class="flex flex-col">
        <h2 class="text-lg font-semibold">{{ pageTitle }}</h2>

        <!-- Ẩn trên mobile -->
        <p class="sm:block text-sm text-gray-500">Good morning, Francis!</p>
      </div>
    </div>

    <!-- RIGHT -->
    <div class="flex items-center gap-2 md:gap-4">
      <!-- Notification -->
      <button class="relative">
        <div
          class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <Bell class="w-5 h-5 text-gray-700" />
        </div>

        <span
          class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] bg-red-500 text-white rounded-full"
        >
          3
        </span>
      </button>

      <!-- Help (ẩn mobile) -->
      <button class="hidden sm:block">
        <div
          class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <HelpCircle class="w-5 h-5 text-gray-700" />
        </div>
      </button>

      <!-- Settings (ẩn mobile + tablet nhỏ) -->
      <button class="hidden md:block">
        <div
          class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition"
        >
          <Settings class="w-5 h-5 text-gray-700" />
        </div>
      </button>

      <!-- Avatar -->
      <div class="relative">
        <div
          @click="toggleDropdown"
          class="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold cursor-pointer shadow hover:scale-105 transition"
        >
          A
        </div>

        <!-- DROPDOWN -->
        <transition name="dropdown">
          <div
            v-if="showDropdown"
            class="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg overflow-hidden z-50"
          >
            <button
              @click="logout"
              class="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition"
            >
              <LogOut class="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </transition>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
}

.dropdown-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
