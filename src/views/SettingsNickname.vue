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
      <NavTitle>昵称</NavTitle>
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
          v-model="nickname"
          label="昵称*"
          :rules="nicknameRules"
          :counter="24"
        />
        <p class="text--secondary mt-4">其他用户可以通过昵称寻找到你。</p>
        <p class="text--secondary">你可以使用<b>任意字符</b>作为昵称，昵称至少有3位长。</p>
      </v-form>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavTitle from '@/components/NavTitle.vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import { nicknameRules } from '@/utils';
import axios, { callbacks } from '@/axios';

export default Vue.extend({
  components: {
    NavTitle,
  },
  data: () => ({
    valid: false,
    nickname: '',
    loading: false,
  }),
  mounted() {
    this.nickname = (this.me && this.me.nickname) || '';
  },
  computed: {
    ...mapState([
      'token',
    ]),
    ...mapGetters('users', [
      'me',
    ]),
    nicknameRules(): Array<(v: string) => boolean | string> {
      return nicknameRules;
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
          nickname: this.nickname,
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
  },
});
</script>
