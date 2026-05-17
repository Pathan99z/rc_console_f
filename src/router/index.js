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
import PaymentSettingsPage from '../modules/payments/pages/PaymentSettingsPage.vue'
import EmailSettingsPage from '@/modules/settings/email/pages/EmailSettingsPage.vue'
import AuditLogListPage from '@/modules/audit-logs/pages/AuditLogListPage.vue'
import PaymentLinksPage from '../modules/payments/pages/PaymentLinksPage.vue'
import InvoiceListPage from '../modules/invoices/pages/InvoiceListPage.vue'
import InvoiceDetailPage from '../modules/invoices/pages/InvoiceDetailPage.vue'
import OrganizationListPage from '../modules/organizations/pages/OrganizationListPage.vue'
import OrganizationCreatePage from '../modules/organizations/pages/OrganizationCreatePage.vue'
import OrganizationEditPage from '../modules/organizations/pages/OrganizationEditPage.vue'
import OrganizationDetailPage from '../modules/organizations/pages/OrganizationDetailPage.vue'
import ResellerTeamPage from '../modules/organizations/pages/ResellerTeamPage.vue'
import OrganizationInvitationsPage from '../modules/prm/pages/OrganizationInvitationsPage.vue'
import InvitationPreviewPage from '../modules/prm/pages/InvitationPreviewPage.vue'
import InvitationAcceptPage from '../modules/prm/pages/InvitationAcceptPage.vue'
import PartnerDashboardPage from '@/modules/prm/pages/PartnerDashboardPage.vue'
import ResellerDashboardPage from '@/modules/prm/pages/ResellerDashboardPage.vue'
import PrmResourceCenterPage from '@/modules/prm/pages/PrmResourceCenterPage.vue'
import ProgramManagementPage from '@/modules/prm/pages/ProgramManagementPage.vue'
import ProgramEnrollmentsPage from '@/modules/prm/pages/ProgramEnrollmentsPage.vue'
import PartnerMyProgramPage from '@/modules/prm/pages/PartnerMyProgramPage.vue'
import CommissionPage from '@/modules/prm/pages/CommissionPage.vue'
import LicenseManagementPage from '@/modules/prm/pages/LicenseManagementPage.vue'
import PayoutListPage from '@/modules/payouts/pages/finance/PayoutListPage.vue'
import PayoutDetailPage from '@/modules/payouts/pages/finance/PayoutDetailPage.vue'
import PayoutGeneratePage from '@/modules/payouts/pages/finance/PayoutGeneratePage.vue'
import PayoutReconciliationPage from '@/modules/payouts/pages/finance/PayoutReconciliationPage.vue'
import PayoutBatchPage from '@/modules/payouts/pages/finance/PayoutBatchPage.vue'
import PayoutAdjustmentsPage from '@/modules/payouts/pages/finance/PayoutAdjustmentsPage.vue'
import PayoutDisputesPage from '@/modules/payouts/pages/finance/PayoutDisputesPage.vue'
import PayoutAccountsPage from '@/modules/payouts/pages/finance/PayoutAccountsPage.vue'
import PartnerPayoutListPage from '@/modules/payouts/pages/portal/PartnerPayoutListPage.vue'
import PartnerPayoutDetailPage from '@/modules/payouts/pages/portal/PartnerPayoutDetailPage.vue'
import ResellerPayoutListPage from '@/modules/payouts/pages/portal/ResellerPayoutListPage.vue'
import ResellerPayoutDetailPage from '@/modules/payouts/pages/portal/ResellerPayoutDetailPage.vue'
import TaskListPage from '@/modules/tasks/pages/TaskListPage.vue'
import DemoLinkListPage from '@/modules/demo-links/pages/DemoLinkListPage.vue'
import DemoLinkCreatePage from '@/modules/demo-links/pages/DemoLinkCreatePage.vue'
import DemoLinkEditPage from '@/modules/demo-links/pages/DemoLinkEditPage.vue'
import DemoLinkDetailPage from '@/modules/demo-links/pages/DemoLinkDetailPage.vue'
import NotificationCenterPage from '@/modules/notifications/pages/NotificationCenterPage.vue'
import ProtectedLayout from '@/shared/components/ProtectedLayout.vue'
import { authAndRoleGuard } from '@/router/guards/accessGuards'

const prmTenantAdminRoles = ['global_admin', 'company_admin']
const prmFinanceRoles = ['global_admin', 'company_admin', 'finance_admin']
const prmPartnerChannelRoles = [
  'global_admin',
  'company_admin',
  'partner_admin',
  'partner_sales_manager',
  'partner_sales_consultant',
  'reseller_admin',
  'reseller_sales_manager',
  'reseller_sales_consultant',
]

