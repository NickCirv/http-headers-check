# http-headers-check — command reference

[Overview](../README.md) · [Research record](RESEARCH.md)

Describes revision `dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c`. Commands are source-inspected; no execution results are asserted.

## Workflow

Fetches headers and reports security-header presence/values, caching and CORS fields. Supports redirect following and a compare subcommand.

Requires a reachable endpoint; use compare URL1 URL2 to inspect environment differences.

```bash
node index.js http://127.0.0.1:3000 --json
```

## Commands and controls

| Control | Behavior in the inspected implementation |
| --- | --- |
| `--json` | Emit findings as JSON |
| `--follow` | Follow redirects |
| `--verbose` | Show full header values |
| `compare URL_A URL_B` | Compare two header sets |

## Interpretation and side effects

The grade reflects a rule set over headers, not penetration testing, TLS validation policy or a full browser audit. Different response paths can expose different headers.

## Implementation reference

- [package.json](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/package.json)
- [index.js](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/index.js)
- [test/smoke.test.js](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/test/smoke.test.js)
