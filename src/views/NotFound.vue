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
      <NavTitle>找不到该页面</NavTitle>
    </v-app-bar>
    <v-main>
      <div class="ma-4">
        <div class="text-h3 my-4">404</div>
        <div class="text--secondary">你来到了不存在的地方~</div>
      </div>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import NavTitle from '@/components/NavTitle.vue';

export default Vue.extend({
  components: {
    NavTitle,
  },
});
</script>
