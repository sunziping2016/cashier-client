<template>
  <div
    class="drawer-user-info pa-4 d-flex flex-column justify-space-between"
    :style="{ backgroundColor: $vuetify.theme.currentTheme.primary }"
  >
    <div
      class="d-flex justify-space-between"
    >
      <component
        :is="canLogin ? 'router-link' : 'div'"
        :to="{ name: 'Login' }" class="text-decoration-none"
      >
        <v-avatar
          size="64"
          color="yellow darken-2"
        >
          <v-icon dark large>mdi-account</v-icon>
        </v-avatar>
      </component>
      <v-btn
        icon
        @click="$vuetify.theme.dark = !$vuetify.theme.dark"
      >
        <v-icon color="white">mdi-brightness-{{ $vuetify.theme.dark ? '4' : '7' }}</v-icon>
      </v-btn>
    </div>
    <div class="white--text" v-if="canLogin">点击头像登录</div>
    <div class="white--text" v-else>服务器禁止了用户登录</div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters } from 'vuex';

export default Vue.extend({
  computed: {
    ...mapGetters([
      'myPermissionsSet',
    ]),
    canLogin() {
      return this.myPermissionsSet['token:acquire-by-username']
        || this.myPermissionsSet['token:acquire-by-email'];
    },
  },
});
</script>

<style lang="sass">
.drawer-user-info
  min-height: 150px
</style>
