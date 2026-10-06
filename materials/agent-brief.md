# Agent brief - shared by every fan-out page of learn-negotiation-with-phoebe

Filled from course-builder/references/agent-brief.template.md on 2026-10-06. Internal build
document: never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   four options per quiz question:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-negotiation-with-phoebe/courses/01-positions-and-interests.html`
   For rhythm and the bench numbers, also skim
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-negotiation-with-phoebe/courses/04-the-anchor-bench.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-negotiation-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens (first 30 lines):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-negotiation-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "learn-negotiation-with-phoebe / Session N of 6", #toggle-all, #zoom-toggle)
· masthead (eyebrow "Learn Negotiation with Phoebe · Session N of 6", h1 with one
`<span class="accent">`, .sub, .chip-row with the level chip (🟢 Foundation / 🟡 Core / 🟠 Advanced
as given in your outline) plus two .chip.audience and .chip.time "45 min", .agenda a1-a4) ·
main.wrap · section#intro (Part 0: kicker, .lede, .legend pills exactly as the template,
.callout.win "★ What you walk out with tonight.") · 3 Parts, each `section.section#part-N` with
section-kicker (klabel "Part N · covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE
figure, `details.card` accordions (summary: `.mode.live` or `.mode.self`, title, `.mini`,
`.caret ▶`), at least one `.callout.example` with `span.ex-pill` "Real world" per Part ·
section#demo-1 Build-along (kicker klabel "Build-along", `.tag.demo "★ 22 min · everyone builds"`,
.lede, ONE figure, `.steps > .step`, each with a `<p>` then a `.prompt-box.good` carrying a
`span.label` "★ Step N · ...") · section#exercise Homework (ol, 4 items, `.tag.exercise "30 min"`)
· section#quiz (3 x `.quiz-q data-answer="0-based"`, `p.qtext`, FOUR `button.qopt` "A · ...",
`p.qwhy`; one `p.quiz-score` after the last; vary the correct letter) · section#official, h2
EXACTLY "What this session teaches, and where it came from", `.covered > .covered-row` (pill solid
✓ for read-at-source or measured / light ◐ for reported or constructed + name + note), then the
`.mono` line EXACTLY "Every fact on this page, and its verification tier, is recorded in the
course's source map." · section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin
this</span>", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" (last
page: no next callout; use a closing callout.win instead) · footer.pagefoot ·
`<script src="../assets/app.js?v=1"></script>` (session 2 ALSO loads
`<script src="../assets/negotiation-live.js?v=1"></script>` BEFORE app.js, and places
`<div id="neg-zopa"></div>` in its build-along).

Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · Title - learn negotiation with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. Never invent a statistic, a
  percentage, a sample size or a correlation. Bench numbers: quote ONLY the values in the map's
  bench canon table, formatted exactly as listed (e.g. "r = 0.55", "64.7%").
- **Read-at-source vs reported matters.** Getting to Yes could NOT be opened: every claim about its
  contents is "reported" and the page says so once. Galinsky and Mussweiler 2001: abstract only;
  print NO r value, NO sample size, NO "MBA students", NO "pharmaceutical plant". Voss: his
  techniques are his framing and anecdotes; say what evidence exists nearby and what it does not
  test. Never say ZOPA or BATNA was "coined" or "invented"; say "introduced" (BATNA, Getting to
  Yes) or "popularised" (zone of agreement, Raiffa 1982).
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not
  (above all: whether to make the first offer).
- Citations in the exact form of the map's appendix; anything marked reported says "reported".
- NEVER "lottery" or "lotteries"; say the mechanism.
- Default to the English word. Any Chinese term carries its English in brackets right after it,
  every occurrence (better: avoid Chinese terms; link the seam instead).
- Titles, widget ids and class names must not collide with siblings. Your figure class/id prefix is
  `s<N>a`, `s<N>b`, `s<N>c`, `s<N>d` (N = your session number); nothing else.
