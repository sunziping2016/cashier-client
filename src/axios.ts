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

export function handler(): [
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response: AxiosResponse) => any,
  (error: AxiosError) => void,
  ] {
  return [
    (response) => response.data,
    (error) => {
      if (error.response) {
        const { data } = error.response;
        throw new ApiError((data.data && data.data.type) || 'UnknownError',
          data.message || '未知的错误', data.data);
      } else if (error.request) {
        throw new ApiError('NoResponse', '服务器没有响应');
      } else {
        throw new ApiError('ConfigError', error.message);
      }
    },
  ];
}
