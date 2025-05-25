<template>
    <div class="tag-page-container">
        <h1 class="tag-page-title">标签</h1>

        <div class="tag-filter">
            <div class="filter-mode">
                <label>
                    <input type="radio" value="all" v-model="filterMode" />
                    匹配全部标签
                </label>
                <label>
                    <input type="radio" value="any" v-model="filterMode" />
                    匹配任何标签
                </label>
            </div>

            <transition-group name="fade" tag="div" class="selected-tags" v-if="selectedTags.length">
                <span v-for="tag in selectedTags" :key="tag" class="selected-tag">
                    {{ tag }}
                    <button @click="deselectTag(tag)" class="remove-tag">×</button>
                </span>
            </transition-group>

            <div class="all-tags">
                <div v-for="tag in sortedTags" :key="tag.name" class="tag-chip" 
                     :class="{ selected: selectedTags.includes(tag.name) }" 
                     @click="toggleTag(tag.name)">
                    <span class="tag-name">{{ tag.name }}</span>
                    <span class="tag-count">({{ tag.count }})</span>
                </div>
            </div>
        </div>

        <transition name="fade" mode="out-in">
            <div v-if="!selectedTags.length" class="random-posts" key="random">
                <h2>随机推荐</h2>
                <div class="random-posts-list">
                    <a v-for="post in randomPosts" :key="post.url" :href="post.url" class="random-post-link">
                        <img :src="post.cover || defaultCover" class="post-cover" loading="lazy" />
                        <div class="random-post-info">
                            <h3 class="post-title">{{ post.title }}</h3>
                            <div class="post-meta">
                                <div class="meta-item">
                                    <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span>{{ formatDate(post.updated.time) }}</span>
                                </div>
                                <div class="separator">|</div>
                                <div class="meta-item">
                                    <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span>{{ formatDate(post.created.time) }}</span>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>

            <div v-else class="filtered-posts" key="filtered">
                <div v-if="filteredPosts.length === 0" class="no-posts">
                    No posts found with the selected tags.
                </div>
                <div v-else>
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
                                                <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                <span>{{ formatDate(post.updated.time) }}</span>
                                            </div>
                                            <div class="separator">|</div>
                                            <div class="meta-item">
                                                <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{{ formatDate(post.created.time) }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>

        <button v-if="showBackToTop" @click="scrollToTop" class="back-to-top">
            ↑ 返回顶部
        </button>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { data as postsData } from '../utils/post.data.ts'

const defaultCover = ref('/img/logo.png')
const randomPostCount = 8
const selectedTags = ref([])
const filterMode = ref('all')

// Process tags
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

// Filter posts based on selected tags and filter mode
const filteredPosts = computed(() => {
    if (selectedTags.value.length) {
        if (filterMode.value === 'all') {
            return postsData.filter(post => selectedTags.value.every(tag => post.tags.includes(tag)))
        } else {
            return postsData.filter(post => selectedTags.value.some(tag => post.tags.includes(tag)))
        }
    }
    return []
})

// Random posts
const randomPosts = computed(() => {
    const shuffled = [...postsData].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, randomPostCount)
})

// Group filtered posts by year and month
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

// Tag selection handlers
const toggleTag = (tag) => {
    if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter(t => t !== tag)
    } else {
        selectedTags.value = [...selectedTags.value, tag]
    }
}

const deselectTag = (tag) => {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
}

// Back to top functionality
const showBackToTop = ref(false)
const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
    showBackToTop.value = window.scrollY > 300
}

// URL parameter handling
const updateURLParams = () => {
    const params = new URLSearchParams()
    if (selectedTags.value.length > 0) {
        selectedTags.value.forEach(tag => {
            params.append('tag', tag)
        })
    }
    params.set('filterMode', filterMode.value)
    const newURL = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, '', newURL)
}

const parseURLParams = () => {
    const params = new URLSearchParams(window.location.search)
    const tags = params.getAll('tag')
    selectedTags.value = tags
    const mode = params.get('filterMode')
    filterMode.value = (mode === 'all' || mode === 'any') ? mode : 'all'
}

// Watch for changes
watch([selectedTags, filterMode], () => {
    updateURLParams()
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    parseURLParams()
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

// Date formatting
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

.tag-filter {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: var(--vp-c-bg-soft);
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: background 0.3s ease;
}

.filter-mode {
    margin-bottom: 1rem;
}

.filter-mode label {
    margin-right: 1rem;
    cursor: pointer;
}

.selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 1rem;
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

.tag-chip {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    background: var(--vp-c-bg-soft);
    border-radius: 20px;
    cursor: pointer;
    transition: background 0.3s ease, transform 0.3s ease;
    margin-right: 8px;
    margin-bottom: 8px;
}

.tag-chip:hover {
    background: var(--vp-c-bg-soft-up);
    transform: scale(1.05);
}

.tag-chip.selected {
    background: var(--vp-c-brand);
    color: var(--vp-c-text-inverse-1);
}

.tag-name {
    margin-right: 6px;
    font-weight: 500;
    color: var(--vp-c-text-1);
}

.tag-count {
    color: var(--vp-c-text-2);
}

.random-posts {
    margin-top: 2rem;
}

.random-posts h2 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: var(--vp-c-text-1);
    animation: fadeInDown 0.6s ease-out;
}

.random-posts-list,
.posts-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
}

.random-post-link,
.post-link {
    display: flex;
    flex-direction: column;
    background: var(--vp-c-bg-soft);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.random-post-link:hover,
.post-link:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.post-cover {
    width: 100%;
    height: 150px;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.random-post-link:hover .post-cover,
.post-link:hover .post-cover {
    transform: scale(1.05);
}

.random-post-info,
.post-content {
    padding: 1rem;
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

.meta-icon {
    width: 16px;
    height: 16px;
    margin-right: 4px;
}

.separator {
    margin: 0 8px;
}

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

.no-posts {
    text-align: center;
    font-size: 1.2rem;
    color: var(--vp-c-text-2);
    margin-top: 2rem;
}

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
    transition: background-color 0.3s, opacity 0.3s, transform 0.3s;
    opacity: 0.8;
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.back-to-top:hover {
    background-color: var(--vp-c-brand-dark);
    opacity: 1;
    transform: translateY(-3px);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

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
    .random-post-link,
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