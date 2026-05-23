# SEO 全面审计报告 — rickylixi.github.io

**站点**: https://rickylixi.github.io  
**生成时间**: 2026-05-23  
**审计人**: Marketing SEO Specialist

---

## 执行摘要

本站是中南大学逻辑学副教授李熙（Xi Li）的个人学术网站，基于 Jekyll + GitHub Pages 构建，已具备相当好的 SEO 基础（sitemap、jekyll-seo-tag、结构化数据、GA4），但在**关键词布局、内容深度、外链生态、用户体验**等方面仍有较大提升空间。

**综合 SEO 健康评分：63 / 100**

| 维度 | 得分 | 状态 |
|------|------|------|
| 技术 SEO | 75/100 | 良好，有待微调 |
| 页面内容优化 | 55/100 | 内容较薄，需增厚 |
| 关键词策略 | 40/100 | 缺乏系统布局 |
| 外链与权威度 | 45/100 | 基础薄弱 |
| 用户体验 & CWV | 70/100 | 良好 |
| 结构化数据 | 80/100 | 基本完善 |

---

## 一、技术 SEO 审计

### ✅ 已做好的部分

1. **Jekyll-sitemap 插件** — 自动生成 sitemap.xml，robots.txt 已声明 Sitemap 路径
2. **Jekyll-seo-tag** — 自动注入 title/description/og/twitter 标签
3. **robots.txt** 设置合理，正确屏蔽 /_includes/、/_layouts/ 等非公开路径
4. **GA4 集成** (G-GNJD50R0Z7) — 具备数据分析基础
5. **PWA / Service Worker** — 有离线缓存，提升返访体验
6. **图片格式** — 使用 AVIF/WebP，性能优先
7. **HTML lang 属性** — `lang="zh-Hans"` 已声明（注意：英文内容为主，见下方建议）
8. **Schema.org Person 结构化数据** — 涵盖 affiliation、alumniOf、knowsAbout 等关键字段
9. **Google Search Console** 验证已配置（meta + HTML 文件双重验证）
10. **DNS prefetch / preconnect** — GTM 连接已预加载

### ❌ 需要修复的问题

#### 问题 1：lang 属性与实际内容语言不符（高优先级）
```html
<!-- 当前 -->
<html lang="zh-Hans">

<!-- 建议：网站以英文内容为主，应改为 -->
<html lang="en">

<!-- 如果确实是中英双语，考虑为每个页面单独设置 lang -->
```
**影响**：Google 用语言标记判断内容语言，错误的 lang 属性可能导致搜索引擎误判内容目标市场，影响英文搜索排名。

#### 问题 2：缺少 hreflang 标签（中优先级）
网站混合了中英文内容（publications 有中文摘要，teaching 有中文描述），但没有 hreflang 实现国际化 SEO。
```html
<!-- 建议在 head 中添加 -->
<link rel="alternate" hreflang="en" href="https://rickylixi.github.io/" />
<link rel="alternate" hreflang="zh-Hans" href="https://rickylixi.github.io/" />
<link rel="alternate" hreflang="x-default" href="https://rickylixi.github.io/" />
```

#### 问题 3：Blog 文章缺少 last_modified_at（中优先级）
当前博客文章 front matter 只有 `date`，没有 `last_modified_at`。Google 对更新时间有明确关注，structured data 中的 `dateModified` 会 fallback 到发布日期。

#### 问题 4：sitemap changefreq 策略可以更精细（低优先级）
```yaml
# 当前全局配置
sitemap:
  changefreq: monthly
  priority: 0.8

# 建议按页面类型差异化配置
# 首页: weekly, 1.0
# research/teaching: monthly, 0.9  
# blog posts: monthly, 0.7
# personal/guestbook: yearly, 0.5
```

#### 问题 5：缺少 canonical 自引用标签的验证（低优先级）
虽然 jekyll-seo-tag 会自动添加 canonical，需确认生成的 canonical URL 格式一致（https, 无 trailing slash 或统一有 trailing slash）。

---

## 二、页面内容优化

### 首页 (index.html)

**现状分析**：
- 内容极度精简（仅 ~150 字英文）
- 缺少目标关键词的自然融入
- 没有 H2 结构层次
- 研究兴趣用列表呈现，但没有深度描述

