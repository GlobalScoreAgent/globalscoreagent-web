# Agent Realness Analysis: Business Guide

## Overview

**Agent Realness** is a foundational quality assessment performed on every agent in the ERC-8004 ecosystem.  

It evaluates whether an agent presents itself as a **legitimate, well-defined, and professional entity** rather than a placeholder, test, or low-effort creation. 

This analysis serves as the **primary gatekeeper** for deeper evaluation processes across the platform.

---

## Why Realness Analysis Matters

In a growing ecosystem of autonomous agents, maintaining high standards of authenticity is essential. The Realness Analysis:

- Protects users from interacting with fake, incomplete, or low-effort agents.
- Acts as the **entry requirement** before investing computational resources in more advanced evaluations.
- Builds confidence across the ecosystem by ensuring agents have proper identity.
- Helps high-quality agents stand out with better visibility and adoption.
- Contributes significantly to the **Index Humi** (overall reputation score), especially in the Measure pillar.

---

## Strategic Role in the Platform

A key business rule in our platform is:

> **Only agents that achieve "valid" Realness status** unlock the full set of deeper analyses.

This includes:
- Detailed wallet transaction analysis (WAMI)
- Owner portfolio and history evaluation
- Advanced activity and usage patterns
- Full protocol integration and behavior assessment

**Why this approach?**

- If an agent does not appear legitimate at a basic level (poor name, weak description, no proper identity), we avoid wasting resources on expensive deeper evaluations.
- This makes the system more efficient and scalable.
- However, we **still calculate** an Index Humi score for all agents — non-valid agents simply receive a **much heavier penalty**, resulting in significantly lower visibility and ranking.

This smart gating mechanism ensures high-quality agents receive full attention while low-effort ones are naturally deprioritized.

---

## How Realness is Evaluated

The system calculates a score from **0 to 100 points** across four core dimensions:

### 1. Name Quality (Maximum 30 points)

The name is the primary identity of an agent. The system performs a detailed evaluation:

- **Presence and Length**: Must have at least 3 meaningful characters.
- **Placeholder Detection**: Penalizes "Unnamed Agent", empty names, or generic placeholders.
- **Suspicious Patterns**: Strongly penalizes test/demo prefixes (`test-`, `demo-`, `example-`, etc.) and words like `dummy`, `fake`, `spam`, or `placeholder`.
- **Contextual Evaluation**: Some "test" names may receive partial credit if used legitimately (e.g., "AI Testing Tool"), but generic ones are downgraded.
- **Uniqueness**: Bonus points for names that are not duplicated across other agents.

**Business Value**: A clear, professional name creates immediate trust and improves discoverability.

### 2. Description Quality (Maximum 25 points)

The description explains the agent’s purpose and capabilities:

- **Length**: Very short descriptions (< 10 characters) get zero points. At least 40 characters are required for a base score.
- **Depth**: Descriptions of 80+ characters receive bonus points.
- **Repetitive Content**: Heavy penalty if the description excessively repeats the agent’s name or shows spam-like patterns.
- **Uniqueness**: Additional penalty if the description is duplicated with other agents.

**Business Value**: A well-written description helps users quickly understand the agent’s value and use cases.

### 3. External Authoritative Profile (Maximum 30 points)

Checks for trusted external sources (official URIs, DID profiles, etc.) that confirm the agent’s information.

**Business Value**: External validation proves the agent exists beyond our platform.

### 4. Image + Active Registration (Maximum 15 points)

- Validates a proper, non-placeholder image.
- Confirms the agent has an active on-chain registration.

**Business Value**: Visual identity and confirmed presence reinforce legitimacy.

---

## Final Realness Statuses & Thresholds

| Status                | Score Range     | Business Meaning |
|-----------------------|-----------------|------------------|
| **valid**             | 80 – 100        | High-quality agent. Unlocks full platform analysis and better positioning. |
| **insufficient_info** | 55 – 79         | Basic but incomplete. Limited visibility and no deep analysis. |
| **dummy**             | Below 55 (with suspicious patterns) | Likely test or spam agent. Strong penalties applied. |
| **test**              | Below 55        | Low-quality or experimental agent. |

---

## Summary

The Realness Analysis is the **first and most important filter** in our agent evaluation pipeline. By requiring a minimum standard of identity and professionalism, we ensure efficient resource use while maintaining high ecosystem quality.

Only agents that reach **"valid"** status receive the full benefit of advanced evaluations (wallet, owner, activity, etc.). All agents still receive an Index Humi score, but those failing Realness standards are heavily penalized in visibility and ranking.

---

**Document Version**: Business-Oriented (May 2026)

This guide explains the Realness evaluation from a business and platform-efficiency perspective. 

Would you like to add practical tips for creators on how to achieve "valid" Realness status?
