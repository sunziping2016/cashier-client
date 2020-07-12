<template>
  <div>
    <v-app-bar
      app
      color="primary"
      dark
    >
      <v-btn
        icon
        @click="$router.back()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <NavTitle>修改密码</NavTitle>
      <v-spacer />
      <v-btn
        icon
        :loading="loading"
        :disabled="!valid"
        @click="submit"
      >
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-form
        v-model="valid"
        @submit.prevent="submit"
        class="px-6 py-4"
      >
        <v-text-field
          v-model="oldPassword"
          :type="showOldPassword ? 'text' : 'password'"
          :append-icon="showOldPassword ? 'mdi-eye' : 'mdi-eye-off'"
          label="旧密码*"
          :rules="passwordRules"
          :counter="24"
          @click:append="showOldPassword = !showOldPassword"
        />
        <v-text-field
          v-model="newPassword"
          :type="showNewPassword ? 'text' : 'password'"
          :append-icon="showNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          label="新密码*"
          :rules="passwordRules"
          :counter="24"
          @click:append="showNewPassword = !showNewPassword"
        />
        <p class="text--secondary">密码不可以包含空白字符，且长6到24位。</p>
      </v-form>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import NavTitle from '@/components/NavTitle.vue';
import { passwordRules } from '@/utils';
import axios, { callbacks } from '@/axios';

export default Vue.extend({
  components: {
    NavTitle,
  },
  data: () => ({
    valid: false,
    oldPassword: '',
    showOldPassword: false,
    newPassword: '',
    showNewPassword: false,
    loading: false,
  }),
  computed: {
    ...mapState([
      'token',
    ]),
    ...mapGetters('users', [
      'me',
    ]),
    passwordRules(): Array<(v: string) => boolean | string> {
      return passwordRules;
    },
  },
  methods: {
    ...mapActions('snackbar', [
      'openSnackbar',
    ]),
    ...mapActions({
      siteLogin: 'login',
    }),
    submit() {
      if (!this.valid) {
        return;
      }
      this.loading = true;
      const password = this.newPassword;
      axios
        .post('/api/v1/users/me/password', {
          password,
          oldPassword: this.oldPassword,
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(...callbacks())
        .then(() => {
          if (this.me && this.me.username) {
            this.siteLogin({
              username: this.me.username,
              password,
            })
              .then(() => {
                this.openSnackbar({
                  text: '重新登录成功！',
                  buttonColor: 'green',
                });
                this.$router.back();
              })
              .catch((error) => {
                this.openSnackbar(error.message);
              });
          } else {
            this.$router.push({ name: 'Login' });
          }
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        })
        .then(() => {
          this.loading = false;
        });
    },
  },
});
</script>
