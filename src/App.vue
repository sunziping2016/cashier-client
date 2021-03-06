<template>
  <v-app>
    <div style="position: relative;" ref="views" id="app-views">
      <transition :name="routerTransition">
        <router-view />
      </transition>
    </div>
    <Snackbar />
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapMutations, mapState } from 'vuex';
import Snackbar from '@/components/Snackbar.vue';

export default Vue.extend({
  name: 'App',
  components: {
    Snackbar,
  },
  mounted() {
    this.init();
    this.$router.afterEach((to) => {
      this.websocketSubscribe(to.meta.subscribe || []);
    });
  },
  computed: {
    ...mapState([
      'routerTransition',
    ]),
  },
  watch: {
    // eslint-disable-next-line func-names
    $route(to, from) {
      const toDepth = to.path.split('/').filter((x: string) => x).length;
      const fromDepth = from.path.split('/').filter((x: string) => x).length;
      if (toDepth < fromDepth) {
        this.setRouterTransition('slide-out');
      } else if (fromDepth < toDepth) {
        this.setRouterTransition('slide-in');
      } else {
        this.setRouterTransition('slide-y');
      }
    },
  },
  methods: {
    ...mapMutations([
      'setRouterTransition',
    ]),
    ...mapActions([
      'init',
      'websocketSubscribe',
    ]),
    ...mapActions('snackbar', [
      'openSnackbar',
    ]),
  },
});
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.slide-in-enter-active, .slide-in-leave-active,
.slide-out-enter-active, .slide-out-leave-active,
.slide-y-enter-active, .slide-y-leave-active
  transition: all .3s map-get($transition, 'swing')
  position: absolute
  width: 100vw
.slide-in-enter-active, .slide-out-leave-active, .slide-y-enter-active
  z-index: 1
.slide-in-leave-active, .slide-out-enter-active, .slide-y-leave-active
  z-index: 0
.slide-in-enter, .slide-out-leave-to, .slide-y-enter,  .slide-y-leave-to
  opacity: 0
.slide-in-leave-to, .slide-out-enter
  opacity: .9 // there will be a strange flash at the end of animation if remove this
.slide-in-enter, .slide-out-leave-to
  transform: translateX(100px)
.slide-y-enter, .slide-y-leave-to
  transform: translateY(60px)

#app-views > div
  min-height: 100vh
  max-width: 100%
  .theme--dark.v-application &
    background: #121212
    color: #FFFFFF
  .theme--light.v-application &
    background: #FFFFFF
    color: rgba(0, 0, 0, 0.87)
</style>
