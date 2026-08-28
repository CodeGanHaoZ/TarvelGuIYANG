# AI 黔驴 · 贵州旅行规划 Demo

基于用户提供的 **AI黔驴 PRD（2026-08-28）** 与 **DESIGN_PARADIGM** 实现。桌面为侧栏、时间轴、地图工作台；手机为四个底部入口及上地图、下行程布局。

## 技术栈

- Vite 8 + TypeScript 5.9 + React 19。
- 使用 Sites 生成的 Vinext 路由外壳与 Cloudflare Worker 构建；底层开发服务器、HMR、打包均为 Vite，并非 Next.js 构建器。
- shadcn / Base UI 提供按钮、输入框、进度条和对话框可访问性基础。
- 本地 Mock 数据与规则服务，不需要 API Key，不包含数据库、支付或真实内容抓取。
- localStorage 保存本机行程；按需启用 Service Worker 页面资源缓存。

## 启动

建议 Node.js 22.13+（测试命令需要支持 TypeScript strip 的版本）与 pnpm。

```sh
pnpm install
pnpm dev
```

开发地址以终端输出为准，本次默认 `http://localhost:3000/`。

### 本工作区 Windows 运行方式

当前系统没有全局 npm/node，使用 Codex 提供的 Node。依赖已安装，`pnpm-workspace.yaml` 明确禁止 esbuild、sharp、workerd 的安装脚本；本项目没有放开安装脚本策略，也没有运行这些安装脚本，使用已分发的平台二进制。已安装的可用 CLI 可以直接启动：

```powershell
powershell -File scripts/dev.ps1
```

此命令只运行项目的开发服务器，不修改系统策略或安装权限。如果你使用自己安装的 Node，可直接运行 `node_modules/.bin/vinext.cmd dev`。如重新安装受到依赖策略阻止，应由环境管理员审核，不能通过修改依赖版本规避。

## 检查与构建

```sh
pnpm typecheck
pnpm test
pnpm lint
pnpm build
pnpm start
```

本工作区可用 `node_modules/.bin/tsc.cmd --noEmit`、`node_modules/.bin/oxlint.cmd`、`node_modules/.bin/vinext.cmd build`，测试为 `node --experimental-strip-types --test tests/travel.test.mjs`。这些命令需先把可用 Node 添加到 PATH。

## 首页社交灵感与轮播（新增）

- 首页提供 2 条可播放 MP4 演示短片、3 篇可阅读图文，使用虚构的抖音/小红书账号、互动数与内容。视频由现有风景图合成，配中文分镜字幕，不冒充真实平台视频。
- 点“AI 整理”可处理单篇，也可勾选多篇加入灵感篮后合并。Mock 规则按样例分镜提取地点、合并重复项、保留来源与时间码。
- 路线草稿支持地图点位联动、增删、上下调序、偏好推荐和手动搜索。进入定制后选择日期、预算与节奏，生成后继续沿用原有行程编辑。
- 社交内容、今日景区推荐和六类主题均为单行横向轮播；支持触摸滑动、触控板、左右箭头以及轨道聚焦后的方向键/Home/End；不自动轮播。
- 本轮无新增运行时依赖；`scripts/create-demo-videos.py` 仅供重新生成视频素材，所用 imageio-ffmpeg 为临时制作工具，不参与网站运行。

## 建议演示流程

新增 C / D：点击社交卡片标题或“阅读完整笔记/打开视频内容页”，进入独立的 `/inspiration/:id` 页面。可收藏为规划素材，日后在“我的 → 规划素材”重新定制；生成的行程在“概览”保留来源。地点推荐指数改为六类模型，展开评分依据可查看每个因子、品类特征和权重；详情可模拟天气、拥挤或闭园。分数均为 Mock，不代表官方评价或安全许可。

1. 首页粘贴 `https://www.xiaohongshu.com/explore/qianlv-demo`，点击生成攻略。支持的社交域名**统一返回贵阳样例，不抓取实际链接**；也可输入“甲秀楼、贵州省博物馆”。
2. 删除不想去的地点，创建旅行；选择日期、人数、预算、主题与节奏，查看四阶段生成状态。
3. 行程页切换日期；点击点位或卡片；拖动排序、上下移动、修改停留、删除、添加；查看营业时间冲突提示。
4. 打开优化路线，比较模拟时长和距离；打开天气变化，确认前后路线后应用，再试撤销。
5. 打开费用，新增一笔支出，查看谁应补给谁；在游记写下感受并导出攻略。
6. 发布约伴后在发现页查看，尝试收藏、复制及“一起玩”。全部只保存在当前浏览器。
7. 我的页面切换五套主题和三种图标表现，查看本机旅行和收藏，准备离线资源。

## 目录

```text
app/page.tsx               页面入口
app/travel-app.tsx         页面、交互编排与设备本地状态
app/globals.css            主题 tokens、桌面及移动布局
components/trip-wizard.tsx 三步创建与生成状态
components/route-map.tsx   可选择、缩放和平移的示意地图
components/place-detail.tsx 地点详情与评分解释
components/travel-icons.tsx 可切换的图标组件
lib/travel.ts              数据模型、样例 POI、规划/优化/费用/解析规则
public/sw.js               按需页面缓存，无上传行为
tests/travel.test.mjs      规则测试
docs/requirements.md      PRD 功能映射与验收条件
docs/architecture.md      数据、接口接入与演示边界
docs/design.md            视觉规范落地说明
```

## 演示边界

- 地图坐标为近似值，底图和连线为示意，不是高德/百度地图，不提供真实导航。
- 评分、天气、开放、交通、价格和工坊为样例；无实时数据。门票价格仅展示，酒店/班次等未知信息显示“待补充”。
- 生成与动态调整为确定性规则；不连接大模型。预算仅约束样例门票/体验，不保证住宿、交通后总费用可行。
- 发现发布、收藏与申请在本机演示，不会公开、不联系任何真实用户。
- 离线缓存只针对当前设备页面与访问资源。开发服务器的开发模块可能依赖网络，应在生产版本验证离线；恢复网络不进行云端同步。
- 风景摄影仅作 Demo 参考，来源列于“我的 → 关于这个 Demo”；公开商业发布前需替换授权素材。`public/og.png` 是 AI 生成的品牌画面，不代表真实地点摄影。
- 未绑定 GitHub 仓库：当前没有远程地址，GitHub 连接调用失败；没有向任何 GitHub 仓库推送。

开发原始参考文件保持不变，未复制到公开目录。
