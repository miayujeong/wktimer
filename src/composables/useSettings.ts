import { ref } from 'vue'
import { supabase } from '../supabase'

export function useSettings() {
  const standardMinutes = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** YYYY-MM 형식의 월 기준근무시간 조회 */
  async function fetchSettings(yearMonth: string) {
    loading.value = true
    error.value = null
    try {
      const { data, error: err } = await supabase
        .from('settings')
        .select('standard_minutes')
        .eq('year_month', yearMonth)
        .maybeSingle()

      if (err) throw err
      standardMinutes.value = data?.standard_minutes ?? null
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '설정을 불러오지 못했습니다.'
    } finally {
      loading.value = false
    }
  }

  /** 월 기준근무시간 저장·수정 (upsert) */
  async function saveSettings(yearMonth: string, minutes: number) {
    loading.value = true
    error.value = null
    try {
      const { error: err } = await supabase
        .from('settings')
        .upsert(
          { year_month: yearMonth, standard_minutes: minutes },
          { onConflict: 'user_id,year_month' },
        )

      if (err) throw err
      standardMinutes.value = minutes
    } catch (e: unknown) {
      error.value = e instanceof Error ? e.message : '설정을 저장하지 못했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { standardMinutes, loading, error, fetchSettings, saveSettings }
}
