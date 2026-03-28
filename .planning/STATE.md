---
gsd_state_version: 1.0
milestone: v2.1
milestone_name: Library Modernization
status: v2.1 milestone complete
stopped_at: v2.1 milestone archived
last_updated: "2026-03-28T05:07:16.543Z"
progress:
  total_phases: 1
  completed_phases: 1
  total_plans: 1
  completed_plans: 1
---

# State

## Project Reference

**Current focus:** Planning next milestone
**Shipped:** v2.1 Library Modernization (2026-03-28)

## Decisions

- Used array config export in rolldown.config.ts because rolldown-plugin-dts throws on CJS format
- Used [name].js entryFileNames template (not hardcoded) to allow dts() plugin to produce index.d.ts
- Separate ESM and CJS into distinct config objects sharing same input/external settings
- cleanDir: true on ESM config only to avoid deleting sibling output files
- Added exports: 'named' to CJS output config to suppress mixed exports warning

## Performance Metrics

| Phase | Plan  | Duration | Tasks | Files |
|-------|-------|----------|-------|-------|
| 01    | 01-01 | 5min     | 4     | 3     |

## Last Session

Stopped at: v1.0 milestone archived
Session: 2026-03-28
