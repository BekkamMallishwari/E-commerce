# E-commerce Bug Report (Post Git Pull — Batch 9)

> Audit of 179 newly merged commits on `main`. All issues are in the new architectural monitoring services.

---

## Issue 1 — 

**Severity:** 🔴 Critical  
**Type:** Security — SQL Injection  
**File:** [`backend/services/buisnessSLAService.js`](file:///e:/E-commerce/backend/services/buisnessSLAService.js) — Line 307  
**Route:** `GET /api/sla/metrics/:metric/summary` ([`backend/routes/slaRoutes.js`](file:///e:/E-commerce/backend/routes/slaRoutes.js) — Line 38)

---

## Issue 2 — Guaranteed Runtime Crash: 

**Severity:** 🔴 Critical  
**Type:** Bug — TypeError / Runtime Crash  
**File:** [`backend/routes/riskRoutes.js`](file:///e:/E-commerce/backend/routes/riskRoutes.js) — Lines 98–103  
**Route:** `GET /api/risk/modules/:name`

---

## Issue 3 — 

**Severity:** 🟠 High  
**Type:** Bug — Logic Error / Incorrect Metric  
**File:** [`backend/services/architecturalRiskService.js`](file:///e:/E-commerce/backend/services/architecturalRiskService.js) — Lines 263–293


---

## Issue 4 — Memory Leak in Technical Debt Analysis

**Severity:** 🟠 High  
**Type:** Bug — Memory Leak / OOM Risk  
**File:** [`backend/services/technicalDebtService.js`](file:///e:/E-commerce/backend/services/technicalDebtService.js) — Lines 241–245

### Description

`this.todoItems` and `this.deadCodeItems` are instance-level arrays initialized once in the constructor. `analyzeDebt()` is invoked on a recurring schedule. Each time it runs, new items are **appended** to these arrays without ever resetting them at the start of the run:

```js
// Constructor (once on startup):
this.todoItems = [];
this.deadCodeItems = [];

// analyzeDebt() -> analyzeCodeQuality() called on every scheduled run:
const todoMatches = content.match(/\/\/\s*TODO|#\s*TODO/g) || [];
if (todoMatches.length > 0) {
    this.todoItems.push({          // ← push without ever clearing first
        file: path.relative(this.projectRoot, file),
        count: todoMatches.length,
        content: todoMatches.join(', ')
    });
}
```

If debt analysis runs every hour across 50 source files, after 24 hours `this.todoItems` will have grown to `50 × 24 = 1200` entries — all duplicates of the same 50 files. After days, this leads to an OOM crash.

Additionally, `/api/debt/todo` returns `this.todoItems.slice(0, 50)`, so callers always receive stale, duplicated data.

### Steps to Reproduce

1. Start the server and wait for the scheduled debt analysis to run at least twice.
2. `GET /api/debt/todo` — observe duplicate entries for the same files.
3. Monitor process memory (`process.memoryUsage()`) over multiple runs — heap usage grows monotonically.

### Expected Behavior

Each analysis run produces a fresh set of findings with no duplicates.

### Fix

Reset the arrays at the beginning of each analysis:

```js
async analyzeDebt() {
    if (this.isAnalyzing) return;
    this.isAnalyzing = true;

    // Clear per-run state before starting
    this.todoItems = [];
    this.deadCodeItems = [];

    // ... rest of analysis ...
}
```

---

## Issue 5 — Event Loop Blocking in Cohesion Calculation (O(N×M) Array Filter)

**Severity:** 🟡 Medium  
**Type:** Performance — Event Loop Block / DoS Risk  
**File:** [`backend/services/architecturalRiskService.js`](file:///e:/E-commerce/backend/services/architecturalRiskService.js) — Lines 311–316

### Description

`calculateCohesion()` measures how semantically related files within a module are by checking shared keywords. For every pair of files `(i, j)`, it reads both files, tokenizes them into word arrays, and then calls `Array.filter()` + `Array.includes()` to find common words:

```js
const words1 = content1.match(/\b\w+\b/g) || [];  // e.g. 5,000 words
const words2 = content2.match(/\b\w+\b/g) || [];  // e.g. 5,000 words

const commonWords = words1.filter(w => words2.includes(w));
//                                     ^^^^^^^^^^^^^^^^^^
//                           O(M) linear scan per element of words1
//                           Total: O(N × M) per file pair
```

This runs **synchronously** on the Node.js main thread. For a module with 10 files averaging 5,000 words each:

- File pairs: `10 × 9 / 2 = 45` pairs  
- Cost per pair: `5,000 × 5,000 = 25,000,000` comparisons  
- **Total: ~1.1 billion comparisons** — blocking the event loop for several seconds

During this time, the server cannot process any incoming HTTP requests, causing timeouts for all concurrent users.

### Steps to Reproduce

1. Add a module with 10+ large source files.
2. Trigger analysis: `POST /api/risk/analyze`
3. While analysis is running, send concurrent requests to any route (e.g., `GET /api/products`).
4. Observe that all concurrent requests hang until the cohesion calculation completes.

### Expected Behavior

The analysis either runs in a worker thread or uses an efficient O(N+M) Set-based algorithm.

### Fix

Convert `words2` to a `Set` before the filter — reduces each pair's cost from O(N×M) to O(N+M):

```js
const words1 = content1.match(/\b\w+\b/g) || [];
const words2Set = new Set(content2.match(/\b\w+\b/g) || []);

// O(N) lookup instead of O(N×M)
const commonWords = words1.filter(w => words2Set.has(w));
const similarity = commonWords.length / Math.max(words1.length, words2Set.size);
```

For complete non-blocking behavior, offload the entire `analyzeRisk()` to a `worker_thread`.
