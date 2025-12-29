<template>
    <div class="archive-container">
        <h1 class="archive-title">文章归档</h1>

        <div v-for="year in sortedYears" :key="year" class="year-section">
            <div class="year-header">
                <h2 class="year-title">{{ year }}年</h2>
            </div>

            <div v-for="monthItem in yearMap[year]" :key="monthItem.month" class="month-section">
                <div class="month-header">
                    <div class="month-title">
                        {{ monthItem.month }}月
                    </div>
                    <div class="month-line"></div>
                </div>

                <div class="posts-container">
                    <a v-for="post in monthItem.data.posts" :key="post.url" :href="post.url" class="post-link"
                        @mouseover="hoverPost = post.url" @mouseleave="hoverPost = null">
                        <div class="post-content" :class="{ 'animate-hover': hoverPost === post.url }">
                            <div class="post-main">
                                <h3 class="post-title">
                                    {{ post.title }}
                                </h3>
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
                            <div v-if="post.tags.length" class="post-tags-container">
                                <div class="arrow">→</div>
                                <div class="post-tags">
                                    <a v-for="tag in post.tags" :key="tag"
                                        :href="`/posts/tags.html?tag=${encodeURIComponent(tag)}`" class="post-tag-link">
                                        {{ tag }}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { data as postsData } from '../utils/post.data.ts'

const hoverPost = ref(null)

const formatDate = (timestamp) => {
    const date = new Date(timestamp)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const processedData = computed(() => {
    const archiveMap = {}
    postsData.forEach(post => {
        const date = new Date(post.created.time)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')

        if (!archiveMap[year]) archiveMap[year] = {}
        if (!archiveMap[year][month]) archiveMap[year][month] = { posts: [] }
        archiveMap[year][month].posts.push(post)
    })

    const sortedYears = Object.keys(archiveMap).sort((a, b) => b - a)
    const sortedYearMap = {}
    
    sortedYears.forEach(year => {
        const months = archiveMap[year]
        const sortedMonths = Object.keys(months).sort((a, b) => {
            const monthA = parseInt(a, 10)
            const monthB = parseInt(b, 10)
            return monthB - monthA // 降序排序,确保11月在10月之前
        })
        sortedYearMap[year] = []
        
        sortedMonths.forEach(month => {
            months[month].posts.sort((a, b) => b.created.time - a.created.time)
            sortedYearMap[year].push({
                month: month,
                data: months[month]
            })
        })
    })

    return { sortedYears, yearMap: sortedYearMap }
})

const sortedYears = computed(() => processedData.value.sortedYears)
const yearMap = computed(() => processedData.value.yearMap)
</script>

<style scoped>
:root {
    --vp-c-brand: #3B82F6;
    /* 示例品牌颜色 */
    --transition-duration: 0.4s;
    /* 增加过渡时长 */
    --background-color: #FFFFFF;
    --text-color: #1F2937;
    --secondary-color: #4B5563;
    --accent-color: #2563EB;
    --hover-opacity: 0.8;
}

.archive-container {
    max-width: 48rem;
    /* 相当于 max-w-3xl */
    width: 100%;
    padding: 2rem 1rem;
    /* 相当于 py-8 px-4 */
    margin: 0 auto;
    /* 相当于 mx-auto my-0 */
    background-color: var(--background-color);
    color: var(--text-color);
    transition: background-color var(--transition-duration), color var(--transition-duration);
}

.archive-title {
    font-size: 2rem;
    /* 增大标题字体 */
    line-height: 2.5rem;
    font-weight: 700;
    margin-bottom: 2.5rem;
    /* 去除左侧边框 */
    /* border-left: 5px solid var(--vp-c-brand); */
    padding-left: 0;
    /* 调整内边距 */
    color: var(--text-color);
    animation: fadeInLeft 1s ease-out;
}

.year-section {
    margin-bottom: 3.5rem;
    animation: fadeInUp 0.8s ease-out;
}

.year-header {
    display: flex;
    align-items: baseline;
    margin-bottom: 1.5rem;
}

.year-title {
    font-size: 1.75rem;
    line-height: 2.25rem;
    font-weight: 700;
    margin-right: 1rem;
    color: var(--text-color);
}

.month-section {
    margin-bottom: 2.5rem;
    position: relative;
    padding-left: 1rem;
}

.month-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
}

.month-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--secondary-color);
    margin-right: 0.5rem;
    transition: color var(--transition-duration);
}

@media (prefers-color-scheme: dark) {
    .archive-container {
        background-color: #1F2937;
        color: #D1D5DB;
    }

    .month-title {
        color: #9CA3AF;
    }

    .archive-title {
        color: #F9FAFB;
    }
}

.month-line {
    flex: 1;
    height: 2px;
    background-color: #E5E7EB;
    transition: background-color var(--transition-duration);
}

@media (prefers-color-scheme: dark) {
    .month-line {
        background-color: #374151;
    }
}

.posts-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.post-link {
    display: block;
    text-decoration: none;
    border-radius: 5px;
    transition: transform var(--transition-duration), background-color var(--transition-duration);
}

.post-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    transition: transform var(--transition-duration) ease, background-color var(--transition-duration) ease;
    padding: 1rem;
    border-radius: 5px;
}

.post-content.animate-hover {
    transform: translateX(5px);
    background-color: rgba(59, 130, 246, 0.05);
    /* 减少背景颜色的透明度 */
}

@media (min-width: 640px) {
    .post-content {
        flex-direction: row;
        align-items: center;
    }
}

.post-main {
    flex: 1;
}

.post-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 0.5rem;
    transition: color var(--transition-duration);
}

.post-link:hover .post-title {
    color: var(--vp-c-brand);
}

.post-meta {
    font-size: 0.875rem;
    color: #6B7280;
    display: flex;
    align-items: center;
    transition: color var(--transition-duration);
}

.separator {
    opacity: 0.5;
    margin: 0 0.5rem;
}

.meta-item {
    display: flex;
    align-items: center;
}

.meta-icon {
    width: 16px;
    height: 16px;
    margin-right: 0.25rem;
    color: #6B7280;
    transition: color var(--transition-duration);
}

@media (prefers-color-scheme: dark) {
    .post-meta {
        color: #9CA3AF;
    }

    .meta-icon {
        color: #9CA3AF;
    }
}

.post-tags-container {
    display: flex;
    align-items: center;
    margin-top: 0.5rem;
    transition: margin var(--transition-duration);
}

@media (min-width: 640px) {
    .post-tags-container {
        margin-top: 0;
        margin-left: 1.5rem;
    }
}

.arrow {
    font-size: 0.875rem;
    color: #6B7280;
    margin-right: 0.5rem;
    transition: color var(--transition-duration);
}

@media (prefers-color-scheme: dark) {
    .arrow {
        color: #9CA3AF;
    }
}

.post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.post-tag-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.75rem;
    border-radius: 0.375rem;
    background-color: #F3F4F6;
    color: #4B5563;
    text-decoration: none;
    transition: background-color var(--transition-duration), color var(--transition-duration);
}

.post-tag-link:hover {
    background-color: #E5E7EB;
    color: var(--vp-c-brand);
}

@media (prefers-color-scheme: dark) {
    .post-tag-link {
        background-color: #374151;
        color: #D1D5DB;
    }

    .post-tag-link:hover {
        background-color: #4B5563;
        color: var(--vp-c-brand);
    }
}

/* 动画效果 */
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
</style>