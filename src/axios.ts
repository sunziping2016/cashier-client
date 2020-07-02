import axiosImpl, { AxiosError, AxiosResponse } from 'axios';

const axios = axiosImpl.create({
  baseURL: `${window.location.protocol}//${window.location.host}/`,
});

export default axios;

export class ApiError implements Error {
  name: string;

  message: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(name: string, message: string, data?: any) {
    this.name = name;
    this.message = message;
    this.data = data;
  }
}

export function callbacks(): [
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: AxiosResponse) => any,
  (error: AxiosError) => void,
  ] {
  return [
    (response) => response.data && response.data.data,
    (error) => {
      if (error.response) {
        const { data } = error.response;
        const type = data.data && data.data.type;
        let { message } = data;
        switch (type) {
          case 'WrongUserOrPassword':
            message = '错误的用户名或密码';
            break;
          case 'UserBlocked':
            message = '您的账号已被禁用';
            break;
          case 'DuplicatedUser':
            switch (data.data && data.data.field) {
              case 'username':
                message = '用户名已被使用';
                break;
              case 'email':
                message = '邮箱已被使用';
                break;
              default:
                message = '用户重复';
                break;
            }
            break;
          case 'UserRegistration':
            switch (data.data && data.data.reason) {
              case 'NotFound':
                message = '找不到注册的信息';
                break;
              case 'Expired':
                message = '注册超时';
                break;
              case 'WrongCode':
                message = '验证码错误';
                break;
              default:
                message = '用户注册失败';
                break;
            }
            break;
          default:
            break;
        }
        throw new ApiError(type || 'UnknownError',
          message || '未知的错误', data.data);
      } else if (error.request) {
        throw new ApiError('NoResponse', '服务器没有响应');
      } else {
        throw new ApiError('ConfigError', error.message);
      }
    },
  ];
}
