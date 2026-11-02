# ApplyFlow · 造物集产品素材

交付日期：2026-11-02。正式图标沿用远端 `594946947787a072082f193b0549b9942b05cba3` 的 `icons/brand.svg`；宣传配色取自正式品牌与产品界面的紫色、薄荷绿。未调用生成或付费服务，所有引用均为仓库内相对路径。

| 文件 | 尺寸 | 用途 |
| --- | --- | --- |
| icon.svg | viewBox 256×256 | 正式矢量图标 |
| icon-512.png | 512×512 | 作品图标 |
| hero.webp | 1920×1200 | 首页展台 |
| card.webp | 1200×900 | 作品卡片 |
| mobile.webp | 900×1200 | 窄屏作品集展示，不代表手机安装 |
| detail-01.webp | 1920×1200 | 本地档案维护功能 |

![首页展台](hero.webp)

完整尺寸、SHA-256、中文 alt、用途、来源及功能边界见 [manifest.json](manifest.json)。

## 实际界面与边界

截图来自原工作区的 0.8.7 未提交开发版本，基线为 `8f1b052`，逐文件 SHA-256 与浏览器版本记录在 [source/ui-version.json](source/ui-version.json)。素材提交基于更新的远端品牌版本，不包含原工作区业务代码；不能将截图误认为此素材提交自带的已发布功能。原始截图保存在 captures/。

`source/capture.mjs` 在干净的 Edge 无头浏览器中运行原项目档案编辑器、原侧栏与真实 content 引擎。浏览器 API 用临时内存消息桥代替，招聘网页是项目 `tests/traditional-ats-fixture.html` 本地模拟夹具。身份替换为“示例同学”、无效号码 `00000000000`、示例大学，不访问真实账号、简历或招聘服务。档案编辑器的存储也是隔离内存，无个人数据。

实际扫描与写入由原引擎计算，没有预设结果数字或重画界面。此次填写 8 项，隐私声明保持未勾选，详见 [source/run-result.json](source/run-result.json)。图片中 1 分 20 秒为算法估算，并非真实用户节省时间的实测；桥接环境未持久化累计统计，因此累计栏不代表真实使用历史。没有自动提交申请。

本项目仍为 MVP、桌面 Edge 优先并尽量兼容 Chrome；未在本轮验证安装、后台生命周期、真实招聘网站兼容或商店上架。没有演示解析/导出结果，复杂排版、扫描件和未适配组件不能承诺支持。国际 ATS 存在已知字段映射缺口，不能宣传全站支持。

## 复现

在项目根安装 package-lock 对应依赖及 Microsoft Edge 后，运行：

```sh
node docs/portfolio-assets/source/render.mjs
node docs/portfolio-assets/source/verify.mjs
```

排版可直接从本次固定提交的原始 captures/ 重建，无需重新采集；四份 source/*.html 同时是可独立打开的排版源。生成器只使用本地文件与系统字体（此次为 Windows Microsoft YaHei），其他系统字体可能产生字形差异。验证脚本生成拼图并核对实际编码尺寸；SHA-256 在 manifest 中。

重新采集需准备与 ui-version.json 完全一致的原工作区 0.8.7 文件及其依赖后运行 `node docs/portfolio-assets/source/capture.mjs`，该开发工作区代码并未随素材提交公开，不能只用远端旧业务版本声称复现相同 UI。保留截图使正式排版本身可完整复现。

## 检查

已检查四张独立构图、完整尺寸、640px桌面展台、300px窄屏展示以及32/40px图标在浅/深色底上的对比和裁切。图标文档与流向轮廓可辨，小尺寸内部文字线条为装饰，不承担阅读功能。窄屏截图为有意局部取景；底部正文明确标记桌面扩展与安装边界。参考 source/qa-preview.png。没有业务、部署、账号权限变更。
