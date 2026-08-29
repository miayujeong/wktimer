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

      <div class="masthead">
        <span class="name">WKTIMER</span>
        <span>auth<span class="caret"></span></span>
      </div>
      <hr class="rule" />

      <form @submit.prevent="handleSubmit">
        <div class="rows">
          <div class="row">
            <label class="k" for="email">email</label>
            <input id="email" v-model="email" class="inp wide" type="email" required autocomplete="email" />
          </div>
          <div class="row">
            <label class="k" for="password">password</label>
            <input id="password" v-model="password" class="inp wide" type="password" required autocomplete="current-password" />
          </div>
        </div>

        <hr class="rule soft" />

        <div class="row">
          <span class="k"></span>
          <span class="err">{{ errorMsg }}</span>
          <button class="act" type="submit" :disabled="submitting">
            {{ submitting ? 'signing in' : 'sign in' }}
          </button>
        </div>
      </form>

    </div>
  </div>
</template>
