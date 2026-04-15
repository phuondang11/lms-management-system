<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { useStudentStore } from '@/stores/studentStore'
import type { Student } from '@/stores/studentStore'
import { useToast } from 'vue-toastification'
import { h } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import BaseTable from '@/components/ui/table/BaseTable.vue'

const auth = useAuthStore()
const toast = useToast()

const newStudentID = ref<number | null>(null)

// ===== STORE =====
const store = useStudentStore()
const students = computed(() => store.students.value)
const goToTrash = () => {
  router.push('/classes/trash')
}
// ===== ROUTER =====
const router = useRouter()

// ===== STATS =====
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
}

// ===== AVG SCORE =====
const getAvgScore = (scores?: any) => {
  if (!scores) return 0
  return Math.round((scores.literature + scores.math + scores.english) / 3)
}

// ===== ABSENT COUNT =====
const getAbsentCount = (attendance?: Record<string, string>) => {
  if (!attendance) return 0
  return Object.values(attendance).filter((v) => v === 'absent' || v === 'permission').length
}

// Present count
const getPresentCount = (attendance?: Record<string, string>) => {
  if (!attendance) return 0
  return Object.values(attendance).filter((v) => v === 'present').length
}

// ===== MODAL =====
const selectedStudent = ref<Student | null>(null)

const openModal = (stu: Student) => {
  selectedStudent.value = stu
}

// ===== NAV =====
const goToEdit = (id: number) => {
  router.push(`/classes/student/${id}/edit`)
}

// ===== FILTER / SORT =====
const filterStatus = ref<'all' | 'active' | 'pause' | 'drop'>('all')
const sortBy = ref<'none' | 'score' | 'attendance'>('none')

// ===== HIGHLIGHT =====
const isWeak = (stu: any) => {
  const score = getAvgScore(stu.scores)
  const percent = getStats(stu.attendance).percent
  return score < 5 || percent < 70
}

// ===== SEARCH + PAGINATION =====
const search = ref('')
const currentPage = ref(1)
const perPage = 20

// ===== MAIN PROCESS =====
const processedStudents = computed(() => {
  let list = [...students.value]

  // ✅ SEARCH (FIX THIẾU)
  if (search.value) {
    const keyword = search.value.toLowerCase()
    list = list.filter((stu) => stu.name?.toLowerCase().includes(keyword))
  }

  // FILTER
  if (filterStatus.value !== 'all') {
    list = list.filter((stu) => getStatus(stu.attendance) === filterStatus.value)
  }

  // SORT
  if (sortBy.value === 'score') {
    list.sort((a, b) => getAvgScore(b.scores) - getAvgScore(a.scores))
  }

  if (sortBy.value === 'attendance') {
    list.sort((a, b) => getStats(b.attendance).percent - getStats(a.attendance).percent)
  }

  return list
})

// PAGINATION
const totalPages = computed(() => Math.ceil(processedStudents.value.length / perPage))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return processedStudents.value.slice(start, start + perPage)
})

const avatarColors = [
  'bg-red-100 text-red-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-yellow-100 text-yellow-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
  'bg-indigo-100 text-indigo-600',
]

const columns = [
  { key: 'avatar', label: 'Hình ảnh' },
  { key: 'name', label: 'Họ tên' },
  { key: 'birthYear', label: 'Năm sinh' },
  { key: 'address', label: 'Sinh sống' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'score', label: 'Điểm TB' },
  { key: 'actions', label: 'Hành động' },
]

const getAvatarColor = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

// ===== MODAL ADD STUDENT =====
const showAddModal = ref(false)

const newStudent = ref({
  name: '',
  birthYear: '',
  address: '',
})

// VALIDATE
const isValid = computed(() => {
  return newStudent.value.name && newStudent.value.birthYear && newStudent.value.address
})

// CREATE
const addStudent = () => {
  if (!isValid.value) return

  const id = Date.now()
  newStudentID.value = id
  store.setStudentData(id, {
    name: newStudent.value.name,
    birthYear: Number(newStudent.value.birthYear),
    address: newStudent.value.address,
    scores: {
      literature: 0,
      math: 0,
      english: 0,
    },
    attendance: {},
  })

  // 👉 NHẢY TỚI TRANG CUỐI
  setTimeout(() => {
    currentPage.value = totalPages.value
  }, 0)

  // 👉 RESET FORM
  newStudent.value = {
    name: '',
    birthYear: '',
    address: '',
  }

  showAddModal.value = false

  // 👉 TOAST
  toast.success('Thêm học sinh thành công 🎉')
}

// ===== DELETE =====
const showDeleteModal = ref(false)
const deletingStudent = ref<Student | null>(null)

