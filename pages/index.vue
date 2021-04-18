<template>
  <div class="my-container">
    <virtual-list :listData="articles" :size="200">

    </virtual-list>
    <!-- <div v-for="article in articles" :key="article.id">
      {{article.title}}
    </div> -->
  </div>
</template>

<script>
import VirtualList from '~/components/VirtualList.vue'
export default {
  components: {
    VirtualList
  },
  data () {
    return {
      articles: []
    }
  },
  async mounted () {
    let res = await this.$http.get('/article')
    if (res.code == 0) {
      this.articles = res.data
    }
  }
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
