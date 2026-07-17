# Index HUMI – Technical Specification

**Version 1.1**  
**Date:** July 17, 2026  
**Index Type:** Agent Reputation Score (0–100)

---

## Overview

The **Index HUMI** (Human-like Metrics Index) is a composite reputation score from **0 to 100** that evaluates the overall quality, legitimacy, maturity, and real-world intelligence of any Agent in the ERC-8004 ecosystem.

It is built from **four independent pillars**, each designed with a nominal maximum of **25 points** (total 100 points).  

Each pillar is divided into three sections:
- **Basic** – Foundational quality
- **Intermediate** – Demonstrated capability  
- **Advanced** – Sophisticated maturity

The final score is the sum of the four pillars.

---

## Multichain transactional wallet analysis

Measure and Usage no longer treat wallet activity as a single-wallet or single-chain signal. Transactional activity is consolidated across **all valid transactional wallets** attached to the agent and across **every chain** where those wallets have indexed activity.

The calculation separates two layers:

1. **Activity volume** — aggregated nonce and 7-, 15-, and 30-day nonce deltas.
2. **Multichain quality** — meaningful activity and balances, chain quality weights, valuable-chain presence, high-value-chain presence, superficial chain spreading, and concentration in the primary chain.

### Volume aggregation

`erc_8004.agent_summary_tx` groups transactional-wallet summaries by agent. Its nonce is therefore the sum across the agent's wallets and chains, rather than the nonce of one selected wallet.

`erc_8004.agent_summary_general` exposes:

- `nonce`
- `nonce_delta_7_days`
- `nonce_delta_15_days`
- `nonce_delta_30_days`
- `transactional_wallet_count`
- the multichain quality fields listed below

### Multichain quality aggregation

`erc_8004.agent_multichain_stats` first builds one record per agent and chain from valid, non-deleted transactional-wallet associations. It then aggregates those chain records per agent.

The main signals are:

- `active_chains_count`: chains with a meaningful current balance
- `chains_with_meaningful_activity_30d`: chains with meaningful 30-day activity
- `weighted_multichain_balance_score`: sum of chain weights for meaningful balances
- `weighted_multichain_activity_score`: sum of chain weights for meaningful activity
- `valuable_chains_count`: chains combining meaningful activity and sufficient chain weight
- `has_high_value_chain_presence`: presence in a high-weight chain with meaningful balance or activity
- `shallow_multichain_spread`: activity spread over several chains without meaningful depth
- `usage_concentration_ratio`: primary-chain nonce divided by total agent nonce

### Default quality thresholds

The values are configurable through `gsa.parameters`. Current defaults are:

- Meaningful balance: `>= 0.1`
- Meaningful 30-day activity: `nonce_delta_30d >= 30`
- Valuable chain activity: `nonce_delta_30d >= 30`
- Minimum chain weight for a valuable chain: `>= 0.6`
- High-value chain weight: `>= 0.8`
- Shallow spread: at least 4 shallow chains
- Shallow-chain maximum 30-day delta: `<= 5`
- Default chain weight when absent: `0.30`

Simply appearing on more chains does **not** earn more points. Chain presence must have meaningful depth and quality.

---

## Pillar 1 – History (25 points)

Evaluates the Agent’s ownership stability and historical reputation.

### Basic Section (10 points)
- Strength and activity of the owner wallet: **5 points**
- Stability of ownership over time (few or no changes): **5 points**

### Intermediate Section (9 points)
- Advanced longevity and antiquity of the owner wallet: **3 points**
- Quality and activity level of the owner’s overall Agent portfolio: **3 points**
- Minimum external audit presence in the owner’s portfolio: **1.5 points**
- Low warning rate across the owner’s portfolio: **1.5 points**

### Advanced Section (6 points)
- Strong metadata quality and service verification across the portfolio: **1.5 points**
- Comprehensive external audits on all portfolio Agents: **2.0 points**
- Sustained general activity and protocol engagement across the portfolio: **2.5 points**

---

## Pillar 2 – Information (25 points)

Measures the richness, professionalism, and completeness of the Agent’s public identity and technical metadata.

### Basic Section (10 points)
- Quality and clarity of name, description, and image: **7.5 points**
- Presence of core information sources (on-chain + URI): **2.5 points**

### Intermediate Section (9 points)
- Diversity and depth of external information sources: **3.0 points**
- Availability of web or email contact methods: **1.0 points**
- Presence of programmatic/API endpoints: **1.5 points**
- Supported trust mechanisms: **1.0 points**
- Verification methods: **1.0 points**
- Basic technical metadata (skills, capabilities, domains): **1.5 points**

### Advanced Section (6 points)
- MCP endpoints: **2.0 points**
- A2A endpoints: **2.0 points**
- Advanced technical setup (technology stack, payments, tools, capabilities): **2.0 points**

---

## Pillar 3 – Measure (25 points)

Measure evaluates whether an agent is credibly represented, externally validated, and operationally present. The multichain revision reduces the direct weight of raw wallet volume and adds a quality-of-presence dimension.

### Basic Section (nominal maximum 10)

#### Metadata Richness: 0 to 4

```text
(metadata_richness_score / 100) × 4
```

#### Basic Existence: 0 or 6

Award 6 points when the agent has at least one of:

- positive aggregated nonce
- a valid attestation
- a valid on-chain execution
- a valid on-chain feedback

Otherwise award 0.

### Intermediate Section (nominal maximum 9)

