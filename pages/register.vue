<template>
    <div class="login-container">
        <el-form :model="form" :rules="rules" ref="registerForm" label-width="100px" class="login-form">
          <div class="title-container">
            <img src="/logo.jpeg" alt="">
          </div>
          <el-form-item prop="email" label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          <el-form-item prop="captcha" label="验证码" class="captcha-container">
            <el-input v-model="form.captcha"></el-input>
            <div class="captcha" @click="updateCaptcha">
              <img :src="code" alt="">
            </div>
          </el-form-item>
          <el-form-item prop="nickname" label="昵称">
            <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
          </el-form-item>
          <el-form-item prop="password" label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item prop="repassword" label="确认密码">
            <el-input v-model="form.repassword" type="password" placeholder="请再次输入密码"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleRegister">注册</el-button>
          </el-form-item>
        </el-form>
    </div>
</template>

<script>
import md5 from 'md5';
export default {
  layout: 'login', 
    data () {
      const repasswordValidator = (rule, value, callback) => {
        if (value !== this.form.password) {
          callback(new Error('两次密码不一致'))
        }
        callback()
      }
      return {
        form: {
          email: '1461065472@qq.com',
          captcha: '',
          nickname: '刘勤',
          password: '123456',
          repassword: '123456'
        },
        rules: {
          email: [
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式'}
          ],
          captcha: [{ required: true, message: '请输入验证码' }],
          nickname: [{ required: true, message: '请输入昵称' }],
          password: [{ required: true, message: '请输入6～12位密码' }],
          repassword: [
            { required: true, message: '请输入密码' },
            { validator: repasswordValidator}
          ]
        },
        code: '/api/captcha'
      }
    },
    methods: {
      updateCaptcha () {
        this.code = '/api/captcha?_t=' + new Date().getTime()
      },
      handleRegister () {
        this.$refs.registerForm.validate(async (valid) => {
          if (valid) {
            const obj = {
              email: this.form.email,
              nickname: this.form.nickname,
              password: md5(this.form.password),
              captcha: this.form.captcha
            }
            const res = await this.$http.post('/user/register', obj)
            if (res.code == 0) {
              this.$alert('注册成功', '成功', {
                confirmButtonText: '去登录',
                callback: () => {
                  this.$router.push('/login')
                }
              })
            }
          } else {
            console.log('校验失败')
          }
        })
      }
    }
}
</script>

<style lang="stylus" scoped>
</style>