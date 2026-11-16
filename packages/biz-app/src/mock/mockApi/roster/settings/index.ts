import type { MockMethod } from 'vite-plugin-mock';
import type { RosterSettingsSaveBody } from '@/types/roster/settings';
import { saveRosterSettingsMock } from './entity';

export default [
  {
    // PC 已核实的保存地址；这里仅实现开发环境 Mock 的内存保存。
    url: '/api/dthr-base/v4/system-config/team-save',
    method: 'post',
    response: ({ body }: { body: RosterSettingsSaveBody }) =>
      saveRosterSettingsMock(body),
  },
] as MockMethod[];
