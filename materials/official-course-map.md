# learn-negotiation-with-phoebe - official course map (source map)

Internal build document. Never linked from an audience page. Every number a page quotes must be in
this file with its tier, or be labelled constructed on the page.

Tiers: **read-at-source** = the primary text (paper, abstract on the publisher/PubMed page, dataset,
licence, author's own page) was read in this build. **reported** = only secondary sources were
reachable; the page must say "reported" or attribute it. **measured** = computed in this build
from the dataset (Python reference and node engine agree on all 113 numbers to 1e-9).
**constructed** = invented for teaching; the page must say so.

Course: bucket comm, diff 2, audience both, single track, 6 sessions x 45 min. Palette forest green
#0F5C0A (deep #0A3D07, mid #2C7A22, soft #B7D8AE, 50 #EDF6EA), ink #14230F, muted #4A5944, faint
#C5D3BF, hairline #DCE6D7, warm old gold #8A6400 (ink #6A4C00, 50 #FBF2D9). Min Delta-E76 16.9 and
Delta-E2000 12.3 from every --indigo in github_repo/learn-*/assets/style.css and from Business
English teal #406D77; vermilion is far by hue. All text-on-fill pairs >= 4.5:1 (white on primary
8.22, white on amber 5.38, white on mid 5.37, ink on soft 10.53, muted on paper 7.34).

## Session titles and files (locked; grep of learn-*/courses found no collisions)

1. `01-positions-and-interests.html` - Positions and interests
2. `02-walk-away-and-the-deal-zone.html` - Walk-away points and the deal zone
3. `03-the-first-number-in-the-room.html` - The first number in the room
4. `04-the-anchor-bench.html` - The anchor bench (bench)
5. `05-trade-across-issues.html` - Trade across issues
6. `06-saying-no-closing-and-the-next-deal.html` - Saying no, closing, and the next deal

## The constructed running case (label "constructed" on every page that uses it)

Kestrel Foods (invented 40-store grocery chain, the buyer) negotiates a 12-month supply contract
for printed cartons with Brightwell Packaging (invented supplier). Prices in dollars per 1,000
cartons. Volume 2.4 million cartons a year (2,400 thousand).

| Item | Value | Where |
|---|---|---|
| Rival supplier's quote to Kestrel (Corran Box, invented) | $412 | s2 |
| Kestrel's cost to switch (new print plates, qualification) | $9 | s2 |
| Kestrel's walk-away price (BATNA-derived reservation price) | $421 | s2, computed |
| Brightwell's spot-market price for the line's capacity | $360 | s2 |
| Brightwell's extra cost to serve Kestrel's custom print | $12 | s2 |
| Brightwell's walk-away price | $372 | s2, computed |
| Deal zone | $372 to $421, $49 wide, midpoint $396.5 | s2, computed |
| Brightwell's opening number | $455, which is $34 above Kestrel's ceiling (outside the zone) | s2, s3 |
| Positions after the first rounds | Brightwell $415, Kestrel $385, $30 apart; halfway $400 | s3, s4, s5 |
| Payment in 30 days instead of 60 | costs Kestrel $3, worth $11 to Brightwell | s5 |
| Guarantee 90% of forecast volume | costs Kestrel $2, worth $8 to Brightwell | s5 |
| 2-day delivery window instead of 5 | worth $7 to Kestrel, costs Brightwell $2 | s5 |
| Halfway deal: $400, 60 days, no guarantee, 5-day window | Kestrel effective cost $400, Brightwell effective revenue $400 | s5, computed |
| Package deal: $392, 30 days, guarantee, 2-day window | Kestrel effective cost $390 (saves $10), Brightwell effective $409 (gains $9); joint $19 per 1,000 | s5, computed |
| Per year at 2.4M cartons | Kestrel saves $24,000, Brightwell gains $21,600, joint $45,600 | s5, computed |

Further constructed numbers used on pages (arithmetic checked in this build): s2 calculator
variants - rival quote 450 gives a $459 ceiling, zone $372 to $459, 87 wide, opener inside; spot
price 420 gives a $432 floor, no zone, $11 gap. s3 - Kestrel's target $390; its opener $385
(precise variant $386.40 built from the rival quote less a stated volume discount); a wrong-way
counter at $440 ($15 from the opener); illustrative settlement "near $418"; $70 between the two
openers. s5 - net gain per trade: payment +$8, volume guarantee +$6, delivery window +$5, total
+$19; at a $396 package price Kestrel gains $6 and Brightwell $13 per 1,000 against halfway.

