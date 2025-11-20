# CDN 配置指南

本文档提供了为网站配置内容分发网络 (CDN) 的指南。

## 推荐的 CDN 服务

1. **Cloudflare** - 免费套餐提供 CDN、SSL 和 DDoS 保护
2. **jsDelivr** - 开源项目的免费 CDN
3. **GitHub Pages** - 内置 CDN 功能（当前使用中）

## 当前配置

网站目前使用 GitHub Pages，它已经提供了基本的 CDN 功能：
- 全球分布式网络
- 自动 SSL 证书
- DDoS 保护

## 优化建议

### 1. 静态资源 CDN
对于静态资源（CSS、JS、图片），可以考虑使用 jsDelivr：

```html
<!-- 示例：使用 jsDelivr 加载 jQuery -->
<script src="https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js"></script>
```

### 2. 字体 CDN
如果需要使用外部字体，可以使用 Google Fonts 或 Adobe Fonts：

```html
<!-- Google Fonts 示例 -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### 3. 图片优化 CDN
考虑使用图片优化 CDN 服务如:
- Cloudinary
- Imgix
- ImageKit

## 实施步骤

1. **评估需求**: 确定需要加速的内容类型
2. **选择服务**: 根据预算和需求选择合适的 CDN 提供商
3. **配置 DNS**: 将域名 CNAME 指向 CDN
4. **测试性能**: 使用工具如 PageSpeed Insights 测试优化效果

## 监控工具

- Google PageSpeed Insights
- WebPageTest
- GTmetrix
- Pingdom

## 注意事项

- 确保 CDN 配置不会影响 SEO
- 定期监控 CDN 性能和成本
- 设置适当的缓存策略
- 确保回源配置正确

当前网站已经具有良好的性能基础，CDN 配置是可选的进一步优化。
