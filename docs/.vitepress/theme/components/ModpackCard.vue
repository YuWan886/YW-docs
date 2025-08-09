<template>
  <div class="modpack-card" :class="{ 'loading': loading, 'dark': isDark }">
    <div class="modpack-header">
      <img v-if="modpackData.icon" :src="modpackData.icon" class="modpack-icon" alt="Modpack Icon" />
      <div class="modpack-meta">
        <h3 class="modpack-title">
          <a :href="modpackData.url" target="_blank" rel="noopener noreferrer">{{ modpackData.title }}</a>
        </h3>
        <div class="modpack-author" v-if="modpackData.author">
          作者: <a v-if="modpackData.authorUrl" :href="modpackData.authorUrl" target="_blank" rel="noopener noreferrer">{{ modpackData.author }}</a>
          <template v-else>{{ modpackData.author }}</template>
        </div>
      </div>
    </div>
    
    <div class="modpack-description" v-if="modpackData.description">
      {{ modpackData.description }}
    </div>
    
    <div class="modpack-stats">
      <div class="stat-item" v-if="modpackData.version">
        <span class="stat-label">支持版本:</span>
        <span class="stat-value">{{ modpackData.version }}</span>
      </div>
      <div class="stat-item" v-if="modpackData.loader">
        <span class="stat-label">加载器:</span>
        <span class="stat-value">{{ modpackData.loader }}</span>
      </div>
      <div class="stat-item" v-if="modpackData.modCount">
        <span class="stat-label">Mod数量:</span>
        <span class="stat-value">{{ modpackData.modCount }}</span>
      </div>
      <div class="stat-item" v-if="modpackData.downloads">
        <span class="stat-label">下载量:</span>
        <span class="stat-value">{{ formatNumber(modpackData.downloads) }}</span>
      </div>
    </div>
    
    <div class="modpack-footer">
      <a class="download-btn" :href="modpackData.url" target="_blank" rel="noopener noreferrer">
        前往下载
      </a>
    </div>
  </div>
</template>

<script>
import { useData } from 'vitepress';

