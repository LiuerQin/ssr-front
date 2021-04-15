<template>
    <div>
        <h1>用户中心</h1>
        <div ref="drag" id="drag">
            <input type="file" name="file" @change="handleFileChange">
        </div>
        <div>
            <el-progress :text-inside="true" :stroke-width="26" :percentage="progressPercent"></el-progress>
        </div>
        <div>
            <el-button @click="uploadFile">上传</el-button>
        </div>
        <div>
          <p>计算hash进度：</p>
          <el-progress :text-inside="true" :stroke-width="26" :percentage="hashProgress"></el-progress>
        </div>
        <div>
          <!-- chunk.progress
          progress < 0 error 红色
          process == 100 success
          别的数字 方块高度显示 -->
          <div class="cube-container" :style="{width: cubeWidth + 'px'}">
            <div class="cube" v-for="chunk in chunks" :key="chunk.name">
              <div
                :class="{
                  'uploading': chunk.progress > 0 && chunk.progress < 100,
                  'success': chunk.progress == 100,
                  'error': chunk.progress < 0
                }"
                :style="{height: chunk.progress + '%'}"
              >
              <i class="el-icon-loading" style="color:#f56c6c" v-if="chunk.progress > 0 && chunk.progress < 100"></i>
              </div>
            </div>
          </div>
        </div>  
    </div>
</template>

