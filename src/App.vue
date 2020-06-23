<template>
  <v-app>
    <v-app-bar
      app
      clipped-left
      color="primary"
      dark
    >
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.xsOnly && !$route.meta.closable"
        @click="drawer = !drawer"
      />
      <v-btn
        icon
        v-if="$route.meta.closable"
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
        <div class="text-h5">{{$route.meta.title || '山楂记账'}}</div>
      </div>
      <v-spacer />
      <template v-slot:extension v-if="$route.meta.tabs">
        <v-tabs
          v-model="tab"
          centered
        >
          <v-tab
            v-for="tab in $route.meta.tabs"
            :key="tab.name"
            :to="tab.href"
            replace
          >{{ tab.name }}</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-navigation-drawer
      v-if="!$route.meta.closable"
      v-model="drawer"
      clipped
      app
      :mobile-breakpoint="$vuetify.breakpoint.thresholds.xs"
      :permanent="$vuetify.breakpoint.smAndUp"
      :expand-on-hover="$vuetify.breakpoint.smOnly"
    >
      <template
        v-if="$vuetify.breakpoint.xsOnly"
      >
        <DrawerUserInfo />
        <v-divider />
      </template>
    </v-navigation-drawer>
    <v-main>
      <router-view :tab.sync="tab" />
    </v-main>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import DrawerUserInfo from './components/DrawerUserInfo.vue';

export default Vue.extend({
  name: 'App',
  components: {
    DrawerUserInfo,
  },
  data: () => ({
    drawer: false,
    tab: '',
  }),
  watch: {
    // eslint-disable-next-line func-names
    '$route.meta.closable': function () {
      this.drawer = false;
    },
  },
});
</script>