const routes = [
  { path: '/', component: LandingPage },
  { path: '/login', component: LoginPage },
  { path: '/signup', component: SignUpPage },
  { path: '/forgot-password', component: ForgotPasswordPage },
  { path: '/reset-password', component: ResetPasswordPage },
  { path: '/verify-email/:id/:hash', component: EmailVerificationResultPage },
  { path: '/prm/invite', component: InvitationPreviewPage },
  { path: '/prm/invite/accept', component: InvitationAcceptPage },
  { path: '/partner/invite', component: InvitationPreviewPage },
  { path: '/partner/accept', component: InvitationAcceptPage },
  {
    path: '/app',
    component: ProtectedLayout,
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: DashboardPage },
      { path: 'notifications', component: NotificationCenterPage },
      { path: 'users', component: UsersPage, meta: { roles: ['global_admin', 'company_admin'] } },
      { path: 'tenants', component: TenantsPage, meta: { roles: ['global_admin'] } },
      { path: 'teams', component: TeamsPage, meta: { roles: ['global_admin', 'company_admin'] } },
      { path: 'companies', component: CompaniesPage },
      { path: 'companies/:id', component: CompanyDetailPage },
      { path: 'contacts', component: ContactsPage },
      { path: 'contacts/:id', component: ContactDetailPage },
      { path: 'deals', component: DealsPage },
      { path: 'deals/:id', component: DealDetailPage },
      {
        path: 'demo-links',
        component: DemoLinkListPage,
        meta: { requiredPermissions: ['demo_links.view'] },
      },
      {
        path: 'demo-links/create',
        component: DemoLinkCreatePage,
        meta: { requiredPermissions: ['demo_links.manage'] },
      },
      {
        path: 'demo-links/:id/edit',
        component: DemoLinkEditPage,
        meta: { requiredPermissions: ['demo_links.view'] },
      },
      {
        path: 'demo-links/:id',
        component: DemoLinkDetailPage,
        meta: { requiredPermissions: ['demo_links.view'] },
      },
      { path: 'tasks', component: TaskListPage, meta: { requiredPermissions: ['tasks.view'] } },
      { path: 'products', component: ProductListPage },
      { path: 'products/create', component: ProductCreatePage },
      { path: 'products/:id/edit', component: ProductEditPage },
      { path: 'collaterals', component: CollateralListPage },
      { path: 'quotes', component: QuoteListPage },
      { path: 'quotes/create', component: QuoteCreatePage },
      { path: 'quotes/:id/edit', component: QuoteEditPage },
      { path: 'quotes/:id', component: QuoteDetailPage },
      { path: 'payments', component: PaymentLinksPage },
      { path: 'invoices', component: InvoiceListPage },
      { path: 'invoices/:id', component: InvoiceDetailPage },
      {
        path: 'prm/dashboard',
        component: PartnerDashboardPage,
        meta: {
          roles: [
            'partner_admin',
            'partner_sales_manager',
            'partner_sales_consultant',
            'global_admin',
            'company_admin',
          ],
          requiredFeatures: ['prm_enabled'],
        },
      },
      {
        path: 'prm/reseller-dashboard',
        component: ResellerDashboardPage,
        meta: {
          roles: ['reseller_admin', 'reseller_sales_manager', 'reseller_sales_consultant'],
          requiredFeatures: ['prm_enabled'],
        },
      },
      { path: 'prm/resources', component: PrmResourceCenterPage, meta: { requiredFeatures: ['prm_enabled'] } },
      {
        path: 'prm/my-program',
        component: PartnerMyProgramPage,
        meta: {
          roles: [
            'partner_admin',
            'partner_sales_manager',
            'partner_sales_consultant',
            'reseller_admin',
            'reseller_sales_manager',
            'reseller_sales_consultant',
          ],
          requiredFeatures: ['prm_enabled'],
        },
      },
      { path: 'prm/programs', component: ProgramManagementPage, meta: { roles: prmTenantAdminRoles, requiredFeatures: ['prm_enabled'] } },
      {
        path: 'prm/program-enrollments',
        component: ProgramEnrollmentsPage,
        meta: { roles: prmTenantAdminRoles, requiredFeatures: ['prm_enabled'] },
      },
      { path: 'prm/commissions', component: CommissionPage, meta: { roles: prmPartnerChannelRoles, requiredFeatures: ['prm_enabled'] } },
      { path: 'prm/licenses', component: LicenseManagementPage, meta: { roles: prmPartnerChannelRoles, requiredFeatures: ['prm_enabled'] } },
      {
        path: 'prm/payouts',
        component: PayoutListPage,
        meta: { roles: prmFinanceRoles, requiredFeatures: ['prm_enabled'], requiredPermissions: ['prm.payouts.view'] },
      },
      {
        path: 'prm/payouts/generate',
        component: PayoutGeneratePage,
        meta: { roles: prmFinanceRoles, requiredFeatures: ['prm_enabled'], requiredPermissions: ['prm.payouts.manage'] },
      },
      {
        path: 'prm/payouts/reconciliation',
        component: PayoutReconciliationPage,
        meta: { roles: prmFinanceRoles, requiredFeatures: ['prm_enabled'], requiredPermissions: ['prm.payouts.view'] },
      },
      {
        path: 'prm/payouts/batches',
        component: PayoutBatchPage,
        meta: { roles: prmFinanceRoles, requiredFeatures: ['prm_enabled'], requiredPermissions: ['prm.payouts.manage'] },
      },
      {
        path: 'prm/payouts/adjustments',
        component: PayoutAdjustmentsPage,
        meta: { roles: prmFinanceRoles, requiredFeatures: ['prm_enabled'], requiredPermissions: ['prm.payouts.manage'] },
      },
      {
        path: 'prm/payouts/disputes',
        component: PayoutDisputesPage,
        meta: { roles: prmFinanceRoles, requiredFeatures: ['prm_enabled'] },
      },
      {
        path: 'prm/payouts/accounts',
        component: PayoutAccountsPage,
        meta: { roles: prmPartnerChannelRoles, requiredFeatures: ['prm_enabled'] },
      },
      { path: 'prm/payouts/:id', component: PayoutDetailPage, meta: { roles: prmFinanceRoles, requiredFeatures: ['prm_enabled'] } },
      {
        path: 'prm/partner-payouts',
        component: PartnerPayoutListPage,
        meta: { roles: ['partner_admin', 'global_admin', 'company_admin'], requiredFeatures: ['prm_enabled'] },
      },
      { path: 'prm/partner-payouts/:id', component: PartnerPayoutDetailPage, meta: { roles: ['partner_admin'], requiredFeatures: ['prm_enabled'] } },
      {
        path: 'prm/reseller-payouts',
        component: ResellerPayoutListPage,
        meta: { roles: ['reseller_admin', 'reseller_sales_manager'], requiredFeatures: ['prm_enabled'] },
      },
      { path: 'prm/reseller-payouts/:id', component: ResellerPayoutDetailPage, meta: { roles: ['reseller_admin'], requiredFeatures: ['prm_enabled'] } },
      {
        path: 'organizations',
        component: OrganizationListPage,
        meta: {
          roles: [
            'global_admin',
            'company_admin',
            'partner_admin',
            'partner_sales_manager',
            'partner_sales_consultant',
            'reseller_admin',
            'reseller_sales_consultant',
          ],
        },
      },
      {
        path: 'organizations/create',
        component: OrganizationCreatePage,
        meta: { roles: ['global_admin', 'company_admin', 'partner_admin'] },
      },
      {
        path: 'organizations/:id/invitations',
        component: OrganizationInvitationsPage,
        meta: { roles: ['global_admin', 'company_admin', 'partner_admin'] },
      },
      {
        path: 'organizations/:id',
        component: OrganizationDetailPage,
        meta: {
          roles: [
            'global_admin',
            'company_admin',
            'partner_admin',
            'partner_sales_manager',
            'partner_sales_consultant',
            'reseller_admin',
            'reseller_sales_manager',
            'reseller_sales_consultant',
          ],
        },
      },
      {
        path: 'organizations/:id/team',
        component: ResellerTeamPage,
        meta: {
          roles: ['global_admin', 'company_admin', 'partner_admin', 'reseller_admin'],
        },
      },
      {
        path: 'organizations/:id/edit',
        component: OrganizationEditPage,
        meta: { roles: ['global_admin', 'company_admin', 'partner_admin'] },
      },
      { path: 'settings/payment', component: PaymentSettingsPage, meta: { roles: ['global_admin', 'company_admin'] } },
      {
        path: 'settings/email',
        component: EmailSettingsPage,
        meta: { requiredPermissions: ['email_settings.view'] },
      },
      {
        path: 'settings/audit-logs',
        component: AuditLogListPage,
        meta: { requiredPermissions: ['audit.view'] },
      },
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
  { path: '/demo-links', redirect: '/app/demo-links' },
  { path: '/app/sales/demo-links', redirect: '/app/demo-links' },
  { path: '/app/sales/demo-links/create', redirect: '/app/demo-links/create' },
  { path: '/app/sales/demo-links/:id/edit', redirect: (to) => `/app/demo-links/${to.params.id}/edit` },
  { path: '/app/sales/demo-links/:id', redirect: (to) => `/app/demo-links/${to.params.id}` },
  { path: '/products', redirect: '/app/products' },
  { path: '/collaterals', redirect: '/app/collaterals' },
  { path: '/quotes', redirect: '/app/quotes' },
  { path: '/payments', redirect: '/app/payments' },
  { path: '/invoices', redirect: '/app/invoices' },
  { path: '/organizations', redirect: '/app/organizations' },
  { path: '/audit-logs', redirect: '/app/settings/audit-logs' },
  { path: '/partner/dashboard', redirect: '/app/prm/dashboard' },
  { path: '/partner/reseller-dashboard', redirect: '/app/prm/reseller-dashboard' },
  { path: '/partner/resources', redirect: '/app/prm/resources' },
  { path: '/partner/my-program', redirect: '/app/prm/my-program' },
  { path: '/partner/commissions', redirect: '/app/prm/commissions' },
  { path: '/partner/licenses', redirect: '/app/prm/licenses' },
  { path: '/partner/programs', redirect: '/app/prm/programs' },
  { path: '/partner/program-enrollments', redirect: '/app/prm/program-enrollments' },
  { path: '/partner/leads', redirect: '/app/contacts' },
  { path: '/partner/opportunities', redirect: '/app/deals' },
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
