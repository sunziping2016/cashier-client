<template>
  <v-list-item>
    <v-list-item-avatar
      v-if="checked !== undefined" size="18"
      class="align-self-center"
    >
      <v-icon
        :color="checked ? 'primary' : 'grey'"
        :style="{ fontSize: '18px' }"
      >mdi-check-circle</v-icon>
    </v-list-item-avatar>
    <v-list-item-content>
      <v-list-item-title class="font-weight-bold">
        <div v-if="userAgent">
          <span v-if="userAgent.device.model">
            {{ userAgent.device.model }} {{ userAgent.device.vendor }}
          </span>
          <span v-else>未知设备</span>
          <v-icon small class="ma-1">{{ {
            console: 'mdi-console',
            mobile: 'mdi-cellphone',
            smarttv: 'mdi-television',
            wearable: 'mdi-watch',
            }[userAgent.device.type] || 'mdi-help-circle' }}
          </v-icon>
        </div>
      </v-list-item-title>
      <v-list-item-subtitle>
        <div v-if="userAgent">
          <span v-if="userAgent.os.name && userAgent.browser.name">
            {{ userAgent.os.name }} {{ userAgent.os.version }},
            {{ userAgent.browser.name }} {{ userAgent.browser.version }}
          </span>
          <span v-else>{{ userAgent.ua }}</span>
        </div>
      </v-list-item-subtitle>
      <v-list-item-subtitle>
        <div class="text--disabled">{{ token.acquireRemote }} - {{ {
          username: '用户名登录',
          email: '邮箱登录',
          resume: '续期'
          }[token.acquireMethod] }}
          <span
            v-if="token.acquireRemoteCountryName || token.acquireRemoteRegionName"
          > - {{ token.acquireRemoteRegionName }}, {{ token.acquireRemoteCountryName }} </span>
        </div>
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-action>
      <v-list-item-action-text>{{ relativeTime(token.issuedAt) }}</v-list-item-action-text>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import Vue from 'vue';
import hdate from 'human-date';

export default Vue.extend({
  props: {
    token: {
      type: Object,
      required: true,
    },
    userAgent: {
      type: Object,
      required: true,
    },
    checked: {
      type: Boolean,
      default: undefined,
    },
  },
  methods: {
    relativeTime(date: Date): string {
      const result = hdate.relativeTime(date, { returnObject: true });
      let str = '';
      if (result.years) {
        str += `${result.years}年`;
      } else if (result.days) {
        str += `${result.days}天`;
      } else if (result.hours) {
        str += `${result.hours}小时`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } else if ((result as any).minutes) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        str += `${(result as any).minutes}分钟`;
      } else if (result.seconds) {
        str += `${result.seconds}秒`;
      }
      if (result.past) {
        str += '前';
      } else {
        str += '后';
      }
      return str;
    },
  },
});
</script>
