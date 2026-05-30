<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import LoginView from './views/LoginView.vue'
import MonthView from './views/MonthView.vue'
import TodayView from './views/TodayView.vue'
import SimView from './views/SimView.vue'

const auth = useAuthStore()
onMounted(() => auth.init())

const tabs = [
  { key: 'month', label: 'Monthly' },
  { key: 'today', label: 'Daily' },
  { key: 'sim',   label: 'Simulate' },
] as const

type TabKey = (typeof tabs)[number]['key']
const activeTab = ref<TabKey>('month')
</script>

<template>
  <div v-if="auth.loading" class="splash">Loading...</div>
  <LoginView v-else-if="!auth.user" />
  <div v-else class="app">

    <div class="app-top">
      <nav class="tab-nav">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </nav>
      <button class="signout-btn" @click="auth.signOut()">logout</button>
    </div>

    <main class="main-content">
      <KeepAlive>
        <MonthView v-if="activeTab === 'month'" />
        <TodayView v-else-if="activeTab === 'today'" />
        <SimView   v-else />
      </KeepAlive>
    </main>

  </div>
</template>

<style>
/* ── Global component styles ── */
.section {
  max-width: 420px;
  margin: 0 auto;
  background: rgba(185, 185, 185, 0.48);
  border-radius: 20px;
  padding: 2rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.card {
  background: transparent;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.card-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: #2a2a2a;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ym {
  font-weight: 400;
  color: #555;
}

.value-large {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111;
}

.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.input-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.num-input {
  width: 58px;
  padding: 0.4rem 0.4rem;
  border: none;
  border-radius: 6px;
  font-size: 0.9375rem;
  text-align: center;
  outline: none;
  background: #fff;
  color: #111;
}

.time-input {
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background: #fff;
  color: #111;
  width: 160px;
}

.unit {
  font-size: 0.9375rem;
  color: #333;
}

.btn-primary {
  background: #111;
  color: #fff;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.75rem 1.25rem;
  letter-spacing: 0.02em;
  transition: background 0.15s;
}
.btn-primary:hover:not(:disabled) { background: #333; }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }
.btn-primary.sm {
  padding: 0.35rem 0.875rem;
  font-size: 0.8125rem;
  border-radius: 1rem;
}
.btn-primary.full { width: 100%; }

.btn-text {
  background: none;
  border: none;
  color: #555;
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
}
.btn-text:hover { color: #222; }

.result-card {
  background: rgba(10, 10, 10, 0.88);
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.result-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
}
.result-row + .result-row {
  border-top: 1px solid rgba(255,255,255,0.1);
  padding-top: 0.625rem;
  margin-top: 0.25rem;
}

.result-label { font-size: 0.875rem; color: rgba(255,255,255,0.7); }
.result-value { font-size: 1rem; font-weight: 600; color: #fff; }
.result-value.accent { color: #a8c4ff; }
.result-value.exceeded { color: #6be08a; }

.hint {
  text-align: center;
  color: #555;
  font-size: 0.875rem;
  padding: 0.5rem 0;
}

.error {
  font-size: 0.8125rem;
  color: #c00;
  margin: 0;
}

.loading-text {
  text-align: center;
  color: #555;
  padding: 2rem 0;
}
</style>

<style scoped>
.splash {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.5);
  background: url('/bg2.png') center/cover no-repeat;
}

.app {
  min-height: 100vh;
  background: url('/bg2.png') center/cover no-repeat;
  display: flex;
  flex-direction: column;
}

.app-top {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.5rem 1.25rem;
  position: relative;
}

.tab-nav {
  display: flex;
  gap: 2.5rem;
  align-items: center;
}

.tab-btn {
  background: none;
  border: none;
  font-size: 1.125rem;
  font-weight: 400;
  color: rgba(220, 220, 220, 0.5);
  cursor: pointer;
  letter-spacing: 0.02em;
  transition: color 0.15s, font-weight 0.15s;
  padding: 0;
  -webkit-text-stroke: 0.5px rgba(255, 255, 255, 0.35);
}
.tab-btn.active {
  color: #fff;
  font-weight: 700;
  -webkit-text-stroke: 0;
}

.signout-btn {
  position: absolute;
  right: 1.5rem;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.3);
  background: none;
  border: none;
  cursor: pointer;
  letter-spacing: 0.03em;
  transition: color 0.15s;
}
.signout-btn:hover { color: rgba(255,255,255,0.6); }

.main-content {
  flex: 1;
  padding: 0.5rem 1rem 3rem;
}
</style>
