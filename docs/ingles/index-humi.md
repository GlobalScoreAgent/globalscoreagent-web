# Index HUMI – Agent Human-like Intelligence Index

**Version 1.0**  
**Date:** May 19, 2026 (Updated with Maturity Levels)  
**Designed for:** GlobalScoreAgent Ecosystem (ERC-8004)

---

## What is the Index HUMI?

The **Index HUMI** (Human-like Metrics Index) is a powerful, single-number reputation score ranging from **0 to 100** that measures the overall quality, legitimacy, maturity, and real-world intelligence of any Agent in the ERC-8004 ecosystem.

It is calculated by combining **four independent pillars**, each worth a maximum of 25 points, for a total of 100 points. Every point is derived from real, verifiable on-chain data (metadata, activity, owner history, external analysis, and protocol usage).

HUMI provides a clear, transparent, and easy-to-understand metric that answers the key question:  
**“How trustworthy, mature, and human-like is this Agent?”**

It is the core reputation layer for every Agent registered in the ERC-8004 network.

---

## HUMI Maturity Levels (Business Interpretation)

The HUMI score (0–100) is translated into **5 clear maturity/confidence levels**. These levels are used in the dashboard for:
- Filters and advanced search
- Badges and colors on Agent cards
- Ranking and recommendations
- Risk alerts when combined with WAMI

| Level          | HUMI Range | UI Color       | Badge / Label   | Description for Users (Dashboard)                                      | Business Trust Level          | Approx. Risk   |
|----------------|------------|----------------|-----------------|------------------------------------------------------------------------|-------------------------------|----------------|
| **Unstable**   | 0 – 49     | 🔴 Red         | Unstable        | High-risk or very low maturity Agent. Extreme caution required.        | Very low – Not recommended for production | High           |
| **Developing** | 50 – 64    | 🟠 Orange      | Developing      | Basic Agent. Has minimal presence but still immature.                  | Moderate – Monitor closely    | Medium-High    |
| **Stable**     | 65 – 79    | 🟢 Light Green | Stable          | Reliable Agent with solid intermediate maturity. Recommended for general use. | Good – Acceptable confidence level | Low            |
| **Very Stable**| 80 – 89    | 🟢 Green       | Very Stable     | Mature, consistent, and high-quality Agent. High reliability.          | High – Suitable for critical integrations | Very Low       |
| **Elite**      | 90 – 100   | 🟢 Dark Green  | Elite           | Reference Agent in the ecosystem. Maximum quality and maturity.        | Very High / Premium – Maximum trust | Minimal        |

---

## How Index HUMI Applies to the ERC-8004 Ecosystem

In the ERC-8004 ecosystem, Agents are autonomous entities that interact with users, protocols, and each other. Their credibility is critical for adoption, governance, staking, and marketplace listings.

Index HUMI acts as the **primary trust layer for Agents**, evaluating not just technical features but the full picture of legitimacy and real activity. It is calculated **daily** by querying the official Graph from Ormi Labs across the six main chains we monitor: **BSC, Base, Polygon, BNB Chain, Arbitrum, and Solana**.

HUMI applies to **all Agents** — new or ancient, high-activity or low-activity — ensuring every registered Agent receives a fair, up-to-date reputation score.

It enables:
- Automatic ranking and filtering of Agents in dashboards and marketplaces.
- Real-time risk assessment before any interaction (executions, attestations, payments, etc.).
- Seamless integration with Index WAMI to create a complete reputation system (Agent + Owner wallet).

By adding HUMI, the entire ERC-8004 network gains a standardized way to distinguish high-quality, battle-tested Agents from low-effort or suspicious ones.

---

## Benefits of Using Index HUMI

- **Instant Trust Decision:** One number (0–100) tells users, platforms, and protocols everything they need to know about an Agent’s quality.
- **Risk Reduction:** Automatically flags Agents with poor ownership history, low metadata quality, suspicious activity, or weak external validation.
- **Better Wallet Reputation Synergy:** High-HUMI Agents paired with high-WAMI owner wallets receive maximum trust signals.
- **Transparent & Auditable:** Every point is backed by on-chain data and fully explainable (no black-box AI).
- **Scalable & Real-Time:** Updates automatically as new Agent activity and analysis records are processed.
- **Business Opportunities:** Enables premium features such as Agent scoring APIs, advanced search filters, governance weighting, and marketplace curation.
- **Ecosystem-Wide Standardization:** Creates a common language of trust across all Agents, owners, and dApps in the ERC-8004 network.

---

## How Index HUMI Complements the Index WAMI

Index HUMI and Index WAMI work together as a **complete reputation stack** for the ERC-8004 ecosystem:

- **Index HUMI** evaluates the **Agent** itself (metadata quality, activity, identity, protocol usage, owner history, etc.).
- **Index WAMI** evaluates the **wallet behind the Agent** (the owner or registering wallet).

**Key synergy:**
- A high HUMI score (e.g., 85+) is further strengthened when the owner wallet also has a high WAMI score, creating the strongest possible trust signal.
- A low HUMI score (e.g., below 60) combined with a low WAMI score raises strong red flags, even if one of them looks acceptable in isolation.
- Together they provide the full picture: **“Is the Agent well-built AND is it controlled by a trustworthy wallet?”**

This combination creates the most robust reputation system in the ERC-8004 ecosystem — far stronger than evaluating Agents or wallets in isolation.

