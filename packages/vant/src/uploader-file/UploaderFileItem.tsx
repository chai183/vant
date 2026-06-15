import {
  defineComponent,
  ref,
  watch,
  onMounted,
  onActivated,
  onBeforeUnmount,
  nextTick,
  type PropType,
} from 'vue';

// Utils
import {
  BORDER_BOTTOM,
  callInterceptor,
  makeRequiredProp,
  windowWidth,
  type Interceptor,
  type Numeric,
} from '../utils';
import {
  bem,
  getFileName,
  getFileTypeIcon,
  getStatusMessage,
  calcMiddleEllipsis,
  createTextWidthMeasurer,
  getElementFont,
  isFileNameEllipsised,
  UPLOADER_FILE_NAME_ELLIPSIS_DOTS,
  UPLOADER_FILE_STATUS_TEXTS,
} from './utils';

// Components
import { Icon } from '../icon';
import { Loading } from '../loading';
import Popover from '../popover/Popover';

// Types
import type { UploaderFileListItem } from '../uploader/types';

/** 单条文件行：类型图标、中间省略文件名、状态与操作按钮 */
export default defineComponent({
  // 组件注册名
  name: 'VanUploaderFileItem',

  // 对外 props
  props: {
    // 当前文件项数据（必填）
    item: makeRequiredProp<PropType<UploaderFileListItem>>(Object),
    // 在列表中的索引
    index: Number,
    // 表单项 name，传给拦截器
    name: [Number, String] as PropType<Numeric>,
    // 是否显示删除能力
    deletable: Boolean,
    // 是否允许重新上传（需父组件提供 upload）
    reuploadable: Boolean,
    // 上传成功后是否展示更多操作菜单
    showMenu: {
      type: Boolean,
      default: true,
    },
    // 全局删除前拦截器
    beforeDelete: Function as PropType<Interceptor>,
  },

  // 向父组件抛出的事件名
  emits: ['delete', 'reupload', 'openMenu'],

  // 组合式 setup
  setup(props, { emit }) {
    // 文件信息区域 DOM（用于量宽度）
    const fileInfoRef = ref<HTMLElement>();
    // 文件名 DOM（用于读字体、挂 ref）
    const fileNameRef = ref<HTMLElement>();
    // 中间省略后的展示名
    const ellipsisedName = ref('');
    // 是否因宽度不足而发生省略
    const isEllipsis = ref(false);
    // 省略时是否展开 Popover 看全名
    const showNamePopover = ref(false);
    // keep-alive 激活时若上次未拿到宽度，则下次再算
    let needRecalculate = false;
    // 监听 file-info 宽度变化以重算省略
    let resizeObserver: ResizeObserver | undefined;

    /** 根据 file-info 区域宽度对文件名做中间省略，溢出时可 Popover 看全名 */
    const updateEllipsis = () => {
      // 文件信息容器
      const infoEl = fileInfoRef.value;
      // 文件名节点
      const nameEl = fileNameRef.value;
      // 原始完整文件名
      const content = getFileName(props.item);

      // DOM 未就绪时标记待重算，先展示全名
      if (!infoEl || !nameEl) {
        needRecalculate = true;
        ellipsisedName.value = content;
        isEllipsis.value = false;
        return;
      }

      // 可用展示宽度
      const maxWidth = infoEl.clientWidth;
      // 宽度为 0（如隐藏态）时同样延后重算
      if (!maxWidth) {
        needRecalculate = true;
        ellipsisedName.value = content;
        isEllipsis.value = false;
        return;
      }

      // 已成功测量，清除待重算标记
      needRecalculate = false;
      // 按文件名元素字体创建测量函数
      const measureWidth = createTextWidthMeasurer(getElementFont(nameEl));
      // 计算中间省略后的字符串
      ellipsisedName.value = calcMiddleEllipsis(
        content,
        maxWidth,
        UPLOADER_FILE_NAME_ELLIPSIS_DOTS,
        measureWidth,
      );
      // 对比原文与展示文判断是否省略
      isEllipsis.value = isFileNameEllipsised(content, ellipsisedName.value);

      // 未省略时关闭 Popover，避免残留展开态
      if (!isEllipsis.value) {
        showNamePopover.value = false;
      }
    };

    // 挂载后首帧计算省略，并监听容器尺寸
    onMounted(() => {
      nextTick(updateEllipsis);

      // 支持 ResizeObserver 时监听 file-info 宽度变化
      if (fileInfoRef.value && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          updateEllipsis();
        });
        resizeObserver.observe(fileInfoRef.value);
      }
    });

    // 卸载前断开观察，防止泄漏
    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
    });

    // keep-alive 再次显示时，若曾未量到宽度则补算
    onActivated(() => {
      if (needRecalculate) {
        nextTick(updateEllipsis);
      }
    });

    // 窗口宽度或文件名变化时重算省略
    watch([windowWidth, () => getFileName(props.item)], () => {
      nextTick(updateEllipsis);
    });

    // 省略状态变化时同步布局（如 Popover 开关影响宽度）
    watch(isEllipsis, () => {
      nextTick(updateEllipsis);
    });

    // 删除：阻止冒泡，走拦截器后 emit delete
    const onDelete = (event: MouseEvent) => {
      event.stopPropagation();
      const { item, index, name, beforeDelete } = props;
      callInterceptor(item.beforeDelete || beforeDelete, {
        args: [item, { name, index }],
        done: () => emit('delete'),
      });
    };

    // 重传：阻止冒泡后通知父组件
    const onReupload = (event: MouseEvent) => {
      event.stopPropagation();
      emit('reupload');
    };

    // 打开更多菜单：阻止冒泡后通知父组件
    const onOpenMenu = (event: MouseEvent) => {
      event.stopPropagation();
      emit('openMenu');
    };

    // 渲染文件名：无省略直接展示；有省略包一层 Popover
    const renderFileName = (fileName: string) => {
      // 优先用省略结果，否则用传入全名
      const displayName = ellipsisedName.value || fileName;
      // Popover 的 reference 插槽内容
      const reference = (
        <div
          ref={fileNameRef}
          class={bem('file-name', { clickable: isEllipsis.value })}
        >
          {displayName}
        </div>
      );

      // 未省略则不需要 Popover
      if (!isEllipsis.value) {
        return reference;
      }

      // 省略时用 Popover 展示完整文件名
      return (
        <div class={bem('file-name-wrap')}>
          <Popover
            show={showNamePopover.value}
            theme="dark"
            placement="top-start"
            onUpdate:show={(show: boolean) => {
              showNamePopover.value = show;
            }}
            v-slots={{
              reference: () => reference,
              default: () => (
                <div class={bem('file-name-tooltip')}>{fileName}</div>
              ),
            }}
          />
        </div>
      );
    };

    /** 列表项左侧展示文件类型 SVG 图标，图片文件统一使用 picture-wrong */
    const renderFileIcon = (item: UploaderFileListItem) => (
      <div class={bem('file-icon')}>
        <img
          class={bem('file-icon-img')}
          src={getFileTypeIcon(item)}
          alt=""
        />
      </div>
    );

    // 渲染函数：根据 props.item 状态拼一整行 UI
    return () => {
      const { item, deletable, reuploadable, showMenu } = props;
      const fileName = getFileName(item);
      const status = getStatusMessage(item);
      const isUploading = item.status === 'uploading';
      const isFailed = item.status === 'failed';
      const isDone = item.status === 'done';
      const showReupload = isFailed && reuploadable;
      // 完成：更多菜单；失败且可重传：重传；未完成且 deletable：直接删（不走 ActionSheet）
      const showActions = isDone || showReupload || deletable;

      return (
        <div class={[bem('item'), BORDER_BOTTOM]}>
          {renderFileIcon(item)}
          {/* 中间：文件名 + 状态行 */}
          <div ref={fileInfoRef} class={bem('file-info')}>
            {renderFileName(fileName)}
            <div
              class={bem('file-status', {
                uploading: isUploading,
                failed: isFailed,
                done: isDone,
              })}
            >
              <span>{status}</span>
              {isUploading ? <Loading size={14} /> : null}
            </div>
          </div>
          {/* 右侧操作区：按状态展示不同按钮 */}
          {showActions ? (
            <div class={bem('actions')}>
              {showReupload ? (
                <span
                  role="button"
                  class={bem('reupload')}
                  tabindex={0}
                  onClick={onReupload}
                >
                  <Icon name="replay" class={bem('reupload-icon')} />
                  {UPLOADER_FILE_STATUS_TEXTS.reupload}
                </span>
              ) : null}
              {isDone && showMenu ? (
                <Icon
                  role="button"
                  name="ellipsis"
                  class={bem('menu')}
                  tabindex={0}
                  onClick={onOpenMenu}
                />
              ) : null}
              {/* 上传中/等待中仅展示删除，避免未完成时打开预览/下载等菜单 */}
              {!isDone && deletable ? (
                <Icon
                  role="button"
                  name="clear"
                  class={bem('delete')}
                  tabindex={0}
                  onClick={onDelete}
                />
              ) : null}
            </div>
          ) : null}
        </div>
      );
    };
  },
});
