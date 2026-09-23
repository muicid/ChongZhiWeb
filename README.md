# ChatGPT Plus 充值指南

基于 React、TypeScript 和 Vite 的配置驱动静态指南，包含四步操作教程、流程图、所需材料、常见问题及售后说明，采用宣纸与水墨视觉风格。

普通内容适配主要编辑 `src/config/` 和 `public/media/`。运行：`npm ci && npm run dev`。交付前执行 `npm run lint && npm run check && npm test && npm run build && npm run test:e2e`。

详情使用 query URL：`/?chapter=<id>` 与 `/?record=<id>`。页内返回按钮及 Esc 关闭整个详情序列并恢复原阅读位置与焦点；浏览器返回/前进按访问顺序浏览详情。直接打开的详情关闭后回到本页首页。

## 字体维护

线上使用约 115 KB 的 WOFF2 文字子集，原始 TTF 保留在 `assets/fonts/`，不会复制进 `dist/`。OFL 许可证保留在 `public/fonts/`。

修改站点文案后，生成并提交更新后的字体：

```sh
python -m pip install -r scripts/requirements-fonts.txt
npm run fonts
```

脚本扫描 `src/` 与 `index.html` 的文字，保留 ASCII 字符和站点用字。生成好的 WOFF2 随项目提供，普通安装和构建不需要 Python；未收录字符使用系统字体回退。

E2E 检查需要本机 Chrome/Chromium，或通过 `CHROME_BIN` 指定可执行文件。

完整使用契约见本仓库根目录的 `info.md`。
