# 编辑叙事滚卷（editorial-scroll）· 使用说明

## 语言

网站呈现给用户的语言应跟随用户 query 的语言。本仓库是中文版（zh-CN）；同一模板另有一个英文版，通常就放在本仓库旁边（`en/editorial-scroll`）。如果用户使用英文，可以换用英文版仓库，或把 `src/config/` 里的文案整体翻译成目标语言。

## 开始之前：先问用户

动手之前，先用 ask_user 工具问用户几个问题，再决定怎么做：

1. **是否需要把网页变成全栈应用？** 也就是是否需要持久化的数据存储：现在的站点是纯静态的，全部内容写死在 `src/config/` 里，刷新即还原。如果用户希望内容可以在线编辑、采集记录能投稿保存、多人共享数据或接后台管理，就需要加服务端和数据库，把配置内容迁到持久化存储里。
2. **主题与品牌**：沿用「栖岫｜东方山水与造物档案」的山水档案主题，还是换成用户自己的品牌与主题？这套「逐段展开的档案叙事」结构可以装很多内容：杂志专题、摄影集、茶与器物品牌、展览导览、风物志、课程讲义等。
3. **配色**：保留宣纸暖白 + 墨 + 朱砂的现有色板，还是换一套？配色集中在 `src/config/settings.ts` 的 `theme` 七个色值里，改一处全站生效。
4. **内容**：四个篇章、三处地貌标记、一件器物标本、四则四时记录，是替换成用户的真实内容，还是先保留示例？图片按 `src/config/` 里的 `/media/` 路径替换即可。

如果用户不回答任何问题，就直接加载默认网站文件（`dist/` 是构建好的静态产物，原样托管即可）。

可选：如果符合用户的需求，你可以使用图像和视频生成工具。

## 这个网站是什么

一个配置驱动的沉浸式中文编辑叙事站点：竖排短标题、宣纸材质、朱砂点缀、山水图谱、器物标本与开放式采集记录，组织成六段滚动阅读（入卷 / 山水 / 图志 / 器物 / 四时 / 跋）。篇章与四时记录各有二级「卷页」，用 query URL 打开（`/?chapter=<id>`、`/?record=<id>`）；Esc、页内返回按钮与浏览器返回键都会回到原阅读位置。对静态托管完全友好，不需要路由依赖或 SPA fallback。

文件结构：

```
index.html              入口 HTML（字体、meta、favicon）
package.json            scripts：dev / build / check / lint / test / test:e2e
vite.config.ts          base: './'（产物可用相对路径部署）
tsconfig.json 等        TypeScript 配置
eslint.config.js        lint 配置
public/
  fonts/                霞鹜文楷 Lite 的 OFL 许可文件
  media/                config 引用的 /media/*.png 图片放在这里
src/
  main.tsx / App.tsx    应用入口与组装
  config/               ★ 站点配置：入口、章节、须知、文案、配色、动效开关
  types.ts              配置的类型定义
  lib/validateConfig.ts 配置校验（数量范围、媒体路径、alt 必填、标记安全区）
  lib/navigateToHash.ts 锚点导航
  hooks/                useDetailRoute（query 路由）、useScrollFrame、useReveal
  components/           HeroSection、ChapterIndex、LandscapeAtlasSection、
                        SpecimenSection、RecordsSection、ColophonSection、
                        DetailPage、components/detail/*、ArchiveChrome、Seal、SafeImage
  styles/               tokens.css（色板/字阶/缓动）+ base / chrome /
                        sections / detail / motion / responsive
tests/
  validateConfig.test.ts 配置契约单测
  e2e/matrix.mjs          桌面 / 移动 / 减弱动效 / 二级卷页的端到端检查
dist/                   预构建的静态产物，可直接部署
```

用户可能的改造方向：换内容（主要编辑 `src/config/`）、换图（替换 `public/media/`）、调配色（`src/config/settings.ts` 的 `theme`）、增减篇章或记录（保持在 3–6 个之间，`validateConfig` 会守住契约）、或按上面的全栈问题加服务端。如果用户只是想看看这个网站，直接加载即可，不必改动任何东西。

## 技术速记

- React 19 + TypeScript + Vite 7，无路由库。二级卷页是 `useDetailRoute` 用 History API 维护的 query 参数状态，打开时记住滚动位置与焦点元素，关闭时恢复；未知 id 走 `detailMissing` 兜底文案。
- 内容是数据不是代码：整站文案、图片、配色、动效开关都在 `src/config/`，类型契约在 `src/types.ts` 与 `src/lib/validateConfig.ts`（篇章/记录 3–6 个、媒体必须 `/media/` 或绝对 http(s) URL、alt 必填、地貌标记限制在图片安全区内）。
- 动效：IntersectionObserver 驱动的段落 reveal 与滚动进度；`document.documentElement.dataset.motion` 区分 full / reduced（尊重 prefers-reduced-motion）；`config.motion` 的四个开关经由 `.site-shell` 的 data 属性控制对应 CSS 动画。
- 样式：纯 CSS custom properties，色板、字阶与缓动集中定义在 `src/styles/tokens.css`；侧边竖排导航用 `writing-mode: vertical-rl`；`SafeImage` 组件在图片缺失时给出可读兜底。
- 字体：打包霞鹜文楷 Lite 的 WOFF2 文字子集，其他字体使用系统回退。原始 TTF 在 `assets/fonts/`，不会复制到部署目录。编辑文案后执行 `npm run fonts`；首次生成需 `python -m pip install -r scripts/requirements-fonts.txt`。
- 改完内容先跑 `npm run check && npm test`；交付前 `npm run build && npm run test:e2e`。已包含 `playwright-core`；浏览器检查需要 Chrome/Chromium，也可通过 `CHROME_BIN` 指定路径。
- 细节直接读代码：组装看 `src/App.tsx`，配置入口看 `src/config/index.ts`，路由看 `src/hooks/useDetailRoute.ts`，二级卷页组装看 `src/components/DetailPage.tsx`，章节详情看 `src/components/detail/ChapterDetail.tsx`，记录详情看 `src/components/detail/RecordDetail.tsx`，滚动编排看 `src/hooks/useScrollFrame.ts`。
