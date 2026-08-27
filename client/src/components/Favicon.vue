<template>
  <img v-if="showFav" :src="getFavicon(href)" :alt="getFavicon(href)" class="web-icon"/>
</template>
<script>
export default {
  props: {
    href: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      showFav: false,
      image: null
    }
  },
  computed: {
    getFavicon() {
      return function(href) {
        const arr = href.split('.');
        const last = arr.slice(-1)[0];
        const lastString = last.split('/')[0];
        const s = arr.slice(0, -1).join('.') + '.' + lastString + '/favicon.ico';
        return s;
      }
    }
  },
  created() {
    const favicon = this.getFavicon(this.href);
    this.image = new Image();
    this.image.addEventListener('load', this.loadImage);
    this.image.src = favicon;
  },
  beforeUnmount() {
    this.image.removeEventListener('load', this.loadImage);
  },
  methods: {
    loadImage() {
      this.showFav = true;
    },
  },
}
</script>
<style lang="scss" scoped>
.web-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
  margin-right: 4px;
}
</style>