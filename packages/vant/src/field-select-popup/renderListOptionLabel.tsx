import Highlight from '../highlight';
import { createNamespace } from '../utils';
import type { FieldSelectPopupOption } from './types';
import { optionHasHighlightKeywords } from './types';

const [, bem] = createNamespace('field-select-popup');

function renderListLine(
  source: string,
  keywords: string | string[] | undefined,
  bemKey: 'list-text' | 'list-sub-text' | 'list-content' | 'list-desc',
) {
  if (optionHasHighlightKeywords(keywords)) {
    return (
      <span class={bem(bemKey)}>
        <Highlight tag="span" sourceString={source} keywords={keywords!} />
      </span>
    );
  }
  return <span class={bem(bemKey)}>{source}</span>;
}

/** 与弹层列表项一致的选项文案结构（主副文 + 描述 + 高亮） */
export function renderListOptionLabel(opt: FieldSelectPopupOption) {
  return (
    <div class={bem('list-label')}>
      {renderListLine(opt.text, opt.highlightKeywords, 'list-text')}
      {opt.subText
        ? renderListLine(
            opt.subText,
            opt.subTextHighlightKeywords,
            'list-sub-text',
          )
        : null}
      {opt.content
        ? renderListLine(
            opt.content,
            opt.contentHighlightKeywords,
            'list-content',
          )
        : null}
      {opt.desc
        ? renderListLine(opt.desc, opt.descHighlightKeywords, 'list-desc')
        : null}
    </div>
  );
}
