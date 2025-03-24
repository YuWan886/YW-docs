<!-- .vitepress/theme/components/AgreementModal.vue -->
<script>
const DEFAULT_CONFIG = {
  title: '用户协议与隐私政策',
  content: '请仔细阅读并同意还不存在的**霸王协议**',
  interceptPattern: /(quark\.cn|pan\.quark\.cn)/,

  texts: {
    agree: '同意并继续',
    cancel: '暂不同意',
    closeAriaLabel: '关闭协议弹窗'
  },

  media: {
    beforeContent: [],
    afterContent: []
  },

  styles: {
    borderRadius: '12px',
    maxWidth: '720px', // 原始宽度
    spacingUnit: '8px',

    light: {
      background: '#ffffff',
      text: '#2c3e50',
      primary: '#42b983',
      primaryHover: '#3a9d70',
      primaryPressed: '#318562',
      secondary: '#f8f9fa',
      secondaryHover: '#e9ecef',
      secondaryPressed: '#dfe2e5'
    },

    dark: {
      background: '#1a1a1a',
      text: '#ffffff',
      primary: '#3aa876',
      primaryHover: '#318562',
      primaryPressed: '#29674d',
      secondary: '#2d2d2d',
      secondaryHover: '#262626',
      secondaryPressed: '#1f1f1f'
    }
  },

  features: {
    analytics: false,
    version: '1.2.0',
    soundEffects: {
      enable: false,
      volume: 0.6,
      open: '',
      close: ''
    }
  }
}
</script>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import MediaRenderer from './api/MediaRenderer.vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()

const props = defineProps({
  config: {
    type: Object,
    default: () => ({ ...DEFAULT_CONFIG })
  }
})

const showModal = ref(false)
const targetUrl = ref('')

const isDark = computed(() =>
  document.documentElement.classList.contains('dark')
)

const themeStyles = computed(() => {
  // 计算缩放比例
  const scale = 0.66
  const originalMaxWidth = parseInt(props.config.styles.maxWidth)
  const scaledMaxWidth = `${originalMaxWidth * scale}px`
  const scaledMaxHeight = `${(originalMaxWidth * scale * 9) / 16}px`

  return {
    '--bg-color': isDark.value
      ? props.config.styles.dark.background
      : props.config.styles.light.background,
    '--text-color': isDark.value
      ? props.config.styles.dark.text
      : props.config.styles.light.text,
    '--primary-color': isDark.value
      ? props.config.styles.dark.primary
      : props.config.styles.light.primary,
    '--primary-hover-color': isDark.value
      ? props.config.styles.dark.primaryHover
      : props.config.styles.light.primaryHover,
    '--primary-pressed-color': isDark.value
      ? props.config.styles.dark.primaryPressed
      : props.config.styles.light.primaryPressed,
    '--secondary-color': isDark.value
      ? props.config.styles.dark.secondary
      : props.config.styles.light.secondary,
    '--secondary-hover-color': isDark.value
      ? props.config.styles.dark.secondaryHover
      : props.config.styles.light.secondaryHover,
    '--secondary-pressed-color': isDark.value
      ? props.config.styles.dark.secondaryPressed
      : props.config.styles.light.secondaryPressed,
    '--border-radius': props.config.styles.borderRadius,
    '--spacing-unit': props.config.styles.spacingUnit,
    '--max-width': scaledMaxWidth,
    '--max-height': scaledMaxHeight
  }
})

const handleClose = (e) => {
  showModal.value = false
  if (props.config.features.soundEffects.enable) {
    new Audio(props.config.features.soundEffects.close).play().catch(() => { })
  }
}

const handleAgree = () => {
  showModal.value = false
  navigator.vibrate?.(50)
  window.open(targetUrl.value, '_blank', 'noopener,noreferrer')
  localStorage.setItem('agreementVersion', props.config.features.version)
}

const shouldIntercept = (url) => {
  try {
    const absoluteURL = new URL(url, window.location.href).href
    return props.config.interceptPattern.test(absoluteURL)
  } catch {
    return props.config.interceptPattern.test(url)
  }
}

