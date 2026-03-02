# Doom Watcher: Analysis and Brainstormed Improvements

## Current-state analysis (quick audit)

### Strengths

1. **Clear separation of concerns**
   - UI components, scoring engine logic, and mock data are split cleanly.
2. **Fast iteration ergonomics**
   - Scenario toggling and a deterministic mock-data flow make experimentation easy.
3. **Consistent visual language**
   - Reused design tokens help keep a coherent look and feel.

### Gaps and constraints

1. **No real data ingestion path**
   - The dashboard cannot yet consume live or historical external datasets.
2. **Limited explainability depth**
   - Users can see top drivers, but not full contribution decomposition or sensitivity.
3. **No persistence or sharing**
   - Scenario state is local and ephemeral; there is no permalink/export workflow.
4. **No automated tests for scoring invariants**
   - Engine logic is type-safe but not validated through repeatable test cases.
5. **Accessibility hardening opportunities**
   - Keyboard and semantic behavior can be expanded for better assistive usage.

## Brainstorm: high-impact improvements

## 1) Explainability and trust

- Add a **score contribution table** (`weight × normalized value`) for each indicator.
- Add **"what changed" diffs** between scenarios and between latest vs prior period.
- Add **sensitivity toggles** (e.g., +/-10% shock per indicator) to visualize fragility.

**Why this matters:** A risk score without transparent decomposition can feel arbitrary.

## 2) Data realism and pipeline

- Introduce a lightweight `/api/indicators` route with a typed payload contract.
- Add a data-source adapter layer (mock, static JSON, remote API).
- Add stale-data timestamping and freshness badges in UI.

**Why this matters:** Enables migration from demo to production-like behavior.

## 3) User workflow upgrades

- Deep-link scenario in URL query params (`?scenario=2`) for shareability.
- Add CSV export for history and indicator snapshots.
- Add preset views ("Macro Stress", "Liquidity", "Credit") with quick filters.

**Why this matters:** Makes the tool useful for collaboration and repeated analysis.

## 4) Alerting and decision support

- Add threshold-based alert rules with severity history.
- Add rolling regime detection (calm/watch/stress) from momentum + dispersion.
- Add confidence score based on indicator agreement/disagreement.

**Why this matters:** Moves from static reporting toward action-oriented monitoring.

## 5) Performance and quality foundation

- Add unit tests for:
  - weighted score boundaries,
  - alert-level threshold transitions,
  - summary generation edge cases.
- Add component tests for key rendering states (empty, stress, calm).
- Add CI pipeline running lint + type-check + test.

**Why this matters:** Prevents regressions as logic complexity grows.

## Suggested phased execution

### Phase 1 (1–2 days)

- URL scenario persistence.
- Contribution table in indicator section.
- Basic engine unit tests.

### Phase 2 (2–4 days)

- API route + adapter pattern.
- Data freshness UX.
- CSV export of displayed data.

### Phase 3 (ongoing)

- Alerts and regime model.
- Confidence scoring.
- Broader accessibility and observability hardening.

## Success metrics to track

- Time-to-insight for new user (minutes to identify top risk driver).
- % of sessions using scenario switch/deep links.
- Regression rate in score logic after release.
- Data freshness SLA adherence.
