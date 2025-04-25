<template>
    <div class="gallery-container"
         @touchstart="handleTouchStart"
         @touchmove="handleTouchMove"
         @touchend="handleTouchEnd">
        <div class="gallery-wrapper">
            <button class="arrow left" @click="prev" :disabled="currentIndex === 0">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M15 18l-6-6 6-6"/>
                </svg>
            </button>

            <div class="image-container" ref="slider">
                <img v-for="(img, index) in images"
                     :key="index"
                     :src="img.src"
                     :alt="img.alt || ''"
                     :style="{ transform: `translateX(${(index - currentIndex) * 100}%)` }"
                     :class="{ active: currentIndex === index }" />
            </div>

            <button class="arrow right" @click="next" :disabled="currentIndex === images.length - 1">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 18l6-6-6-6"/>
                </svg>
            </button>
        </div>

        <div class="indicators">
            <span v-for="(_, index) in images" :key="index" :class="{ active: currentIndex === index }"
                @click="currentIndex = index" />
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    images: {
        type: Array,
        required: true,
        validator: (arr) => arr.every(item => item.src)
    }
})

const currentIndex = ref(0)
const slider = ref(null)
const touchStartX = ref(0)
const touchEndX = ref(0)
const isDragging = ref(false)

const next = () => {
    if (currentIndex.value < props.images.length - 1) {
        currentIndex.value++
    }
}

const prev = () => {
    if (currentIndex.value > 0) {
        currentIndex.value--
    }
}

const handleTouchStart = (e) => {
    touchStartX.value = e.touches[0].clientX
    isDragging.value = true
}

const handleTouchMove = (e) => {
    if (!isDragging.value) return
    touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
    if (!isDragging.value) return
    
    const threshold = 50
    const diff = touchStartX.value - touchEndX.value
    
    if (diff > threshold) {
        next()
    } else if (diff < -threshold) {
        prev()
    }
    
    isDragging.value = false
}
</script>

<style scoped>
.gallery-container {
    position: relative;
    margin: 2rem 0;
    touch-action: pan-y;
}

.gallery-wrapper {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.image-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    min-height: 300px;
}

img {
    position: absolute;
    width: 100%;
    height: auto;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                opacity 0.3s ease;
    object-fit: contain;
    max-height: 600px;
    will-change: transform;
    opacity: 0;
}

img.active {
    opacity: 1;
    transform: translateX(0) !important;
}

.arrow {
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 0.75rem;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
}

.arrow svg {
    width: 24px;
    height: 24px;
}

.arrow:hover:not(:disabled) {
    background: rgba(0, 0, 0, 0.8);
    transform: scale(1.1);
}

.arrow:disabled {
    opacity: 0.3;
    cursor: not-allowed;
}

.indicators {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1rem;
}

.indicators span {
    display: block;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ccc;
    cursor: pointer;
    transition: all 0.3s ease;
}

.indicators span:hover {
    transform: scale(1.2);
}

.indicators span.active {
    background: #333;
    transform: scale(1.2);
}
</style>