import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import colors from 'vuetify/lib/util/colors';

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      themeCache: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        get: (key) => localStorage.getItem(key as any),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (key, value) => localStorage.setItem(key as any, value),
      },
    },
    themes: {
      light: {
        primary: colors.yellow.darken4,
      },
      dark: {
        primary: colors.brown.darken2,
      },
    },
  },
});
