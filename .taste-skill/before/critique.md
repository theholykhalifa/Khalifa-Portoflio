# ROUND 1 — before (16 FAIL, 11 WARN)

Seen in one second: a black operator console — giant "HOLY" wordmark over a faint red
code-grid, a red H emblem, and a telemetry panel that says SYSTEM ONLINE. It reads as
somebody's security workstation, not a résumé site. Five seconds later: it is a personal
cybersecurity profile (the eyebrow chip says so), the primary action "ENTER THE LAB →" is
the red button, and the second row of the header is still rearranging itself.

Idea (one sentence): the page IS a live security console — every section is a panel of
that console (telemetry, threat radar, mission deck, skill matrix, terminal), and the
visitor operates it.

Live thing: the terminal (`$ OPEN TERMINAL`, working command line), plus the quiz/toolkit/
mini-CTF in the Arena, the radar sweep, and the ⌘K command palette — the page can be
operated, not just read.

Layout words by section: hero=split (headline left / emblem+telemetry right, but with no
side padding under 1020) / ticker=full-bleed strip / radar+mission=split / about=split
(text + portrait, one screen leaves the right half empty) / identity+journey=split (info
card / year list) / credentials=card grid then a timeline list huddled left with the right
half empty / experience=stacked full-width cards / arsenal=boxed-card grid, rows ragged /
ops+soc+lab=boxed-card grids / terminal=content huddled left, 624px empty right /
contact=form + cards / footer=link row. The boxed-card grid word appears eight times
(card-rows WARN) — the template is showing under the console skin.

Scores: design 5.5 · usability 6.0 · creativity 7.0 · content 7.5 → arithmetic 6.2

Caps applied: 16 FAILs present → overall capped to **6.0**. Also triggered: headline ≥3
lines + eyebrow + mono + numbering + gradient + resting shadow + hairline → ≤6.5;
covered-text (the fixed consent banner rides over large text during the walk — the cap
that holds usability at 6.0; it is a dismissible legal notice, so it will be allowed with
a post-dismissal proof, and compacted); few-pictures (2 owner-made photographs — stock
imagery is a legal constraint of this site) → design ≤6.5; unequal margins (120 vs 144)
→ design ≤6.5. No placeholder content, primary action is a real button on the first
screen, the five-second pass holds (eyebrow names it).

Top three problems (most visible first), each with the screenshot it shows in and the fix:

1. **The header wraps to two rows at 1440 — the first thing on the page looks broken.**
   `desktop-fold.jpg` (and every desktop sheet): row 1 is "H // SEC · 01 HOME · 02 ABOUT
   · 03 CREDENTIALS · 04 EXPERIENCE · 05 ARSENAL · 06 LAB · 07 RESEARCH", row 2 is
   "08 CONTACT · 09 COURSES · 10 ORB", with SYSTEM ONLINE / عربي / PROFILE floating
   between the rows on the right. Ten numbered links plus a status chip do not fit one
   row, so the nav grew a second one and the brand sits misaligned against it.
   Fix: make the nav a single row — drop the `01…10` prefixes from the desktop links
   (keep numbering for section labels in the page body), put the links on `white-space:
   nowrap`, hide the SYSTEM ONLINE chip once the links are tight (it is decorative), and
   move COURSES/ORB to the burger menu before the row would wrap.

2. **The hero has zero horizontal padding from 561px to 1200px — text and buttons sit
   on the screen edge.** `tablet-fold.jpg`: the eyebrow chip's left border is clipped at
   x=0, "HOLY", "I DON'T JUST USE SYSTEMS." and the ethics line all start at x=0, and the
   three hero buttons run full-bleed to both edges. At 1440 the same bug shows as an
   off-centre frame (content starts 120px from the left but every other section starts at
   144px — off-centre WARN, `desktop-fold.jpg`). Cause: `.hero{padding:150px 0 60px}`
   overrides `.wrap`'s side padding.
   Fix: give the hero the same pair of margins as every section (side padding on the hero
   or an inner wrapper), so 1440 measures 144/144 and nothing touches the edge at 768.

3. **The first screen's type is scattered: the headline breaks into four lines with an
   orphan, and the page carries twenty font sizes.** `desktop-fold.jpg`: "I DON'T JUST USE
   SYSTEMS. / I LEARN / HOW THEY FAIL." — the break leaves "I LEARN" alone on line 3 and
   pushes the red payoff to line 4 (4 lines at 1440, 4 at 390 — headline-lines FAIL);
   the about statement sets at 72px over 7 lines; 236 text blocks are under 13px; 188
   tiny letter-spaced labels; sizes run 9,10,11,12,13,14,15,16,17,18,19,20,22,24,26,34,
   46,62,72,150. Nothing has a floor and nothing has a ceiling.
   Fix: impose the five-step scale (13 / 16-17 / 20-26 / 32-64 / display) with a 13px
   floor, one label size for all micro-labels, and a deliberate line break in the hero
   headline so it sets in two lines with the red line whole.
