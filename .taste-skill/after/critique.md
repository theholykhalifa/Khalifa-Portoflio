# ROUND 2 — after (0 FAIL / 4 WARN, exit 0)

Seen in one second: the same operator console, now set cleanly — one five-step type
scale (13/16/20/24/34-40/62/150), one pair of margins (144/144 at 1440), and surfaces
that separate by tone step instead of outlines and shadows. It reads as a designed
workstation rather than a stack of template boxes. The consent gate is compact now
(title + two lines + side-by-side buttons), the ticker flows without junction gaps,
and the fold holds headline → statement → lead → actions without edge contact.

Idea (one sentence): unchanged — the page IS a live security console, every section a
panel of it (telemetry, radar, mission deck, skill matrix, terminal), operated not read.

Live thing: the terminal (`$ OPEN TERMINAL`, working command line with history/Tab),
the radar sweep, the ⌘K command palette, the Arena (quiz/toolkit/mini-CTF), and the
consent-gated visit counter — plus the scramble-on-reveal headings.

Layout words by section: hero=split (headline left / emblem+telemetry right, 144/144)
/ ticker=full-bleed strip / radar+mission=split / about=split (text + unframed
portrait) / identity+journey=split (info card / year list) / credentials=card grid +
progression timeline / experience=stacked full-width cards / arsenal=boxed-card grid /
ops+soc+lab+notes+reports=boxed-card grids / mind=statement band / terminal=left header
+ full-width live panel / contact=form + channels card / footer=two-column link row.
The boxed-card grid word still appears eight times (card-rows WARN) — the template is
still showing under the console skin.

Scores: design 7.0 · usability 8.0 · creativity 7.0 · content 7.5 → arithmetic 7.4

Caps applied:
- Devices present and allow-noted (eyebrow labels, monospace labels, 01/02/03
  numbering, decorative gradients — four brand textures) → overall cannot exceed
  **6.5**, whatever else is true. These are the brand's identity, kept deliberately.
- Fewer than four real photographs (two owner-made ones) → design ≤ **6.5**.
- One section huddled left with 624px of width empty ("ASK THE") → design ≤ **6.5**.
- Unequal-margins WARN (144 vs 164 at 1440) would also cap design ≤6.5, but the frame
  is provably symmetric — every `.wrap` measures 120/120, hero-grid and contact-grid
  144/144 (measured directly); the WARN is a text-edge percentile artifact, see the
  defense below. Listed for transparency; it does not change the outcome (design is
  already ≤6.5 on the two caps above).
