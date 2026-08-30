<script setup lang="ts">
import { ref, watch } from 'vue'

// 시간 "HH:MM" 24시간 표기로 직접 입력받기 
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const hh = ref('')
const mm = ref('')
const mmEl = ref<HTMLInputElement | null>(null)

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function clamp(n: number, max: number): number {
  return Math.min(Math.max(n, 0), max)
}

/** 두 칸의 값을 정규화된 "HH:MM" 으로 합치기 */
function compose(): string {
  return `${pad(clamp(Number(hh.value) || 0, 23))}:${pad(clamp(Number(mm.value) || 0, 59))}`
}

watch(
  () => props.modelValue,
  (v) => {
    if (v === compose()) return // 이미 화면에 반영된 값이면 무시
    const [h, m] = v.split(':')
    hh.value = h ?? '00'
    mm.value = m ?? '00'
  },
  { immediate: true },
)

function onInput(e: Event, part: 'h' | 'm') {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\D/g, '').slice(0, 2)
  if (part === 'h') hh.value = digits
  else mm.value = digits
  el.value = digits // 걸러낸 문자가 화면에 남지 않도록
  emit('update:modelValue', compose())
  if (part === 'h' && digits.length === 2) {
    mmEl.value?.focus()
    mmEl.value?.select()
  }
}

function onBlur(part: 'h' | 'm') {
  const [h, m] = compose().split(':')
  if (part === 'h') hh.value = h
  else mm.value = m
  emit('update:modelValue', compose())
}

/** ↑/↓ 로 1칸씩 증감 (분은 60, 시는 24에서 넘기기) */
function onStep(e: KeyboardEvent, part: 'h' | 'm') {
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
  e.preventDefault()
  const delta = e.key === 'ArrowUp' ? 1 : -1
  if (part === 'h') {
    hh.value = pad((clamp(Number(hh.value) || 0, 23) + delta + 24) % 24)
  } else {
    mm.value = pad((clamp(Number(mm.value) || 0, 59) + delta + 60) % 60)
  }
  emit('update:modelValue', compose())
}
</script>

<template>
  <span class="tf">
    <input
      :value="hh"
      class="inp h"
      type="text"
      inputmode="numeric"
      maxlength="2"
      aria-label="hour"
      @input="onInput($event, 'h')"
      @blur="onBlur('h')"
      @keydown="onStep($event, 'h')"
      @focus="($event.target as HTMLInputElement).select()"
    /><span class="sep">:</span><input
      ref="mmEl"
      :value="mm"
      class="inp m"
      type="text"
      inputmode="numeric"
      maxlength="2"
      aria-label="minute"
      @input="onInput($event, 'm')"
      @blur="onBlur('m')"
      @keydown="onStep($event, 'm')"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </span>
</template>
