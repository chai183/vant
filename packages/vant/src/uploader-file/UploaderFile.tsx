import {
  defineComponent,
  computed,
  ref,
  watch,
  type PropType,
  type ExtractPropTypes,
} from 'vue';

// 工具函数与 BEM、文案常量
import {
  extend,
  pick,
  isDef,
  callInterceptor,
  createNamespace,
  makeStringProp,
  makeArrayProp,
  numericProp,
  type ComponentInstance,
} from '../utils';
import {
  bem,
  getFileName,
  UPLOADER_FILE_STATUS_TEXTS,
  UPLOADER_FILE_ACTION_TEXTS,
} from './utils';

// 依赖组件：底层选文件用 Uploader，列表项与弹层 UI 自行组装
import Uploader, { uploaderProps } from '../uploader/Uploader';
import Button from '../button/Button';
import UploaderFileItem from './UploaderFileItem';
import ActionSheet, { type ActionSheetAction } from '../action-sheet/ActionSheet';
import Dialog from '../dialog/Dialog';
import Field from '../field/Field';
import { showConfirmDialog } from '../dialog/function-call';
import { showToast } from '../toast';
import { isImageFile } from '../uploader/utils';

// 对外暴露 chooseFile 等方法
import { useCustomFieldValue } from '@vant/use';
import { useExpose } from '../composables/use-expose';

// 预览、下载、重命名等默认实现
import {
  downloadFile,
  previewFileWithImagePreview,
  renameFileName,
} from './fileActions';
import uploadIcon from './assets/upload.svg';

// 类型定义
import type {
  UploaderBeforeRead,
  UploaderExpose,
  UploaderFileListItem,
} from '../uploader/types';
import type { UploaderFileUpload, UploaderFileUploadResult } from './types';

// 生成组件名与 BEM 前缀：van-uploader-file
const [name] = createNamespace('uploader-file');

/** UploaderFile 在 Uploader 基础上扩展的 props（上传、预览、下载、重命名等） */
const uploaderFileOwnProps = {
  /** 顶部说明文案，支持字符串或字符串数组 */
  description: [String, Array] as PropType<string | string[]>,
  /** 上传按钮文案 */
  uploadText: makeStringProp('添加附件'),
  /** v-model 绑定的文件列表 */
  modelValue: makeArrayProp<UploaderFileListItem>(),
  /** 自定义上传逻辑，传入后组件自动管理 uploading / done / failed 状态 */
  upload: Function as PropType<UploaderFileUpload>,
  /** 自定义预览，传入后覆盖默认图片预览 */
  preview: Function as PropType<(item: UploaderFileListItem) => void>,
  /** 自定义下载 */
  download: Function as PropType<(item: UploaderFileListItem) => void>,
  /** 自定义重命名，可在服务端同步后再由组件更新本地 fileName */
  rename: Function as PropType<
    (item: UploaderFileListItem, newName: string) => void | Promise<void>
  >,
  /** 重命名输入框最大长度，有值时显示字数统计 */
  renameMaxlength: numericProp,
};

/** 合并 Uploader 与自有 props，并覆盖部分默认值以适配附件场景 */
export const uploaderFileProps = extend({}, uploaderProps, uploaderFileOwnProps, {
  accept: makeStringProp('*'),
  previewImage: {
    type: Boolean,
    default: false,
  },
  resultType: makeStringProp<'dataUrl' | 'text' | 'file'>('file'),
  multiple: {
    type: Boolean,
    default: true,
  },
});

export type UploaderFileProps = ExtractPropTypes<typeof uploaderFileProps>;

/** 透传给底层 Uploader 的 props，文件列表 UI 由本组件自行渲染 */
const UPLOADER_INHERIT_PROPS = [
  'name',
  'accept',
  'capture',
  'multiple',
  'disabled',
  'readonly',
  'maxSize',
  'resultType',
  'beforeRead',
  'beforeDelete',
  'deletable',
] as const;

