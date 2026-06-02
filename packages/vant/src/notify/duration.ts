import type { NotifyOptions } from './types';

/**
 * 获取 Notify 自动关闭时长（ms）。
 * - `persistent: true`：常驻，返回 0
 * - 否则使用 `duration`，默认 3000；`duration: 0` 表示不自动关闭
 */
export function getNotifyAutoCloseDuration(
  options: Pick<NotifyOptions, 'persistent' | 'duration'>,
): number {
  if (options.persistent) {
    return 0;
  }
  return options.duration ?? 3000;
}
