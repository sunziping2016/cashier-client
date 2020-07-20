<template>
  <div class="settings-sessions-main">
    <v-app-bar
      v-if="!isSelectedTokenIdsEmpty"
      app
      color="white"
    >
      <v-btn
        icon
        @click="$router.back()"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <div class="text-h6 grey--text text--darken-1">
        {{ Object.keys(selectedTokenIds).length }}
      </div>
      <v-spacer />
      <v-btn
        icon
      >
        <v-icon>mdi-delete-outline</v-icon>
      </v-btn>
    </v-app-bar>
    <v-app-bar
      v-else-if="query !== undefined"
      app
      color="primary"
      dark
    >
      <v-btn
        icon
        @click="$router.back()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-text-field
        class="settings-sessions-search"
        solo
        dense
        hide-details
        label="搜索IP或User Agent"
        clearable
        autofocus
        :value="query"
        @input="$router.replace({ query: { ...$route.query, query: $event || '' } })"
      />
      <v-btn
        icon
      >
        <v-icon>mdi-sort-variant</v-icon>
      </v-btn>
    </v-app-bar>
    <v-app-bar
      v-else
      app
      color="primary"
      dark
    >
      <v-btn
        icon
        @click="$router.back()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <NavTitle>会话</NavTitle>
      <v-spacer />
      <v-btn
        icon
        @click="$router.push({ query: { ...$route.query, query: '' } })"
      >
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-list
        v-if="myToken && query === undefined"
        subheader three-line :elevation="1" class="pb-0 mb-2"
      >
        <v-subheader>当前会话</v-subheader>
        <SessionListItem :token="myToken" :user-agent="myTokenUserAgent" />
        <v-divider />
        <v-btn tile text block class="red--text justify-start" large>结束其他会话</v-btn>
      </v-list>
      <v-list
        v-for="(group, group_idx) in groupedTokens"
        :key="group.id"
        subheader two-line :elevation="1" class="mb-2"
      >
        <v-subheader
          v-ripple
          :data-session-group="group_idx"
          @click.native="!isSelectedTokenIdsEmpty ?
                toggleSelectedGroup(group_idx) : undefined"
          :style="{ userSelect: 'none' }"
        >
          <v-icon
            v-if="group.selected !== undefined"
            :color="group.selected ? 'primary' : 'grey'"
            class="mr-4"
            :style="{ fontSize: '18px' }"
          >mdi-check-circle</v-icon>
          {{ group.group }}
        </v-subheader>
        <RecycleScroller
          :items="group.tokens"
          :item-size="80"
        >
          <template v-slot="{ item }">
            <SessionListItem
              :style="{ height: '80px', userSelect: 'none' }"
              v-ripple
              :token="item.token"
              :user-agent="item.userAgent"
              v-observe-visibility="item.totalLast ?
                onFetchMoreTokensUpdate : undefined"
              :checked="item.selected"
              :data-session-id="item.token.id"
              @click.native="!isSelectedTokenIdsEmpty ?
                toggleSelectedTokenId(item.id) : goToDetailPage(item.id)"
            />
            <v-divider v-if="!item.groupLast" />
          </template>
        </RecycleScroller>
      </v-list>
      <div
        v-if="fetchMoreTokensLoading"
        class="pa-2 text-center"
      >
        <v-progress-circular
          indeterminate
          color="primary"
          :size="24"
          :width="3"
        />
      </div>
    </v-main>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import {
  mapActions, mapGetters,
  mapMutations, mapState,
} from 'vuex';
import { UAParser } from 'ua-parser-js';
import { debounce } from 'lodash-es';
import NavTitle from '@/components/NavTitle.vue';
import SessionListItem from '@/components/SessionListItem.vue';
import axios, { callbacks } from '@/axios';
import {
  Token,
} from '@/store/types';

type IResult = ReturnType<UAParser['getResult']>

// TODO: push, actions, sort

