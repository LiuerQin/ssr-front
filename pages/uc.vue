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
    </div>
</template>

<script>
export default {
    data () {
        return {
            file: null,
            progressPercent: 0
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
        async isImage (file) {
            return await this.isGif(file)
        },
        async uploadFile () {
            if (!await this.isImage(this.file)) {
                alert('文件格式不对')
                return
            } else {
                console.log('文件格式正确')
            }
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