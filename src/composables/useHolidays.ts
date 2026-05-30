import { ref } from 'vue'
import { supabase } from '../supabase'

export function useHolidays() {
  const holidayDates = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** 해당 월의 공휴일 날짜 목록(YYYY-MM-DD) 조회 */
  async function fetchHolidays(yearMonth: string) {
    loading.value = true
    error.value = null
    try {
      const monthStart = `${yearMonth}-01`
      const lastDay = new Date(
        Number(yearMonth.slice(0, 4)),
        Number(yearMonth.slice(5, 7)),
        0,
      ).getDate()
      const monthEnd = `${yearMonth}-${String(lastDay).padStart(2, '0')}`

      const { data, error: err } = await supabase
        .from('holidays')
        .select('date')
        .gte('date', monthStart)
        .lte('date', monthEnd)

      if (err) throw err
      holidayDates.value = (data ?? []).map((row) => row.date as string)
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '공휴일 정보를 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
  }

  return { holidayDates, loading, error, fetchHolidays }
}
