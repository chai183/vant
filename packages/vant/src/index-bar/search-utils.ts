// 相对原生 IndexBar 新增：搜索匹配与高亮拆分工具（Anchor / Cell 共用）

// 单段文案及其是否命中关键词
export type SearchTextSegment = {
  text: string;
  highlight: boolean;
};

// 子串匹配（不区分大小写）；无关键词时视为全部命中
export function matchSearchText(text: string, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;
  return text.toLowerCase().includes(normalizedKeyword);
}

// 按关键词在原文中的位置拆成多段，命中段 highlight: true，供模板 map 渲染
export function splitSearchText(
  text: string,
  keyword: string,
): SearchTextSegment[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return [{ text, highlight: false }];

  const lowerText = text.toLowerCase();
  const segments: SearchTextSegment[] = [];
  let start = 0;
  let index = lowerText.indexOf(normalizedKeyword, start);

  // 从左到右扫描所有命中位置（支持同一关键词多次出现）
  while (index !== -1) {
    // 命中点之前有未匹配文案
    if (index > start) {
      segments.push({ text: text.slice(start, index), highlight: false });
    }
    // 命中段
    segments.push({
      text: text.slice(index, index + normalizedKeyword.length),
      highlight: true,
    });
    // 跳过已处理区间，继续查找下一处命中
    start = index + normalizedKeyword.length;
    index = lowerText.indexOf(normalizedKeyword, start);
  }

  if (start < text.length) {
    segments.push({ text: text.slice(start), highlight: false });
  }

  return segments.length ? segments : [{ text, highlight: false }];
}