const handleExternalLink = (e) => {
  const link = e.target.closest('a')
  if (link) {
    const href = link.getAttribute('href')
    if (href && shouldIntercept(href)) {
      e.preventDefault()
      e.stopPropagation()
      targetUrl.value = href
      showModal.value = true
      if (props.config.features.soundEffects.enable) {
        new Audio(props.config.features.soundEffects.open).play().catch(() => { })
      }
    }
  }
}

const parsedTitle = computed(() => md.render(props.config.title))
const parsedContent = computed(() => md.render(props.config.content))

onMounted(() => {
  document.addEventListener('click', handleExternalLink, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleExternalLink, true)
})
</script>

<template>
  <div v-if="showModal" class="agreement-modal" :style="themeStyles" @click.self="handleClose">
    <transition name="content-transition">
      <div class="modal-container" v-if="showModal">
        <button class="modal-close" @click="handleClose" :aria-label="config.texts.closeAriaLabel">
          <svg class="close-icon" viewBox="0 0 24 24">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div class="modal-body">
          <MediaRenderer v-if="config.media.beforeContent && config.media.beforeContent.length"
            :media-items="config.media.beforeContent" class="pre-content-media" />

          <div class="content-wrapper">
            <h1 class="modal-title" v-html="parsedTitle"></h1>
            <div class="agreement-content" v-html="parsedContent" />

            <MediaRenderer v-if="config.media.afterContent && config.media.afterContent.length"
              :media-items="config.media.afterContent" class="post-content-media" />
          </div>

          <div class="action-buttons">
            <button class="agree-button" @click="handleAgree">
              {{ config.texts.agree }}
            </button>
            <button class="cancel-button" @click="handleClose">
              {{ config.texts.cancel }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.agreement-modal {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(3px);
}

.modal-container {
  position: relative;
  background: var(--bg-color);
  border-radius: var(--border-radius);
  width: 90%;
  max-width: var(--max-width, 475px);
  /* 缩放后的最大宽度 */
  max-height: var(--max-height, 267px);
  /* 缩放后的最大高度，保持16:9比例 */
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  margin: 2vmax;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止内容溢出 */
}

.content-transition-enter-active,
.content-transition-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform, opacity;
}

.content-transition-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.content-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

.modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
}

.close-icon {
  width: 24px;
  height: 24px;
  fill: var(--text-color);
  opacity: 0.7;
  transition: opacity 0.2s;
}

.modal-close:hover .close-icon {
  opacity: 1;
}

.modal-body {
  padding: min(32px, 3vmax);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-title {
  margin: 0 0 16px;
  /* 调整下边距以适应缩小尺寸 */
  font-size: 1.2em;
  /* 调整字体大小 */
  color: var(--primary-color);
  text-align: center;
}

.agreement-content {
  flex: 1;
  overflow-y: auto;
  line-height: 1.6;
  font-size: 0.9rem;
  /* 调整字体大小 */
}

.action-buttons {
  display: flex;
  gap: min(8px, 1vmin);
  margin-top: 16px;
  /* 调整上边距 */
}

.agree-button,
.cancel-button {
  flex: 1;
  padding: 0.5rem 1rem;
  /* 进一步减少内边距 */
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  /* 调整字体大小 */
  cursor: pointer;
  transition: all 0.2s ease;
}

.agree-button {
  background: var(--primary-color);
  color: white;
}

.agree-button:hover {
  background: var(--primary-hover-color);
  box-shadow: 0 3px 12px rgba(66, 185, 131, 0.3);
}

.agree-button:active {
  background: var(--primary-pressed-color);
  transform: scale(0.98);
}

.cancel-button {
  background: var(--secondary-color);
  color: var(--text-color);
}

.cancel-button:hover {
  background: var(--secondary-hover-color);
}

.cancel-button:active {
  background: var(--secondary-pressed-color);
  transform: scale(0.98);
}

@media (max-width: 640px) {
  .modal-container {
    margin: 8px;
    width: calc(100% - 16px);
    max-height: calc((100% - 16px) * 9 / 16);
    /* 16:9比例 */
  }

  .modal-title {
    font-size: 1rem;
    margin-bottom: 12px;
  }

  .agreement-content {
    font-size: 0.85rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 12px;
  }

  .agree-button,
  .cancel-button {
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
  }
}
</style>