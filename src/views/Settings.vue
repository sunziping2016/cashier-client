<template>
  <div>
    <v-app-bar
      v-if="!(uploadedDataUrl || editorLoading)"
      app
      color="primary"
      prominent
      dark
      shrink-on-scroll
      class="settings-app-bar"
    >
      <v-btn
        icon
        @click="$router.go(-1)"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        icon
      >
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
      <template v-slot:img="{ props }">
        <div
          :style="{
            position: 'absolute',
            top: `${56 * heightPercentage(props.height)}px`,
            left: `${8 + 40 * (1 - heightPercentage(props.height))}px`,
          }"
          class="ma-2 d-flex"
        >
          <v-avatar
            :size="40 + 16 * heightPercentage(props.height)"
            :color="avatar ? undefined : 'yellow darken-2'"
            @click="openAvatar"
          >
            <v-icon dark large v-if="!avatar">mdi-account</v-icon>
            <img v-else :src="avatar" alt="avatar" ref="avatar">
          </v-avatar>
          <div class="d-flex flex-column ml-4 justify-center">
            <div
              :style="{ fontSize: `${14 + 4 * heightPercentage(props.height)}px` }"
            >
              {{ (me && me.nickname) || '还没有昵称ㄟ( ▔, ▔ )ㄏ' }}
            </div>
            <div
              :style="{ fontSize: `${12 + 4 * heightPercentage(props.height)}px` }"
            >
              @{{ me && me.username }}
            </div>
          </div>
        </div>
        <v-bottom-sheet v-model="uploadAvatarSheet">
          <template v-slot:activator="{ on, attrs }">

            <v-fab-transition>
              <v-btn
                v-if="heightPercentage(props.height) >= 0.2"
                color="white"
                class="grey--text"
                fab
                absolute
                bottom
                right
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-camera-outline</v-icon>
              </v-btn>
            </v-fab-transition>
          </template>
          <v-list>
            <v-subheader>上传头像</v-subheader>
            <label
              for="upload-avatar-camera"
            >
              <v-list-item ripple>
                <v-list-item-avatar>
                  <v-avatar tile>
                    <v-icon>mdi-camera-outline</v-icon>
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-title>
                  拍照
                </v-list-item-title>
              </v-list-item>
            </label>
            <input type="file" id="upload-avatar-camera" class="d-none"
                   capture="user" accept="image/*" @change="onUploaded">
            <label
              for="upload-avatar-file"
            >
              <v-list-item ripple>
                <v-list-item-avatar>
                  <v-avatar tile>
                    <v-icon>mdi-file-image-outline</v-icon>
                  </v-avatar>
                </v-list-item-avatar>
                <v-list-item-title>
                  从相册中上传
                </v-list-item-title>
              </v-list-item>
            </label>
            <input type="file" id="upload-avatar-file" class="d-none" accept="image/*"
                   @change="onUploaded">
            <v-list-item
              :disabled="!deleteAvatarEnabled"
              @click="deleteAvatar"
            >
              <v-list-item-avatar>
                <v-avatar tile>
                  <v-icon :color="deleteAvatarEnabled ? 'red' : 'grey'">mdi-delete-outline</v-icon>
                </v-avatar>
              </v-list-item-avatar>
              <v-list-item-title :class="deleteAvatarEnabled ? ['red--text'] : ['grey-text']">
                删除头像
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-bottom-sheet>
      </template>
    </v-app-bar>
    <v-main v-if="!(uploadedDataUrl || editorLoading)" class="settings-main">
      <v-list two-line subheader :elevation="1">
        <v-subheader>账户</v-subheader>
        <v-list-item
          :to="{ name: 'SettingsUsername' }"
        >
          <v-list-item-content>
            <v-list-item-title>{{ me && `@${me.username}` || '(无)' }}</v-list-item-title>
            <v-list-item-subtitle>用户名</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{ me && me.email || '(无)' }}</v-list-item-title>
            <v-list-item-subtitle>邮箱（仅自己可见）</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-list-item-title>{{ me && me.nickname || '(无)' }}</v-list-item-title>
            <v-list-item-subtitle>昵称</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list subheader :elevation="1" class="my-2">
        <v-subheader>设置</v-subheader>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-lock-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>权限和推送</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-devices</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>设备和授权</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-list subheader :elevation="1" class="my-2">
        <v-subheader>帮助</v-subheader>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-help-circle-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>常见问题</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          href="mailto:cashier@szp.io"
        >
          <v-list-item-icon>
            <v-icon>mdi-comment-question-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>联系我们</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-main>
    <v-footer
      v-if="!(uploadedDataUrl || editorLoading)"
      class="justify-center text--secondary"
    >山楂记账PWA客户端{{version}}</v-footer>
    <v-overlay :value="deleteAvatarLoading">
      <v-progress-circular
        indeterminate
      />
    </v-overlay>
    <transition name="slide-y">
      <div v-if="uploadedDataUrl || editorLoading" class="settings-image-editor">
        <v-btn
          v-if="uploadedDataUrl"
          icon
          color="white"
          class="back-button"
          @click.stop="$router.go(-1)"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <img
          v-if="uploadedDataUrl"
          :src="uploadedDataUrl"
           alt="uploaded avatar" ref="uploadedAvatar"
           class="d-none"
        >
        <v-progress-circular
          class="loading"
          v-else color="white" indeterminate />
        <v-btn
          v-if="uploadedDataUrl"
          class="check-button"
          color="blue"
          dark
          fixed
          bottom
          right
          fab
          :loading="uploadAvatarLoading"
          @click="uploadAvatar"
        >
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <div class="editor-toolbar" >
          <v-btn icon color="white" large
                 @click="$options.cropper.rotate(-90)"
          >
            <v-icon>mdi-rotate-left</v-icon>
          </v-btn>
          <v-btn icon color="white" large
                 @click="$options.cropper.rotate(90)"
          >
            <v-icon>mdi-rotate-right</v-icon>
          </v-btn>
          <v-btn icon color="white" large
                 @click="$options.cropper.scaleX(-$options.cropper.getData().scaleX)">
            <v-icon>mdi-flip-horizontal</v-icon>
          </v-btn>
          <v-btn icon color="white" large
                 @click="$options.cropper.scaleY(-$options.cropper.getData().scaleY)">
            <v-icon>mdi-flip-vertical</v-icon>
          </v-btn>
        </div>
      </div>
    </transition>
    <div
      ref="avatarViewer" class="pswp settings-image-viewer"
      tabindex="-1" role="dialog" aria-hidden="true"
    >
      <div class="pswp__bg"></div>
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
          <div class="pswp__item"></div>
        </div>
        <v-btn
          icon
          color="white"
          class="back-button"
          @click.stop="$router.go(-1)"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-menu bottom left>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              color="white"
              class="menu-button"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon>mdi-dots-vertical</v-icon>
            </v-btn>
          </template>
          <v-list dark>
            <v-list-item @click="downloadAvatar">
              <v-list-item-icon>
                <v-icon>mdi-download</v-icon>
              </v-list-item-icon>
              <v-list-item-title>保存到图库</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { mapActions, mapGetters, mapState } from 'vuex';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/dist/photoswipe.css';
