<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import Header from '@/components/layout/Header.vue'
import { useUIStore } from '@/stores/ui.store'

const uiStore = useUIStore()
</script>

<template>
  <div class="h-[100dvh] bg-gray-100">
    <!-- SIDEBAR -->
    <Sidebar />

    <!-- OVERLAY (mobile) -->
    <div
      v-if="uiStore.isSidebarOpen"
      @click="uiStore.isSidebarOpen = false"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
    />

    <!-- MAIN CONTENT -->
    <div
      :class="[
        'flex flex-col h-full transition-all duration-300',

        // Desktop spacing theo sidebar
        uiStore.isSidebarOpen ? 'lg:ml-64' : 'lg:ml-20',
      ]"
    >
      <!-- HEADER -->
      <Header />

      <!-- CONTENT -->
      <main class="flex-1 overflow-y-auto p-4 md:p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
