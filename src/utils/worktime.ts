export interface TimeInput {
  hour: number
  minute: number
}

export interface MonthlyRemaining {
  remainingMinutes: number
  isExceeded: boolean
}

export interface DailyAverage {
  minutesPerDay: number
  noWorkdaysLeft: boolean
}

/**
 * 오늘부터 월말까지 남은 평일 수 (오늘 포함).
 * 주말(토·일)과 holidayDates에 포함된 날짜를 제외한다.
 */
export function countRemainingWorkdays(today: Date, holidayDates: string[]): number {
  const year = today.getFullYear()
  const month = today.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()
  const holidaySet = new Set(holidayDates)

  let count = 0
  for (let d = today.getDate(); d <= lastDay; d++) {
    const dow = new Date(year, month, d).getDay() // 0=일, 6=토
    if (dow === 0 || dow === 6) continue
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    if (holidaySet.has(key)) continue
    count++
  }
  return count
}

/**
 * 출근 시각 ~ 종료 시각 기준 실 근무 분 계산.
 * end < start 이면 자정을 넘긴 것으로 +24h 처리한다.
 * nonWorkMinutes(점심·외출 등)를 차감하며, 결과는 최소 0.
 */
export function calcWorkMinutes(
  start: TimeInput,
  end: TimeInput,
  nonWorkMinutes: number,
): number {
  let elapsed = end.hour * 60 + end.minute - (start.hour * 60 + start.minute)
  if (elapsed < 0) elapsed += 24 * 60
  return Math.max(0, elapsed - nonWorkMinutes)
}

/**
 * 기준근무시간 − 합계근무시간.
 * 합계가 기준을 초과하면 remainingMinutes=0, isExceeded=true.
 */
export function calcMonthlyRemaining(
  standardMinutes: number,
  workedMinutes: number,
): MonthlyRemaining {
  const remaining = standardMinutes - workedMinutes
  if (remaining <= 0) return { remainingMinutes: 0, isExceeded: true }
  return { remainingMinutes: remaining, isExceeded: false }
}

/**
 * 남은 근무시간 ÷ 남은 평일 수.
 * 남은 평일이 0이면 noWorkdaysLeft=true.
 */
export function calcDailyAverage(
  remainingMinutes: number,
  remainingWorkdays: number,
): DailyAverage {
  if (remainingWorkdays === 0) return { minutesPerDay: 0, noWorkdaysLeft: true }
  return {
    minutesPerDay: Math.floor(remainingMinutes / remainingWorkdays),
    noWorkdaysLeft: false,
  }
}

/** 총 분을 { hours, minutes } 로 분해 */
export function splitMinutes(total: number): { hours: number; minutes: number } {
  return { hours: Math.floor(total / 60), minutes: total % 60 }
}

/** "XX시간 XX분" 문자열 포맷 */
export function formatMinutes(total: number): string {
  const { hours, minutes } = splitMinutes(total)
  if (hours === 0) return `${minutes}분`
  if (minutes === 0) return `${hours}시간`
  return `${hours}시간 ${minutes}분`
}

/** "XXH XXM" English format */
export function formatMinsEn(total: number): string {
  const { hours, minutes } = splitMinutes(total)
  return `${hours}H ${String(minutes).padStart(2, '0')}M`
}

/** Asia/Seoul 기준 오늘 날짜를 Date로 반환 (시·분·초 = 0) */
export function getTodaySeoul(): Date {
  const isoDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Asia/Seoul 기준 현재 시각을 TimeInput으로 반환 */
export function getNowSeoul(): TimeInput {
  const now = new Date()
  const hour = Number(now.toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: 'Asia/Seoul' }))
  const minute = Number(now.toLocaleString('en-US', { minute: 'numeric', timeZone: 'Asia/Seoul' }))
  return { hour, minute }
}

/** "HH:MM" 문자열 → TimeInput */
export function parseTime(str: string): TimeInput {
  const [hour, minute] = str.split(':').map(Number)
  return { hour, minute }
}

/** TimeInput → "HH:MM" 문자열 */
export function timeToString(t: TimeInput): string {
  return `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`
}

/** 현재 연월을 "YYYY-MM" 으로 반환 (Asia/Seoul 기준) */
export function getCurrentYearMonth(): string {
  return new Date()
    .toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })
    .slice(0, 7)
}