Both the ZOPA numbers and the package numbers are computed by `negotiation-live.js`
(`zopa`, `tradeCase`) and by `negotiation_reference.py`; they agree.

## Bench canon (session 4) - measured, node == python, 113 numbers, 0 mismatches

Dataset: FAIR "Deal or No Deal?" (Lewis, Yarats, Dauphin, Parikh, Batra 2017), file
`src/data/negotiate/data.txt` in github.com/facebookresearch/end-to-end-negotiator, licence
CC BY-NC 4.0 (repo LICENSE, read at source). 12,234 perspective lines -> 5,916 paired dialogues ->
39 disconnects dropped -> 5,877 completed. Full set: 81.1% deals, 6.06 mean points per person.
Seeded sample (random.Random(2017)) of 4,000 shipped as derived integers only (no dialogue text):
`assets/negotiation-sample.js`, 172,928 bytes. Build: `materials/build-dealornodeal-sample.py`.
First-proposal reader: rule-based; tuned on 200 hand-read parses (11 misreadings found and fixed),
then 100 fresh parses on a new seed all read correctly. Reads a complete proposal in 5,487 of 5,877
(93.4%) of the full set and 3,732 of 4,000 (93.3%) of the sample.

| Number | Value (as the widget prints) |
|---|---|
| Real negotiations | 4000 |
| Reached a deal | 81.0% |
| Walked away (no agreement) | 11.7% |
| Entered different splits (scored 0) | 7.3% |
| Points per person | 6.06 |
| Most a pool could create (mean joint) | 15.46 |
| Chats with a readable first proposal | 3,732 of 4,000 |
| First proposal by the first typist | 86.7% |
| First proposal in the first message | 82.0% |
| Deals with a parsed opener | 3013 |
| Opener's final points, deals | 7.65 |
| Responder's final points, deals | 7.23 |
| Opener ahead / tie / behind | 49.7% / 15.5% / 34.8% |
| Anchor r (ask vs opener final) | 0.55 |
| Slope, points per point asked | 0.56 |
| First proposal accepted as written | 40.5% |
| r, deals where opener moved | 0.35 (1793 deals) |
| r, holding the pool fixed (partial on the Nash-point value) | 0.41 |
| Break button (mulberry32 seed 20170615 shuffle) | r 0.05 |
| Ask 0-5: chats / deal rate / opener if deal / opener all | 183 / 69.4% / 5.97 / 4.14 |
| Ask 6-7 | 800 / 80.6% / 6.29 / 5.08 |
| Ask 8-10 | 2749 / 81.5% / 8.14 / 6.64 |
| Ladder: split the difference | joint 10.00, 64.7%, left 5.46, frontier 6.3%, gap 0.00; win-win existed in 85.9% |
| Ladder: people, walk-aways as 0 | 12.12, 78.4%, left 3.34, frontier 62.4%, gap 1.58 |
| Ladder: people, deals only (n 3240) | 14.96, 95.0%, left 0.78, frontier 77.0%, gap 1.95 |
| Ladder: trade across issues | 15.46, 100.0%, left 0.00, frontier 100.0%, gap 2.65 |
| Ladder: trade, then balance | 15.41, 99.7%, left 0.05, frontier 100.0%, gap 2.21 |
| Python build-along (s4 step 7) | prints "3013 deals, anchor r = 0.55" and "shuffled r = 0.01" (Python's own shuffle) |

Cross-checks against the paper (Table 2, read at source): 5,808 dialogues, 2,236 scenarios, 6.6
turns, 80.1% agreed, mean score 6.0, 76.9% of agreed deals Pareto optimal. Ours: 81.1% (full),
6.06, 77.0% (sample deals). The released file holds more dialogues than the paper counted.

Honest limits: Mechanical Turk workers, US only, paid $0.15 a dialogue + $0.05 bonus for a maximal
score (paper section 2.3, read at source). Low stakes. Values private and fixed. The trade rungs
know both sides' values; acceptance is not modelled.

## Verified facts by session, with tiers

### Session 1 - Positions and interests

- Fisher, R. and Ury, W. (1981) Getting to Yes: Negotiating Agreement Without Giving In. Houghton
  Mifflin. 2nd ed 1991 adds Bruce Patton and "Ten Questions People Ask About Getting to Yes"
  (reported: catalogue records, Wikipedia). 3rd ed Penguin 3 May 2011, ISBN 9780143118756, 240 pp,
  "updated and revised" (read-at-source: Penguin Random House page).
- **The book's own text could not be opened in this build** (archive.org copy access-restricted;
  Google Books over quota). Every claim about its contents is **reported**, and pages must say so
  once ("the book itself could not be opened for these pages; the summary below follows its
  publisher and standard secondary accounts").
- The four principles: separate the people from the problem; focus on interests, not positions;
  invent options for mutual gain; insist on using objective criteria (reported: Wikipedia; the
  publisher blurb, read at source, names the first three in its own words).
- "Principled negotiation" is the book's name for the method, "developed at the Harvard
  Negotiation Project" (reported). "The Harvard method" is a third-party label; say "principled
  negotiation, often called the Harvard method".
- Library window example: two people in a library, one wants the window open for air, one closed
  to avoid a draft; the librarian opens a window in the next room (reported: Colorado College
  Special Collections blog 2011 citing p.40 of the 1991 edition). Commonly traced further back to
  Mary Parker Follett; NOT verified in this build: do not claim Follett.
- Egypt-Israel Sinai example: Israel wanted security, Egypt sovereignty; resolved by returning
  Sinai with demilitarised zones (reported: Wikipedia, LitCharts; Ch. 3 "Focus on Interests, Not
  Positions").
- "Win-win": cannot claim the book uses or avoids it. The 3rd-ed publisher page quotes Galbraith
  calling the book "a coherent brief for 'win-win' negotiations" (read-at-source). Attribute the
  phrase to commentators.
- Critique: James J. White, "The Pros and Cons of Getting to YES", 34 J. Legal Educ. 115 (1984)
  (read-at-source, abstract: Michigan Law repository). Praises the critique of positional
  bargaining; argues the book denies or oversimplifies distributive bargaining, the hard part where
  value must be divided. Fisher's reply: NOT found; do not cite it.
- Gerald Steinberg 1982 critique "as it should be, not as it is": reported via Wikipedia only;
  optional, attribute if used.

### Session 2 - Walk-away points and the deal zone

- BATNA = Best Alternative To a Negotiated Agreement, introduced in Getting to Yes 1981 (reported:
  Spangler, "BATNA", Beyond Intractability 2003/2012, quotes the book calling BATNA the standard
  against which any proposed agreement should be measured). Say "introduced by" or "popularised
  by", never "invented".
- Reservation price and the zone-of-agreement framework: popularised by Howard Raiffa, The Art and
  Science of Negotiation (Harvard University Press, 1982), sole author; developed by Lax and
  Sebenius, The Manager as Negotiator (1986) (reported). Who first wrote "ZOPA" is unresolved:
  do not say "coined".
- Calculator canon: see the constructed table above ($421 / $372 / $49 / $455 / $34 above).
- Teach: BATNA is not the bottom line; the bottom line is derived from it (reservation point);
  improve your BATNA before the meeting; estimate theirs; the zone is invisible to both sides.

### Session 3 - The first number in the room

- Galinsky, A. D. and Mussweiler, T. (2001) "First offers as anchors: the role of
  perspective-taking and negotiator focus", Journal of Personality and Social Psychology 81(4),
  657-669, doi 10.1037/0022-3514.81.4.657. **Read at source: abstract (PubMed 11642352). Full text
  closed.** Three experiments; whichever party made the first offer, buyer or seller, obtained the
  better outcome, and first offers strongly predicted final settlement prices. Focusing on
  information inconsistent with the first offer eliminated the advantage: Exp 1 the opponent's
  alternatives, Exp 2 the opponent's reservation price, Exp 3 one's own target. Held face-to-face
  and over e-mail. **Print no r, no sample size, no "MBA students", no "pharmaceutical plant" for
  this paper.**
- Galinsky (2004) "When to Make the First Offer in Negotiations", HBS Working Knowledge, 9 Aug 2004
  (read-at-source). Going first is a mistake when the other side has much more information; offers
  should be aggressive but not absurd. Cites Mussweiler's German mechanics study (anchor DM 5,000
  vs DM 2,800 -> valuations about DM 1,000 higher): reported via Galinsky.
- Gunia, Swaab, Sivanathan and Galinsky (2013) "The Remarkable Robustness of the First-Offer
  Effect: Across Culture, Power, and Issues", Personality and Social Psychology Bulletin 39,
  1547-1558 (read-at-source, abstract). Holds across cultures and multi-issue deals; low-power
  negotiators also gain by opening; works through distributive issues.
- Maaravi, Pazy and Ganzach (2014) "Winning a battle but losing the war: On the drawbacks of using
  the anchoring tactic in distributive negotiations", Judgment and Decision Making 9(6), 548-557
  (read-at-source, PDF). Anchoring buyers earned more, but counterparts felt worse and were less
  willing to deal again; in a market, anchoring cut cumulative profit through more impasses and
  longer talks.
- Loschelder, Swaab, Trötschel and Galinsky (2014) "The first-mover disadvantage: The folly of
  revealing compatible preferences", Psychological Science 25(4), 954-962 (read-at-source,
  abstract). Opening with an offer that revealed compatible preferences backfired, mostly against
  proself recipients.
