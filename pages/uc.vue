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
    </div>
</template>

<script>
import sparkMD5 from 'spark-md5'
const CHUNK_SIZE = 0.001 * 1024 * 1024
export default {
    data () {
        return {
            file: null,
            progressPercent: 0,
            hashProgress: 0,
            chunks: []
        }
    },
    async mounted () {
        const res = await this.$http.get('/user/info')
        console.log(res)
        this.bindEvent()
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
            const offset = 2 * 1024 * 1024
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
            // this.chunks = this.createFileChunk(this.file)
            // const hash = await this.calculateHashWorker()
            // const hash1 = await this.calculateHashIdle()
            const hash2 = await this.calculateHashSimple()
            // console.log('hash', hash)
            // console.log('hash1', hash1)
            console.log('hash2', hash2)

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
</style>