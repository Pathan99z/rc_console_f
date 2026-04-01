<template>
  <section id="features" class="py-24" style="background: #f8fafc">
    <div class="container-custom">

      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <div
          class="inline-block text-sm font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
          style="color: var(--color-primary-purple); background-color: rgba(122,47,240,0.08)"
        >
          Features
        </div>
        <h2 class="text-4xl font-bold text-gray-900">
          Everything You Need to <span class="text-gradient">Scale Sales</span>
        </h2>
        <p class="text-gray-500 text-lg">
          A complete platform for managing every layer of your distribution network.
        </p>
      </div>

      <!-- Feature Cards Grid -->
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
          v-for="feature in features"
          :key="feature.title"
          v-bind="feature"
        />
      </div>

    </div>
  </section>
</template>

<script setup>
import FeatureCard from './FeatureCard.vue'

const features = [
  {
    icon: '🏗️',
    title: 'Multi-Tier Ecosystem',
    description: 'Build a structured distribution hierarchy with internal teams, channel partners, and resellers.',
    points: [
      'Internal + Partner + Reseller structure',
      'Lead routing & assignment',
      'Hierarchy management',
    ],
    color: '#7A2FF0',
  },
  {
    icon: '📈',
    title: 'Sales Lifecycle Management',
    description: 'Track every deal from lead to activation with full pipeline transparency.',
    points: [
      'Lead → Deal → Activation flow',
      'Pipeline tracking & forecasting',
      'Activity timeline',
    ],
    color: '#E23DAD',
  },
  {
    icon: '🔐',
    title: 'Role-Based Access (RBAC)',
    description: 'Granular permissions and data isolation to keep your data secure at every tier.',
    points: [
      'Secure permission controls',
      'Data isolation per tier',
      'Audit logs & compliance',
    ],
    color: '#0652c5',
  },
  {
    icon: '📋',
    title: 'Licence Distribution',
    description: 'Allocate, transfer, and track licences across your entire distribution network.',
    points: [
      'Allocate across tiers',
      'Track usage & expiry',
      'Automated renewals',
    ],
    color: '#2596be',
  },
  {
    icon: '💳',
    title: 'Payment Workflow',
    description: 'Streamline payments with wallet management, credit systems, and approval flows.',
    points: [
      'Wallet & credit system',
      'Multi-level approval flow',
      'Payment reconciliation',
    ],
    color: '#E23DAD',
  },
  {
    icon: '📊',
    title: 'Dashboards & Insights',
    description: 'Real-time analytics and performance metrics for every tier in your network.',
    points: [
      'Revenue tracking',
      'Performance analytics',
      'Custom report builder',
    ],
    color: '#7A2FF0',
  },
]
</script>
