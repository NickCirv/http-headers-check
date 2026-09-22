![http-headers-check — Nicholas Ashkar repository collection](assets/nicholas-ashkar/banner.png)

# http-headers-check

Review an HTTP response header set with a compact security grade.


<a id="usage"></a>

## What it does

Fetches headers and reports security-header presence/values, caching and CORS fields. Supports redirect following and a compare subcommand. See the pinned [implementation](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/index.js).


<a id="install"></a>

## Quickstart

Node requirement from the inspected manifest: **`>=20`**. Requires a reachable endpoint; use compare URL1 URL2 to inspect environment differences.

The following example is **source-inspected, not executed**. It uses a pinned checkout; npm package publication is not assumed. Replace project paths or provide the stated input fixtures before running it.

```bash
git clone https://github.com/NickCirv/http-headers-check.git
cd http-headers-check
git checkout dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c
npm install --ignore-scripts
node index.js http://127.0.0.1:3000 --json
```

Dependencies are installed with lifecycle scripts disabled in this recipe. Read the package scripts before enabling any lifecycle step required by your environment.

## Usage and reference

`http-headers-check` | `hcheck` are the executable names declared by the package. [Command reference](docs/REFERENCE.md) covers source-backed options and entry points.

| Control | Behavior in the inspected implementation |
| --- | --- |
| `--json` | Emit findings as JSON |
| `--follow` | Follow redirects |
| `--verbose` | Show full header values |
| `compare URL_A URL_B` | Compare two header sets |

## Limits and operational notes

The grade reflects a rule set over headers, not penetration testing, TLS validation policy or a full browser audit. Different response paths can expose different headers.

## Development

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

| Script | Declared command |
| --- | --- |
| `test` | `node --test` |

Work from the pinned source, keep changes focused, and reproduce the affected behavior with a small fixture before proposing a change. Existing contribution and security policies remain authoritative where present.

## Research and status

[Research record](docs/RESEARCH.md) identifies the inspected revision, source evidence, documentation disposition and verification gaps. Static inspection supports the descriptions here; runtime behavior, dependency installation and current hosted services remain unverified.

## License and author

[License](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/LICENSE)

[Nicholas Ashkar](https://nicholashkar.com) · Applied AI, systems and consulting.
