import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { parseTime } from '../utils/worktime'

// 출근시각·비근무시간은 기능 2(오늘)·3(시뮬레이션)이 공유
export const useWorkdayStore = defineStore('workday', () => {
  const startTimeStr = ref('09:00') // TimeField v-model용 "HH:MM"
  const nonWorkHours = ref(1)
  const nonWorkMins = ref(0)

  const startTime = computed(() => parseTime(startTimeStr.value))
  const nonWorkMinutes = computed(() => nonWorkHours.value * 60 + nonWorkMins.value)

  return { startTimeStr, nonWorkHours, nonWorkMins, startTime, nonWorkMinutes }
})
