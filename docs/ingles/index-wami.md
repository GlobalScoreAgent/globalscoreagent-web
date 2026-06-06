# Index WAMI – Wallet Advanced Metrics Index

**Version 1.0**  
**Date:** May 19, 2026 (Updated with Maturity Levels)  
**Designed for:** GlobalScoreAgent Ecosystem (ERC-8004)

---

## What is the Index WAMI?

The **Index WAMI** (Wallet Advanced Metrics Index) is a powerful, single-number reputation score ranging from **0 to 100** that measures the overall quality, legitimacy, risk level, and maturity of any on-chain wallet.

It is calculated by combining **four independent pillars**, each worth a maximum of 25 points, for a total of 100 points. Every point is derived from real, verifiable on-chain data already available in the system.

WAMI provides a clear, transparent, and easy-to-understand metric that answers the key question:  
**“How trustworthy and high-quality is this wallet?”**

It is especially valuable for wallets that own or register Agents in the ERC-8004 ecosystem, but it works for any wallet address.

---

## WAMI Maturity Levels (Business Interpretation)

The WAMI score (0–100) is translated into **5 clear maturity/confidence levels**. These levels are used in the dashboard for:
- Filters and advanced search
- Badges and colors on wallet cards / Agent owner views
- Risk alerts when combined with HUMI
- Ranking and recommendations

| Level           | WAMI Range | UI Color       | Badge / Label   | Description for Users (Dashboard)                                      | Business Trust Level               | Approx. Risk   |
|-----------------|------------|----------------|-----------------|------------------------------------------------------------------------|------------------------------------|----------------|
| **Unstable**    | 0 – 49     | 🔴 Red         | Unstable        | High-risk wallet with suspicious origins, low activity or poor quality. Extreme caution required. | Very low – Not recommended         | High           |
| **Developing**  | 50 – 64    | 🟠 Orange      | Developing      | Basic wallet. Has minimal presence but still immature.                 | Moderate – Monitor closely         | Medium-High    |
| **Stable**      | 65 – 79    | 🟢 Light Green | Stable          | Reliable wallet with solid quality and maturity. Recommended for general use. | Good – Acceptable confidence level | Low            |
| **Very Stable** | 80 – 89    | 🟢 Green       | Very Stable     | Mature, consistent, and high-quality wallet. High reliability.         | High – Suitable for critical use   | Very Low       |
| **Elite**       | 90 – 100   | 🟢 Dark Green  | Elite           | Exceptional wallet in the ecosystem. Maximum quality and maturity.     | Very High / Premium – Maximum trust| Minimal        |

**Business Notes:**
- The threshold for “**Stable**” has been raised to **65+** (previously too permissive). This prevents wallets with structural weaknesses (suspicious origins, low diversification, wash-trading signals, etc.) from being perceived as reliable.
- Any WAMI **< 65** should always show a visual warning when combined with HUMI.
- The levels respect the progressive v2.0 philosophy: new wallets can quickly reach “Developing”, but reaching “Stable” requires real on-chain maturity across all four pillars.
- **Aligned with HUMI** – same ranges, same colors, and same badges for perfect consistency across Agents and Wallets.

---

## How Index WAMI Applies to the ERC-8004 Ecosystem

In the ERC-8004 ecosystem, every Agent is controlled or registered by a wallet. The quality of that wallet directly impacts the credibility of the Agent itself.

Index WAMI acts as a **trust layer for wallets**, just like the Index Humi acts as a trust layer for Agents. It enables:
- Automatic evaluation of Agent owners before they interact with protocols, governance, or marketplaces.
- Real-time risk assessment for any wallet interacting with Agents (staking, payments, attestations, etc.).
- Seamless integration with the existing Index Humi to create a complete reputation system (Agent + Owner wallet).

By adding WAMI, the entire ERC-8004 network gains a standardized way to distinguish legitimate, battle-tested wallets from new, risky, or artificially inflated ones.

---

## Benefits of Using Index WAMI

- **Instant Trust Decision:** One number (0–100) tells users, platforms, and protocols everything they need to know about a wallet’s quality.
- **Risk Reduction:** Automatically flags wallets with suspicious funding origins, wash-trading behavior, or unnatural activity.
- **Better Agent Reputation:** High-WAMI owner wallets improve the overall Index Humi score of their Agents.
- **Transparent & Auditable:** Every point is backed by on-chain data and fully explainable (no black-box AI).
- **Scalable & Real-Time:** Updates automatically as new wallet activity is processed.
- **Business Opportunities:** Enables premium features such as wallet scoring APIs, risk alerts, advanced search filters, and KYC-lite onboarding.
- **Ecosystem-Wide Standardization:** Creates a common language of trust across all Agents, owners, and dApps in the ERC-8004 network.

---

## How Index WAMI Complements the Index Humi

Index WAMI and Index Humi work together as a **complete reputation stack** for the ERC-8004 ecosystem:

- **Index Humi** evaluates the **Agent** itself (metadata quality, activity, identity, protocol usage, owner history, etc.).
- **Index WAMI** evaluates the **wallet behind the Agent** (the owner or registering wallet).

**Key synergy:**
- A high WAMI score (e.g., 85+) is further strengthened when the owner wallet also has a high HUMI score, creating the strongest possible trust signal.
- A low WAMI score (e.g., below 60) combined with a low HUMI score raises strong red flags, even if one of them looks acceptable in isolation.
- Together they provide the full picture: **“Is the Agent well-built AND is it controlled by a trustworthy wallet?”**

