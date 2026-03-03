#!/usr/bin/env node
import https from 'https';
import http from 'http';
import { URL } from 'url';

// ANSI color codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;
const c = (code, str) => NO_COLOR ? str : `${code}${str}${C.reset}`;

// Security headers definitions
const SECURITY_HEADERS = {
  'content-security-policy': {
    label: 'Content-Security-Policy',
    weight: 20,
    recommendation: "Add CSP to prevent XSS: Content-Security-Policy: default-src 'self'",
    validate: (v) => v.includes('default-src') || v.includes('script-src') ? 'pass' : 'warn',
    warnMsg: 'CSP present but missing default-src or script-src directive',
  },
  'strict-transport-security': {
    label: 'Strict-Transport-Security (HSTS)',
    weight: 20,
    recommendation: 'Add HSTS: Strict-Transport-Security: max-age=31536000; includeSubDomains',
    validate: (v) => {
      const maxAge = v.match(/max-age=(\d+)/i);
      if (!maxAge) return 'warn';
      return parseInt(maxAge[1]) >= 31536000 ? 'pass' : 'warn';
    },
    warnMsg: 'HSTS max-age should be at least 31536000 (1 year)',
  },
  'x-frame-options': {
    label: 'X-Frame-Options',
    weight: 15,
    recommendation: 'Add X-Frame-Options: DENY or SAMEORIGIN to prevent clickjacking',
    validate: (v) => ['deny', 'sameorigin'].includes(v.toLowerCase().trim()) ? 'pass' : 'warn',
    warnMsg: 'X-Frame-Options should be DENY or SAMEORIGIN',
  },
  'x-content-type-options': {
    label: 'X-Content-Type-Options',
    weight: 10,
    recommendation: 'Add X-Content-Type-Options: nosniff',
    validate: (v) => v.toLowerCase().trim() === 'nosniff' ? 'pass' : 'warn',
    warnMsg: 'X-Content-Type-Options should be nosniff',
  },
  'referrer-policy': {
    label: 'Referrer-Policy',
    weight: 10,
    recommendation: "Add Referrer-Policy: strict-origin-when-cross-origin",
    validate: (v) => {
      const safe = ['no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin', 'same-origin', 'strict-origin', 'strict-origin-when-cross-origin'];
      return safe.includes(v.toLowerCase().trim()) ? 'pass' : 'warn';
    },
    warnMsg: 'Referrer-Policy value is not a recognized safe policy',
  },
  'permissions-policy': {
    label: 'Permissions-Policy',
    weight: 10,
    recommendation: "Add Permissions-Policy to control browser feature access",
    validate: () => 'pass',
    warnMsg: '',
  },
  'x-xss-protection': {
    label: 'X-XSS-Protection',
    weight: 5,
    recommendation: 'Add X-XSS-Protection: 1; mode=block (legacy browsers)',
    validate: (v) => v.trim().startsWith('1') ? 'pass' : 'warn',
    warnMsg: 'X-XSS-Protection should be "1; mode=block"',
  },
};

// Caching headers
const CACHE_HEADERS = [
  'cache-control', 'etag', 'last-modified', 'expires', 'age', 'vary', 'pragma',
];

// CORS headers
const CORS_HEADERS = [
  'access-control-allow-origin', 'access-control-allow-methods',
  'access-control-allow-headers', 'access-control-allow-credentials',
  'access-control-max-age', 'access-control-expose-headers',
];

function gradeFromScore(score, max) {
  const pct = (score / max) * 100;
  if (pct >= 90) return { grade: 'A', color: C.green };
  if (pct >= 75) return { grade: 'B', color: C.cyan };
  if (pct >= 60) return { grade: 'C', color: C.yellow };
  if (pct >= 40) return { grade: 'D', color: C.red };
  return { grade: 'F', color: C.red };
}