import axios, { callbacks } from '@/axios';

export default Vue.extend({
  data: () => ({
    uploadAvatarSheet: false,
    uploadedDataUrl: '',
    editorLoading: false,
    uploadAvatarLoading: false,
    deleteAvatarLoading: false,
  }),
  mounted() {
    this.checkRouter();
  },
  computed: {
    ...mapState([
      'token',
    ]),
    ...mapGetters('users', [
      'me',
    ]),
    minAppBarHeight(): number {
      return 56;
    },
    maxAppBarHeight(): number {
      return 128;
    },
    avatar(): boolean {
      return this.me && (this.me.avatar128 || this.me.avatar);
    },
    version(): string {
      return process.env.VUE_APP_VERSION;
    },
    deleteAvatarEnabled(): boolean {
      return this.me && this.me.avatar;
    },
  },
  methods: {
    ...mapActions('snackbar', [
      'openSnackbar',
    ]),
    heightPercentage(height: string): number {
      const realHeight = parseInt(height.slice(0, -2), 10);
      const percentage = (realHeight - this.minAppBarHeight)
        / (this.maxAppBarHeight - this.minAppBarHeight);
      if (percentage < 0) {
        return 0;
      }
      if (percentage > 1) {
        return 1;
      }
      return percentage;
    },
    onUploaded(e: InputEvent): void {
      this.uploadAvatarSheet = false;
      const fileList = (e.target as HTMLInputElement).files;
      if (fileList !== null && fileList[0]) {
        this.editorLoading = true;
        this.$router.push({ hash: '#avatar-editor' });
        const file = fileList[0];
        const reader = new FileReader();
        reader.addEventListener('load', () => {
          this.uploadedDataUrl = reader.result as string;
        }, false);
        reader.readAsDataURL(file);
      }
    },
    checkRouter(): void {
      if (this.$route.hash === '#avatar-editor' && this.uploadedDataUrl === '' && !this.editorLoading) {
        this.$router.replace({ hash: '' });
      } else if (this.$route.hash === '' && (this.uploadedDataUrl !== '' || this.editorLoading)) {
        this.uploadedDataUrl = '';
        this.editorLoading = false;
      }
    },
    uploadAvatar(): void {
      this.uploadAvatarLoading = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.$options as any).cropper.getCroppedCanvas().toBlob((blob: Blob) => {
        const formData = new FormData();
        formData.append('avatar', blob);
        axios
          .post('/api/v1/users/me/avatar', formData, {
            headers: {
              Authorization: `Bearer ${this.token}`,
            },
          })
          .then(...callbacks())
          .catch((error) => {
            this.openSnackbar(error.message);
          })
          .then(() => {
            this.uploadAvatarLoading = false;
            this.$router.back();
          });
      });
    },
    deleteAvatar(): void {
      this.uploadAvatarSheet = false;
      this.deleteAvatarLoading = true;
      axios
        .delete('/api/v1/users/me/avatar', {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        })
        .then(...callbacks())
        .catch((error) => {
          this.openSnackbar(error.message);
        })
        .then(() => {
          this.deleteAvatarLoading = false;
        });
    },
    openAvatar() {
      if (this.me.avatar) {
        const match = this.me.avatar.match(/^[/\w]+\.(\d+)x(\d+)\.\w+$/);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const options = this.$options as any;
        options.gallery = new PhotoSwipe(this.$refs.avatarViewer as HTMLElement, false, [{
          src: this.me.avatar,
          msrc: this.me.avatar128 || undefined,
          w: parseInt(match[1], 10),
          h: parseInt(match[2], 10),
        }], {
          getThumbBoundsFn: () => {
            const rect = (this.$refs.avatar as HTMLElement).getBoundingClientRect();
            const pageYScroll = window.pageYOffset || document.documentElement.scrollTop;
            return {
              x: rect.left,
              y: rect.top + pageYScroll,
              w: rect.width,
            };
          },
        });
        const item = this.$refs.avatarViewer as HTMLElement;
        item.classList.add('image-enter-and-leave-to');
        options.gallery.listen('initialZoomIn', () => {
          item.classList.remove('image-enter-and-leave-to');
        });
        options.gallery.listen('initialZoomOut', () => {
          item.classList.add('image-enter-and-leave-to');
        });
        options.gallery.listen('destroy', () => {
          options.gallery = null;
        });
        options.gallery.init();
      }
    },
    downloadAvatar() {
      const link = document.createElement('a');
      link.style.display = 'none';
      link.download = 'download';
      link.href = this.me.avatar;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  },
  watch: {
    uploadedDataUrl() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const options = this.$options as any;
      if (options.cropper) {
        (options.cropper as Cropper).destroy();
        delete options.cropper;
        options.cropper = null;
      }
      if (this.uploadedDataUrl) {
        this.$nextTick(() => {
          options.cropper = new Cropper(this.$refs.uploadedAvatar as HTMLImageElement, {
            viewMode: 1,
            dragMode: 'move',
            aspectRatio: 1,
            guides: false,
            center: false,
            background: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false,
            ready: () => {
              this.editorLoading = false;
            },
          });
        });
      }
    },
    '$route.hash': 'checkRouter',
  },
});
</script>

