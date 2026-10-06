// Internal: run the bench engine in node and print every canon number as JSON.
// Usage: node materials/run-bench-node.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const ctx = { window: {} }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, "../assets/negotiation-sample.js"), "utf8"), ctx);
const NEG = require(path.join(__dirname, "../assets/negotiation-live.js"));
const out = NEG.evaluateAll(ctx.window.NEG_SAMPLE);
out.zopa = NEG.zopa(NEG.CASE);
out.trade = NEG.tradeCase();
console.log(JSON.stringify(out, null, 1));
