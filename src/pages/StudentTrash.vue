<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStudentStore } from '@/stores/studentStore'
import { useToast } from 'vue-toastification'
import BaseTable from '@/components/ui/table/BaseTable.vue'

const store = useStudentStore()
const router = useRouter()
const toast = useToast()

// ===== SEARCH =====
const search = ref('')

// MODAL
const showDeleteModal = ref(false)
const showRestoreModal = ref(false)

// PAGINATION
const currentPage = ref(1)
const itemsPerPage = 5

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredStudents.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / itemsPerPage))

const confirmRestore = () => {
  selected.value.forEach((id) => store.restoreStudent(id))
  toast.success(`Đã khôi phục ${selected.value.length} học sinh `)
  selected.value = []
  showRestoreModal.value = false
}

const confirmDelete = () => {
  store.deletedStudents.value = store.deletedStudents.value.filter(
    (s) => !selected.value.includes(s.id),
  )
  toast.error(`Đã xóa vĩnh viễn ${selected.value.length} học sinh `)
  selected.value = []
  showDeleteModal.value = false
}

const filteredStudents = computed(() => {
  const keyword = search.value.toLowerCase()
  return store.deletedStudents.value.filter((s) => s.name.toLowerCase().includes(keyword))
})

// ===== CHECKBOX =====
const selected = ref<number[]>([])

const isAllSelected = computed(
  () =>
    filteredStudents.value.length > 0 &&
    filteredStudents.value.every((s) => selected.value.includes(s.id)),
)

const toggleAll = () => {
  if (isAllSelected.value) {
    selected.value = []
  } else {
    selected.value = filteredStudents.value.map((s) => s.id)
  }
}

// ===== ACTION =====
const restoreSelected = () => {
  selected.value.forEach((id) => store.restoreStudent(id))

  toast.success(`Đã khôi phục ${selected.value.length} học sinh ✅`)

  selected.value = []
}

const deleteSelected = () => {
  store.deletedStudents.value = store.deletedStudents.value.filter(
    (s) => !selected.value.includes(s.id),
  )

  toast.error(`Đã xóa vĩnh viễn ${selected.value.length} học sinh 🗑️`)

  selected.value = []
}

const columns = [
  { key: 'select', label: '' },
  { key: 'name', label: 'Học sinh' },
  { key: 'birthYear', label: 'Năm sinh' },
  { key: 'address', label: 'Sinh sống' },
  { key: 'class', label: 'Lớp' },
]

watch(search, () => {
  currentPage.value = 1
})
</script>

<template>
  <!-- HEADER -->
  <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h2 class="text-base md:text-lg font-semibold text-gray-800">
        🗑️ Học sinh đã xóa ({{ store.deletedStudents.value.length }})
      </h2>

      <div class="flex flex-wrap gap-2">
        <button
          @click="router.push('/classes/1')"
          class="px-3 py-2 text-sm border rounded-lg bg-white hover:bg-gray-50"
        >
          ← Quay về
        </button>

        <button
          @click="toggleAll"
          :disabled="filteredStudents.length === 0"
          class="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-40"
        >
          {{ isAllSelected ? 'Bỏ chọn' : 'Chọn tất cả' }}
        </button>

        <button
          @click="showRestoreModal = true"
          :disabled="selected.length === 0"
          class="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 disabled:opacity-40"
        >
          Khôi phục
        </button>

        <button
          @click="showDeleteModal = true"
          :disabled="selected.length === 0"
          class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 disabled:opacity-40"
        >
          Xóa
        </button>
      </div>
    </div>
  </div>

  <!-- SEARCH -->
  <div class="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
    <input
      v-model="search"
      type="text"
      placeholder="Tìm học sinh..."
      class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
    />
  </div>

  <!-- TABLE -->
  <div class="bg-white rounded-xl border overflow-hidden">
    <BaseTable :columns="columns" :data="paginatedStudents">
      <!-- CHECKBOX -->
      <template #select="{ row: stu }">
        <input type="checkbox" :value="stu.id" v-model="selected" />
      </template>

      <!-- NAME -->
      <template #name="{ row: stu }">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
            :class="stu.avatarColor"
          >
            {{ stu.name.charAt(0) }}
          </div>

          <span class="font-medium text-blue-900">
            {{ stu.name }}
          </span>
        </div>
      </template>

      <!-- BIRTH -->
      <template #birthYear="{ row: stu }">
        <div class="text-center">
          {{ stu.birthYear }}
        </div>
      </template>

      <!-- ADDRESS -->
      <template #address="{ row: stu }">
        <div class="text-center">
          {{ stu.address }}
        </div>
      </template>

      <!-- CLASS -->
      <template #class="{ row: stu }">
        <div class="text-center">
          {{ stu.className || '—' }}
        </div>
      </template>
    </BaseTable>

    <!-- EMPTY -->
    <div v-if="filteredStudents.length === 0" class="text-center py-10 text-gray-400">
      Không có học sinh nào
    </div>
  </div>

  <div class="flex justify-end items-center gap-2 mt-6">
    <button
      @click="currentPage--"
      :disabled="currentPage === 1"
      class="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-gray-100 disabled:opacity-30"
    >
      ←
    </button>

    <span class="text-sm text-gray-600"> {{ currentPage }} / {{ totalPages }} </span>

    <button
      @click="currentPage++"
      :disabled="currentPage === totalPages"
      class="w-9 h-9 flex items-center justify-center rounded-lg border hover:bg-gray-100 disabled:opacity-30"
    >
      →
    </button>
  </div>

  <transition name="modal">
    <div
      v-if="showRestoreModal"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    >
      <div class="bg-white w-[400px] rounded-2xl p-6 shadow-xl modal-box">
        <h2 class="text-lg font-semibold mb-3">Khôi phục học sinh</h2>

        <p class="text-sm text-gray-600 mb-5">
          Bạn có chắc muốn khôi phục {{ selected.length }} học sinh?
        </p>

        <div class="flex justify-end gap-2">
          <button @click="showRestoreModal = false" class="px-4 py-2 border rounded-lg">Hủy</button>

          <button
            @click="confirmRestore"
            class="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500"
          >
            Khôi phục
          </button>
        </div>
      </div>
    </div>
  </transition>

  <transition name="modal">
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
    >
      <div class="bg-white w-[400px] rounded-2xl p-6 shadow-xl modal-box">
        <h2 class="text-lg font-semibold text-red-600 mb-3">Xóa vĩnh viễn</h2>

        <p class="text-sm text-gray-600 mb-5">
          Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa
          {{ selected.length }} học sinh?
        </p>

        <div class="flex justify-end gap-2">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg">Hủy</button>

          <button
            @click="confirmDelete"
            class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
