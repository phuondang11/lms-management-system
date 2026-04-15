<script setup lang="ts">
import { computed, ref } from 'vue'
import { useClassStore } from '@/stores/classsStore'
import { useRouter } from 'vue-router'
import BaseTable from '@/components/ui/table/BaseTable.vue'
const router = useRouter()
// ===== STORE =====
const { classes } = useClassStore()

// ===== SEARCH =====
const search = ref('')

const teachers = ref([
  { id: 1, name: 'Thầy An' },
  { id: 2, name: 'Cô Bình' },
])

const columns = [
  { key: 'name', label: 'Tên lớp' },
  { key: 'year', label: 'Niên khóa' },
  { key: 'count', label: 'Sỉ số' },
  { key: 'teacher', label: 'Giáo viên' },
  { key: 'actions', label: 'Hành động' },
]

const getTeacherName = (id: number | string) => {
  return teachers.value.find((t) => t.id == id)?.name || 'N/A'
}

const goToDetail = (id: number) => {
  router.push(`/classes/${id}`)
}

const filteredClasses = computed(() => {
  const keyword = search.value.toLowerCase()

  return classes.value.filter(
    (c) => c.name.toLowerCase().includes(keyword) || c.year.toLowerCase().includes(keyword),
  )
})

// ===== PAGINATION =====
const currentPage = ref(1)
const perPage = 5

const totalPages = computed(() => Math.ceil(filteredClasses.value.length / perPage))

const paginatedClasses = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredClasses.value.slice(start, start + perPage)
})
</script>

<template>
  <div>
    <!-- FILTER -->
    <div class="bg-white rounded-xl border p-4 mb-6">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-1 h-5 bg-blue-500 rounded"></div>
        <h2 class="font-semibold text-gray-800">Class Search</h2>
      </div>

      <input
        v-model="search"
        type="text"
        placeholder="Tìm lớp..."
        class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
      />
    </div>

    <!-- TABLE -->
    <div class="bg-white rounded-xl border overflow-hidden">
      <!-- TITLE -->
      <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div class="flex items-center gap-2">
          <div class="w-1 h-5 bg-green-500 rounded"></div>
          <h2 class="font-semibold text-gray-800">DANH SÁCH LỚP</h2>
        </div>

        <span class="text-sm text-gray-500"> {{ filteredClasses.length }} lớp </span>
      </div>

      <!-- TABLE -->
      <BaseTable :columns="columns" :data="paginatedClasses">
        <!-- NAME -->
        <template #name="{ row: cls }">
          <div class="font-medium text-blue-900">
            {{ cls.name }}
          </div>
        </template>

        <!-- YEAR -->
        <template #year="{ row: cls }">
          <div class="text-center">
            {{ cls.year }}
          </div>
        </template>

        <!-- COUNT -->
        <template #count="{ row: cls }">
          <div class="text-center font-medium">
            {{ cls.students?.length || 0 }}
          </div>
        </template>

        <!-- TEACHER -->
        <template #teacher="{ row: cls }">
          <div class="text-center">
            {{ getTeacherName(cls.teacherId) }}
          </div>
        </template>

        <!-- ACTION -->
        <template #actions="{ row: cls }">
          <div class="flex justify-center">
            <button
              @click="goToDetail(cls.id)"
              class="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition text-sm"
            >
              Xem
            </button>
          </div>
        </template>
      </BaseTable>

      <!-- EMPTY -->
      <div v-if="filteredClasses.length === 0" class="text-center py-8 text-gray-400">
        Không có lớp nào
      </div>
    </div>
  </div>
</template>
