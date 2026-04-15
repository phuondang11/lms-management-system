import { ref } from 'vue'

export interface Student {
  id: number
  name: string
  avatar?: string
  avatarColor?: string
  birthYear?: number
  className?: string
  address?: string
  scores?: {
    literature: number
    math: number
    english: number
  }
  attendance?: Record<string, string>
}

// 🎨 COLOR POOL (TAILWIND)
const avatarColors = [
  'bg-red-100 text-red-600',
  'bg-green-100 text-green-600',
  'bg-blue-100 text-blue-600',
  'bg-yellow-100 text-yellow-600',
  'bg-purple-100 text-purple-600',
  'bg-pink-100 text-pink-600',
  'bg-indigo-100 text-indigo-600',
]

// 🎯 HASH NAME → COLOR (để không bị random mỗi lần reload)
const getColorFromName = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % avatarColors.length
  return avatarColors[index]
}

// ===== SEED DATA =====
const seedStudents: Student[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    birthYear: 2010,
    className: 'Lớp 1A',
    address: 'TP.HCM',
    scores: { literature: 8, math: 9, english: 7 },
    attendance: {
      '2026-01-02': 'present',
      '2026-01-03': 'present',
      '2026-01-04': 'absent',
      '2026-01-05': 'present',
    },
  },
  {
    id: 2,
    name: 'Trần Thị B',
    birthYear: 2011,
    className: 'Lớp 1A',
    address: 'Hà Nội',
    scores: { literature: 6, math: 7, english: 6 },
    attendance: {
      '2026-01-02': 'present',
      '2026-01-03': 'absent',
      '2026-01-04': 'absent',
    },
  },
  {
    id: 3,
    name: 'Lê Văn C',
    birthYear: 2010,
    className: 'Lớp 1A',
    address: 'Đà Nẵng',
    scores: { literature: 9, math: 9, english: 8 },
    attendance: {
      '2026-01-02': 'present',
      '2026-01-03': 'present',
      '2026-01-04': 'present',
    },
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    birthYear: 2012,
    className: 'Lớp 1A',
    address: 'Cần Thơ',
    scores: { literature: 5, math: 6, english: 5 },
    attendance: {
      '2026-01-02': 'absent',
      '2026-01-03': 'absent',
    },
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    birthYear: 2011,
    className: 'Lớp 1A',
    address: 'Bình Dương',
    scores: { literature: 7, math: 8, english: 7 },
    attendance: {
      '2026-01-02': 'present',
      '2026-01-03': 'present',
      '2026-01-04': 'present',
      '2026-01-05': 'present',
    },
  },
]

// 👉 GÁN COLOR CHO MỖI STUDENT
const students = ref<Student[]>(
  seedStudents.map((s) => ({
    ...s,
    avatar: s.avatar || '', // chưa có ảnh thì để rỗng
    avatarColor: getColorFromName(s.name), // 🔥 thêm field mới
  })),
)

const deletedStudents = ref<Student[]>([])
const deleteStudent = (id: number) => {
  const index = students.value.findIndex((s) => s.id === id)

  if (index !== -1) {
    const removed = students.value.splice(index, 1)[0]
    deletedStudents.value.push(removed)
    return removed
  }
}

const restoreStudent = (id: number) => {
  const index = deletedStudents.value.findIndex((s) => s.id === id)

  if (index !== -1) {
    const restored = deletedStudents.value.splice(index, 1)[0]
    students.value.push(restored)
    return restored
  }
}

export const useStudentStore = () => {
  const setStudentData = (id: number, data: Partial<Student>) => {
    const index = students.value.findIndex((s) => s.id === id)

    if (index !== -1) {
      students.value[index] = {
        ...students.value[index],
        ...data,
      }
    } else {
      students.value.push({
        id,
        name: data.name || 'Unknown',
        ...data,
      })
    }
  }

  const getStudent = (id: number) => {
    return students.value.find((s) => s.id === id)
  }

  return {
    students,
    setStudentData,
    getStudent,
    deletedStudents,
    deleteStudent,
    restoreStudent,
  }
}