<style lang="sass">
@import '~vuetify/src/styles/styles.sass'

.settings-app-bar
  & .v-toolbar__image
    contain: none
  & .v-toolbar__content
    pointer-events: none
  & button
    pointer-events: auto
.settings-main
  .theme--light.v-application &
    background-color: #f5f5f5

.settings-image-editor
  position: fixed
  top: 0
  bottom: 0
  left: 0
  right: 0
  background-color: black
  z-index: 20
  & > img
    display: block
    max-width: 100%
  & > .back-button
    top: 4px
    left: 4px
    width: 48px !important
    height: 48px !important
    position: fixed
    z-index: 1
  & > .editor-toolbar
    z-index: 1
    position: fixed
    left: 0
    right: 0
    bottom: 0
    height: 64px
    display: flex
    align-items: center
    padding-left: 16px
    & > button
      margin: 0 8px
  & > .loading
    left: 50%
    top: 50%
    margin-left: -16px
    margin-top: -16px

.settings-image-viewer
  .pswp__img
    transition: border-radius 333ms map-get($transition, 'swing')
    border-radius: 0
  &.image-enter-and-leave-to .pswp__img
    border-radius: 50%
  .back-button
    top: 4px
    left: 4px
    width: 48px !important
    height: 48px !important
    position: fixed
  .menu-button
    top: 4px
    right: 4px
    width: 48px !important
    height: 48px !important
    position: fixed
</style>
