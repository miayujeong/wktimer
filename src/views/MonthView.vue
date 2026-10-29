<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettings } from '../composables/useSettings'
import { useHolidays } from '../composables/useHolidays'
import { useWorkdayStore } from '../stores/workday'
import {
  getTodaySeoul,
  getCurrentYearMonth,
  countRemainingWorkdays,
  calcMonthlyRemaining,
  calcDailyAverage,
  formatMinsEn,
} from '../utils/worktime'

const yearMonth = getCurrentYearMonth()
const today = getTodaySeoul()

const { standardMinutes, loading: settingsLoading, error: settingsError, fetchSettings, saveSettings } = useSettings()
const { holidayDates, loading: holidaysLoading, fetchHolidays } = useHolidays()

const editing = ref(false)
const editHours = ref(0)
const workday = useWorkdayStore()

onMounted(async () => {
  await Promise.all([fetchSettings(yearMonth), fetchHolidays(yearMonth)])
  if (standardMinutes.value !== null) {
    editHours.value = Math.round(standardMinutes.value / 60)
  }
})

function startEdit() {
  if (standardMinutes.value !== null) {
    editHours.value = Math.round(standardMinutes.value / 60)
  }
  editing.value = true
}

async function saveSetting() {
  await saveSettings(yearMonth, editHours.value * 60)
  editing.value = false
}

const remainingWorkdays = computed(() =>
  countRemainingWorkdays(today, holidayDates.value),
)

const result = computed(() => {
  if (standardMinutes.value === null) return null
  const workedTotal = workday.workedHours * 60 + workday.workedMins
  const monthly = calcMonthlyRemaining(standardMinutes.value, workedTotal)
  const daily = calcDailyAverage(monthly.remainingMinutes, remainingWorkdays.value)
  return { monthly, daily }
})

const isLoading = computed(() => settingsLoading.value || holidaysLoading.value)
</script>

<template>
  <div v-if="isLoading" class="note">loading</div>

  <template v-else>
    <div class="rows">

      <div class="row">
        <span class="k">period</span>
        <span class="v">{{ yearMonth }}</span>
      </div>

      <!-- goal: 보기 -->
      <div v-if="!editing" class="row">
        <span class="k">goal</span>
        <span class="v">{{ standardMinutes !== null ? formatMinsEn(standardMinutes) : '--' }}</span>
        <button class="act" @click="startEdit">edit</button>
      </div>

      <!-- goal: 편집 -->
      <div v-else class="row">
        <span class="k">goal</span>
        <span class="v">
          <input v-model.number="editHours" class="inp n" type="number" min="0" max="400" /><span class="unit">h</span>
        </span>
        <span>
          <button class="act" :disabled="settingsLoading" @click="saveSetting">save</button>
          <button class="act" @click="editing = false">cancel</button>
        </span>
      </div>

      <div class="row">
        <span class="k">logged</span>
        <span class="v">
          <input v-model.number="workday.workedHours" class="inp n" type="number" min="0" /><span class="unit">h</span>
          <input v-model.number="workday.workedMins" class="inp n" type="number" min="0" max="59" /><span class="unit">m</span>
        </span>
      </div>

    </div>

    <p v-if="settingsError" class="err">{{ settingsError }}</p>

    <hr class="rule" />

    <div v-if="standardMinutes === null" class="note">
      set a goal above to see what is left
    </div>

    <div v-else-if="result" class="rows">
      <div class="row">
        <span class="k">remaining</span>
        <span class="v key" :class="{ exceeded: result.monthly.isExceeded }">
          {{ result.monthly.isExceeded ? 'goal met' : formatMinsEn(result.monthly.remainingMinutes) }}
        </span>
      </div>
      <div class="row">
        <span class="k">workdays</span>
        <span class="v">{{ remainingWorkdays }} left this month</span>
      </div>
      <div class="row">
        <span class="k">per day</span>
        <span class="v key">
          <template v-if="result.monthly.isExceeded">--</template>
          <template v-else-if="result.daily.noWorkdaysLeft">no workdays left</template>
          <template v-else>{{ formatMinsEn(result.daily.minutesPerDay) }}</template>
        </span>
      </div>
    </div>
  </template>
</template>