This combination creates the most robust reputation system in the ERC-8004 ecosystem — far stronger than evaluating Agents or wallets in isolation.

---

## Comparison with External Reputation Indices and Oracles

| Index / Oracle                  | Provider          | Focus                          | Score Range | Data Used                     | Key Advantage of WAMI                                      |
|---------------------------------|-------------------|--------------------------------|-------------|-------------------------------|------------------------------------------------------------|
| **Nansen Wallet Score**         | Nansen            | Wallet behavior & labels       | 0–100       | Off-chain + on-chain analytics| WAMI is fully on-chain and native to ERC-8004 Agents      |
| **Arkham Intelligence**         | Arkham            | Entity labeling & fund flows   | Risk-based  | On-chain + entity database    | WAMI provides a single, simple 0-100 score with pillars    |
| **Chainalysis / TRM Labs**      | Chainalysis/TRM   | Risk & compliance scoring      | Risk tiers  | On-chain + off-chain intel    | WAMI is public, transparent, and Agent-specific           |
| **Dune / Community Dashboards** | Open-source       | Custom wallet metrics          | Varies      | On-chain queries              | WAMI is standardized, real-time, and integrated with GSA  |
| **EigenLayer / Other DeFi Rep.**| Various DeFi      | Staking & restaking reputation | Varies      | Protocol-specific activity    | WAMI works across all chains and is Agent-owner focused    |

**Why WAMI stands out:**
- It is purpose-built for the **ERC-8004 Agent ecosystem** (most external tools are general-purpose).
- Fully on-chain and transparent (no proprietary black-box models).
- Directly integrated with Index Humi for a complete Agent + Owner reputation system.
- Free from external dependencies — all data is sourced directly from the blockchain (wallet activity indexed via Alchemy, Moralis, and Zerion) and stored in our walcert tables.

---

## Data Freshness and Wallet Evaluation Strategy

Index WAMI is engineered for both **accuracy** and **efficiency**. Instead of recalculating scores for every wallet constantly, the system intelligently selects which wallets to evaluate and how often to refresh each data module.

### Which wallets are evaluated?
WAMI only scores **high-relevance wallets** that are actively monitored in the system:
- Wallets with status **“valid”** or **“monitoring”**
- Wallets that have an established **start monitoring date**
- Wallets automatically categorized by their real activity level (e.g., Explosive Growth, Hyper Growth, Sustained Growth, Steady Active, New High-Nonce, Dormant High-Nonce, etc.)

This focused approach ensures that only wallets with meaningful on-chain history and ongoing activity receive a WAMI score, eliminating noise from dormant or irrelevant addresses.

### How often is each module refreshed?
The system uses smart **“does need”** logic to trigger updates only when necessary:
- **Origins & Legitimacy (Fund Origins):** Refreshed **once** when the wallet first qualifies as valid (this is a heavier, one-time foundational analysis).
- **Recent Flows, Portfolio Quality, and Multi-Chain Presence:** Refreshed **every 15 days** for actively valid/growing wallets (or immediately if the data has never been calculated before).

### Benefits of this approach
- **Maximum efficiency:** Computational resources are focused only on wallets that matter and only when the data is stale.
- **Guaranteed freshness:** Users and platforms always see scores based on data no older than 15 days for the most dynamic modules.
- **Smart prioritization:** Fast-growing or highly active wallets are refreshed more responsively, while stable wallets don’t waste resources.
- **Scalability:** The system can handle thousands of wallets without constant full recalculations.
- **Cost-effective & sustainable:** Reduces database load and processing overhead while maintaining high data quality.

This strategy ensures Index WAMI remains both accurate and performant at ecosystem scale.

---

## Pillars of the Index WAMI

Each pillar is worth exactly **25 points**. Below are the specific aspects analyzed and the maximum points each aspect can contribute.

### 1. Origins & Legitimacy (25 points)
Evaluates how clean and natural the wallet’s funding history is.
- Quality and legitimacy of the very first funds received: **8 points**
- Low risk of mixing services or suspicious fund sources: **7 points**
- Absence of heavy reliance on centralized exchange (CEX) inflows: **5 points**
- Healthy diversity of funding sources and senders: **5 points**

### 2. Portfolio Quality (25 points)
Measures the health, liquidity, and sophistication of the assets held by the wallet.
- Total portfolio value and overall asset health: **7 points**
- High proportion of liquid (easily tradable) assets: **6 points**
- Strong diversification across different token types and categories: **6 points**
- Balanced exposure to stable and verified assets with minimal low-quality holdings: **6 points**

### 3. Activity & Behavior (25 points)
Analyzes whether the wallet’s recent activity looks natural and sustainable.
- Natural volume and balance of inflows vs outflows: **7 points**
- Low signs of wash-trading or artificial transaction cycles: **6 points**
- High number of unique, genuine counterparties: **6 points**
- Limited suspicious patterns (shared wallets, concentrated timing, excessive CEX interaction): **6 points**

### 4. Multi-Chain Presence & Maturity (25 points)
Assesses the wallet’s longevity, geographic spread, and consistency across blockchains.
- Long history of consistent activity (age and span): **8 points**
- Active presence across multiple blockchain networks: **7 points**
- Balanced and coherent activity patterns across chains: **5 points**
- Overall maturity demonstrated by sustained engagement: **5 points**

---

**Ready to implement?**  
For the technical implementation of the API and access to the Dashboard, we recommend visiting our official website:  
**https://www.globalscoreagent.com/**

Together with Index HUMI, WAMI forms the new standard for trust in the ERC-8004 ecosystem.
