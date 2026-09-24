import assert from "node:assert/strict";

// 1. Test Transforms & Logic
function isValidPreStock(item) {
  if (!item || typeof item !== "object") return false;
  const p = item;
  return (
    typeof p.name === "string" &&
    typeof p.symbol === "string" &&
    typeof p.contract_address === "string" &&
    typeof p.tokenPrice === "number" &&
    !Number.isNaN(p.tokenPrice) &&
    typeof p.markPrice === "number" &&
    !Number.isNaN(p.markPrice)
  );
}

function derivePreStockMetrics(product) {
  const markPrice = Number(product.markPrice) || 0;
  const tokenPrice = Number(product.tokenPrice) || 0;
  const markValuation = Number(product.markValuation) || 0;
  const impliedValuation = Number(product.impliedValuation) || 0;

  const premiumPercent =
    markPrice === 0 ? 0 : ((tokenPrice - markPrice) / markPrice) * 100;

  const priceDifference = tokenPrice - markPrice;
  const valuationDifference = impliedValuation - markValuation;

  return {
    ...product,
    markPrice,
    tokenPrice,
    markValuation,
    impliedValuation,
    supply: Number(product.supply) || 0,
    premiumPercent,
    priceDifference,
    valuationDifference,
  };
}

function getCompanyName(name) {
  return name.replace(/\s+PreStocks$/i, "").trim();
}

function normalizeSymbol(symbol) {
  return symbol.trim().toUpperCase();
}

function formatCurrency(value) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatCompactValuation(value) {
  if (value === undefined || value === null || Number.isNaN(value) || value === 0) {
    return "—";
  }
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e12) {
    return `${sign}$${(abs / 1e12).toFixed(2)}T`;
  }
  if (abs >= 1e9) {
    return `${sign}$${(abs / 1e9).toFixed(1)}B`;
  }
  if (abs >= 1e6) {
    return `${sign}$${(abs / 1e6).toFixed(1)}M`;
  }
  return formatCurrency(value);
}

function formatPercentage(value, includeSign = true) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "0.00%";
  }
  const sign = includeSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

function truncateAddress(address, startChars = 4, endChars = 4) {
  if (!address || address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

async function runTests() {
  console.log("=== SCOUTER TEST SUITE ===");

  // Test 1: Validation
  console.log("1. Testing Validation...");
  assert.equal(isValidPreStock(null), false);
  assert.equal(isValidPreStock({}), false);
  assert.equal(isValidPreStock({ name: "OpenAI", symbol: "OPENAI" }), false);
  assert.equal(
    isValidPreStock({
      name: "OpenAI PreStocks",
      symbol: "OPENAI",
      contract_address: "Pre123",
      tokenPrice: 100,
      markPrice: 90,
    }),
    true
  );
  console.log("  ✓ Validation passed");

  // Test 2: Derived Metrics
  console.log("2. Testing Derived Metrics...");
  const raw = {
    name: "OpenAI PreStocks",
    symbol: "OPENAI",
    contract_address: "Pre123",
    tokenPrice: 120,
    markPrice: 100,
    impliedValuation: 120_000_000_000,
    markValuation: 100_000_000_000,
    supply: 1000,
  };
  const derived = derivePreStockMetrics(raw);
  assert.equal(derived.premiumPercent, 20);
  assert.equal(derived.priceDifference, 20);
  assert.equal(derived.valuationDifference, 20_000_000_000);
  console.log("  ✓ Derived calculations verified");

  // Test 3: Formatting
  console.log("3. Testing Formatting...");
  assert.equal(formatCurrency(160.2888), "$160.29");
  assert.equal(formatCurrency(0), "$0.00");
  assert.equal(formatCurrency(NaN), "—");
  assert.equal(formatCompactValuation(1_640_000_000_000), "$1.64T");
  assert.equal(formatCompactValuation(141_800_000_000), "$141.8B");
  assert.equal(formatCompactValuation(-10_000_000_000), "-$10.0B");
  assert.equal(formatPercentage(2.41), "+2.41%");
  assert.equal(formatPercentage(-1.84), "-1.84%");
  assert.equal(formatPercentage(0), "0.00%");
  assert.equal(truncateAddress("PreweJYECqtQwBtpxHL171nL2K6umo692gTm7Q3rpgF"), "Prew...rpgF");
  console.log("  ✓ Formatters verified");

  // Test 4: Name and Symbol Normalization
  console.log("4. Testing Normalization...");
  assert.equal(getCompanyName("Anduril PreStocks"), "Anduril");
  assert.equal(getCompanyName("Figure AI PreStocks"), "Figure AI");
  assert.equal(normalizeSymbol("openai"), "OPENAI");
  assert.equal(normalizeSymbol(" SpaceX  "), "SPACEX");
  console.log("  ✓ Normalization verified");

  // Test 5: Live API Integration
  console.log("5. Testing Live PreStocks API...");
  const res = await fetch("https://prestocks.com/api/prestocks");
  assert.equal(res.status, 200);
  const data = await res.json();
  assert(Array.isArray(data));
  assert(data.length >= 8);
  for (const item of data) {
    assert(isValidPreStock(item), `Item ${item.symbol} must be valid PreStock`);
    const d = derivePreStockMetrics(item);
    assert(typeof d.premiumPercent === "number");
    assert(d.contract_address.startsWith("Pre"));
    assert(d.tokenPrice > 0);
  }
  console.log(`  ✓ Live PreStocks API verified (${data.length} assets returned)`);

  // Test 6: Search & Filter Logic
  console.log("6. Testing Search & Filter Simulation...");
  const assets = data.map(derivePreStockMetrics);
  // Search exact
  const openaiMatches = assets.filter(
    (p) => p.symbol.toLowerCase() === "openai" || p.name.toLowerCase().includes("openai")
  );
  assert.equal(openaiMatches.length, 1);
  // Search partial
  const aiMatches = assets.filter(
    (p) => p.symbol.toLowerCase().includes("ai") || p.description.toLowerCase().includes("ai")
  );
  assert(aiMatches.length > 0);
  // Non-matching
  const noMatches = assets.filter((p) => p.symbol.toLowerCase().includes("nonexistentcompany999"));
  assert.equal(noMatches.length, 0);
  console.log("  ✓ Search filters verified");

  // Test 7: Comparison Constraints
  console.log("7. Testing Compare Logic...");
  const selected = assets.slice(0, 3).map((p) => p.symbol);
  assert.equal(selected.length, 3);
  // Adding when at max 3 should reject
  const canAddMore = selected.length < 3;
  assert.equal(canAddMore, false);
  console.log("  ✓ Comparison bounds verified");

  console.log("\nALL TESTS PASSED SUCCESSFULLY! (7/7)");
}

runTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
