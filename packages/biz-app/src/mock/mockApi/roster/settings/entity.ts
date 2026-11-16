import type {
  RosterSettingField,
  RosterSettingsSaveBody,
} from '@/types/roster/settings';
import { rosterSettingsMockState as state } from './data';
import type { MockSettingSet } from './data';

/** Mock 的保存按提交树持久化；元数据从原节点带回，不按查询条件生成业务数据。 */
export function saveRosterSettingsMock(body: RosterSettingsSaveBody) {
  state.selected = body.setList.map((set) => {
    const source = state.options.find((item) => item.setCode === set.setCode);
    const previous = state.selected.find(
      (item) => item.setCode === set.setCode,
    );
    const restoreFields = (
      fields: RosterSettingField[],
      available: MockSettingSet['fieldList'],
      selected: MockSettingSet['fieldList'],
    ) =>
      fields.map((field) => {
        const metadata = available?.find(
          (item) => item.fieldCode === field.fieldCode,
        );
        const original = selected?.find(
          (item) => item.fieldCode === field.fieldCode,
        );
        return { ...metadata, ...original, ...field };
      });
    return {
      ...set,
      ...(set.fieldList
        ? {
            fieldList: restoreFields(
              set.fieldList,
              source?.fieldList,
              previous?.fieldList,
            ),
          }
        : {}),
      ...(set.groupList
        ? {
            groupList: set.groupList.map((group) => ({
              ...group,
              ...(group.fieldList
                ? {
                    fieldList: restoreFields(
                      group.fieldList,
                      source?.groupList?.find(
                        (item) => item.groupCode === group.groupCode,
                      )?.fieldList,
                      previous?.groupList?.find(
                        (item) => item.groupCode === group.groupCode,
                      )?.fieldList,
                    ),
                  }
                : {}),
            })),
          }
        : {}),
    };
  });
  state.basic.isAllowDepartmentManagerView = body.isAllowDepartmentManagerView;
  return { body: null, errorCode: '000000', errorMsg: '操作成功' };
}
