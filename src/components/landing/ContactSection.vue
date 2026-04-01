<template>
  <section id="contact" class="pt-12 sm:pt-14 md:pt-16 lg:pt-20 pb-8 sm:pb-12 md:pb-16 min-h-screen relative z-10">
    <div class="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 relative z-10">

      <!-- ── Section Heading ── -->
      <div class="mb-6 sm:mb-8 md:mb-10 text-center">
        <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal leading-tight px-2 lg:px-0">
          <span class="text-gradient">Contact Us</span>
        </h2>
        <p class="text-sm text-gray-700 font-normal max-w-4xl mx-auto leading-relaxed mt-4">
          Tell us about your needs and we'll create a tailored solution for your enterprise.
        </p>
        <p class="text-sm text-gray-800 font-bold max-w-fit mx-auto leading-relaxed mt-3 px-5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-md">
          Get in touch for pricing information.
        </p>
      </div>

      <!-- ── Two-Column Grid ── -->
      <div class="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 md:gap-8 lg:gap-10 items-stretch">

        <!-- ════════════════════════════════
             LEFT COLUMN — Info + Map
        ════════════════════════════════ -->
        <div class="flex flex-col h-full gap-4 sm:gap-5">

          <!-- Email Card -->
          <div class="rounded-xl border border-gray-200 bg-white/40 backdrop-blur-md p-4 sm:p-5 md:p-6 hover:border-blue-300/50 hover:shadow-md transition-all duration-300">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" style="color: var(--color-brand-blue)" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs uppercase text-gray-600 mb-2 font-bold tracking-wider">Email</p>
                <a
                  href="mailto:info@reliancecorporation.co.za"
                  class="break-words text-sm sm:text-base font-semibold transition-colors duration-200"
                  style="color: var(--color-brand-blue)"
                  onmouseover="this.style.color='var(--color-brand-teal)'"
                  onmouseout="this.style.color='var(--color-brand-blue)'"
                >
                  info@reliancecorporation.co.za
                </a>
              </div>
            </div>
          </div>

          <!-- Phone Card -->
          <div class="rounded-xl border border-gray-200 bg-white/40 backdrop-blur-md p-4 sm:p-5 md:p-6 hover:border-teal-300/50 hover:shadow-md transition-all duration-300">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-teal-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" style="color: var(--color-brand-teal)" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs uppercase text-gray-600 mb-3 font-bold tracking-wider">Phone</p>
                <div class="space-y-2.5">
                  <div>
                    <p class="text-xs text-gray-600 mb-1 font-normal">Customer Care</p>
                    <a href="tel:+27872502288" class="text-gray-900 font-bold hover:text-[var(--color-brand-teal)] transition-colors duration-200 text-sm sm:text-base">
                      (+27) 87 250 2288
                    </a>
                  </div>
                  <div>
                    <p class="text-xs text-gray-600 mb-1 font-normal">Office</p>
                    <a href="tel:+27104471845" class="text-gray-900 font-bold hover:text-[var(--color-brand-teal)] transition-colors duration-200 text-sm sm:text-base">
                      (+27) 10 447 1845
                    </a>
                  </div>
                  <p class="text-xs text-gray-600 mt-3">Monday – Friday, 08:00 – 17:00</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Card -->
          <div class="rounded-xl border border-gray-200 bg-white/40 backdrop-blur-md p-4 sm:p-5 md:p-6 hover:border-pink-300/50 hover:shadow-md transition-all duration-300">
            <div class="flex items-start gap-3 sm:gap-4">
              <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 sm:w-6 sm:h-6" style="color: var(--color-primary-pink)" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs uppercase text-gray-600 mb-2 font-bold tracking-wider">Address</p>
                <p class="text-gray-900 font-semibold leading-relaxed text-sm sm:text-base">
                  Fish Eagle Office Park 1, Unit 7 &amp; 8<br />
                  Kingfisher Crescent, Meyersdal<br />
                  Alberton, Johannesburg 1448
                </p>
              </div>
            </div>
          </div>

          <!-- Google Map -->
          <div class="rounded-xl border border-gray-200 overflow-hidden flex-1 min-h-[250px] sm:min-h-[280px] shadow-sm">
            <iframe
              src="https://www.google.com/maps?q=Fish+Eagle+Office+Park,+Unit+7+%26+8,+Kingfisher+Crescent,+Meyersdal,+Alberton,+Johannesburg,+1448&output=embed"
              width="100%"
              height="100%"
              style="border: 0"
              allowfullscreen
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              class="w-full h-full"
              title="Reliance Corporation Office Location"
            ></iframe>
          </div>
        </div>

        <!-- ════════════════════════════════
             RIGHT COLUMN — Contact Form
        ════════════════════════════════ -->
        <div class="lg:sticky lg:top-24 self-start">
          <div class="rounded-xl border border-gray-200 bg-white/40 backdrop-blur-md p-5 sm:p-6 md:p-7 lg:p-8 shadow-lg">
            <h3 class="text-lg sm:text-xl font-semibold mb-4 sm:mb-5 text-gray-900">Send us a message</h3>

            <form @submit.prevent="submitForm" class="space-y-4 sm:space-y-5" novalidate>

              <!-- First + Last name -->
              <div class="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label for="firstName" class="block text-sm font-medium text-gray-900 mb-2">First name</label>
                  <input
                    id="firstName"
                    v-model="contactForm.firstName"
                    type="text"
                    required
                    placeholder="First name"
                    class="input-field"
                  />
                </div>
                <div>
                  <label for="lastName" class="block text-sm font-medium text-gray-900 mb-2">Last name</label>
                  <input
                    id="lastName"
                    v-model="contactForm.lastName"
                    type="text"
                    required
                    placeholder="Last name"
                    class="input-field"
                  />
                </div>
              </div>

              <!-- Email -->
              <div>
                <label for="email" class="block text-sm font-medium text-gray-900 mb-2">Email</label>
                <input
                  id="email"
                  v-model="contactForm.email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  class="input-field"
                />
              </div>

              <!-- Phone -->
              <div>
                <label for="phone" class="block text-sm font-medium text-gray-900 mb-2">Phone</label>
                <input
                  id="phone"
                  v-model="contactForm.phone"
                  type="tel"
                  required
                  placeholder="+27 00 000 0000"
                  class="input-field"
                />
              </div>

              <!-- Company size -->
              <div>
                <label for="companySize" class="block text-sm font-medium text-gray-900 mb-2">Company size</label>
                <select
                  id="companySize"
                  v-model="contactForm.companySize"
                  class="input-field"
                >
                  <option value="">Select company size</option>
                  <option value="startup">Startup (1–50 employees)</option>
                  <option value="growth">Growing Business (51–200 employees)</option>
                  <option value="enterprise">Enterprise (200+ employees)</option>
                </select>
              </div>

              <!-- Message -->
              <div>
                <label for="message" class="block text-sm font-medium text-gray-900 mb-2">Message</label>
                <textarea
                  id="message"
                  v-model="contactForm.message"
                  required
                  rows="5"
                  placeholder="Tell us about your needs..."
                  class="input-field resize-none"
                ></textarea>
              </div>

              <!-- Response time notice -->
              <p class="text-sm text-gray-600 flex items-center gap-2">
                <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                We typically respond within 2 hours during business hours
              </p>

              <!-- Submit -->
              <div class="flex justify-end pt-1 sm:pt-2">
                <button
                  type="submit"
                  :disabled="submitting"
                  class="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span>{{ submitting ? 'Sending…' : 'Get Support' }}</span>
                  <svg v-if="!submitting" class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                  </svg>
                </button>
              </div>

              <!-- Success message -->
              <Transition name="fade">
                <p
                  v-if="submitted"
                  class="text-center text-emerald-600 text-sm font-medium bg-emerald-50 rounded-xl py-2.5 border border-emerald-200"
                >
                  ✓ Message sent! We'll get back to you within 2 hours.
                </p>
              </Transition>
            </form>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive } from 'vue'

const contactForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companySize: '',
  message: '',
})

const submitting = ref(false)
const submitted = ref(false)

async function submitForm() {
  submitting.value = true
  await new Promise(r => setTimeout(r, 900))
  submitting.value = false
  submitted.value = true
  Object.assign(contactForm, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companySize: '',
    message: '',
  })
  setTimeout(() => (submitted.value = false), 5000)
}
</script>

<style scoped>
.input-field {
  width: 100%;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  border: 2px solid #9ca3af;
  background-color: white;
  color: #111827;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
}

@media (min-width: 640px) {
  .input-field {
    padding: 0.75rem 1rem;
  }
}

.input-field::placeholder {
  color: #6b7280;
}

.input-field:focus {
  border-color: var(--color-brand-blue);
  box-shadow: 0 0 0 3px rgba(6, 82, 197, 0.12);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
