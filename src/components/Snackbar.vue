<template>
  <v-snackbar
    :value="snackbar"
  >
    {{ snackbarText }}
    <template v-slot:action="{ attrs }">
      <v-btn
        :color="snackbarButtonColor"
        text
        v-bind="attrs"
        @click="snackbarButtonAction"
      >
        {{ snackbarButtonText }}
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script>
import { mapState, mapMutations } from 'vuex';

export default {
  computed: {
    ...mapState('snackbar', [
      'snackbar',
      'snackbarText',
      'snackbarButtonAction',
      'snackbarButtonText',
      'snackbarButtonColor',
    ]),
  },
  methods: {
    ...mapMutations('snackbar', [
      'setSnackbar',
    ]),
  },
};
</script>
