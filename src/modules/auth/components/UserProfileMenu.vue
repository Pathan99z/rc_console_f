<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import ChangePasswordModal from '@/modules/auth/components/ChangePasswordModal.vue'
import ProfileDrawer from '@/modules/auth/components/ProfileDrawer.vue'
import { useAuthStore } from '@/modules/auth/store/auth.store'
import { userInitials } from '@/modules/auth/utils/userProfileFormat'

const authStore = useAuthStore()
const router = useRouter()

const rootRef = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const profileOpen = ref(false)
const passwordOpen = ref(false)
const loggingOut = ref(false)

const initials = computed(() => userInitials(authStore.user?.name))
const ariaLabel = computed(() => authStore.user?.name || 'Account menu')

function closeMenu() {
  menuOpen.value = false
}

function openProfile() {
  closeMenu()
  profileOpen.value = true
}

function openPassword() {
  closeMenu()
  passwordOpen.value = true
}

async function onLogout() {
  if (loggingOut.value) return
  closeMenu()
  loggingOut.value = true
  try {
    await authStore.logout()
    await router.push('/login')
  } finally {
    loggingOut.value = false
  }
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function onDocumentClick(event: MouseEvent) {
  if (!menuOpen.value) return
  const target = event.target as Node | null
  if (rootRef.value && target && !rootRef.value.contains(target)) {
    closeMenu()
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && menuOpen.value) {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div ref="rootRef" class="relative">
    <button
      type="button"
      class="profile-btn"
      :aria-label="ariaLabel"
      :aria-expanded="menuOpen"
      aria-haspopup="menu"
      :disabled="loggingOut"
      @click.stop="toggleMenu"
    >
      {{ initials }}
    </button>

    <div
      v-if="menuOpen"
      class="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
      role="menu"
      @click.stop
    >
      <div class="border-b border-slate-100 px-3 py-2">
        <p class="truncate text-sm font-semibold text-slate-900">{{ authStore.user?.name || 'Account' }}</p>
        <p class="truncate text-xs text-slate-500">{{ authStore.user?.email }}</p>
      </div>
      <button type="button" class="menu-item" role="menuitem" @click="openProfile">My Profile</button>
      <button type="button" class="menu-item" role="menuitem" @click="openPassword">Change Password</button>
      <button
        type="button"
        class="menu-item menu-item--danger"
        role="menuitem"
        :disabled="loggingOut"
        @click="onLogout"
      >
        {{ loggingOut ? 'Signing out…' : 'Logout' }}
      </button>
    </div>

    <ProfileDrawer :open="profileOpen" @close="profileOpen = false" />
    <ChangePasswordModal :open="passwordOpen" @close="passwordOpen = false" />
  </div>
</template>

<style scoped>
.profile-btn {
  width: 34px;
  height: 34px;
  border: 1px solid #334155;
  border-radius: 999px;
  background: #334155;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s;
}
.profile-btn:hover {
  background: #1e293b;
  border-color: #1e293b;
}
.profile-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.menu-item {
  display: block;
  width: 100%;
  padding: 0.55rem 0.85rem;
  text-align: left;
  font-size: 0.875rem;
  color: #334155;
  background: transparent;
  border: none;
  cursor: pointer;
}
.menu-item:hover {
  background: #f8fafc;
}
.menu-item--danger {
  color: #b91c1c;
  border-top: 1px solid #f1f5f9;
}
.menu-item--danger:hover {
  background: #fef2f2;
}
</style>
