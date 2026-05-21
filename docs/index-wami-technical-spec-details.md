# Technical Documentation: Index WAMI Calculation Logic

**Version**: 2.0 (Progressive Scoring)  
**Date**: May 2026  
**Purpose**: Explain the exact scoring rules, ranges, and **business validation** for every item in the Wallet Activity Maturity Index (WAMI).

The WAMI index evaluates wallet quality and trustworthiness on a 0–100 scale across **four pillars** (25 points each). All scoring is now **progressive** to be fair to new/small wallets while still rewarding mature and high-quality ones.

## Pillar 1: Origins / Legitimacy

**Business Purpose**:  
This pillar validates the **cleanliness and legitimacy of the funds** entering the wallet. It helps detect potential money laundering, mixing services, CEX-heavy funding, or suspicious origins, giving confidence that the wallet was not funded with illicit or high-risk capital.

| Item                        | Points | Technical Scoring Logic | Business Validation |
|-----------------------------|--------|--------------------------|---------------------|
| First Funds Quality         | 8 pts max | 8 pts if non-CEX + organic/dex/bridge/airdrop + no mint<br>6 pts if non-CEX but not perfectly clean<br>3 pts if CEX origin<br>1 pt if CEX + mint | Measures whether the very first funds came from legitimate, low-risk sources. |
| Mixing Risk                 | 2 pts max | 2 pts if `suspected_mixing_score` ≤ 10 AND mixing_risk = 'low'<br>1 pt if ≤ 40<br>0 pts otherwise | Detects exposure to mixing/tumbling services that could indicate illicit funds. |
| Low CEX Reliance            | 5 pts max | 5 pts if `is_cex_origin` = false<br>3 pts if CEX but ≤ 2 detected CEX addresses<br>1 pt if CEX with > 2 addresses | Evaluates how dependent the wallet is on centralized exchanges (higher CEX reliance = higher regulatory and risk exposure). |
| Funding Diversity           | 4 pts max | 4 pts if ≥20 senders AND ratio ≥ 0.50<br>2.5 pts if ≥10 senders AND ratio ≥ 0.35<br>1 pt if ≥5 senders<br>0 pts otherwise | Measures how diversified the funding sources are — concentrated inflows increase risk of coordinated attacks or single-point failure. |
| Low Inflow Concentration    | 3 pts max | 3 pts if `inflow_concentration_score` ≤ 30<br>1.5 pts if ≤ 50<br>0 pts otherwise | Validates that no single source dominates the inflows (reduces risk of sudden large suspicious transfers). |
| Minimal Mixing Risk         | 3 pts max | 3 pts if `suspected_mixing_score` = 0 AND mixing_risk = 'low'<br>0 pts otherwise | Confirms the wallet has virtually zero exposure to known mixing services. |

## Pillar 2: Quality (Portfolio Health)

**Business Purpose**:  
This pillar assesses the **current financial health, liquidity, and sophistication** of the wallet’s holdings. It helps determine whether the wallet is professionally managed or speculative/low-quality.

| Item                              | Points | Technical Scoring Logic | Business Validation |
|-----------------------------------|--------|--------------------------|---------------------|
| Total Value Health                | 5 pts max | 1 pt ≤ $20<br>2 pts $20–60<br>3 pts $60–150<br>4 pts $150–500<br>5 pts > $500 | Measures the economic substance and seriousness of the wallet (small balances are common in new agents, but very low values indicate limited operational capacity). |
| Liquid Assets Ratio               | 3 pts max | 3 pts ≥ 90%<br>2 pts ≥ 70%<br>1 pt ≥ 50%<br>0 pts otherwise | Evaluates how easily the wallet can access its capital (high liquidity = lower risk of being locked in illiquid positions). |
| Token Diversification             | 6 pts max | Concentration % = 100 / unique_tokens<br>6 pts if ≥ 15 tokens<br>4 pts if ≥ 8 tokens<br>2 pts if ≥ 4 tokens<br>0 pts otherwise | Measures how spread out the holdings are — higher diversification reduces concentration risk and shows more professional portfolio management. |
| Stable & Verified Assets          | 3 pts max | 3 pts ≥ 60%<br>2 pts ≥ 40%<br>1 pt ≥ 20%<br>0 pts otherwise | Validates the percentage of capital held in stablecoins and verified (trusted) tokens — high % indicates lower volatility risk. |
| Low Risk Holdings                 | 3 pts max | 3 pts if meme % ≤ 30<br>1.5 pts if ≤ 50<br>0 pts otherwise | Measures exposure to high-risk / speculative assets (meme coins) vs. safer holdings. |
| Sophisticated Composition         | 3 pts max | 3 pts if has LP AND stable_verified ≥ 40%<br>1.5 pts if has LP OR stable_verified ≥ 60%<br>0 pts otherwise | Evaluates whether the wallet uses advanced DeFi instruments (LPs, bluechips, protocols) — indicates professional-grade usage. |

