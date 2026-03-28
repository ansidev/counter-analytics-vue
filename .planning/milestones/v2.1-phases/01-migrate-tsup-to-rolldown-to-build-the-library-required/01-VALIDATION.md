---
phase: 1
slug: migrate-tsup-to-rolldown-to-build-the-library-required
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-28
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (already installed as devDependency) |
| **Config file** | `vitest.config.ts` or inline in `vite.config.ts` |
| **Quick run command** | `pnpm run build && node -e "require('./dist/index.cjs')"` |
| **Full suite command** | `pnpm run build && node -e "const m = require('./dist/index.cjs'); console.log(Object.keys(m))" && node -e "import('./dist/index.js').then(m => console.log(Object.keys(m)))"` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `pnpm run build && node -e "require('./dist/index.cjs')"`
- **After every plan wave:** Run full suite command
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | Output parity | build | `pnpm run build` | ✅ | ⬜ pending |
| 01-01-02 | 01 | 1 | CJS output | integration | `node -e "require('./dist/index.cjs')"` | ✅ | ⬜ pending |
| 01-01-03 | 01 | 1 | ESM output | integration | `node -e "import('./dist/index.js').then(m => console.log(Object.keys(m)))"` | ✅ | ⬜ pending |
| 01-01-04 | 01 | 1 | DTS output | file check | `test -f dist/index.d.ts` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. Build tool produces testable output directly.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DTS content quality | D-01 | Type declarations must export correct interfaces | Inspect `dist/index.d.ts` for `CounterAnalyticsPluginOptions`, `useCounterAnalytics` exports |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
