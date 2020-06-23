module.exports = {
  transpileDependencies: [
    'vuetify',
  ],
  pwa: {
    name: '山楂记账',
    themeColor: '#f57f17',
    msTileColor: '#ffffff',
    iconPaths: {
      favicon32: 'assets/icons/favicon-32x32.png',
      favicon16: 'assets/icons/favicon-16x16.png',
      appleTouchIcon: 'assets/icons/apple-touch-icon-152x152.png',
      maskIcon: 'assets/icons/safari-pinned-tab.svg',
      msTileImage: 'assets/icons/msapplication-icon-144x144.png',
    },
    manifestOptions: {
      // eslint-disable-next-line @typescript-eslint/camelcase
      background_color: '#ffffff',
      icons: [{
        src: './assets/icons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      }, {
        src: './assets/icons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      }, {
        src: './assets/icons/android-chrome-maskable-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      }, {
        src: './assets/icons/android-chrome-maskable-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      }],
    },
  },
};
