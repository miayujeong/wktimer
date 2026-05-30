<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkdayStore } from '../stores/workday'
import { calcWorkMinutes, formatMinsEn, parseTime } from '../utils/worktime'

const workday = useWorkdayStore()
const endTimeStr = ref('18:00')

const resultMinutes = computed(() =>
  calcWorkMinutes(workday.startTime, parseTime(endTimeStr.value), workday.nonWorkMinutes),
)
</script>

<template>
  <div class="section">

    <!-- Start time (shared) -->
    <div class="card">
      <div class="row-between">
        <span class="card-label">start time</span>
        <input v-model="workday.startTimeStr" type="time" class="time-input" />
      </div>
    </div>

    <!-- Non-work time (shared) -->
    <div class="card">
      <div class="row-between">
        <span class="card-label">non-work time</span>
        <div class="input-row">
          <input v-model.number="workday.nonWorkHours" type="number" min="0" class="num-input" />
          <span class="unit">H</span>
          <input v-model.number="workday.nonWorkMins" type="number" min="0" max="59" class="num-input" />
          <span class="unit">M</span>
        </div>
      </div>
    </div>

    <!-- Expected end time -->
    <div class="card">
      <div class="row-between">
        <span class="card-label">expected end time</span>
        <input v-model="endTimeStr" type="time" class="time-input" />
      </div>
    </div>

    <!-- Result (auto-computed) -->
    <div class="result-card">
      <div class="result-row">
        <span class="result-label">work time if leave at {{ endTimeStr }}</span>
        <span class="result-value accent">{{ formatMinsEn(resultMinutes) }}</span>
      </div>
    </div>

  </div>
</template>
