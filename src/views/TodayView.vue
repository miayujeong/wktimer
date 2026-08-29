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
  <div class="rows">
    <div class="row">
      <span class="k">start</span>
      <span class="v"><input v-model="workday.startTimeStr" class="inp t" type="time" /></span>
    </div>
    <div class="row">
      <span class="k">away</span>
      <span class="v">
        <input v-model.number="workday.nonWorkHours" class="inp n" type="number" min="0" /><span class="unit">h</span>
        <input v-model.number="workday.nonWorkMins" class="inp n" type="number" min="0" max="59" /><span class="unit">m</span>
      </span>
    </div>
  </div>

  <hr class="rule" />

  <div class="rows">
    <div class="row">
      <span class="k">as of</span>
      <span class="v">{{ calcTime ?? '--:--' }}</span>
      <button class="act" @click="calculate">read clock</button>
    </div>
    <div class="row">
      <span class="k">worked</span>
      <span class="v key">{{ resultMinutes !== null ? formatMinsEn(resultMinutes) : '--' }}</span>
    </div>
  </div>
</template>