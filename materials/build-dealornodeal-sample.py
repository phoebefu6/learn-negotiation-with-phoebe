#!/usr/bin/env python3
"""Build the session-4 bench sample from the FAIR "Deal or No Deal?" dataset.

Internal build script. Not linked from any audience-facing page.

Source: Lewis, Yarats, Dauphin, Parikh and Batra (2017), "Deal or No Deal? End-to-End Learning
for Negotiation Dialogues", EMNLP 2017, arXiv:1706.05125. Data file:
https://github.com/facebookresearch/end-to-end-negotiator  src/data/negotiate/data.txt
Licence: CC BY-NC 4.0 (repo LICENSE). Only DERIVED integer features are shipped; no dialogue
text leaves this script, so the sample stays compact and carries no verbatim worker text.

Usage
-----
  python3 materials/build-dealornodeal-sample.py <path-to-data.txt> [--write-sample]
  python3 materials/build-dealornodeal-sample.py <path-to-data.txt> --audit 60   (print parses to hand-check)

What it does
------------
1. Pairs the two perspectives of each dialogue (each dialogue appears twice in data.txt, once
   from each worker's side). Drops dialogues where either side disconnected.
2. Outcome: agree (both outputs are consistent and sum to the pool), no agreement, or conflict
   (outputs inconsistent; the task gives both sides 0, per paper section 2.1).
3. First proposal: the first utterance, by either side, that a rule-based reader can resolve into a
   COMPLETE split of the pool. Speaker A is always the person who typed the first message.
4. Seeded sample of 4,000 dialogues (random.Random(2017)), written as one flat integer array.

Row layout (21 ints): c0 c1 c2 | a0 a1 a2 | b0 b1 b2 | outcome | fa0 fa1 fa2 | prop | o0 o1 o2 | t | n | pa pb
  c = item counts (book, hat, ball); a/b = A's and B's private values per item
  outcome 0 agree, 1 no agreement, 2 conflict; fa = items A ended with (-1 if no deal)
  prop 0 none parsed, 1 A, 2 B; o = items the proposer claimed for themselves in the first proposal
  t = turn index of the first proposal (0-based); n = number of turns
  pa, pb = final points to A and B (0 when no deal)
"""
import json
import random
import re
import sys
from collections import Counter, defaultdict

ITEMS = {
    "book": 0, "books": 0,
    "hat": 1, "hats": 1,
    "ball": 2, "balls": 2, "basketball": 2, "basketballs": 2,
}
NUMW = {"couple": 2, "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "single": 1,
        "1": 1, "2": 2, "3": 3, "4": 4, "5": 5}
ALLW = {"all", "both", "every", "each", "all the", "all of the", "all three", "all four", "all two"}
REST = re.compile(r"\b(the rest|rest of|everything else|all else|anything else|the others|the remaining|remainder|all the other|everything)\b")
SELF_CUE = re.compile(r"\b(i|i'd|id|i'll|ill|im|i'm|me|my|mine)\b")
OTHER_CUE = re.compile(r"\b(you|your|yours|u)\b")


def parse_line(l):
    t = l.split()
    inp = list(map(int, t[:6]))
    rest = " ".join(t[6:])
    dia, sel = rest.split("<selection>")
    sel, tail = sel.split("<eos>", 1)
    tt = tail.split()
    return dict(inp=inp, pin=list(map(int, tt[-6:])), dia=dia.strip(), sel=sel.strip())


def swap(d):
    return d.replace("YOU:", "@@").replace("THEM:", "YOU:").replace("@@", "THEM:")


def mentions(seg, counts):
    """Item mentions in a text segment -> {item: qty} or None if ambiguous."""
    out = {}
    toks = seg.replace(",", " ").replace(".", " ").replace("?", " ").replace("!", " ").split()
    for i, w in enumerate(toks):
        if w not in ITEMS:
            continue
        k = ITEMS[w]
        plural = w.endswith("s")
        prev = toks[i - 1] if i >= 1 else ""
        prev2 = " ".join(toks[i - 2:i]) if i >= 2 else ""
        if prev in ("few", "some", "several", "more", "other", "extra"):
            return None
        if prev == "the" and i >= 3 and toks[i - 2] == "of" and toks[i - 3] in NUMW:
            q = NUMW[toks[i - 3]]            # "one of the books"
        elif prev == "of" and i >= 3 and toks[i - 2] == "couple":
            q = 2                            # "a couple of balls"
        elif prev in ("of",) and i >= 3 and toks[i - 2] == "all":
            q = counts[k]
        elif prev in NUMW:
            q = NUMW[prev]
        elif prev2 in ALLW or prev in ("all", "both", "every"):
            q = counts[k]
        elif prev == "the" and prev2.split()[0:1] and prev2.split()[0] in NUMW:
            q = NUMW[prev2.split()[0]]
        elif prev in ("the", "those", "these", "my", "your") or prev not in NUMW:
            q = counts[k] if (plural or counts[k] == 1) else 1
        else:
            q = None
        if q is None or q > counts[k]:
            return None
        if k in out and out[k] != q:
            return None
        out[k] = q
    return out


