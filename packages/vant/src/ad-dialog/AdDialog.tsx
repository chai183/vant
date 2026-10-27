import {
  ref,
  watch,
  computed,
  defineComponent,
  type PropType,
  type CSSProperties,
  type ExtractPropTypes,
} from 'vue';

import {
  addUnit,
  pick,
  truthProp,
  unknownProp,
  numericProp,
  makeStringProp,
  createNamespace,
  HAPTICS_FEEDBACK,
} from '../utils';

import { Popup, type PopupProps } from '../popup';
import { Swipe } from '../swipe';
import { Image } from '../image';
import { Icon } from '../icon';
import { Checkbox } from '../checkbox';
import { SwipeItem } from '../swipe-item';

import type {
  AdDialogCloseIconMode,
  AdDialogCloseIconPosition,
  AdDialogSwipeProps,
} from './types';

// 默认关闭图标文本
import CloseIcon from './assets/close-circle.png';
const [name, bem] = createNamespace('ad-dialog');

// 默认选择框文本
const DEFAULT_CHECKBOX_TEXT = '今日不再提醒';

// popup组件支持的属性中，部分属性需要在AdDialog组件中透传给Popup组件
const popupInheritAttrKeys = [
  'teleport',
  'zIndex',
  'duration',
  'beforeClose',
  'overlayProps',
  'overlayStyle',
  'overlayClass',
  'transitionAppear',
] as const satisfies ReadonlyArray<keyof PopupProps>;

type PopupInheritedAttrs = Partial<
  Pick<PopupProps, (typeof popupInheritAttrKeys)[number]>
>;

/* ----自定义四角position---- */
const closeIconPositionKeys = ['top', 'right', 'bottom', 'left'] as const;
const isCustomCloseIconPosition = (position: AdDialogCloseIconPosition) => {
  return typeof position === 'object' && position !== null;
};
// 是否顶部定位
const isTopPosition = (position: AdDialogCloseIconPosition) =>
  (typeof position === 'string' && position === 'top-left') ||
  position === 'top-right';

// 是否图片路径
const isImageUrl = (value?: string) => !!value && value.includes('/');

// 统一转成图片数组，方便后面用同一套逻辑区分单图和轮播图。
const normalizeImageList = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }
  return value ? [value] : [];
};
export const adDialogProps = {
  show: Boolean,
  overlay: truthProp,
  width: numericProp,
  height: numericProp,
  image: [String, Array] as PropType<string | string[]>,
  imageStyle: Object as PropType<CSSProperties>,
  imageClass: unknownProp,
  // 只在多图轮播时生效。
  swipeProps: Object as PropType<AdDialogSwipeProps>,
  checked: Boolean,
  showCheckbox: truthProp,
  checkboxText: makeStringProp(DEFAULT_CHECKBOX_TEXT),
  checkboxDisabled: Boolean,
  closeIcon: makeStringProp(''),
  closeIconPosition: {
    type: [String, Object] as PropType<AdDialogCloseIconPosition>,
    default: 'bottom-center',
  },
  closeIconMode: makeStringProp<AdDialogCloseIconMode>('outside'),
  closeOnClickOverlay: Boolean,
  closeOnPopstate: truthProp,
  destroyOnClose: Boolean,
  className: unknownProp,
};

export type AdDialogProps = ExtractPropTypes<typeof adDialogProps>;

