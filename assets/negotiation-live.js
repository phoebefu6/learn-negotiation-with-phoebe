/* negotiation-live.js - the anchor bench and the ZOPA calculator for learn-negotiation-with-phoebe
 *
 * The bench reads 4,000 real human-human negotiations (negotiation-sample.js: a seeded sample of
 * the FAIR "Deal or No Deal?" dialogues, Lewis et al. 2017, CC BY-NC 4.0). Each pair of strangers
 * split a pool of books, hats and balls; each person had private values summing to 10 points.
 *
 * What is REAL: the pools, both sides' private values, who agreed, the agreed split, the points
 *   each person walked away with, and the first complete proposal in each chat (read by a
 *   rule-based parser from the dialogue text, at build time).
 * What is REPLAYED, and labelled so on the widget: the strategy ladder. Each rung applies an
 *   allocation rule to the REAL pools and REAL private values. It does not model whether the
 *   other person would have accepted; it measures what the rule leaves on the table.
 *
 * Every number on the session pages is printed by this file. A Python reference
 * (negotiation_reference.py) reproduces each one from the same rows.
 */
(function (root) {
  "use strict";

  /* ---------- seeded PRNG, identical in the Python reference ---------- */
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, seed) {
    var a = arr.slice(), rnd = mulberry32(seed);
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- helpers ---------- */
  function sum(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s; }
  function mean(a) { return a.length ? sum(a) / a.length : 0; }
  function pearson(x, y) {
    var mx = mean(x), my = mean(y), sxy = 0, sxx = 0, syy = 0;
    for (var i = 0; i < x.length; i++) {
      var dx = x[i] - mx, dy = y[i] - my;
      sxy += dx * dy; sxx += dx * dx; syy += dy * dy;
    }
    return (sxx && syy) ? sxy / Math.sqrt(sxx * syy) : 0;
  }
  function slope(x, y) {
    var mx = mean(x), my = mean(y), sxy = 0, sxx = 0;
    for (var i = 0; i < x.length; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) * (x[i] - mx); }
    return sxx ? sxy / sxx : 0;
  }
  function dot(x, v) { return x[0] * v[0] + x[1] * v[1] + x[2] * v[2]; }

  /* every whole-item split of a pool: items to A */
  function allocations(c) {
    var out = [];
    for (var i = 0; i <= c[0]; i++) for (var j = 0; j <= c[1]; j++) for (var k = 0; k <= c[2]; k++) out.push([i, j, k]);
    return out;
  }

  /* ---------- rows ---------- */
  function prepare(S) {
    var W = S.w, R = S.rows, d = [];
    for (var r = 0; r < S.n; r++) {
      var o = r * W, g = R.slice(o, o + W);
      var c = g.slice(0, 3), va = g.slice(3, 6), vb = g.slice(6, 9);
      var pts = allocations(c).map(function (x) {
        return [dot(x, va), dot([c[0] - x[0], c[1] - x[1], c[2] - x[2]], vb)];
      });
      var maxJoint = 0;
      for (var k = 0; k < 3; k++) maxJoint += c[k] * Math.max(va[k], vb[k]);
      d.push({
        c: c, va: va, vb: vb, outcome: g[9], fa: g.slice(10, 13), prop: g[13], offer: g.slice(14, 17),
        t: g[17], turns: g[18], pa: g[19], pb: g[20], pts: pts, maxJoint: maxJoint
      });
    }
    return d;
  }

  /* is the point (x, y) dominated by some whole-item split? */
  function dominated(row, x, y) {
    for (var i = 0; i < row.pts.length; i++) {
      var p = row.pts[i];
      if (p[0] >= x - 1e-9 && p[1] >= y - 1e-9 && (p[0] > x + 1e-9 || p[1] > y + 1e-9)) return true;
    }
    return false;
  }

  /* ---------- the ladder: allocation rules replayed on real values ---------- */
  var RUNGS = [
    { id: "split", anti: true, label: "Always split the difference",
      note: "Meet halfway on every item: half the books, half the hats, half the balls. A coin decides an odd item." },
    { id: "humans", label: "What the people actually did",
      note: "The real outcome of every chat, a walk-away counted as 0 points to each side." },
    { id: "agreed", label: "The people, deals only",
      note: "The real outcome, dropping chats that ended without a deal." },
    { id: "logroll", label: "Trade across issues",
      note: "Each item type goes to whoever values it more. A tie is split." },
    { id: "nash", label: "Trade, then balance",
      note: "The whole-item split that maximises the product of both sides' points." }
  ];

  function rungPoint(row, id) {
    var c = row.c, va = row.va, vb = row.vb, k;
    if (id === "split") return [dot(c, va) / 2, dot(c, vb) / 2];
    if (id === "humans" || id === "agreed") return [row.pa, row.pb];
    if (id === "logroll") {
      var a = 0, b = 0;
      for (k = 0; k < 3; k++) {
        if (va[k] > vb[k]) a += c[k] * va[k];
        else if (vb[k] > va[k]) b += c[k] * vb[k];
        else { a += c[k] * va[k] / 2; b += c[k] * vb[k] / 2; }
      }
      return [a, b];
    }
    if (id === "nash") {
      var best = null;
      for (k = 0; k < row.pts.length; k++) {
        var p = row.pts[k], prod = p[0] * p[1];
        if (!best || prod > best[0] || (prod === best[0] && p[0] + p[1] > best[1])) best = [prod, p[0] + p[1], p];
      }
      return best[2];
    }
    throw new Error("unknown rung " + id);
  }

  function evaluateRung(d, id) {
    var joint = [], left = [], gap = [], par = 0, n = 0, sJ = 0, sM = 0, bothBeatSplit = 0;
    for (var i = 0; i < d.length; i++) {
      var row = d[i];
      if (id === "agreed" && row.outcome !== 0) continue;
      var p = rungPoint(row, id), j = p[0] + p[1];
      n++; sJ += j; sM += row.maxJoint;
      joint.push(j); left.push(row.maxJoint - j); gap.push(Math.abs(p[0] - p[1]));
      if (!dominated(row, p[0], p[1])) par++;
      for (var q = 0; q < row.pts.length; q++) {
        if (row.pts[q][0] > 5 && row.pts[q][1] > 5) { bothBeatSplit++; break; }
      }
    }
    return { id: id, n: n, meanJoint: mean(joint), efficiency: sJ / sM, meanLeft: mean(left),
             meanGap: mean(gap), paretoShare: par / n, bothBeatSplitShare: bothBeatSplit / n };
  }

  /* ---------- the measured findings ---------- */
  function findings(d) {
    var out = {};
    var nAgree = 0, nNo = 0, nConf = 0, pts = [];
    d.forEach(function (r) {
      if (r.outcome === 0) nAgree++; else if (r.outcome === 1) nNo++; else nConf++;
      pts.push(r.pa, r.pb);
    });
    out.n = d.length;
    out.agreeShare = nAgree / d.length;
    out.noDealShare = nNo / d.length;
    out.conflictShare = nConf / d.length;
    out.meanPoints = mean(pts);
    out.meanMaxJoint = mean(d.map(function (r) { return r.maxJoint; }));

    var parsed = d.filter(function (r) { return r.prop > 0; });
    out.parsed = parsed.length;
    out.openerIsFirstTypist = parsed.filter(function (r) { return r.prop === 1; }).length / parsed.length;
    out.offerTurnZero = parsed.filter(function (r) { return r.t === 0; }).length / parsed.length;

    /* first mover: points to the first proposer and to the responder */
    function side(r, who) { return who === 1 ? r.pa : r.pb; }
    var ag = parsed.filter(function (r) { return r.outcome === 0; });
    var pp = ag.map(function (r) { return side(r, r.prop); });
    var rp = ag.map(function (r) { return side(r, 3 - r.prop); });
    var ahead = 0, tie = 0;
    for (var i = 0; i < ag.length; i++) { if (pp[i] > rp[i]) ahead++; else if (pp[i] === rp[i]) tie++; }
    out.firstMover = { n: ag.length, proposer: mean(pp), responder: mean(rp),
      ahead: ahead / ag.length, tie: tie / ag.length, behind: (ag.length - ahead - tie) / ag.length,
      proposerAll: mean(parsed.map(function (r) { return side(r, r.prop); })),
      responderAll: mean(parsed.map(function (r) { return side(r, 3 - r.prop); })) };

    /* anchoring: value of the first proposal to its maker vs what the maker ended with */
    function vals(r, who) { return who === 1 ? r.va : r.vb; }
    var ask = ag.map(function (r) { return dot(r.offer, vals(r, r.prop)); });
    var give = ag.map(function (r) {
      return dot([r.c[0] - r.offer[0], r.c[1] - r.offer[1], r.c[2] - r.offer[2]], vals(r, 3 - r.prop));
    });
    out.anchor = { n: ag.length, r: pearson(ask, pp), slope: slope(ask, pp), meanAsk: mean(ask),
      rGive: pearson(give, rp), meanGive: mean(give) };

    /* two confounds, measured rather than waved away */
    function mine(r) { /* items the opener ended with */
      return r.prop === 1 ? r.fa : [r.c[0] - r.fa[0], r.c[1] - r.fa[1], r.c[2] - r.fa[2]];
    }
    var asIs = 0, ax = [], ay = [], nashOpener = [];
    ag.forEach(function (r, i) {
      var m = mine(r);
      if (m[0] === r.offer[0] && m[1] === r.offer[1] && m[2] === r.offer[2]) asIs++;
      else { ax.push(ask[i]); ay.push(pp[i]); }
      var np = rungPoint(r, "nash");
      nashOpener.push(r.prop === 1 ? np[0] : np[1]);
    });
    out.anchor.acceptedAsIs = asIs / ag.length;
    out.anchor.nMoved = ax.length;
    out.anchor.rMoved = pearson(ax, ay);
    /* partial r of ask and final, holding fixed what a balanced deal would give the opener */
    var rxy = out.anchor.r, rxz = pearson(ask, nashOpener), ryz = pearson(pp, nashOpener);
    out.anchor.rPoolAsk = rxz;
    out.anchor.rPoolFinal = ryz;
    out.anchor.rPartial = (rxy - rxz * ryz) / Math.sqrt((1 - rxz * rxz) * (1 - ryz * ryz));

    /* the price of a high anchor: walk-away rate by how much the opener asked for */
    var bands = [[0, 5], [6, 7], [8, 10]];
    out.askBands = bands.map(function (b) {
      var rows = parsed.filter(function (r) {
        var a = dot(r.offer, vals(r, r.prop)); return a >= b[0] && a <= b[1];
      });
      var dealt = rows.filter(function (r) { return r.outcome === 0; });
      return { lo: b[0], hi: b[1], n: rows.length, dealShare: dealt.length / rows.length,
        proposerIfDeal: mean(dealt.map(function (r) { return side(r, r.prop); })),
        proposerAll: mean(rows.map(function (r) { return side(r, r.prop); })) };
    });

    /* integrative potential of the deals people reached */
    var agreed = d.filter(function (r) { return r.outcome === 0; });
    var sj = 0, sm = 0, par = 0, left = [];
    agreed.forEach(function (r) {
      sj += r.pa + r.pb; sm += r.maxJoint; left.push(r.maxJoint - r.pa - r.pb);
      if (!dominated(r, r.pa, r.pb)) par++;
    });
    out.integrative = { n: agreed.length, efficiency: sj / sm, meanJoint: sj / agreed.length,
      meanMax: sm / agreed.length, meanLeft: mean(left), paretoShare: par / agreed.length };
    out._ask = ask; out._pp = pp;
    return out;
  }

  /* the break button: shuffle first-offer values across dialogues; the anchor link should vanish */
  function breakAnchor(f, seed) {
    var s = shuffle(f._ask, seed);
    return { r: pearson(s, f._pp), slope: slope(s, f._pp) };
  }

  function evaluateAll(sample) {
    var d = prepare(sample), f = findings(d), ladder = {};
    RUNGS.forEach(function (g) { ladder[g.id] = evaluateRung(d, g.id); });
    var br = breakAnchor(f, 20170615);
    var clean = {};
    Object.keys(f).forEach(function (k) { if (k.charAt(0) !== "_") clean[k] = f[k]; });
    return { findings: clean, ladder: ladder, broken: br };
  }

  /* ---------- the ZOPA calculator (constructed case, labelled so on the widget) ---------- */
  var CASE = {
    buyer: "Kestrel Foods", seller: "Brightwell Packaging",
    unit: "per 1,000 cartons",
    rivalQuote: 412, switchCost: 9,      // buyer's BATNA: a rival supplier's quote plus the cost of switching
    spotPrice: 360, extraCost: 12,       // seller's BATNA: sell the capacity on the spot market, net of serving cost
    firstOffer: 455                      // the seller's opening number
  };
  function zopa(p) {
    var buyerRP = p.rivalQuote + p.switchCost;          // the most the buyer should pay
    var sellerRP = p.spotPrice + p.extraCost;           // the least the seller should accept
    var width = buyerRP - sellerRP;
    var mid = (buyerRP + sellerRP) / 2;
    var inside = p.firstOffer >= sellerRP && p.firstOffer <= buyerRP;
    var splitFromOffer = (p.firstOffer + sellerRP) / 2; // "meet halfway" between the opener and the seller's floor
    return { buyerRP: buyerRP, sellerRP: sellerRP, width: width, exists: width >= 0, mid: mid,
             offerInside: inside, offerAboveBuyerRP: p.firstOffer - buyerRP, splitFromOffer: splitFromOffer };
  }

  /* ---------- session 5: the same contract as a package (constructed, dollars per 1,000 cartons) ---------- */
  var TERMS = {
    volumeThousands: 2400,                                       // 2.4 million cartons a year
    pay30: { kestrelCost: 3, brightwellGain: 11 },               // pay in 30 days instead of 60
    commit: { kestrelCost: 2, brightwellGain: 8 },               // guarantee 90% of the forecast volume
    window2: { kestrelGain: 7, brightwellCost: 2 }               // 2-day delivery window instead of 5
  };
  function packageValue(price, pay30, commit, window2) {
    var t = TERMS;
    var kestrel = price + (pay30 ? t.pay30.kestrelCost : 0) + (commit ? t.commit.kestrelCost : 0) - (window2 ? t.window2.kestrelGain : 0);
    var bright = price + (pay30 ? t.pay30.brightwellGain : 0) + (commit ? t.commit.brightwellGain : 0) - (window2 ? t.window2.brightwellCost : 0);
    return { kestrelEffectiveCost: kestrel, brightwellEffectiveRevenue: bright };
  }
  function tradeCase() {
    var half = packageValue(400, false, false, false), trade = packageValue(392, true, true, true);
    var kSave = half.kestrelEffectiveCost - trade.kestrelEffectiveCost;
    var bGain = trade.brightwellEffectiveRevenue - half.brightwellEffectiveRevenue;
    return { halfway: half, trade: trade, kestrelSavesPer1000: kSave, brightwellGainsPer1000: bGain,
             jointPer1000: kSave + bGain, kestrelSavesYear: kSave * TERMS.volumeThousands,
             brightwellGainsYear: bGain * TERMS.volumeThousands, jointYear: (kSave + bGain) * TERMS.volumeThousands };
  }

  /* ---------- UI ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }
  function f2(x) { return x.toFixed(2); }
  function pc(x) { return (x * 100).toFixed(1) + "%"; }
  function metric(label, value, unit, kind) {
    return '<div class="mb-metric"><span class="mb-mlabel">' + esc(label) + "</span>" +
      '<span class="mb-mvalue">' + esc(value) + "</span>" +
      '<span class="mb-munit">' + esc(unit) + "</span>" +
      '<span class="mb-mkind is-' + (kind === "replayed" ? "heuristic" : kind) + '">' + esc(kind) + "</span></div>";
  }

  var R = null, F = null, ladderEl, anchorEl, current = "split", btns = {}, broken = false;

  function renderLadder() {
    var r = R.ladder[current], g = RUNGS.filter(function (x) { return x.id === current; })[0];
    var verdict, cls;
    if (g.anti) {
      cls = "bad";
      verdict = "Perfectly even, and " + f2(r.meanLeft) + " points per deal left on the table. In " +
        pc(r.bothBeatSplitShare) + " of these real pools a whole-item deal existed that gave BOTH people more than the split";
    } else if (r.efficiency > 0.999) {
      cls = "good";
      verdict = "Every point the pool can create is created. The open question is how evenly: an average gap of " + f2(r.meanGap) + " points between the sides";
    } else {
      cls = "ok";
      verdict = pc(r.efficiency) + " of the value these pools could create, " + pc(r.paretoShare) + " of outcomes on the frontier";
    }
    var kind = (current === "humans" || current === "agreed") ? "measured" : "replayed";
    ladderEl.querySelector(".neg-ladder-out").innerHTML =
      '<div class="mb-verdict is-' + cls + '">' + esc(verdict) + "</div>" +
      '<div class="mb-metrics">' +
      metric("Dialogues", String(r.n), "real pools and private values", "measured") +
      metric("Joint points", f2(r.meanJoint), "mean per deal, both sides added", kind) +
      metric("Share of the maximum", pc(r.efficiency), "of what the pool could create", kind) +
      metric("Left on the table", f2(r.meanLeft), "points per deal, vs the frontier", kind) +
      metric("On the frontier", pc(r.paretoShare), "no split helps one without hurting the other", kind) +
      metric("Gap between sides", f2(r.meanGap), "mean points apart", kind) +
      "</div>";
  }
  function setRung(id) {
    current = id;
    Object.keys(btns).forEach(function (k) {
      btns[k].classList.toggle("is-on", k === id);
      btns[k].querySelector("input").checked = (k === id);
    });
    renderLadder();
  }

  function renderAnchor() {
    var a = F.anchor, fm = F.firstMover, r = broken ? R.broken.r : a.r, s = broken ? R.broken.slope : a.slope;
    anchorEl.querySelector(".neg-anchor-out").innerHTML =
      '<div class="mb-verdict is-' + (broken ? "bad" : "ok") + '">' +
      (broken ? "First offers shuffled across dialogues: the link drops to r = " + f2(r) +
        ". Whatever the real r measures, it belongs to the pairing of an opener with its own chat"
        : "Ask more, end with more: r = " + f2(r) + " between what the opener claimed and what the opener got") +
      "</div>" +
      '<div class="mb-metrics">' +
      metric("Opener was the first to type", pc(F.openerIsFirstTypist), pc(F.offerTurnZero) + " proposed in the very first message", "measured") +
      metric("Deals with a parsed opener", String(a.n), "agreed, first proposal read", "measured") +
      metric("Anchor correlation r", f2(r), broken ? "after the shuffle" : "opener's ask vs opener's final", "measured") +
      metric("Points per point asked", f2(s), "slope of final on ask", "measured") +
      metric("Opener's final points", f2(fm.proposer), "mean, deals only", "measured") +
      metric("Responder's final points", f2(fm.responder), "mean, deals only", "measured") +
      metric("Opener came out ahead", pc(fm.ahead), "tie " + pc(fm.tie) + ", behind " + pc(fm.behind), "measured") +
      "</div>" +
      '<p class="neg-sub">Two confounds, measured rather than waved away</p>' +
      '<div class="mb-metrics">' +
      metric("First proposal accepted as written", pc(a.acceptedAsIs), "of these deals: ask and final are the same split", "measured") +
      metric("r, deals where the opener moved", f2(a.rMoved), a.nMoved + " deals", "measured") +
      metric("r, holding the pool fixed", f2(a.rPartial), "partial r, controlling for the balanced split", "measured") +
      "</div>";
    var bandRows = F.askBands.map(function (b) {
      return "<tr><th>Opener asked " + b.lo + "-" + b.hi + " points</th><td>" + b.n + "</td><td>" + pc(b.dealShare) +
        "</td><td>" + f2(b.proposerIfDeal) + "</td><td>" + f2(b.proposerAll) + "</td></tr>";
    }).join("");
    anchorEl.querySelector(".neg-bands").innerHTML =
      '<table class="dt-table"><thead><tr><th>First proposal</th><th>Chats</th><th>Reached a deal</th>' +
      "<th>Opener, if deal</th><th>Opener, walk-aways as 0</th></tr></thead><tbody>" + bandRows + "</tbody></table>";
    var b = anchorEl.querySelector(".neg-break");
    b.textContent = broken ? "Put the first offers back" : "Break it: shuffle the first offers";
    b.setAttribute("aria-pressed", broken ? "true" : "false");
  }

  function initBench() {
    var el = document.getElementById("neg-bench");
    if (!el || !root.NEG_SAMPLE) return;
    var d = prepare(root.NEG_SAMPLE);
    F = findings(d);
    R = { ladder: {}, broken: breakAnchor(F, 20170615) };
    RUNGS.forEach(function (g) { R.ladder[g.id] = evaluateRung(d, g.id); });

    var rowsEl = document.createElement("div");
    rowsEl.className = "neg-rows";
    rowsEl.innerHTML = '<h4 class="neg-h">0 · The rows</h4><div class="mb-metrics">' +
      metric("Real negotiations", String(F.n), "seeded sample of 5,877", "measured") +
      metric("Reached a deal", pc(F.agreeShare), "both sides entered the same split", "measured") +
      metric("Walked away", pc(F.noDealShare), "chose no agreement: 0 points each", "measured") +
      metric("Entered different splits", pc(F.conflictShare), "the task scores this 0 each", "measured") +
      metric("Points per person", f2(F.meanPoints), "mean, out of 10, walk-aways as 0", "measured") +
      metric("Most a pool could create", f2(F.meanMaxJoint), "mean joint points, both sides", "measured") +
      "</div>";
    el.appendChild(rowsEl);

    anchorEl = document.createElement("div");
    anchorEl.className = "neg-anchor";
    anchorEl.innerHTML = '<h4 class="neg-h">1 · The opener and the anchor</h4>' +
      '<div class="neg-anchor-out"></div>' +
      '<p><button type="button" class="btn neg-break" aria-pressed="false"></button></p>' +
      '<div class="dt-tablewrap neg-bands"></div>' +
      '<p class="mb-hint">' + F.parsed + " of " + F.n + " chats contain a first proposal the parser could read as a complete split. " +
      "Values are each person's private points; every person's whole pool is worth 10 to them.</p>";
    el.appendChild(anchorEl);
    anchorEl.querySelector(".neg-break").addEventListener("click", function () { broken = !broken; renderAnchor(); });

    ladderEl = document.createElement("div");
    ladderEl.className = "neg-ladder";
    ladderEl.innerHTML = '<h4 class="neg-h">2 · The strategy ladder, replayed on the real pools</h4>';
    var panel = document.createElement("div");
    panel.className = "mb-presets";
    RUNGS.forEach(function (g) {
      var lab = document.createElement("label");
      lab.className = "mb-preset" + (g.anti ? " is-anti" : "");
      lab.innerHTML = '<input type="radio" name="neg-rung" value="' + g.id + '">' +
        '<span class="mb-pname">' + esc(g.label) + (g.anti ? ' <em class="mb-anti">fair-looking, and wasteful</em>' : "") + "</span>" +
        '<span class="mb-pnote">' + esc(g.note) + "</span>";
      panel.appendChild(lab);
      btns[g.id] = lab;
      lab.querySelector("input").addEventListener("change", function () { setRung(g.id); });
    });
    ladderEl.appendChild(panel);
    var out = document.createElement("div"); out.className = "neg-ladder-out"; ladderEl.appendChild(out);
    var hint = document.createElement("p"); hint.className = "mb-hint";
    hint.textContent = "Replayed rungs apply a rule to the real pools and the real private values of both people. " +
      "They do not model whether the other side would have said yes, and they assume each side's values are known, " +
      "which no real negotiator gets for free. The two people rungs are the recorded outcomes.";
    ladderEl.appendChild(hint);
    el.appendChild(ladderEl);

    renderAnchor();
    setRung("split");
    root.NEG_LIVE = { findings: F, ladder: R.ladder, broken: R.broken, show: setRung,
      toggleBreak: function () { broken = !broken; renderAnchor(); return broken; },
      get current() { return current; } };
  }

  function initZopa() {
    var el = document.getElementById("neg-zopa");
    if (!el) return;
    var fields = [["rivalQuote", "Rival supplier's quote"], ["switchCost", "Buyer's cost to switch"],
      ["spotPrice", "Seller's spot-market price"], ["extraCost", "Seller's extra cost to serve"],
      ["firstOffer", "Seller's opening number"]];
    var form = '<div class="neg-zform">' + fields.map(function (f) {
      return '<label class="neg-zf"><span>' + esc(f[1]) + '</span><input type="number" step="1" data-k="' + f[0] +
        '" value="' + CASE[f[0]] + '"></label>';
    }).join("") + "</div>";
    el.innerHTML = '<p class="mb-hint">Constructed case: ' + esc(CASE.buyer) + " buys cartons from " + esc(CASE.seller) +
      ". Prices in dollars " + esc(CASE.unit) + ". Every input is invented for teaching; change any of them.</p>" + form +
      '<div class="neg-zout"></div>';
    function run() {
      var p = {};
      el.querySelectorAll("input[data-k]").forEach(function (i) { p[i.getAttribute("data-k")] = parseFloat(i.value) || 0; });
      var z = zopa(p);
      var verdict = z.exists
        ? "A deal zone exists: anything from $" + z.sellerRP + " to $" + z.buyerRP + ", " + z.width + " dollars wide"
        : "No deal zone: the seller's floor sits $" + (-z.width) + " above the buyer's ceiling. Walking away is the right answer";
      el.querySelector(".neg-zout").innerHTML =
        '<div class="mb-verdict is-' + (z.exists ? "good" : "bad") + '">' + esc(verdict) + "</div>" +
        '<div class="mb-metrics">' +
        metric("Buyer's walk-away price", "$" + z.buyerRP, "rival quote + switching cost", "modelled") +
        metric("Seller's walk-away price", "$" + z.sellerRP, "spot price + cost to serve", "modelled") +
        metric("Zone width", (z.width < 0 ? "-$" + (-z.width) : "$" + z.width), z.exists ? "the bargaining range" : "negative: no overlap", "modelled") +
        metric("Opening number", "$" + p.firstOffer, z.offerInside ? "inside the zone" :
          (z.offerAboveBuyerRP > 0 ? "$" + z.offerAboveBuyerRP + " above the buyer's ceiling" : "outside the zone"), "modelled") +
        "</div>";
    }
    el.addEventListener("input", run);
    run();
    root.NEG_ZOPA = { run: run, zopa: zopa, CASE: CASE };
  }

  var api = { RUNGS: RUNGS, CASE: CASE, prepare: prepare, findings: findings, evaluateRung: evaluateRung,
              evaluateAll: evaluateAll, breakAnchor: breakAnchor, zopa: zopa, tradeCase: tradeCase, TERMS: TERMS, mulberry32: mulberry32, shuffle: shuffle };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    var go = function () { initBench(); initZopa(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go);
    else go();
  }
})(typeof window !== "undefined" ? window : globalThis);