export default {
  name: 'ModpackCard',
  props: {
    url: {
      type: String,
      required: true
    }
  },
  setup() {
    const { isDark } = useData();
    return { isDark };
  },
  data() {
    return {
      loading: true,
      modpackData: {
        title: '',
        author: '',
        description: '',
        version: '',
        loader: '',
        modCount: 0,
        downloads: 0,
        icon: '',
        url: '',
        authorUrl: ''
      }
    }
  },
  mounted() {
    this.fetchModpackData().finally(() => {
      this.loading = false;
    });
  },
  methods: {
    async fetchModpackData() {
      try {
        if (this.url.includes('curseforge.com')) {
          await this.parseCurseForgeLink();
        } else if (this.url.includes('modrinth.com')) {
          await this.parseModrinthLink();
        }
      } catch (error) {
        console.error('Error fetching modpack data:', error);
        this.modpackData.author = '未知作者';
        this.modpackData.authorUrl = '';
      }
    },
    
    async parseCurseForgeLink() {
      const curseforgeApiKey = 'YOUR_CURSEFORGE_API_KEY';
      const projectId = this.extractCurseForgeId(this.url);
      
      if (!projectId) return;
      
      const response = await fetch(`https://api.curseforge.com/v1/mods/${projectId}`, {
        headers: {
          'x-api-key': curseforgeApiKey
        }
      });
      
      const data = await response.json();
      const modpack = data.data;
      
      this.modpackData = {
        title: modpack.name || '未知整合包',
        author: modpack.authors?.[0]?.name || '未知作者',
        authorUrl: modpack.authors?.[0]?.url || '',
        description: modpack.summary || '',
        version: this.formatMinecraftVersions(modpack.latestFiles),
        loader: this.detectModLoader(modpack),
        modCount: this.getCurseForgeModCount(modpack),
        downloads: modpack.downloadCount || 0,
        icon: modpack.logo?.url || '',
        url: this.url
      };
    },
    
    async parseModrinthLink() {
      const projectId = this.extractModrinthId(this.url);
      
      if (!projectId) return;
      
      const response = await fetch(`https://api.modrinth.com/v2/project/${projectId}`);
      const modpack = await response.json();
      
      const versionsResponse = await fetch(`https://api.modrinth.com/v2/project/${projectId}/version`);
      const versions = await versionsResponse.json();
      
      let author = '未知作者';
      let authorUrl = '';
      if (modpack.team) {
        try {
          const teamResponse = await fetch(`https://api.modrinth.com/v2/team/${modpack.team}/members`);
          const teamData = await teamResponse.json();
          const owner = teamData.find(member => member.role === 'Owner') || teamData[0];
          if (owner && owner.user) {
            author = owner.user.username;
            authorUrl = `https://modrinth.com/user/${owner.user.username}`;
          }
        } catch (error) {
          console.error('Error fetching Modrinth team data:', error);
        }
      }
      
      this.modpackData = {
        title: modpack.title || '未知整合包',
        author,
        authorUrl,
        description: modpack.description || '',
        version: this.formatMinecraftVersions(versions),
        loader: this.detectModLoader(modpack),
        modCount: this.getModrinthModCount(versions),
        downloads: modpack.downloads || 0,
        icon: modpack.icon_url || '',
        url: this.url
      };
    },
    
    extractCurseForgeId(url) {
      const match = url.match(/curseforge\.com\/minecraft\/modpacks\/([^\/]+)/);
      return match ? match[1] : null;
    },
    
    extractModrinthId(url) {
      const match = url.match(/modrinth\.com\/modpack\/([^\/]+)/);
      return match ? match[1] : null;
    },
    
    formatMinecraftVersions(versions) {
      if (!versions || versions.length === 0) return '未知';
      
      const gameVersions = new Set();
      versions.forEach(version => {
        if (version.game_versions) {
          version.game_versions.forEach(v => gameVersions.add(v));
        }
      });
      
      const sortedVersions = Array.from(gameVersions).sort((a, b) => {
        const [aMajor, aMinor, aPatch = 0] = a.split('.').map(Number);
        const [bMajor, bMinor, bPatch = 0] = b.split('.').map(Number);
        return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch;
      });
      
      // Group versions by major.minor, preserving specific patch versions
      const versionGroups = {};
      sortedVersions.forEach(version => {
        const [major, minor] = version.split('.').map(Number);
        const key = `${major}.${minor}`;
        if (!versionGroups[key]) {
          versionGroups[key] = [];
        }
        versionGroups[key].push(version);
      });
      
      // Format versions: use specific versions if only one per major.minor, otherwise use .x
      const formattedVersions = Object.keys(versionGroups).map(key => {
        const versions = versionGroups[key];
        if (versions.length === 1) {
          return versions[0]; // Use exact version (e.g., 1.20.1)
        }
        return `${key}.x`; // Use .x for multiple versions (e.g., 1.20.x for 1.20.1, 1.20.2)
      });
      
      // Add specific version ranges (e.g., 1.18.1–1.18.2)
      const versionRanges = this.createVersionRanges(sortedVersions);
      
      // Combine and sort versions in descending order
      const allVersions = [...formattedVersions, ...versionRanges].sort((a, b) => {
        if (a.includes('–')) return 1; // Push ranges to the end
        if (b.includes('–')) return -1;
        const [aMajor, aMinor, aPatch = 0] = a.replace('.x', '.0').split('.').map(Number);
        const [bMajor, bMinor, bPatch = 0] = b.replace('.x', '.0').split('.').map(Number);
        return bMajor - aMajor || bMinor - aMinor || bPatch - aPatch;
      });
      
      return allVersions.join(', ');
    },
    
    createVersionRanges(versions) {
      const ranges = [];
      if (versions.includes('1.18.1') && versions.includes('1.18.2')) {
        ranges.push('1.18.1–1.18.2');
      }
      return ranges;
    },
    
    getCurseForgeModCount(modpack) {
      const dependencies = modpack.latestFiles?.[0]?.dependencies || [];
      return dependencies.filter(dep => dep.relationType === 3).length || 0;
    },
    
    getModrinthModCount(versions) {
      const latestVersion = versions[0];
      return latestVersion.dependencies?.length || 0;
    },
    
    detectModLoader(modpack) {
      const loaders = modpack.loaders || modpack.supported_loaders || [];
      if (loaders.includes('fabric')) return 'Fabric';
      if (loaders.includes('forge')) return 'Forge';
      if (loaders.includes('quilt')) return 'Quilt';
      return '未知';
    },
    
    formatNumber(num) {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
      } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
      }
      return num.toString();
    }
  }
}
</script>

<style scoped>
.modpack-card {
  border: 1px solid #eaeaea;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  transition: all 0.2s ease;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.modpack-card.dark {
  border-color: #444;
  background-color: #2a2a2a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.modpack-card.loading {
  opacity: 0.7;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.modpack-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.modpack-icon {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 16px;
  object-fit: cover;
}

.modpack-meta {
  flex: 1;
}

.modpack-title {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.modpack-card.dark .modpack-title {
  color: #e0e0e0;
}

.modpack-title a {
  color: inherit;
  text-decoration: none;
}

.modpack-title a:hover {
  text-decoration: underline;
}

.modpack-author {
  font-size: 0.9em;
  color: #666;
  margin-top: 4px;
}

.modpack-card.dark .modpack-author {
  color: #aaa;
}

.modpack-description {
  margin: 12px 0;
  color: #444;
  font-size: 0.95em;
  line-height: 1.5;
}

.modpack-card.dark .modpack-description {
  color: #ccc;
}

.modpack-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 12px 0;
}

.stat-item {
  display: flex;
  align-items: center;
  font-size: 0.9em;
}

.stat-label {
  font-weight: bold;
  margin-right: 4px;
  color: #555;
}

.modpack-card.dark .stat-label {
  color: #bbb;
}

.stat-value {
  color: #333;
}

.modpack-card.dark .stat-value {
  color: #ddd;
}

.modpack-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.download-btn {
  padding: 6px 12px;
  background-color: #3a7bd5;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9em;
  transition: background-color 0.2s;
}

.modpack-card.dark .download-btn {
  background-color: #4a8ce8;
}

.download-btn:hover {
  background-color: #2c5fb3;
}

.modpack-card.dark .download-btn:hover {
  background-color: #3a7bd5;
}
</style>