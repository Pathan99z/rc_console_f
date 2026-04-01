<template>
  <div class="min-h-screen">
    <Header />
    <main>
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <PricingSection />
      <ContactSection />
    </main>
    <FooterSection />
  </div>
</template>

<script setup>
import Header from './Header.vue'
import HeroSection from './HeroSection.vue'
import AboutSection from './AboutSection.vue'
import FeaturesSection from './FeaturesSection.vue'
import PricingSection from './PricingSection.vue'
import ContactSection from './ContactSection.vue'
import FooterSection from './FooterSection.vue'
</script>