- Loschelder, Trötschel, Swaab, Friese and Galinsky (2016) "The information-anchoring model of
  first offers", Journal of Applied Psychology 101(7), 995-1012 (read-at-source, abstract): a first
  offer anchors AND leaks priorities; revealing priorities produced a first-mover disadvantage
  against proself recipients, who feigned priorities on their own low-priority issues.
- Loschelder, Stuppi and Trötschel (2014) "€14,875?!: Precision boosts the anchoring potency of
  first offers", Social Psychological and Personality Science 5, 491-499 (read-at-source,
  abstract). Precise anchors seem more plausible and anchor harder.
- Bench link: real-rows anchor r 0.55 / 0.35 / 0.41 / shuffled 0.05 (measured, s4).
- The disagreement to teach: go first (Galinsky 2001, Gunia 2013) vs costs of going first
  (information leak, Loschelder 2014/2016; relationship and impasse costs, Maaravi 2014) vs Voss's
  popular advice to let the other side go first (reported; his book, not a study). Do not resolve.

### Session 5 - Trade across issues

- Thompson, L. and Hastie, R. (1990) "Social perception in negotiation", Organizational Behavior
  and Human Decision Processes 47(1), 98-123 (read-at-source, abstract on Kellogg faculty page).
  Negotiators tended to assume at the start that interests were completely opposed (fixed-sum
  error); accurate perception of the other side's interests went with better outcomes; many
  missed fully compatible interests (incompatibility error) and settled for suboptimal
  compromises. The two errors were independent. **Print no percentages from this paper.**
