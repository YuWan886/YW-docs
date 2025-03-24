<!-- .vitepress/theme/components/api/MediaRenderer.vue -->
<script setup>
defineProps({
  mediaItems: {
    type: Array,
    default: () => []
  }
})

const getMediaStyle = (media) => {
  const styles = []
  if (media.width) styles.push(`width: ${media.width}`)
  if (media.height) styles.push(`height: ${media.height}`)
  return styles.join('; ')
}
</script>

<template>
  <div class="media-container">
    <div 
      v-for="(media, index) in mediaItems"
      :key="index"
      class="media-item"
      :class="[media.layout || 'inline']"
    >
      <figure>
        <div class="media-wrapper">
          <img
            v-if="media.type === 'image'"
            :src="media.src"
            :alt="media.caption || '媒体内容'"
            :style="getMediaStyle(media)"
            loading="lazy"
          />
          
          <video
            v-else-if="media.type === 'video'"
            :src="media.src"
            :poster="media.poster"
            :autoplay="media.autoplay"
            :controls="media.controls ?? true"
            :style="getMediaStyle(media)"
            playsinline
          />
        </div>

        <figcaption v-if="media.caption" class="media-caption">
          {{ media.caption }}
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<style scoped>
.media-container {
  margin: calc(var(--spacing-unit) * 3) 0;
}

.media-item {
  margin: calc(var(--spacing-unit) * 2) 0;
  
  &.full {
    width: 100%;
    margin-left: -20px;
    margin-right: -20px;
    
    img, video {
      border-radius: 0;
    }
  }
}

.media-wrapper {
  border-radius: calc(var(--border-radius) * 0.8);
  overflow: hidden;
  background: var(--secondary-color);
  
  img, video {
    display: block;
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: contain;
  }
}

.media-caption {
  text-align: center;
  font-size: 0.9em;
  color: color-mix(in srgb, var(--text-color) 70%, transparent);
  margin-top: calc(var(--spacing-unit) * 1);
  padding: 0 calc(var(--spacing-unit) * 2);
}
</style>