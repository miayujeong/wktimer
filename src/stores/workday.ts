import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { parseTime } from '../utils/worktime'
import { useAuthStore } from './auth'

// 오늘 입력값을 유저별로 브라우저에 저장해두고, 날짜가 바뀌면 버린다
const STORAGE_PREFIX = 'wktimer:today:'

interface SavedInputs {
  date: string // 'YYYY-MM-DD' (서울 기준)
  workedHours: number
  workedMins: number
  startTimeStr: string
  nonWorkHours: number
  nonWorkMins: number
}

const DEFAULTS = {
  workedHours: 0,
  workedMins: 0,
  startTimeStr: '09:00',
  nonWorkHours: 1,
  nonWorkMins: 0,
}

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

function load(userId: string | undefined): Partial<SavedInputs> {
  if (!userId) return {}
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId)
    if (!raw) return {}
    const saved = JSON.parse(raw) as SavedInputs
    return saved.date === todayKey() ? saved : {}
  } catch {
    return {}
  }
}

// 월간 누적시간, 출근시각·비근무시간을 하루 동안 유지
// 출근시각·비근무시간은 기능 2(오늘)·3(시뮬레이션)이 공유
export const useWorkdayStore = defineStore('workday', () => {
  const auth = useAuthStore()
  const userId = computed(() => auth.user?.id)

  const workedHours = ref(DEFAULTS.workedHours)
  const workedMins = ref(DEFAULTS.workedMins)
  const startTimeStr = ref(DEFAULTS.startTimeStr) // TimeField v-model용 "HH:MM"
  const nonWorkHours = ref(DEFAULTS.nonWorkHours)
  const nonWorkMins = ref(DEFAULTS.nonWorkMins)

  const startTime = computed(() => parseTime(startTimeStr.value))
  const nonWorkMinutes = computed(() => nonWorkHours.value * 60 + nonWorkMins.value)

  // 로그인 유저가 바뀌면 그 유저의 오늘 값으로 교체
  watch(
    userId,
    (id) => {
      const saved = { ...DEFAULTS, ...load(id) }
      workedHours.value = saved.workedHours
      workedMins.value = saved.workedMins
      startTimeStr.value = saved.startTimeStr
      nonWorkHours.value = saved.nonWorkHours
      nonWorkMins.value = saved.nonWorkMins
    },
    { immediate: true },
  )

  watch([workedHours, workedMins, startTimeStr, nonWorkHours, nonWorkMins], () => {
    if (!userId.value) return
    const data: SavedInputs = {
      date: todayKey(),
      workedHours: Number(workedHours.value) || 0,
      workedMins: Number(workedMins.value) || 0,
      startTimeStr: startTimeStr.value,
      nonWorkHours: Number(nonWorkHours.value) || 0,
      nonWorkMins: Number(nonWorkMins.value) || 0,
    }
    try {
      localStorage.setItem(STORAGE_PREFIX + userId.value, JSON.stringify(data))
    } catch {
      // 저장 불가(시크릿 모드 등)면 세션 내에서만 유지
    }
  })

  return {
    workedHours, workedMins,
    startTimeStr, nonWorkHours, nonWorkMins,
    startTime, nonWorkMinutes,
  }
})