const openDeleteModal = (stu: Student) => {
  deletingStudent.value = stu
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (!deletingStudent.value) return

  const removed = store.deleteStudent(deletingStudent.value.id)
  if (!removed) return

  const removedId = removed.id

  toast(
    h('div', { class: 'flex items-center justify-between gap-4 w-full' }, [
      h('span', { class: 'text-sm text-white text-gray-700' }, 'Đã xóa học sinh'),

      h(
        'button',
        {
          class: `
            px-3 py-1.5
            text-sm font-medium
            text-white
            bg-green-600
            rounded-lg
            shadow-sm
            transition-all
            hover:bg-green-500
            active:scale-95
          `,
          onClick: () => {
            store.restoreStudent(removedId)
            toast.success('Đã khôi phục học sinh')
          },
        },
        'Khôi phục',
      ),
    ]),
    {
      timeout: 5000,
    },
  )

  showDeleteModal.value = false
}

if (currentPage.value > totalPages.value) {
  currentPage.value = totalPages.value || 1
}

watch([search, filterStatus], () => {
  currentPage.value = 1
})
</script>

<template>
  <!-- HEADER -->
  <!-- fix here -->
  <div class="bg-white rounded-xl border p-4 mb-6 shadow-sm">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- LEFT -->
      <div>
        <h2 class="text-lg md:text-xl font-semibold text-gray-800">Lớp 1A</h2>

        <p class="text-sm text-gray-500">Niên khóa 2024-2025 • {{ students.length }} học sinh</p>
      </div>

      <!-- RIGHT -->
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
        <!-- TRASH -->
        <button
          v-if="!auth.isStudent()"
          @click="goToTrash"
          class="w-full sm:w-auto px-4 py-2 border border-red-500 rounded-lg bg-red-500 text-white hover:bg-white hover:text-red-500 transition flex items-center justify-center gap-2"
        >
          Học sinh đã xóa
          <span class="px-2 py-0.5 text-xs bg-white text-red-600 rounded-full font-medium">
            {{ store.deletedStudents.value.length }}
          </span>
        </button>

        <!-- ADD -->
        <button
          v-if="!auth.isStudent()"
          @click="showAddModal = true"
          class="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition flex items-center justify-center gap-2"
        >
          + Thêm học sinh
        </button>
      </div>
    </div>
  </div>
  <!-- fix here -->

  <!-- ✅ SEARCH GIỐNG STUDENTS -->
  <div class="bg-white rounded-xl border p-4 mb-6 shadow-sm">
    <div class="flex items-center gap-2 mb-3">
      <div class="w-1 h-5 bg-blue-500 rounded"></div>
      <h2 class="font-semibold text-gray-800">Student Search & Filter</h2>
    </div>

    <!-- RESPONSIVE GRID -->
    <div class="flex flex-col md:flex-row gap-3">
      <!-- SEARCH -->
      <input
        v-model="search"
        type="text"
        placeholder="Tìm kiếm học sinh... (Tên)"
        class="w-full md:flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400 focus:bg-white transition"
      />

      <!-- FILTER -->
      <select
        v-model="filterStatus"
        class="w-full md:w-[160px] px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-400 transition"
      >
        <option value="all">Tất cả</option>
        <option value="active">Đang học</option>
        <option value="pause">Bảo lưu</option>
        <option value="drop">Đã nghỉ</option>
      </select>

      <!-- SORT -->
      <select
        v-model="sortBy"
        class="w-full md:w-[160px] px-4 py-2 border border-gray-200 rounded-lg bg-white text-sm hover:border-blue-400 focus:ring-2 focus:ring-blue-400 transition"
      >
        <option value="none">Sắp xếp</option>
        <option value="score">Điểm cao</option>
        <option value="attendance">Chuyên cần</option>
      </select>
    </div>
  </div>

  <!-- TABLE -->
  <BaseTable :columns="columns" :data="paginatedStudents">
    <!-- AVATAR -->
    <template #avatar="{ row: stu }">
      <div
        :class="[
          'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm mx-auto',
          getAvatarColor(stu.name),
        ]"
      >
        {{ stu.name.charAt(0).toUpperCase() }}
      </div>
    </template>

    <!-- NAME -->
    <template #name="{ row: stu }">
      <div class="font-medium text-blue-900">
        {{ stu.name }}
        <span v-if="isWeak(stu)" class="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
          Yếu
        </span>
      </div>
    </template>

    <!-- BIRTH YEAR -->
    <template #birthYear="{ row: stu }">
      <div class="text-center">{{ stu.birthYear }}</div>
    </template>

    <!-- ADDRESS -->
    <template #address="{ row: stu }">
      <div class="text-center">{{ stu.address }}</div>
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
      <div class="text-center font-semibold text-blue-600">
        {{ getAvgScore(stu.scores) }}
      </div>
    </template>

    <!-- ACTIONS -->
    <template #actions="{ row: stu }">
      <div class="flex justify-center gap-2">
        <button @click="openModal(stu)" class="p-2 rounded-lg hover:bg-gray-100">
          <Eye class="w-4 h-4 text-gray-600" />
        </button>

        <button
          v-if="!auth.isStudent()"
          @click="goToEdit(stu.id)"
          class="p-2 rounded-lg hover:bg-blue-100"
        >
          <Pencil class="w-4 h-4 text-blue-600" />
        </button>

        <button
          v-if="!auth.isStudent()"
          @click="openDeleteModal(stu)"
          class="p-2 rounded-lg hover:bg-red-100"
        >
          <Trash2 class="w-4 h-4 text-red-600" />
        </button>
      </div>
    </template>
  </BaseTable>

  <!-- PAGINATION -->
  <div class="flex justify-end items-center gap-2 mt-6">
    <button
      @click="currentPage--"
      :disabled="currentPage === 1"
      class="w-9 h-9 flex items-center justify-center rounded-lg border bg-white hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-30"
    >
      ←
    </button>

    <div class="px-3 py-1 text-sm font-medium bg-gray-100 rounded-lg">
      {{ currentPage }} / {{ totalPages }}
    </div>

    <button
      @click="currentPage++"
      :disabled="currentPage === totalPages"
      class="w-9 h-9 flex items-center justify-center rounded-lg border bg-white hover:bg-blue-50 hover:text-blue-600 transition disabled:opacity-30"
    >
      →
    </button>
  </div>

  <!-- MODAL (GIỮ NGUYÊN) -->
  <div
    v-if="selectedStudent"
    class="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
  >
    <div class="bg-white w-[520px] rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
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
          <p class="text-sm text-gray-500">Năm sinh {{ selectedStudent.birthYear }}</p>
        </div>
      </div>

      <!-- INFO GRID -->
      <div class="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p class="text-gray-400">Địa chỉ</p>
          <p class="font-medium text-gray-700">
            {{ selectedStudent.address }}
          </p>
        </div>

        <div>
          <p class="text-gray-400">Điểm trung bình</p>
          <p class="font-semibold text-blue-600 text-lg">
            {{ getAvgScore(selectedStudent.scores) }}
          </p>
        </div>
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

  <transition name="modal">
    <div
      v-if="showAddModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white w-[500px] rounded-2xl shadow-2xl p-6 relative animate-modal">
        <!-- CLOSE -->
        <button
          @click="showAddModal = false"
          class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
        >
          ✕
        </button>

        <!-- TITLE -->
        <h2 class="text-lg font-semibold mb-5 text-gray-800">Thêm học sinh mới</h2>

        <!-- FORM -->
        <div class="space-y-4">
          <!-- NAME -->
          <div>
            <label class="text-sm text-gray-500">Họ và tên</label>
            <input
              v-model="newStudent.name"
              class="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="Nguyễn Văn A"
            />
          </div>

          <!-- YEAR -->
          <div>
            <label class="text-sm text-gray-500">Năm sinh</label>
            <input
              v-model="newStudent.birthYear"
              type="number"
              class="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="2010"
            />
          </div>

          <!-- ADDRESS -->
          <div>
            <label class="text-sm text-gray-500">Sinh sống tại</label>
            <input
              v-model="newStudent.address"
              class="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
              placeholder="TP.HCM"
            />
          </div>
        </div>

        <!-- ACTION -->
        <div class="flex justify-end gap-2 mt-6">
          <button @click="showAddModal = false" class="px-4 py-2 rounded-lg border">Hủy</button>

          <button
            @click="addStudent"
            :disabled="!isValid"
            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500 shadow-sm transition"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  </transition>

  <transition name="modal">
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-black/30 flex items-center justify-center px-4 z-50"
    >
      <div class="bg-white w-[420px] rounded-2xl shadow-2xl p-6 modal-box">
        <!-- TITLE -->
        <h2 class="text-lg font-semibold text-gray-800 mb-3">Xóa học sinh</h2>

        <!-- CONTENT -->
        <p class="text-sm text-gray-600 mb-5">
          Bạn có chắc muốn xóa
          <span class="font-semibold text-red-600">
            {{ deletingStudent?.name }}
          </span>
          không?
        </p>

        <!-- ACTION -->
        <div class="flex justify-end gap-2">
          <button @click="showDeleteModal = false" class="px-4 py-2 border rounded-lg">Hủy</button>

          <button
            @click="confirmDelete"
            class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>
