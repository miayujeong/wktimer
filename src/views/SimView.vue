<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkdayStore } from '../stores/workday'
import TimeField from '../components/TimeField.vue'
import { calcWorkMinutes, formatMinsEn, parseTime } from '../utils/worktime'

const workday = useWorkdayStore()
const endTimeStr = ref('18:00')

const resultMinutes = computed(() =>
  calcWorkMinutes(workday.startTime, parseTime(endTimeStr.value), workday.nonWorkMinutes),
)
</script>

<template>
  <div class="rows">
    <div class="row">
      <span class="k">start</span>
      <span class="v"><TimeField v-model="workday.startTimeStr" /></span>
    </div>
    <div class="row">
      <span class="k">away</span>
      <span class="v">
        <input v-model.number="workday.nonWorkHours" class="inp n" type="number" min="0" /><span class="unit">h</span>
        <input v-model.number="workday.nonWorkMins" class="inp n" type="number" min="0" max="59" /><span class="unit">m</span>
      </span>
    </div>
    <div class="row">
      <span class="k">leave at</span>
      <span class="v"><TimeField v-model="endTimeStr" /></span>
    </div>
  </div>

  <hr class="rule" />

  <div class="rows">
    <div class="row">
      <span class="k">worked</span>
      <span class="v key">{{ formatMinsEn(resultMinutes) }}</span>
    </div>
    <div class="row">
      <span class="k">note</span>
      <span class="note">day ends {{ endTimeStr }}</span>
    </div>
  </div>
</template>