**关键词机会**：
| 关键词 | 月搜索量（估计） | 难度 | 机会 |
|--------|----------------|------|------|
| Kolmogorov complexity philosophy | 300-500 | 低 | 高 |
| Solomonoff induction tutorial | 200-400 | 低 | 高 |
| causal inference reinforcement learning | 2,000-5,000 | 中 | 高 |
| universal AI philosophy | 500-1,000 | 低 | 高 |
| AI philosophy professor China | 100-300 | 低 | 高 |
| 通用人工智能哲学 | 1,000-3,000 | 中 | 高 |
| 因果推断 强化学习 | 3,000-8,000 | 中高 | 中 |

**建议改写方向**：
```markdown
## 现有版本（仅约150字）
I am an Associate Professor... [研究兴趣列表]

## 建议增强版（500-800字）
- 开头段落自然融入核心关键词："Kolmogorov complexity", "Solomonoff induction", "causal inference"
- 增加"Research Philosophy"段落，阐述研究方法论
- 增加"Recent Work"板块，指向最新论文
- 增加"Contact"板块，提升 E-E-A-T 信号
- 增加结构化的 H2 标题
```

### Research 页 (research.html)

**现状**：有论文列表和摘要，但 H1 使用"Some Publications"（含"Some"显得不确定，不利于 SEO）

**建议**：
- H1 改为 `Publications & Research` 或 `Academic Publications by Xi Li`
- 每篇论文增加关键词标签 (目前已有 bibtex keywords 但未展示到页面)
- 增加"研究方向概述"段落，500字以上，自然覆盖关键词
- 考虑为每篇论文创建独立的详情页（长期规划）

### Teaching 页 (teaching.html)

**现状**：数据驱动渲染，内容质量取决于 teaching.yml

**建议**：
- 增加课程概述段落
- 针对"Mathematical Logic course", "Philosophy of AI course" 等关键词优化
- 因果读书会可以单独成页，关键词潜力巨大（因果推断 + 读书会 + 中南大学）

### Blog 文章

**现状**：只有 4 篇，均为技术演示（Markdown、LaTeX 用法）

**严重不足**：没有与研究领域相关的深度内容文章

**关键词内容缺口（最高价值机会）**：

| 文章主题 | 目标关键词 | 预估流量潜力 |
|---------|-----------|------------|
| Kolmogorov Complexity 入门 | kolmogorov complexity explained | 高 |
| Solomonoff 归纳与奥卡姆剃刀 | solomonoff induction occam's razor | 高 |
| 因果推断 vs 相关性 | causal inference vs correlation | 极高 |
| AIXI 通用智能模型解读 | AIXI universal intelligence | 高 |
| 莱布尼茨与 AI 哲学 | leibniz philosophy artificial intelligence | 中 |
| 决策论与纽康姆问题 | newcomb's problem decision theory | 中 |
| 通用强化学习基础 | universal reinforcement learning | 高 |

---

## 三、关键词策略

### 主要目标受众分群

1. **英文学术圈**（Google Scholar 用户）
   - 搜索：研究者名、论文关键词、学术概念
   - 意图：了解研究成果、引用参考
   
2. **中文学术圈**（知网、百度学术用户）
   - 搜索：中文论文标题、作者名、研究领域
   - 意图：引用文献、学习了解
   
3. **AI/哲学爱好者**（Google、百度用户）
   - 搜索：Solomonoff 归纳、Kolmogorov 复杂度、AI 哲学
   - 意图：学习了解前沿概念
   
4. **大学生/研究生**（国内用户）
   - 搜索：因果推断课程、数理逻辑教材、中南大学哲学
   - 意图：找学习资料、了解教授背景

### 关键词优先级矩阵

```
高搜索量 + 低竞争（甜蜜区）：
  - "kolmogorov complexity philosophy" [EN]
  - "solomonoff induction machine learning" [EN]  
  - "通用人工智能 哲学基础" [CN]
  - "因果强化学习" [CN]
  
高搜索量 + 中竞争：
  - "causal inference reinforcement learning tutorial" [EN]
  - "AI alignment philosophy" [EN]
  - "AI哲学课程" [CN]
  
长尾词（立即可排名）：
  - "xi li logician central south university" [EN]
  - "李熙 逻辑学 中南大学" [CN]
  - "newcomb's problem AIXI" [EN]
  - "lawvere fixpoint theorem applications" [EN]
```

### Topic Cluster 架构建议