- covered-text: the consent bar rides over headlines while it is up. With the
  post-dismissal proof below (design's own coverage = 0), usability is not held at 6
  by it; even applying that cap strictly (usability ≤6) the overall still lands at 6.5,
  so the result is the same either way.
- No longer triggered: the FAIL cap (6.0 — round 1's binding cap), headline ≥3 lines
  (longest heading is now 2 lines at every width), resting shadow (0), decorative
  hairline (0), five-second pass (the eyebrow names it), real primary button on the
  first screen, placeholder content (none).
→ final: design 6.5 · usability 8.0 · creativity 7.0 · content 7.5 → **overall 6.5**
(round 1: 6.0). The remaining distance to 7+ is the device caps — a content/IA round
(card-rows, pictures) plus the day the brand decides against eyebrow/numbering.

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. **Eight rows of identical boxed cards — the template still shows.**
   `desktop-page-03.jpg` (credentials, experience, arsenal repeats; `card-rows` @1440
   +768 +390): certifications, tools, lab resources, notes and reports are all
   rendered as the same card grid, so the page's rhythm flattens halfway down.
   Fix (next round, content/IA): give each list one featured item or a mixed
   list+feature row. Not done here: the grids are the content model
   (config.js-driven lists of same-kind items) and restructuring them is layout
   invention, not a restyle.

2. **The ASK THE MACHINE header hugs the left while the right of the section stays
   empty.** `supplement-terminal-1440.jpg` (`lopsided` @1440, 624px): the eyebrow +
   headline + intro paragraph sit in the left ~57% and the terminal's typed lines are
   left-aligned, so the section's text mass reads lopsided — even though the terminal
   panel's surface spans the full measure (144→1296).
   Fix (next round): a right-aligned meta row in the header (status, hint chips) or a
   centered header. Not done here: both are layout changes; and a terminal that types
   left→right is the honest form of the component.

3. **No footage anywhere.** `desktop-fold.jpg` (`no-footage` @1440): the hero has no
   media and nothing on the page moves as video.
   Fix: one honest clip of the real material (the lab, the terminal in use) as a muted
   loop with a poster frame, the day such a clip exists. Not done here: stock footage
   would contradict the page's own claim (authorized, real, written down) — absence is
   a brand decision, not an oversight.

## Allow list (used for the after-inspect, each with its note)

`--allow mono,numbering,emoji,gradient,few-pictures,covered-text,eyebrow,micro-label`

- **mono** — JetBrains Mono is 42% of the type by design: command lines, telemetry,
  readouts and labels are the console's voice; Inter carries the prose (58%).
- **numbering** — the 01–10 section index ("[+]_ 01 // WHO IS HOLY?") is the
  console's navigation system, part of the identity, not decoration.
- **emoji** — symbol glyphs used as UI marks (→ ⌘ ⊙ ± · ☰), not decorative emoji.
- **gradient** — exactly four brand textures remain (was 54 fills): the code-grid
  `bg-grid`, the ambient `bg-glow`, the `scanbeam` sweep, and the CRT scanlines
  inside the terminal. No gradient touches a card, button or text.
- **few-pictures** — two owner-made photographs + SVG identity art; stock imagery is
  a legal/brand constraint of this site (all imagery owner-made or licensed).
- **covered-text** — the consent gate only: a dismissible legal overlay, compacted,
  proven to cover nothing after dismissal (below). No other element covers text.
- **eyebrow** — label-first instrumentation: the section label is how a console is
  read; kept as brand.
- **micro-label** — the small mono readouts (SIMULATION, STATUS, chips) at the 13px
  floor; they are the instrument-panel typography.

## Coverage proof (covered-text)

Measured with the probe's own hit-test (text ≥24px, 8 sample points per line) walking
every screen at 1440:

- **Bar up:** 11 elements sit under the consent bar — "SECURITY IS A MINDSET.",
  "CCNA", "OSWE", "RED TEAM LAB", "ASK THE MACHINE", "LET'S BUILD SOMETHING SECURE."
  etc. It is a dismissible legal gate (compact: title + ~2 lines + side-by-side
  buttons, 12/16/14 padding).
- **After ACCEPT ALL:** bar hidden. Every remaining hit is either the fixed nav
  (content scrolling under a fixed header — excluded by the probe's own pinned-top
  rule) or the visit toast (a bottom notification for a few seconds after the choice).
- **At rest (toast gone):** 0 covered. The same 8 sample points on the tested
  headings return the heading itself on every pass (verified 3/3 over ~3s).

## Round 1 → Round 2: what cleared

- **16 FAIL → 0 FAIL.** headline-lines ×3 (headings now ≤2 lines at every width;
  hero statement 2 lines at 1440/768/390), small-text (13px floor, body 16/1.6,
  hero lead 16→20px), edge-text (hero side padding: 144/144 at 1440, nothing touches
  the edge at 768/390), covered-text (allow + proof above), shadow (0 resting
  shadows — surfaces separate by one tone step), hairline (0 — nav, ticker, panels,
  journey, SOC, terminal, footer rules removed; sections separate by background
  alternation only), outlined-box (55 → 0 on cards/panels; outlines kept only where
  they carry meaning: inputs, chips, buttons), gradient (54 → 4 brand textures).
- **WARNs cleared:** size-count (20 sizes → 8), grey-body (5.5:1 → 7.8:1 with
  `--muted: #98A2B0`), measure (ticker restructured into per-item spans — real
  paragraphs ≤86 chars/line), dashed (`.btn-t`/`.holybar` dashed → solid), glass
  (nav blur → opaque `#05070A`; the one translucent overlay left is the consent bar),
  font-count (3 → 2 faces, JetBrains Mono first in the consent stacks),
  name-only-title (the plain-words line under the H1 — the hero lead — is now 20px,
  over the 18px floor), off-centre@390 (edge contact fixed).
- **Consent bar:** compacted copy keeping "visit counter" + the privacy link,
  side-by-side buttons ≤560px (padding step instead of a full-width stack), tighter
  padding, JetBrains Mono first (fonts are self-hosted; consent gates only the
  optional counter).
- **Gates after every change:** legalcheck CLEAN · consentsmoke ALL PASS ·
  kbbattery 119/0 · agentsmoke ALL PASS · orbsmoke ALL PASS · orbcheck ALL CLEAN ·
  `node --check` on app.js/consent.js/counter.js/config.js · no horizontal overflow
  320–1920 (scrollW == innerWidth at every width).

## Honest caveats

- Live response headers (HSTS, CSP, X-Frame-Options) cannot be verified offline; on
  GitHub Pages `frame-ancestors` cannot be delivered through a `<meta>` CSP — those
  headers need host-level configuration.
- The Supabase edge function (contact form / counter) is not deployed in this
  environment; the visit counter runs only after consent and its pill shows
  last-known data offline.
- The vault/admin gate is demo-grade (client-side), not a security boundary.
- Scores are one juror's read; calibration: real Sites of the Day land at 7.5–8.0.
  With the brand devices (eyebrow/mono/numbering/gradient) kept, this page is held at
  6.5 by the cap table until a content/IA round addresses card-rows and pictures.
