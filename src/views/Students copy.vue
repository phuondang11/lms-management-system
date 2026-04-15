<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Pencil, Trash2, Eye } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const goToCreateClass = () => {
  router.push('/classes/create')
}

interface Student {
  id: number
  name: string
  age: number
  class: string
  year: string
}

const search = ref('')
const students = ref<Student[]>([
  { id: 1, name: 'Nguyen Van A', age: 12, class: 'Lớp 1', year: '2011-2007' },
  { id: 2, name: 'Tran Thi B', age: 13, class: 'Lớp 2', year: '2010-2007' },
])

// ================== FILTER ==================
const filteredStudents = computed(() => {
  const keyword = search.value.toLowerCase()
  return students.value.filter(
    (s) =>
      s.name.toLowerCase().includes(keyword) ||
      s.class.toLowerCase().includes(keyword) ||
      s.year.toLowerCase().includes(keyword),
  )
})

// ================== PAGINATION ==================
const currentPage = ref(1)
const perPage = 5

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / perPage))

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * perPage
  return filteredStudents.value.slice(start, start + perPage)
})

watch(search, () => (currentPage.value = 1))

// ================== MODAL ==================
const isOpen = ref(false)
const isEdit = ref(false)

const form = ref<Student>({
  id: 0,
  name: '',
  age: 0,
  class: '',
  year: '',
})

// ================== ACTION ==================
const openAdd = () => {
  isEdit.value = false
  form.value = { id: Date.now(), name: '', age: 0, class: '', year: '' }
  isOpen.value = true
}

const openEdit = (student: Student) => {
  isEdit.value = true
  form.value = { ...student }
  isOpen.value = true
}

const saveStudent = () => {
  if (!form.value.name) return

  if (isEdit.value) {
    const index = students.value.findIndex((s) => s.id === form.value.id)
    students.value[index] = { ...form.value }
  } else {
    students.value.push({ ...form.value })
  }

  isOpen.value = false
}

const deleteStudent = (id: number) => {
  if (confirm('Xóa học sinh này?')) {
    students.value = students.value.filter((s) => s.id !== id)
  }
}
</script>

