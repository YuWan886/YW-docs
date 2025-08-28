<template>
  <div class="github-readme-renderer">
    <!-- 头部仓库链接 -->
    <div class="repo-header">
      <a :href="repoUrl" target="_blank" class="repo-link">
        <svg class="github-icon" viewBox="0 0 16 16" width="16" height="16">
          <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
        </svg>
        在GitHub上查看 {{ repoName }}
      </a>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <p>正在加载 README...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p>加载失败: {{ error }}</p>
      <button @click="fetchReadme" class="retry-btn">重试</button>
    </div>
    
    <!-- 内容展示 -->
    <div v-else class="readme-content">
      <div v-html="renderedContent" class="markdown-body"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useData } from 'vitepress'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

// 定义组件属性
const props = defineProps({
  repo: {
    type: String,
    required: true,
    validator: value => {
      return value.includes('/') && value.split('/').length === 2
    }
  }
})

// 使用Vitepress的数据钩子获取主题信息
const { isDark } = useData()

// 响应式数据
const loading = ref(true)
const error = ref(null)
const readmeContent = ref('')
const renderedContent = ref('')

// 计算属性
const repoUrl = computed(() => `https://github.com/${props.repo}`)
const repoName = computed(() => props.repo.split('/')[1])
const readmeApiUrl = computed(() => {
  return `https://api.github.com/repos/${props.repo}/readme`
})

// 缓存键名
const cacheKey = computed(() => `github-readme:${props.repo}`)

// 获取原始README内容
const fetchReadme = async () => {
  try {
    loading.value = true
    error.value = null
    
    // 检查是否有缓存
    const cachedData = getCachedData()
    if (cachedData) {
      readmeContent.value = cachedData.content
      renderMarkdown(cachedData.content)
      loading.value = false
      return
    }
    
    const response = await fetch(readmeApiUrl.value, {
      headers: {
        'Accept': 'application/vnd.github.v3.raw+json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const content = await response.text()
    readmeContent.value = content
    renderMarkdown(content)
    
    // 缓存结果
    cacheData(content)
  } catch (err) {
    console.error('获取README失败:', err)
    error.value = err.message || '未知错误'
  } finally {
    loading.value = false
  }
}

// 从缓存获取数据
const getCachedData = () => {
  try {
    const cached = localStorage.getItem(cacheKey.value)
    if (!cached) return null
    
    const { content, timestamp } = JSON.parse(cached)
    // 检查缓存是否过期（1小时）
    const isExpired = Date.now() - timestamp > 60 * 60 * 1000
    
    return isExpired ? null : { content }
  } catch (e) {
    console.error('读取缓存失败:', e)
    return null
  }
}

// 缓存数据
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

// 渲染Markdown内容
const renderMarkdown = (content) => {
  try {
    // 使用marked解析Markdown
    const rawHtml = marked.parse(content, {
      breaks: true,
      gfm: true,
      headerIds: true, // 确保生成标题ID，便于大纲导航
      mangle: false
    })
    
    // 净化HTML内容
    renderedContent.value = DOMPurify.sanitize(rawHtml)
  } catch (err) {
    console.error('渲染Markdown失败:', err)
    error.value = '渲染内容时出错'
  }
}

// 监听repo变化
watch(() => props.repo, (newRepo) => {
  if (newRepo && newRepo.includes('/')) {
    fetchReadme()
  }
})

// 组件挂载时获取README
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

/* 去除边框 */
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
/* GitHub风格的Markdown样式 */
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
  padding: 0 1em;
  color: var(--vp-c-text-2);
  border-left: 0.25em solid var(--vp-c-divider-light-1);
  margin: 0 0 1em 0;
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

/* 暗色主题适配 */
.dark-theme .markdown-body {
  color: var(--vp-c-text-1);
}

.dark-theme .markdown-body code {
  background-color: var(--vp-c-bg-soft-down);
}

/* 适配Vitepress大纲 */
.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  scroll-margin-top: calc(var(--vp-nav-height) + 32px);
}
</style>