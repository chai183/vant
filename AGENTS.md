## 项目说明

1. 此项目是二次开发vant资组件库，packages是我们开发的二次组件库，biz-app是我们后续要开发的移动端业务，放到这里是为了方便二次组件库的调试
2. packages中的digital-workfoce是pc端业务，biz-app是我们开发的移动端，移动端业务逻辑后续是参考digital-workfoce的，不要改动digital-workfoce的代码
3. biz-app中使用的组件库是我们二次开发的组件库，后续到内网中，这个二次组件库会发布到内网npm中，我们直接安装即可，目前在这里是为了方便调试
4. 后续如果组件不支持，需要修改vant组件库，要提前说明，组件修改就是修改packages/vant中的代码

## biz-app项目说明

- 保持目录结构清晰，遵循现有目录规范
- 同一个业务逻辑的代码和资源应当被收拢到一起，避免在不同的目录间来回跳跃
- `src/services/api`、`src/mock/mockApi`、`src/locales/{zh,en}`、`src/types` 的目录结构均与 `src/pages` 保持一致，便于按模块定位

### Mock 策略

- 开发环境默认 `VITE_USE_MOCK=true`，由 `vite-plugin-mock` 自动扫描 `src/mock/mockApi` 目录
- `utils.ts`、`entity.ts`、`data.ts` 为辅助文件，不会被当作路由定义扫描
- 关闭 Mock（`VITE_USE_MOCK=false`）时，请求通过 Vite 代理转发到 `mock-server`（`localhost:3001`）
- 后端统一响应格式：`{ body, errorCode, errorMsg }`，成功时 `errorCode` 为 `null` 或 `000000`

## biz-app项目规定

1. 页面级配置项放在 `@api/{module}/config.ts` 中定义
2. 接口请求函数放在 `@api/{module}/index.ts` 中，通过 `src/services/api.ts` 封装的 `apiClient` 发起请求；要处理返参时用 `async/await`，不要 `.then`
3. 接口返参转换放 `@api/{module}/entity.ts`：失败给空兜底（`[]` / `{}` / `{ records: [], total: 0 }` / `0`），boolean 成功则回传原值，不要编造业务数据
4. Mock 路由定义放在 `src/mock/mockApi/{module}/index.ts`，模拟数据放 `data.ts`，Mock 处理逻辑放 mock 目录的 `entity.ts`
5. 共享类型放在 `src/types/{module}/index.ts`，组件类型放 `src/types/_components/{ComponentName}/`
6. 全局通用组件从 `@/_components/` 导入，接口从 `@/services/api` 下导入，类型从 `@/types/` 导入
7. css中不允许出现important,:deep,:global等选择器，style中是要加scoped的
8. vue单页面结构，template script style 记住此顺序
9. vue文件中使用less编写，不要sass,scss
10. **自定义 class 用短横线 `-` 连接，禁止 BEM 的 `__`**（如 `info-change-detail-main`，不要 `info-change-detail__main`）；选择 Element 内部结构时出现的 `__`（如 `.el-tabs__header`）除外
11. 代码中禁止出现「内外网」「内网」「外网」等文案（含注释、界面文案、文档说明）；描述环境或组件差异时改用中性表述（如「兼容扩展组件」「目标环境」）

## biz-app开发要求

1. 本人 ts 小白，尽量在不报错的情况下减少 ts 类型声明
2. 组件中按照模块 panel 进行拆分，尽量保持组件的单一职责，同一区域的代码尽量放在一起
3. 尽量补充注释，方便他人阅读；`index.vue` 中额外在 panel 上下方添加注释，方便快速定位 panel 位置，格式为 `/*----模块名start----*/` `/*----模块名end----*/`，其中模块名就是 panel 的职责；定义的变量、`computed` 算出的变量上一行也要写注释；`pages` 文件名小驼峰，`_components` 组件文件夹大驼峰，**自定义 class 用 `-`、不要 `__`**
4. `index.vue` 中如果有一些简单的方法处理，可以写一个 `utils` 的对象，把方法放在里面，方便快速定位和复用
5. 不要过度提取方法、变量；`ref` / `useTemplateRef` 写在用到它的逻辑上方，不要全部堆在文件最上面；尽量不用 `try/catch`，弹窗取消用 `then` 的第二个回调收结果
6. 写mock的时候不要对mock数据做类似于查询条件的处理，只做mock数据的返回，mock数据是模拟后端返回的数据，不是用来做查询条件的
7. 多维组织的组织架构、职位页面中，不要增加自增 `requestId`、请求序号、前后参数比较等异步响应过滤逻辑，保持请求和赋值流程直接清晰
8. 接口接收数据要有空兜底，保证页面不报错；boolean 返回后端对应的 true / false，不要写成假数据

## 解析图片要求

1. 拍摄的图片大概率比较模糊，仔细分析
2. 如果解析的图片是接口传参，要对应生成type类型
3. 如果解析的图片是接口返参，要生成对应的type，并且生成对应的Mock数据
4. 如果解析的图片是蓝湖中页面图片，要解析出对应的结构，拆分成合适的组件（弹窗，详情抽屉等），如果是包含列表的，要判断适不适合使用Request组件
5. 不要对element的组件有特殊的样式处理，例如dialog，下拉，表格，按钮，表单，alert等，如果是组件本身支持设置class，style外置配置的，可以合适扩展
6. 如果截图的内容是交互说明，阅读交互逻辑，修改对应模块逻辑
7. 解析接口时，要对应记录在模块-接口文档中，对应说明接口的作用，入参\返回值，字段是否必填，返回值的意义
