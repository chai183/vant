const excelIcon = new URL('./assets/excel.svg', import.meta.url).href;
const mp4Icon = new URL('./assets/mp4.svg', import.meta.url).href;
const pictureWrongIcon = new URL('./assets/picture-wrong.svg', import.meta.url).href;
const txtIcon = new URL('./assets/txt.svg', import.meta.url).href;
const unknownIcon = new URL('./assets/unknown.svg', import.meta.url).href;
const wordIcon = new URL('./assets/word.svg', import.meta.url).href;
const zipIcon = new URL('./assets/zip.svg', import.meta.url).href;

export type FileTypeIcon =
  | 'word'
  | 'excel'
  | 'mp4'
  | 'picture-wrong'
  | 'txt'
  | 'zip'
  | 'unknown';

/** unknown 为未匹配到已知扩展名时的兜底图标；picture-wrong 用于图片文件 */
export const FILE_TYPE_ICONS: Record<FileTypeIcon, string> = {
  word: wordIcon,
  excel: excelIcon,
  mp4: mp4Icon,
  'picture-wrong': pictureWrongIcon,
  txt: txtIcon,
  zip: zipIcon,
  unknown: unknownIcon,
};
