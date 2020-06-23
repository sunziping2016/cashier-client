<template>
  <v-tabs-items
    :value="tab"
    @input="$emit('input', $event)"
  >
    <v-tab-item
      :value="'book'"
    >
      <v-card flat>
        <v-card-text>账本</v-card-text>
      </v-card>
    </v-tab-item>
    <v-tab-item
      :value="'statistics'"
    >
      <v-card flat>
        <v-card-text>统计</v-card-text>
      </v-card>
    </v-tab-item>
  </v-tabs-items>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    tab: {
      type: String,
      required: true,
    },
  },
});
</script>
