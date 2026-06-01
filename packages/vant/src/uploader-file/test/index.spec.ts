import { nextTick } from 'vue';
import { UploaderFile } from '..';
import { mount, later } from '../../../test';
import type { UploaderFileListItem } from '..';
import {
  UPLOADER_FILE_ACTION_TEXTS,
  UPLOADER_FILE_STATUS_TEXTS,
  formatFileSize,
  getStatusMessage,
  isFileNameEllipsised,
} from '../utils';

const showConfirmDialog = vi.hoisted(() =>
  vi.fn(() => Promise.resolve('confirm')),
);

const showToast = vi.hoisted(() => vi.fn());

vi.mock('../../dialog/function-call', () => ({
  showConfirmDialog,
}));

vi.mock('../../toast', () => ({
  showToast,
}));

const mockFile = new File([new ArrayBuffer(100)], 'test.doc', {
  type: 'application/msword',
});

const failFile = new File([new ArrayBuffer(100)], 'fail.doc', {
  type: 'application/msword',
});

function mockFileReader() {
  function mockReadAsDataURL(this: FileReader) {
    if (this.onload) {
      this.onload({
        target: { result: '' },
      } as ProgressEvent<FileReader>);
    }
  }

  Object.defineProperty(window.FileReader.prototype, 'readAsDataURL', {
    value: mockReadAsDataURL,
  });
  Object.defineProperty(window.FileReader.prototype, 'readAsText', {
    value: mockReadAsDataURL,
  });
}

mockFileReader();

test('should format file size', () => {
  expect(formatFileSize(0)).toBe('0B');
  expect(formatFileSize(100)).toBe('100B');
  expect(formatFileSize(1536)).toBe('1.5KB');
  expect(formatFileSize(1024 * 1024)).toBe('1MB');
});

test('should show file size when upload done', () => {
  const item = {
    file: new File([new ArrayBuffer(100)], 'demo.doc'),
    status: 'done' as const,
  };

  expect(getStatusMessage(item)).toBe('100B');
});

test('should detect ellipsised file name', () => {
  expect(isFileNameEllipsised('demo.doc', 'de....mo.doc')).toBe(true);
  expect(isFileNameEllipsised('demo.doc', 'demo.doc')).toBe(false);
});

test('should not enable multiple file selection when multiple is false', () => {
  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [],
      multiple: false,
    },
  });

  expect(
    wrapper.find<HTMLInputElement>('.van-uploader__input').attributes('multiple'),
  ).toBeUndefined();
});

test('should replace file list when multiple is false', async () => {
  const existingFile = new File([new ArrayBuffer(100)], 'old.doc', {
    type: 'application/msword',
  });
  const newFile = new File([new ArrayBuffer(100)], 'new.doc', {
    type: 'application/msword',
  });
  const upload = vi.fn(() => Promise.resolve({ url: 'https://example.com/new.doc' }));

  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [
        {
          file: existingFile,
          status: 'done',
        },
      ],
      multiple: false,
      upload,
    },
  });

  const input = wrapper.find<HTMLInputElement>('.van-uploader__input');
  Object.defineProperty(input.element, 'files', {
    get: vi.fn().mockReturnValue([newFile]),
  });

  input.trigger('change');
  await later();
  await nextTick();

  const list = wrapper.emitted('update:modelValue')?.slice(-1)[0][0] as
    | UploaderFileListItem[]
    | undefined;
  expect(list).toHaveLength(1);
  expect(list?.[0]?.file).toBe(newFile);
  expect(wrapper.find('.van-uploader-file__file-name').text()).toBe('new.doc');
  expect(upload).toHaveBeenCalledTimes(1);
});

test('should render description and file list', () => {
  const wrapper = mount(UploaderFile, {
    props: {
      description: ['说明一', '说明二'],
      modelValue: [
        {
          file: new File([new ArrayBuffer(100)], 'demo.doc'),
          status: 'done',
        },
      ] as UploaderFileListItem[],
    },
  });

  expect(wrapper.findAll('.van-uploader-file__desc')).toHaveLength(2);
  expect(wrapper.find('.van-uploader-file__file-name').text()).toBe('demo.doc');
  expect(wrapper.find('.van-uploader-file__upload .van-button__text').text()).toBe(
    '添加附件',
  );
  expect(wrapper.find('.van-icon-weapp-nav').exists()).toBe(true);
});

