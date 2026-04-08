<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AuthCard from '@/modules/auth/components/AuthCard.vue'
import AuthInput from '@/modules/auth/components/AuthInput.vue'
import AuthAlert from '@/modules/auth/components/AuthAlert.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import logo from '@/assets/logo.png'

const auth = useAuthStore()
const submitted = ref(false)
const form = reactive({
  first_name: '',
  last_name: '',
  company_name: '',
  email: '',
  password: '',
  password_confirmation: '',
  terms: false,
})

async function onSubmit() {
  if (auth.loading) return
  if (!form.terms) return
  try {
    await auth.register({ ...form })
    submitted.value = true
  } catch {
    submitted.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div class="flex-1 flex items-center justify-center px-4 py-10">
      <AuthCard>
        <div class="rc-auth-content rc-auth-content--wide rc-auth-grid">
          <div class="flex flex-col items-center gap-2 mb-3">
            <img :src="logo" alt="RC" class="h-16 w-16 object-contain" />
            <span class="text-4xl font-bold text-gradient">Console</span>
          </div>

          <template v-if="submitted">
            <h1 class="rc-auth-title text-center">Check your inbox</h1>
            <p class="rc-auth-subtitle text-center">Account created successfully. Please verify your email before signing in.</p>
            <AuthAlert variant="success" :message="auth.apiMessage || 'Registration successful. Please verify your email.'" />
            <RouterLink to="/login" class="rc-auth-link text-center">Back to login</RouterLink>
          </template>

          <template v-else>
            <h1 class="rc-auth-title text-center">Create your account</h1>
            <AuthAlert v-if="auth.apiMessage" variant="error" :message="auth.apiMessage" />

            <form class="rc-auth-grid" @submit.prevent="onSubmit">
              <div class="rc-auth-grid-2">
                <AuthInput v-model="form.first_name" label="First Name" :error="auth.errors.first_name?.[0]" />
                <AuthInput v-model="form.last_name" label="Last Name" :error="auth.errors.last_name?.[0]" />
              </div>
              <AuthInput v-model="form.email" type="email" autocomplete="email" label="Work Email" :error="auth.errors.email?.[0]" />
              <AuthInput v-model="form.company_name" label="Company Name" :error="auth.errors.company_name?.[0]" />
              <AuthInput v-model="form.password" type="password" autocomplete="new-password" label="Password" :error="auth.errors.password?.[0]" :show-strength="true" />
              <AuthInput
                v-model="form.password_confirmation"
                type="password"
                autocomplete="new-password"
                label="Confirm Password"
                :error="auth.errors.password_confirmation?.[0]"
              />

              <label class="flex items-start gap-3 cursor-pointer text-sm text-gray-600">
                <input v-model="form.terms" type="checkbox" class="mt-1 accent-[var(--rc-accent)]" />
                <span>
                  I agree to Console's
                  <a href="#" class="font-semibold underline link-rc">Terms of Service</a>
                  and
                  <a href="#" class="font-semibold underline link-rc">Privacy Policy</a>
                </span>
              </label>

              <button class="btn-primary w-full py-3 rounded-lg text-sm font-semibold tracking-wide" :disabled="auth.loading || !form.terms" type="submit">
                <span v-if="auth.loading" class="flex items-center justify-center gap-2">
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
                <span v-else>Create Account →</span>
              </button>
            </form>

            <p class="text-center text-sm text-gray-500 mt-2">
              Already have an account?
              <RouterLink to="/login" class="font-semibold ml-1 transition-colors link-rc">Sign in</RouterLink>
            </p>
          </template>
        </div>
      </AuthCard>
    </div>

    <div class="py-5 border-t border-gray-100">
      <p class="text-center text-xs text-gray-400">
        © 2026 Reliance Corporation. All rights reserved. &nbsp;·&nbsp;
        <a href="#" class="hover:text-gray-600 transition-colors">Privacy Policy</a>
      </p>
    </div>
  </div>
</template>
