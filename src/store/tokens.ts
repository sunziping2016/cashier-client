import Vue from 'vue';
import { GetterTree, Module, MutationTree } from 'vuex';
import {
  RootState, TokensState, Token,
} from './types';

const state: TokensState = {
  tokens: {},
};

const getters: GetterTree<TokensState, RootState> = {
  mine(s, g, rs, rg) {
    const { jti } = rg.claims;
    return jti && s.tokens[jti];
  },
};

const mutations: MutationTree<TokensState> = {
  updateTokens(s, payload: Token[]) {
    payload.forEach((token) => {
      // eslint-disable-next-line no-param-reassign
      token.issuedAt = new Date(token.issuedAt);
      // eslint-disable-next-line no-param-reassign
      token.expiresAt = new Date(token.expiresAt);
      Vue.set(s.tokens, token.id, token);
    });
  },
  deleteTokens(s, payload: number[]) {
    payload.forEach((id) => {
      Vue.delete(s.tokens, id);
    });
  },
};

const tokens: Module<TokensState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
};

export default tokens;
