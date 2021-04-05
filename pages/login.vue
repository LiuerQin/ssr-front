<template>
    <div class="login-container">
        <el-form :rules="rules" class="login-form">
            <el-form-item prop="email">
                <span>
                    <li class="el-icon-mobile"></li>
                </span>
                <el-input placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
                <span>
                    <li class="el-icon-lock"></li>
                </span>
                <el-input placeholder="密码"></el-input>
            </el-form-item>
            <el-form-item prop="captcha" class="captcha-container">
                <span>
                    <li class="el-icon-lock"></li>
                </span>
                <el-input placeholder="验证码"></el-input>
                <div class="captcha">
                    <img :src="captchaUrl" alt="" @click="updateCaptcha">
                </div>
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    layout: 'login',
    data () {
        return {
            rules: {},
            captchaUrl: "/api/captcha"
        }
    },
    methods: {
      updateCaptcha () {
        this.captchaUrl = "/api/captcha?t=" + new Date().getTime()
      }
    }
}
</script>

<style lang="stylus" scoped>
</style>