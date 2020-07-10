<template>
  <div>
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
        <div class="text-h6">注册账户</div>
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
        <v-stepper
          v-model="value"
          class="register-stepper align-self-center"
        >
          <v-stepper-header>
            <v-stepper-step
              :complete="value > 1"
              step="1"
            >
              填写基础信息
            </v-stepper-step>
            <v-divider />
            <v-stepper-step
              :complete="value > 2"
              step="2"
            >
              验证邮件
            </v-stepper-step>
            <v-divider />
            <v-stepper-step
              :complete="value > 3"
              step="3"
            >
              完善个人信息
            </v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content
              :step="1"
            >
              <v-form
                v-model="basicInfoValid"
                @submit.prevent="register"
                class="d-flex flex-column flex-grow-1"
              >
                <div class="text-h5 mb-6">创建你的账号</div>
                <v-text-field
                  class="flex-grow-0"
                  v-model="username"
                  label="用户名*"
                  :rules="usernameRules"
                  :counter="24"
                  :error-messages="usernameErrorMessages"
                  :loading="usernameStatus === 1"
                  :append-icon="usernameStatus === 2 ? 'mdi-check' : undefined"
                />
                <v-text-field
                  class="flex-grow-0"
                  v-model="email"
                  type="email"
                  label="邮箱*"
                  :rules="emailRules"
                  :counter="100"
                  :error-messages="emailErrorMessages"
                  :loading="emailStatus === 1"
                  :append-icon="emailStatus === 2 ? 'mdi-check' : undefined"
                />
                <v-text-field
                  class="flex-grow-0"
                  :type="showPassword ? 'text' : 'password'"
                  :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                  v-model="password"
                  label="密码*"
                  :rules="passwordRules"
                  :counter="24"
                  @click:append="showPassword = !showPassword"
                />
                <v-spacer />
                <v-btn
                  text
                  type="submit"
                  :loading="basicInfoLoading"
                  :disabled="!(basicInfoValid && usernameStatus === 2 && emailStatus === 2)"
                  class="float-right mt-6 align-self-end"
                >下一步</v-btn>
              </v-form>
            </v-stepper-content>
            <v-stepper-content
              :step="2"
            >
              <v-form
                v-model="confirmValid"
                @submit.prevent="confirmRegistration"
                class="d-flex flex-column flex-grow-1"
              >
                <div class="text-h5">我们向你的邮箱发送了验证码</div>
                <div class="text--secondary mt-2">输入验证码，来验证{{email}}</div>
                <v-text-field
                  class="flex-grow-0"
                  v-model="code"
                  label="验证码*"
                  :rules="codeRules"
                  :counter="6"
                />
                <div class="text-body-2 mt-4 mb-2">没有收到邮件？</div>
                <v-btn
                  text tile class="register-stepper-action"
                  @click="resendEmail"
                  :disabled="resendEmailLoading"
                >
                  <v-icon left>mdi-send-outline</v-icon>再次发送邮件
                  <v-progress-circular
                    v-if="resendEmailLoading"
                    class="ml-2"
                    size="20"
                    width="2"
                    indeterminate
                  />
                </v-btn>
                <v-btn
                  text tile class="register-stepper-action"
                  @click="editInformation"
                >
                  <v-icon left>mdi-pencil-outline</v-icon>重新编辑信息
                </v-btn>
                <v-spacer />
                <v-btn
                  text
                  class="float-right mt-6 align-self-end"
                  type="submit"
                  :loading="confirmLoading"
                  :disabled="!confirmValid"
                >下一步</v-btn>
              </v-form>
            </v-stepper-content>
            <v-stepper-content
              :step="3"
            >
              <div class="text-h5">注册成功！</div>
              <div class="text-body-2 my-6">@{{username}}
                已完成注册{{ me ? '' : '，您需要重新登录'}}
              </div>
              <v-btn
                @click="jumpToHome"
                color="primary"
              >
                前往{{ me ? '首页' : '登录' }}
                <v-progress-circular
                  :size="20" :width="2" color="white"
                  :value="(redirectCountDownTotal - redirectCountDown)
                          / redirectCountDownTotal * 100"
                  class="ml-2"
                >{{ Math.round(redirectCountDown) }}</v-progress-circular>
              </v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </div>
    </v-main>
    <Snackbar />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import debounce from 'lodash-es/debounce';
