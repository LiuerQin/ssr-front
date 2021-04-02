<template>
    <div class="login-container">
        <el-form :model="form" :rules="rules" ref="registerForm" label-width="100px" class="login-form">
          <div class="title-container">
            <img src="/logo.png" alt="">
          </div>
          <el-form-item props="email" label="邮箱">
            <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          <el-form-item props="captcha" label="验证码" class="captcha-container">
            <el-input v-model="form.captcha"></el-input>
            <div class="captcha" @click="updateCaptcha">
              <img :src="code" alt="">
            </div>
          </el-form-item>
          <el-form-item props="nickname" label="昵称">
            <el-input v-model="form.nickname" placeholder="请输入昵称"></el-input>
          </el-form-item>
          <el-form-item props="password" label="密码">
            <el-input v-model="form.password" placeholder="请输入密码"></el-input>
          </el-form-item>
          <el-form-item props="repassword" label="确认密码">
            <el-input v-model="form.repassword" placeholder="请再次输入密码"></el-input>
          </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
  layout: 'login', 
    data () {
      return {
        form: {
          email: '',
          captcha: '',
          nickname: '',
          password: '',
          repassword: ''
        },
        rules: {
          email: [
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式'}
          ],
          captcha: '',
          nickname: '',
          password: '',
          repassword: ''
        },
        code: '/api/captcha'
      }
    },
    methods: {
      updateCaptcha () {
        this.code = '/api/captcha?_t=' + new Date().getTime()
      }
    }
}
</script>

<style lang="stylus" scoped>
</style>