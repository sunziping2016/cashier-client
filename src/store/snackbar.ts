import Vue from 'vue';
import { ActionTree, Module, MutationTree } from 'vuex';
import { OpenSnackbarPayload, RootState, SnackbarState } from '@/store/types';

const state: SnackbarState = {
  snackbar: false,
  snackbarText: '',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  snackbarButtonAction: () => {},
  snackbarButtonText: '',
  snackbarButtonColor: '',
};

const mutations: MutationTree<SnackbarState> = {
  setSnackbar(s, snackbar: boolean) {
    // eslint-disable-next-line no-param-reassign
    s.snackbar = snackbar;
  },
  setSnackbarInfo(s, info: {
    text: string;
    buttonAction: () => void;
    buttonText: string;
    buttonColor: string;
  }) {
    // eslint-disable-next-line no-param-reassign
    s.snackbarText = info.text;
    // eslint-disable-next-line no-param-reassign
    s.snackbarButtonAction = info.buttonAction;
    // eslint-disable-next-line no-param-reassign
    s.snackbarButtonText = info.buttonText;
    // eslint-disable-next-line no-param-reassign
    s.snackbarButtonColor = info.buttonColor;
  },
};

const actions: ActionTree<SnackbarState, RootState> = {
  openSnackbar({ state: s, commit }, payload: string | OpenSnackbarPayload) {
    if (typeof payload === 'string') {
      // eslint-disable-next-line no-param-reassign
      payload = { text: payload };
    }
    commit('setSnackbarInfo', {
      text: payload.text,
      buttonAction: payload.buttonAction || (() => {
        commit('setSnackbar', false);
      }),
      buttonText: payload.buttonText || '关闭',
      buttonColor: payload.buttonColor || 'red',
    });
    if (s.snackbar === true) {
      commit('setSnackbar', false);
      Vue.nextTick(() => {
        commit('setSnackbar', true);
      });
    } else {
      commit('setSnackbar', true);
    }
  },
};

const snackbar: Module<SnackbarState, RootState> = {
  namespaced: true,
  state,
  mutations,
  actions,
};

export default snackbar;
