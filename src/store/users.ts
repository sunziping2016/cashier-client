import Vue from 'vue';
import { GetterTree, Module, MutationTree } from 'vuex';
import {
  RootState, UsersState, User, mergeUserAccessLevel,
} from './types';

const state: UsersState = {
  users: {},
};

const getters: GetterTree<UsersState, RootState> = {
  me(s, g, rs, rg) {
    const { uid } = rg.claims;
    return uid && s.users[uid];
  },
};

const mutations: MutationTree<UsersState> = {
  commitUsers(s, payload: User[]) {
    payload.forEach((user) => {
      const oldUser = s.users[user.id];
      if (oldUser === undefined) {
        Vue.set(s.users, user.id, user);
      } else {
        const newAccessLevel = mergeUserAccessLevel(oldUser.access, user.access);
        // eslint-disable-next-line no-param-reassign
        Vue.set(s.users, user.id, Object.assign(oldUser, user, {
          access: newAccessLevel,
        }));
      }
    });
  },
};

const users: Module<UsersState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
};

export default users;
