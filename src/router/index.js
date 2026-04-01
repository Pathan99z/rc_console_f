import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../components/landing/LandingPage.vue'
import Login from '../components/login/Login.vue'
import Signup from '../components/signup/Signup.vue'
import Dashboard from '../components/dashboard/Dashboard.vue'
import ForgotPassword from '../components/forgot-password/ForgotPassword.vue'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/forgot-password', component: ForgotPassword },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  // catch-all → landing
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

// Auth guard — check localStorage flag set by Login / Signup
router.beforeEach((to, _from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem('isAuth')) {
    next('/login')
  } else {
    next()
  }
})

export default router