function fetchHeaders(inputUrl, { follow = false, maxRedirects = 10 } = {}) {
  return new Promise((resolve, reject) => {
    const chain = [];

    function doRequest(urlStr, redirectsLeft) {
      let parsed;
      try {
        parsed = new URL(urlStr);
      } catch {
        return reject(new Error(`Invalid URL: ${urlStr}`));
      }

      const lib = parsed.protocol === 'https:' ? https : http;
      const options = {
        method: 'HEAD',
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        headers: {
          'User-Agent': 'http-headers-check/1.0.0 (https://github.com/NickCirv/http-headers-check)',
          'Accept': '*/*',
        },
        timeout: 10000,
      };

      const req = lib.request(options, (res) => {
        const entry = {
          url: urlStr,
          status: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
        };
        chain.push(entry);

        const isRedirect = [301, 302, 303, 307, 308].includes(res.statusCode);
        if (isRedirect && follow && res.headers.location && redirectsLeft > 0) {
          const next = new URL(res.headers.location, urlStr).toString();
          res.resume();
          doRequest(next, redirectsLeft - 1);
        } else {
          resolve({ chain, final: entry });
        }
      });

      req.on('timeout', () => {
        req.destroy(new Error(`Request timed out for ${urlStr}`));
      });
      req.on('error', reject);
      req.end();
    }

    doRequest(inputUrl, maxRedirects);
  });
}

function analyzeSecurityHeaders(headers) {
  const results = [];
  let score = 0;
  const maxScore = Object.values(SECURITY_HEADERS).reduce((a, h) => a + h.weight, 0);

  for (const [key, def] of Object.entries(SECURITY_HEADERS)) {
    const value = headers[key];
    if (!value) {
      results.push({ key, label: def.label, status: 'missing', value: null, weight: def.weight, recommendation: def.recommendation });
    } else {
      const validation = def.validate(value);
      if (validation === 'pass') {
        score += def.weight;
        results.push({ key, label: def.label, status: 'pass', value, weight: def.weight });
      } else {
        score += Math.floor(def.weight / 2);
        results.push({ key, label: def.label, status: 'warn', value, weight: def.weight, warnMsg: def.warnMsg });
      }
    }
  }

  const { grade, color } = gradeFromScore(score, maxScore);
  return { results, score, maxScore, grade, gradeColor: color };
}

function analyzeCacheHeaders(headers) {
  return CACHE_HEADERS.map(h => ({ key: h, value: headers[h] || null })).filter(h => h.value !== null);
}

function analyzeCorsHeaders(headers) {
  return CORS_HEADERS.map(h => ({ key: h, value: headers[h] || null })).filter(h => h.value !== null);
}

function printSeparator(char = '─', width = 60) {
  console.log(c(C.dim, char.repeat(width)));
}

function printHeader(title) {
  printSeparator('═');
  console.log(c(C.bold, `  ${title}`));
  printSeparator('═');
}

function statusIcon(status) {
  if (status === 'pass') return c(C.green, '✓');
  if (status === 'warn') return c(C.yellow, '⚠');
  return c(C.red, '✗');
}

function statusCodeColor(code) {
  if (code >= 200 && code < 300) return c(C.green, String(code));
  if (code >= 300 && code < 400) return c(C.cyan, String(code));
  if (code >= 400 && code < 500) return c(C.yellow, String(code));
  return c(C.red, String(code));
}

function printSecurityAudit(analysis, verbose) {
  console.log(`\n${c(C.bold + C.blue, '  SECURITY HEADER AUDIT')}`);
  printSeparator();

  for (const r of analysis.results) {
    const icon = statusIcon(r.status);
    const label = r.status === 'missing'
      ? c(C.dim, r.label)
      : r.label;
    console.log(`  ${icon}  ${label}`);
    if (verbose && r.status === 'pass' && r.value) {
      console.log(`       ${c(C.dim, r.value)}`);
    }
    if (r.status === 'warn' && r.warnMsg) {
      console.log(`       ${c(C.yellow, r.warnMsg)}`);
      if (verbose && r.value) console.log(`       ${c(C.dim, 'Value: ' + r.value)}`);
    }
    if (r.status === 'missing' && verbose && r.recommendation) {
      console.log(`       ${c(C.dim, r.recommendation)}`);
    }
  }

  printSeparator();
  const gc = analysis.gradeColor;
  console.log(`  Score: ${c(C.bold, `${analysis.score}/${analysis.maxScore}`)}   Grade: ${c(C.bold + gc, analysis.grade)}`);
}

function printCacheHeaders(cacheHeaders, verbose) {
  if (cacheHeaders.length === 0) return;
  console.log(`\n${c(C.bold + C.magenta, '  CACHING HEADERS')}`);
  printSeparator();
  for (const h of cacheHeaders) {
    const val = verbose ? h.value : (h.value.length > 60 ? h.value.slice(0, 57) + '...' : h.value);
    console.log(`  ${c(C.cyan, h.key.padEnd(25))}  ${val}`);
  }
}

