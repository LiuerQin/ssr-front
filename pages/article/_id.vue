<template>
    <div>
        <user-display :user="article.author">
        <el-button v-if="isFollow" type="success" @click="cancelfollow">已关注</el-button>
        <el-button v-else @click="follow">关注</el-button>
        </user-display>

        <el-divider></el-divider>
        <div v-html="article.article_html"></div>
    </div>
</template>

<script>
import UserDisplay from '~/components/UserDisplay.vue'
export default {
    components: {
        UserDisplay
    },
    data () {
        return {
            article: {
                author: {}
            },
            isFollow: false
        }
    },
    mounted () {
        const { id } = this.$route.params
        this.id = id
        this.getArticle()
    },
    methods: {
        async getArticle () {
            const res = await this.$http.get(`/article/${this.id}`)
            console.log('article', res)
            this.article = res.data
        },
        cancelfollow () {},
        follow () {}
    }
}
</script>

<style lang="stylus" scoped>

</style>