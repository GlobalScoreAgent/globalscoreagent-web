# Technical Documentation: Index HUMI Calculation Logic

**Version**: 2.0 (Progressive Scoring - Vertical Structure)  
**Date**: May 21, 2026  
**Purpose**: This document explains the exact scoring rules, ranges, technical implementation, and **business validation** for every item in the **Human-like Maturity Index (HUMI)** for autonomous agents on the ERC-8004 ecosystem.

The HUMI index evaluates the overall maturity, quality, trustworthiness, and activity of an agent on a **0–100 scale** across **four pillars** (25 points each). All scoring is **progressive** (Basic / Intermediate / Advanced) to be fair to new/small agents while still rewarding mature, well-documented, and highly active ones.

## Pillar 1: Measure (Quality & Existence)

**Business Purpose**:  
Evaluates metadata quality, real existence of the agent, external audits, protocol activity, identity analysis, and penalties for duplicates/spam. It is the backbone of the agent’s “reality” score.

| Item                              | Points | Technical Scoring Logic                                                                 | Business Validation                                      |
|-----------------------------------|--------|------------------------------------------------------------------------------------------|----------------------------------------------------------|
| Metadata Richness (Basic)         | 4.0    | `(gsa_metadata_richness_score / 100.0) × 4.0`                                           | Measures how complete and professional the agent’s metadata is. |
| Basic Existence (Basic)           | 6.0    | 6.0 if `nonce_current > 0` **OR** at least one of: identity, audit, protocol activity   | Confirms the agent has real activity (wallet or on-chain). |
| Wallet Transaction Quality (Intermediate) | 3.0    | Scale based on `nonce_delta_3month` or `nonce_delta_1month` (≥1000=3, ≥300=2, ≥50=1, ≥1=0.5) | Wallet transaction volume indicates real usage.          |
| External Audit (Intermediate)     | 3.0    | ≥1 audit + avg_score ≥70% = 3 pts (graduated scale)                                     | Presence and quality of external audits.                 |
| Protocol Activity (Intermediate)  | 3.0    | 1-7 activities + avg_score ≥60% = 3 pts                                                 | Protocol activity quantity and quality.                  |
| External Audit (Advanced)         | 3.0    | ≥2 audits + avg_score ≥90% = 3 pts (stricter scale)                                     | High quantity and quality of external audits.            |
| Wallet Transaction Quality (Advanced) | 1.0    | `nonce_delta_6month ≥ 800`                                                               | Sustained high wallet volume.                            |
| Identity Analysis                 | 1.0    | `(identity_score / 100) × 1.0` (max 1.0)                                                | Soulbound/identity analysis depth.                       |
| Protocol Activity (Advanced)      | 1.0    | ≥10 activities + avg_score ≥90% = 1.0 pts                                               | Advanced protocol activity.                              |
| **Global Penalty**                | -1.5   | -1.5 if any revoke or significant warning exists                                        | Penalty for spam/revocations.                            |
| **Duplication Analysis**          | ±2.0   | +2.0 unique / -2.0 duplicated                                                           | Prevents cloned agents.                                  |

**Total Pillar Measure**: 25 pts

## Pillar 2: Usage (Activity & Usage)

**Business Purpose**:  
Measures the agent’s recent activity (last 30 days) both on wallet and on-chain, detecting real usage versus inactivity or manipulation.

| Item                                      | Points | Technical Scoring Logic                                                                 | Business Validation                                      |
|-------------------------------------------|--------|------------------------------------------------------------------------------------------|----------------------------------------------------------|
| Basic General Activity                    | 10.0   | 10 pts if (new agent with `nonce_current > 0`) **OR** (established with `nonce_delta_30d > 0` or ≥2 on-chain types) | Confirms basic recent activity.                          |
| Wallet Intermediate                       | 3.0    | Scale based on agent age (new <15d uses `nonce_current`, else `nonce_delta_15d`)        | Recent wallet transaction volume.                        |
| On-Chain Activity Intermediate            | 5.0    | ≥2 on-chain types + graduated avg_score (90+=5, 70+=4, etc.)                           | Diversity and quality of on-chain activity.              |
| Comments                                  | 1.0    | `comments_delta_30d ≥ 1` and no revokes                                                 | Positive recent feedback.                                |
| Wallet Advanced                           | 1.5    | `nonce_delta_yesterday` or `nonce_current ≥ 500`                                        | Very recent and intense wallet activity.                 |
| On-Chain Activity Advanced                | 3.0    | ≥3 on-chain types + avg_score ≥80%                                                      | High maturity on-chain activity.                         |
| Protocol Activity with Payments           | 1.5    | ≥2 protocol activities + at least 1 with payment                                        | Real protocol usage with economic incentives.            |
| **Global Penalty**                        | -1.5   | -1.5 if any revoke in the last 30 days                                                  | Penalty for negative recent behavior.                    |

