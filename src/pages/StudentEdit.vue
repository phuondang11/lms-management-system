<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'
import { useStudentStore } from '@/stores/studentStore'

// ===== CONFIG =====
const BASE_YEAR = 2026
const FAKE_TODAY = new Date(`${BASE_YEAR}-04-07`)

// ===== ROUTE =====
const route = useRoute()
const studentId = Number(route.params.id)

// ===== STORE =====
const store = useStudentStore()
const { setStudentData, getStudent } = store

// ===== TAB =====
const activeTab = ref<'score' | 'attendance'>('attendance')

// ===== STUDENT =====
const student = ref({
  id: studentId,
  name: '',
  birthYear: '',
  address: '',
  avatar: '',
})

// ===== SCORE =====
const scores = ref({
  literature: 8,
  math: 9,
  english: 7,
})

// ===== DATE KEY =====
const toKey = (date: Date) => {
  return date.toLocaleDateString('en-CA')
}

// ===== RANDOM =====
const randomStatus = (rate: number) => {
  return Math.random() < rate ? 'present' : 'absent'
}

// ===== INIT ATTENDANCE =====
const initAttendance = () => {
  const result: Record<string, string> = {}

  const start = new Date(`${BASE_YEAR}-01-01`)
  const end = new Date(`${BASE_YEAR}-12-31`)
  const current = new Date(start)

  while (current <= end) {
    const day = current.getDay()

    if (day >= 1 && day <= 5) {
      const key = toKey(current)
      const month = current.getMonth() + 1

      if (month >= 1 && month <= 6) {
        result[key] = randomStatus(0.8)
      } else {
        if (current <= FAKE_TODAY) {
          result[key] = randomStatus(0.95)
        }
      }

      current.setDate(current.getDate() + 1)
    }

    return result
  }
}
// ===== ATTENDANCE =====
const attendance = ref<Record<string, string>>(initAttendance())

// LOAD FROM STORE
const existing = getStudent(studentId)

if (existing) {
  student.value = {
    id: existing.id,
    name: existing.name || '',
    birthYear: existing.birthYear || '',
    address: existing.address || '',
    avatar: existing.avatar || '',
  }

  scores.value = existing.scores || scores.value
  attendance.value = existing.attendance || attendance.value
}

// ===== STATS =====
const stats = computed(() => {
  let total = 0
  let present = 0
  let absent = 0

  Object.values(attendance.value).forEach((val) => {
    if (!val) return

    total++

    if (val === 'present') present++
    if (val === 'absent' || val === 'permission') absent++
  })

  const percent = total === 0 ? 0 : Math.round((present / total) * 100)

  return {
    total,
    present,
    absent,
    percent,
  }
})

// ===== STATUS =====
const studentStatus = computed(() => {
  const p = stats.value.percent

  if (p >= 90) return 'active'
  if (p >= 70) return 'pause'
  return 'drop'
})

const formatStudentStatus = (s: string) => {
  if (s === 'active') return 'Đang học'
  if (s === 'pause') return 'Bảo lưu'
  if (s === 'drop') return 'Đã nghỉ'
  return ''
}

// ===== MONTHS =====
const months = Array.from({ length: 12 }, (_, i) => new Date(BASE_YEAR, i, 1))

// ===== CURRENT MONTH =====
const currentMonthIndex = ref(FAKE_TODAY.getMonth())

// ===== GET DAYS =====
const getDaysInMonth = (month: Date) => {
  const days: Date[] = []
  const date = new Date(month.getFullYear(), month.getMonth(), 1)

  while (date.getMonth() === month.getMonth()) {
    const day = date.getDay()

    if (day >= 1 && day <= 5) {
      days.push(new Date(date))
    }

    date.setDate(date.getDate() + 1)
  }

  return days
}

// ===== FORMAT =====
const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
  })
}

const formatDay = (date: Date) => {
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  return days[date.getDay()]
}

// ===== TODAY =====
const isToday = (date: Date) => {
  return toKey(date) === toKey(FAKE_TODAY)
}