<template>
  <div>
    <!-- FILTER BOX -->
    <div class="bg-white rounded-xl border p-4 mb-6">
      <!-- TITLE -->
      <div class="flex items-center gap-2 mb-3">
        <div class="w-1 h-5 bg-blue-500 rounded"></div>
        <h2 class="font-semibold text-gray-800">Student Search & Filter</h2>
      </div>

      <div class="flex items-center gap-3">
        <input
          v-model="search"
          type="text"
          placeholder="Tìm kiếm học sinh... (Tên, lớp, niên khóa)"
          class="flex-1 px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <!-- CLASS FILTER -->
        <div class="relative">
          <Layers class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <select
            class="appearance-none pl-9 pr-8 py-2 border rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-100 transition"
          >
            <option>Khối Lớp</option>
            <option>Lớp 1</option>
            <option>Lớp 2</option>
          </select>

          <ChevronDown
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          />
        </div>

        <!-- YEAR FILTER -->
        <div class="relative">
          <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <select
            class="appearance-none pl-9 pr-8 py-2 border rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 hover:bg-gray-100 transition"
          >
            <option>Niên khóa</option>
            <option>2011-2007</option>
            <option>2010-2007</option>
          </select>

          <ChevronDown
            class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          />
        </div>

        <button
          @click="openAdd"
          class="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          + THÊM HỌC SINH MỚI
        </button>
        <button
          @click="goToCreateClass"
          class="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition"
        >
          + TẠO LỚP MỚI
        </button>
      </div>
    </div>

    <!-- TABLE BOX -->
    <div class="bg-white rounded-xl border overflow-hidden">
      <!-- TITLE -->
      <div class="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
        <div class="flex items-center gap-2">
          <div class="w-1 h-5 bg-green-500 rounded"></div>
          <h2 class="font-semibold text-gray-800">DANH SÁCH HỌC SINH</h2>
        </div>

        <span class="text-sm text-gray-500"> Hiển thị {{ filteredStudents.length }} học sinh </span>
      </div>

      <!-- TABLE -->
      <table class="w-full text-sm">
        <thead class="bg-gray-100 text-gray-600">
          <tr>
            <th class="px-4 py-3 text-left">AVATAR</th>
            <th class="px-4 py-3 text-left">HỌ TÊN</th>
            <th class="px-4 py-3 text-left">LỚP</th>
            <th class="px-4 py-3 text-left">NIÊN KHÓA</th>
            <th class="px-4 py-3 text-left">ĐIỂM TB</th>
            <th class="px-4 py-3 text-left">TRẠNG THÁI</th>
            <th class="px-4 py-3 text-center">HÀNH ĐỘNG</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="student in paginatedStudents"
            :key="student.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="px-4 py-3">
              <div class="w-10 h-10 rounded-full bg-gray-200"></div>
            </td>

            <td class="px-4 py-3 text-blue-900 font-medium uppercase">
              {{ student.name }}
            </td>

            <td class="px-4 py-3">{{ student.class }}</td>

            <td class="px-4 py-3">{{ student.year }}</td>

            <td class="px-4 py-3">4.5</td>

            <td class="px-4 py-3">
              <span class="px-3 py-1 bg-gray-200 rounded-lg text-xs"> Đang học </span>
            </td>

            <!-- ACTION -->
            <td class="px-4 py-3">
              <div class="flex justify-center gap-2">
                <!-- VIEW -->
                <button
                  class="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                >
                  <Eye class="w-4 h-4" />
                </button>

                <!-- EDIT -->
                <button
                  @click="openEdit(student)"
                  class="w-8 h-8 rounded bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                >
                  <Pencil class="w-4 h-4" />
                </button>

                <!-- DELETE -->
                <button
                  @click="deleteStudent(student.id)"
                  class="w-8 h-8 rounded bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- PAGINATION -->
      <div class="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
        <!-- LEFT -->
        <span class="text-sm text-gray-500">
          Hiển thị {{ paginatedStudents.length }} trong {{ filteredStudents.length }} học sinh
        </span>

        <!-- RIGHT -->
        <div class="flex items-center gap-2">
          <!-- PREV -->
          <button
            @click="prevPage"
            :disabled="currentPage === 1"
            class="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            ‹
          </button>

          <!-- PAGE -->
          <span class="px-3 py-1 border rounded-lg bg-white text-sm">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>

          <!-- NEXT -->
          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            ›
          </button>
        </div>
      </div>

      <!-- EMPTY -->
      <div v-if="filteredStudents.length === 0" class="text-center py-8 text-gray-400">
        Không tìm thấy học sinh
      </div>
    </div>
  </div>
  <!-- MODAL -->
  <div v-if="isOpen" class="fixed inset-0 bg-black/30 flex items-center justify-center">
    <div class="bg-white w-[400px] rounded-xl p-6">
      <h2 class="text-lg font-semibold mb-4">
        {{ isEdit ? 'Sửa học sinh' : 'Thêm học sinh' }}
      </h2>

      <div class="flex flex-col gap-3">
        <input v-model="form.name" placeholder="Tên" class="border p-2 rounded" />
        <input v-model="form.age" type="number" placeholder="Tuổi" class="border p-2 rounded" />
        <input v-model="form.class" placeholder="Lớp" class="border p-2 rounded" />
        <input v-model="form.year" placeholder="Niên khóa" class="border p-2 rounded" />
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <button @click="isOpen = false" class="px-4 py-2 border rounded">Hủy</button>
        <button @click="saveStudent" class="px-4 py-2 bg-blue-600 text-white rounded">Lưu</button>
      </div>
    </div>
  </div>
</template>
