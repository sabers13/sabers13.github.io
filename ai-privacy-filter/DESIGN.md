# AI Privacy Filter — portfolio design

## Intent and approved direction

A public case study for visitors reviewing Saber Sojudi's engineering work.
Answer: what did Saber build, how does it handle an email, and what does the
evidence show? Lead with the project explanation, then the working browser demo,
then evidence and its limits. Comfortable and precise, close to LIVECell Audit.

Selected prototype: **A, Clear overview**, adapted from the `quiet-instrument`
composition. Owner notes, verbatim: “A — Clear overview, closest to LIVECell
(Recommended)”. The LIVECell portfolio template governs the visual language;
the dealt sheet supplies the explanation/output split rather than a new brand.
The three complete direction sheets are kept in local review artifacts.

The project's own typed placeholders connect the introduction, example and
evidence. The live interaction is the existing browser-only replacement demo.
All content remains available in English and German. Technical explanations may
use native disclosure elements; measured misses and limits remain visible.

## Design source and scope

Reference: https://sabersojudi.com/livecell-audit/ and the current local LIVECell
header and review stylesheet. Reuse the author-led navigation, detached utility
rail, Inter, blue state accent and tonal rounded panels. Preserve this page's
entity highlight colors and color-blind-safe chart series, because they convey
data categories. Do not copy LIVECell's cell imagery, labels or metrics.

This page is a continuous case study, with ordinary anchor links and
`aria-current`. On phones, navigation stays on the header's second row and the
rail becomes a compact utility row, as in approved prototype A; there is no
duplicate bottom navigation covering examples or keyboard focus.

## Color tokens

| Role | Light | Dark |
|---|---|---|
| Page | `#f9fafb` | `#030712` |
| Shell | `#f9fafb` | `#0b0f19` |
| Card | `#ffffff` | `#111827` |
| Inset | `#f3f4f6` | `#1a2232` |
| Hover inset | `#e9ebef` | `#222c3f` |
| Main ink | `#111827` | `#f9fafb` |
| Secondary ink | `#374151` | `#d1d5db` |
| Muted ink | `#626d7f` | `#a6afbe` |
| Hairline | `#e5e7eb` | `#263246` |
| Strong hairline | `#cbd1db` | `#394861` |
| Link and focus | `#2563eb` | `#60a5fa` |
| Accent background | `#dbeafe` | `#192e4e` |
| Ink on accent background | `#1e40af` | `#bfdbfe` |

Keep the existing semantic success, warning, danger, entity and chart token pairs
in page.css. They encode evidence rather than decoration. Use accent sparingly;
primary buttons are main ink/on-ink. No decorative glow or gradient is needed.
The header alone may use a translucent surface and blur. Panels use fill, with
hairlines reserved for controls, tables and the portfolio header.

## Typography, spacing and elevation

Self-hosted variable Inter, weights 400, 500, 600 and 650/700. System monospace
only for actual code/placeholder tokens. Sentence case in both UI languages.

| Role | Desktop | Phone | Weight |
|---|---|---|---|
| Main title | 40px / 1.12 | 30px / 1.15 | 650 |
| Section title | 28px / 1.2 | 24px / 1.2 | 650 |
| Card title | 16px / 1.4 | 16px / 1.4 | 600 |
| Lead and body | 16px / 1.6 | 16px / 1.6 | 400 |
| Captions, labels and tables | 13px / 1.55 | 13px / 1.55 | 400–600 |
| KPI value | 34px / 1.1 | 30px / 1.1 | 650 |

Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64px. Maximum frame width 1440px,
40px outer desktop padding, 24px tablet, 16px phone. Desktop utility rail 44px,
24px gap to content. Section gaps 64px desktop, 48px phone. Card padding 24px,
18px phone; card gap 20px; inset gap 12px. Radii: shell 32px, cards 24px,
insets 16px, small controls 8px, pills 999px, placeholder highlights 4px.
At rest, no card shadow. Floating tooltips may use a restrained shadow.

## Components and responsive behavior

- Header: author link left; four anchor groups; project badge and portfolio Back
  right. Navigation moves to row two below 1100px, with wrapping labels at 375px.
- Utility rail: visible theme and EN/DE controls; selected states use ink/inset.
  Utilities move to one row below 768px. Keep keyboard focus at every size.
- Introduction: explanation on the left, a real JSON-derived placeholder excerpt
  on the right, followed by four JSON-derived KPI cards and a visible caveat.
- Demo: input and result in tonal panels; one primary action, sample and clear.
  Collapse to a single column below 900px. Preserve empty, result and no-match states.
- Examples: original/model/restored columns; full-width stack below 1000px.
  Gallery cards remain an archive with visible miss annotations and native details.
- Charts: SVG and data table share a roomy card; use two columns where width
  permits and a stack below 1100px. Never change data, precision or labels.
- Tables: visible headers on larger screens; readable labelled rows on phones.
  Preserve semantic tables and every chart's screen-reader data table.
- Details: native summary/actions, 44px minimum interactive target height.
- Loading/errors: visible translated feedback; retry by reloading after a data
  fetch error. The local demo continues to operate independently of evidence loads.

## Motion and accessibility

Only useful control feedback; 160ms ease-out. No delayed entrances, count-up,
scroll scenes or moving pictures. Keep numerical evidence readable immediately.
Respect prefers-reduced-motion by disabling travel and smooth scrolling.
Visible 2px focus outline with 3px offset. Account for the sticky header in anchor
offsets. Every icon button has a translated accessible name. Maintain 4.5:1 text
contrast and the existing typed-entity meanings in both themes.

## Content constraints

Every new or changed UI string has EN and DE keys in assets/app.js. Existing
JSON is immutable and supplies all measured values. All examples remain synthetic.
Pseudonymisation retains a link to the person; no broader legal or security claim
is added. Preserve the limits, misses, source evidence and credits.

## Explicit exceptions to generic Taste defaults

Inter, rounded panels, pill utilities, header hairline and entity colors are
required by the selected portfolio design and existing evidence conventions.
The existing screenshots and real browser demo provide project imagery; no
stock photos, external assets or motion quotas are appropriate. Long chart titles
must retain their JSON wording. The required synthetic example.com addresses are
measured example data, not unfilled placeholders. Document these when reviewing
generic lint or inspector findings rather than removing evidence to satisfy them.
