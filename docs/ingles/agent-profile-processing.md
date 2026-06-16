# Agent Profile Processing

**Agent Profile Processing** is the mechanism used by Global Score Agent to keep each agent’s information up to date and reliable.

As the number and complexity of agents grow, it is common for their metadata to come from different sources (on-chain data, user feedback, external systems, etc.). These sources may contain conflicting, outdated, or incomplete information.

This process automatically resolves that issue, ensuring that users always see the **most reliable and up-to-date** information for each agent.

## The Problem It Solves

When an agent has information registered in multiple places, several issues can arise:

- One source may have a more updated name or description than another.
- There may be conflicting data between different origins.
- Some sources may be more trustworthy than others.

Without a clear system, users could see inconsistent or unreliable information. Agent Profile Processing prevents this by establishing clear rules about which information should be displayed.

## Metadata Sources for an Agent

Agents can receive metadata from different origins. Each source has a different priority level. Below are the main sources considered by the system:

| Source                    | Description                                                              | Origin Type | Priority Level |
|---------------------------|--------------------------------------------------------------------------|-------------|----------------|
| `feedback_did`            | DID Document registered through the feedback system                      | Feedback    | High           |
| `feedback`                | General agent data submitted via feedback                                | Feedback    | High           |
| `feedback_railway`        | Information processed and enriched by the Railway system                 | Feedback    | Medium-High    |
| `feedback_invariant`      | Data considered invariant (rarely changing) for the agent                | Feedback    | Medium         |
| `feedback_claw`           | Data coming from the Claw infrastructure                                 | Feedback    | Medium         |
| `agent_uri_did`           | On-chain URI containing a signed DID document                            | On-chain    | Medium-Low     |
| `agent_uri`               | Raw metadata obtained directly from the on-chain registered URI          | On-chain    | Low            |

The system assigns a **priority level** to each source. Sources with higher priority (lower numbers) are preferred when consolidating the agent’s information.

## How It Works (Simplified)

The process follows these steps for each agent:

1. **Identifies all available sources** for an agent.
2. **Sorts the sources by priority**: Higher priority sources are preferred.
3. **Selects the best information**: For each field (name, description, image, services, technologies, etc.), the system chooses the value from the highest priority source that has valid data.
4. **Generates a consolidated profile**: Creates a single, authoritative version of the agent.
5. **Keeps metadata updated**: This process runs periodically to incorporate new data from any of the sources.

## Benefits for the Platform and Users

- **Higher reliability**: Users always see the most authoritative information available.
- **Fresher data**: The system automatically incorporates new information without manual intervention.
- **Consistency**: All agents follow the same consolidation process.
- **Scalability**: New metadata sources can be easily added in the future.
- **Better user experience**: Agents appear with more complete, professional, and trustworthy profiles.

## Difference with Metadata Richness

This process **does not calculate** the Metadata Richness Score.

Agent Profile Processing focuses on **consolidating and prioritizing** information. The calculation of how complete and professional an agent’s metadata is performed in a separate process, documented in [Metadata Richness Analysis](./agent-metadata-richness-analysis.md).

---

*Technical Document - June 2026*