```
主题簇 1：Algorithmic Information Theory
  Pillar: "Kolmogorov Complexity & Solomonoff Induction: A Complete Guide"
  Cluster:
    - Why Does Occam's Razor Work? A Formal Proof
    - Solomonoff Induction vs Bayesian Inference
    - From Complexity to Universal AI: AIXI Explained
    
主题簇 2：Causal AI & Decision Theory  
  Pillar: "Causal Inference for AI: From Correlation to Causation"
  Cluster:
    - Newcomb's Problem & Universal Intelligence
    - Causal Reinforcement Learning Foundations
    - Do-Calculus for Philosophers
    
主题簇 3：Philosophy of Artificial Intelligence
  Pillar: "Philosophy of AI: A Rigorous Introduction"  
  Cluster:
    - Leibniz and Modern AI: Historical Connections
    - Machine Consciousness: Logic and Cognitive Perspectives
    - Ethics of Universal Reinforcement Learning
```

---

## 四、结构化数据增强

### 当前状态评估

| Schema 类型 | 当前状态 | 建议 |
|------------|---------|------|
| Person | ✅ 已实现，较完整 | 增加 `awards`、`memberOf` |
| BlogPosting | ✅ 已实现 | 增加 `wordCount`、`articleSection` |
| Course | ❌ 缺失 | 为 teaching 页添加 Course schema |
| ScholarlyArticle | ❌ 缺失 | 为每篇论文添加 ScholarlyArticle schema |
| BreadcrumbList | ✅ 有 breadcrumb.html | 确认 schema 正确生成 |
| FAQ | ❌ 缺失 | 可为研究方向页添加 FAQ |
| Organization | ❌ 缺失 | 添加 CSU 的 Organization schema |

### Course Schema 示例（添加到 teaching 页）
```json
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Philosophy of Artificial Intelligence",
  "description": "A rigorous introduction to the philosophical foundations of AI, covering topics from Kolmogorov complexity to universal reinforcement learning.",
  "provider": {
    "@type": "CollegeOrUniversity",
    "name": "Central South University",
    "url": "https://www.csu.edu.cn/"
  },
  "instructor": {
    "@type": "Person",
    "name": "Xi Li",
    "url": "https://rickylixi.github.io/"
  }
}
```

### ScholarlyArticle Schema 示例（添加到每篇论文）
```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "Some Applications of Lawvere's Fixpoint Theorem",
  "author": {"@type": "Person", "name": "Xi Li"},
  "datePublished": "2019",
  "isPartOf": {"@type": "Periodical", "name": "Frontiers of Philosophy in China"},
  "keywords": ["fixpoint theorem", "Lawvere", "diagonalization", "category theory"]
}
```

---

## 五、外链建设策略

### 当前外链状态

网站作为个人学术主页，主要依赖：
- 论文期刊外链（被引用时产生）
- GitHub profile 的反向链接
- 知乎主页链接

### 高价值外链获取路径

#### 1. 学术社区 Profile（立即可做，零成本）
- [ ] Google Scholar Profile（验证并完善）—— 极高权重
- [ ] Academia.edu 页面
- [ ] ResearchGate Profile
- [ ] ORCID ID（0000-xxxx-xxxx-xxxx 格式，可提升 Person schema 权威性）
- [ ] PhilPapers 收录（哲学论文重要收录平台）
- [ ] 中南大学官网教师主页（如有）— 高权重 EDU 域名反链
- [ ] CNKI 作者主页完善

#### 2. 内容外链（中期，3-6个月）
- 为 Solomonoff/Kolmogorov 相关 Wikipedia 词条贡献内容并适当引用
- 向 SEP（Stanford Encyclopedia of Philosophy）投稿或联系编辑引用相关论文
- 在 Less Wrong、PhilSE（Philosophy Stack Exchange）等社区回答相关问题并自然引用自己的研究

#### 3. 学术引用增长（长期）
- 将论文 preprint 上传到 arXiv（如尚未上传）
- 上传到 PhilPapers 并完善页面
- 通过博客文章增加科普触达，吸引二次引用

---

## 六、用户体验 & Core Web Vitals

### 预估 CWV 状态

| 指标 | 预估状态 | 建议 |
|------|---------|------|
| LCP | 良好（AVIF图片 + 无大型JS阻塞）| 监控 Inter 字体加载 |
| INP | 良好（页面交互简单）| 注意 accordion JS |
| CLS | 待监测（需确认图片尺寸声明）| 为所有图片声明 width/height |

### 图片 CLS 修复
```html
<!-- 当前（可能引发 CLS）-->
<img src="..." alt="Turing machine illustration" class="responsive-img">

<!-- 建议（声明尺寸防止 CLS）-->
<img src="..." alt="Turing machine illustration" width="800" height="450" class="responsive-img">
```

### 字体加载优化
Inter 字体使用了 `onload` 异步加载，这是好的实践。但建议同时添加 `font-display: swap` 指令（通常在 Google Fonts URL 中加 `&display=swap` 已实现）。

