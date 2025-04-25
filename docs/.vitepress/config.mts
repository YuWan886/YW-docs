import { defineConfig } from 'vitepress'
import { figure } from '@mdit/plugin-figure'
import { pagefindPlugin, chineseSearchOptimize } from 'vitepress-plugin-pagefind'
import { generateSidebar } from 'vitepress-sidebar'
import { devDependencies } from '../../package.json'
import { compression } from 'vite-plugin-compression2'

//git 历史
import {
  GitChangelog,
  GitChangelogMarkdownSection,
} from '@nolebase/vitepress-plugin-git-changelog/vite'

// 双向链接
import { BiDirectionalLinks } from '@nolebase/markdown-it-bi-directional-links'
// 行内链接预览
import { InlineLinkPreviewElementTransform } from '@nolebase/vitepress-plugin-inline-link-preview/markdown-it'

export default defineConfig({
  lang: "zh-CN",
  title: "鱼丸 Team",
  description: "致力于成为Minecraft高手",
  srcDir: './src',
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/img/favicon.ico' }],
  ],
  // markdown 配置
  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    },
    lineNumbers: true,
    config: (md) => {
      md.use(BiDirectionalLinks({
        dir: 'docs/src'
      }),
        md.use(InlineLinkPreviewElementTransform),
        figure,
        { figcaption: 'alt', copyAttrs: '^class$', lazy: true }, md.renderer.rules.heading_close = (tokens, idx, options, env, slf) => {
          let htmlResult = slf.renderToken(tokens, idx, options);
          if (tokens[idx].tag === 'h1') htmlResult += `<ArticleMetadata />`;
          return htmlResult;
        })
    },
    image: { lazyLoading: true }
  },
  //
  vite: {
    build: {
      chunkSizeWarningLimit: 1000, // 调整chunk大小警告阈值
      rollupOptions: {
        output: {
          manualChunks: {
            // 移除manualChunks配置，依赖动态导入优化代码分割
          }
        }
      }
    },
    optimizeDeps: {
      exclude: [
        '@nolebase/vitepress-plugin-enhanced-readabilities/client',
        'vitepress',
        '@nolebase/ui',
        '@nolebase/vitepress-plugin-inline-link-preview/client'
      ],
    },
    ssr: {
      noExternal: [
        '@nolebase/vitepress-plugin-enhanced-readabilities',
        '@nolebase/ui',
        '@nolebase/vitepress-plugin-inline-link-preview'
      ]
    },
    plugins: [
      pagefindPlugin({
        customSearchQuery: chineseSearchOptimize, btnPlaceholder: '搜索', placeholder: '搜索文档', emptyText: '空空如也', heading: '共: {{searchResult}} 条结果', excludeSelector: ['img', 'a.header-anchor']
      }),
      GitChangelog({
        repoURL: () => 'https://github.com/fishlanding/YW-docs',
        maxGitLogCount: 200,
      }),
      GitChangelogMarkdownSection(),
      compression({
        "threshold": 500
      }),
    ]
  },
  sitemap: {
    hostname: 'https://docs.yw-games.top',
  },
  //按钮自定义
  themeConfig: {
    darkModeSwitchLabel: '外观',
    darkModeSwitchTitle: '切换到暗黑模式',
    lightModeSwitchTitle: '切换到明亮模式',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    outline: {
      level: [2, 4],
      label: '当前页大纲'
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      },
    },
    notFound: {
      title: '前面的区域以后再来探索吧:)',
      quote: '你来到了没有知识的荒原',
      linkLabel: '返回首页',
      linkText: '看看主页'
    },
    //导航栏
    nav: [
      { text: '主页', link: '/' },
      { text: '归档', link: '/posts/archives' },
      { text: '标签', link: '/posts/tags' },
      { "text": '团队', link: '/team' },
      {
        text: '更多', items: [
          { "text": '教程', link: '/posts/tutorial' },
          { "text": '服务器状态', link: '/server' },

        ]
      },
      { text: `VitePress ${devDependencies.vitepress.replace('^', '')}`, link: 'https://vitepress.dev/zh/', noIcon: true },
    ],
    //编辑模式
    editLink: {
      pattern: 'https://github.com/fishlanding/YW-docs/edit/main/docs/src/:path',
      text: '在 Github 上编辑此页'
    },
    //自动侧边栏
    sidebar: generateSidebar([
      {
        documentRootPath: '/docs/src/posts',
        scanStartPath: 'map',
        resolvePath: '/posts/map/',
        useTitleFromFrontmatter: true,
        useTitleFromFileHeading: true,
        useFolderTitleFromIndexFile: true,
        sortFolderTo: 'top',
        collapsed: false
      },
      {
        documentRootPath: '/docs/src/posts',
        scanStartPath: 'modpack',
        resolvePath: '/posts/modpack/',
        useTitleFromFrontmatter: true,
        useTitleFromFileHeading: true,
        useFolderTitleFromIndexFile: true,
        sortFolderTo: 'top',
        collapsed: false
      },
      {
        documentRootPath: '/docs/src/posts',
        scanStartPath: 'tutorial',
        resolvePath: '/posts/tutorial/',
        useTitleFromFrontmatter: true,
        useTitleFromFileHeading: true,
        useFolderTitleFromIndexFile: true,
        sortFolderTo: 'top',
        collapsed: false
      }
    ]),
    // 页脚
    footer: {
      message: '你好',
      copyright: 'Copyright © 2024-2025 一条鱼丸_'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/YW-Chinese-Team' },
      { icon: { svg: '<svg t="1734102760971" class="icon" viewBox="0 0 1129 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4404" width="200" height="200"><path d="M234.909 9.656a80.468 80.468 0 0 1 68.398 0 167.374 167.374 0 0 1 41.843 30.578l160.937 140.82h115.07l160.936-140.82a168.983 168.983 0 0 1 41.843-30.578A80.468 80.468 0 0 1 930.96 76.445a80.468 80.468 0 0 1-17.703 53.914 449.818 449.818 0 0 1-35.406 32.187 232.553 232.553 0 0 1-22.531 18.508h100.585a170.593 170.593 0 0 1 118.289 53.109 171.397 171.397 0 0 1 53.914 118.288v462.693a325.897 325.897 0 0 1-4.024 70.007 178.64 178.64 0 0 1-80.468 112.656 173.007 173.007 0 0 1-92.539 25.75h-738.7a341.186 341.186 0 0 1-72.421-4.024A177.835 177.835 0 0 1 28.91 939.065a172.202 172.202 0 0 1-27.36-92.539V388.662a360.498 360.498 0 0 1 0-66.789A177.03 177.03 0 0 1 162.487 178.64h105.414c-16.899-12.07-31.383-26.555-46.672-39.43a80.468 80.468 0 0 1-25.75-65.984 80.468 80.468 0 0 1 39.43-63.57M216.4 321.873a80.468 80.468 0 0 0-63.57 57.937 108.632 108.632 0 0 0 0 30.578v380.615a80.468 80.468 0 0 0 55.523 80.469 106.218 106.218 0 0 0 34.601 5.632h654.208a80.468 80.468 0 0 0 76.444-47.476 112.656 112.656 0 0 0 8.047-53.109v-354.06a135.187 135.187 0 0 0 0-38.625 80.468 80.468 0 0 0-52.304-54.719 129.554 129.554 0 0 0-49.89-7.242H254.22a268.764 268.764 0 0 0-37.82 0z m0 0" fill="#20B0E3" p-id="4405"></path><path d="M348.369 447.404a80.468 80.468 0 0 1 55.523 18.507 80.468 80.468 0 0 1 28.164 59.547v80.468a80.468 80.468 0 0 1-16.094 51.5 80.468 80.468 0 0 1-131.968-9.656 104.609 104.609 0 0 1-10.46-54.719v-80.468a80.468 80.468 0 0 1 70.007-67.593z m416.02 0a80.468 80.468 0 0 1 86.102 75.64v80.468a94.148 94.148 0 0 1-12.07 53.11 80.468 80.468 0 0 1-132.773 0 95.757 95.757 0 0 1-12.875-57.133V519.02a80.468 80.468 0 0 1 70.007-70.812z m0 0" fill="#20B0E3" p-id="4406"></path></svg>' }, link: 'https://space.bilibili.com/438381132' },
      { icon: { svg: '<svg t="1734102897702" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8020" width="200" height="200"><path d="M849.621 619.904a1364.352 1364.352 0 0 0-28.8-80.47l-38.826-95.829c0-1.109 0.512-19.968 0.512-29.696 0-163.882-78.208-328.576-270.507-328.576S241.493 250.027 241.493 413.867c0 9.77 0.47 28.629 0.512 29.738l-38.826 95.83a1398.485 1398.485 0 0 0-28.8 80.469c-36.694 116.779-24.79 165.12-15.744 166.187 19.413 2.304 75.562-87.894 75.562-87.894 0 52.224 27.179 120.406 86.016 169.643-21.973 6.699-48.938 17.024-66.304 29.653-15.573 11.392-13.61 23.04-10.794 27.734 12.33 20.522 211.413 13.098 268.928 6.698 57.472 6.4 256.597 13.824 268.885-6.741 2.816-4.693 4.779-16.299-10.795-27.69-17.365-12.63-44.33-22.955-66.346-29.697 58.837-49.194 86.016-117.376 86.016-169.642 0 0 56.149 90.24 75.562 87.893 9.046-1.067 20.907-49.365-15.786-166.144" fill="#CDCDCD" p-id="8021"></path></svg>' }, link: 'https://qm.qq.com/q/5LqihGj5bq' }
    ]
  },
})