**Total Pillar Usage**: 25 pts

## Pillar 3: History (Owner History & Stability)

**Business Purpose**:  
Evaluates owner stability, antiquity, agent portfolio quality, and overall owner history.

| Item                                      | Points | Technical Scoring Logic                                                                 | Business Validation                                      |
|-------------------------------------------|--------|------------------------------------------------------------------------------------------|----------------------------------------------------------|
| Owner Wallet Active (Basic)               | 5.0    | 5 pts if owner wallet is active or has active agents in portfolio                       | Confirms the owner is a real participant.                |
| Ownership Stability (Basic)               | 5.0    | <6 months: 0 changes → 5 pts; ≥6 months: ≤1 change → 5 pts                             | Stability of ownership on this agent.                    |
| Owner Advanced Antiquity (Intermediate)   | 3.0    | 6m-1y=1, 1-2y=2, >2y=3                                                                  | Owner’s age in the network.                              |
| Active Agents in Portfolio (Intermediate) | 3.0    | ≥80% of portfolio agents are active                                                     | Healthy portfolio.                                       |
| Minimum External Audit (Intermediate)     | 1.5    | ≥1 agent with external audit                                                            | Minimum audit presence in portfolio.                     |
| No External Warnings (Intermediate)       | 1.5    | ≤10% of agents with warnings                                                            | Clean portfolio (low risk).                              |
| Good Metadata + Services (Advanced)       | 1.5    | Combination of metadata richness + % agents with services                               | Technical quality of the portfolio.                      |
| Advanced External Audits (Advanced)       | 2.0    | 100% coverage + high quality                                                            | High audit standard across the entire portfolio.         |
| General Portfolio Activity (Advanced)     | 2.5    | ≥100% coverage + quality ≥70%                                                           | Sustained and quality activity in the portfolio.         |

**Total Pillar History**: 25 pts

## Pillar 4: Information (Information Richness)

**Business Purpose**:  
Measures the completeness of the agent’s identity (name, description, image, endpoints, technical metadata, contacts, etc.).

| Item                                      | Points | Technical Scoring Logic                                                                 | Business Validation                                      |
|-------------------------------------------|--------|------------------------------------------------------------------------------------------|----------------------------------------------------------|
| Name (Basic)                              | 3.0    | 3 pts if clean name ≥3 chars and not suspicious                                         | Clear and professional basic identity.                   |
| Description (Basic)                       | 3.0    | ≥80 chars=3, 40-79=1.8, 10-39=0.9 (penalizes repetitive spam)                          | Rich and non-repetitive description.                     |
| Image (Basic)                             | 1.5    | 1.5 if URL ends with valid image extension                                              | Representative image present.                            |
| Basic Sources (Basic)                     | 2.5    | 2.5 if Chain + URI present                                                              | Minimum official sources exist.                          |
| External Sources / Diversity (Intermediate) | 3.0    | Base 1.5 + 0.5 per additional source (max 3.0)                                         | Diversity of information sources.                        |
| Web or Email (Intermediate)               | 1.0    | 1.0 if web or email endpoint exists                                                     | Basic accessible contact.                                |
| Programmatic / API (Intermediate)         | 1.5    | 1.5 if API/REST endpoint exists                                                         | Programmatic capability.                                 |
| Supported Trust (Intermediate)            | 1.0    | 1.0 if `supported_trusts` has data                                                      | Explicit trust declared.                                 |
| Verification Methods (Intermediate)       | 1.0    | 1.0 if `verification_methods` has data                                                  | Verification methods present.                            |
| Basic Technical Metadata (Intermediate)   | 1.5    | 0-1 fields=0, 2=0.75, 3-4=1.5                                                           | Initial technical maturity.                              |
| MCP Endpoint (Advanced)                   | 2.0    | 2.0 if MCP endpoint exists                                                              | Advanced communication protocol.                         |
| A2A Endpoint (Advanced)                   | 2.0    | 2.0 if A2A endpoint exists                                                              | Advanced agent-to-agent protocol.                        |
| Advanced Technical Setup (Advanced)       | 2.0    | ≥2 of: Technology Stack, x402, Technical Tools, Technical Capabilities                 | Professional technical configuration.                    |

**Total Pillar Information**: 25 pts

## Final HUMI Index Calculation

```sql
-- Main logic (index_humi_agent_calculate)
index_humi_score = pillar_history_score + 
                   pillar_information_score + 
                   pillar_measure_score + 
                   pillar_usage_score
