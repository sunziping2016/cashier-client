import Vue from 'vue';
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex';
import { RootState, NetworkStatus, MyPermission } from './types';

Vue.use(Vuex);

let socket: WebSocket | null = null;

const state: RootState = {
  websocketUrl: `${((window.location.protocol === 'https:' && 'wss://') || 'ws://')}${window.location.host}/api/v1/ws`,
  websocketConnectTimeout: 5000,
  websocketRetryInterval: 10000,
  websocketRetryIntervalId: undefined,
  networkStatus: NetworkStatus.Disconnected,
  offlineMode: false,
  myPermissions: [],
  myAvailableSubjects: {},
  mySubjects: {},
};

const getters: GetterTree<RootState, RootState> = {
  myPermissionsSet(s) {
    const result: {[permission: string]: boolean} = {};
    s.myPermissions.forEach((permission) => {
      result[`${permission.subject}:${permission.action}`] = true;
    });
    return result;
  },
};

const mutations: MutationTree<RootState> = {
  setNetworkStatus(s, status: NetworkStatus) {
    // eslint-disable-next-line no-param-reassign
    s.networkStatus = status;
  },
  setWebsocketRetryIntervalId(s, id: number | undefined) {
    // eslint-disable-next-line no-param-reassign
    s.websocketRetryIntervalId = id;
  },
  updateMyPermission(s, payload: {
    permissions: MyPermission[];
    availableSubjects: string[];
  }) {
    // eslint-disable-next-line no-param-reassign
    s.myPermissions = payload.permissions;
    // eslint-disable-next-line no-param-reassign
    s.myAvailableSubjects = {};
    payload.availableSubjects.forEach((subject) => {
      // eslint-disable-next-line no-param-reassign
      s.myAvailableSubjects[subject] = true;
    });
  },
};

const actions: ActionTree<RootState, RootState> = {
  init({ dispatch }) {
    dispatch('websocketConnect');
  },
  websocketConnect({ commit, dispatch, state: s }) {
    if (socket !== null && socket.readyState !== WebSocket.CLOSED) {
      return;
    }
    socket = new WebSocket(s.websocketUrl);
    commit('setNetworkStatus', NetworkStatus.Connecting);
    socket.onopen = () => {
      commit('setNetworkStatus', NetworkStatus.Connected);
    };
    const handleClose = () => {
      commit('setNetworkStatus', NetworkStatus.Disconnected);
      if (s.websocketRetryIntervalId !== undefined) {
        clearInterval(s.websocketRetryIntervalId);
      }
      commit('setWebsocketRetryIntervalId', setTimeout(() => {
        commit('setWebsocketRetryIntervalId', undefined);
        dispatch('websocketConnect');
      }, s.websocketRetryInterval));
    };
    socket.onerror = handleClose;
    socket.onclose = handleClose;
    socket.onmessage = (evt) => {
      dispatch('websocketMessage', evt);
    };
  },
  websocketDisconnect({ state: s, commit }) {
    if (socket != null) {
      socket.close();
    }
    if (s.websocketRetryIntervalId !== undefined) {
      clearInterval(s.websocketRetryIntervalId);
      commit('setWebsocketRetryIntervalId', undefined);
    }
    commit('setNetworkStatus', NetworkStatus.Disconnected);
  },
  websocketMessage({ commit }, payload: MessageEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any;
    try {
      data = JSON.parse(payload.data);
    } catch (e) {
      console.error('failed to decode server message');
      console.error(e);
      return;
    }
    switch (data.type) {
      case 'permission-updated':
        commit('updateMyPermission', data);
        break;
      default:
        console.error(`unknown message type ${data.type}`);
    }
  },
};

export default new Vuex.Store<RootState>({
  state,
  getters,
  mutations,
  actions,
  modules: {
  },
});
