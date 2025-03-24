<template>
    <div class="minecraft-server" :class="{ 'server-offline': !serverStatus?.online, 'is-loading': loading }">
        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
        </div>

        <div v-else-if="error" class="error">
            {{ error }}
        </div>

        <div v-else-if="serverStatus" class="server-content">
            <div class="server-header">
                <img v-if="serverStatus.icon" :src="serverStatus.icon" alt="Server Icon" class="server-icon" />
                <div class="server-info">
                    <h2 class="server-name">
                        {{ serverIp }}
                    </h2>
                    <div class="server-meta">
                        <span class="server-status" :class="{ 'online': serverStatus.online }">
                            {{ serverStatus.online ? '在线' : '离线' }}
                        </span>
                        <span class="server-version">{{ serverStatus.version }}</span>
                    </div>
                </div>
                <a :href="articleLink" class="server-article-link" v-if="articleLink">
                    查看服务器介绍
                </a>
            </div>

            <div class="server-stats">
                <div class="stat-item">
                    <div class="stat-label">在线玩家</div>
                    <div class="stat-value">{{ serverStatus.players.online }}/{{ serverStatus.players.max }}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">地址</div>
                    <div class="stat-value">{{ serverIp }}</div>
                </div>
                <div class="stat-item" v-if="pingValue !== null">
                    <div class="stat-label">Ping</div>
                    <div class="stat-value">{{ pingValue }}ms</div>
                </div>
            </div>

            <div v-if="serverStatus.players.list?.length" class="online-players">
                <h3>Online Players</h3>
                <ul>
                    <li v-for="player in serverStatus.players.list" :key="player">
                        {{ player }}
                    </li>
                </ul>
            </div>

            <div v-if="serverStatus.motd?.html" class="server-motd">
                <div v-for="(line, index) in serverStatus.motd.html" :key="index" v-html="formatMinecraftText(line)">
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useServerStatus } from '../utils/useServerStatus'
import { computed } from 'vue'

const props = defineProps<{
    serverIp: string
    articleLink?: string
}>()

const { serverStatus, loading, error } = useServerStatus(props.serverIp)

// 计算真实的 ping 值
const pingValue = computed(() => {
    if (!serverStatus.value || !serverStatus.value.debug) return null
    return typeof serverStatus.value.debug.ping === 'number' ? serverStatus.value.debug.ping : null
})

const formatMinecraftText = (text: string) => {
    // Convert Minecraft color codes to spans with CSS classes
    return text
        .replace(/§([0-9a-fk-or])/g, (match, code) => {
            const classes = {
                '0': 'mc-black',
                '1': 'mc-dark-blue',
                '2': 'mc-dark-green',
                '3': 'mc-dark-aqua',
                '4': 'mc-dark-red',
                '5': 'mc-dark-purple',
                '6': 'mc-gold',
                '7': 'mc-gray',
                '8': 'mc-dark-gray',
                '9': 'mc-blue',
                'a': 'mc-green',
                'b': 'mc-aqua',
                'c': 'mc-red',
                'd': 'mc-light-purple',
                'e': 'mc-yellow',
                'f': 'mc-white',
                'k': 'mc-obfuscated',
                'l': 'mc-bold',
                'm': 'mc-strikethrough',
                'n': 'mc-underline',
                'o': 'mc-italic',
                'r': 'mc-reset'
            }[code] || ''

            return `<span class="${classes}">`
        })
        .replace(/§r/g, '</span>')
        + '</span>'
}
</script>

<style scoped>
.minecraft-server {
    border-radius: 8px;
    background: var(--vp-c-bg-soft);
    box-shadow: 0 2px 4px var(--vp-c-divider);
    padding: 20px;
    margin-bottom: 20px;
    position: relative;
    overflow: hidden;
}

.server-offline {
    opacity: 0.7;
}

.server-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
    position: relative;
}

.server-icon {
    width: 64px;
    height: 64px;
    margin-right: 16px;
    border-radius: 8px;
}

.server-info {
    flex: 1;
}

.server-name {
    margin: 0;
    font-size: 1.5rem;
    color: var(--vp-c-text-1);
}

.server-meta {
    display: flex;
    gap: 12px;
    margin-top: 4px;
}

.server-status {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    background: #ff4444;
    color: white;
}

.server-status.online {
    background: #44b944;
}

.server-version {
    color: var(--vp-c-text-2);
    font-size: 0.875rem;
}

.server-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
}

.stat-item {
    background: var(--vp-c-bg);
    padding: 12px;
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
}

.stat-label {
    font-size: 0.875rem;
    color: var(--vp-c-text-2);
    margin-bottom: 4px;
}

.stat-value {
    font-size: 1rem;
    color: var(--vp-c-text-1);
    font-weight: 500;
}

.online-players {
    margin-top: 20px;
}

.online-players h3 {
    font-size: 1rem;
    margin-bottom: 8px;
    color: var(--vp-c-text-1);
}

.online-players ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.online-players li {
    background: var(--vp-c-bg);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.875rem;
    border: 1px solid var(--vp-c-divider);
    color: var(--vp-c-text-1);
}

.server-motd {
    margin-top: 20px;
    padding: 12px;
    background: var(--vp-c-bg);
    border-radius: 6px;
    border: 1px solid var(--vp-c-divider);
    font-family: monospace;
    white-space: pre-wrap;
}

.loading {
    text-align: center;
    padding: 20px;
    color: var(--vp-c-text-2);
}

.error {
    color: #ff4444;
    padding: 20px;
    text-align: center;
}

.server-actions {
    margin-top: 20px;
    text-align: right;
}

.server-article-link {
    position: absolute;
    top: 0;
    right: 0;
    padding: 8px 16px;
    background: var(--vp-c-brand);
    color: white;
    border-radius: 4px;
    text-decoration: none;
    font-size: 0.875rem;
    transition: background-color 0.2s, transform 0.2s;
}

.server-article-link:hover {
    background: var(--vp-c-brand-light);
    transform: translateY(-2px);
}

/* Loading Animation */
.loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--vp-c-bg-soft);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--vp-c-divider);
    border-top-color: var(--vp-c-brand);
    border-radius: 50%;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.is-loading {
    min-height: 200px;
}

/* Minecraft color classes */
:deep(.mc-black) {
    color: #000000;
}

:deep(.mc-dark-blue) {
    color: #0000AA;
}

:deep(.mc-dark-green) {
    color: #00AA00;
}

:deep(.mc-dark-aqua) {
    color: #00AAAA;
}

:deep(.mc-dark-red) {
    color: #AA0000;
}

:deep(.mc-dark-purple) {
    color: #AA00AA;
}

:deep(.mc-gold) {
    color: #FFAA00;
}

:deep(.mc-gray) {
    color: #AAAAAA;
}

:deep(.mc-dark-gray) {
    color: #555555;
}

:deep(.mc-blue) {
    color: #5555FF;
}

:deep(.mc-green) {
    color: #55FF55;
}

:deep(.mc-aqua) {
    color: #55FFFF;
}

:deep(.mc-red) {
    color: #FF5555;
}

:deep(.mc-light-purple) {
    color: #FF55FF;
}

:deep(.mc-yellow) {
    color: #FFFF55;
}

:deep(.mc-white) {
    color: #FFFFFF;
}

:deep(.mc-bold) {
    font-weight: bold;
}

:deep(.mc-strikethrough) {
    text-decoration: line-through;
}

:deep(.mc-underline) {
    text-decoration: underline;
}

:deep(.mc-italic) {
    font-style: italic;
}

:deep(.mc-obfuscated) {
    display: none;
}
</style>