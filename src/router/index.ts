import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/login/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
  },
  {
    path: '/settings/username',
    name: 'SettingsUsername',
    component: () => import('@/views/SettingsUsername.vue'),
  },
  {
    path: '/settings/nickname',
    name: 'SettingsNickname',
    component: () => import('@/views/SettingsNickname.vue'),
  },
  {
    path: '/settings/email',
    name: 'SettingsEmail',
    component: () => import('@/views/SettingsEmail.vue'),
  },
  {
    path: '/settings/password',
    name: 'SettingsPassword',
    component: () => import('@/views/SettingsPassword.vue'),
  },
  {
    path: '/404',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
  {
    path: '*',
    redirect: 'NotFound',
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

export default router;
