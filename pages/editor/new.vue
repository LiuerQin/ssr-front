<template>
    <div>
        <div class="write-btn">
            <el-button @click="submit" type="primary">提交</el-button>
        </div>
        <el-row>
            <el-col :span="12">
                <textarea ref="editor" class="md-editor"
                    :value="content" @input="update"
                ></textarea>
            </el-col>
            <el-col :span="12">
                <div class="md-body" v-html="compiledContent"></div>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import marked from 'marked'
import hljs from 'highlight.js'
import javascript from 'highlight.js/lib/languages/javascript'
import 'highlight.js/styles/monokai-sublime.css'
export default {
    data () {
        return {
            content: `# 小刘日常
* 学习
* 吃饭
* 睡觉
\`\`\`javascript
marked.setOptions({
  render: new marked.Renderer(),
  highlight (code) {
    return hljs.highlightAuto(code).value
  }
})
\`\`\`
`,
        }
    },
    computed: {
        compiledContent () {
            return marked(this.content, {})
        }
    },
    mounted () {
      this.timer = null
      this.bindEvents()
      marked.setOptions({
        render: new marked.Renderer(),
        highlight (code) {
          return hljs.highlightAuto(code).value
        }
      })
    },
    methods: {
        bindEvents () {
          this.$refs.editor.addEventListener('paste', (e) => {
            const file = e.clipboardData.files[0]
            console.log(file)
            // 直接上传
          })
          this.$refs.editor.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0]
            console.log(file)
            e.preventDefault()
          })
        },
        async submit () {
          const res = await this.$http.post('/article/create', {
            content: this.content,
            compiledContent: this.compiledContent
          })
        },
        update (e) {
          clearTimeout(this.timer)
          this.timer = setTimeout(() => {
            this.content = e.target.value
          }, 350)
        }
    }
}
</script>

<style lang="stylus" scoped>
.md-editor
    width 100%
    height 100vh
    outline none 
.write-btn
    position fixed 
    z-index 100
    right 30px
    top 10px
</style>