// ===== NAVIGATION =====
const prevMonth = () => {
  if (currentMonthIndex.value > 0) currentMonthIndex.value--
}

const nextMonth = () => {
  if (currentMonthIndex.value < 11) currentMonthIndex.value++
}

// ===== STYLE =====
const getAttendanceClass = (date: Date) => {
  const val = attendance.value[toKey(date)]

  if (val === 'present') return 'bg-green-50 text-green-600 border-green-200'
  if (val === 'absent') return 'bg-red-50 text-red-600 border-red-200'
  if (val === 'permission') return 'bg-yellow-50 text-yellow-600 border-yellow-200'

  return 'bg-gray-50 text-gray-500 border-gray-200'
}

// ===== SAVE =====
const save = () => {
  setStudentData(studentId, {
    name: student.value.name,
    birthYear: Number(student.value.birthYear),
    address: student.value.address,
    avatar: student.value.avatar,
    scores: scores.value,
    attendance: attendance.value,
  })

  console.log('Saved full data ✅')
}
</script>

<template>
  <!-- HEADER -->
  <!-- PROFILE -->
  <div class="bg-white border border-gray-200 rounded-xl p-4 md:p-5 mb-6 shadow-sm">
    <div class="flex flex-col md:flex-row gap-4 md:items-center">
      <!-- AVATAR -->
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-4">
          <!-- AVATAR -->
          <div
            class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden"
          >
            <img v-if="student.avatar" :src="student.avatar" class="w-full h-full object-cover" />
            <span v-else class="text-blue-600 font-bold">
              {{ student.name?.charAt(0) || '?' }}
            </span>
          </div>

          <!-- FILE INPUT -->
          <label
            class="px-3 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm"
          >
            Chọn ảnh
            <input type="file" accept="image/*" class="hidden" @change="handleUpload" />
          </label>
        </div>
      </div>

      <!-- INFO -->
      <div class="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- NAME -->
        <div class="space-y-1">
          <label class="text-xs text-gray-500">Họ tên</label>
          <input
            v-model="student.name"
            class="w-full border border-gray-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>

        <!-- BIRTH -->
        <div class="space-y-1">
          <label class="text-xs text-gray-500">Năm sinh</label>
          <input
            v-model="student.birthYear"
            type="number"
            class="w-full border border-gray-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>

        <!-- ADDRESS -->
        <div class="space-y-1">
          <label class="text-xs text-gray-500">Sinh sống</label>
          <input
            v-model="student.address"
            class="w-full border border-gray-200 rounded px-3 py-2 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- TAB -->
  <div class="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
    <button
      @click="activeTab = 'score'"
      :class="[
        'px-4 md:px-5 py-2 text-sm font-medium rounded-lg transition',
        activeTab === 'score'
          ? 'bg-white text-blue-600 shadow'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200',
      ]"
    >
      📊 Cột điểm
    </button>

    <button
      @click="activeTab = 'attendance'"
      :class="[
        'px-4 md:px-5 py-2 text-sm font-medium rounded-lg transition',
        activeTab === 'attendance'
          ? 'bg-white text-green-600 shadow'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200',
      ]"
    >
      📅 Điểm danh
    </button>
  </div>

  <!-- SCORE -->
  <div v-if="activeTab === 'score'" class="bg-white border rounded-xl p-4 md:p-5 shadow-sm">
    <!-- MOBILE -->
    <div class="md:hidden space-y-4">
      <div class="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3">
        <div class="font-medium text-blue-900">
          {{ student.name }}
        </div>

        <div class="grid grid-cols-3 gap-3 text-sm">
          <!-- VĂN -->
          <div class="space-y-1">
            <label class="text-xs text-gray-500">Văn</label>
            <input
              v-model="scores.literature"
              type="number"
              class="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <!-- TOÁN -->
          <div class="space-y-1">
            <label class="text-xs text-gray-500">Toán</label>
            <input
              v-model="scores.math"
              type="number"
              class="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>

          <!-- ANH -->
          <div class="space-y-1">
            <label class="text-xs text-gray-500">Anh</label>
            <input
              v-model="scores.english"
              type="number"
              class="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- DESKTOP -->
    <div class="hidden md:block overflow-x-auto">
      <table class="min-w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="p-3 border text-center">HỌ TÊN</th>
            <th class="p-3 border text-center">VĂN</th>
            <th class="p-3 border text-center">TOÁN</th>
            <th class="p-3 border text-center">ANH</th>
          </tr>
        </thead>

        <tbody>
          <tr class="hover:bg-gray-50">
            <td class="p-3 border text-center font-medium text-blue-900">
              {{ student.name }}
            </td>

            <td class="p-3 border">
              <input
                v-model="scores.literature"
                type="number"
                class="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </td>

            <td class="p-3 border">
              <input
                v-model="scores.math"
                type="number"
                class="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </td>

            <td class="p-3 border">
              <input
                v-model="scores.english"
                type="number"
                class="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ATTENDANCE -->
  <div v-if="activeTab === 'attendance'" class="bg-white border rounded-xl p-4 md:p-5 shadow-sm">
    <!-- HEADER -->
    <div class="flex items-center justify-between mb-4 md:mb-6">
      <button
        @click="prevMonth"
        class="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 hover:bg-blue-100 transition"
      >
        <ChevronLeft class="w-5 h-5 text-gray-600" />
      </button>

      <div class="font-semibold text-sm md:text-base text-gray-800">
        📅 Tháng {{ currentMonthIndex + 1 }} / 2026
      </div>

      <button
        @click="nextMonth"
        class="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 hover:bg-blue-100 transition"
      >
        <ChevronRight class="w-5 h-5 text-gray-600" />
      </button>
    </div>

    <!-- GRID -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
      <div
        v-for="date in getDaysInMonth(months[currentMonthIndex])"
        :key="toKey(date)"
        class="border border-gray-200 rounded-xl p-3 bg-white transition"
        :class="isToday(date) && 'ring-2 ring-blue-500 bg-blue-50'"
      >
        <div class="text-xs text-gray-400">
          {{ formatDay(date) }}
        </div>

        <div class="text-sm font-semibold mb-2 text-gray-700">
          {{ formatDate(date) }}
        </div>

        <select
          v-model="attendance[toKey(date)]"
          :class="[
            'w-full text-xs border rounded px-2 py-1 font-medium bg-white focus:outline-none',
            getAttendanceClass(date),
          ]"
        >
          <option value="">-- Chọn --</option>
          <option value="present">✔ Đi học</option>
          <option value="absent">✕ Nghỉ</option>
          <option value="permission">🟡 Nghỉ phép</option>
        </select>
      </div>
    </div>

    <!-- STATS -->
    <div class="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <div>
          <p class="text-gray-400">Tổng buổi</p>
          <p class="font-semibold text-gray-800">{{ stats.total }}</p>
        </div>

        <div>
          <p class="text-gray-400">Đi học</p>
          <p class="font-semibold text-green-600">{{ stats.present }}</p>
        </div>

        <div>
          <p class="text-gray-400">Nghỉ</p>
          <p class="font-semibold text-red-600">{{ stats.absent }}</p>
        </div>

        <div>
          <p class="text-gray-400">Chuyên cần</p>
          <p class="font-bold text-blue-600">{{ stats.percent }}%</p>
        </div>
      </div>

      <div class="mt-4 text-center">
        <span
          :class="[
            'px-3 py-1 rounded-full text-xs font-medium',
            studentStatus === 'active' && 'bg-green-100 text-green-600',
            studentStatus === 'pause' && 'bg-yellow-100 text-yellow-600',
            studentStatus === 'drop' && 'bg-red-100 text-red-600',
          ]"
        >
          {{ formatStudentStatus(studentStatus) }}
        </span>
      </div>
    </div>
  </div>

  <!-- SAVE -->
  <div class="flex justify-end mt-6 md:mt-8">
    <button
      @click="save"
      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition shadow-sm"
    >
      💾 Lưu dữ liệu
    </button>
  </div>
</template>
