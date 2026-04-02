<template>
  <div class="github-readme-renderer">
    <div class="repo-header">
      <a :href="repoUrl" target="_blank" class="repo-link">
        在GitHub上查看 {{ repoName }}
      </a>
    </div>
    
    <div v-if="loading" class="loading-container">
      <p>正在加载 README...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p>加载失败: {{ error }}</p>
      <button @click="fetchReadme" class="retry-btn">重试</button>
    </div>
    
    <div v-else class="readme-content">
      <div v-html="renderedContent" class="markdown-body"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useData } from 'vitepress'
import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
})

const props = defineProps({
  repo: {
    type: String,
    required: true,
    validator: value => {
      return value.includes('/') && value.split('/').length === 2
    }
  }
})

const { isDark } = useData()

const loading = ref(true)
const error = ref(null)
const readmeContent = ref('')
const renderedContent = ref('')

const repoUrl = computed(() => `https://github.com/${props.repo}`)
const repoName = computed(() => props.repo.split('/')[1])
const readmeApiUrl = computed(() => {
  return `https://api.github.com/repos/${props.repo}/readme`
})

const cacheKey = computed(() => `github-readme:${props.repo}`)

const fetchReadme = async () => {
  try {
    loading.value = true
    error.value = null
    
    const cachedData = getCachedData()
    if (cachedData) {
      readmeContent.value = cachedData.content
      renderMarkdown(cachedData.content)
      loading.value = false
      return
    }
    
    const response = await fetch(readmeApiUrl.value, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const content = await response.text()
    readmeContent.value = content
    renderMarkdown(content)
    
    cacheData(content)
  } catch (err) {
    console.error('获取README失败:', err)
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
}

const getCachedData = () => {
  try {
    const cached = localStorage.getItem(cacheKey.value)
    if (!cached) return null
    
    const { content, timestamp } = JSON.parse(cached)
    const isExpired = Date.now() - timestamp > 60 * 60 * 1000
    
    return isExpired ? null : { content }
  } catch (e) {
    console.error('读取缓存失败:', e)
    return null
  }
}

const cacheData = (content) => {
  try {
    const data = {
      content,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey.value, JSON.stringify(data))
  } catch (e) {
    console.error('缓存数据失败:', e)
  }
}

const renderMarkdown = (content) => {
  try {
    let processedContent = content
    
    const baseUrl = `https://raw.githubusercontent.com/${props.repo}/main/`
    processedContent = processedContent.replace(
      /src=["']([^"']+)["']/gi,
      (match, src) => {
        if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.startsWith('data:')) {
          return match
        }
        const normalizedSrc = src.replace(/\\/g, '/')
        const absoluteUrl = baseUrl + normalizedSrc
        return `src="${absoluteUrl}"`
      }
    )
    
    const repoUrl = `https://github.com/${props.repo}/blob/main/`
    processedContent = processedContent.replace(
      /href=["']([^"']+)["']/gi,
      (match, href) => {
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//') || href.startsWith('#') || href.startsWith('mailto:')) {
          return match
        }
        const normalizedHref = href.replace(/\\/g, '/')
        const absoluteUrl = repoUrl + normalizedHref
        return `href="${absoluteUrl}"`
      }
    )
    
    const rawHtml = md.render(processedContent)
    
    let processedHtml = rawHtml
    
    processedHtml = processedHtml.replace(
      /<blockquote>\s*<p>\[!(IMPORTANT|WARNING|NOTE|TIP|CAUTION)\]<br>\s*([\s\S]*?)<\/p>\s*<\/blockquote>/gi,
      (match, type, content) => {
        const alertType = type.toLowerCase()
        return `<div class="github-alert github-alert-${alertType}"><p>${content}</p></div>`
      }
    )
    
    processedHtml = processedHtml.replace(/<a\s+href="https?:\/\//gi, '<a target="_blank" rel="noopener noreferrer" href="https://')
    
    renderedContent.value = DOMPurify.sanitize(processedHtml, {
      ADD_TAGS: ['details', 'summary'],
      ADD_ATTR: ['align', 'target', 'rel', 'class']
    })
  } catch (err) {
    console.error('渲染Markdown失败:', err)
    error.value = '渲染内容时出错'
  }
}

watch(() => props.repo, (newRepo) => {
  if (newRepo && newRepo.includes('/')) {
    fetchReadme()
  }
})

onMounted(() => {
  if (props.repo && props.repo.includes('/')) {
    fetchReadme()
  } else {
    error.value = '仓库名称格式不正确，请使用"用户/仓库"格式'
    loading.value = false
  }
})
</script>

<style scoped>
.github-readme-renderer {
  margin: 2rem 0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.github-readme-renderer,
.readme-content,
.markdown-body {
  border: none !important;
  outline: none !important;
}

.repo-header {
  padding: 12px 16px;
  background-color: var(--vp-c-bg-soft-down);
  border-bottom: 1px solid var(--vp-c-divider-light-1);
  display: flex;
  align-items: center;
  font-size: 0.9rem;
}

.github-icon {
  margin-right: 8px;
}

.repo-link {
  color: var(--vp-c-brand);
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
}

.repo-link:hover {
  text-decoration: underline;
  color: var(--vp-c-brand-dark);
}

.loading-container, .error-container {
  padding: 2rem;
  text-align: center;
}

.error-container {
  color: var(--vp-c-red);
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: var(--vp-button-brand-bg);
  color: var(--vp-button-brand-text);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.25s;
}

.retry-btn:hover {
  background-color: var(--vp-button-brand-hover-bg);
}
</style>

<style>
.markdown-body {
  padding: 2rem;
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
  background-color: var(--vp-c-bg-soft);
}

.markdown-body :where(h1, h2, h3, h4, h5, h6) {
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
  line-height: 1.25;
  padding-bottom: 0;
  border-bottom: none !important;
}

.markdown-body h1 {
  font-size: 2em;
  padding-bottom: 0.3em;
}

.markdown-body h2 {
  font-size: 1.5em;
  padding-bottom: 0.3em;
}

.markdown-body h3 {
  font-size: 1.25em;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 1em;
}

.markdown-body ul, .markdown-body ol {
  margin-top: 0;
  margin-bottom: 1em;
  padding-left: 2em;
}

.markdown-body li {
  margin-bottom: 0.25em;
}

.markdown-body code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 0.85em;
  background-color: var(--vp-c-bg-soft-down);
  border-radius: 3px;
  font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace;
}

.markdown-body pre {
  padding: 1em;
  overflow: auto;
  font-size: 0.85em;
  line-height: 1.45;
  background-color: var(--vp-c-bg-soft-down);
  border-radius: 3px;
  margin-bottom: 1em;
}

.markdown-body pre code {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
}

.markdown-body blockquote {
  padding: 0.5em 1em;
  color: var(--vp-c-text-2);
  border-left: 0.25em solid var(--vp-c-divider-light-1);
  margin: 0 0 1em 0;
}

.markdown-body .github-alert {
  padding: 0.75em 1em;
  margin: 1em 0;
  border-left-width: 0.25em;
  border-left-style: solid;
  border-radius: 6px;
}

.markdown-body .github-alert-important {
  border-left-color: #0969da;
  background-color: #ddf4ff;
}

.markdown-body .github-alert-warning {
  border-left-color: #bf8700;
  background-color: #fff8c5;
}

.markdown-body .github-alert-note {
  border-left-color: #8250df;
  background-color: #f3e8ff;
}

.markdown-body .github-alert-tip {
  border-left-color: #1a7f37;
  background-color: #dafbe1;
}

.markdown-body .github-alert-caution {
  border-left-color: #cf222e;
  background-color: #ffebe9;
}

.dark .markdown-body .github-alert-important {
  background-color: rgba(56, 139, 253, 0.1);
}

.dark .markdown-body .github-alert-warning {
  background-color: rgba(187, 128, 9, 0.1);
}

.dark .markdown-body .github-alert-note {
  background-color: rgba(137, 87, 229, 0.1);
}

.dark .markdown-body .github-alert-tip {
  background-color: rgba(35, 134, 54, 0.1);
}

.dark .markdown-body .github-alert-caution {
  background-color: rgba(207, 34, 46, 0.1);
}

.markdown-body table {
  display: block;
  width: 100%;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin-bottom: 1em;
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-body table th {
  font-weight: 600;
  background-color: var(--vp-c-bg-soft-down);
}

.markdown-body table th, .markdown-body table td {
  padding: 0.5em 1em;
  border: 1px solid var(--vp-c-divider-light-1);
}

.markdown-body img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.markdown-body a {
  color: var(--vp-c-brand);
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.dark .markdown-body {
  color: var(--vp-c-text-1);
}

.dark .markdown-body code {
  background-color: var(--vp-c-bg-soft-down);
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  scroll-margin-top: calc(var(--vp-nav-height) + 32px);
}

.markdown-body div[align="center"] {
  text-align: center;
}

.markdown-body div[align="center"] img {
  display: inline-block;
}

.markdown-body .github-alert::before {
  font-weight: 600;
  margin-right: 0.5em;
}

.markdown-body .github-alert-important::before {
  content: "⚠️ IMPORTANT";
  color: #0969da;
}

.markdown-body .github-alert-warning::before {
  content: "⚠️ WARNING";
  color: #bf8700;
}

.markdown-body .github-alert-note::before {
  content: "📝 NOTE";
  color: #8250df;
}

.markdown-body .github-alert-tip::before {
  content: "💡 TIP";
  color: #1a7f37;
}

.markdown-body .github-alert-caution::before {
  content: "🚨 CAUTION";
  color: #cf222e;
}
</style>