<template>
  <div class="video-container">
    <div v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import markdownIt from 'markdown-it';
import markdownItVideo from '@vrcd-community/markdown-it-video';

const props = defineProps({
  platform: {
    type: String,
    required: true,
    validator: (value) =>
      ['youtube', 'vimeo', 'vine', 'prezi', 'bilibili', 'video', 'audio'].includes(value),
  },
  idOrUrl: {
    type: String,
    required: true,
  },
});

const renderedMarkdown = ref('');

// Initialize markdown-it with markdown-it-video plugin
const md = new markdownIt({
  html: true,
  linkify: true,
  typography: true,
}).use(markdownItVideo, {
  youtube: { width: 640, height: 390, nocookie: false },
  vimeo: { width: 500, height: 281 },
  vine: { width: 600, height: 600, embed: 'simple' },
  prezi: { width: 550, height: 400 },
  bilibili: { width: 640, height: 390 },
  video: { width: 640, height: 390 },
  audio: { width: 640 },
});

onMounted(() => {
  // Render the markdown based on the platform and ID/URL
  const markdownText = `@[${props.platform}](${props.idOrUrl})`;
  renderedMarkdown.value = md.render(markdownText);
});
</script>

<style scoped>
.video-container {
  width: 100%;
  max-width: 100%;
  margin: 1rem auto;
}

.video-container .embed-responsive {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding-bottom: 56.25%; /* 16:9 aspect ratio */
}

.video-container .embed-responsive-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-container .video-file-player {
  width: 100%;
}

.video-container video,
.video-container audio {
  width: 100%;
  max-width: 100%;
  height: auto;
}
</style>