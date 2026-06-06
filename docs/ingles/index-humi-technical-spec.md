# Index HUMI – Technical Specification

**Version 1.0**  
**Date:** May 19, 2026  
**Index Type:** Agent Reputation Score (0–100)

---

## Overview

The **Index HUMI** (Human-like Metrics Index) is a composite reputation score from **0 to 100** that evaluates the overall quality, legitimacy, maturity, and real-world intelligence of any Agent in the ERC-8004 ecosystem.

It is built from **four independent pillars**, each worth a maximum of **25 points** (total 100 points).  

Each pillar is divided into three sections:
- **Basic** – Foundational quality
- **Intermediate** – Demonstrated capability  
- **Advanced** – Sophisticated maturity

The final score is the sum of the four pillars.

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

Assesses external validation, metadata richness, and specialized analysis of the Agent.

### Basic Section (10 points)
- Metadata richness and completeness: **8 points**
- Existence of external audits or protocol activity: **2 points**

### Intermediate Section (9 points)
- Wallet transaction quality (intermediate level): **3 points**
- Basic external audits (at least one with acceptable score): **3 points**
- Protocol activity at intermediate level: **3 points**

### Advanced Section (6 points)
- Advanced external audits (multiple with high scores): **3 points**
- Advanced wallet transaction quality: **1 point**
- Identity analysis and specialized evaluations: **1 point**
- Advanced protocol activity with high quality: **1 point**

**Global Adjustments (applied to total pillar score)**
- Duplication analysis: **±2.0 points**
- Spam / warning penalty: **-1.5 points**

---

## Pillar 4 – Usage (25 points)

Analyzes the Agent’s real on-chain activity and engagement level.

### Basic Section (10 points)
- Natural recent activity (wallet or on-chain): **10 points**

### Intermediate Section (9 points)
- Intermediate wallet activity volume: **3 points**
- Intermediate on-chain activity quality: **5 points**
- Presence of valid comments: **1 point**

### Advanced Section (6 points)
- Advanced wallet activity (recent high volume): **1.5 points**
- Advanced on-chain activity with high quality: **3.0 points**
- Protocol activity with payments: **1.5 points**

**Global Adjustments (applied to total pillar score)**
- Revocation / warning penalty: **-1.5 points**

---

**Final HUMI Score** = Pillar History (25) + Pillar Information (25) + Pillar Measure (25) + Pillar Usage (25)