#### Wallet Transaction Quality: 0 to 1

Uses aggregated `nonce_delta_30_days`:

- `>= 900`: 1.0
- `>= 450`: 0.5
- `>= 120`: 0.25
- otherwise: 0

#### External Audit: 0 to 3

Requires at least one valid audit:

- average score `>= 70`: 3.0
- average score `>= 50`: 2.0
- lower non-negative average: 1.0
- no valid audits: 0

#### Protocol Activity: 0 to 2.5

Applies to 1–7 valid protocol activities:

- average score `>= 60`: 2.5
- average score `>= 40`: 1.5
- lower non-negative average: 0.75
- outside the intermediate volume condition: 0

#### Multichain Presence Quality: −1 to +2.5

Evaluation order:

1. High-value-chain presence and `weighted_multichain_activity_score >= 1.5`: **+2.5**
2. High-value-chain presence: **+1.5**
3. Shallow multichain spread: **−1.0**
4. At least 3 active chains but weighted activity `< 1.0`: **−0.5**
5. No significant signal: **0**

This dimension rewards meaningful presence in valuable chains and prevents a large number of low-quality registrations from being interpreted as maturity.

### Advanced Section (maximum 6)

#### Advanced External Audit: 0 to 3

Requires at least two valid audits:

- average score `>= 90`: 3.0
- `>= 80`: 2.5
- `>= 70`: 2.0
- `>= 60`: 1.0
- otherwise: 0

#### Identity Analysis: 0 to 2

```text
min(2, identity_score / 50)
```

#### Advanced Protocol Activity: 0 to 1

Applies to at least 10 valid protocol activities:

- average score `>= 90`: 1.0
- `>= 80`: 0.75
- `>= 70`: 0.5
- otherwise: 0

### Measure penalty and total

The penalty is the sum of `score_impact` from the agent warnings.

The current total is:

```text
max(basic + intermediate + advanced + warning_penalty, 0)
```

Measure has a theoretical maximum of 25 under the current thresholds. There is no separate duplication-analysis allocation.

---

## Pillar 4 – Usage (25 points)

Usage evaluates recent operational adoption. It combines aggregated wallet volume, recent on-chain channels, paid protocol activity, and whether activity is distributed meaningfully across valuable chains.

Usage is designed as a **25-point pillar**. The component scores below describe the current implementation exactly.

### Basic Section (nominal maximum 10)

#### Basic General Activity: 0 or 10

- Agent younger than 30 days: positive aggregated nonce awards 10.
- Older agent: positive 30-day nonce delta or at least two active on-chain activity types awards 10.
- Otherwise: 0.

The on-chain types considered are attestations, executions, feedbacks, and protocol activity.

### Intermediate Section

#### Wallet Intermediate: 0 to 2.5

For agents younger than 15 days, use current aggregated nonce. For older agents, use the aggregated 15-day nonce delta:

- `>= 301`: 2.5
- `>= 101`: 1.5
- `>= 1`: 0.75
- otherwise: 0

#### On-Chain Activity Intermediate: 0 to 4

Requires at least two active on-chain activity types. Average quality:

- `>= 90`: 4.0
- `>= 70`: 3.2
- `>= 50`: 2.4
- `>= 30`: 2.0
- `>= 10`: 1.2
- otherwise: 0

#### Comments: 0 or 1

At least one valid recent comment and no revoked comments awards 1.

#### Multichain Valuable Usage: −1 to +2.5

Evaluation order:

1. At least 2 valuable chains: **+2.5**
2. Exactly 1 valuable chain: **+1.5**
3. Shallow multichain spread: **−1.0**
4. No significant signal: **0**

### Advanced Section

#### Wallet Advanced: 0 or 1

- Creation day: aggregated current nonce `>= 500`
- Other days: aggregated 7-day nonce delta `>= 500`

Either condition awards 1.

#### On-Chain Activity Advanced: 0 to 2.5

Requires at least three active on-chain activity types:

- average quality `>= 80`: 2.5
- `>= 70`: 1.5
- `>= 60`: 0.75
- otherwise: 0

#### Protocol Activity with Payments: 0 or 1.5

At least two valid protocol activities and at least one valid payment award 1.5.

#### Multichain High Value Consistency: −0.5 to +1.5

Evaluation order:

1. High-value-chain presence and at least 2 valuable chains: **+1.5**
2. High-value-chain presence: **+1.0**
3. No high-value presence and `usage_concentration_ratio > 0.90`: **−0.5**
4. No significant signal: **0**

### Usage penalty and total

Any revoke in the recent comment, execution, feedback, protocol, or attestation summaries applies **−1.5**.

The current function directly sums:

```text
basic + intermediate + advanced + revoke_penalty
```

### Technical note on Usage range

The public contract designs Usage as a 25-point pillar. The current scoring SQL does **not** apply an upper or lower clamp after adding the multichain dimensions:

- theoretical positive maximum: `10 + 10 + 6.5 = 26.5`
- theoretical negative minimum: `−1 − 0.5 − 1.5 = −3`

`agent_index_humi_calculate` also sums the four stored pillar scores without a 100-point clamp. Raw component sums may therefore exceed the nominal range until the scoring implementation introduces normalization or a hard cap. This is a scoring-engine concern, not a change to the public 25-point design.

---

**Final HUMI Score** = Pillar History (25) + Pillar Information (25) + Pillar Measure (25) + Pillar Usage (25)
