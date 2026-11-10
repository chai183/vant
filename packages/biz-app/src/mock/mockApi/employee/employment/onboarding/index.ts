import type { MockMethod } from 'vite-plugin-mock';
import { REGISTER_STATUS } from '@/services/api/employee/employment/onboarding/config';
import {
  waitEntryCreateFormFieldSets,
  waitEntryDetailExtraFieldSets,
} from './form-fields-data';
import { schemaFieldTypesFieldSets } from './schema-field-types-data';
import { onboardingRegisterFormMockList } from './register-form/list-data';

const MOCK_PREFIX = '/api/dthr-employee/v4';

function unifiedSuccess<T>(body: T) {
  return {
    body,
    data: body,
    errorCode: '000000',
    errorMsg: '操作成功',
    success: true,
  };
}

/** Mock：批量确认入职时部分失败，便于联调反馈页（按 entryProcessFormId） */
const CONFIRM_FAIL_REASON_MAP: Record<string, string> = {
  'entry-1': '该证件号存在花名册中，无法进行此操作。',
  'entry-3': '姓名、手机号、证件号等3个必填字段未填写，无法进行此操作。',
  'entry-4': '该员工已存在黑名单中，无法进行此操作；入黑名单原因：内容。',
};

function confirmEntryResponse({ body }: { body: Record<string, unknown> }) {
  const ids = Array.isArray(body.entryProcessFormIds)
    ? body.entryProcessFormIds.map(String)
    : [];
  const failList: Array<{ staffName: string; errorMessage: string }> = [];
  let successCount = 0;

  ids.forEach((entryId) => {
    const row = onboardingRegisterFormMockList.find(
      (item) =>
        String(item.entryProcessFormId || item.processFormId) === entryId,
    );
    const failReason = CONFIRM_FAIL_REASON_MAP[entryId];
    if (failReason) {
      failList.push({
        staffName: String(row?.name || '-'),
        errorMessage: failReason,
      });
      return;
    }
    if (row) {
      row.registerStatus = REGISTER_STATUS.ABANDON;
    }
    successCount += 1;
  });

  return unifiedSuccess({
    successCount,
    failCount: failList.length,
    failList,
    isGoConfirmPage: false,
  });
}

/** 入职登记表模板 mock（对齐 PC EntryRegisterTemplateDTO，供二维码页选用） */
const entryTemplateMockList = [
  {
    id: '11502422011138621448',
    name: '入职登记表模板1',
    status: true,
    statusName: '已启用',
    creatorName: '系统',
    createTime: '2024-01-01 00:00:00',
  },
  {
    id: '11502422011138621449',
    name: '入职登记表模板2',
    status: true,
    statusName: '已启用',
    creatorName: '系统',
    createTime: '2024-02-01 00:00:00',
  },
  {
    id: '11502422011138621450',
    name: '入职登记表模板3',
    status: true,
    statusName: '已启用',
    creatorName: '系统',
    createTime: '2024-03-01 00:00:00',
  },
  {
    id: '11502422011138621451',
    name: '校招入职登记表（已停用）',
    status: false,
    statusName: '已停用',
    creatorName: '系统',
    createTime: '2024-04-01 00:00:00',
  },
];

