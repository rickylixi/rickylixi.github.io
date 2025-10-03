# Blog — add posts & preview locally

This folder contains the Jekyll source for the blog. Only files inside `blog/` are processed by the CI workflow; the repository root remains unchanged.

Quick guide — add a post

- Create a file in `blog/_posts/` with the filename format: `YYYY-MM-DD-your-title.md`.
- Required front matter (example):

```yaml
---
layout: post
title: "My new post"
date: 2025-10-03 09:00:00 +0800
categories: blog
tags: [notes]
---
```

- Write content in Markdown below the front matter. Use `{{ '/path' | relative_url }}` in templates to make links/assets compatible with `baseurl: "/blog"`.

Preview locally (recommended)

1. From the repository root, build the blog into `_site/blog`:

```bash
cd blog
# if you use bundler/Gemfile
gem install bundler
bundle install
# build the blog into ../_site/blog
bundle exec jekyll build --source . --destination ../_site/blog
```

2. Copy root static files into `_site` (optional; the workflow does this for CI). From the repo root:

```bash
rsync -a --exclude='_site' --exclude='blog' ./ _site/
```

3. Serve the generated `_site` to preview the combined site (root pages + blog):

```bash
cd _site
python3 -m http.server 4000
# Open http://localhost:4000/blog/ in your browser
```

Notes and tips

- If you prefer to preview only the blog, you can `cd blog` and run `bundle exec jekyll serve` (but be careful with `baseurl`).
- Put blog-specific assets under `blog/assets/` (they will be copied into `_site/blog/assets/` when built). If you reference shared assets in the repo root, use absolute or `relative_url` helpers.
- When ready, commit your new post to `main` and push — the `build-blog.yml` Actions workflow will build the blog and deploy the combined `_site`.

If you want, I can add a small post template or a GitHub issue/PR template to streamline new post creation.
