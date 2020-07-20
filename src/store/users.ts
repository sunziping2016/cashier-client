import Vue from 'vue';
import { GetterTree, Module, MutationTree } from 'vuex';
import {
  mergeUserAccessLevel, RootState, User, UserAccessLevel, UsersState,
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
  updateUsers(s, payload: User[]) {
    payload.forEach((user) => {
      // eslint-disable-next-line no-param-reassign
      user.createdAt = new Date(user.createdAt);
      if (user.access === UserAccessLevel.All) {
        // eslint-disable-next-line no-param-reassign
        user.updatedAt = new Date(user.updatedAt);
      }
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUser(s, payload: any) {
    if (s.users[payload.id]) {
      if (payload.createdAt) {
        // eslint-disable-next-line no-param-reassign
        payload.createdAt = new Date(payload.createdAt);
      }
      if (payload.updatedAt) {
        // eslint-disable-next-line no-param-reassign
        payload.updatedAt = new Date(payload.updatedAt);
      }
      Object.assign(s.users[payload.id], payload);
    }
  },
};

const users: Module<UsersState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
};

export default users;