def split_owner(utt):
    """Split an utterance into clauses and tag each clause self / other."""
    # Re-find the cues with their spans so each clause knows its owner.
    cue = re.compile(r"(?P<o>\byou can have\b|\byou could have\b|\byou get\b|\byou take\b|\byou keep\b|"
                     r"\byou have\b|\bgive you\b|\bto you\b|\bfor you\b|\bfor yourself\b|\byou can take\b|"
                     r"\byou can keep\b|\byou could take\b|\byou may have\b|\byou would get\b|"
                     r"^take\b|^keep\b|\band take\b|\boffer\b|\bi can give\b|\bi'll give\b|\bi will give\b)|"
                     r"(?P<s>\bi get\b|\bi keep\b|\bi take\b|\bi'll take\b|\bill take\b|\bi want\b|"
                     r"\bi need\b|\bi would like\b|\bi'd like\b|\bid like\b|\bi would love\b|\bi'd love\b|"
                     r"\bgive me\b|\bto me\b|\bfor me\b|\bcan i have\b|\bcan i get\b|\bcould i have\b|"
                     r"\bcould i get\b|\bif i can have\b|\bif i get\b|\bi can have\b|\bi'll have\b|"
                     r"\bi will take\b|\bi will have\b|\bi would take\b|\bi'd take\b|\bi'll keep\b|"
                     r"\bi will keep\b|\bmay i have\b|\bi just need\b|\bi really need\b|\bi only need\b|"
                     r"\bi would need\b|\bi must have\b|\bi'd need\b|\bi'm taking\b|\bim taking\b|"
                     r"\bi could use\b|\bi'd be happy with\b|\bi'll be happy with\b|\bi would be happy with\b|"
                     r"\bi would be great with\b|\bi'll be fine with\b)")
    segs = []
    pos = [(m.start(), "other" if m.group("o") else "self") for m in cue.finditer(utt)]
    if not pos:
        return segs
    for j, (st, own) in enumerate(pos):
        end = pos[j + 1][0] if j + 1 < len(pos) else len(utt)
        segs.append((own, utt[st:end]))
    return segs


def parse_offer(utt, counts):
    """Return the items the SPEAKER claims for themselves, as a list of 3 ints, or None."""
    u = " " + utt.lower().strip() + " "
    if "no deal" in u or "deal" == u.strip() or "<selection>" in u:
        return None
    if re.search(r"\b(as well|too|also|instead|another|more|either|or|other of|choosing|choice|"
                 r"them|it|at least|for (a|an|the|one|two|three|1|2|3|your|all))\b", u):
        return None                          # add-ons, alternatives, pronouns, swaps: not a full split
    toks = re.findall(r"[a-z']+", u)
    if any(re.search(r"book|hat|ball", w) and w not in ITEMS and w not in ("basket", "whatever", "that", "what", "chat")
           for w in toks):
        return None                          # misspelt or possessive item word: do not guess
    # Postfix owners ("hat and 3 balls for me, 2 books for you"): rewrite each clause as a prefix.
    parts = re.split(r"([,;.]+|\band\b(?= (?:i|you)\b))", u)
    for pi, part in enumerate(parts):
        m2 = re.search(r"^(.*\S)\s+(for|to) (me|you)\s*$", part)
        if m2 and not re.search(r"\b(give|offer|let|are|is|worth|value|valuable)\b", m2.group(1)):
            parts[pi] = (" i get " if m2.group(3) == "me" else " you get ") + m2.group(1) + " "
    u = "".join(parts)
    m1 = re.search(r"\b(one|1) of each", u)
    if m1:
        if re.search(r"\byou\b", u[:m1.start()]):
            self_ = [c - 1 for c in counts]  # "i'm sending you 1 of each"
        elif re.search(r"\b(i|i'll|i'd|me)\b", u):
            self_ = [1, 1, 1]
        else:
            return None
        return self_ if all(0 <= self_[k] <= counts[k] for k in range(3)) else None
    segs = split_owner(u.strip())
    if not segs:
        return None
    S, O = {}, {}
    rest_self = rest_other = False
    for own, seg in segs:
        m = mentions(seg, counts)
        if m is None:
            return None
        has_rest = bool(REST.search(seg))
        tgt = S if own == "self" else O
        for k, q in m.items():
            if k in tgt and tgt[k] != q:
                return None
            tgt[k] = q
        if has_rest:
            if own == "self":
                rest_self = True
            else:
                rest_other = True
    if not S and not O:
        return None
    if rest_self and rest_other:
        return None
    for k in set(S) & set(O):
        if S[k] + O[k] != counts[k]:
            return None
    self_ = [None, None, None]
    for k in range(3):
        if k in S:
            self_[k] = S[k]
        elif k in O:
            self_[k] = counts[k] - O[k]
    for k in range(3):
        if self_[k] is None:
            if rest_self or (not rest_other and O and not S):
                self_[k] = counts[k]      # "you take X, I keep the rest" or only gives stated
            elif rest_other or (S and not O):
                self_[k] = 0              # "I want X" only: the rest is implicitly offered
            elif S and O:
                return None               # both sides named, an item left unassigned
            else:
                return None
    if any(x < 0 or x > counts[k] for k, x in enumerate(self_)):
        return None
    if self_ == [0, 0, 0] or self_ == list(counts):
        return None
    return self_