- Pruitt (1983) "Achieving integrative agreements", in Bazerman and Lewicki (eds.) Negotiating in
  Organizations (reported, abstract summary): five routes - expanding the pie, nonspecific
  compensation, logrolling, cost cutting, bridging.
- Bench link: trade across issues 100.0% vs split 64.7%; trade-then-balance 99.7%, gap 2.21 vs
  2.65 (measured).
- Constructed package: see the table above.

### Session 6 - Saying no, closing, and the next deal

- Closing in writing: 7.3% of the bench negotiations ended with the two sides entering different
  splits, which the task scores as zero for both (measured, s4). A deal remembered differently is
  not a deal. In Lewis et al., both agents independently output what they think was agreed; if
  they conflict, both get zero (read-at-source, section 2.1).
- Chris Voss, with Tahl Raz, Never Split the Difference (2016). Career (reported: Wikipedia, speaker
  bios; no fbi.gov page found): 24-year FBI career; FBI's lead international kidnapping negotiator
  2003-2007; retired 2007; founded The Black Swan Group. Do not print "150 cases" or the JTTF dates
  (internal contradiction in the source).
- Voss techniques: tactical empathy, "that's right" vs "you're right", labelling, mirroring, and
  "splitting the difference is bad" are his framing and hostage-case anecdotes; no peer-reviewed
  test of the book as a method was found (reported).
- Nearest evidence, none tests Voss directly:
  - van Baaren, Holland, Steenaert and van Knippenberg (2003) "Mimicry for money: Behavioral
    consequences of imitation", Journal of Experimental Social Psychology 39(4), 393-398
    (read-at-source, abstract): a waitress who repeated customers' orders verbatim got
    significantly larger tips. A tipping study, not a negotiation.
  - Maddux, Mullen and Galinsky (2008) "Chameleons bake bigger pies and take bigger pieces:
    Strategic behavioral mimicry facilitates negotiation outcomes", Journal of Experimental Social
    Psychology 44, 461-468 (read-at-source, author PDF): mimicking mannerisms (not words); Study 2:
    10 of 15 dyads with a mimicking buyer reached a deal vs 2 of 16 without (67% vs 12.5%),
    mediated by trust.
  - Lieberman et al. (2007) "Putting feelings into words: affect labeling disrupts amygdala
    activity in response to affective stimuli", Psychological Science 18(5), 421-428
    (read-at-source, abstract): naming the emotion in negative images reduced amygdala response.
    Lab emotion regulation, not negotiation outcomes. Do not claim Voss cites it.
