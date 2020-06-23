<template>
  <div class="d-flex flex-column">
    <div>
      <v-img
        :src="require('@/assets/logo.svg')"
        class="my-8"
        contain
        height="150"
      />
    </div>
    <v-form
      class="ma-4 login-form align-self-center d-flex flex-column"
    >
      <v-text-field
        label="用户名或邮箱"
      />
      <v-text-field
        type="password"
        label="密码"
      />
      <div class="my-4 text-overline text--secondary login-form-notice">
        登录可享受云服务。本程序仅供实验，请勿用于重要场合。
      </div>
      <v-btn color="primary mx-4">登录</v-btn>
    </v-form>
  </div>
</template>

<style lang="sass">
.login-form
  min-width: min(80vw, 360px)
.v-application .text-overline.login-form-notice
    letter-spacing: 0 !important
</style>
