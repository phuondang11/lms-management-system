import { ref, watch } from 'vue'

// ===== TYPE =====
export interface ClassItem {
  id: number
  name: string
  year: string
  teacherId: number | string
  students?: number[] // hoặc array object sau này
}

// ===== LOAD DATA =====
const stored = localStorage.getItem('classes')

const classes = ref<ClassItem[]>(stored ? JSON.parse(stored) : [])

// ===== STORE =====
export const useClassStore = () => {
  const addClass = (cls: Omit<ClassItem, 'id'>) => {
    const newClass: ClassItem = {
      id: Date.now(),
      ...cls,
    }

    classes.value.push(newClass)
  }

  return {
    classes,
    addClass,
  }
}

// ===== AUTO SAVE =====
watch(
  classes,
  (val) => {
    localStorage.setItem('classes', JSON.stringify(val))
  },
  { deep: true },
)
