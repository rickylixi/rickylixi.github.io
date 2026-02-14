# rickylixi.github.io

Personal academic site built with Jekyll.

## Prerequisites

- Ruby 3.x
- Bundler (matching `Gemfile.lock`)
- Node.js 22+

## Local development

1. Install Ruby gems:
   ```bash
   bundle install
   ```
2. Install Node dependencies:
   ```bash
   npm ci
   ```
3. Build CSS manifest:
   ```bash
   npm run build
   ```
4. Run Jekyll:
   ```bash
   bundle exec jekyll serve
   ```

## Build

```bash
npm run build
bundle exec jekyll build
```

## Image optimization

```bash
node scripts/convert-images.js --src=image --out=image/optimized --formats=webp,avif
```

## Notes

- Visitor counter and guestbook rely on Supabase APIs.
- For production hardening, enforce strict RLS and rate limits on Supabase side.
