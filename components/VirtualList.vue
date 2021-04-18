<template>
  <div ref="list" class="list-container" @scroll="scrollEvent($event)">
    <div class="list-phantom" :style="{ height: listHeight + 'px' }"></div>
    <div class="list" :style="{ top: getTop }">
      <article-item
        ref="items"
        class="list-item"
        v-for="item in visibleData"
        :article="item"
        :key="item._id"
        :style="{ height: size + 'px' }"
      ></article-item>
    </div>
  </div>
</template>

<script>
import ArticleItem from './ArticleItem.vue';
export default {
  props: {
    listData: {
      type: Array,
      default: () => [],
    },
    size: {
      type: Number,
      default: 200,
    },
  },
  components: {ArticleItem},
  data() {
    return {
      screenHeight: 800,
      startOffset: 0,
      start: 0, // 开始索引
      end: 4, // 结束索引
    };
  },
  mounted() {
    this.end = this.start + this.visibleCount;
  },
  computed: {
    listHeight() {
      return this.listData.length * this.size;
    },
    getTop() {
      return `${this.startOffset}px`;
    },
    visibleCount() {
      return Math.ceil(this.screenHeight / this.size);
    },
    visibleData() {
      return this.listData.slice(
        this.start,
        Math.min(this.end, this.listData.length)
      );
    },
  },
  methods: {
    scrollEvent() {
      let scrollTop = this.$refs.list.scrollTop;

      this.start = Math.floor(scrollTop / this.size);
      this.end = this.start + this.visibleCount;
      this.startOffset = scrollTop - (scrollTop % this.size);
    },
  },
};
</script>

<style lang="stylus" scoped>
.list-container {
  height: 100%;
  width: 100%;
  overflow: auto;
  position: relative;
}

.list-phantom {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  z-index: -1;
}

.list {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
}
.list-item {
    padding: 10px;
    color: #555;
    border-bottom: 1px solid #999;
}
</style>