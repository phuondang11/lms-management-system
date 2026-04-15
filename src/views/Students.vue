<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye } from 'lucide-vue-next'
import BaseTable from '@/components/ui/table/BaseTable.vue'
import { useStudentStore } from '@/stores/studentStore'
import type { Student } from '@/stores/studentStore'

// ===== STORE =====
const store = useStudentStore()
const students = computed(() => store.students.value)

// ===== SEARCH =====
const search = ref('')

// ===== SCORE =====
const getAvgScore = (scores?: any) => {
  if (!scores) return 0
  return Math.round((scores.literature + scores.math + scores.english) / 3)
}

// ===== ATTENDANCE STATS =====
const getStats = (attendance?: Record<string, string>) => {
  if (!attendance) return { percent: 0 }

  let total = 0
  let present = 0

  Object.values(attendance).forEach((v) => {
    if (!v) return
    total++
    if (v === 'present') present++
  })

  return {
    percent: total ? Math.round((present / total) * 100) : 0,
  }
}

// ===== STATUS =====
const getStatus = (attendance?: Record<string, string>) => {
  const percent = getStats(attendance).percent

  if (percent >= 90) return 'active'
  if (percent >= 70) return 'pause'
  return 'drop'
}

const formatStatus = (s: string) => {
  if (s === 'active') return 'Đang học'
  if (s === 'pause') return 'Bảo lưu'
  if (s === 'drop') return 'Đã nghỉ'
  return ''
}

// ===== COUNT =====
const getAbsentCount = (attendance?: Record<string, string>) => {
  if (!attendance) return 0
  return Object.values(attendance).filter((v) => v === 'absent' || v === 'permission').length
}

const getPresentCount = (attendance?: Record<string, string>) => {
  if (!attendance) return 0
  return Object.values(attendance).filter((v) => v === 'present').length
}

// ===== FILTER (TOP STUDENTS >= 8) =====
const filteredStudents = computed(() => {
  const keyword = search.value.toLowerCase()

  return students.value.filter((stu) => {
    const avg = getAvgScore(stu.scores)

    return avg >= 8 && stu.name?.toLowerCase().includes(keyword)
  })
})

// ===== PAGINATION =====
const currentPage = ref(1)
const perPage = 10

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / perPage))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredStudents.value.slice(start, start + perPage)
})

watch(search, () => (currentPage.value = 1))

// ===== MODAL =====
const selectedStudent = ref<Student | null>(null)

const openModal = (stu: Student) => {
  selectedStudent.value = stu
}

// ===== COLUMNS =====
const columns = [
  { key: 'name', label: 'HỌ TÊN' },
  { key: 'birthYear', label: 'NĂM SINH' },
  { key: 'address', label: 'SINH SỐNG' },
  { key: 'status', label: 'TRẠNG THÁI' },
  { key: 'score', label: 'ĐIỂM TB' },
  { key: 'actions', label: 'HÀNH ĐỘNG' },
]
</script>

