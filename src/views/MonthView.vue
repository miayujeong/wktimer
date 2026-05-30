<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSettings } from '../composables/useSettings'
import { useHolidays } from '../composables/useHolidays'
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
const workedHours = ref(0)
const workedMins = ref(0)

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
  const workedTotal = workedHours.value * 60 + workedMins.value
  const monthly = calcMonthlyRemaining(standardMinutes.value, workedTotal)
  const daily = calcDailyAverage(monthly.remainingMinutes, remainingWorkdays.value)
  return { monthly, daily }
})

const isLoading = computed(() => settingsLoading.value || holidaysLoading.value)
</script>

<template>
  <div class="section">
    <div v-if="isLoading" class="loading-text">Loading...</div>
    <template v-else>

      <!-- Goal worktime -->
      <div class="card">
        <div v-if="!editing" class="row-between">
          <span class="card-label">
            {{ yearMonth }} goal worktime:&nbsp;&nbsp;&nbsp;
            <span class="value-large">
              {{ standardMinutes !== null ? formatMinsEn(standardMinutes) : '--' }}
            </span>
          </span>
          <button class="btn-text" @click="startEdit">Edit</button>
        </div>
        <div v-else class="input-row">
          <span class="card-label">{{ yearMonth }} goal worktime:</span>
          <input v-model.number="editHours" type="number" min="0" max="400" class="num-input" />
          <span class="unit">H</span>
          <button class="btn-primary sm" :disabled="settingsLoading" @click="saveSetting">Save</button>
          <button class="btn-text" @click="editing = false">Cancel</button>
        </div>
        <p v-if="settingsError" class="error">{{ settingsError }}</p>
      </div>

      <!-- Worktime till yesterday -->
      <div class="card">
        <div class="row-between">
          <span class="card-label">worktime till yesterday:</span>
          <div class="input-row">
            <input v-model.number="workedHours" type="number" min="0" class="num-input" />
            <span class="unit">H</span>
            <input v-model.number="workedMins" type="number" min="0" max="59" class="num-input" />
            <span class="unit">M</span>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="standardMinutes === null" class="hint">
        Please enter and save the goal worktime first.
      </div>
      <div v-else-if="result" class="result-card">
        <div class="result-row">
          <span class="result-label">remaining worktime:</span>
          <span class="result-value" :class="{ exceeded: result.monthly.isExceeded }">
            {{ result.monthly.isExceeded ? 'Goal achieved! 🎉' : formatMinsEn(result.monthly.remainingMinutes) }}
          </span>
        </div>
        <div class="result-row">
          <span class="result-label">avg. worktime per day:</span>
          <span class="result-value">
            <template v-if="result.monthly.isExceeded">—</template>
            <template v-else-if="result.daily.noWorkdaysLeft">no workdays left</template>
            <template v-else>{{ formatMinsEn(result.daily.minutesPerDay) }}</template>
          </span>
        </div>
      </div>

    </template>
  </div>
</template>
