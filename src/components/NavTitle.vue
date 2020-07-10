<template>
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
    <div class="text-h6"><slot /></div>
  </div>
</template>
