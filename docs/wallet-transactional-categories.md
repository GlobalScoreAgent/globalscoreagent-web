# Wallet Transactional Categories

## Business Explanation Guide

This document explains, in clear business language, each **wallet category** assigned by the system based on transactional behavior (nonce = total number of transactions performed by the wallet).

The classification analyzes recent activity (last 7 days) compared to the wallet's overall history and is updated regularly for wallets under active monitoring (`status IN ('valid', 'monitoring')`).

These categories help the platform quickly understand a wallet's **growth stage, maturity, and risk profile**, which directly influences its quality score, trustworthiness, and visibility in the ecosystem.

---

### 1. **Explosive**
**Business Meaning**: 
The wallet is experiencing **extremely rapid, explosive growth** in activity.

**What the system detects**:
- Transaction volume has increased by **more than 200%** in the last 7 days.
- At least **30 new transactions** were executed in that period.

**Business Implications**:
- Indicates very strong adoption (successful launch, viral campaign, major integration, etc.).
- Positive signal of high interest, but also warrants additional review for potential coordinated activity or bots.

---

### 2. **Hyper_Growth**
**Business Meaning**: 
The wallet shows **very accelerated and sustained growth** in the short term.

**What the system detects**:
- Growth > **80%** in the last 7 days.
- At least **15 new transactions** in that period.

**Business Implications**:
- Strong evidence of rapid traction and expansion.
- Highly positive category — these wallets are gaining relevance quickly.

---

### 3. **Sustained_Growth**
**Business Meaning**: 
The wallet maintains **solid, consistent growth** week after week.

**What the system detects**:
- Growth > **40%** in the last 7 days.
- At least **8 new transactions** in that period.

**Business Implications**:
- Healthy and predictable evolution.
- Typical of wallets being used actively and progressively.

---

### 4. **Steady_Active**
**Business Meaning**: 
The wallet has **steady, predictable activity** — no dramatic spikes, but regular usage.

**What the system detects**:
- Growth > **20%** in the last 7 days.
- At least **5 new transactions** in that period.

**Business Implications**:
- Classic profile of mature, actively used wallets.
- Strong indicator of genuine, stable engagement.

---

### 5. **Dormant_HighNonce**
**Business Meaning**: 
The wallet has a **very high historical activity level** but is currently inactive (no recent transactions).

**What the system detects**:
- No growth in the last 7 days.
- Total historical transactions ≥ **500**.

**Business Implications**:
- "Veteran" wallet that demonstrated significant past usage.
- May be in hibernation, waiting for new activity, or temporarily paused. Requires monitoring for reactivation.

---

## New Wallets (No 2-Month History)

These categories apply to recently created wallets that do not yet have long-term historical data:

| Category | Business Meaning | Current Total Transactions |
|-----------------------|-------------------------------------------------------|----------------------------|
| **New_HighNonce** | New wallet with **high initial activity** | ≥ 300 |
| **New_MediumNonce** | New wallet with **moderate activity** | ≥ 100 |
| **New_LowNonce** | New wallet with **low activity** | < 100 |

**Business Note**: High initial nonce in new wallets can be a strong positive signal (intensive early use) or require extra scrutiny depending on context.

---

## Old Wallets That Are Currently Inactive

These categories identify wallets that have been in the network for a while but are no longer active:

| Category | Business Meaning | Current Total Transactions |
|---------------------------------|---------------------------------------------------------------|----------------------------|
| **Old_Inactive_HighNonce** | Old wallet with **high historical activity**, now inactive | ≥ 500 |
| **Old_Inactive_MediumNonce** | Old wallet with **moderate historical activity**, now inactive| ≥ 100 |
| **Old_Inactive_LowNonce** | Old wallet with **low historical activity**, now inactive | < 100 |

**Business Note**: These help distinguish between abandoned wallets, temporarily paused ones, or wallets used for one-time purposes.

---

## Why These Categories Matter

This transactional categorization allows the platform to:
- Identify wallets in **phases of explosive growth** (opportunities or alerts).
- Recognize **mature and stable** wallets.
- Differentiate **new** wallets from **old inactive** ones.
- Improve overall risk assessment, quality scoring, and ecosystem trust.

The categories are recalculated automatically as new transaction data arrives, ensuring the system always reflects the wallet's current behavior.

---

**Document generated from** the official wallet categorization logic (May 2026).

For questions about how a specific wallet was categorized or how to improve its category, please refer to the platform's wallet analytics dashboard.
