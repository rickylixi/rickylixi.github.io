# 网站代码审计报告 2026-06-04

## 🔴 高优先级（功能缺陷/错误）

### 1. `_config.yml` logo 路径拼写错误
- **文件**: `_config.yml` 第 8 行
- **问题**: `logo: "/image/optimzed/ai-xi.avif"` — `optimzed` 少了一个 `i`，正确目录名是 `optimized`
- **影响**: jekyll-seo-tag 生成的 OG:Image 标签指向 404 路径，社交分享无预览图
- **修复**: 改为 `logo: "/image/optimized/ai-xi.avif"`

### 2. `styles.css` 与 inline critical CSS 变量值不一致
- **文件**: `default.html` 第 16-21 行 vs `styles.css` 第 2-19 行
- **问题**: inline CSS 的 `--font-sans` 值末尾少了 `, "Helvetica Neue"`（拼写也有差异：`Neue` vs `Neue`）
- **影响**: 无 JS 环境下（或 CSS 加载前）字体回退栈不一致
- **修复**: 使 inline CSS 变量与 `styles.css` 完全一致

---

## 🟡 中优先级（死代码/废弃配置）

### 3. `_config.yml` 废弃的 `theme_settings` 段
- **文件**: `_config.yml` 第 134-144 行
- **问题**: `theme_settings` 不是 Jekyll 标准配置键，且值与 `styles.css` 实际使用的变量不一致（如 `max_width: "800px"` 但 CSS 用 `1200px`）
- **影响**: 无人读取，造成维护困惑
- **修复**: 删除整个 `theme_settings:` 段，或改为注释说明

### 4. `_config.yml` 废弃的 `api_timeout` 配置
- **文件**: `_config.yml` 第 150 行
- **问题**: `api_timeout: 8000` 没有任何 Jekyll 插件或模板读取此值（`visitor-counter.js` 有自己的 `REQUEST_TIMEOUT_MS` 常量）
- **影响**: 死配置
- **修复**: 删除

### 5. `_config.yml` 引用不存在的文件
- **文件**: `_config.yml` 第 40 行
- **问题**: `exclude: ["_config_sitemap.yml"]` — 文件不存在（实际 sitemap 配置已内联在 `sitemap:` 段）
- **影响**: 无害但误导
- **修复**: 删除此行

### 6. `sw.js` 声明但未使用的 `OFFLINE_CACHE` 常量
- **文件**: `sw.js` 第 7 行
- **问题**: `const OFFLINE_CACHE = 'rickylixi-offline';` 从未被引用
- **修复**: 删除

### 7. `sw.js` 无用的 Push Notification 代码
- **文件**: `sw.js` 第 254-292 行
- **问题**: 注册了 `push` / `notificationclick` 事件处理器，但全站没有任何地方调用 `Notification.requestPermission()` 或 `registration.showNotification()`
- **影响**: 死代码，SW 体积不必要增大
- **修复**: 删除（或保留但要实现订阅机制）

### 8. `sw.js` 空的 Background Sync 处理器
- **文件**: `sw.js` 第 242-251 行
- **问题**: `sync` 事件处理器只返回 `Promise.resolve()`，什么都没做
- **修复**: 删除或实现真正的离线同步

### 9. `_data/teaching.yml` 残留的 `size:` 字段
- **文件**: `_data/teaching.yml` 第 7, 13, 16, 19, 27, 33, 36, 46 行
- **问题**: 上次修复已删除模板中的 `{{ resource.size }}` 渲染逻辑，但 yml 数据里的 `size:` 字段未清理
- **影响**: 无害但增加文件体积、造成维护困惑
- **修复**: 删除所有 `size:` 行

---

## 🟢 低优先级（代码质量/规范）

### 10. `sw.js` `substr()` 已废弃
- **文件**: `sw.js` 第 36 行
- **问题**: `new Date().toISOString().substr(11, 8)` — `substr()` 已从 ECMAScript 移除
- **修复**: 改为 `substring(11, 19)` 或 `slice(11, 19)`
- **注意**: 此行在 `DEBUG_SERVICE_WORKER = false` 分支内，实际不会执行

### 11. `package.json` `"main"` 字段指向错误
- **文件**: `package.json` 第 5 行
- **问题**: `"main": "sw.js"` — `sw.js` 不是 npm 包的主入口
- **修复**: 删除此字段或改为合理值

### 12. `default.html` inline critical CSS 中的 CSS 变量声明方式
- **文件**: `default.html` 第 15-22 行
- **问题**: `:root { ... }` 在 `<style>` 标签内设置变量，但 `styles.min.css` 加载后 `:root` 的变量声明会被覆盖（因为 `styles.min.css` 也定义了 `:root`）。实际上因为 CSS 层叠规则，后加载的样式表优先级相同但后定义的值会覆盖先定义的，所以 inline `:root` 变量会被 external CSS 覆盖——这是正确的行为。但 inline CSS 的 `margin: 0; padding: 0;` 在 `*` 选择器中可能被重置。
- **评估**: 当前行为正确，但 inline CSS 与 `styles.css` 的同步维护是隐患

---

## ✅ 无问题的部分

- **SEO**: `jekyll-seo-tag` + 手动 `seo-meta.html` + Schema.org JSON-LD 覆盖完整
- **无障碍**: ARIA 属性、`sr-only`、`aria-pressed`、`role` 使用正确
- **主题切换**: dark/light 模式切换逻辑正确，localStorage + 系统偏好检测完整
- **Service Worker**: 缓存策略（networkFirst / cacheFirst / staleWhileRevalidate）设计合理
- **Build pipeline**: PurgeCSS + LightningCSS + hash 缓存破坏，流程正确
- **Lighthouse CI**: 配置合理（4 个页面，3 次采样）
- **Guestbook**: Supabase 后端集成、XSS 防护、频率限制、honeypot 反垃圾完整
- **Accordion**: ARIA 状态管理正确，MathJax 延迟加载正确
