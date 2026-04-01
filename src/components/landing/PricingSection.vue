<template>
  <section id="pricing" class="py-24" style="background: white">
    <div class="container-custom">

      <!-- Section Header -->
      <div class="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <div
          class="inline-block text-sm font-semibold tracking-widest uppercase px-3 py-1 rounded-full"
          style="color: var(--color-primary-purple); background-color: rgba(122,47,240,0.08)"
        >
          Pricing
        </div>
        <h2 class="text-4xl font-bold text-gray-900">
          Simple, <span class="text-gradient">Transparent Pricing</span>
        </h2>
        <p class="text-gray-500 text-lg">
          Choose the plan that fits your distribution scale. No hidden fees.
        </p>
      </div>

      <!-- Pricing Cards -->
      <div class="grid md:grid-cols-3 gap-8 items-start max-w-5xl mx-auto">
        <PricingCard
          v-for="plan in plans"
          :key="plan.name"
          v-bind="plan"
        />
      </div>

      <!-- Footer note -->
      <p class="text-center text-sm text-gray-400 mt-10">
        All plans include a 14-day free trial. No credit card required.
      </p>

    </div>
  </section>
</template>

<script setup>
import PricingCard from './PricingCard.vue'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    period: 'mo',
    tagline: 'Perfect for small internal sales teams getting started.',
    features: [
      'Internal sales CRM',
      'Lead & pipeline management',
      'Basic reporting & analytics',
      'Up to 10 users',
      'Email support',
    ],
    cta: 'Get Started',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$149',
    period: 'mo',
    tagline: 'Scale your distribution with partners and resellers.',
    features: [
      'Everything in Starter',
      'Partner & reseller system',
      'Licence distribution',
      'Payment workflow',
      'Up to 100 users',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: null,
    tagline: 'Full-scale enterprise distribution with unlimited power.',
    features: [
      'Everything in Growth',
      'Full RBAC & data isolation',
      'Advanced analytics & BI',
      'Custom workflows',
      'Unlimited users',
      'Dedicated account manager',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
]
</script>