function printCorsHeaders(corsHeaders, verbose) {
  if (corsHeaders.length === 0) return;
  console.log(`\n${c(C.bold + C.yellow, '  CORS HEADERS')}`);
  printSeparator();
  for (const h of corsHeaders) {
    const val = verbose ? h.value : (h.value.length > 60 ? h.value.slice(0, 57) + '...' : h.value);
    console.log(`  ${c(C.cyan, h.key.padEnd(40))}  ${val}`);
  }
}

function printAllHeaders(headers, verbose) {
  console.log(`\n${c(C.bold + C.white, '  ALL RESPONSE HEADERS')}`);
  printSeparator();
  const secKeys = new Set(Object.keys(SECURITY_HEADERS));
  const cacheKeys = new Set(CACHE_HEADERS);
  const corsKeys = new Set(CORS_HEADERS);

  for (const [key, val] of Object.entries(headers)) {
    let color = C.white;
    if (secKeys.has(key)) color = C.green;
    else if (cacheKeys.has(key)) color = C.magenta;
    else if (corsKeys.has(key)) color = C.yellow;
    const display = verbose ? val : (String(val).length > 70 ? String(val).slice(0, 67) + '...' : val);
    console.log(`  ${c(color, key.padEnd(35))}  ${c(C.dim, display)}`);
  }
}

function printRedirectChain(chain) {
  if (chain.length <= 1) return;
  console.log(`\n${c(C.bold + C.cyan, '  REDIRECT CHAIN')}`);
  printSeparator();
  chain.forEach((entry, i) => {
    const arrow = i < chain.length - 1 ? '  ↓' : '  ●';
    console.log(`  ${arrow} ${statusCodeColor(entry.status)} ${c(C.dim, entry.url)}`);
  });
}

function printSideBySide(url1, headers1, url2, headers2) {
  const allKeys = new Set([...Object.keys(headers1), ...Object.keys(headers2)]);
  const colW = 35;

  printHeader('SIDE-BY-SIDE COMPARISON');
  console.log(`  ${'Header'.padEnd(28)} ${'URL 1'.padEnd(colW)} ${'URL 2'.padEnd(colW)}`);
  printSeparator('─', 100);
  console.log(`  ${''.padEnd(28)} ${c(C.dim, url1.slice(0, colW - 2).padEnd(colW))} ${c(C.dim, url2.slice(0, colW - 2).padEnd(colW))}`);
  printSeparator('─', 100);

  for (const key of [...allKeys].sort()) {
    const v1 = headers1[key] ? String(headers1[key]).slice(0, colW - 2) : c(C.red, '(missing)');
    const v2 = headers2[key] ? String(headers2[key]).slice(0, colW - 2) : c(C.red, '(missing)');
    const match = headers1[key] === headers2[key] ? c(C.dim, '=') : c(C.yellow, '≠');
    console.log(`  ${match} ${key.padEnd(26)} ${v1.padEnd(colW)} ${v2.padEnd(colW)}`);
  }
}

function outputJson(result, url) {
  const { chain, final } = result;
  const security = analyzeSecurityHeaders(final.headers);
  const cache = analyzeCacheHeaders(final.headers);
  const cors = analyzeCorsHeaders(final.headers);

  const out = {
    url,
    finalUrl: final.url,
    status: final.status,
    statusMessage: final.statusMessage,
    redirectChain: chain.map(e => ({ url: e.url, status: e.status })),
    security: {
      score: security.score,
      maxScore: security.maxScore,
      grade: security.grade,
      headers: security.results.map(r => ({
        header: r.key,
        status: r.status,
        value: r.value || null,
        recommendation: r.recommendation || null,
        warning: r.warnMsg || null,
      })),
    },
    caching: cache,
    cors,
    allHeaders: final.headers,
  };

  console.log(JSON.stringify(out, null, 2));
}

