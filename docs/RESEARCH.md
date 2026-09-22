# http-headers-check — research record

## Revision and scope

- Repository: [NickCirv/http-headers-check](https://github.com/NickCirv/http-headers-check)
- Commit: `dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c`
- Tree: `3b329d3920563185a8b9989c2cdbf4c758720553`
- Captured: 6 of 6 eligible text files (all eligible text files).
- Recursive tree truncated: `False`.
- Runtime verification: **unverified**; no repository code, installation or test command was executed.

The captured file inventory is broader than the semantic review. Authoring inspected package metadata, entrypoint/argument handling and implementation paths relevant to the claims below, plus test declarations. This is documentation research, not a line-by-line security audit. Generated/binary artifacts, lockfiles and file types outside the acquisition filter were not inspected.

## Claim and evidence

| Claim | Pinned evidence | Status |
| --- | --- | --- |
| Runtime requirement and executable mapping | [package.json](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/package.json) | verified in manifest; installation unverified |
| Review an HTTP response header set with a compact security grade. | [implementation](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/index.js) | partially verified by static implementation review |
| Operational limits and side effects | [implementation](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/index.js) and source map in [reference](REFERENCE.md) | partially verified; runtime unverified |
| Test command definition | [package.json](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/package.json) | verified as a declaration only |

## Findings carried into the rewrite

The grade reflects a rule set over headers, not penetration testing, TLS validation policy or a full browser audit. Different response paths can expose different headers.

No runtime checks were executed for this documentation review. The committed smoke test checks entrypoint JavaScript syntax; it does not exercise the command behavior.

## Documentation inventory and disposition

| Existing document | Disposition |
| --- | --- |
| [README.md](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/README.md) | Rewritten overview; historical copy remains at this pinned URL. |

New supporting documents: `docs/REFERENCE.md` and `docs/RESEARCH.md`. No original source or protected legal/security file was changed.

## Protected-file evidence

- `LICENSE` SHA-256 `68729cab364d82364078b08d8580ccfa51dc69c81a7d64e8d8d47a1da6c9349d`.

## Remaining verification

Clean installation, useful-command execution, malformed input, side-effect boundaries, platform compatibility and end-to-end tests remain unverified. Package-registry availability and live API destinations were not checked. No performance, customer-adoption, compliance or production-readiness claim is made.

## Captured evidence index

- [LICENSE](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/LICENSE) · blob `05b804beeec7d1a6c933d087387ba4adf6463d93`.
- [README.md](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/README.md) · blob `2b94ce1459f159b27ff50f60ae3c6434fa17dad2`.
- [package.json](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/package.json) · blob `15e96ad2f879a0a748aa094bbd997ea5cff882e7`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/.github/workflows/ci.yml) · blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [index.js](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/index.js) · blob `a16d61f3d5413da59c2d2029f5cfa6605fd91bd7`.
- [test/smoke.test.js](https://github.com/NickCirv/http-headers-check/blob/dd005cbe57e0241c6ddeb29ce7002cbe45cdf68c/test/smoke.test.js) · blob `ebbccaaf2583b4850575f835313e4b0afd21bff7`.

## Tree files outside the captured text set

These paths were mapped but their contents were not acquired in this research pass:

- `banner.svg`
