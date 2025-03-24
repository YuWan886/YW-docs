<template>
    <div class="tag-page-container">
        <h1 class="tag-page-title">标签</h1>

        <div class="tag-filter">
            <transition-group name="fade" tag="div" class="selected-tags" v-if="selectedTags.length">
                <span v-for="tag in selectedTags" :key="tag" class="selected-tag">
                    {{ tag }}
                    <button @click="deselectTag(tag)" class="remove-tag">×</button>
                </span>
            </transition-group>
            <div class="all-tags">
                <label v-for="tag in sortedTags" :key="tag.name" class="tag-checkbox">
                    <input type="checkbox" :value="tag.name" v-model="selectedTags" @change="updateTags" />
                    <span class="tag-name">{{ tag.name }}</span>
                    <span class="tag-count">({{ tag.count }})</span>
                </label>
            </div>
        </div>

        <div v-if="!selectedTags.length" class="random-posts">
            <h2>随机推荐</h2>
            <div class="random-posts-list">
                <a v-for="post in randomPosts" :key="post.url" :href="post.url" class="random-post-link">
                    <img :src="post.cover || defaultCover" class="post-cover" loading="lazy" />
                    <div class="random-post-info">
                        <h3 class="post-title">{{ post.title }}</h3>
                        <div class="post-meta">
                            <div class="meta-item">
                                <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>{{ formatDate(post.updated.time) }}</span>
                            </div>
                            <div class="separator">|</div>
                            <div class="meta-item">
                                <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>{{ formatDate(post.created.time) }}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
        </div>

        <template v-else>
            <div v-for="year in groupedPosts.sortedYears" :key="year" class="year-section">
                <div class="year-header">
                    <h2>{{ year }}年</h2>
                </div>
                <div v-for="(monthData, month) in groupedPosts.yearMap[year]" :key="month" class="month-section">
                    <div class="month-header">
                        <div class="month-title">{{ month }}月</div>
                        <div class="month-line"></div>
                    </div>
                    <div class="posts-container">
                        <a v-for="post in monthData.posts" :key="post.url" :href="post.url" class="post-link">
                            <div class="post-content">
                                <img :src="post.cover || defaultCover" class="post-cover" loading="lazy" />
                                <h3 class="post-title">{{ post.title }}</h3>
                                <div class="post-meta">
                                    <div class="meta-item">
                                        <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>{{ formatDate(post.updated.time) }}</span>
                                    </div>
                                    <div class="separator">|</div>
                                    <div class="meta-item">
                                        <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
                                            viewBox="0 0 24 24" stroke="currentColor">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span>{{ formatDate(post.created.time) }}</span>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
        </template>

        <button v-if="showBackToTop" @click="scrollToTop" class="back-to-top">
            ↑ 返回顶部
        </button>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { data as postsData } from '../utils/post.data.ts'

const defaultCover = ref('/img/logo.png') // 修改默认封面路径为 /img/logo.png
const randomPostCount = 5
const selectedTags = ref([])

// 处理标签数据
const processedTags = computed(() => {
    const tagMap = new Map()
    postsData.forEach(post => {
        post.tags.forEach(tag => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
        })
    })
    return Array.from(tagMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
})

const sortedTags = computed(() => processedTags.value)

// 过滤后的文章
const filteredPosts = computed(() => {
    if (selectedTags.value.length) {
        return postsData.filter(post => selectedTags.value.every(tag => post.tags.includes(tag)))
    }
    return []
})

// 随机推荐的文章
const randomPosts = computed(() => {
    const shuffled = [...postsData].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, randomPostCount)
})

// 分组归档
const groupedPosts = computed(() => {
    const archiveMap = {}
    filteredPosts.value.forEach(post => {
        const date = new Date(post.updated.time)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        if (!archiveMap[year]) archiveMap[year] = {}
        if (!archiveMap[year][month]) archiveMap[year][month] = { posts: [] }
        archiveMap[year][month].posts.push(post)
    })
    return {
        sortedYears: Object.keys(archiveMap).sort((a, b) => b - a),
        yearMap: archiveMap
    }
})

// 取消选择标签
const deselectTag = (tag) => {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
    updateURLTags()
}

// 返回顶部按钮
const showBackToTop = ref(false)
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
    showBackToTop.value = window.scrollY > 300
}

// 更新URL中的标签参数
const updateURLTags = () => {
    const params = new URLSearchParams(window.location.search)
    if (selectedTags.value.length > 0) {
        // 删除所有现有的'tag'参数
        params.delete('tag')
        // 添加当前选中的所有'tag'参数
        selectedTags.value.forEach(tag => {
            params.append('tag', tag)
        })
    } else {
        params.delete('tag')
    }
    const newURL = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newURL)
}

// 解析URL中的标签参数
const parseURLTags = () => {
    const params = new URLSearchParams(window.location.search)
    const tags = params.getAll('tag')
    selectedTags.value = tags
}

// 监听标签变化并更新URL
watch(selectedTags, (newTags) => {
    updateURLTags()
})