test('should upload file with promise and update status', async () => {
  const upload = vi.fn((item: UploaderFileListItem) =>
    Promise.resolve({ url: `https://example.com/${item.file?.name}` }),
  );

  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [],
      upload,
    },
  });

  const input = wrapper.find<HTMLInputElement>('.van-uploader__input');
  Object.defineProperty(input.element, 'files', {
    get: vi.fn().mockReturnValue([mockFile]),
  });

  input.trigger('change');
  await nextTick();

  expect(upload).toHaveBeenCalled();
  let list = wrapper.emitted('update:modelValue')?.slice(-1)[0][0] as
    | UploaderFileListItem[]
    | undefined;
  expect(list?.[0]?.status).toBe('uploading');
  expect(list?.[0]?.message).toBe(UPLOADER_FILE_STATUS_TEXTS.uploading);

  await later();
  await nextTick();

  list = wrapper.emitted('update:modelValue')?.slice(-1)[0][0] as
    | UploaderFileListItem[]
    | undefined;
  expect(list?.[0]?.status).toBe('done');
  expect(list?.[0]?.message).toBe('');
  expect(
    wrapper.find('.van-uploader-file__file-status--done span').text(),
  ).toBe('100B');
  expect(list?.[0]?.url).toBe('https://example.com/test.doc');
});

test('should set failed status when upload promise rejects', async () => {
  const upload = vi.fn(() => Promise.reject(new Error('网络异常')));

  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [],
      upload,
    },
  });

  const input = wrapper.find<HTMLInputElement>('.van-uploader__input');
  Object.defineProperty(input.element, 'files', {
    get: vi.fn().mockReturnValue([failFile]),
  });

  input.trigger('change');
  await later();
  await nextTick();

  const list = wrapper.emitted('update:modelValue')?.slice(-1)[0][0] as
    | UploaderFileListItem[]
    | undefined;
  expect(list?.[0]?.status).toBe('failed');
  expect(list?.[0]?.message).toBe('网络异常');
});

test('should retry upload when click reupload on failed item', async () => {
  const upload = vi
    .fn()
    .mockResolvedValue({ url: 'https://example.com/retry.doc' });

  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [
        {
          file: failFile,
          status: 'failed',
          message: '上传失败',
        },
      ],
      upload,
    },
  });

  expect(wrapper.find('.van-uploader-file__reupload').exists()).toBe(true);
  expect(wrapper.find('.van-icon-clear').exists()).toBe(true);

  await wrapper.find('.van-uploader-file__reupload').trigger('click');
  await later();
  await nextTick();

  expect(upload).toHaveBeenCalled();
  const list = wrapper.emitted('update:modelValue')?.slice(-1)[0][0] as
    | UploaderFileListItem[]
    | undefined;
  expect(list?.[0]?.status).toBe('done');
  expect(list?.[0]?.url).toBe('https://example.com/retry.doc');
});

test('should show delete icon when uploading', async () => {
  const upload = vi.fn(
    () => new Promise(() => {
      /* keep pending */
    }),
  );

  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [],
      upload,
    },
  });

  const input = wrapper.find<HTMLInputElement>('.van-uploader__input');
  Object.defineProperty(input.element, 'files', {
    get: vi.fn().mockReturnValue([mockFile]),
  });

  input.trigger('change');
  await later();
  await nextTick();

  expect(wrapper.find('.van-uploader-file__delete').exists()).toBe(true);
  expect(
    wrapper.find('.van-uploader-file__file-status').text(),
  ).toContain(UPLOADER_FILE_STATUS_TEXTS.uploading);
});

test('should delete file when click delete icon', async () => {
  const file: UploaderFileListItem = {
    file: { name: 'remove.doc' } as File,
    status: '',
  };
  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [file],
    },
  });

  await wrapper.find('.van-uploader-file__delete').trigger('click');
  await nextTick();

  expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([]);
  expect(wrapper.emitted('delete')?.[0]?.[0]).toEqual(file);
});

test('should open action sheet when click menu on done item', async () => {
  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [
        {
          file: { name: 'done.doc' } as File,
          status: 'done',
          url: 'https://example.com/done.doc',
        },
      ],
    },
    attachTo: document.body,
  });

  await wrapper.find('.van-uploader-file__menu').trigger('click');
  await nextTick();

  expect(document.body.querySelector('.van-action-sheet')).toBeTruthy();
  wrapper.unmount();
});

test('should keep upload button visible and toast when max count exceeded', async () => {
  const existingFile = new File([new ArrayBuffer(100)], 'existing.doc', {
    type: 'application/msword',
  });

  const wrapper = mount(UploaderFile, {
    props: {
      modelValue: [
        { file: existingFile, status: 'done' },
        { file: mockFile, status: 'done' },
      ],
      maxCount: 2,
    },
  });

  expect(wrapper.find('.van-uploader-file__upload').isVisible()).toBe(true);

  await wrapper.find('.van-uploader__input-wrapper').trigger('click');
  await nextTick();

  expect(showToast).toHaveBeenCalledWith(
    UPLOADER_FILE_ACTION_TEXTS.maxCountExceeded(2),
  );
  expect(wrapper.emitted('update:modelValue')).toBeUndefined();
});
