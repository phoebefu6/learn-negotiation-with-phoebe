#!/usr/bin/env python3
"""Python reference for the session-4 bench. Internal; not linked from any audience page.

Recomputes every number negotiation-live.js prints, from the same shipped rows
(assets/negotiation-sample.js), independently of the JavaScript engine, then compares with the
node run (materials/run-bench-node.js) when --compare is given.

  python3 materials/negotiation_reference.py            # print the reference numbers
  python3 materials/negotiation_reference.py --compare  # also run node and diff every number
"""
import json
import math
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
M32 = 0xFFFFFFFF


def load():
    s = open(os.path.join(HERE, "..", "assets", "negotiation-sample.js")).read()
    return json.loads(s[s.index("window.NEG_SAMPLE = ") + len("window.NEG_SAMPLE = "):].rstrip().rstrip(";"))


def mulberry32(a):
    st = [a & M32]

    def rnd():
        st[0] = (st[0] + 0x6D2B79F5) & M32
        a_ = st[0]
        t = ((a_ ^ (a_ >> 15)) * (1 | a_)) & M32
        t = ((t + (((t ^ (t >> 7)) * (61 | t)) & M32)) & M32) ^ t
        return ((t ^ (t >> 14)) & M32) / 4294967296
    return rnd


def shuffle(arr, seed):
    a, rnd = list(arr), mulberry32(seed)
    for i in range(len(a) - 1, 0, -1):
        j = math.floor(rnd() * (i + 1))
        a[i], a[j] = a[j], a[i]
    return a


def mean(a):
    return sum(a) / len(a) if a else 0.0


def pearson(x, y):
    mx, my = mean(x), mean(y)
    sxy = sum((a - mx) * (b - my) for a, b in zip(x, y))
    sxx = sum((a - mx) ** 2 for a in x)
    syy = sum((b - my) ** 2 for b in y)
    return sxy / math.sqrt(sxx * syy) if sxx and syy else 0.0


def slope(x, y):
    mx, my = mean(x), mean(y)
    sxx = sum((a - mx) ** 2 for a in x)
    return sum((a - mx) * (b - my) for a, b in zip(x, y)) / sxx if sxx else 0.0


def dot(x, v):
    return x[0] * v[0] + x[1] * v[1] + x[2] * v[2]


def prepare(S):
    W, R, d = S["w"], S["rows"], []
    for r in range(S["n"]):
        g = R[r * W:(r + 1) * W]
        c, va, vb = g[0:3], g[3:6], g[6:9]
        pts = []
        for i in range(c[0] + 1):
            for j in range(c[1] + 1):
                for k in range(c[2] + 1):
                    x = [i, j, k]
                    pts.append((dot(x, va), dot([c[0] - i, c[1] - j, c[2] - k], vb)))
        d.append(dict(c=c, va=va, vb=vb, outcome=g[9], fa=g[10:13], prop=g[13], offer=g[14:17], t=g[17],
                      turns=g[18], pa=g[19], pb=g[20], pts=pts,
                      maxJoint=sum(c[k] * max(va[k], vb[k]) for k in range(3))))
    return d


def dominated(row, x, y):
    return any(p[0] >= x - 1e-9 and p[1] >= y - 1e-9 and (p[0] > x + 1e-9 or p[1] > y + 1e-9) for p in row["pts"])


def rung_point(row, rid):
    c, va, vb = row["c"], row["va"], row["vb"]
    if rid == "split":
        return (dot(c, va) / 2, dot(c, vb) / 2)
    if rid in ("humans", "agreed"):
        return (row["pa"], row["pb"])
    if rid == "logroll":
        a = b = 0.0
        for k in range(3):
            if va[k] > vb[k]:
                a += c[k] * va[k]
            elif vb[k] > va[k]:
                b += c[k] * vb[k]
            else:
                a += c[k] * va[k] / 2
                b += c[k] * vb[k] / 2
        return (a, b)
    if rid == "nash":
        best = None
        for p in row["pts"]:
            prod = p[0] * p[1]
            if best is None or prod > best[0] or (prod == best[0] and p[0] + p[1] > best[1]):
                best = (prod, p[0] + p[1], p)
        return best[2]
    raise ValueError(rid)


