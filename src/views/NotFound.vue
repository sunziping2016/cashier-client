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
        <div class="text-h6">找不到该页面</div>
      </div>
    </v-app-bar>
    <v-main>
      <div class="ma-4">
        <div class="text-h3 my-4">404</div>
        <div class="text--secondary">你来到了不存在的地方~</div>
      </div>
    </v-main>
    <Snackbar />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import Snackbar from '@/components/Snackbar.vue';

export default Vue.extend({
  components: {
    Snackbar,
  },
});
</script>