## Pillar 3: Activity Behavior

**Business Purpose**:  
This pillar analyzes **transactional behavior** to distinguish natural, healthy activity from manipulative patterns (wash trading, suspicious cycles, excessive CEX usage, etc.).

| Item                              | Points | Technical Scoring Logic | Business Validation |
|-----------------------------------|--------|--------------------------|---------------------|
| Inflow / Outflow Balance          | 5 pts max | 5 pts if net_flow / total_moved ≤ 0.20<br>3.5 pts ≤ 0.40<br>2 pts ≤ 0.60<br>0 pts otherwise | Measures whether inflows and outflows are naturally balanced (extreme imbalance may indicate dumping or artificial activity). |
| Unique Counterparties             | 5 pts max | 5 pts ≥ 30<br>3.5 pts ≥ 15<br>1.5 pts ≥ 5<br>0 pts otherwise | Evaluates how many different counterparties the wallet interacts with — higher number indicates genuine network usage. |
| Low Wash Trading                  | 5 pts max | 5 pts if wash_trading_score ≤ 5<br>3 pts ≤ 15<br>1 pt ≤ 30<br>0 pts otherwise | Detects artificial volume creation through wash trading. |
| Low Suspicious Patterns           | 4 pts max | 4 pts if suspicious_cycle / total_transfers ≤ 0.08<br>2.5 pts ≤ 0.20<br>0 pts otherwise | Identifies circular or suspicious transaction patterns commonly associated with manipulation. |
| Low CEX Interaction               | 3 pts max | 3 pts if CEX flow / total_moved ≤ 0.15<br>1.5 pts ≤ 0.35<br>0 pts otherwise | Measures reliance on centralized exchanges (high CEX usage increases regulatory and counterparty risk). |
| Healthy Interaction Ratio         | 3 pts max | 3 pts if repeat_interaction_ratio ≥ 70 AND span ≥ 7 days<br>1.5 pts if repeat ≥ 50 OR span ≥ 7 days<br>0 pts otherwise | Validates whether the wallet shows repeated, natural interactions with other addresses (healthy relationship building). |

## Pillar 4: Multi-Chain Presence & Maturity

**Business Purpose**:  
This pillar measures the **longevity, cross-chain adoption, and consistency** of the wallet, indicating whether it is a serious, long-term participant or a temporary/throwaway wallet.

| Item                              | Points | Technical Scoring Logic | Business Validation |
|-----------------------------------|--------|--------------------------|---------------------|
| Activity Span Age                 | 5 pts max | 1 pt ≥ 7 days<br>2 pts ≥ 15 days<br>3 pts ≥ 30 days<br>4 pts ≥ 60 days<br>5 pts ≥ 90 days | Measures how long the wallet has been active — longer span = higher maturity and lower likelihood of being a short-term throwaway. |
| Multi Chain Presence              | 5 pts max | 1 pt ≥ 2 chains<br>2 pts ≥ 3 chains<br>3 pts ≥ 4 chains<br>4 pts ≥ 5 chains<br>5 pts ≥ 6 chains | Evaluates diversification across blockchains — multi-chain presence shows technical sophistication and risk mitigation. |
| Cross Chain Balance               | 5 pts max | 5 pts if ≥ 4 chains<br>3 pts if ≥ 3 chains<br>1 pt if ≥ 2 chains<br>0 pts otherwise | Measures how evenly capital is distributed across chains (avoiding concentration risk). |
| Sustained Engagement              | 5 pts max | Progressive scale based on span + recency of last activity (see full code) | Validates whether the wallet shows ongoing, consistent engagement rather than sporadic or abandoned behavior. |
| High Active Chains                | 5 pts max | 5 pts ≥ 6 chains<br>4 pts ≥ 5 chains<br>3 pts ≥ 4 chains<br>2 pts ≥ 3 chains<br>1 pt ≥ 2 chains<br>0 pts otherwise | Identifies wallets that actively operate on many chains simultaneously (high operational maturity). |
| Cross Chain Consistency           | 3 pts max | 3 pts if ≥ 3 chains<br>1.5 pts if ≥ 2 chains<br>0 pts otherwise | Checks whether activity is consistent across chains (reduces risk of one chain being used for suspicious purposes). |

---

**Final WAMI Score (0–100)**  
The final score is the simple sum of the four pillar scores.

**Notes**  
- All calculations use safe `COALESCE(..., 0)` to handle wallets that have partial data.  
- Scoring is intentionally progressive to give fair points to new/small wallets while rewarding maturity.  
- All data comes from existing `erc_8004` and `walcert` tables (no external dependencies).

¿Quieres que agregue alguna sección adicional (ejemplos numéricos, fórmula final del WAMI, cómo se combina con HUMI, o una tabla de resumen de todos los ítems)? Dime y lo incluyo inmediatamente.