/** 更多操作菜单的固定项顺序 */
const ACTION_SHEET_ACTIONS = [
  UPLOADER_FILE_ACTION_TEXTS.preview,
  UPLOADER_FILE_ACTION_TEXTS.rename,
  UPLOADER_FILE_ACTION_TEXTS.download,
  UPLOADER_FILE_ACTION_TEXTS.delete,
] as const;

/** 仅对未开始或失败项触发自动上传，避免重复请求 */
function shouldAutoUpload(item: UploaderFileListItem) {
  return item.status !== 'uploading' && item.status !== 'done';
}

export default defineComponent({
  name,

  props: uploaderFileProps,

  emits: [
    'delete',
    'oversize',
    'clickUpload',
    'closePreview',
    'update:modelValue',
    'preview',
    'rename',
    'download',
  ],

  setup(props, { emit, slots }) {
    useCustomFieldValue(() => props.modelValue);

    // ---------- Refs 与内部状态 ----------
    /** 底层 Uploader 实例，用于选文件、关闭预览等 */
    const uploaderRef = ref<UploaderExpose>();
    /** 内部维护一份列表，与 v-model 双向同步；选择文件仍走底层 Uploader */
    const innerList = ref<UploaderFileListItem[]>([...props.modelValue]);
    /** 是否展示更多操作 ActionSheet */
    const showActionSheet = ref(false);
    /** 是否展示重命名 Dialog */
    const showRenameDialog = ref(false);
    /** 当前操作中的文件在 innerList 中的下标 */
    const activeIndex = ref(-1);
    /** 重命名输入框内容 */
    const renameInput = ref('');
    /** 图片预览实例，用于关闭时清理 */
    let imagePreview: ComponentInstance | undefined;

    // ---------- 与外部 modelValue 同步 ----------
    watch(
      () => props.modelValue,
      (value) => {
        innerList.value = value;
      },
    );

    // ---------- 派生状态 ----------
    /** 将 description 统一为字符串数组，便于 map 渲染 */
    const descriptions = computed(() => {
      const { description } = props;
      if (!description) {
        return [];
      }
      return Array.isArray(description) ? description : [description];
    });

    /** 是否已达到 maxCount 上限（用于禁用选文件与样式） */
    const isMaxCountReached = computed(() => {
      const maxCount = +props.maxCount;
      return (
        Number.isFinite(maxCount) && innerList.value.length >= maxCount
      );
    });

    // ---------- 列表与上传相关方法 ----------
    const showMaxCountToast = () => {
      showToast(
        UPLOADER_FILE_ACTION_TEXTS.maxCountExceeded(+props.maxCount),
      );
    };

    /** 在 Uploader beforeRead 链路上拦截：校验 maxCount 并裁剪多选结果 */
    const handleBeforeRead: UploaderBeforeRead = (file, detail) => {
      const maxCount = +props.maxCount;
      let nextFile = file;

      if (Number.isFinite(maxCount)) {
        const current = innerList.value.length;

        // 已满则直接拒绝本次选择
        if (current >= maxCount) {
          return false;
        }

        // 多选超出剩余配额时只保留前 N 个并提示
        if (Array.isArray(file) && file.length > maxCount - current) {
          showMaxCountToast();
          nextFile = file.slice(0, maxCount - current);
        }
      }

      // 继续走用户自定义 beforeRead
      if (props.beforeRead) {
        return props.beforeRead(nextFile, detail);
      }

      // 若已裁剪文件，需以 Promise 形式返回新文件列表
      if (nextFile !== file) {
        return Promise.resolve(nextFile);
      }

      return true;
    };

    /** 绑定给 Uploader 的 props：继承字段 + 包装后的 beforeRead */
    const uploaderBindProps = computed(() => ({
      ...pick(props, UPLOADER_INHERIT_PROPS),
      beforeRead: handleBeforeRead,
    }));

    /** ActionSheet 选项，删除项使用危险色 */
    const actionSheetActions = computed<ActionSheetAction[]>(() =>
      ACTION_SHEET_ACTIONS.map((name) => ({
        name,
        color:
          name === UPLOADER_FILE_ACTION_TEXTS.delete
            ? 'var(--van-danger-color)'
            : undefined,
      })),
    );

    /** 构造 emit 时附带的 detail 对象 */
    const getDetail = (index: number) => ({
      name: props.name,
      index,
    });

    /** 更新内部列表并触发 v-model */
    const syncFileList = (fileList: UploaderFileListItem[]) => {
      innerList.value = fileList;
      emit('update:modelValue', fileList);
    };

    /** 按索引局部更新列表项字段 */
    const patchFileAt = (
      index: number,
      patch: Partial<UploaderFileListItem>,
    ) => {
      syncFileList(
        innerList.value.map((file, i) =>
          i === index ? { ...file, ...patch } : file,
        ),
      );
    };

    /**
     * 调用 props.upload 上传单项。
     * 用 file 引用定位列表下标，避免异步期间列表重排导致 patch 错位。
     */
    const startUpload = async (index: number) => {
      const item = innerList.value[index];
      if (!item || !props.upload || !shouldAutoUpload(item)) {
        return;
      }

      const fileRef = item.file;

      /** 上传过程中通过 file 引用查找当前下标再 patch */
      const patchUploadResult = (patch: Partial<UploaderFileListItem>) => {
        const currentIndex = innerList.value.findIndex(
          (file) => file.file === fileRef,
        );
        if (currentIndex === -1) {
          return;
        }
        patchFileAt(currentIndex, patch);
      };

      patchFileAt(index, {
        status: 'uploading',
        message: UPLOADER_FILE_STATUS_TEXTS.uploading,
      });

      try {
        const result = await props.upload(item);
        const uploadResult = (result || {}) as UploaderFileUploadResult;
        patchUploadResult({
          ...uploadResult,
          status: 'done',
          message: uploadResult.message ?? '',
        });
      } catch (error) {
        patchUploadResult({
          status: 'failed',
          message:
            error instanceof Error
              ? error.message
              : UPLOADER_FILE_STATUS_TEXTS.failed,
        });
      }
    };

    /** Uploader 选中新文件后的入口：合并列表、单文件模式替换、标记等待并触发上传 */
    const onUploaderModelUpdate = (value: UploaderFileListItem[]) => {
      const prev = innerList.value;
      // 找出本次新增项（以 File 对象引用区分）
      let added = value.filter(
        (item) => !prev.some((file) => file.file === item.file),
      );

      let nextList = value;
      // 单选模式：只保留最新一个文件
      if (!props.multiple && added.length) {
        added = added.slice(0, 1);
        nextList = added;
      }
      // 配置了 upload 时，为新文件打上「等待上传」状态
      if (props.upload && added.length) {
        nextList = nextList.map((item) =>
          added.some((file) => file.file === item.file)
            ? {
                ...item,
                status: '' as const,
                message: UPLOADER_FILE_STATUS_TEXTS.waiting,
              }
            : item,
        );
      }

      syncFileList(nextList);

      // 对每个新增项发起上传
      if (props.upload) {
        added.forEach((item) => {
          const index = nextList.findIndex((file) => file.file === item.file);
          if (index !== -1) {
            startUpload(index);
          }
        });
      }
    };

    /** 从列表移除文件并触发 delete 事件 */
    const deleteFile = (item: UploaderFileListItem, index: number) => {
      const fileList = innerList.value.slice();
      fileList.splice(index, 1);
      syncFileList(fileList);
      emit('delete', item, getDetail(index));
    };

    /** 删除前二次确认，再走 beforeDelete 拦截器 */
    const confirmDelete = (index: number) => {
      const item = innerList.value[index];
      if (!item) {
        return;
      }

      showConfirmDialog({
        message: UPLOADER_FILE_ACTION_TEXTS.deleteMessage,
        confirmButtonColor: 'var(--van-danger-color)',
      })
        .then(() => {
          callInterceptor(item.beforeDelete || props.beforeDelete, {
            args: [item, { name: props.name, index }],
            done: () => deleteFile(item, index),
          });
        })
        .catch(() => undefined);
    };

    /** 关闭组件内与 Uploader 内的图片预览 */
    const closeImagePreview = () => {
      if (imagePreview) {
        imagePreview.close();
        imagePreview = undefined;
      }
      uploaderRef.value?.closeImagePreview();
    };

    /** 优先走 props.preview；默认仅图片走 ImagePreview，非图片 Toast 提示 */
    const handlePreview = (item: UploaderFileListItem) => {
      emit('preview', item, getDetail(activeIndex.value));
      if (props.preview) {
        props.preview(item);
        return;
      }

      if (!isImageFile(item)) {
        showToast(UPLOADER_FILE_ACTION_TEXTS.previewUnsupported);
        return;
      }

      imagePreview = previewFileWithImagePreview(innerList.value, item, {
        previewFullImage: props.previewFullImage,
        ...props.previewOptions,
        onClose: () => {
          emit('closePreview');
          imagePreview = undefined;
        },
      });
    };

    /** 优先走 props.download；否则走默认下载（如 a 标签 / 新窗口） */
    const handleDownload = async (item: UploaderFileListItem) => {
      emit('download', item, getDetail(activeIndex.value));
      if (props.download) {
        props.download(item);
        return;
      }
      const success = await downloadFile(item);
      if (!success) {
        showToast(UPLOADER_FILE_ACTION_TEXTS.downloadFailed);
      }
    };

    /** 打开重命名弹窗并预填当前文件名 */
    const openRenameDialog = (item: UploaderFileListItem) => {
      renameInput.value = getFileName(item);
      showRenameDialog.value = true;
    };

    /** 确认重命名：emit → 自定义 rename → 更新本地 fileName */
    const onRenameConfirm = async () => {
      const index = activeIndex.value;
      const item = innerList.value[index];
      const newName = renameInput.value.trim();

      if (!item || !newName) {
        showRenameDialog.value = false;
        return;
      }

      emit('rename', item, newName, getDetail(index));

      if (props.rename) {
        await props.rename(item, newName);
      }

      patchFileAt(index, renameFileName(item, newName));
      showRenameDialog.value = false;
    };

    /** 更多菜单：预览 / 重命名 / 下载 / 删除（删除走二次确认 + beforeDelete 拦截器） */
    const onActionSelect = (action: ActionSheetAction) => {
      const index = activeIndex.value;
      const item = innerList.value[index];
      if (!item) {
        return;
      }

      showActionSheet.value = false;

      switch (action.name) {
        case UPLOADER_FILE_ACTION_TEXTS.preview:
          handlePreview(item);
          break;
        case UPLOADER_FILE_ACTION_TEXTS.rename:
          openRenameDialog(item);
          break;
        case UPLOADER_FILE_ACTION_TEXTS.download:
          handleDownload(item);
          break;
        case UPLOADER_FILE_ACTION_TEXTS.delete:
          confirmDelete(index);
          break;
      }
    };

    /** 点击列表项「更多」时记录 index 并打开 ActionSheet */
    const openActionMenu = (index: number) => {
      activeIndex.value = index;
      showActionSheet.value = true;
    };

    // ---------- 渲染函数 ----------
    /** 顶部说明区域 */
    const renderHeader = () => {
      if (!descriptions.value.length) {
        return;
      }

      return (
        <div class={bem('header')}>
          {descriptions.value.map((text) => (
            <div key={text} class={bem('desc')}>
              {text}
            </div>
          ))}
        </div>
      );
    };

    /** 上传触发区：默认插槽或内置 Button */
    const renderUploadTrigger = () => {
      if (slots.default) {
        return slots.default();
      }

      return (
        <Button
          class={bem('upload')}
          type="default"
          v-slots={{
            icon: () => (
              <img
                class={bem('upload-icon')}
                src={uploadIcon}
                alt=""
              />
            ),
            default: () => props.uploadText,
          }}
        />
      );
    };

    /** 自定义文件列表（替代 Uploader 默认预览网格） */
    const renderFileList = () => {
      if (!innerList.value.length) {
        return;
      }

      return (
        <div class={bem('list')}>
          {innerList.value.map((item, index) => (
            <UploaderFileItem
              key={`${item.url || item.file?.name || index}-${index}`}
              item={item}
              index={index}
              name={props.name}
              deletable={props.deletable}
              beforeDelete={props.beforeDelete}
              onDelete={() => deleteFile(item, index)}
              onReupload={() => startUpload(index)}
              onOpenMenu={() => openActionMenu(index)}
            />
          ))}
        </div>
      );
    };

    /** 更多操作底部面板 */
    const renderActionSheet = () => (
      <ActionSheet
        show={showActionSheet.value}
        actions={actionSheetActions.value}
        cancelText={UPLOADER_FILE_ACTION_TEXTS.cancel}
        closeOnClickAction
        onUpdate:show={(show: boolean) => {
          showActionSheet.value = show;
        }}
        onSelect={onActionSelect}
      />
    );

    /** 重命名弹窗与输入框 */
    const renderRenameDialog = () => (
      <Dialog
        show={showRenameDialog.value}
        title={UPLOADER_FILE_ACTION_TEXTS.renameTitle}
        showCancelButton
        onUpdate:show={(show: boolean) => {
          showRenameDialog.value = show;
        }}
        onConfirm={onRenameConfirm}
        confirmButtonColor="var(--van-warning-color)"
      >
        <div class={bem('rename-wrap')}>
          <Field
            modelValue={renameInput.value}
            placeholder={UPLOADER_FILE_ACTION_TEXTS.renamePlaceholder}
            maxlength={
              isDef(props.renameMaxlength) ? props.renameMaxlength : undefined
            }
            showWordLimit={isDef(props.renameMaxlength)}
            border={false}
            onUpdate:modelValue={(value: string) => {
              renameInput.value = value;
            }}
          />
        </div>
      </Dialog>
    );

    /** 点击上传区域：达上限时 Toast，否则透传 clickUpload */
    const onClickUpload = (event: MouseEvent) => {
      if (isMaxCountReached.value) {
        showMaxCountToast();
        return;
      }
      emit('clickUpload', event);
    };

    // ---------- 对外暴露实例方法 ----------
    useExpose<UploaderExpose>({
      chooseFile: () => {
        if (isMaxCountReached.value) {
          showMaxCountToast();
          return;
        }
        uploaderRef.value?.chooseFile();
      },
      closeImagePreview,
      reuploadFile: (index: number) =>
        uploaderRef.value?.reuploadFile(index),
    });

    // ---------- 根渲染：Uploader 负责选文件，列表与弹层由本组件渲染 ----------
    return () => (
      <div class={bem()}>
        {renderHeader()}
        {/* previewImage=false：缩略图列表由 UploaderFileItem 展示，不用 Uploader 默认网格 */}
        <Uploader
          ref={uploaderRef}
          class={[
            bem('uploader'),
            isMaxCountReached.value && bem('uploader', 'max-count'),
          ]}
          {...uploaderBindProps.value}
          multiple={props.multiple}
          modelValue={innerList.value}
          previewImage={false}
          onClickUpload={onClickUpload}
          onOversize={(items, detail) => emit('oversize', items, detail)}
          onUpdate:modelValue={onUploaderModelUpdate}
        >
          {{
            default: () => slots.default?.() ?? renderUploadTrigger(),
          }}
        </Uploader>
        {renderFileList()}
        {renderActionSheet()}
        {renderRenameDialog()}
      </div>
    );
  },
});
