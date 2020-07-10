export const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const usernameRegex = /^[a-z\d_-]*$/i;
export const passwordRegex = /^[^\s]*$/;

export const uniqueDebounce = 250;

export const usernameRules: Array<(v: string) => boolean | string> = [
  (v: string) => !!v || '用户名是必须的',
  (v: string) => (v.length >= 3 && v.length <= 24) || '用户名应包含3到24位字符',
  (v: string) => usernameRegex.test(v) || '用户名应当只包含英文数字和下线符',
];

export const emailRules: Array<(v: string) => boolean | string> = [
  (v: string) => !!v || '邮箱是必须的',
  (v: string) => emailRegex.test(v) || '不是合法的邮箱地址',
];

export const passwordRules: Array<(v: string) => boolean | string> = [
  (v: string) => !!v || '密码是必须的',
  (v: string) => (v.length >= 6 && v.length <= 24) || '密码应包含6到24位字符',
  (v: string) => passwordRegex.test(v) || '密码不应包含空白字符',
];
