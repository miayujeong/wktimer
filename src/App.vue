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
  { key: 'month', label: 'month' },
  { key: 'today', label: 'day' },
  { key: 'sim',   label: 'simulate' },
] as const

type TabKey = (typeof tabs)[number]['key']
const activeTab = ref<TabKey>('month')
</script>

<template>
  <div v-if="auth.loading" class="splash">loading ...</div>
  <LoginView v-else-if="!auth.user" />
  <div v-else class="wrap">
    <div class="masthead">
      <span class="name">howmuchwork</span>
      <button class="signout-btn" @click="auth.signOut">sign out</button>
    </div>

    <nav class="tab-nav">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}</button>
    </nav>
    <hr class="rule" />

    <main>
      <KeepAlive>
        <MonthView v-if="activeTab === 'month'" />
        <TodayView v-else-if="activeTab === 'today'" />
        <SimView v-else />
      </KeepAlive>
    </main>
  </div>
</template>


