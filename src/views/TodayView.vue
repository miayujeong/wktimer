<script setup lang="ts">
import { ref } from 'vue'
import { useWorkdayStore } from '../stores/workday'
import { getNowSeoul, calcWorkMinutes, formatMinsEn, timeToString } from '../utils/worktime'

const workday = useWorkdayStore()

const calcTime = ref<string | null>(null)
const resultMinutes = ref<number | null>(null)

function calculate() {
  const now = getNowSeoul()
  calcTime.value = timeToString(now)
  resultMinutes.value = calcWorkMinutes(workday.startTime, now, workday.nonWorkMinutes)
}
</script>

<template>
  <div class="section">

    <!-- Start time -->
    <div class="card">
      <div class="row-between">
        <span class="card-label">start time</span>
        <input v-model="workday.startTimeStr" type="time" class="time-input" />
      </div>
    </div>

    <!-- Non-work time -->
    <div class="card">
      <div class="row-between">
        <span class="card-label">non-work time (lunch, etc.)</span>
        <div class="input-row">
          <input v-model.number="workday.nonWorkHours" type="number" min="0" class="num-input" />
          <span class="unit">H</span>
          <input v-model.number="workday.nonWorkMins" type="number" min="0" max="59" class="num-input" />
          <span class="unit">M</span>
        </div>
      </div>
    </div>

    <!-- Calculate button -->
    <button class="btn-primary full" @click="calculate">Calculate Now</button>

    <!-- Results -->
    <div v-if="resultMinutes !== null" class="result-card">
      <div class="result-row">
        <span class="result-label">reference time</span>
        <span class="result-value">{{ calcTime }}</span>
      </div>
      <div class="result-row">
        <span class="result-label">today's work time</span>
        <span class="result-value accent">{{ formatMinsEn(resultMinutes) }}</span>
      </div>
    </div>

  </div>
</template>