def evaluate_rung(d, rid):
    joint, left, gap, par, sJ, sM, both = [], [], [], 0, 0.0, 0.0, 0
    for row in d:
        if rid == "agreed" and row["outcome"] != 0:
            continue
        p = rung_point(row, rid)
        j = p[0] + p[1]
        sJ += j
        sM += row["maxJoint"]
        joint.append(j)
        left.append(row["maxJoint"] - j)
        gap.append(abs(p[0] - p[1]))
        if not dominated(row, p[0], p[1]):
            par += 1
        if any(q[0] > 5 and q[1] > 5 for q in row["pts"]):
            both += 1
    n = len(joint)
    return dict(id=rid, n=n, meanJoint=mean(joint), efficiency=sJ / sM, meanLeft=mean(left), meanGap=mean(gap),
                paretoShare=par / n, bothBeatSplitShare=both / n)


def findings(d):
    out = {}
    out["n"] = len(d)
    out["agreeShare"] = sum(r["outcome"] == 0 for r in d) / len(d)
    out["noDealShare"] = sum(r["outcome"] == 1 for r in d) / len(d)
    out["conflictShare"] = sum(r["outcome"] == 2 for r in d) / len(d)
    pts = []
    for r in d:
        pts += [r["pa"], r["pb"]]
    out["meanPoints"] = mean(pts)
    out["meanMaxJoint"] = mean([r["maxJoint"] for r in d])
    parsed = [r for r in d if r["prop"] > 0]
    out["parsed"] = len(parsed)
    out["openerIsFirstTypist"] = sum(r["prop"] == 1 for r in parsed) / len(parsed)
    out["offerTurnZero"] = sum(r["t"] == 0 for r in parsed) / len(parsed)

    def side(r, who):
        return r["pa"] if who == 1 else r["pb"]

    def vals(r, who):
        return r["va"] if who == 1 else r["vb"]

    ag = [r for r in parsed if r["outcome"] == 0]
    pp = [side(r, r["prop"]) for r in ag]
    rp = [side(r, 3 - r["prop"]) for r in ag]
    ahead = sum(a > b for a, b in zip(pp, rp))
    tie = sum(a == b for a, b in zip(pp, rp))
    out["firstMover"] = dict(n=len(ag), proposer=mean(pp), responder=mean(rp), ahead=ahead / len(ag),
                             tie=tie / len(ag), behind=(len(ag) - ahead - tie) / len(ag),
                             proposerAll=mean([side(r, r["prop"]) for r in parsed]),
                             responderAll=mean([side(r, 3 - r["prop"]) for r in parsed]))
    ask = [dot(r["offer"], vals(r, r["prop"])) for r in ag]
    give = [dot([r["c"][k] - r["offer"][k] for k in range(3)], vals(r, 3 - r["prop"])) for r in ag]
    an = dict(n=len(ag), r=pearson(ask, pp), slope=slope(ask, pp), meanAsk=mean(ask), rGive=pearson(give, rp),
              meanGive=mean(give))
    as_is, ax, ay, nash_op = 0, [], [], []
    for i, r in enumerate(ag):
        m = r["fa"] if r["prop"] == 1 else [r["c"][k] - r["fa"][k] for k in range(3)]
        if list(m) == list(r["offer"]):
            as_is += 1
        else:
            ax.append(ask[i])
            ay.append(pp[i])
        np_ = rung_point(r, "nash")
        nash_op.append(np_[0] if r["prop"] == 1 else np_[1])
    an["acceptedAsIs"] = as_is / len(ag)
    an["nMoved"] = len(ax)
    an["rMoved"] = pearson(ax, ay)
    rxy, rxz, ryz = an["r"], pearson(ask, nash_op), pearson(pp, nash_op)
    an["rPoolAsk"], an["rPoolFinal"] = rxz, ryz
    an["rPartial"] = (rxy - rxz * ryz) / math.sqrt((1 - rxz * rxz) * (1 - ryz * ryz))
    out["anchor"] = an
    bands = []
    for lo, hi in [(0, 5), (6, 7), (8, 10)]:
        rows = [r for r in parsed if lo <= dot(r["offer"], vals(r, r["prop"])) <= hi]
        dealt = [r for r in rows if r["outcome"] == 0]
        bands.append(dict(lo=lo, hi=hi, n=len(rows), dealShare=len(dealt) / len(rows),
                          proposerIfDeal=mean([side(r, r["prop"]) for r in dealt]),
                          proposerAll=mean([side(r, r["prop"]) for r in rows])))
    out["askBands"] = bands
    agreed = [r for r in d if r["outcome"] == 0]
    sj = sum(r["pa"] + r["pb"] for r in agreed)
    sm = sum(r["maxJoint"] for r in agreed)
    out["integrative"] = dict(n=len(agreed), efficiency=sj / sm, meanJoint=sj / len(agreed), meanMax=sm / len(agreed),
                              meanLeft=mean([r["maxJoint"] - r["pa"] - r["pb"] for r in agreed]),
                              paretoShare=sum(not dominated(r, r["pa"], r["pb"]) for r in agreed) / len(agreed))
    return out, ask, pp


