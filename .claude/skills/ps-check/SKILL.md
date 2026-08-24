---
name: ps-check
description: "Use this skill when evaluating Figma designs or websites against SAP Product Standards. Accepts Figma URLs (single frames or entire pages) or website URLs to assess compliance with 66 requirements across UX Consistency, User Assistance, and Accessibility categories. Generates a report with MUST fix (Corporate) vs SHOULD fix (Risk-Based) sections. Use when user mentions 'product standards check', 'standards compliance', 'design review against standards', or provides URLs asking for standards validation."
---

# SAP Product Standards Compliance Check

Evaluate Figma designs or live websites against SAP Product Standards (66 requirements across UX Consistency, User Assistance, and Accessibility).

When invoked, immediately begin with Step 1. Do not explain the skill or ask if the user wants to proceed.

---

## Step 1: Setup

Ask the user for two things:

**1. URL to evaluate** — accept either:
- Figma design URL (`figma.com/design/...`)
- Website URL (`https://...`)

**2. Categories** — use AskUserQuestion (max 4 options):

```json
{
  "questions": [
    {
      "question": "⚠️ Experimental: This skill may miss issues, flag false positives, or misinterpret requirements. Always review findings critically before acting on them.\n\nWhich Product Standards categories should I check?",
      "header": "Categories",
      "multiSelect": false,
      "options": [
        { "label": "All Standards", "description": "66 requirements: UX Consistency (20) + User Assistance (11) + Accessibility (35)" },
        { "label": "UX Consistency only", "description": "20 requirements: colors, typography, icons, components, patterns" },
        { "label": "User Assistance only", "description": "11 requirements: documentation, terminology, help infrastructure" },
        { "label": "Accessibility only", "description": "35 requirements: WCAG compliance, keyboard nav, screen readers" }
      ]
    }
  ]
}
```

---

## Step 2: Fetch Design or Website

### Figma URLs

1. Extract `fileKey` and `nodeId` from the URL.
2. Call `mcp__figma__get_metadata` to determine scope:
   - Multiple top-level frames → **page-level**: list frames, ask user which to evaluate (all / top 5 / pick), then evaluate each in parallel.
   - Single frame → proceed directly.
3. For each frame: call `mcp__figma__get_design_context` and `mcp__figma__get_screenshot`.
4. Mark implementation-dependent checks (HTML, ARIA, keyboard) as "Review Needed — verify in code".

### Website URLs

1. Use Playwright MCP to navigate, take a snapshot and screenshot.
2. Inspect HTML for semantic markup, ARIA attributes, language tags, form structure.
3. All 66 requirements can be fully evaluated (no "Review Needed").

---

## Step 3: Load Standards

**Accessibility (ACC):** Try SAP Wiki first (`https://wiki.one.int.sap/wiki/spaces/Acc/pages/1996028165/`), fall back to `./standards-reference.json` if unavailable. Cache successful fetches for 24h in `./cache/acc-standards-cache.json`.

**UX Consistency & User Assistance:** Load from `./standards-reference.json`.

Always tell the user which source was used (wiki version + date, or "JSON fallback").

---

## Step 4: Context Detection & Interview

Detect what UI elements are present (navigation, forms, images, tables, color-coded info, media) and skip requirements that clearly don't apply — document each N/A with a reason.

Ask 5–10 targeted follow-up questions based on detected context and selected categories. See `./interview-questions.md` for the full question guide. Key questions to always ask:
- **UA selected**: Is user documentation planned?
- **ACC selected**: Has accessibility testing been performed?

Skip questions when the answer is already visible in the design or code.

---

## Step 5: Evaluate Requirements

For each applicable requirement use one of four statuses:

- ✅ **Pass** — meets requirement (brief evidence)
- ❌ **Fail** — violates requirement (specific issue + fix suggestion)
- 🔍 **Review Needed** — cannot verify from Figma alone (list what to check in code)
- ➖ **N/A** — requirement doesn't apply (reason required)

Requirements by category (IDs for reference):
- **UX Consistency (20, all Risk-Based):** UXC-010–030
- **User Assistance (11):** UA-010 (Corporate), UA-010-TASK, UA-030 (Corporate), UA-001, UA-040–090, UA-FEATURE
- **Accessibility (35):** ACC-252 (Corporate), ACC-253–287 (Risk-Based)

See `./visual-checks.md` for visual inspection guidance.

---

## Step 6: Generate Report

Save a standalone HTML report to `~/.claude/skills/ps-check/reports/ps-check-report-{timestamp}.html`.

Report structure:
1. **Executive Summary** — pass/fail/review/N/A counts, overall compliance %, Corporate vs Risk-Based breakdown
2. **Critical Issues (MUST Fix)** — failed Corporate requirements with specific fix + link to standard
3. **Recommended Improvements (SHOULD Fix)** — failed Risk-Based requirements, prioritized by impact
4. **Full Requirements Table** — all evaluated requirements with status, notes, and links
5. **Review Checklist** (Figma only) — implementation items for developers
6. **N/A Items** — with reasoning

For page-level reports (multiple frames): prepend a page overview with per-frame stats and cross-frame consistency findings.

Use SAP-branded styling (SAP blue `#0070f2`, font '72', clean card layout). Embed screenshots as base64.

---

## Step 7: Present Results

Show a summary in chat:

```
SAP Product Standards Check Complete

Evaluated: {total} requirements
✅ Pass: {n} | ❌ Fail: {n} | 🔍 Review Needed: {n} | ➖ N/A: {n}

🔴 MUST Fix (Corporate): {n} issues
🟡 SHOULD Fix (Risk-Based): {n} issues

Full report: ~/.claude/skills/ps-check/reports/ps-check-report-{timestamp}.html
```

List the top 3 critical issues if any exist, then offer next steps (check another page, export to Jira, generate developer checklist).

---

## References

- Product Standards Portal: https://pages.github.tools.sap/product-standards/portal/
- SAP Fiori Design Guidelines: https://experience.sap.com/fiori-design/
- Accessibility Standards Wiki: https://wiki.one.int.sap/wiki/spaces/Acc/pages/1996028165/
