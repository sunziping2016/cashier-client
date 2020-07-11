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
        @click="$router.back()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <NavTitle>邮箱</NavTitle>
    </v-app-bar>
    <v-main>
      <div class="d-flex flex-column">
        <v-stepper
          v-model="value"
          class="update-email-stepper align-self-center"
        >
          <v-stepper-header>
            <v-stepper-step
              :complete="value > 1"
              step="1"
            >
              填写新邮箱
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
              完成
            </v-stepper-step>
          </v-stepper-header>
          <v-stepper-items>
            <v-stepper-content
              :step="1"
            >
              <v-form
                v-model="emailValid"
                @submit.prevent="updateEmail"
                class="d-flex flex-column flex-grow-1"
              >
                <div class="text-h5 mb-6">填写新的邮箱</div>
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
                <p class="text--secondary mt-4">邮箱只有自己可见。它会被用于推送信息。</p>
                <v-spacer />
                <v-btn
                  text
                  type="submit"
                  :loading="emailLoading"
                  :disabled="!(emailValid && emailStatus === 2)"
                  class="float-right mt-6 align-self-end"
                >下一步</v-btn>
              </v-form>
            </v-stepper-content>
            <v-stepper-content
              :step="2"
            >
              <v-form
                v-model="confirmValid"
                @submit.prevent="confirmEmail"
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
                  text tile class="update-email-stepper-action"
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
                  text tile class="update-email-stepper-action"
                  @click="editEmail"
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
              <div class="text-h5">邮件修改成功！</div>
              <div class="text-body-2 my-6">
                您已完成邮件修改{{ me ? '' : '，需要重新登录'}}
              </div>
              <v-btn
                @click="backToSettings"
                color="primary"
              >
                返回
                <v-progress-circular
                  :size="20" :width="2" color="white"
                  :value="(redirectCountDownTotal - redirectCountDown)
                          / redirectCountDownTotal * 100"
                  class="ml-2"
                >{{ Math.floor(redirectCountDown) }}</v-progress-circular>
              </v-btn>
            </v-stepper-content>
          </v-stepper-items>
        </v-stepper>
      </div>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import debounce from 'lodash-es/debounce';
import NavTitle from '@/components/NavTitle.vue';
import axios, { callbacks } from '@/axios';
import { emailRules, uniqueDebounce, verificationCodeRules } from '@/utils';

export default Vue.extend({
  components: {
    NavTitle,
  },
  data: () => ({
    value: 1,
    emailValid: false,
    email: '',
    // 0 for error, 1 for checking, 2 for pass, 3 for rejected
    emailStatus: 0,
    emailLoading: false,
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
    this.email = (this.me && this.me.email) || '';
    const id = this.$route.query['email-updating-id'];
    if (typeof id === 'string') {
      axios
        .get(`/api/v1/email-updating/${id}`)
        .then(...callbacks())
        .then((result) => {
          if (result.status === 'Processing') {
            this.value = 2;
          } else if (result.status === 'Passed') {
            this.value = 3;
          } else if (result.status === 'Rejected') {
            throw Error('更改邮箱失败');
          } else if (result.status === 'Expired') {
            throw Error('更改邮箱超时');
          } else if (result.status === 'NotFound') {
            throw Error('找不到更改邮箱的信息');
          }
        })
        .catch((error) => {
          this.openSnackbar(error.message);
          this.value = 1;
          const query = { ...this.$route.query };
          delete query['email-updating-id'];
          this.$router.replace({ query });
        });
    }
  },
  computed: {
    ...mapState([
      'token',
    ]),
    ...mapGetters('users', [
      'me',
    ]),
    emailRules(): Array<(v: string) => boolean | string> {
      return emailRules;
    },
    codeRules(): Array<(v: string) => boolean | string> {
      return verificationCodeRules;
    },
    emailErrorMessages(): string[] {
      if (this.emailStatus === 3) {
        return ['该邮箱已被使用'];
      }
      return [];
    },
  },
  watch: {
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
    updateEmail() {
      this.emailLoading = true;
      axios
        .post('/api/v1/email-updating', {
          email: this.email,
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(...callbacks())
        .then((result) => {
          this.$router.replace({
            query: {
              ...this.$route.query,
              'email-updating-id': result.id,
            },
          });
          this.value = 2;
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        })
        .then(() => {
          this.emailLoading = false;
        });
    },
    editEmail() {
      const query = { ...this.$route.query };
      if (typeof query['email-updating-id'] === 'string') {
        delete query['email-updating-id'];
        this.$router.replace({ query });
      }
      this.value = 1;
    },
    resendEmail() {
      const query = { ...this.$route.query };
      const id = query['email-updating-id'];
      if (typeof id === 'string') {
        this.resendEmailLoading = true;
        axios
          .post(`/api/v1/email-updating/${id}/resend`, {}, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then(...callbacks())
          .catch((error) => {
            this.openSnackbar(error.message);
          })
          .then(() => {
            this.resendEmailLoading = false;
          });
      }
    },
    confirmEmail() {
      this.confirmLoading = true;
      const id = this.$route.query['email-updating-id'];
      axios
        .post(`/api/v1/email-updating/${id}/confirm`, {
          code: this.code,
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(...callbacks())
        .then(() => {
          this.value = 3;
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        })
        .then(() => {
          this.confirmLoading = false;
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
            this.backToSettings();
          }
        }, this.redirectInterval * 1000);
      }
    },
    backToSettings() {
      this.$router.back();
    },
  },
});
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.update-email-stepper
  min-width: min(100vw, 600px)
  &-action
    padding: 0 8px !important
    & > .v-btn__content
      justify-content: left

@media #{map-get($display-breakpoints, 'xs-only')}
  .update-email-stepper
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
