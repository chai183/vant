// 搜索匹配与高亮拆分工具，供 Cell / IndexAnchor 等组件复用

export type SearchTextSegment = {
  text: string;
  highlight: boolean;
};

export function matchSearchText(text: string, keyword: string) {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return true;
  return text.toLowerCase().includes(normalizedKeyword);
}

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

  while (index !== -1) {
    if (index > start) {
      segments.push({ text: text.slice(start, index), highlight: false });
    }

    segments.push({
      text: text.slice(index, index + normalizedKeyword.length),
      highlight: true,
    });

    start = index + normalizedKeyword.length;
    index = lowerText.indexOf(normalizedKeyword, start);
  }

  if (start < text.length) {
    segments.push({ text: text.slice(start), highlight: false });
  }

  return segments.length ? segments : [{ text, highlight: false }];
}
