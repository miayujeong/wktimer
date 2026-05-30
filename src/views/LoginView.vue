<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const submitting = ref(false)

async function handleSubmit() {
  errorMsg.value = ''
  submitting.value = true
  try {
    await auth.signIn(email.value, password.value)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : ''
    if (msg.includes('Invalid login credentials')) {
      errorMsg.value = 'Invalid email or password.'
    } else if (msg.includes('Email not confirmed')) {
      errorMsg.value = 'Please verify your email address.'
    } else {
      errorMsg.value = 'Login failed. Please try again.'
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-wrap">
    <div class="login-box">
      <h1>HellOooo....</h1>
      <form @submit.prevent="handleSubmit">
        <div class="field-row">
          <label for="email">e-mail</label>
          <input id="email" v-model="email" type="email" required autocomplete="email" />
        </div>
        <div class="field-row">
          <label for="password">password</label>
          <input id="password" v-model="password" type="password" required autocomplete="current-password" />
        </div>
        <p v-if="errorMsg" class="error">{{ errorMsg }}</p>
        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Loading...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('/bg1.png') center/cover no-repeat;
}

.login-box {
  background: rgba(185, 185, 185, 0.52);
  border-radius: 20px;
  padding: 3rem 2.5rem;
  width: 100%;
  max-width: 400px;
}

h1 {
  font-size: 1.4rem;
  font-weight: 400;
  text-align: center;
  color: #2a2a2a;
  margin-bottom: 2.5rem;
  letter-spacing: 0.03em;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-row {
  display: grid;
  grid-template-columns: 5rem 1fr;
  align-items: center;
  gap: 0.5rem;
}

label {
  font-size: 0.9375rem;
  color: #333;
  text-align: right;
}

input {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 2rem;
  background: #fff;
  font-size: 1rem;
  outline: none;
  color: #111;
  width: 100%;
}

button {
  margin-top: 1.25rem;
  align-self: center;
  padding: 0.75rem 4rem;
  background: #111;
  color: #fff;
  border: none;
  border-radius: 2rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  letter-spacing: 0.04em;
  transition: background 0.15s;
}

button:hover:not(:disabled) {
  background: #333;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  font-size: 0.875rem;
  color: #c00;
  text-align: center;
  margin: 0;
}
</style>
