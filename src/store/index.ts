import Vue from 'vue';
import Vuex, { ActionTree, GetterTree, MutationTree } from 'vuex';
import jwtDecode from 'jwt-decode';
import {
  RootState, NetworkStatus, MyPermission,
} from '@/store/types';
import snackbar from '@/store/snackbar';
import users from '@/store/users';
import tokens from '@/store/tokens';
import axios, { callbacks } from '@/axios';
import router from '@/router';

Vue.use(Vuex);

let socket: WebSocket | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let handlers: { [id: number]: (data: any) => void } = {};

const state: RootState = {
  websocketUrl: `${((window.location.protocol === 'https:' && 'wss://') || 'ws://')}${window.location.host}/api/v1/ws`,
  websocketRetryInterval: 10000,
  websocketRetryIntervalId: undefined,
  networkStatus: NetworkStatus.Disconnected,
  offlineMode: false,
  myPermissions: [],
  myAvailableSubjects: {},
  mySubjects: {},
  token: localStorage.getItem('token') || undefined,
  routerTransition: 'slide-y',
};

const getters: GetterTree<RootState, RootState> = {
  myPermissionsSet(s) {
    const result: {[permission: string]: boolean} = {};
    s.myPermissions.forEach((permission) => {
      result[`${permission.subject}:${permission.action}`] = true;
    });
    return result;
  },
  claims(s) {
    if (s.token) {
      return jwtDecode(s.token);
    }
    return {};
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
  updateMyPermissions(s, payload: {
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
  updateMySubjects(s, payload: string[]) {
    payload.forEach((subject) => {
      // eslint-disable-next-line no-param-reassign
      s.mySubjects[subject] = true;
    });
  },
  setToken(s, token?: string) {
    // eslint-disable-next-line no-param-reassign
    s.token = token;
    if (token === undefined) {
      localStorage.removeItem('token');
    } else {
      localStorage.setItem('token', token);
    }
  },
  setRouterTransition(s, transition: string) {
    // eslint-disable-next-line no-param-reassign
    s.routerTransition = transition;
  },
};

const actions: ActionTree<RootState, RootState> = {
  init({ dispatch }) {
    // TODO: check jwt expired
    dispatch('websocketConnect');
  },
  websocketConnect({ commit, dispatch, state: s }) {
    if (socket !== null && socket.readyState !== WebSocket.CLOSED) {
      return;
    }
    socket = new WebSocket(s.websocketUrl);
    handlers = {};
    commit('setNetworkStatus', NetworkStatus.Connecting);
    socket.onopen = () => {
      commit('setNetworkStatus', NetworkStatus.Connected);
      dispatch('initConnection');
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
    if (socket !== null) {
      socket.close();
      socket = null;
      handlers = {};
    }
    if (s.websocketRetryIntervalId !== undefined) {
      clearInterval(s.websocketRetryIntervalId);
      commit('setWebsocketRetryIntervalId', undefined);
    }
    commit('setNetworkStatus', NetworkStatus.Disconnected);
  },
  websocketMessage({ state: s, commit, dispatch }, payload: MessageEvent) {
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
        commit('updateMyPermissions', data);
        dispatch('websocketSubscribe',
          Object.keys(s.mySubjects)
            .filter((key) => s.mySubjects[key]));
        break;
      case 'subject-updated':
        console.log('subject-updated', data.subjects);
        commit('updateMySubjects', data.subjects);
        break;
      case 'push':
        console.log('push', data.messages);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.messages.forEach((message: any) => {
          switch (message.type) {
            case 'user-updated':
              // eslint-disable-next-line no-param-reassign
              delete message.type;
              commit('users/updateUser', message);
              break;
            default:
              console.error(`unknown push message type ${message.type}`);
          }
        });
        break;
      case 'response': {
        const handler = handlers[data.requestId];
        delete handlers[data.requestId];
        if (handler !== undefined) {
          handler(data.message);
        }
        break;
      }
      default:
        console.error(`unknown message type ${data.type}`);
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  websocketRequest(store, payload: { message: any; timeout?: number}) {
    if (socket === null || socket.readyState !== WebSocket.OPEN) {
      return new Promise<undefined>(((resolve, reject) => reject(new Error('Socket closed'))));
    }
    const requestId = Math.round(Math.random() * 65536);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let callback: ((data: any) => void) | undefined;
    const promise = new Promise((resolve, reject) => {
      callback = resolve;
      if (payload.timeout !== undefined) {
        setTimeout(() => {
          delete handlers[requestId];
          reject(new Error('Timeout'));
        }, payload.timeout);
      }
    });
    if (callback) {
      handlers[requestId] = callback;
      socket.send(JSON.stringify({
        requestId,
        message: payload.message,
      }));
    }
    return promise;
  },
  websocketSubscribe({ state: s, dispatch }, payload: string[]) {
    if (socket === null || socket.readyState !== WebSocket.OPEN) {
      return;
    }
    const alwaysSubscribed: Set<string> = new Set<string>([
      'user-updated-self', 'user-deleted-self',
      'token-acquired-self', 'token-revoked-self',
      ...payload,
      ...(router.currentRoute.meta.subscribe || []),
    ]);
    const filtered = [...alwaysSubscribed]
      .filter((subject) => s.myAvailableSubjects[subject]);
    dispatch('websocketRequest', {
      message: {
        type: 'update-subject',
        subjects: filtered,
      },
    }).catch((error) => {
      console.error(error);
    });
  },
  async initConnection({
    state: s,
    getters: g,
    commit,
    dispatch,
  }) {
    if (socket !== null && socket.readyState === WebSocket.OPEN && s.token !== undefined) {
      // TODO: resume token
      await dispatch('websocketRequest', {
        message: {
          type: 'update-token',
          jwt: s.token || null,
        },
      }).then((/* response */) => {
        // TODO: error processing
        // fetch user information
        if (g.myPermissionsSet['user:read-self']) {
          return axios
            .get('/api/v1/users/me', {
              headers: {
                Authorization: `Bearer ${s.token}`,
              },
            })
            .then(...callbacks())
            .then((userResponse) => {
              commit('users/updateUsers', [userResponse.user]);
            })
            .catch((e) => {
              console.error(e);
            });
        }
        return undefined;
      });
      // TODO: fetch user information
    }
  },
  async updateToken({ commit, dispatch }, payload: string | undefined) {
    commit('setToken', payload);
    await dispatch('initConnection');
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async login({ dispatch }, payload: any): Promise<void> {
    const account = payload.username === undefined ? 'email' : 'username';
    await axios
      .post(`/api/v1/tokens/acquire-by-${account}`, payload)
      .then(...callbacks())
      .then((result) => dispatch('updateToken', result.jwt));
  },
  async logout({ state: s, dispatch, commit }): Promise<void> {
    const { token } = s;
    commit('setToken');
    dispatch('initConnection');
    if (token) {
      await axios
        .delete('/api/v1/my-tokens/this', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(...callbacks())
        .then(() => {
          dispatch('updateToken');
        });
    }
  },
};

export default new Vuex.Store<RootState>({
  state,
  getters,
  mutations,
  actions,
  modules: {
    snackbar,
    users,
    tokens,
  },
});
