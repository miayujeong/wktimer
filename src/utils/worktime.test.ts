import { describe, it, expect } from 'vitest'
import {
  calcWorkMinutes,
  calcMonthlyRemaining,
  calcDailyAverage,
  countRemainingWorkdays,
  formatMinutes,
} from './worktime'

describe('calcWorkMinutes', () => {
  it('정상 케이스: 9시~18시, 비근무 60분 → 480분', () => {
    expect(calcWorkMinutes({ hour: 9, minute: 0 }, { hour: 18, minute: 0 }, 60)).toBe(480)
  })

  it('자정 넘김: 23시 출근 → 다음날 02시 퇴근, 비근무 0 → 180분', () => {
    expect(calcWorkMinutes({ hour: 23, minute: 0 }, { hour: 2, minute: 0 }, 0)).toBe(180)
  })

  it('비근무시간 > 경과시간이면 0 반환', () => {
    expect(calcWorkMinutes({ hour: 9, minute: 0 }, { hour: 10, minute: 0 }, 120)).toBe(0)
  })

  it('분 단위 정밀도: 9시30분~17시45분, 비근무 90분 → 405분', () => {
    // 17:45 - 9:30 = 495분, 비근무 90 차감 → 405분
    expect(calcWorkMinutes({ hour: 9, minute: 30 }, { hour: 17, minute: 45 }, 90)).toBe(405)
  })
})

describe('calcMonthlyRemaining', () => {
  it('기준 160시간, 합계 100시간 → 60시간(3600분) 남음', () => {
    const r = calcMonthlyRemaining(160 * 60, 100 * 60)
    expect(r.remainingMinutes).toBe(60 * 60)
    expect(r.isExceeded).toBe(false)
  })

  it('합계 > 기준이면 remainingMinutes=0, isExceeded=true', () => {
    const r = calcMonthlyRemaining(100 * 60, 110 * 60)
    expect(r.remainingMinutes).toBe(0)
    expect(r.isExceeded).toBe(true)
  })

  it('정확히 같으면 초과 처리', () => {
    const r = calcMonthlyRemaining(100 * 60, 100 * 60)
    expect(r.remainingMinutes).toBe(0)
    expect(r.isExceeded).toBe(true)
  })
})

describe('calcDailyAverage', () => {
  it('남은 분 480, 남은 평일 3 → 160분/일', () => {
    const r = calcDailyAverage(480, 3)
    expect(r.minutesPerDay).toBe(160)
    expect(r.noWorkdaysLeft).toBe(false)
  })

  it('남은 평일 0이면 noWorkdaysLeft=true', () => {
    const r = calcDailyAverage(480, 0)
    expect(r.noWorkdaysLeft).toBe(true)
  })
})

describe('countRemainingWorkdays', () => {
  it('2026-05-29 (금) 기준, 주말 제외 → 5/29, 6/1이 아닌 당월 말까지', () => {
    // 2026-05-29 금요일, 월말까지: 29(금), 남은 평일
    // 5/29=금, 5/30=토, 5/31=일 → 평일 1일
    const today = new Date(2026, 4, 29) // month 0-indexed
    const count = countRemainingWorkdays(today, [])
    expect(count).toBe(1)
  })

  it('공휴일이 평일에 있으면 차감된다', () => {
    // 2026-05-01 (금), 5/1~5/31에서 평일만 카운트
    // 5월 평일: 1,4,5,6,7,8,11,12,13,14,15,18,19,20,21,22,25,26,27,28,29 = 21일
    // 5/5(화) 어린이날 제외 → 20일
    const today = new Date(2026, 4, 1)
    const count = countRemainingWorkdays(today, ['2026-05-05'])
    expect(count).toBe(20)
  })

  it('공휴일이 주말과 겹쳐도 중복 차감 안 됨', () => {
    // 2026-06-01 기준, 6/6(토)가 공휴일 목록에 있어도 이미 토요일이라 평일 카운트에 영향 없음
    const today = new Date(2026, 5, 1) // 2026-06-01
    const withoutHoliday = countRemainingWorkdays(today, [])
    const withHoliday = countRemainingWorkdays(today, ['2026-06-06']) // 토요일
    expect(withoutHoliday).toBe(withHoliday)
  })
})

describe('formatMinutes', () => {
  it('90분 → "1시간 30분"', () => expect(formatMinutes(90)).toBe('1시간 30분'))
  it('60분 → "1시간"', () => expect(formatMinutes(60)).toBe('1시간'))
  it('45분 → "45분"', () => expect(formatMinutes(45)).toBe('45분'))
  it('0분 → "0분"', () => expect(formatMinutes(0)).toBe('0분'))
})