---

## Comparison with External Reputation Indices and Oracles

| Index / Oracle                  | Provider          | Focus                          | Score Range | Data Used                     | Key Advantage of HUMI                                      |
|---------------------------------|-------------------|--------------------------------|-------------|-------------------------------|------------------------------------------------------------|
| **Nansen / Arkham Agent Scores**| Nansen / Arkham   | Wallet & entity labeling       | 0–100       | Off-chain + on-chain analytics| HUMI is purpose-built for ERC-8004 Agents                 |
| **Chainalysis / TRM Labs**      | Chainalysis/TRM   | Risk & compliance scoring      | Risk tiers  | On-chain + off-chain intel    | HUMI is public, transparent, and Agent-specific           |
| **Dune / Community Dashboards** | Open-source       | Custom on-chain metrics        | Varies      | On-chain queries              | HUMI is standardized, real-time, and integrated with GSA  |
| **EigenLayer / DeFi Reputation**| Various DeFi      | Staking & protocol reputation  | Varies      | Protocol-specific activity    | HUMI evaluates full Agent lifecycle across all chains     |
| **General AI Agent Scores**     | Various startups  | Off-chain AI metrics           | Varies      | API + metadata                | HUMI is fully on-chain and tied to ERC-8004 registrations |

**Why HUMI stands out:**
- It is purpose-built for the **ERC-8004 Agent ecosystem** (most external tools are general-purpose or wallet-only).
- Fully on-chain and transparent (no proprietary black-box models).
- Directly integrated with Index WAMI for a complete Agent + Owner reputation system.
- Free from external dependencies — all data is sourced directly from the blockchain (ERC-8004 Graph from Ormi Labs + wallet activity indexed via Alchemy, Moralis, and Zerion) and stored in our ERC-8004 and walcert tables.

---

## Data Freshness and Agent Evaluation Strategy

Index HUMI is engineered for both **accuracy** and **efficiency**. It is **recalculated daily** using the official Graph provided by Ormi Labs, ensuring every Agent has fresh, reliable data.

### Which Agents are evaluated?
HUMI evaluates **all Agents** in the ecosystem without exception:
- New Agents and ancient Agents
- High-activity Agents and low-activity Agents
- Agents across all monitored chains

This universal approach guarantees that every registered Agent receives a fair and current reputation score.

### What data is refreshed daily?
- **Nonce and balance** of **all wallets** associated with Agents (owner wallets and registration wallets).
- **On-chain activity** and registration data from the six chains we monitor daily: **BSC, Base, Polygon, BNB Chain, Arbitrum, and Solana**.
- **Off-chain pointers** found directly in ERC-8004 records, including:
  - Metadata URIs and DID documents
  - Feedbacks from more than **21 external entities** (processed automatically)

The system intelligently decides which modules need updating based on the latest Graph data and time-based freshness rules. This daily cycle, combined with smart “does need” flags, keeps the index accurate without unnecessary recomputation.

### Benefits of this approach
- **Maximum freshness:** Scores are never more than 24 hours old.
- **Complete coverage:** Every Agent — regardless of age or activity level — is included.
- **Rich data depth:** Combines on-chain Graph data with imported off-chain metadata and external feedbacks.
- **Scalability:** Daily processing across six major chains remains efficient thanks to intelligent filtering.
- **Trust at ecosystem scale:** Users and platforms always see the most current and comprehensive view of Agent quality.

This strategy ensures Index HUMI remains both accurate and performant at ecosystem scale.

---

## Pillars of the Index HUMI

Each pillar is worth exactly **25 points**. Below are the specific aspects analyzed and the maximum points each aspect can contribute.

### 1. Pillar History (25 points)
Evaluates the Agent’s ownership stability and historical reputation.
- Strength and activity of the owner wallet: **10 points**
- Stability of ownership over time (few or no changes): **5 points**
- Longevity and antiquity of the owner wallet: **5 points**
- Quality and activity of the owner’s overall Agent portfolio: **5 points**

### 2. Pillar Information (25 points)
Measures the richness, professionalism, and completeness of the Agent’s public identity and technical metadata.
- Quality of name, description, and image: **7.5 points**
- Diversity and depth of information sources (Chain + URI + external): **7.5 points**
- Availability of contact methods and programmatic endpoints: **5 points**
- Advanced technical maturity (supported trust, verification methods, skills, etc.): **5 points**

### 3. Pillar Measure (25 points)
Assesses external validation, metadata richness, and specialized analysis of the Agent.
- Metadata richness and completeness: **8 points**
- Existence of external audits and protocol activity: **7 points**
- Identity analysis and specialized evaluations: **5 points**
- Overall quality signals with duplication and penalty adjustments: **5 points**

### 4. Pillar Usage (25 points)
Analyzes the Agent’s real on-chain activity and engagement level.
- Natural and consistent recent activity (wallet + on-chain): **10 points**
- Volume and quality of attestations, comments, and executions: **6 points**
- Advanced activity patterns with payments and protocol usage: **5 points**
- Absence of suspicious patterns or penalties: **4 points**

---

**Ready to implement?**  
For the technical implementation of the API and access to the Dashboard, we recommend visiting our official website:  
**https://www.globalscoreagent.com/**

Together with Index WAMI, HUMI forms the new standard for trust in the ERC-8004 ecosystem.
