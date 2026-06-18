<div align="center">

# http-headers-check

**Audit any URL's HTTP response headers for security posture, caching, and CORS — A–F graded, zero dependencies.**

[![License: MIT](https://img.shields.io/badge/license-MIT-blue?labelColor=0B0A09)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-brightgreen?labelColor=0B0A09)](package.json)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen?labelColor=0B0A09)](package.json)

</div>

## Install

```bash
npx github:NickCirv/http-headers-check https://example.com
```

Or install globally:

```bash
npm install -g github:NickCirv/http-headers-check
hcheck https://example.com
```

## Usage

```bash
hcheck <url> [options]
hcheck compare <url1> <url2>
```

| Flag | Description |
|------|-------------|
| `--json` | Output results as JSON |
| `--follow` | Follow and display redirect chain |
| `--verbose, -v` | Full header values + fix recommendations |
| `--help, -h` | Show help |

**Examples**

```bash
# Security audit with grade
hcheck https://example.com

# Verbose — full values + recommendations
hcheck https://example.com --verbose

# JSON output (pipe-friendly)
hcheck https://example.com --json | jq '.security.grade'

# Follow redirect chain
hcheck https://example.com --follow

# Side-by-side comparison
hcheck compare https://site-a.com https://site-b.com
```

## What it does

Fetches HTTP response headers via a `HEAD` request and audits them across three categories: security (7 headers scored and graded A–F), caching (Cache-Control, ETag, Last-Modified, Vary, etc.), and CORS. The `--follow` flag traces redirect chains hop by hop; `--compare` diffs two URLs side by side. Color-coded terminal output respects `NO_COLOR` and non-TTY environments. All output is also available as structured JSON.

---
<sub>Zero dependencies · Node ≥18 · MIT · by <a href="https://github.com/NickCirv">NickCirv</a></sub>
