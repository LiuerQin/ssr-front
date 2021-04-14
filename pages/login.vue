<template>
  <div class="login-container">
    <el-form
      :model="form"
      :rules="rules"
      ref="loginForm"
      label-width="100px"
      class="login-form"
    >
      <div class="title-container">
        <img src="/logo.jpeg" alt="" />
      </div>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱"></el-input>
      </el-form-item>
      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <el-input v-model="form.captcha"></el-input>
        <div class="captcha" @click="updateCaptcha">
          <img :src="code" alt="" />
        </div>
      </el-form-item>
      <el-form-item prop="mailCode" label="验证码" class="captcha-container">
        <div class="captcha">
            <el-button
             @click="sendEmailCode"
              :disabled="send.timer > 0"
               type="primary"
            >
              {{sendText}}
            </el-button>
        </div>
        <el-input v-model="form.mailCode"></el-input>
      </el-form-item>
      <el-form-item prop="password" label="密码">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from "md5";
export default {
  layout: "login",
  data() {
    const repasswordValidator = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(new Error("两次密码不一致"));
      }
      callback();
    };
    return {
        send: {
            timer: 0
        },
      form: {
        email: "1461065472@qq.com",
        captcha: "",
        password: "123456",
        mailCode: ''
      },
      rules: {
        email: [
          { required: true, message: "请输入邮箱" },
          { type: "email", message: "请输入正确的邮箱格式" },
        ],
        captcha: [{ required: true, message: "请输入验证码" }],
        password: [{ required: true, message: "请输入6～12位密码" }],
        mailCode: [{ required: true, message: "请输入邮箱验证码" }],
      },
      code: "/api/captcha",
    };
  },
  computed: {
      sendText () {
          if (this.send.timer <=0) {
              return '发送'
          }
          return `${this.send.timer}s后发送`
      }
  },
  methods: {
      async sendEmailCode () {
        await this.$http.get('/sendcode?email=' + this.form.email)
          this.send.timer = 10
          const timer = setInterval(() => {
              this.send.timer--
              if (this.send.timer === 0) {
                  clearInterval(timer)
              }
          }, 1000)
      },
    updateCaptcha() {
      this.code = "/api/captcha?_t=" + new Date().getTime();
    },
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          const obj = {
            email: this.form.email,
            password: md5(this.form.password),
            captcha: this.form.captcha,
            emailcode: this.form.mailCode
          };
          const res = await this.$http.post("/user/login", obj);
          console.log(res);
          if (res.code == 0) {
            this.$message.success("登录成功");
            localStorage.setItem('token', res.data.token)
            setTimeout(() => {
              this.$router.push("/uc");
            }, 500);
          }
        } else {
          console.log("校验失败");
        }
      });
    },
  },
};
</script>

<style lang="stylus" scoped></style>