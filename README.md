# rickylixi.github.io

Personal academic site built with Jekyll, featuring modern web performance, SEO optimization, and offline support.

## ✨ Features

- **Performance Optimized**: PurgeCSS, lazy loading, Service Worker caching
- **SEO Optimized**: Structured data, Open Graph, Twitter Cards, sitemap
- **Offline Support**: Service Worker with offline page and caching strategies
- **Responsive Design**: Mobile-first, accessible, dark mode support
- **Analytics**: GA4 integration
- **Modern Build**: Automated CI/CD with Lighthouse performance testing

## 🛠️ Prerequisites

- **Ruby**: 3.x (check with `ruby -v`)
- **Node.js**: 22+ (check with `node -v`)
- **Bundler**: Latest version (`gem install bundler`)

## 🚀 Quick Start

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd rickylixi.github.io
   ```

2. **Install dependencies**:
   ```bash
   bundle install
   npm ci
   ```

3. **Build assets**:
   ```bash
   npm run build
   ```

4. **Start development server**:
   ```bash
   bundle exec jekyll serve --livereload
   ```

5. **Open browser**: http://localhost:4000

## 📦 Build for Production

```bash
# Build CSS with PurgeCSS optimization
npm run build

# Build Jekyll site
bundle exec jekyll build

# Or build everything
npm run build && bundle exec jekyll build
```

## 🖼️ Image Optimization

Convert images to modern formats (WebP, AVIF):

```bash
# Optimize all images in image/ directory
node scripts/convert-images.js \
  --src=image \
  --out=image/optimized \
  --formats=webp,avif

# Single image
node scripts/convert-images.js \
  --src=image/photo.png \
  --out=image/optimized \
  --formats=webp,avif
```

## 🔍 Performance Testing

### Run Lighthouse CI locally:

```bash
npm install -g @lhci/cli@0.12.x
lhci autorun
```

### Performance budgets (see `.github/lighthouse-budget.json`):

- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 3s
- **Speed Index**: < 3s
- **Time to Interactive**: < 5s

## 🚀 CI/CD & Automation

### GitHub Actions Workflows:

1. **Deploy** (`.github/workflows/deploy.yml`):
   - Triggers on push to main/master
   - Builds site and deploys to GitHub Pages
   - Runs Lighthouse CI

2. **Lighthouse CI** (`.github/workflows/lighthouse.yml`):
   - Performance testing on every PR
   - Uploads results as artifacts
   - Enforces performance budgets

### Manual Deployment:

```bash
# Build and deploy to GitHub Pages
npm run build
git add .
git commit -m "Deploy updates"
git push origin main
```

## 📊 Analytics

### Google Analytics 4:
- Measurement ID: `G-GNJD50R0Z7`
- Configured with IP anonymization

## 🔧 Configuration Files

- **`_config.yml`**: Jekyll configuration
- **`build.js`**: CSS build pipeline with PurgeCSS
- **`package.json`**: Node.js dependencies and scripts
- **`Gemfile`**: Ruby dependencies
- **`sw.js`**: Service Worker for offline support

## 🐛 Troubleshooting

### Cache Issues:

```bash
# Clear Jekyll cache
bundle exec jekyll clean

# Reset Service Worker
# 1. Open DevTools > Application > Clear Storage
# 2. Unregister Service Worker
# 3. Reload page
```

### Build Errors:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm ci

# Rebuild everything
npm run build && bundle exec jekyll clean && bundle exec jekyll build
```

## 📝 Content Management

### Adding Blog Posts:

Create file in `_posts/` with format: `YYYY-MM-DD-title.md`

```yaml
---
layout: post
title: "Your Post Title"
date: 2025-01-15
tags: [tag1, tag2]
description: "Brief description"
---

Your content here...
```

### Adding Research Papers:

Update `_data/research.yml` with new publication details.

### Adding Books:

Update `_data/books.yml` with fiction and science book recommendations.

## 🎯 Performance Optimizations Implemented

- ✅ PurgeCSS removes unused styles (30-50% reduction)
- ✅ Images lazy loaded with `loading="lazy"`
- ✅ Google Fonts with `display=swap`
- ✅ Minified CSS and JS
- ✅ Optimized images (WebP, AVIF formats)
- ✅ Service Worker caching strategies
- ✅ Gzip compression enabled

## 📚 References

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## ✉️ Contact

- **Email**: xieshenlixi@163.com
- **Twitter**: [@rickylixi](https://twitter.com/rickylixi)
- **GitHub**: [rickylixi](https://github.com/rickylixi)

---

**Last Updated**: 2025-01-15
**Version**: 2.0.0
**Status**: ✅ Production Ready
