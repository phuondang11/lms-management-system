import { ref } from 'vue'

export type Role = 'admin' | 'teacher' | 'student'

interface User {
  username: string
  role: Role
}

const user = ref<User | null>(null)

// ✅ LOGIN (có remember)
const login = (username: string, role: Role, remember = false) => {
  const userData = { username, role }

  user.value = userData

  if (remember) {
    localStorage.setItem('user', JSON.stringify(userData))
    sessionStorage.removeItem('user')
  } else {
    sessionStorage.setItem('user', JSON.stringify(userData))
    localStorage.removeItem('user')
  }
}

// ✅ LOAD USER
const loadUser = () => {
  const local = localStorage.getItem('user')
  const session = sessionStorage.getItem('user')

  if (local) {
    user.value = JSON.parse(local)
  } else if (session) {
    user.value = JSON.parse(session)
  }
}

// ✅ LOGOUT
const logout = () => {
  user.value = null
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}

export const useAuthStore = () => {
  const isAdmin = () => user.value?.role === 'admin'
  const isTeacher = () => user.value?.role === 'teacher'
  const isStudent = () => user.value?.role === 'student'

  return {
    user,
    login,
    logout,
    loadUser,
    isAdmin,
    isTeacher,
    isStudent,
  }
}
