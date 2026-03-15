# HTTP Security Headers Configuration

This document provides security headers configuration for rickylixi.github.io.

## For GitHub Pages (Current Setup)

GitHub Pages does not support custom security headers directly. Options:

### Option 1: Use Cloudflare Pages (Recommended)

1. **Setup Cloudflare**:
   - Add your domain to Cloudflare
   - Update DNS to point to Cloudflare
   - Enable "Always Use HTTPS"

2. **Configure Transform Rules**:
   - Go to **Rules** > **Transform Rules** > **Modify Response Header**
   - Add the following headers:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net https://tikzjax.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://dtiivkyoieucoqkivfha.supabase.co https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### Option 2: Use Netlify

If deploying to Netlify, create `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net https://tikzjax.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://dtiivkyoieucoqkivfha.supabase.co https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Cache-Control = "public, max-age=3600"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000"

[[headers]]
  for = "/image/*"
  [headers.values]
    Cache-Control = "public, max-age=604800"
```

### Option 3: Use Vercel

If deploying to Vercel, create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://cdn.jsdelivr.net https://tikzjax.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://dtiivkyoieucoqkivfha.supabase.co https://www.googletagmanager.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

## Header Explanations

### Content-Security-Policy (CSP)

Restricts resource loading to prevent XSS attacks:

- `default-src 'self'`: Only load from same origin by default
- `script-src`: Allow inline scripts, Google Analytics, MathJax, TikZJax
- `style-src`: Allow inline styles and Google Fonts
- `font-src`: Allow Google Fonts
- `img-src`: Allow images from same origin, data URIs, and HTTPS
- `connect-src`: Allow API calls to Supabase and Google Analytics
- `frame-ancestors 'none'`: Prevent clickjacking
- `base-uri 'self'`: Restrict base tag
- `form-action 'self'`: Restrict form submissions

### X-Content-Type-Options

Prevents MIME type sniffing:
- `nosniff`: Browser must respect declared content type

### X-Frame-Options

Prevents clickjacking:
- `DENY`: Page cannot be embedded in any frame

### X-XSS-Protection

Legacy XSS protection (for older browsers):
- `1; mode=block`: Enable and block suspected XSS

### Referrer-Policy

Controls referrer information:
- `strict-origin-when-cross-origin`: Send full URL for same-origin, origin only for cross-origin

### Permissions-Policy

Restricts browser features:
- Disables camera, microphone, geolocation, payment, USB, magnetometer, gyroscope

### Strict-Transport-Security (HSTS)

Enforces HTTPS:
- `max-age=31536000`: 1 year
- `includeSubDomains`: Apply to all subdomains
- `preload`: Allow browser preload lists

## Testing Security Headers

Use these tools to verify headers:

1. **Security Headers** (https://securityheaders.com/)
   - Scan your domain
   - Should achieve A+ rating

2. **Mozilla Observatory** (https://observatory.mozilla.org/)
   - Comprehensive security scan
   - Check for CSP, HSTS, etc.

3. **CSP Evaluator** (https://csp-evaluator.withgoogle.com/)
   - Analyze CSP effectiveness
   - Identify potential bypasses

## Current GitHub Pages Status

⚠️ **Current Setup**: Using GitHub Pages without security headers

**Recommendation**: Migrate to Cloudflare Pages or Netlify for full security header support.

## Implementation Priority

1. **High**: Migrate to Cloudflare Pages and configure headers
2. **Medium**: Review and tighten CSP based on actual site requirements
3. **Low**: Set up monitoring for header effectiveness

## Related Files

- `_config.yml`: Supabase API configuration
- `sw.js`: Service Worker (already uses secure contexts)
- `assets/js/visitor-counter.js`: API calls (already rate-limited)

## References

- [OWASP Secure Headers Project](https://owasp.org/www-project-secure-headers/)
- [MDN Security Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers#security_headers)
- [CSP Guide](https://content-security-policy.com/)