- Mehrabian 7-38-55: Mehrabian's own page (read-at-source, kaaj.com/psych/smorder.html): the
  formula is about total liking from verbal, vocal and facial cues and does not apply unless the
  speaker is talking about feelings or attitudes. Any "93% of communication is non-verbal" use is a
  misquote. Whether Voss's book uses it: reported only, do not assert.
- Grep 2026-10-06 of learn-*/courses: no sibling page states the 7-38-55 rule or Voss claims; no
  sibling fix needed.
- Saying no while keeping the relationship: William Ury, The Power of a Positive No (2007)
  (reported; not read): yes to your interest, no to the request, yes to a proposal. Optional; if
  used, attribute and mark reported.
- Lewis et al. deception: the paper says its trained agents learned to deceive, feigning interest
  in a valueless item to concede it later (read-at-source). The "Facebook shut the bots down"
  story: researcher Dhruv Batra's post called coverage clickbait (reported via press; post not read).

## Seams (one line + link each)

- Negotiation in Chinese business and face: Business Chinese Advanced session 5,
  https://phoebefu6.github.io/learn-business-chinese-advanced-with-phoebe/courses/05-negotiation-and-face.html
  (read in this build: Graham and Lam, HBR Oct 2003, "mutual loss of face"; three softened refusals;
  the if-clause concession; trade, do not give). Link from s1 or s6, one line, no re-teaching.
- Difficult conversations, bad news, disagreement: Communication session 6,
  https://phoebefu6.github.io/learn-communication-with-phoebe/courses/06-bad-news-and-disagreement.html
  (link from s6).
- Pricing: Economics, Pricing with the number,
  https://phoebefu6.github.io/learn-economics-with-phoebe/courses/p3-pricing-with-the-number.html
  (link from s2 or s3: set a price from demand data before you negotiate it).

## Not covered (honest list)

- Multi-party and coalition negotiation; auctions (see Economics p6); mediation and arbitration
  procedure; labour and union bargaining law; legal enforceability of contracts.
- Cross-cultural negotiation beyond the one seam link.
- Salary negotiation specifics and gender-and-negotiation research (not read in this build).
- The text of Getting to Yes itself (closed in this build; all its content reported).
- Full texts of Galinsky and Mussweiler 2001, Loschelder 2014/2016, Gunia 2013 (abstracts only).

## Citation appendix (exact forms for pages)

- Fisher, R., Ury, W. (1981). Getting to Yes: Negotiating Agreement Without Giving In. Houghton
  Mifflin. 3rd ed. with B. Patton, Penguin, 2011. (reported)
- White, J. J. (1984). The Pros and Cons of "Getting to YES". Journal of Legal Education 34, 115.
- Raiffa, H. (1982). The Art and Science of Negotiation. Harvard University Press. (reported)
- Galinsky, A. D., Mussweiler, T. (2001). First offers as anchors. JPSP 81(4), 657-669.
- Galinsky, A. D. (2004). When to Make the First Offer in Negotiations. HBS Working Knowledge.
- Gunia, B. C., Swaab, R. I., Sivanathan, N., Galinsky, A. D. (2013). PSPB 39, 1547-1558.
- Maaravi, Y., Pazy, A., Ganzach, Y. (2014). Judgment and Decision Making 9(6), 548-557.
- Loschelder, D. D., Swaab, R. I., Trötschel, R., Galinsky, A. D. (2014). Psychological Science 25(4), 954-962.
- Loschelder, D. D., Trötschel, R., Swaab, R. I., Friese, M., Galinsky, A. D. (2016). Journal of Applied Psychology 101(7), 995-1012.
- Loschelder, D. D., Stuppi, J., Trötschel, R. (2014). SPPS 5, 491-499.
- Thompson, L., Hastie, R. (1990). OBHDP 47(1), 98-123.
- Pruitt, D. G. (1983). Achieving integrative agreements. In Bazerman and Lewicki (eds.). (reported)
- Lewis, M., Yarats, D., Dauphin, Y. N., Parikh, D., Batra, D. (2017). Deal or No Deal? End-to-End
  Learning for Negotiation Dialogues. arXiv:1706.05125 (EMNLP 2017).
- Voss, C., Raz, T. (2016). Never Split the Difference. (reported)
- van Baaren, R. B., Holland, R. W., Steenaert, B., van Knippenberg, A. (2003). JESP 39(4), 393-398.
- Maddux, W. W., Mullen, E., Galinsky, A. D. (2008). JESP 44, 461-468.
- Lieberman, M. D., et al. (2007). Psychological Science 18(5), 421-428.
- Mehrabian, A. Silent Messages; author's page kaaj.com/psych/smorder.html.
