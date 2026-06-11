import excelIcon from './assets/excel.svg';
import mp4Icon from './assets/mp4.svg';
import pictureIcon from './assets/picture.svg';
import pictureWrongIcon from './assets/picture-wrong.svg';
import txtIcon from './assets/txt.svg';
import unknownIcon from './assets/unknown.svg';
import wordIcon from './assets/word.svg';
import zipIcon from './assets/zip.svg';

export type FileTypeIcon =
  | 'word'
  | 'excel'
  | 'mp4'
  | 'picture'
  | 'picture-wrong'
  | 'txt'
  | 'zip'
  | 'unknown';

/** unknown 为未匹配到已知扩展名时的兜底图标；picture-wrong 由上传失败逻辑单独使用 */
export const FILE_TYPE_ICONS: Record<FileTypeIcon, string> = {
  word: wordIcon,
  excel: excelIcon,
  mp4: mp4Icon,
  picture: pictureIcon,
  'picture-wrong': pictureWrongIcon,
  txt: txtIcon,
  zip: zipIcon,
  unknown: unknownIcon,
};
