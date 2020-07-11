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
      <NavTitle>用户名</NavTitle>
      <v-spacer />
      <v-btn
        icon
        :loading="loading"
        :disabled="!(valid && usernameStatus === 2)"
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
          v-model="username"
          label="用户名*"
          :rules="usernameRules"
          :counter="24"
          :error-messages="usernameErrorMessages"
          :loading="usernameStatus === 1"
          :append-icon="usernameStatus === 2 ? 'mdi-check' : undefined"
        />
        <p class="text--secondary mt-4">其他用户可以通过用户名寻找到你。</p>
        <p class="text--secondary">你可以使用<b>a-z，A-Z，0-9和下线符</b>作为用户名，用户名至少有3位长。</p>
      </v-form>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import debounce from 'lodash-es/debounce';
import { mapActions, mapGetters, mapState } from 'vuex';
import NavTitle from '@/components/NavTitle.vue';
import { uniqueDebounce, usernameRules } from '@/utils';
import axios, { callbacks } from '@/axios';

export default Vue.extend({
  components: {
    NavTitle,
  },
  data: () => ({
    valid: false,
    username: '',
    // 0 for error, 1 for checking, 2 for pass, 3 for rejected
    usernameStatus: 0,
    loading: false,
  }),
  mounted() {
    this.username = (this.me && this.me.username) || '';
  },
  computed: {
    ...mapState([
      'token',
    ]),
    ...mapGetters('users', [
      'me',
    ]),
    usernameRules(): Array<(v: string) => boolean | string> {
      return usernameRules;
    },
    usernameErrorMessages(): string[] {
      if (this.usernameStatus === 3) {
        return ['该用户名已被使用'];
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
  },
  methods: {
    ...mapActions('snackbar', [
      'openSnackbar',
    ]),
    submit() {
      if (!this.valid) {
        return;
      }
      this.loading = true;
      axios
        .patch('/api/v1/users/me', {
          username: this.username,
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(...callbacks())
        .then(() => {
          this.$router.back();
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        })
        .then(() => {
          this.loading = false;
        });
    },
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
  },
});
</script>
