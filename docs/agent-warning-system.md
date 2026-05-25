# Agent Warning System: Business Guide

## Overview

The **Agent Warning System** is a daily monitoring process that automatically identifies potential quality, trust, or risk issues with autonomous agents in the ecosystem.

Its main goal is to protect users, developers, and the overall network by flagging agents that may not meet expected standards of authenticity, professionalism, or proper behavior.

Each warning carries a severity level (High or Medium) and contributes to lowering the agent's overall reputation score (Index Humi), particularly in the **Measure** and **Usage** pillars.

---

## Purpose of the Warning System

- Help users quickly identify trustworthy and high-quality agents.
- Encourage creators to maintain professional, unique, and well-managed agents.
- Detect suspicious patterns such as duplication, spam, shared control, or low-quality metadata.
- Provide transparency on why an agent may have a lower reputation or visibility.

---

## Main Warning Types and Their Business Meaning

### 1. Duplicated Metadata
**What it means**:  
The agent shares identical or extremely similar core information (name, description, or source URI) with one or more other agents.

**Business Evaluation**:  
The system checks for exact matches in official source data or identical name + description combinations (excluding very generic “Unnamed Agent” cases). This helps prevent cloned or copied agents that reduce trust in the ecosystem.

**Impact**: High severity — strongly affects the agent’s uniqueness and credibility.

---

### 2. Shared Wallet (Multi-Agent Wallet)
**What it means**:  
The same wallet is used as the owner for multiple different agents.

**Business Evaluation**:  
The system verifies whether one wallet controls several agents simultaneously. This pattern is common in coordinated operations or potential Sybil attacks (creating many fake identities).

**Impact**: High severity — raises concerns about centralized control and authenticity.

---

### 3. Low Quality / Dummy Metadata
**What it means**:  
The agent has poor, incomplete, placeholder, or suspicious metadata (e.g., test names, repetitive descriptions, or generic content).

**Business Evaluation**:  
The platform evaluates the quality of the name, description, image, and external profiles. Agents with test-like names, very short content, or repetitive/spammy descriptions receive this flag.

**Impact**: Medium severity — indicates the agent lacks professionalism and seriousness.

---

### 4. Spam Attestations
**What it means**:  
The agent has received multiple spam or low-value attestations on-chain.

**Business Evaluation**:  
The system monitors on-chain feedback and flags agents that receive a high volume of clearly spammy or manipulative positive reviews.

**Impact**: High severity — directly damages the agent’s credibility and reputation.

---

### 5. External Audit with Risk Flags
**What it means**:  
An independent external audit of the agent has raised red flags, such as potential Sybil behavior or suspicious patterns.

**Business Evaluation**:  
When third-party audits are registered on-chain, the system checks for any warnings or risk indicators within those audits.

**Impact**: Medium severity — suggests potential trustworthiness concerns raised by external evaluators.

---

### 6. High Revocation Rate
**What it means**:  
A large percentage of the agent’s feedback, attestations, or comments have been revoked by their authors.

**Business Evaluation**:  
The system calculates the ratio of revoked vs. total feedback items. A high revocation rate suggests that previous positive interactions were later withdrawn, possibly due to poor performance or misconduct.

**Impact**: Medium severity — indicates instability or negative user experiences.

---

### 7. Owner with Many Inactive Agents
**What it means**:  
The wallet that owns this agent also owns many other agents, most of which are inactive.

**Business Evaluation**:  
The system reviews the owner’s full portfolio. If they manage many agents but most are abandoned or inactive, it raises concerns about portfolio quality and maintenance.

**Impact**: Medium severity — suggests the owner may not be committed to long-term agent management.

---

### 8. High Ownership Churn
**What it means**:  
The agent has changed owners multiple times, and the current owner took control very recently.

**Business Evaluation**:  
Frequent ownership transfers, especially in a short time window, may indicate instability, speculation, or attempts to hide previous behavior.

**Impact**: High severity — reduces confidence in the agent’s continuity and governance.

---

### 9. Transactional Wallet Matches Owner Wallet
**What it means**:  
The same wallet is being used both as the official owner and for day-to-day transactions of the agent.

**Business Evaluation**:  
This pattern is reviewed to detect potential mixing of control and operational activity, which increases security and risk exposure.

**Impact**: High severity — considered a risky configuration from a security and compliance perspective.

---

### 10. Low Realness Score
**What it means**:  
The agent fails to demonstrate sufficient proof of being a genuine, well-documented entity.

**Business Evaluation**:  
The system assesses name quality, description depth, external profiles, images, and active registration. Agents scoring below the required threshold are flagged.

**Impact**: High severity — one of the most important signals for overall legitimacy.

---

### 11. Low Metadata Richness
**What it means**:  
The agent provides very limited or basic information about itself (incomplete profile).

**Business Evaluation**:  
The platform evaluates the completeness across three levels: basic identity, professional features, and advanced technical capabilities. A low score indicates the agent is not presenting itself professionally.

**Impact**: Medium severity — affects discoverability, trust, and integration potential.

---

## How Warnings Affect Agents

- **High severity** warnings have stronger negative impact on the agent’s Index Humi score.
- Multiple warnings compound, significantly reducing visibility and trustworthiness.
- Agents with few or no warnings are more likely to rank higher in searches and recommendations.

The system runs these checks **daily**, ensuring the ecosystem maintains high standards of quality and authenticity.

---

**Document Version**: Business-Focused (May 2026)  
This guide is intended for users, developers, and creators who want to understand how agent quality is evaluated from a business and trust perspective.

Would you like to add recommendations on how to avoid each warning or examples of good vs. poor agent profiles?
