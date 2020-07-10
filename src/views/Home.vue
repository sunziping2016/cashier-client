<template>
  <div>
    <v-app-bar
      app
      clipped-left
      color="primary"
      dark
    >
      <v-app-bar-nav-icon
        v-if="$vuetify.breakpoint.xsOnly"
        @click="drawer = !drawer"
      />
      <NavTitle>山楂记账</NavTitle>
      <v-spacer />
      <v-btn
        icon
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-progress-circular
        v-if="networkStatus === 0"
        class="ml-3"
        size="24"
        width="2"
        indeterminate
      ></v-progress-circular>
      <v-btn
        v-else
        icon
      >
        <v-icon v-if="networkStatus === 1">
          mdi-cloud-alert
        </v-icon>
        <v-icon v-else>
          mdi-cloud-check
        </v-icon>
      </v-btn>
      <template v-slot:extension>
        <v-tabs
          v-model="tab"
          centered
        >
          <v-tab
            active-class="white--text"
            to="#book"
            replace
          >账本</v-tab>
          <v-tab
            active-class="white--text"
            to="#statistics"
            replace
          >统计</v-tab>
        </v-tabs>
      </template>
    </v-app-bar>
    <v-navigation-drawer
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
      <v-tabs-items
        v-model="tab"
      >
        <v-tab-item
          :value="'book'"
        >
          <v-card flat>
          </v-card>
        </v-tab-item>
        <v-tab-item
          :value="'statistics'"
        >
          <v-card flat>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapState } from 'vuex';
import DrawerUserInfo from '@/components/DrawerUserInfo.vue';
import NavTitle from '@/components/NavTitle.vue';

export default Vue.extend({
  components: {
    DrawerUserInfo,
    NavTitle,
  },
  data: () => ({
    drawer: false,
    tab: '',
  }),
  computed: {
    ...mapState([
      'networkStatus',
    ]),
  },
});
</script>
