<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { computed } from 'vue'
import { useClassStore } from '@/stores/classsStore'

const { addClass } = useClassStore()
const router = useRouter()
const toast = useToast()
const teachers = ref([{ id: 1, name: 'Thầy An' }])
const form = ref({
  name: '',
  year: '',
  teacherId: '',
})

const isValid = computed(() => {
  return form.value.name && form.value.year && form.value.teacherId
})

const createClass = () => {
  if (!isValid.value) return

  addClass({
    name: form.value.name,
    year: form.value.year,
    teacherId: form.value.teacherId,
  })

  // console.log('CLASSES:', classes.value)

  toast.success('Tạo lớp thành công 🎉')

  router.push('/students')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="max-w-2xl">
    <!-- TITLE -->
    <div class="flex items-center gap-2 mb-6">
      <div class="w-1 h-6 bg-green-500 rounded"></div>
      <h2 class="text-xl font-semibold text-gray-800">Tạo lớp mới</h2>
    </div>

    <!-- FORM BOX -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
      <!-- NAME -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700"> Tên lớp </label>

        <input
          v-model="form.name"
          placeholder="VD: Lớp 1A"
          class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition"
        />
      </div>

      <!-- YEAR -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700"> Niên khóa </label>

        <input
          v-model="form.year"
          placeholder="VD: 2024 - 2025"
          class="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition"
        />
      </div>

      <!-- TEACHER -->
      <div class="space-y-1">
        <label class="text-sm font-medium text-gray-700"> Giáo viên chủ nhiệm </label>

        <div class="flex gap-2">
          <select
            v-model="form.teacherId"
            class="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-400 focus:bg-white transition"
          >
            <option value="">Chọn giáo viên</option>
            <option v-for="t in teachers" :key="t.id" :value="t.id">
              {{ t.name }}
            </option>
          </select>

          <button
            @click="isTeacherModal = true"
            class="px-3 flex items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-500 active:scale-95 transition"
          >
            +
          </button>
        </div>
      </div>

      <!-- ACTION -->
      <div class="flex justify-end gap-2 pt-4 border-t">
        <button
          @click="goBack"
          class="px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
        >
          Hủy
        </button>

        <button
          @click="createClass"
          :disabled="!isValid"
          class="px-4 py-2 rounded-lg text-white font-medium transition"
          :class="
            isValid ? 'bg-green-600 hover:bg-green-500 shadow-sm' : 'bg-gray-300 cursor-not-allowed'
          "
        >
          Tạo lớp
        </button>
      </div>
    </div>
  </div>
</template>
