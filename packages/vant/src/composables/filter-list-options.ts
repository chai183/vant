import type { CellProps } from '../cell';

export type ListGroupOption = {
  label: string;
  cellProps?: Partial<CellProps>;
};

export function filterListOptions<T extends ListGroupOption>(
  options: T[],
  keyword: string,
) {
  const normalized = keyword.trim().toLowerCase();
  if (!normalized) {
    return options;
  }

  return options.filter((option) => {
    const texts = [option.label];
    if (option.cellProps?.label != null) {
      texts.push(String(option.cellProps.label));
    }
    return texts.some((text) =>
      String(text).toLowerCase().includes(normalized),
    );
  });
}

export function getListSearchHighlight(keyword: string) {
  const trimmed = keyword.trim();
  return trimmed ? [trimmed] : [];
}

export function isListSearchEmpty(keyword: string, optionsLength: number) {
  return keyword.trim().length > 0 && optionsLength === 0;
}