export default defineComponent({
  name,
  inheritAttrs: false,
  props: adDialogProps,
  emits: [
    'open',
    'close',
    'update:show',
    'update:checked',
    'clickImage',
    'clickCloseIcon',
  ],

  setup(props, { emit, slots, attrs }) {
    // 内部维护一份 checked，既兼容组件受控，也兼容函数式调用场景。
    const currentChecked = ref(props.checked);
    const imageList = computed(() => normalizeImageList(props.image));
    const hasMultipleImages = computed(() => imageList.value.length > 1);
    const showInsideClose = computed(() => props.closeIconMode === 'inside');
    const showTopClose = computed(() => isTopPosition(props.closeIconPosition));
    const closeIconPositionName = computed<string>(() => {
      return isCustomCloseIconPosition(props.closeIconPosition)
        ? 'custom'
        : props.closeIconPosition;
    });
    const hasCustomCloseVisual = computed(
      () => !!slots['close-icon'] || isImageUrl(props.closeIcon),
    );

    // 图片容器单独继承宽度，避免外部模式的关闭按钮被裁剪。
    const imageWrapperStyle = computed<CSSProperties>(() => {
      const style: CSSProperties = {};

      if (props.width != null) {
        style.width = addUnit(props.width);
      }

      return style;
    });

    //关闭图标的样式处理
    const closeIconPositionStyle = computed<CSSProperties | undefined>(() => {
      const position = props.closeIconPosition;

      if (!isCustomCloseIconPosition(position)) {
        return;
      }

      const style: CSSProperties = {};

      closeIconPositionKeys.forEach((key) => {
        const value = position[key];

        if (value != null) {
          style[key] = addUnit(value);
        }
      });

      return style;
    });

    /*-----popup样式/类名/属性处理start-----*/

    // Popup 本身保持透明，只负责弹层定位，真正的宽度主要交给内容区域控制。
    const popupStyle = computed<CSSProperties>(() => {
      const style: CSSProperties = {
        background: 'transparent',
        overflow: 'visible',
      };

      if (props.width != null) {
        style.width = addUnit(props.width);
      }

      return style;
    });
    // popup合并的类
    const popupClass = computed(() => [bem(), props.className, attrs.class]);
    // popup合并的样式
    const popupMergedStyle = computed(() => [popupStyle.value, attrs.style]);
    // 透传给popup的属性
    const getPopupInheritedAttrs = () =>
      pick(attrs as PopupInheritedAttrs, popupInheritAttrKeys, true);

    /*-----popup样式/类名处理end-----*/

    /*-----监听处理start-----*/

    watch(
      () => props.checked,
      (value) => {
        if (value !== currentChecked.value) {
          currentChecked.value = value;
        }
      },
    );

    watch(
      () => props.show,
      (show, prevShow) => {
        // 每次重新打开时，都以最新 props.checked 作为初始值。
        if (show && !prevShow) {
          currentChecked.value = props.checked;
        }
      },
    );
    /*-----监听处理end-----*/

    /*-----emit事件集合start-----*/
    // 勾选框变化时，同时同步内部状态和外部的 v-model:checked。
    const updateChecked = (value: boolean) => {
      currentChecked.value = value;
      emit('update:checked', value);
    };
    const updateShow = (value: boolean) => emit('update:show', value);
    const onPopupOpen = () => emit('open');
    const onPopupClose = () => emit('close', currentChecked.value);
    const onClickImage = (event: MouseEvent) => emit('clickImage', event);
    // 关闭按钮点击
    const onClickCloseIcon = (event: MouseEvent) => {
      event.stopPropagation();
      emit('clickCloseIcon', currentChecked.value, event);
      updateShow(false);
    };
    /*-----emit事件集合end-----*/

    /* ----广告内容渲染start---- */
    // 图片处理渲染
    const renderBuiltInImages = () => {
      const images = imageList.value;

      if (!images.length) {
        return;
      }

      if (!hasMultipleImages.value) {
        return (
          <Image
            src={images[0]}
            width="100%"
            height={props.height}
            class={[bem('image'), props.imageClass]}
            style={props.imageStyle}
          />
        );
      }

      // 只有多图时才渲染 Swipe，此时 swipeProps 才会生效。
      const swipeProps = props.swipeProps ?? {};

      return (
        <Swipe
          class={bem('swipe')}
          loop={swipeProps.loop ?? images.length > 1}
          vertical={swipeProps.vertical}
          autoplay={swipeProps.autoplay}
          duration={swipeProps.duration}
          touchable={swipeProps.touchable}
          lazyRender={swipeProps.lazyRender ?? true}
          initialSwipe={swipeProps.initialSwipe}
          indicatorColor={swipeProps.indicatorColor ?? 'white'}
          showIndicators={swipeProps.showIndicators ?? images.length > 1}
          stopPropagation={swipeProps.stopPropagation}
        >
          {images.map((image, index) => (
            <SwipeItem key={`${image}-${index}`} class={bem('swipe-item')}>
              <Image
                src={image}
                width="100%"
                height={props.height}
                class={[bem('image'), props.imageClass]}
                style={props.imageStyle}
              />
            </SwipeItem>
          ))}
        </Swipe>
      );
    };
    const renderAdContent = () => {
      // default 插槽会整体替换图片展示区域，适合完全自定义广告内容。
      if (slots.default) {
        return slots.default();
      }

      return renderBuiltInImages();
    };
    /* ----广告内容渲染end---- */

    /* ----关闭按钮渲染start---- */
    //优先级：插槽 > 图片路径 > 内置图标
    const renderCloseIconContent = () => {
      if (slots['close-icon']) {
        return slots['close-icon']({ checked: currentChecked.value });
      }

      if (!props.closeIcon) {
        return (
          <Image
            src={CloseIcon}
            width="32px"
            height="32px"
            class={[bem('close-default-icon')]}
            style={props.imageStyle}
          ></Image>
        );
      }
      return <Icon name={props.closeIcon} class={[bem('close-icon')]} />;
    };
    const renderCloseButton = () => (
      <button
        type="button"
        class={[
          bem('close-button', {
            plain: hasCustomCloseVisual.value,
            default: !props.closeIcon,
          }),
          HAPTICS_FEEDBACK,
        ]}
        onClick={onClickCloseIcon}
      >
        {renderCloseIconContent()}
      </button>
    );
    /* ----关闭按钮渲染end---- */

    /* ----勾选框渲染start---- */
    const renderCheckbox = () => {
      if (!props.showCheckbox) {
        return;
      }

      return (
        <div class={bem('checkbox')}>
          <Checkbox
            shape="square"
            modelValue={currentChecked.value}
            disabled={props.checkboxDisabled}
            onUpdate:modelValue={updateChecked}
          >
            {props.checkboxText}
          </Checkbox>
        </div>
      );
    };
    /* ----勾选框渲染end---- */

    /* ----关闭按钮内外部模式start---- */
    const renderOutsideClose = () => {
      if (showInsideClose.value) {
        return;
      }

      // 外部模式下，关闭按钮单独摆在图片区域之外，不与广告图重叠。
      return (
        <div
          class={[
            bem('close-area'),
            bem('close-area', closeIconPositionName.value),
            bem('close-area', 'outside'),
          ]}
          style={closeIconPositionStyle.value}
        >
          {renderCloseButton()}
        </div>
      );
    };
    // 渲染内部关闭按钮
    const renderInsideClose = () => {
      if (!showInsideClose.value) {
        return;
      }

      // 内部模式下，关闭按钮挂在图片区域内部，位置跟随 closeIconPosition。
      return (
        <div
          class={[
            bem('inside-close'),
            bem('inside-close', closeIconPositionName.value),
          ]}
          style={closeIconPositionStyle.value}
        >
          {renderCloseButton()}
        </div>
      );
    };
    /* ----关闭按钮内外部模式end---- */

    return () => (
      <Popup
        class={popupClass.value}
        style={popupMergedStyle.value}
        position="center"
        show={props.show}
        overlay={props.overlay}
        lockScroll
        lazyRender
        closeOnPopstate={props.closeOnPopstate}
        closeOnClickOverlay={props.closeOnClickOverlay}
        destroyOnClose={props.destroyOnClose}
        onOpen={onPopupOpen}
        onClose={onPopupClose}
        onUpdate:show={updateShow}
        {...getPopupInheritedAttrs()}
      >
        <div class={bem('wrapper')}>
          {/* 渲染-关闭图标：外部-顶部 */}
          {!showInsideClose.value && showTopClose.value && renderOutsideClose()}

          <div
            class={bem('image-wrapper')}
            style={imageWrapperStyle.value}
            onClick={onClickImage}
          >
            {renderAdContent()}
            {/* 渲染-关闭图标：内部 */}
            {renderInsideClose()}
          </div>

          {renderCheckbox()}

          {/* 渲染-关闭图标：外部-底部 */}
          {!showInsideClose.value &&
            !showTopClose.value &&
            renderOutsideClose()}
        </div>
      </Popup>
    );
  },
});