function printHelp() {
  console.log(`
${c(C.bold, 'http-headers-check')} ${c(C.dim, 'v1.0.0')}
${c(C.dim, 'Audit HTTP response headers for security, caching, and best practices')}

${c(C.bold, 'USAGE')}
  hcheck <url> [options]
  hcheck compare <url1> <url2>

${c(C.bold, 'OPTIONS')}
  ${c(C.cyan, '--json')}          Output results as JSON
  ${c(C.cyan, '--follow')}        Follow redirect chain
  ${c(C.cyan, '--verbose, -v')}   Show full header values and recommendations
  ${c(C.cyan, '--help, -h')}      Show this help

${c(C.bold, 'EXAMPLES')}
  hcheck https://example.com
  hcheck https://example.com --verbose
  hcheck https://example.com --json
  hcheck https://example.com --follow
  hcheck compare https://site-a.com https://site-b.com

${c(C.bold, 'SECURITY GRADE')}
  ${c(C.green, 'A')} 90–100%  Excellent  ${c(C.cyan, 'B')} 75–89%   Good
  ${c(C.yellow, 'C')} 60–74%   Fair       ${c(C.red, 'D')} 40–59%   Poor
  ${c(C.red, 'F')} 0–39%    Critical
`);
}

// Main entry point
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const isJson = args.includes('--json');
  const follow = args.includes('--follow');
  const verbose = args.includes('--verbose') || args.includes('-v');
  const isCompare = args[0] === 'compare';

  if (isCompare) {
    const url1 = args[1];
    const url2 = args[2];
    if (!url1 || !url2) {
      console.error(c(C.red, 'Error: compare requires two URLs\n  hcheck compare <url1> <url2>'));
      process.exit(1);
    }

    let res1, res2;
    try {
      [res1, res2] = await Promise.all([
        fetchHeaders(url1, { follow }),
        fetchHeaders(url2, { follow }),
      ]);
    } catch (err) {
      console.error(c(C.red, `Error: ${err.message}`));
      process.exit(1);
    }

    if (isJson) {
      console.log(JSON.stringify({
        url1: { url: url1, status: res1.final.status, headers: res1.final.headers },
        url2: { url: url2, status: res2.final.status, headers: res2.final.headers },
      }, null, 2));
      return;
    }

    printSideBySide(url1, res1.final.headers, url2, res2.final.headers);

    const a1 = analyzeSecurityHeaders(res1.final.headers);
    const a2 = analyzeSecurityHeaders(res2.final.headers);
    console.log(`\n  Security Grades:`);
    console.log(`    ${c(C.dim, url1)}: ${c(C.bold + a1.gradeColor, a1.grade)} (${a1.score}/${a1.maxScore})`);
    console.log(`    ${c(C.dim, url2)}: ${c(C.bold + a2.gradeColor, a2.grade)} (${a2.score}/${a2.maxScore})`);
    console.log();
    return;
  }

  const url = args.find(a => !a.startsWith('-') && a !== 'compare');
  if (!url) {
    console.error(c(C.red, 'Error: No URL provided. Run hcheck --help for usage.'));
    process.exit(1);
  }

  if (isJson) {
    let result;
    try {
      result = await fetchHeaders(url, { follow });
    } catch (err) {
      console.error(JSON.stringify({ error: err.message, url }));
      process.exit(1);
    }
    outputJson(result, url);
    return;
  }

  let result;
  try {
    process.stdout.write(c(C.dim, `Fetching ${url} ...\r`));
    result = await fetchHeaders(url, { follow });
    process.stdout.write('                                                                \r');
  } catch (err) {
    console.error(c(C.red, `Error: ${err.message}`));
    process.exit(1);
  }

  const { chain, final } = result;

  printHeader(`HTTP HEADERS AUDIT — ${url}`);
  console.log(`  Status: ${statusCodeColor(final.status)} ${final.statusMessage}`);
  if (chain.length > 1) {
    console.log(`  Final URL: ${c(C.dim, final.url)}`);
  }

  if (follow && chain.length > 1) {
    printRedirectChain(chain);
  }

  const security = analyzeSecurityHeaders(final.headers);
  printSecurityAudit(security, verbose);

  const cache = analyzeCacheHeaders(final.headers);
  printCacheHeaders(cache, verbose);

  const cors = analyzeCorsHeaders(final.headers);
  printCorsHeaders(cors, verbose);

  printAllHeaders(final.headers, verbose);

  console.log();
}

main().catch(err => {
  console.error(c(C.red, `Unhandled error: ${err.message}`));
  process.exit(1);
});