// 初始化
onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    parseURLTags()
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

// 日期格式化函数
const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}
</script>

<style scoped>
.tag-page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: 'Arial, sans-serif';
    background-color: var(--vp-c-bg);
    color: var(--vp-c-text-1);
}

.tag-page-title {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 2rem;
    color: var(--vp-c-text-1);
    animation: fadeInDown 0.6s ease-out;
}

/* 标签选择栏样式 */
.tag-filter {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--vp-c-bg-soft);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease;
}

/* 过渡效果 */
.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
    transform: translateY(-10px);
}

.selected-tag {
    display: flex;
    align-items: center;
    padding: 6px 12px;
    background: var(--vp-c-brand);
    color: var(--vp-c-text-inverse-1);
    border-radius: 20px;
    font-size: 0.9rem;
    transition: background 0.3s ease, transform 0.3s ease;
}

.selected-tag:hover {
    background: var(--vp-c-brand-dark);
    transform: scale(1.05);
}

.remove-tag {
    background: transparent;
    border: none;
    color: var(--vp-c-text-inverse-1);
    margin-left: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: color 0.3s ease;
}

.remove-tag:hover {
    color: var(--vp-c-text-inverse-2);
}

.all-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.tag-checkbox {
    display: flex;
    align-items: center;
    background: var(--vp-c-bg-soft);
    padding: 6px 12px;
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease;
}

.tag-checkbox:hover {
    background: var(--vp-c-bg-soft-up);
    transform: scale(1.05);
}

.tag-checkbox input {
    display: none;
}

.tag-name {
    margin-right: 6px;
    font-weight: 500;
    color: var(--vp-c-text-1);
}

.tag-count {
    color: var(--vp-c-text-2);
}

/* 随机推荐样式 */
.random-posts {
    margin-top: 2rem;
}

.random-posts h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: var(--vp-c-text-1);
    animation: fadeInDown 0.6s ease-out;
}

.random-posts-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.random-post-link {
    display: flex;
    flex-direction: column;
    background: var(--vp-c-bg-soft);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.random-post-link:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.post-cover {
    width: 100%;
    height: 150px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.random-post-link:hover .post-cover {
    transform: scale(1.05);
}

.random-post-info {
    padding: 1rem;
    position: relative;
}

.post-title {
    text-align: center;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    color: var(--vp-c-text-1);
}

.post-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: var(--vp-c-text-2);
}

.post-meta {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    color: var(--vp-c-text-2);
}

.meta-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
}

.separator {
    margin: 0 8px;
}

/* 年份和月份部分 */
.year-section {
    margin-bottom: 2rem;
}

.year-header {
    background: var(--vp-c-brand);
    color: var(--vp-c-text-inverse-1);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    margin-bottom: 1rem;
    animation: fadeInDown 0.6s ease-out;
}

.month-section {
    margin-bottom: 1.5rem;
}

.month-header {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
}

.month-title {
    font-size: 1.5rem;
    color: var(--vp-c-brand);
    margin-right: 1rem;
}

.month-line {
    flex-grow: 1;
    height: 2px;
    background: var(--vp-c-brand);
    border-radius: 1px;
}

.posts-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.2rem;
}

.post-link {
    display: flex;
    flex-direction: column;
    background: var(--vp-c-bg-soft);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.post-link:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.post-content {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.post-content img.post-cover {
    width: 100%;
    height: 150px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.post-link:hover .post-content img.post-cover {
    transform: scale(1.05);
}

.post-title {
    text-align: center;
    font-size: 1.2rem;
    margin: 1rem 0 0.5rem 0;
    color: #333;
}

.post-meta {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-size: 0.85rem;
    color: #777;
    padding: 0 1rem 1rem 1rem;
}

/* 返回顶部按钮 */
.back-to-top {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 0.75rem 1.25rem;
    background-color: var(--vp-c-brand);
    color: var(--vp-c-text-inverse-1);
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: background-color var(--transition-duration), opacity var(--transition-duration), transform var(--transition-duration);
    opacity: 0.8;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-to-top:hover {
    background-color: var(--vp-c-brand-dark);
    opacity: 1;
    transform: translateY(-3px);
}

/* 动画效果 */
@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .tag-page-container {
        padding: 1rem;
    }

    .random-posts-list,
    .posts-container {
        grid-template-columns: 1fr;
    }

    .post-cover {
        height: 200px;
    }

    .post-title {
        font-size: 1.1rem;
    }

    .back-to-top {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
}

@media (prefers-color-scheme: dark) {
    .tag-page-container {
        background-color: var(--vp-c-bg);
        color: var(--vp-c-text-1);
    }

    .tag-filter {
        background: var(--vp-c-bg-soft);
    }

    .random-post-link {
        background: var(--vp-c-bg-soft);
    }

    .post-link {
        background: var(--vp-c-bg-soft);
    }

    .month-title {
        color: var(--vp-c-brand);
    }

    .month-line {
        background: var(--vp-c-brand);
    }
}
</style>