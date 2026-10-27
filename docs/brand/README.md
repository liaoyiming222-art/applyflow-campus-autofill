# ApplyFlow 正式品牌素材

日期：2026-10-27。隔离副本源码基线8f1b052，manifest/package 0.7.8，加品牌改动。用户原目录的0.8.7功能修改未复制、覆盖或提交。母版为 `../../icons/brand.svg`，浏览器16/32/48/128与商店300/1024PNG由 `../../scripts/export-brand.mjs` 导出；侧栏、档案页和浮球共用这些品牌资产。

`before.jpg`、`after.jpg` 为1265×889浏览器原始JPEG，`review.jpg` 为1280×900。`sidebar.jpg` 为填写后实际右侧栏374×756采集局部；`before-sidebar.jpg` 与 `review-sidebar.jpg` 分别为扫描、人工检查状态的374×576实际采集局部。素材没有图像合成或UI重绘。姓名、号码、邮箱、院校与招聘组织均为项目测试数据或虚构场景，不会发送申请。`after.jpg`实际显示8项写入的成功样式；`review.jpg`保留招聘来源空白及待处理提示。1分10秒为原产品算法估算，不能称为实际节省时间测量。

从项目根目录运行 `node tools/brand-preview.mjs`，打开 `http://127.0.0.1:4199/`。工作台只读加载本项目sidepanel HTML/CSS/JS、shared/schema.js与content脚本；浏览器存储、活动标签和消息由内存桥替代，扫描与填写均由实际content listener计算，不返回预设的数量。点击“智能填写字段”后再点“查看待处理项”可复现。重置演示重新加载内存状态。服务只监听本机并显式限制可读文件，不读取profile或真实档案。

品牌界面已在本工作台实际查看；未验证扩展安装、商店发布、后台生命周期、真实招聘网站兼容或完整业务回归。图片SHA-256与观察值见 `verification.json`。

## 卡片与窄幅取景

[cover.jpg](cover.jpg)：860×680实际受控工作台的workspace范围实拍，少量虚构表单字段与助手状态并列；实际填写8项，未提交申请。 以实际图片尺寸与校验记录为准。