---

## 七、内容更新与发布策略

### 90天内容路线图

**第1个月（技术修复 + 首批内容）**
- [ ] 修复 `lang` 属性
- [ ] 为图片添加尺寸声明
- [ ] 发布：《Kolmogorov Complexity: An Introduction for Philosophers》（英文，2000字+）
- [ ] 发布：《通用人工智能的哲学基础：从所罗门诺夫到 AIXI》（中文，2000字+）
- [ ] 完善 Google Scholar Profile
- [ ] 注册 ORCID 并嵌入 Person schema

**第2个月（关键词覆盖 + 外链启动）**
- [ ] 发布：《Why Causal Inference Matters for AI Safety》（英文）
- [ ] 发布：《纽康姆问题与因果决策理论》（中文）
- [ ] Research 页增加"研究方向概述"长段落
- [ ] 在 PhilPapers 上传/关联论文
- [ ] 向中南大学官网申请教师主页外链

**第3个月（内容集群 + 流量转化）**
- [ ] 完成主题簇1（算法信息论）的至少3篇文章
- [ ] Teaching 页增加 Course Schema
- [ ] 研究页为每篇论文添加 ScholarlyArticle Schema
- [ ] 启动因果读书会独立页面

---

## 八、SEO 监控建议

### 必须追踪的核心指标

1. **Google Search Console（已配置）**
   - 每周查看：Total clicks、Total impressions、Average CTR、Average position
   - 关注：Coverage issues（Index coverage 报告）
   - 关注：Core Web Vitals 报告

2. **排名追踪（建议工具：Ahrefs Free / Google Search Console）**
   - 目标关键词：至少追踪 20 个核心词的排名变化

3. **有机流量趋势（GA4）**
   - 分离 Branded（搜索"Xi Li"、"李熙"）vs Non-branded 流量
   - 分析 Landing Page 报告（哪些页面带来搜索流量）

4. **外链监控（Ahrefs Site Explorer / Google Search Console Links 报告）**
   - 追踪新增 referring domains

---

## 九、优先行动清单

### P0 — 本周内完成（1-3小时）
- [ ] **修改 `_layouts/default.html`** 中 `<html lang="zh-Hans">` 为 `<html lang="en">`（或按内容分页设置）
- [ ] **Google Scholar Profile** 创建/完善，确保网站链接可见
- [ ] 在 Search Console 提交 sitemap，检查 Index Coverage

### P1 — 本月内完成（需要内容创作）
- [ ] **写一篇英文深度博文**，主题选择"Kolmogorov Complexity"或"Solomonoff Induction"
- [ ] **首页 index.html 扩写**，从 150 字增加到 600+ 字，自然融入关键词
- [ ] **Research 页 H1 优化**，"Some Publications" → "Publications & Research"
- [ ] **图片加 width/height 属性**（修复 CLS）
- [ ] **注册 ORCID**，更新 Person schema 中加入 `sameAs: "https://orcid.org/xxx"`

### P2 — 季度目标（持续执行）
- [ ] 每月发布 2 篇以上 SEO 优化的博客文章
- [ ] 建立 Topic Cluster 内容架构
- [ ] 完善 Course 和 ScholarlyArticle Schema
- [ ] 在学术社区建立外链矩阵

---

## 附录：当前 SEO 资产盘点

| 资产 | 状态 | 质量评分 |
|------|------|---------|
| Jekyll sitemap | ✅ 正常 | 8/10 |
| robots.txt | ✅ 正常 | 8/10 |
| Person Schema | ✅ 完整 | 9/10 |
| GA4 集成 | ✅ 正常 | 8/10 |
| GSC 验证 | ✅ 已验证 | 10/10 |
| Bing 验证 | ✅ 已验证 | 10/10 |
| Yandex 验证 | ✅ 已验证 | 10/10 |
| Open Graph 标签 | ✅ 正常 | 8/10 |
| Twitter Card | ✅ 正常 | 8/10 |
| 图片优化 (AVIF/WebP) | ✅ 优秀 | 10/10 |
| 页面加载速度 | ✅ 良好 | 8/10 |
| 移动端适配 | ✅ 响应式 | 8/10 |
| HTTPS | ✅ GitHub Pages 自带 | 10/10 |
| 博客内容量 | ❌ 严重不足（4篇） | 2/10 |
| 关键词覆盖 | ❌ 系统缺失 | 3/10 |
| 外链profile | ❌ 基础薄弱 | 3/10 |

---

*报告生成于 2026-05-23 | 下次审计建议时间：2026-08-23*
