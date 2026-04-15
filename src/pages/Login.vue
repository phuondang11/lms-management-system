<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from 'vue-toastification'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const username = ref('')
const password = ref('')
const role = ref<'teacher' | 'student'>('teacher')

const showRegister = ref(false)

// LOGIN

// REGISTER
const registerForm = ref({
  name: '',
  birthYear: '',
  address: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const handleRegister = () => {
  if (!registerForm.value.name || !registerForm.value.username || !registerForm.value.password) {
    toast.error('Vui lòng nhập đầy đủ thông tin')
    return
  }

  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    toast.error('Mật khẩu không khớp')
    return
  }

  toast.success('Đăng ký thành công 🎉')
  showRegister.value = false
}

const errors = ref({
  username: '',
  password: '',
})

const handleLogin = () => {
  errors.value.username = ''
  errors.value.password = ''
  let isValid = true
  if (!username.value) {
    errors.value.username = 'Vui lòng nhập tên đăng nhập'
    isValid = false
  }
  if (!password.value) {
    errors.value.password = 'Vui lòng nhập mật khẩu'
    isValid = false
  }
  if (!isValid) return
  auth.login(username.value, role.value)
  toast.success('Đăng nhập thành công 🎉')
  router.push('/')
}

const rememberMe = ref(false)
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center p-4"
  >
    <!-- CARD -->
    <div class="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
      <!-- TITLE -->
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">Chào mừng bạn trở lại LMS</h2>
      <p class="text-center text-gray-500 text-sm mb-6">Learning Online Platform</p>

      <!-- USERNAME -->
      <div class="mb-4">
        <label class="text-sm text-gray-600">Tên đăng nhập</label>
        <input
          v-model="username"
          class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          :class="errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'"
          placeholder="Nhập username"
        />
        <p class="text-red-500 text-sm mt-1">{{ errors.username }}</p>
      </div>

      <!-- PASSWORD -->
      <div class="mb-4">
        <label class="text-sm text-gray-600">Mật khẩu</label>
        <input
          v-model="password"
          type="password"
          class="w-full mt-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
          :class="errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'"
          placeholder="••••••"
        />
        <p class="text-red-500 text-sm mt-1">{{ errors.password }}</p>
      </div>

      <!-- ROLE -->
      <div class="mb-6">
        <label class="text-sm text-gray-600">Bạn là:</label>
        <select
          v-model="role"
          class="w-full mt-1 px-4 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-400"
        >
          <option value="teacher">Giáo viên</option>
          <option value="student">Học sinh</option>
        </select>
      </div>

      <div class="flex items-center justify-between mb-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" v-model="rememberMe" class="w-4 h-4 accent-blue-600" />
          <span class="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
        </label>
      </div>

      <!-- BUTTON -->
      <button
        @click="handleLogin"
        class="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-500 transition font-medium"
      >
        Đăng nhập
      </button>

      <!-- REGISTER -->
      <p class="text-center text-sm text-gray-500 mt-4">
        Bạn chưa có thông tin đăng nhập?
        <span @click="showRegister = true" class="text-blue-600 cursor-pointer hover:underline">
          Đăng ký ngay
        </span>
      </p>
    </div>

    <!-- MODAL REGISTER -->
    <transition name="modal">
      <div v-if="showRegister" class="modal-overlay">
        <div class="modal-box">
          <h3 class="modal-title">Đăng ký tài khoản</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input v-model="registerForm.name" placeholder="Họ và tên" class="input" />
            <input v-model="registerForm.birthYear" placeholder="Năm sinh" class="input" />
            <input
              v-model="registerForm.address"
              placeholder="Sinh sống"
              class="input md:col-span-2"
            />
            <input
              v-model="registerForm.username"
              placeholder="Tên đăng nhập"
              class="input md:col-span-2"
            />
            <input
              type="password"
              v-model="registerForm.password"
              placeholder="Mật khẩu"
              class="input"
            />
            <input
              type="password"
              v-model="registerForm.confirmPassword"
              placeholder="Xác nhận mật khẩu"
              class="input"
            />
          </div>

          <div class="flex justify-end gap-2 mt-5">
            <button class="btn-secondary" @click="showRegister = false">Hủy</button>
            <button class="btn-primary" @click="handleRegister">Đăng ký</button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* animation */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  transition: 0.2s;
}

.input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #bfdbfe;
}

.label {
  font-size: 13px;
  color: #6b7280;
}

.error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 4px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-box {
  background: white;
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.modal-title {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 16px;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}

.modal-enter-from {
  opacity: 0;
  transform: scale(0.9) translateY(20px);
}

.modal-enter-to {
  opacity: 1;
  transform: scale(1);
}

.btn-primary {
  background: #2563eb;
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  transition: 0.2s;
}

.btn-primary:hover {
  background: #1d4ed8;
}

.btn-secondary {
  border: 1px solid #d1d5db;
  padding: 10px 16px;
  border-radius: 10px;
}
</style>