def zopa(p):
    buyer = p["rivalQuote"] + p["switchCost"]
    seller = p["spotPrice"] + p["extraCost"]
    w = buyer - seller
    return dict(buyerRP=buyer, sellerRP=seller, width=w, exists=w >= 0, mid=(buyer + seller) / 2,
                offerInside=seller <= p["firstOffer"] <= buyer, offerAboveBuyerRP=p["firstOffer"] - buyer,
                splitFromOffer=(p["firstOffer"] + seller) / 2)


CASE = dict(rivalQuote=412, switchCost=9, spotPrice=360, extraCost=12, firstOffer=455)

def trade_case():
    t = dict(volume=2400, pay30=(3, 11), commit=(2, 8), window2=(7, 2))

    def value(price, pay30, commit, window2):
        k = price + (t["pay30"][0] if pay30 else 0) + (t["commit"][0] if commit else 0) - (t["window2"][0] if window2 else 0)
        b = price + (t["pay30"][1] if pay30 else 0) + (t["commit"][1] if commit else 0) - (t["window2"][1] if window2 else 0)
        return dict(kestrelEffectiveCost=k, brightwellEffectiveRevenue=b)
    half, trade = value(400, False, False, False), value(392, True, True, True)
    ks = half["kestrelEffectiveCost"] - trade["kestrelEffectiveCost"]
    bg = trade["brightwellEffectiveRevenue"] - half["brightwellEffectiveRevenue"]
    return dict(halfway=half, trade=trade, kestrelSavesPer1000=ks, brightwellGainsPer1000=bg, jointPer1000=ks + bg,
                kestrelSavesYear=ks * t["volume"], brightwellGainsYear=bg * t["volume"], jointYear=(ks + bg) * t["volume"])


RUNGS = ["split", "humans", "agreed", "logroll", "nash"]


def evaluate_all():
    d = prepare(load())
    f, ask, pp = findings(d)
    s = shuffle(ask, 20170615)
    return dict(findings=f, ladder={r: evaluate_rung(d, r) for r in RUNGS},
                broken=dict(r=pearson(s, pp), slope=slope(s, pp)), zopa=zopa(CASE), trade=trade_case())


def flatten(o, pre=""):
    if isinstance(o, dict):
        out = {}
        for k, v in o.items():
            out.update(flatten(v, pre + "." + k if pre else k))
        return out
    if isinstance(o, list):
        out = {}
        for i, v in enumerate(o):
            out.update(flatten(v, "%s[%d]" % (pre, i)))
        return out
    return {pre: o}


def main():
    ref = evaluate_all()
    if "--compare" not in sys.argv:
        print(json.dumps(ref, indent=1))
        return
    node = json.loads(subprocess.run(["node", os.path.join(HERE, "run-bench-node.js")], capture_output=True,
                                     text=True, check=True).stdout)
    a, b = flatten(ref), flatten(node)
    bad = 0
    for k in sorted(set(a) | set(b)):
        x, y = a.get(k), b.get(k)
        if isinstance(x, bool) or isinstance(y, bool) or isinstance(x, str):
            ok = x == y
        else:
            ok = x is not None and y is not None and abs(x - y) < 1e-9
        if not ok:
            bad += 1
            print("MISMATCH", k, x, y)
    print("compared %d numbers, %d mismatches" % (len(a), bad))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
