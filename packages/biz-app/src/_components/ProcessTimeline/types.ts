/** 流程时间轴一条节点 */
export type ProcessTimelineItem = {
  id?: string;
  /** 左侧标题，如转正 / 调动 */
  title?: string;
  /** 右侧附加信息，如日期 */
  extra?: string;
  /** 标题下方说明，按换行拆成多条，一条一行 */
  desc?: string;
  /** van-icon 名称 */
  icon?: string;
};
