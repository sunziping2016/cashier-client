<template>
  <v-app>
    <v-app-bar
      app
      clipped-left
      color="primary"
      dark
    >
      <v-btn
        icon
        @click="$router.go(-1)"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <div class="d-flex align-center">
        <router-link :to="{ name: 'Home' }">
          <v-img
            v-if="$vuetify.breakpoint.smAndUp"
            alt="Vuetify Logo"
            class="shrink mr-2"
            contain
            :src="require('@/assets/logo.svg')"
            width="40"
          />
        </router-link>
        <div class="text-h6">登录</div>
      </div>
      <v-spacer />
      <v-btn
        icon
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-progress-circular
        v-if="networkStatus === 0"
        class="ml-3"
        size="24"
        width="2"
        indeterminate
      ></v-progress-circular>
      <v-btn
        v-else
        icon
      >
        <v-icon v-if="networkStatus === 1">
          mdi-cloud-alert
        </v-icon>
        <v-icon v-else>
          mdi-cloud-check
        </v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
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
            :label="`${modeText}*`"
            :disabled="mode === 3"
            :rules="accountRules"
            :counter="100"
          />
          <v-text-field
            :type="showPassword ? 'text' : 'password'"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            v-model="password"
            label="密码*"
            :disabled="mode === 3"
            :rules="passwordRules"
            :counter="24"
            @click:append="showPassword = !showPassword"
          />
          <v-btn
            type="submit"
            color="primary mx-4"
            :disabled="mode === 3 || !valid"
            :loading="loading"
          >登录</v-btn>
          <div class="text-subtitle-2 text--secondary my-6">
            还没有账号？
            <router-link :to="{ name: 'Register' }"
            >注册</router-link>
          </div>
        </v-form>
      </div>
    </v-main>
    <Snackbar />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapActions, mapState } from 'vuex';
import { emailRegex, usernameRegex, passwordRegex } from '@/utils';
import Snackbar from '@/components/Snackbar.vue';

export default Vue.extend({
  components: {
    Snackbar,
  },
  data: () => ({
    valid: false,
    loading: false,
    account: '',
    password: '',
    showPassword: false,
  }),
  mounted() {
    const { account } = this.$route.query;
    if (typeof account === 'string') {
      this.$nextTick(() => {
        this.account = account;
      });
    }
  },
  computed: {
    ...mapState([
      'networkStatus',
    ]),
    ...mapGetters([
      'myPermissionsSet',
    ]),
    mode(): number {
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
    modeText(): string {
      switch (this.mode) {
        case 0: return '用户名或邮箱';
        case 1: return '用户名';
        case 2: return '邮箱';
        default: return '账号';
      }
    },
    accountRules(): Array<(v: string) => boolean | string> {
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
    passwordRules(): Array<(v: string) => boolean | string> {
      return [
        (v: string) => !!v || '密码是必须的',
        (v: string) => (v.length >= 6 && v.length <= 24) || '密码应包含6到24位字符',
        (v: string) => passwordRegex.test(v) || '密码不应包含空白字符',
      ];
    },
  },
  methods: {
    ...mapActions({
      siteLogin: 'login',
    }),
    ...mapActions('snackbar', [
      'openSnackbar',
    ]),
    login(): void {
      const isEmail = this.account.indexOf('@') !== -1;
      const accountText = isEmail ? 'email' : 'username';
      this.loading = true;
      this.siteLogin({
        [accountText]: this.account,
        password: this.password,
      })
        .then(() => {
          this.loading = false;
          this.openSnackbar({
            text: '登录成功！',
            buttonColor: 'green',
          });
          this.$router.push({ name: 'Home' });
        })
        .catch((error) => {
          this.loading = false;
          this.openSnackbar(error.message);
        });
    },
  },
});
</script>

<style lang="sass">
.login-form
  min-width: min(80vw, 360px)
</style>
