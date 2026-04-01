<template>
  <div class="layout-text-flip" :class="className">
    <span v-if="text" class="prefix-text">{{ text }}&nbsp;</span>

    <span class="flip-container" aria-live="polite">
      <Transition name="flip" mode="out-in">
        <span :key="currentWord" class="flip-word">{{ currentWord }}</span>
      </Transition>
    </span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
  words: {
    type: Array,
    default: () => [],
  },
  className: {
    type: String,
    default: '',
  },
  interval: {
    type: Number,
    default: 2800,
  },
})

const currentIndex = ref(0)
const currentWord = ref(props.words[0] ?? '')

let timer = null

onMounted(() => {
  if (props.words.length <= 1) return
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % props.words.length
    currentWord.value = props.words[currentIndex.value]
  }, props.interval)
})

onUnmounted(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.layout-text-flip {
  display: flex;
  align-items: center;
  overflow: hidden;
}

.flip-container {
  display: inline-block;
  overflow: hidden;
  position: relative;
}

/* Slide-up flip transition */
.flip-enter-active {
  animation: flipIn 0.45s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
}

.flip-leave-active {
  animation: flipOut 0.3s cubic-bezier(0.55, 0, 1, 0.45) forwards;
}

@keyframes flipIn {
  from {
    opacity: 0;
    transform: translateY(100%) rotateX(-30deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
}

@keyframes flipOut {
  from {
    opacity: 1;
    transform: translateY(0) rotateX(0deg);
  }
  to {
    opacity: 0;
    transform: translateY(-80%) rotateX(20deg);
  }
}
</style>
