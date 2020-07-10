<template>
  <router-link
    tag="div"
    :to="avatarRoute"
    v-slot="{ href, navigate }"
  >
    <div
      class="drawer-user-info pa-4 d-flex flex-column"
      :style="{ backgroundColor: $vuetify.theme.currentTheme.primary }"
    >
      <div
        class="d-flex justify-space-between"
      >
        <a
          class="text-decoration-none"
          :href="href"
          @click="navigate"
        >
          <v-avatar
            size="64"
            :color="avatar ? undefined : 'yellow darken-2'"
          >
            <v-icon dark large v-if="!avatar">mdi-account</v-icon>
            <img v-else :src="avatar" alt="avatar">
          </v-avatar>
        </a>
        <v-btn
          icon
          @click="$vuetify.theme.dark = !$vuetify.theme.dark"
        >
          <v-icon color="white">mdi-brightness-{{ $vuetify.theme.dark ? '4' : '7' }}</v-icon>
        </v-btn>
      </div>
      <v-spacer />
      <div class="white--text" v-if="me">
        <div>{{me.nickname || '还没有昵称ㄟ( ▔, ▔ )ㄏ'}}</div>
        <div class="caption" v-if="me">@{{me.username}}</div>
      </div>
      <a class="white--text text-decoration-none" v-else-if="canLogin"
         :href="href" @click="navigate"
      >点击头像登录</a>
      <div class="white--text" v-else-if="networkStatus === 2">服务器禁止了用户登录</div>
      <div class="white--text" v-else>无法连接服务器</div>
    </div>
  </router-link>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapGetters, mapState } from 'vuex';

export default Vue.extend({
  computed: {
    ...mapState([
      'networkStatus',
    ]),
    ...mapGetters([
      'myPermissionsSet',
    ]),
    ...mapGetters('users', [
      'me',
    ]),
    canLogin(): boolean {
      return this.myPermissionsSet['token:acquire-by-username']
        || this.myPermissionsSet['token:acquire-by-email'];
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    avatarRoute(): any {
      if (!this.me && this.canLogin) {
        return { name: 'Login' };
      }
      if (this.me) {
        return { name: 'Settings' };
      }
      return { name: 'NotFound' };
    },
    avatar(): boolean {
      return this.me && (this.me.avatar128 || this.me.avatar);
    },
  },
});
</script>

<style lang="sass">
.drawer-user-info
  min-height: 160px
</style>