<script>
import sparkMD5 from 'spark-md5'
const CHUNK_SIZE = 0.1 * 1024 * 1024
export default {
    data () {
        return {
            file: null,
            progressPercent: 0,
            hashProgress: 0,
            chunks: [],
            hash: ''
        }
    },
    async mounted () {
        const res = await this.$http.get('/user/info')
        console.log(res)
        this.bindEvent()
    },
    computed: {
      cubeWidth () {
        return Math.ceil(Math.sqrt(this.chunks.length)) * 16
      },
      uploadProgress () {
        if (!this.file || this.chunks.length) {
          return 0
        }
        const loaded = this.chunks.map(item => item.chunk.size * item.progress)
                        .reduce((acc, cur) => acc + cur, 0)
        return Number((loaded * 100 / this.file.size).toFixed(2))
      }
    },
    methods: {
        bindEvent () {
            const drag = this.$refs.drag
            drag.addEventListener('dragover', (e) => {
                drag.style.borderColor = '#999'
                e.preventDefault()
            })
            drag.addEventListener('dragleave', (e) => {
                drag.style.borderColor = '#eee'
                e.preventDefault()
            })
            drag.addEventListener('drop', (e) => {
                const fileList = e.dataTransfer.files
                drag.style.borderColor = '#eee'
                this.file = fileList[0]
                console.log('drag', this.file)
                e.preventDefault()
            })
        },
        handleFileChange (e)  {
            const [file] = e.target.files
            if (!file) return
            this.file = file
        },
        blobToString (file) {
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.readAsBinaryString(file)
                reader.onload = (e) => {
                    const res = reader.result.split('')
                        .map(item => item.charCodeAt())
                        .map(item => item.toString(16).toUpperCase())
                        .map(item => item.padStart(2, '0'))
                        .join(' ')
                    resolve(res)
                }
            })
        },
        async isGif (file) {
            const res = await this.blobToString(file.slice(0, 6))
            return (res === '47 49 46 38 39 61') || (res === '47 49 46 38 37 61')
        },
        async isPng (file) {
          const res = await this.blobToString(file.slice(0, 8))
          const isPng = res === '89 50 4E 47 0D 0A 1A 0A'
          return isPng
        },
        async isJpg (file) {
          const start = await this.blobToString(file.slice(0, 2))
          const end = await this.blobToString(file.slice(-2, file.size))
          const isJpg = (start === 'FF D8') && (end === 'FF D9')
          return isJpg
        },
        async isImage (file) {
            return await this.isGif(file) || await this.isPng(file) || await this.isJpg(file)
        },
        createFileChunk(file, size=CHUNK_SIZE) {
          const chunks = []
          let cur = 0
          while (cur < this.file.size) {
            chunks.push({index: cur, file: this.file.slice(cur, cur+size)})
            cur+=size
          }
          return chunks
        },
        calculateHashWorker () {
          return new Promise(resolve => {
            this.worker = new Worker('./hash.js')
            this.worker.postMessage({chunks: this.chunks})
            this.worker.onmessage = e => {
              const {progress, hash} = e.data
              this.hashProgress = Number(progress.toFixed(2))
              if (hash) {
                resolve(hash)
              }
            }
          })
        },
        async calculateHashIdle () {
          return new Promise(resolve => {
            const spark = new sparkMD5.ArrayBuffer()
            let count = 0
            const chunks = this.chunks
            const appendToSpark = async file => {
              return new Promise(resolve => {
                const reader = new FileReader()
                reader.readAsArrayBuffer(file)
                reader.onload = (e) => {
                  spark.append(e.target.result)
                  resolve()
                }
              })
            }
            const workLoop = async (deadline) => {
              while(count < chunks.length && deadline.timeRemaining() > 1) {
                await appendToSpark(chunks[count].file)
                count++
                if (count < chunks.length) {
                  this.hashProgress = Number(
                    ((100 * count/chunks.length)).toFixed(2)
                  )
                } else {
                  this.hashProgress = 100
                  resolve(spark.end())
                }
              }
              window.requestIdleCallback(workLoop)
            }
            window.requestIdleCallback(workLoop)
          })
        },
        async calculateHashSimple () {
          const file = this.file
          return new Promise(async (resolve) => {
            const offset = 0.01 * 1024 * 1024
            const size = file.size
            let cur = offset
            let chunks = [file.slice(0, cur)]
            while (cur <= size) {
              if (cur + offset >= size) {
                chunks.push(file.slice(cur))
              } else {
                const middle = cur + offset/2
                const end = cur + offset
                const middleChunk = file.slice(middle, middle + 2)
                chunks.push(file.slice(cur, cur+ 2), middleChunk, file.slice(end - 2, end))
              }
              cur += offset
            }
            console.log('myChunks', chunks)
            let reader = new FileReader()
            reader.readAsArrayBuffer(new Blob(chunks))
            reader.onload = async (e) => {
              const result = e.target.result
              const spark = new sparkMD5.ArrayBuffer()
              spark.append(result)
              resolve(spark.end())
            }
          })
        },
        async uploadChunks () {
          const requests = this.chunks.map((chunk) => {
              let form = new FormData()
              form.append('name', chunk.name)
              form.append('chunk', chunk.chunk)
              form.append('hash', chunk.hash)
              return form
          }).map((form, index) => {
            return this.$http.post('/uploadfile', form, {
                onUploadProgress: (progress) => {
                    this.chunks[index].progress = Number(((progress.loaded/progress.total)*100).toFixed(2))
                    // this.chunks[index].progress = 12
                }
              })
            })
            // @todo 并发量控制
            await Promise.all(requests)
            await this.mergeRequest()
        },
        async mergeRequest () {
          this.$http.post('/mergefile', {
            ext: this.file.name.split('.').pop(),
            size: CHUNK_SIZE,
            hash: this.hash
          })
        },
        async uploadFile () {
          this.progressPercent = 0
          this.hashProgress = 0
            // if (!await this.isImage(this.file)) {
            //     alert('只能上传GIF/PNG/JPG格式文件')
            //     return
            // } else {
            //     console.log('文件格式正确')
            // }
            // 文件切片上传
            this.chunks = this.createFileChunk(this.file)
            // const hash = await this.calculateHashWorker()
            // const hash1 = await this.calculateHashIdle()

            this.hash = await this.calculateHashSimple()
            this.chunks = this.chunks.map((chunk, index) => {
              return {
                name: this.hash + '-' + index,
                index: chunk.index,
                hash: this.hash,
                chunk: chunk.file,
                progress: 0
              }
            })
            this.uploadChunks()

            // console.log('hash', hash)
            // console.log('hash1', hash1)
            // console.log('hash2', hash2)

            // 抽样hash
            // 布隆过滤器 损失一小部分精度换取效率
            

            return

            let form = new FormData()
            form.append('name', 'file')
            form.append('file', this.file)
            const res = await this.$http.post('/uploadfile', form, {
                onUploadProgress: (progress) => {
                    this.progressPercent = Number(((progress.loaded/progress.total)*100).toFixed(2))
                }
            })
            console.log(res)
        }
    }
}
</script>

<style lang="stylus">
    #drag 
        height 100px
        line-height 100px
        border 2px dashed #eee
        text-align center 
        vertical-align middle
    .cube-container
        .cube
            width 16px
            height 16px
            line-height 12px
            border 1px solid black
            background #eee
            float left
            > .success 
                background-color green 
            > .uploading
                background-color blue
            > .error
                background-color red
</style>