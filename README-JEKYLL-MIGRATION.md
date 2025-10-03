Migration summary

What I did:

- Moved the Jekyll source from `my-jekyll-site/` into the repository root: `_config.yml`, `_posts/`, `_layouts/`, `_includes/`, `assets/`, `pages/`, `Gemfile`, etc.
- Added `blog.html` (a Jekyll template that lists posts using `site.posts`).
- Merged Google Analytics (Universal + GA4) into `_includes/head_custom.html` and included it in `_includes/head.html`.
- Updated `.github/workflows/static.yml` to build the Jekyll site from the repository root and deploy `_site` to GitHub Pages.
- Backed up original static HTML files into `site-backup/`.

Remaining manual step (recommended):

- Remove the `my-jekyll-site/` directory locally if you are satisfied with the migration:

```bash
cd /path/to/repo
rm -rf my-jekyll-site
```

- Then run a local build to verify everything:

```bash
gem install bundler
bundle install
bundle exec jekyll build --destination _site
# or preview
bundle exec jekyll serve
```

If you want me to also create a git commit message file or actually run git operations, tell me and I will prepare the exact git commands to execute locally.