- The running case is CONSTRUCTED: Kestrel Foods (buyer) and Brightwell Packaging (supplier).
  Say "constructed" in every Real-world callout that uses it. Never use Phoebe's own employers,
  clients or career. Real-world callouts may also use a real, sourced example from the map, with
  its tier.
- Seams: one line + link, no re-teaching (URLs in the map).

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): ink #14230F · muted #4A5944 · primary #0F5C0A ·
deep #0A3D07 · mid #2C7A22 · soft #B7D8AE · 50-tint #EDF6EA · faint #C5D3BF · hairline #DCE6D7 ·
warm #8A6400 · warm-ink #6A4C00 · warm-50 #FBF2D9 · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2`
`#FCA5A5` only for a wrong-way panel or the anti-lever.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: s<N>a (Part 1), s<N>b (Part 2), s<N>c
  (Part 3), s<N>d (build-along).
- `<defs>` holds, with the figure prefix P: a wobble filter `id="PSk"` (`feTurbulence
  type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` + `feDisplacementMap
  scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%" width="106%"
  height="106%"`), a hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one #0F5C0A line,
  opacity .5) if used, an open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, #14230F
  stroke 1.6) if used. ALL shapes sit inside ONE `<g filter="url(#PSk)" fill="none"
  stroke="#14230F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`; rects carry
  a tiny rotation (-1.2 to 1.2 degrees). Fills: white, #EDF6EA, the hachure for "the pile" or "the
  data", and #FBF2D9 with #8A6400 stroke ONLY for the one thing the figure is about. Never a
  mascot, never a metaphor drawn literally (no anchors, no icebergs, no pies): draw the mechanism.
- Text classes (copy from the template): `.PH` 800 12px #14230F heading · `.PL` 600 12px #14230F
  label · `.PS` 400 11px #4A5944 · `.PB` 800 11px #6A4C00 · `.PV` 800 16-18px #0A3D07 value ·
  `.PW` 800 12px #FFFFFF on a dark fill · `.PA` 700 11px #0F5C0A axis caption · `.PN` 400 12px
  #4A5944 note · `.PR` #991B1B for a wrong-way value.
- ALL `<text>` outside the filtered group, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 105
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it
  by 12px. No line, arrow or curve may cross a label (the gate flags line-through-text): route
  arrows around labels or move the label. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along (4 figures). Draw the MECHANISM.

## Voice and honesty

Every Part gets a real-world story: either the constructed Kestrel/Brightwell case (say
"constructed") or a sourced example from the map with its tier. Bench numbers (session 4) may be
quoted as "measured on 4,000 real negotiations in session 4". Never claim a study found something
the map does not record.

## Cross-links (absolute URLs)

- Business Chinese Advanced s5, negotiation and face: https://phoebefu6.github.io/learn-business-chinese-advanced-with-phoebe/courses/05-negotiation-and-face.html
- Communication s6, bad news and disagreement: https://phoebefu6.github.io/learn-communication-with-phoebe/courses/06-bad-news-and-disagreement.html
- Economics, pricing with the number: https://phoebefu6.github.io/learn-economics-with-phoebe/courses/p3-pricing-with-the-number.html
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

1 `01-positions-and-interests.html` Positions and interests
2 `02-walk-away-and-the-deal-zone.html` Walk-away points and the deal zone
3 `03-the-first-number-in-the-room.html` The first number in the room
4 `04-the-anchor-bench.html` The anchor bench
5 `05-trade-across-issues.html` Trade across issues
6 `06-saying-no-closing-and-the-next-deal.html` Saying no, closing, and the next deal

Footer left: "Session N of 6 · learn-negotiation-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: `<a href="PREV">← Prev: Title</a> &nbsp;·&nbsp; <a href="NEXT">Next: Title →</a>`
(last page: "← Prev: ..." and `<a href="../index.html">Course home →</a>`).

h1 for each (one accent span): 2 "Walk-away points and the <span class="accent">deal zone</span>" ·
3 "The first number <span class="accent">in the room</span>" · 5 "Trade across <span
class="accent">issues</span>" · 6 "Saying no, closing, and <span class="accent">the next
deal</span>".
