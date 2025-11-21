# 解决 VS Code 自动格式化 Jekyll/Liquid 模板的问题

## 问题描述

在编辑 Jekyll/Liquid 模板（HTML 文件）时，VS Code 的自动格式化功能会在保存时自动添加空格，导致 Liquid 语法错误。

**错误示例**：
```html
<!-- 保存前（正确） -->
href="{{"/teaching/template.pdf" | relative_url }}"

<!-- 保存后（错误 - 自动添加了空格） -->
href="{{ " /teaching/template.pdf" | relative_url }}"
       ↑ 这个空格会导致 URL 错误
```

## 解决方案

### 1. VS Code 配置文件

已创建 `.vscode/settings.json` 文件，配置如下：

```json
{
  // 禁用 HTML 文件的自动格式化
  "[html]": {
    "editor.formatOnSave": false,
    "editor.formatOnPaste": false,
    "editor.formatOnType": false
  },
  
  // 禁用 Prettier 对 HTML 文件的格式化
  "prettier.disableLanguages": ["html"],
  
  // 禁用 HTML 格式化
  "html.format.enable": false
}
```

### 2. Prettier 忽略文件

`.prettierignore` 文件已配置为忽略所有 HTML 文件：

```
*.html
_layouts/*.html
_includes/*.html
```

### 3. 已修复的文件

所有 HTML 文件中的空格问题已被修复：
- ✅ `teaching.html`
- ✅ `research.html`
- ✅ `personal.html`
- ✅ `index.html`
- ✅ `404.html`
- ✅ `_layouts/default.html`
- ✅ `_includes/breadcrumb.html`

## 使用说明

### 现在可以安全地保存文件了

1. **按 Ctrl+S 保存** - 不会再自动添加空格
2. **粘贴代码** - 不会自动格式化
3. **输入代码** - 不会自动格式化

### 如果需要手动格式化

如果您确实需要格式化某个 HTML 文件：

1. 右键点击文件
2. 选择 "Format Document With..."
3. 选择您想要的格式化工具

**注意**：不建议格式化包含 Jekyll/Liquid 语法的 HTML 文件。

### 其他文件类型

其他文件类型（JavaScript、CSS、JSON、Markdown）仍然会自动格式化，这不会影响它们。

## 验证配置

重新加载 VS Code 窗口以确保配置生效：

1. 按 `Ctrl+Shift+P`（或 `Cmd+Shift+P` on Mac）
2. 输入 "Reload Window"
3. 选择 "Developer: Reload Window"

或者直接关闭并重新打开 VS Code。

## 正确的 Liquid 语法

### ✅ 正确写法

```html
href="{{"/path/to/file" | relative_url }}"
src="{{"/image/photo.jpg" | relative_url }}"
```

### ❌ 错误写法

```html
href="{{ "/path/to/file" | relative_url }}"
     ↑ 不要有空格

href="{{" /path/to/file" | relative_url }}"
       ↑ 不要有空格
```

## 故障排除

如果保存后仍然自动添加空格：

1. **检查 VS Code 设置**
   - 打开设置（Ctrl+,）
   - 搜索 "format on save"
   - 确保 HTML 的 "Format On Save" 已禁用

2. **检查扩展**
   - 禁用可能干扰的扩展（如 Beautify、HTML Format 等）
   - 只保留 Prettier 扩展

3. **检查用户设置**
   - 确保用户级别的设置没有覆盖项目设置
   - 项目设置优先级更高

4. **重启 VS Code**
   - 完全关闭 VS Code
   - 重新打开项目

## 总结

✅ 已配置 VS Code 禁用 HTML 自动格式化
✅ 已配置 Prettier 忽略 HTML 文件
✅ 已修复所有现有文件中的空格问题
✅ 现在可以安全地编辑和保存 HTML 文件了

现在您可以放心地编辑 HTML 文件，不用担心空格会被自动添加回来！
