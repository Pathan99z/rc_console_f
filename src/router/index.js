import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from '../components/landing/LandingPage.vue'
import LoginPage from '../modules/auth/pages/LoginPage.vue'
import SignUpPage from '../modules/auth/pages/SignUpPage.vue'
import ForgotPasswordPage from '../modules/auth/pages/ForgotPasswordPage.vue'
import ResetPasswordPage from '../modules/auth/pages/ResetPasswordPage.vue'
import EmailVerificationResultPage from '../modules/auth/pages/EmailVerificationResultPage.vue'
import DashboardPage from '../modules/dashboard/pages/DashboardPage.vue'
import UsersPage from '../modules/users/pages/UsersPage.vue'
import TenantsPage from '../modules/tenants/pages/TenantsPage.vue'
import TeamsPage from '../modules/teams/pages/TeamsPage.vue'
import CompaniesPage from '../modules/companies/pages/CompaniesPage.vue'
import CompanyDetailPage from '../modules/companies/pages/CompanyDetailPage.vue'
import ContactsPage from '../modules/contacts/pages/ContactsPage.vue'
import ContactDetailPage from '../modules/contacts/pages/ContactDetailPage.vue'
import DealsPage from '../modules/deals/pages/DealsPage.vue'
import DealDetailPage from '../modules/deals/pages/DealDetailPage.vue'
import ProductListPage from '../modules/products/pages/ProductListPage.vue'
import ProductCreatePage from '../modules/products/pages/ProductCreatePage.vue'
import ProductEditPage from '../modules/products/pages/ProductEditPage.vue'
import CollateralListPage from '../modules/collaterals/pages/CollateralListPage.vue'
import QuoteListPage from '../modules/quotes/pages/QuoteListPage.vue'
import QuoteCreatePage from '../modules/quotes/pages/QuoteCreatePage.vue'
import QuoteDetailPage from '../modules/quotes/pages/QuoteDetailPage.vue'
import QuoteEditPage from '../modules/quotes/pages/QuoteEditPage.vue'
import PublicQuotePage from '../modules/quotes/pages/PublicQuotePage.vue'
import ProtectedLayout from '@/shared/components/ProtectedLayout.vue'
import { authAndRoleGuard } from '@/router/guards/accessGuards'

const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignUpPage },
  { path: '/forgot-password', component: ForgotPasswordPage },
  { path: '/reset-password', component: ResetPasswordPage },
  { path: '/verify-email/:id/:hash', component: EmailVerificationResultPage },
  {
    path: '/app',
    component: ProtectedLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'users', component: UsersPage, meta: { roles: ['global_admin', 'company_admin'] } },
      { path: 'tenants', component: TenantsPage, meta: { roles: ['global_admin'] } },
      { path: 'teams', component: TeamsPage, meta: { roles: ['global_admin', 'company_admin'] } },
      { path: 'companies', component: CompaniesPage, meta: { roles: ['global_admin', 'company_admin'] } },
      { path: 'companies/:id', component: CompanyDetailPage, meta: { roles: ['global_admin', 'company_admin'] } },
      { path: 'contacts', component: ContactsPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'contacts/:id', component: ContactDetailPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'deals', component: DealsPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'deals/:id', component: DealDetailPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'products', component: ProductListPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'products/create', component: ProductCreatePage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'products/:id/edit', component: ProductEditPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'collaterals', component: CollateralListPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'quotes', component: QuoteListPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'quotes/create', component: QuoteCreatePage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'quotes/:id/edit', component: QuoteEditPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
      { path: 'quotes/:id', component: QuoteDetailPage, meta: { roles: ['global_admin', 'company_admin', 'user'] } },
    ],
  },
  { path: '/quote/public/:token', component: PublicQuotePage },
  { path: '/dashboard', redirect: '/app/dashboard' },
  { path: '/users', redirect: '/app/users' },
  { path: '/tenants', redirect: '/app/tenants' },
  { path: '/teams', redirect: '/app/teams' },
  { path: '/companies', redirect: '/app/companies' },
  { path: '/contacts', redirect: '/app/contacts' },
  { path: '/deals', redirect: '/app/deals' },
  { path: '/products', redirect: '/app/products' },
  { path: '/collaterals', redirect: '/app/collaterals' },
  { path: '/quotes', redirect: '/app/quotes' },
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

router.beforeEach(authAndRoleGuard)

export default router