import {
  emailRegex, usernameRegex, passwordRegex, uniqueDebounce,
} from '@/utils';
import axios, { callbacks } from '@/axios';
import Snackbar from '@/components/Snackbar.vue';
import { mapActions, mapGetters, mapState } from 'vuex';

export default Vue.extend({
  components: { Snackbar },
  data: () => ({
    value: 1,
    basicInfoValid: false,
    username: '',
    email: '',
    password: '',
    showPassword: false,
    // 0 for error, 1 for checking, 2 for pass, 3 for rejected
    usernameStatus: 0,
    emailStatus: 0,
    basicInfoLoading: false,
    confirmValid: false,
    confirmLoading: false,
    code: '',
    redirectCountDownTotal: 5,
    redirectCountDown: 5,
    redirectInterval: 1,
    redirectIntervalId: null as null | number,
    resendEmailLoading: false,
  }),
  beforeDestroy() {
    if (this.redirectIntervalId !== null) {
      clearInterval(this.redirectIntervalId);
      this.redirectIntervalId = null;
    }
  },
  mounted() {
    this.updateRedirectCounter();
    const id = this.$route.query['registration-id'];
    if (typeof id === 'string') {
      axios
        .get(`/api/v1/registrations/${id}`)
        .then(...callbacks())
        .then((result) => {
          if (result.status === 'Processing') {
            this.value = 2;
            this.username = result.username;
            this.email = result.email;
          } else if (result.status === 'Passed') {
            this.value = 3;
            this.username = result.username;
            this.email = result.email;
          } else if (result.status === 'Rejected') {
            this.username = result.username;
            this.email = result.email;
            throw Error('注册失败');
          } else if (result.status === 'Expired') {
            throw Error('注册超时');
          } else if (result.status === 'NotFound') {
            throw Error('找不到注册的信息');
          }
        })
        .catch((error) => {
          this.openSnackbar(error.message);
          this.value = 1;
          const query = { ...this.$route.query };
          delete query['registration-id'];
          this.$router.replace({ query });
        });
    }
  },
  computed: {
    ...mapState([
      'networkStatus',
    ]),
    ...mapGetters('users', [
      'me',
    ]),
    usernameRules(): Array<(v: string) => boolean | string> {
      return [
        (v: string) => !!v || '用户名是必须的',
        (v: string) => (v.length >= 3 && v.length <= 24) || '用户名应包含3到24位字符',
        (v: string) => usernameRegex.test(v) || '用户名应当只包含英文数字和下线符',
      ];
    },
    emailRules(): Array<(v: string) => boolean | string> {
      return [
        (v: string) => !!v || '邮箱是必须的',
        (v: string) => emailRegex.test(v) || '不是合法的邮箱地址',
      ];
    },
    passwordRules(): Array<(v: string) => boolean | string> {
      return [
        (v: string) => !!v || '密码是必须的',
        (v: string) => (v.length >= 6 && v.length <= 24) || '密码应包含6到24位字符',
        (v: string) => passwordRegex.test(v) || '密码不应包含空白字符',
      ];
    },
    codeRules(): Array<(v: string) => boolean | string> {
      return [
        (v: string) => !!v || '验证码是必须的',
        (v: string) => v.length === 6 || '验证码应包含6位字符',
        (v: string) => /^\d*$/.test(v) || '验证码应当只包含数字',
      ];
    },
    usernameErrorMessages(): string[] {
      if (this.usernameStatus === 3) {
        return ['该用户名已被使用'];
      }
      return [];
    },
    emailErrorMessages(): string[] {
      if (this.emailStatus === 3) {
        return ['该邮箱已被使用'];
      }
      return [];
    },
  },
  watch: {
    username() {
      if (this.usernameRules.every((rule) => rule(this.username) === true)) {
        this.usernameStatus = 1;
        this.checkUsernameUnique(this.username);
      } else {
        this.usernameStatus = 0;
      }
    },
    email() {
      if (this.emailRules.every((rule) => rule(this.email) === true)) {
        this.emailStatus = 1;
        this.checkEmailUnique(this.email);
      } else {
        this.emailStatus = 0;
      }
    },
    value() {
      this.updateRedirectCounter();
    },
  },
  methods: {
    ...mapActions('snackbar', [
      'openSnackbar',
    ]),
    ...mapActions({
      siteLogin: 'login',
    }),
    // eslint-disable-next-line func-names, @typescript-eslint/no-explicit-any
    checkUsernameUnique: debounce(function (this: any, username: string) {
      axios
        .get('/api/v1/users/check-username-existence', {
          params: {
            username,
          },
        })
        .then(...callbacks())
        .then((result) => {
          if (this.username === username) {
            this.usernameStatus = result.exists ? 3 : 2;
          }
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        });
    }, uniqueDebounce),
    // eslint-disable-next-line func-names, @typescript-eslint/no-explicit-any
    checkEmailUnique: debounce(function (this: any, email: string) {
      axios
        .get('/api/v1/users/check-email-existence', {
          params: {
            email,
          },
        })
        .then(...callbacks())
        .then((result) => {
          if (this.email === email) {
            this.emailStatus = result.exists ? 3 : 2;
          }
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        });
    }, uniqueDebounce),
    register() {
      this.basicInfoLoading = true;
      axios
        .post('/api/v1/registrations', {
          username: this.username,
          email: this.email,
          password: this.password,
        })
        .then(...callbacks())
        .then((result) => {
          this.$router.replace({
            query: {
              ...this.$route.query,
              'registration-id': result.id,
            },
          });
          this.value = 2;
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        })
        .then(() => {
          this.basicInfoLoading = false;
        });
    },
    editInformation() {
      const query = { ...this.$route.query };
      if (typeof query['registration-id'] === 'string') {
        delete query['registration-id'];
        this.$router.replace({ query });
      }
      this.value = 1;
    },
    resendEmail() {
      const query = { ...this.$route.query };
      const id = query['registration-id'];
      if (typeof id === 'string') {
        this.resendEmailLoading = true;
        axios
          .post(`/api/v1/registrations/${id}/resend`)
          .then(...callbacks())
          .catch((error) => {
            this.openSnackbar(error.message);
          })
          .then(() => {
            this.resendEmailLoading = false;
          });
      }
    },
    confirmRegistration() {
      this.confirmLoading = true;
      const id = this.$route.query['registration-id'];
      axios
        .post(`/api/v1/registrations/${id}/confirm`, {
          code: this.code,
        })
        .then(...callbacks())
        .then(() => {
          this.confirmLoading = false;
          if (this.password) {
            this.siteLogin({
              username: this.username,
              password: this.password,
            })
              .then(() => {
                this.openSnackbar({
                  text: '登录成功！',
                  buttonColor: 'green',
                });
              })
              .catch((error) => {
                this.openSnackbar(error.message);
              })
              .then(() => {
                this.value = 3;
              });
          } else {
            this.value = 3;
          }
        })
        .catch((error) => {
          this.confirmLoading = false;
          this.openSnackbar(error.message);
        });
    },
    updateRedirectCounter() {
      if (this.redirectIntervalId !== null) {
        clearInterval(this.redirectIntervalId);
        this.redirectIntervalId = null;
      }
      if (this.value === 3) {
        this.redirectCountDown = this.redirectCountDownTotal;
        this.redirectIntervalId = setInterval(() => {
          this.redirectCountDown -= this.redirectInterval;
          if (this.redirectCountDown <= 0 && this.redirectIntervalId !== null) {
            this.redirectCountDown = 0;
            clearInterval(this.redirectIntervalId);
            this.redirectIntervalId = null;
            this.jumpToHome();
          }
        }, this.redirectInterval * 1000);
      }
    },
    jumpToHome() {
      if (this.me) {
        this.$router.push({ name: 'Home' });
      } else {
        this.$router.push({
          name: 'Login',
          query: {
            account: this.username,
          },
        });
      }
    },
  },
});
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.register-stepper
  min-width: min(100vw, 600px)
  &-action
    padding: 0 8px !important
    & > .v-btn__content
      justify-content: left

@media #{map-get($display-breakpoints, 'xs-only')}
  .register-stepper
    min-height: calc(100vh - 56px)
    display: flex
    flex-direction: column
    & > .v-stepper__items
      display: flex
      flex-direction: column
      flex-grow: 1
      & > .v-stepper__content
        display: flex
        flex-direction: column
        flex-grow: 1
        & > .v-stepper__wrapper
          display: flex
          flex-direction: column
          flex-grow: 1
</style>
