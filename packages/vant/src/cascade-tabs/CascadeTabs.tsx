import {
  watch,
  computed,
  defineComponent,
  type PropType,
  type ExtractPropTypes,
} from 'vue';
import {
  makeArrayProp,
  makeNumericProp,
  truthProp,
  createNamespace,
  type Numeric,
} from '../utils';
import Tabs from '../tabs/Tabs';
import Tab from '../tab/Tab';
import type { TabsType } from '../tabs/types';
import type { CascadeTabOption, CascadeTabsActivePath } from './types';

const [name, bem] = createNamespace('cascade-tabs');

const LEVEL_TYPES: Record<2 | 3, TabsType[]> = {
  2: ['underline', 'rounded'],
  3: ['underline', 'rounded', 'divider'],
};

export const cascadeTabsProps = {
  levels: makeNumericProp(3),
  options: makeArrayProp<CascadeTabOption>(),
  active: {
    type: Array as PropType<CascadeTabsActivePath>,
    default: () => [0, 0, 0],
  },
  color: String,
  swipeThreshold: makeNumericProp(5),
  showNavMenu: truthProp,
};

export type CascadeTabsProps = ExtractPropTypes<typeof cascadeTabsProps>;

export default defineComponent({
  name,

  props: cascadeTabsProps,

  emits: ['change', 'update:active'],

  setup(props, { emit, slots }) {
    const levelCount = computed(() => {
      const count = +props.levels;
      return count === 2 ? 2 : 3;
    });

    const normalizePath = (path: CascadeTabsActivePath) => {
      const normalized = [...path];
      while (normalized.length < levelCount.value) {
        normalized.push(0);
      }
      return normalized.slice(0, levelCount.value);
    };

    const activePath = computed(() => normalizePath(props.active));

    const getLevelOptions = (level: number): CascadeTabOption[] => {
      let options = props.options;

      for (let i = 0; i < level; i++) {
        const index = activePath.value[i] ?? 0;
        options = options[index]?.children ?? [];
      }

      return options;
    };

    const getTitlesFromPath = (path: CascadeTabsActivePath) => {
      const titles: string[] = [];
      let options = props.options;

      for (let level = 0; level < levelCount.value; level++) {
        const index = path[level] ?? 0;
        const current = options[index];
        if (!current) {
          break;
        }
        titles.push(current.title);
        options = current.children ?? [];
      }

      return titles;
    };

    const activeTitles = computed(() => getTitlesFromPath(activePath.value));

    const updatePath = (level: number, index: number) => {
      const path = normalizePath(props.active);
      path[level] = index;

      for (let i = level + 1; i < levelCount.value; i++) {
        path[i] = 0;
      }

      emit('update:active', path);
      emit('change', {
        active: path,
        titles: getTitlesFromPath(path),
      });
    };

    watch(
      () => [props.levels, props.options],
      () => {
        const path = normalizePath(props.active);
        let options = props.options;
        let changed = path.length !== props.active.length;

        for (let level = 0; level < levelCount.value; level++) {
          const maxIndex = Math.max(options.length - 1, 0);
          if ((path[level] ?? 0) > maxIndex) {
            path[level] = maxIndex;
            changed = true;
          }
          const index = path[level] ?? 0;
          options = options[index]?.children ?? [];
        }

        if (changed) {
          emit('update:active', path);
        }
      },
      { deep: true },
    );

    const renderLevel = (level: number) => {
      const options = getLevelOptions(level);
      if (!options.length) {
        return null;
      }

      const type = LEVEL_TYPES[levelCount.value as 2 | 3][level];

      return (
        <Tabs
          key={level}
          class={bem('level', type)}
          type={type}
          color={props.color}
          animated={false}
          lazyRender={false}
          swipeThreshold={props.swipeThreshold}
          showNavMenu={props.showNavMenu}
          active={activePath.value[level] ?? 0}
          onUpdate:active={(index: Numeric) => updatePath(level, +index)}
        >
          {options.map((option, index) => (
            <Tab
              key={`${level}-${index}`}
              title={option.title}
              disabled={option.disabled}
            />
          ))}
        </Tabs>
      );
    };

    return () => (
      <div class={bem()}>
        {Array.from({ length: levelCount.value }).map((_, level) =>
          renderLevel(level),
        )}
        <div class={bem('content')}>
          {slots.default?.({
            active: activePath.value,
            titles: activeTitles.value,
          })}
        </div>
      </div>
    );
  },
});
