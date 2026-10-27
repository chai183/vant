import type { MockMethod } from 'vite-plugin-mock';

const mocks: MockMethod[] = [
  {
    url: '/api/user/info',
    method: 'get',
    response: () => ({
      errorCode: null,
      success: true,
      data: {
        username: 'admin',
        roles: ['admin'],
        permissions: ['*:*:*'],
      },
    }),
  },
];

export default mocks;
