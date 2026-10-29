import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { parseTime } from '../utils/worktime'

// 오늘 입력값을 브라우저에 저장해두고, 날짜가 바뀌면 버린다
const STORAGE_KEY = 'wktimer:today'

interface SavedInputs {
  date: string // 'YYYY-MM-DD' (서울 기준)
  workedHours: number
  workedMins: number
  startTimeStr: string
  nonWorkHours: number
  nonWorkMins: number
}

function todayKey(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
}

function load(): Partial<SavedInputs> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
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
  const saved = load()

  const workedHours = ref(saved.workedHours ?? 0)
  const workedMins = ref(saved.workedMins ?? 0)
  const startTimeStr = ref(saved.startTimeStr ?? '09:00') // TimeField v-model용 "HH:MM"
  const nonWorkHours = ref(saved.nonWorkHours ?? 1)
  const nonWorkMins = ref(saved.nonWorkMins ?? 0)

  const startTime = computed(() => parseTime(startTimeStr.value))
  const nonWorkMinutes = computed(() => nonWorkHours.value * 60 + nonWorkMins.value)

  watch([workedHours, workedMins, startTimeStr, nonWorkHours, nonWorkMins], () => {
    const data: SavedInputs = {
      date: todayKey(),
      workedHours: Number(workedHours.value) || 0,
      workedMins: Number(workedMins.value) || 0,
      startTimeStr: startTimeStr.value,
      nonWorkHours: Number(nonWorkHours.value) || 0,
      nonWorkMins: Number(nonWorkMins.value) || 0,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
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
