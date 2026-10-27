import { setToken as _setToken, getToken } from '@/_utils/_local-storage';
import { pinia } from '@/pinia';
import { resetRouter } from '@/router';
import { useSettingsStore } from './settings';
import { useTagsViewStore } from './tags-view';

/** 默认登录 Token（开发环境免登录） */
const DEFAULT_TOKEN = 'mock-token-admin';

const USER_MOCK_MAP: Record<
  string,
  { username: string; roles: string[]; permissions: string[] }
> = {
  admin: {
    username: 'admin',
    roles: ['admin'],
    permissions: ['*:*:*'],
  },
  editor: {
    username: 'editor',
    roles: ['editor'],
    permissions: ['read:*:*'],
  },
};

function resolveUserFromToken(token: string) {
  const match = token.match(/(?:mock-token-|token-)(.+)$/);
  const key = match?.[1] ?? 'admin';
  return USER_MOCK_MAP[key] ?? USER_MOCK_MAP.admin;
}

if (!getToken()) {
  _setToken(DEFAULT_TOKEN);
}

export const useUserStore = defineStore('user', () => {
  const token = ref<string>(getToken() || DEFAULT_TOKEN);
  const roles = ref<string[]>([]);
  const permissions = ref<string[]>([]);
  const username = ref<string>('');
  const isGotUserInfo = ref<boolean>(false);

  const tagsViewStore = useTagsViewStore();
  const settingsStore = useSettingsStore();

  const setToken = (value: string) => {
    _setToken(value);
    token.value = value;
  };

  const getInfo = async () => {
    const user = resolveUserFromToken(token.value);
    username.value = user.username;
    roles.value = user.roles;
    permissions.value = user.permissions;
    isGotUserInfo.value = true;
  };

  const changeUser = (value: string) => {
    const newToken = `token-${value}`;
    token.value = newToken;
    _setToken(newToken);
    location.reload();
  };

  const resetToken = () => {
    setToken(DEFAULT_TOKEN);
    roles.value = [];
    permissions.value = [];
    isGotUserInfo.value = false;
  };

  const resetTagsView = () => {
    if (!settingsStore.cacheTagsView) {
      tagsViewStore.delAllVisitedViews();
      tagsViewStore.delAllCachedViews();
    }
  };

  const logout = () => {
    resetToken();
    resetRouter();
    resetTagsView();
    location.reload();
  };

  return {
    token,
    roles,
    permissions,
    username,
    isGotUserInfo,
    setToken,
    getInfo,
    changeUser,
    logout,
    resetToken,
  };
});

export function useUserStoreOutside() {
  return useUserStore(pinia);
}
