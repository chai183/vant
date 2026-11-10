/** 字典项（label / value，供 Select / radioPicker） */
export interface DictItem {
  label: string;
  value: string;
  /** 上级项 value（一层场景一般为空；有则供 parentField 客户端过滤） */
  parentValue?: string | null;
  leafFlag?: boolean;
  level?: number;
  status?: number;
  disabled?: boolean;
}

/**
 * 后端字典项 VO
 * GET /api/dict/simple/{dictCode}/items（PC / 移动端共用）
 */
export interface DictItemVO {
  id?: string;
  dictCode?: string;
  itemValue: string;
  itemLabel: string;
  parentId?: string | null;
  parentValue?: string | null;
  level?: number;
  leafFlag?: boolean;
  sortNo?: number;
  status?: number;
}

export interface DictMetaVO {
  id?: string;
  dictCode: string;
  dictName: string;
  isMultiLevel?: boolean;
  maxLevel?: number;
  sortNo?: number;
}

export type DictItemsResponseData = {
  success?: boolean;
  body?: DictItemVO[];
  data?: DictItemVO[];
  message?: string;
  errorMsg?: string;
  errorCode?: string | null;
};
