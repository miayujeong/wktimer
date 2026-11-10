import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { parseTime } from '../utils/worktime'
import { supabase } from '../supabase'
import { useAuthStore } from './auth'

// 오늘 입력값을 로그인 계정(user_metadata)에 저장해 기기 간 연동한다.
// 같은 값을 브라우저에도 유저별로 남겨 첫 화면·오프라인용으로 쓴다.
// 날짜(서울 기준)가 바뀌면 이전 값은 버리고 기본값으로 시작한다.
const STORAGE_PREFIX = 'wktimer:today:'
const META_KEY = 'wktimer_today'
const SYNC_DELAY_MS = 800

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

function isToday(v: unknown): v is SavedInputs {
  return !!v && typeof v === 'object' && (v as SavedInputs).date === todayKey()
}

function loadLocal(userId: string): SavedInputs | null {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + userId)
    const saved = raw ? JSON.parse(raw) : null
    return isToday(saved) ? saved : null
  } catch {
    return null
  }
}

function saveLocal(userId: string, data: SavedInputs) {
  try {
    localStorage.setItem(STORAGE_PREFIX + userId, JSON.stringify(data))
  } catch {
    // 저장 불가(시크릿 모드 등)면 무시
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

  let loadedDate = todayKey()
  let lastSynced = '' // 서버와 마지막으로 맞춘 값(JSON) — 같은 값 재전송 방지
  let lastApplied = '' // 코드가 넣은 값(JSON) — 사용자 입력과 구분
  let syncTimer: ReturnType<typeof setTimeout> | null = null

  function snapshot(): SavedInputs {
    return {
      date: todayKey(),
      workedHours: Number(workedHours.value) || 0,
      workedMins: Number(workedMins.value) || 0,
      startTimeStr: startTimeStr.value,
      nonWorkHours: Number(nonWorkHours.value) || 0,
      nonWorkMins: Number(nonWorkMins.value) || 0,
    }
  }

  function apply(saved: SavedInputs | null) {
    const v = { ...DEFAULTS, ...saved }
    workedHours.value = v.workedHours
    workedMins.value = v.workedMins
    startTimeStr.value = v.startTimeStr
    nonWorkHours.value = v.nonWorkHours
    nonWorkMins.value = v.nonWorkMins
    loadedDate = todayKey()
    lastApplied = JSON.stringify(snapshot())
  }

  async function pushRemote() {
    syncTimer = null
    if (!userId.value) return
    const json = JSON.stringify(snapshot())
    if (json === lastSynced) return
    try {
      const { error } = await supabase.auth.updateUser({ data: { [META_KEY]: JSON.parse(json) } })
      if (!error) lastSynced = json
    } catch {
      // 네트워크 오류 등 — 다음 변경 때 다시 시도
    }
  }

  /** 서버의 오늘 값을 가져와 화면에 반영 */
  async function pullRemote() {
    const id = userId.value
    if (!id) return
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error || userId.value !== id || syncTimer) return // 그 사이 유저가 바뀌었거나 입력 중이면 건너뜀
      const remote = data.user?.user_metadata?.[META_KEY]
      if (isToday(remote)) {
        lastSynced = JSON.stringify(remote)
        apply(remote)
        saveLocal(id, remote)
      } else if (loadedDate !== todayKey()) {
        apply(null) // 날짜가 바뀌었으면 기본값으로
      } else if (JSON.stringify(snapshot()) !== JSON.stringify({ date: todayKey(), ...DEFAULTS })) {
        void pushRemote() // 서버에 오늘 값이 없고 이 기기에 입력값이 있으면 올림
      }
    } catch {
      // 오프라인이면 브라우저에 저장된 값으로 계속
    }
  }

  // 로그인 유저가 바뀌면: 브라우저 값으로 먼저 보여주고, 서버 값으로 맞춤
  watch(
    userId,
    (id) => {
      if (syncTimer) clearTimeout(syncTimer)
      syncTimer = null
      lastSynced = ''
      apply(id ? loadLocal(id) : null)
      if (id) void pullRemote()
    },
    { immediate: true },
  )

  // 값이 바뀌면: 브라우저엔 바로, 서버엔 입력이 멈춘 뒤 한 번
  watch([workedHours, workedMins, startTimeStr, nonWorkHours, nonWorkMins], () => {
    const id = userId.value
    if (!id) return
    const data = snapshot()
    if (JSON.stringify(data) === lastApplied) return // 불러온 값 반영은 저장하지 않음
    lastApplied = ''
    saveLocal(id, data)
    if (syncTimer) clearTimeout(syncTimer)
    syncTimer = setTimeout(pushRemote, SYNC_DELAY_MS)
  })

  // 다른 앱/탭에 갔다가 돌아오면 서버 값을 다시 가져옴
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (syncTimer) {
          clearTimeout(syncTimer)
          void pushRemote() // 나가기 전에 미처 못 보낸 값 전송
        }
      } else {
        void pullRemote()
      }
    })
  }

  return {
    workedHours, workedMins,
    startTimeStr, nonWorkHours, nonWorkMins,
    startTime, nonWorkMinutes,
  }
})
