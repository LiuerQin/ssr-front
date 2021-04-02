<template>
    <div>
        <nuxt></nuxt>
    </div>
</template>

<script>
export default {
    
}
</script>

<style lang="stylus">
  .login-container
    width 100%
    min-height 100%
    .login-form
      width 520px
      padding 160px 0
      margin 0 auto 
      overflow hidden 
      .title-container
        text-align center 
        img
          width 100px
      .captcha-container
        width 340px
        position relative 
        .captcha
          position absolute 
          right -110px
          top 0
          img 
            width 90px
            height 40px
            cursor pointer
</style>