const mocks: MockMethod[] = [
  {
    url: `${MOCK_PREFIX}/entry-process-form/confirm`,
    method: 'post',
    response: confirmEntryResponse,
  },
  {
    url: `${MOCK_PREFIX}/entry/staff/add-entry/field/search`,
    method: 'post',
    // Mock：entry-wait 基础字段；entry-detail 额外追加公司内兼任等
    // type=schema-field-types → 字段类型配置全场景
    response: ({ body }: { body?: { type?: string } }) => {
      if (body?.type === 'schema-field-types') {
        return unifiedSuccess(schemaFieldTypesFieldSets);
      }
      if (body?.type === 'entry-detail') {
        return unifiedSuccess([
          ...waitEntryCreateFormFieldSets,
          ...waitEntryDetailExtraFieldSets,
        ]);
      }
      return unifiedSuccess(waitEntryCreateFormFieldSets);
    },
  },
  {
    url: `${MOCK_PREFIX}/entry/entry-template/page`,
    method: 'post',
    response: ({
      body,
    }: {
      body?: {
        pageNum?: number;
        pageSize?: number;
        name?: string;
        status?: boolean;
      };
    }) => {
      const pageNum = Math.max(1, Number(body?.pageNum) || 1);
      const pageSize = Math.max(1, Number(body?.pageSize) || 20);
      const keyword = String(body?.name || '')
        .trim()
        .toLowerCase();
      let list = [...entryTemplateMockList];
      if (typeof body?.status === 'boolean') {
        list = list.filter((item) => item.status === body.status);
      }
      if (keyword) {
        list = list.filter((item) => item.name.toLowerCase().includes(keyword));
      }
      const start = (pageNum - 1) * pageSize;
      return unifiedSuccess({
        records: list.slice(start, start + pageSize),
        total: list.length,
      });
    },
  },
  {
    url: `${MOCK_PREFIX}/schema-data-source/position/options`,
    method: 'post',
    response: ({
      body,
    }: {
      body?: { pageNum?: number; pageSize?: number; keyword?: string };
    }) => {
      const pageNum = Math.max(1, Number(body?.pageNum) || 1);
      const pageSize = Math.max(1, Number(body?.pageSize) || 20);
      const keyword = String(body?.keyword || '')
        .trim()
        .toLowerCase();
      // 前若干项与入职登记表 mock 列表对齐，便于筛选联调
      const seeded = [
        {
          id: 'pos-1',
          positionName: '产品经理',
          positionPathName: '组织/产品经理',
        },
        {
          id: 'pos-2',
          positionName: '设计师',
          positionPathName: '组织/设计师',
        },
        {
          id: 'pos-3',
          positionName: '前端工程师',
          positionPathName: '组织/前端工程师',
        },
        {
          id: 'pos-4',
          positionName: '招聘专员',
          positionPathName: '组织/招聘专员',
        },
        {
          id: 'pos-5',
          positionName: '后端工程师',
          positionPathName: '组织/后端工程师',
        },
        {
          id: 'pos-6',
          positionName: '风控专员',
          positionPathName: '组织/风控专员',
        },
        { id: 'pos-7', positionName: 'HRBP', positionPathName: '组织/HRBP' },
        {
          id: 'pos-8',
          positionName: '运营专员',
          positionPathName: '组织/运营专员',
        },
      ];
      const all = [
        ...seeded,
        ...Array.from({ length: 47 }, (_, i) => {
          const n = i + 9;
          return {
            id: `p${n}`,
            positionName: `职位 ${n}`,
            positionPathName: `组织/职位${n}`,
          };
        }),
      ];
      const filtered = keyword
        ? all.filter((item) =>
            item.positionName.toLowerCase().includes(keyword),
          )
        : all;
      const start = (pageNum - 1) * pageSize;
      return unifiedSuccess({
        records: filtered.slice(start, start + pageSize),
        total: filtered.length,
      });
    },
  },
  {
    url: `${MOCK_PREFIX}/schema-data-source/skill-tags/options`,
    method: 'post',
    response: ({
      body,
    }: {
      body?: { pageNum?: number; pageSize?: number; keyword?: string };
    }) => {
      const pageNum = Math.max(1, Number(body?.pageNum) || 1);
      const pageSize = Math.max(1, Number(body?.pageSize) || 20);
      const keyword = String(body?.keyword || '')
        .trim()
        .toLowerCase();
      const base = [
        'Vue',
        'React',
        'TypeScript',
        'JavaScript',
        'Node.js',
        'Java',
        'Go',
        'Python',
        'Rust',
        'Kotlin',
        'Swift',
        'Flutter',
        'CSS',
        'HTML',
        'Webpack',
        'Vite',
        'Docker',
        'K8s',
        'MySQL',
        'Redis',
        'MongoDB',
        'GraphQL',
        'NestJS',
        'Spring',
        'Android',
        'iOS',
        'Linux',
        'Nginx',
        'CI/CD',
        'Testing',
      ];
      const all = Array.from({ length: 48 }, (_, i) => {
        const label =
          base[i % base.length] +
          (i >= base.length ? ` ${Math.floor(i / base.length) + 1}` : '');
        return {
          label,
          value: `skill_${i + 1}`,
        };
      });
      const filtered = keyword
        ? all.filter((item) => item.label.toLowerCase().includes(keyword))
        : all;
      const start = (pageNum - 1) * pageSize;
      return unifiedSuccess({
        records: filtered.slice(start, start + pageSize),
        total: filtered.length,
      });
    },
  },
];

export default mocks;
