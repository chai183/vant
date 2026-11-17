export function matchSearchText(text: string, keyword: string) {
  const normalKeyword = keyword.trim().toLowerCase();
  if (!normalKeyword) return true;
  return text.toLowerCase().includes(normalKeyword);
}
