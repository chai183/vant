import { withInstall } from '../utils';
import _UploaderFile from './UploaderFile';

export const UploaderFile = withInstall(_UploaderFile);
export default UploaderFile;
export { uploaderFileProps } from './UploaderFile';
export type { UploaderFileProps } from './UploaderFile';
export type { UploaderFileListItem, UploaderBeforeRead } from '../uploader/types';
export type { UploaderFileEntry } from './utils';
export type {
  UploaderFileInstance,
  UploaderFileThemeVars,
  UploaderFileUpload,
  UploaderFileUploadResult,
} from './types';

declare module 'vue' {
  export interface GlobalComponents {
    VanUploaderFile: typeof UploaderFile;
  }
}