<template>
  <div>
    <!-- FILTER -->
    <div class="bg-white rounded-xl border p-4 mb-6 shadow-sm">
      <div class="flex items-center gap-2 mb-3">
        <div class="w-1 h-5 bg-blue-500 rounded"></div>
        <h2 class="font-semibold text-gray-800">Top Students (≥ 8 điểm)</h2>
      </div>

      <input
        v-model="search"
        type="text"
        placeholder="Tìm học sinh..."
        class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
      />
    </div>

    <!-- TABLE -->
    <div class="bg-white rounded-xl border overflow-hidden">
      <!-- HEADER -->
      <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <h2 class="font-semibold text-gray-800">DANH SÁCH HỌC SINH GIỎI</h2>

        <span class="text-sm text-gray-500"> {{ filteredStudents.length }} học sinh </span>
      </div>

      <!-- BASE TABLE -->
      <BaseTable :columns="columns" :data="paginatedStudents">
        <!-- NAME -->
        <template #name="{ row: stu }">
          <div class="font-medium text-blue-900">
            {{ stu.name }}
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

        <!-- STATUS -->
        <template #status="{ row: stu }">
          <div class="flex flex-col items-center gap-1">
            <span class="text-blue-600 font-semibold text-sm">
              {{ getStats(stu.attendance).percent }}%
            </span>

            <span
              :class="[
                'px-2 py-0.5 rounded text-xs font-medium',
                getStatus(stu.attendance) === 'active' && 'bg-green-100 text-green-600',
                getStatus(stu.attendance) === 'pause' && 'bg-yellow-100 text-yellow-600',
                getStatus(stu.attendance) === 'drop' && 'bg-red-100 text-red-600',
              ]"
            >
              {{ formatStatus(getStatus(stu.attendance)) }}
            </span>
          </div>
        </template>

        <!-- SCORE -->
        <template #score="{ row: stu }">
          <div class="text-center font-semibold text-green-600">
            {{ getAvgScore(stu.scores) }}
          </div>
        </template>

        <!-- ACTION -->
        <template #actions="{ row: stu }">
          <div class="flex justify-center">
            <button
              @click="openModal(stu)"
              class="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
            >
              <Eye class="w-4 h-4" />
            </button>
          </div>
        </template>
      </BaseTable>

      <!-- PAGINATION -->
      <div class="flex justify-end items-center gap-2 mt-6 px-4 pb-4">
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
    </div>
  </div>

  <!-- MODAL (GIỐNG CLASSDETAIL) -->
  <!-- VIEW MODAL -->
  <div
    v-if="selectedStudent"
    class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
  >
    <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
      <!-- CLOSE -->
      <button
        @click="selectedStudent = null"
        class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
      >
        ✕
      </button>

      <!-- HEADER -->
      <div class="flex items-center gap-4 mb-5">
        <div
          class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg"
        >
          {{ selectedStudent.name?.charAt(0) }}
        </div>

        <div>
          <h2 class="text-lg font-semibold text-gray-800">
            {{ selectedStudent.name }}
          </h2>
          <p class="text-sm text-gray-500">Năm sinh {{ selectedStudent.birthYear || '—' }}</p>
        </div>
      </div>

      <!-- INFO -->
      <div class="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p class="text-gray-400">Địa chỉ</p>
          <p class="font-medium text-gray-700">
            {{ selectedStudent.address || '—' }}
          </p>
        </div>

        <div>
          <p class="text-gray-400">Điểm trung bình</p>
          <p class="font-semibold text-blue-600 text-lg">
            {{ getAvgScore(selectedStudent.scores) }}
          </p>
        </div>
      </div>

      <!-- STATUS -->
      <div class="mb-4 text-center">
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium',
            getStatus(selectedStudent.attendance) === 'active' && 'bg-green-100 text-green-600',
            getStatus(selectedStudent.attendance) === 'pause' && 'bg-yellow-100 text-yellow-600',
            getStatus(selectedStudent.attendance) === 'drop' && 'bg-red-100 text-red-600',
          ]"
        >
          {{ formatStatus(getStatus(selectedStudent.attendance)) }}
        </span>
      </div>

      <!-- SCORES -->
      <div class="bg-gray-50 rounded-xl p-4 mb-4">
        <p class="text-sm font-semibold mb-3 text-gray-700">Điểm các môn</p>

        <div class="grid grid-cols-3 gap-3 text-center">
          <div class="bg-white p-3 rounded-lg border shadow-sm">
            <p class="text-gray-400 text-xs">Văn</p>
            <p class="font-bold text-blue-600 text-lg">
              {{ selectedStudent.scores?.literature || 0 }}
            </p>
          </div>

          <div class="bg-white p-3 rounded-lg border shadow-sm">
            <p class="text-gray-400 text-xs">Toán</p>
            <p class="font-bold text-green-600 text-lg">
              {{ selectedStudent.scores?.math || 0 }}
            </p>
          </div>

          <div class="bg-white p-3 rounded-lg border shadow-sm">
            <p class="text-gray-400 text-xs">Anh</p>
            <p class="font-bold text-purple-600 text-lg">
              {{ selectedStudent.scores?.english || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- ATTENDANCE -->
      <div
        class="flex items-center justify-between bg-red-50 px-4 py-3 mb-3 rounded-lg border border-red-100"
      >
        <span class="text-sm text-gray-600">Số buổi nghỉ</span>
        <span class="font-bold text-red-600 text-lg">
          {{ getAbsentCount(selectedStudent.attendance) }} buổi
        </span>
      </div>

      <div
        class="flex items-center justify-between bg-green-50 px-4 py-3 rounded-lg border border-green-100"
      >
        <span class="text-sm text-gray-600">Số buổi đi học</span>
        <span class="font-bold text-green-600 text-lg">
          {{ getPresentCount(selectedStudent.attendance) }} buổi
        </span>
      </div>

      <!-- FOOTER -->
      <div class="flex justify-end mt-6">
        <button
          @click="selectedStudent = null"
          class="px-5 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>
