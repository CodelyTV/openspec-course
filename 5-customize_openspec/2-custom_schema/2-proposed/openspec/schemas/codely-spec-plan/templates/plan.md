---
name: "<!-- change name -->"
description: "<!-- one sentence -->"
created_at: "<!-- YYYY-MM-DDTHH:MM:SSZ -->"

created_by:
  tool: "<!-- e.g. Claude Code -->"
  model:
    name: "<!-- e.g. Claude Opus -->"
    version: "<!-- e.g. 4.6 -->"
    reasoning_effort: "<!-- low | medium | high -->"
---

# <!-- Plan title -->

## Goal

<!-- 1-3 sentences: what gets built and why it matters -->

## Decisions

- <!-- choice, assumption or out of scope item -->

## Context

- [`<!-- path -->`](/<!-- path -->): <!-- why it matters -->

## Phases

### Phase 1: <!-- vertical slice -->

<!-- What this phase delivers -->

**Contracts**

- <!-- Contract type -->: <!-- contract -->

- [ ] <!-- task -->
- [ ] Verify typecheck, lint and every test suite with the project's verification commands. Fix issues if any.

## Next step

Run `/openspec-apply-change` to implement every phase.

<!-- Creative closing line including 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot) -->
