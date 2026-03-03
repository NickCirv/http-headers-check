# http-headers-check

Audit HTTP response headers for security, caching, and best practices. Zero dependencies, pure Node.js.

```
hcheck https://github.com

════════════════════════════════════════════════════════════
  HTTP HEADERS AUDIT — https://github.com
════════════════════════════════════════════════════════════
  Status: 200 OK

  SECURITY HEADER AUDIT
────────────────────────────────────────────────────────────
  ✓  Content-Security-Policy
  ✓  Strict-Transport-Security (HSTS)
  ✓  X-Frame-Options
  ✓  X-Content-Type-Options
  ⚠  Referrer-Policy
  ✗  Permissions-Policy
  ✓  X-XSS-Protection
────────────────────────────────────────────────────────────
  Score: 72/90   Grade: B

  CACHING HEADERS
────────────────────────────────────────────────────────────
  cache-control              no-cache
  etag                       W/"abc123"
  vary                       Accept-Encoding

  ALL RESPONSE HEADERS
────────────────────────────────────────────────────────────
  content-security-policy              default-src 'none'; ...
  strict-transport-security            max-age=31536000; includ...
  x-frame-options                      deny
  x-content-type-options               nosniff
  referrer-policy                      origin-when-cross-origin
  cache-control                        no-cache
  ...
```

## Install

```bash
npm install -g http-headers-check
```

Or run without installing:

```bash
npx http-headers-check https://example.com
```

## Usage

```
hcheck <url> [options]
hcheck compare <url1> <url2>
```

### Options

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON |
| `--follow` | Follow redirect chain, show each hop |
| `--verbose, -v` | Show full header values and recommendations |
| `--help, -h` | Show help |

### Examples

```bash
# Basic audit
hcheck https://example.com

# Verbose — full header values + fix recommendations
hcheck https://example.com --verbose

# JSON output (pipe to jq, save to file, etc.)
hcheck https://example.com --json | jq '.security.grade'

# Follow and show redirect chain
hcheck https://example.com --follow

# Side-by-side comparison of two URLs
hcheck compare https://site-a.com https://site-b.com

# Both aliases work
http-headers-check https://example.com
hcheck https://example.com
```

## Security Headers Checked

| Header | Weight | What It Does |
|--------|--------|-------------|
| Content-Security-Policy | 20pts | Prevents XSS attacks |
| Strict-Transport-Security | 20pts | Forces HTTPS (HSTS) |
| X-Frame-Options | 15pts | Prevents clickjacking |
| X-Content-Type-Options | 10pts | Stops MIME sniffing |
| Referrer-Policy | 10pts | Controls referrer data leakage |
| Permissions-Policy | 10pts | Restricts browser feature access |
| X-XSS-Protection | 5pts | Legacy XSS filter (IE/Edge) |

## Security Grades

| Grade | Score | Meaning |
|-------|-------|---------|
| A | 90–100% | Excellent security posture |
| B | 75–89% | Good, minor improvements possible |
| C | 60–74% | Fair, some headers missing |
| D | 40–59% | Poor, significant gaps |
| F | 0–39% | Critical, needs immediate attention |

## Features

- **Security audit** — checks 7 headers, scores each, gives A–F grade
- **Caching analysis** — Cache-Control, ETag, Last-Modified, Expires, Vary
- **CORS detection** — shows all Access-Control-* headers
- **Redirect chain** — `--follow` traces each redirect hop with status codes
- **Side-by-side compare** — diff two URLs' headers in columns
- **JSON output** — machine-readable, pipe-friendly
- **Color coding** — green = security headers, magenta = cache, yellow = CORS
- **NO_COLOR support** — respects `NO_COLOR` env var and non-TTY environments

## Requirements

- Node.js 18+
- Zero npm dependencies — uses only built-in `https`, `http`, `url` modules

## License

MIT
