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
      v-model="valid"
      class="ma-4 login-form align-self-center d-flex flex-column"
      @submit.prevent="login"
    >
      <v-text-field
        v-model="account"
        :label="modeText"
        :disabled="mode === 3"
        :rules="accountRules"
        :counter="340"
      />
      <v-text-field
        type="password"
        v-model="password"
        label="密码"
        :disabled="mode === 3"
        :rules="passwordRules"
        :counter="24"
      />
      <div class="my-4 text-overline text--secondary login-form-notice">
        登录可享受云服务。本程序仅供实验，请勿用于重要场合。
      </div>
      <v-btn
        type="submit"
        color="primary mx-4"
        :disabled="mode === 3 || !valid"
        :loading="loading"
      >登录</v-btn>
    </v-form>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';
import { emailRegex, usernameRegex, passwordRegex } from '@/utils';
import axios, { handler } from '../axios';

export default Vue.extend({
  data: () => ({
    valid: false,
    loading: false,
    account: '',
    password: '',
  }),
  computed: {
    ...mapGetters([
      'myPermissionsSet',
    ]),
    mode() {
      const username = this.myPermissionsSet['token:acquire-by-username'];
      const email = this.myPermissionsSet['token:acquire-by-email'];
      if (username && email) {
        return 0;
      }
      if (username) {
        return 1;
      }
      if (email) {
        return 2;
      }
      return 3;
    },
    modeText() {
      switch (this.mode) {
        case 0: return '用户名或邮箱';
        case 1: return '用户名';
        case 2: return '邮箱';
        default: return '账号';
      }
    },
    accountRules() {
      return [
        (v: string) => !!v || `${this.modeText}是必须的`,
        (v: string) => {
          if ((this.mode === 0 || this.mode === 2) && emailRegex.test(v)) {
            return true;
          }
          if ((this.mode === 0 || this.mode === 1)
            && v.length >= 3 && v.length <= 24 && usernameRegex.test(v)) {
            return true;
          }
          return `非法的${this.modeText}`;
        },
      ];
    },
    passwordRules() {
      return [
        (v: string) => !!v || '密码是必须的',
        (v: string) => (v.length >= 3 && v.length <= 24) || '密码应包含3到24位数字',
        (v: string) => passwordRegex.test(v) || '密码不应包含空白字符',
      ];
    },
  },
  methods: {
    login() {
      const isEmail = this.account.indexOf('@') !== -1;
      const accountText = isEmail ? 'email' : 'username';
      this.loading = true;
      axios
        .post(`/api/v1/tokens/acquire-by-${accountText}`, {
          [accountText]: this.account,
          password: this.password,
        })
        .then(...handler())
        .then((result) => {
          console.log(result);
          this.loading = false;
        })
        .catch((error) => {
          console.log(error.name, error.message);
          this.loading = false;
        });
    },
  },
});
</script>

<style lang="sass">
.login-form
  min-width: min(80vw, 360px)
.v-application .text-overline.login-form-notice
    letter-spacing: 0 !important
</style>
