// https://vitepress.dev/guide/custom-theme
import { h, onUnmounted } from 'vue';
import type { Theme } from 'vitepress';
import DefaultTheme from 'vitepress/theme';
import { onMounted, watch, nextTick } from 'vue';
import { inBrowser, useData, useRoute } from 'vitepress';
import googleAnalytics from 'vitepress-plugin-google-analytics'

// giscus评论
import giscusTalk from 'vitepress-plugin-comment-with-giscus';
// 进度条
import { NProgress } from 'nprogress-v2/dist/index.js';
import 'nprogress-v2/dist/index.css';



import './style.css';
import './style/index.css';


// 自定义全局组件
import ywcomponents from './components/ywcomponents.vue';
import Linkcard from './components/Linkcard.vue';
import ArticleMetadata from './components/ArticleMetadata.vue';
import HomeUnderline from './components/HomeUnderline.vue';
import xgplayer from './components/xgplayer.vue';
import backtotop from './components/backtotop.vue';
import confetti from "./components/confetti.vue"
import AgreementModal from './components/AgreementModal.vue'
import Archive from './components/Archive.vue'
import TagPage from './components/TagPage.vue'
import MinecraftServer from './components/MinecraftServer.vue'
import busuanzi from 'busuanzi.pure.js'
import DataPanel from "./components/DataPanel.vue"
import { bindFancybox, destroyFancybox } from './utils/ImgViewer'
import Gallery from './components/Gallery.vue'

// 不蒜子
function reloadBusuanzi() {
  const busuanziScriptId = "busuanzi-script";

  const existingScript = document.getElementById(busuanziScriptId);
  if (existingScript) {
    existingScript.remove();
  }

  const script = document.createElement("script");
  script.id = busuanziScriptId;
  script.src =
    "https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js";
  script.async = true;

  document.body.appendChild(script);
}

// 行内链接预览
import { NolebaseInlineLinkPreviewPlugin } from '@nolebase/vitepress-plugin-inline-link-preview/client'
import '@nolebase/vitepress-plugin-inline-link-preview/client/style.css'

// 阅读增强
import { NolebaseEnhancedReadabilitiesMenu, NolebaseEnhancedReadabilitiesScreenMenu } from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import '@nolebase/vitepress-plugin-enhanced-readabilities/client/style.css'

// git历史
import {
  NolebaseGitChangelogPlugin
} from '@nolebase/vitepress-plugin-git-changelog/client'
import '@nolebase/vitepress-plugin-git-changelog/client/style.css'


// 评论区
const GISCUS_CONFIG = {
  repo: 'YW-Chinese-Team/yw-docs-comment-section', // Repository
  repoId: 'R_kgDONf0EWg', // Repository ID
  category: 'Announcements', // Discussion category
  categoryId: 'DIC_kwDONf0EWs4ClXWL', // Discussion category ID
  mapping: 'pathname',
  inputPosition: 'top',
  theme: 'preferred_color_scheme',
  loadEnv: 'lazy',
  lang: 'zh-CN',
};
const setupGiscus = (frontmatter, route) => {
  giscusTalk(GISCUS_CONFIG, { frontmatter, route }, true);
};

// 图片放大

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-footer-before": () => h(backtotop),
      "layout-top": () => h(AgreementModal),
      "layout-bottom": () => h(DataPanel),
      'nav-bar-content-after': () => h(NolebaseEnhancedReadabilitiesMenu),
      'nav-screen-content-after': () => h(NolebaseEnhancedReadabilitiesScreenMenu),
    })
  },
  enhanceApp: ({ app, router }) => {
    // 注册全局组件
    app.component('ywcomponents', ywcomponents);
    app.component('Linkcard', Linkcard);
    app.component('ArticleMetadata', ArticleMetadata);
    app.component('HomeUnderline', HomeUnderline);
    app.component('xgplayer', xgplayer);
    app.component('confetti', confetti);
    app.component('AgreementModal', AgreementModal);
    app.component("Archive", Archive);
    app.component("TagPage", TagPage);
    app.component('MinecraftServer', MinecraftServer);
    app.component('Gallery', Gallery);
    app.use(NolebaseGitChangelogPlugin);
    app.use(NolebaseInlineLinkPreviewPlugin);
    googleAnalytics({
      id: 'G-YGB9T93R16',
    })

    if (inBrowser) {
      NProgress.configure({ showSpinner: false })
      router.onBeforeRouteChange = () => {
        destroyFancybox() // 销毁图片查看器
        NProgress.start() // 开始进度条
      }
      router.onAfterRouteChange = () => {
        bindFancybox() // 绑定图片查看器
        busuanzi.fetch() // 不蒜子
        NProgress.done() // 停止进度条
      }
    }

  },
  setup() {
      const route = useRoute();
      const { frontmatter } = useData();
      let stopWatch: () => void;

      onMounted(async () => {
        bindFancybox();
        reloadBusuanzi(); // 初始加载时重新加载不蒜子
      });
      onUnmounted(() => {
        try {
          destroyFancybox();
          if (stopWatch) {
            stopWatch();
          }
        } catch (error) {
          console.error('资源清理失败:', error);
        }
      });
      // giscus评论区
      setupGiscus(frontmatter, route);
    },
} satisfies Theme