def build(path):
    rows = [parse_line(l) for l in open(path).read().splitlines()]
    idx = defaultdict(list)
    for i, r in enumerate(rows):
        idx[(tuple(r["inp"]), tuple(r["pin"]), r["dia"])].append(i)
    seen, pairs = set(), []
    for i, r in enumerate(rows):
        if i in seen:
            continue
        seen.add(i)
        js = [j for j in idx.get((tuple(r["pin"]), tuple(r["inp"]), swap(r["dia"])), []) if j not in seen]
        if js:
            seen.add(js[0])
            pairs.append((i, js[0]))
    recs, stats = [], Counter()
    stats["lines"] = len(rows)
    stats["pairs"] = len(pairs)
    for i, j in pairs:
        X, Y = rows[i], rows[j]
        # Orient so A is the one who typed first.
        A, B = (X, Y) if X["dia"].startswith("YOU:") else (Y, X)
        if "disconnect" in A["sel"] or "disconnect" in B["sel"]:
            stats["disconnect"] += 1
            continue
        counts = A["inp"][0::2]
        va, vb = A["inp"][1::2], B["inp"][1::2]
        turns = [t.strip() for t in A["dia"].split("<eos>") if t.strip()]
        n = len(turns)
        if "no agreement" in A["sel"] or "no agreement" in B["sel"]:
            outcome, fa = 1, [-1, -1, -1]
        else:
            sa = [int(x.split("=")[1]) for x in A["sel"].split()]
            sb = [int(x.split("=")[1]) for x in B["sel"].split()]
            if all(sa[k] + sb[k] == counts[k] for k in range(3)):
                outcome, fa = 0, sa
            else:
                outcome, fa = 2, [-1, -1, -1]
        prop, offer, tix = 0, [0, 0, 0], 0
        for t_i, t in enumerate(turns):
            who, txt = t.split(":", 1)
            o = parse_offer(txt, counts)
            if o is not None:
                prop = 1 if who == "YOU" else 2
                offer, tix = o, t_i
                break
        if outcome == 0:
            pa = sum(fa[k] * va[k] for k in range(3))
            pb = sum((counts[k] - fa[k]) * vb[k] for k in range(3))
        else:
            pa = pb = 0
        recs.append(dict(row=counts + va + vb + [outcome] + fa + [prop] + offer + [tix, n, pa, pb],
                         turns=turns))
        stats["outcome%d" % outcome] += 1
        stats["parsed"] += prop > 0
    stats["dialogues"] = len(recs)
    return recs, stats


def main():
    path = sys.argv[1]
    recs, stats = build(path)
    print(dict(stats))
    if "--audit" in sys.argv:
        k = int(sys.argv[sys.argv.index("--audit") + 1])
        rng = random.Random(int(sys.argv[sys.argv.index("--audit") + 2]) if len(sys.argv) > sys.argv.index("--audit") + 2 else 7)
        withp = [r for r in recs if r["row"][13] > 0]
        for r in rng.sample(withp, k):
            row = r["row"]
            print("pool", row[0:3], "| proposer", "A" if row[13] == 1 else "B",
                  "claims", row[14:17], "|", r["turns"][row[17]][:160])
        return
    rng = random.Random(2017)
    sample = rng.sample(recs, 4000)
    flat = []
    for r in sample:
        flat.extend(r["row"])
    if "--write-sample" in sys.argv:
        head = ("/* negotiation-sample.js - 4,000 real human-human negotiations, seeded sample (2017) of the\n"
                " * 5,877 completed, paired dialogues in the FAIR \"Deal or No Deal?\" dataset (Lewis et al. 2017,\n"
                " * github.com/facebookresearch/end-to-end-negotiator, CC BY-NC 4.0). Derived integer features\n"
                " * only, no dialogue text. 21 ints per dialogue: counts(3) valuesA(3) valuesB(3) outcome finalItemsA(3)\n"
                " * proposer firstOffer(3) offerTurn turns pointsA pointsB. A typed the first message. */\n")
        body = "window.NEG_SAMPLE = " + json.dumps({"n": 4000, "w": 21, "rows": flat}, separators=(",", ":")) + ";\n"
        out = __file__.replace("materials/build-dealornodeal-sample.py", "assets/negotiation-sample.js")
        open(out, "w").write(head + body)
        print("wrote", out, len(head + body), "bytes")


if __name__ == "__main__":
    main()