export default Vue.extend({
  components: {
    NavTitle,
    SessionListItem,
  },
  data: () => {
    let touchEnabled;
    try {
      document.createEvent('TouchEvent');
      touchEnabled = true;
    } catch (e) {
      touchEnabled = false;
    }
    return {
      tokenIds: [] as number[],
      fetchMoreTokensCursor: '' as string,
      fetchMoreTokensSize: 10,
      fetchMoreTokensLoading: false,
      fetchMoreTokensFinished: false,
      touchEnabled,
      touchStartX: 0,
      touchStartY: 0,
      touchMinDistance: 16,
      touchTimeout: 500,
      touchTimeoutId: undefined as number | undefined,
    };
  },
  mounted() {
    this.updateMyToken();
    this.debouncedFetchMoreTokens();
    if (this.touchEnabled) {
      window.addEventListener('touchstart', this.onTouchStart);
      window.addEventListener('touchmove', this.onTouchMove);
      window.addEventListener('touchend', this.onTouchEnd);
    }
  },
  beforeDestroy() {
    if (this.touchEnabled) {
      window.removeEventListener('touchstart', this.onTouchStart);
      window.removeEventListener('touchmove', this.onTouchMove);
      window.removeEventListener('touchend', this.onTouchEnd);
    }
  },
  computed: {
    ...mapGetters('tokens', {
      myToken: 'mine',
    }),
    ...mapGetters(['claims']),
    ...mapState(['token']),
    ...mapState('tokens', {
      tokensMap: 'tokens',
    }),
    selectedTokenIds: {
      get(): { [id: number]: boolean } {
        const { select } = this.$route.query;
        if (typeof select === 'string') {
          const results: { [id: number]: boolean } = {};
          select.split(',').map((x) => parseInt(x, 10)).forEach((x) => {
            results[x] = true;
          });
          return results;
        }
        return {};
      },
      set(values: { [id: number]: boolean }) {
        const select = Object.keys(values).join(',') || undefined;
        if (this.$route.query.select === select) {
          return;
        }
        if (select === undefined) {
          this.$router.back();
        } else if (this.$route.query.select === undefined) {
          this.$router.push({ query: { ...this.$route.query, select } });
        } else {
          this.$router.replace({ query: { ...this.$route.query, select } });
        }
      },
    },
    query(): string | undefined {
      return typeof this.$route.query.query === 'string' ? this.$route.query.query : undefined;
    },
    isSelectedTokenIdsEmpty(): boolean {
      return this.$route.query.select === undefined;
    },
    tokens(): Array<{
      id: number;
      token: Token;
      userAgent: IResult | undefined;
      selected?: boolean;
    }> {
      const tokens = this.tokenIds
        .map((x) => this.tokensMap[x])
        .filter((x) => x)
        .map((x) => ({
          id: x.id,
          token: x,
          selected: undefined as boolean | undefined,
          userAgent: this.getUserAgent(x),
        }));
      if (!this.isSelectedTokenIdsEmpty) {
        tokens.forEach((token) => {
          // eslint-disable-next-line no-param-reassign
          token.selected = this.selectedTokenIds[token.id] || false;
        });
      }
      return tokens;
    },
    groupedTokens(): Array<{
      id: string;
      group: string;
      selected?: boolean;
      tokens: Array<{
        id: number;
        token: Token;
        userAgent: IResult | undefined;
        selected?: boolean;
        groupLast?: boolean;
        totalLast?: boolean;
      }>;
    }> {
      const groups: Array<{
        id: string;
        group: string;
        selected?: boolean;
        tokens: Array<{
          id: number;
          token: Token;
          userAgent: IResult | undefined;
          selected?: boolean;
          groupLast?: boolean;
          totalLast?: boolean;
        }>;
      }> = [{
        id: 'active',
        group: '活跃会话',
        tokens: [],
      }, {
        id: 'expired',
        group: '过期会话',
        tokens: [],
      }];
      this.tokens.forEach((token) => {
        if (token.token.expiresAt <= new Date()) {
          groups[1].tokens.push(token);
        } else {
          groups[0].tokens.push(token);
        }
      });
      const filteredGroups = groups.filter((x) => x.tokens.length);
      filteredGroups.forEach((x) => {
        // eslint-disable-next-line no-param-reassign
        x.tokens[x.tokens.length - 1].groupLast = true;
      });
      if (filteredGroups.length) {
        const lastGroup = filteredGroups[filteredGroups.length - 1];
        lastGroup.tokens[lastGroup.tokens.length - 1].totalLast = true;
      }
      if (!this.isSelectedTokenIdsEmpty) {
        filteredGroups.forEach((group) => {
          // eslint-disable-next-line no-param-reassign
          group.selected = group.tokens.every((token) => token.selected);
        });
      }
      return filteredGroups;
    },
    myTokenUserAgent(): IResult | undefined {
      return this.getUserAgent(this.myToken);
    },
  },
  watch: {
    myToken(value) {
      if (value) {
        this.tokenIds = this.tokenIds.filter((x) => x !== value);
      }
    },
    query() {
      this.tokenIds = [];
      this.fetchMoreTokensFinished = false;
      this.fetchMoreTokensCursor = '';
      this.debouncedFetchMoreTokens();
    },
  },
  methods: {
    ...mapActions('snackbar', [
      'openSnackbar',
    ]),
    ...mapMutations('tokens', ['updateTokens']),
    onTouchStart(event: TouchEvent) {
      if (this.touchTimeoutId !== undefined) {
        clearTimeout(this.touchTimeoutId);
        this.touchTimeoutId = undefined;
      }
      const touch = event.changedTouches[0];
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      let element = event.target as HTMLElement | null;
      let touchedSessionId = undefined as undefined | number;
      let touchedGroupIndex = undefined as undefined | number;
      while (element) {
        if (element.dataset.sessionId) {
          touchedSessionId = parseInt(element.dataset.sessionId, 10);
          break;
        } else if (element.dataset.sessionGroup) {
          touchedGroupIndex = parseInt(element.dataset.sessionGroup, 10);
        }
        element = element.parentElement;
      }
      if (touchedSessionId !== undefined) {
        this.touchTimeoutId = setTimeout(() => {
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this.toggleSelectedTokenId(touchedSessionId!);
        }, this.touchTimeout);
      }
      if (touchedGroupIndex !== undefined) {
        this.touchTimeoutId = setTimeout(() => {
          // eslint-disable-next-line  @typescript-eslint/no-non-null-assertion
          this.toggleSelectedGroup(touchedGroupIndex!);
        }, this.touchTimeout);
      }
    },
    onTouchEnd() {
      if (this.touchTimeoutId !== undefined) {
        clearTimeout(this.touchTimeoutId);
        this.touchTimeoutId = undefined;
      }
    },
    onTouchMove(event: TouchEvent) {
      if (this.touchTimeoutId === undefined) {
        return;
      }
      const touch = event.changedTouches[0];
      const touchMoveX = touch.clientX;
      const touchMoveY = touch.clientY;
      if (Math.abs(this.touchStartX - touchMoveX) > this.touchMinDistance
        || Math.abs(this.touchStartY - touchMoveY) > this.touchMinDistance) {
        clearTimeout(this.touchTimeoutId);
        this.touchTimeoutId = undefined;
      }
    },
    goToDetailPage(id: number) {
      console.log(`go to detail ${id}`);
    },
    getUserAgent(token: Token): IResult | undefined {
      return (token && token.acquireUserAgent
        && new UAParser(token.acquireUserAgent).getResult()) || undefined;
    },
    updateMyToken() {
      if (this.myToken || !this.claims.jti) {
        return;
      }
      axios
        .get('/api/v1/my-tokens/this', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(...callbacks())
        .then((result) => {
          this.updateTokens([result.token]);
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        });
    },
    onFetchMoreTokensUpdate(isVisible: boolean) {
      if (isVisible) {
        this.debouncedFetchMoreTokens();
      }
    },
    isTokenChecked(id: number): boolean | undefined {
      if (this.isSelectedTokenIdsEmpty) {
        return undefined;
      }
      return this.selectedTokenIds[id] || false;
    },
    toggleSelectedTokenId(id: number, value?: boolean) {
      if (value === undefined) {
        // eslint-disable-next-line no-param-reassign
        value = !this.selectedTokenIds[id];
      }
      if (this.isSelectedTokenIdsEmpty && value && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
      if (value) {
        this.selectedTokenIds = {
          ...this.selectedTokenIds,
          [id]: true,
        };
      } else {
        const selectedTokenIds = { ...this.selectedTokenIds };
        delete selectedTokenIds[id];
        this.selectedTokenIds = selectedTokenIds;
      }
    },
    toggleSelectedGroup(index: number, value?: boolean) {
      const group = this.groupedTokens[index];
      if (value === undefined) {
        // eslint-disable-next-line no-param-reassign
        value = !group.selected;
      }
      if (this.isSelectedTokenIdsEmpty && value && 'vibrate' in navigator) {
        navigator.vibrate(20);
      }
      const selectedTokenIds = { ...this.selectedTokenIds };
      if (value) {
        group.tokens.forEach((token) => {
          selectedTokenIds[token.id] = true;
        });
      } else {
        group.tokens.forEach((token) => {
          delete selectedTokenIds[token.id];
        });
      }
      this.selectedTokenIds = selectedTokenIds;
    },
    // eslint-disable-next-line func-names, @typescript-eslint/no-explicit-any
    debouncedFetchMoreTokens: debounce(function (this: any) {
      this.fetchMoreTokens();
    }, 250),
    fetchMoreTokens() {
      if (this.fetchMoreTokensFinished || this.fetchMoreTokensLoading) {
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        size: this.fetchMoreTokensSize,
        sort: 'expiresAt',
        desc: true,
      };
      const { query } = this;
      if (this.myToken) {
        if (this.query) {
          params.query = `NOT id:${this.claims.jti} AND (${this.query})`;
        } else {
          params.query = `NOT id:${this.claims.jti}`;
        }
      }
      if (this.fetchMoreTokensCursor) {
        params.after = this.fetchMoreTokensCursor;
      }
      this.fetchMoreTokensLoading = true;
      axios
        .get('/api/v1/my-tokens', {
          params,
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(...callbacks())
        .then(({ results }) => {
          if (this.query !== query) {
            this.debouncedFetchMoreTokens();
            return;
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.updateTokens(results.map((x: any) => x.token));
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          this.tokenIds = this.tokenIds.concat(results.map((x: any) => x.token.id));
          if (results.length < this.fetchMoreTokensSize) {
            this.fetchMoreTokensCursor = '';
            this.fetchMoreTokensFinished = true;
          } else {
            this.fetchMoreTokensCursor = results[results.length - 1].cursor;
          }
        })
        .catch((error) => {
          this.openSnackbar(error.message);
        })
        .then(() => {
          this.fetchMoreTokensLoading = false;
        });
    },
  },
});
</script>

<style lang="sass">
.settings-sessions-main
  .theme--light.v-application &
    background-color: #f5f5f5 !important

.settings-sessions-search
  &.theme--dark > .v-input__control > .v-input__slot
    background-color: rgba(255, 255, 255, 0.1) !important
    box-shadow: none !important
</style>
