# Eight months of ERC-8004 on mainnet

ERC-8004 shipped three registries: Identity, Reputation, and Validation. Eight months after the first mainnet identities, two of those are live. The third is not.

What *is* live does not look like one ecosystem. Count agents and you are mostly looking at BNB. Count who is writing reputation and you are mostly looking at Base. Fold those into a single “how is ERC-8004 doing?” number and the split disappears.

This is a map of the two registries that exist in production. It is not a ranking of agents. It is not an argument that more identities mean a healthier market.

## Two registries, not three

On 19 August 2026:

| Measure | Count |
|---------|------:|
| Agents (Identity NFTs) | 410,793 |
| Distinct owners | 280,492 |
| Live (non-revoked) feedbacks | 533,710 |
| Agents with at least one live feedback | 46,406 (11.3%) |

That is about **1.46** agents per owner. The ten largest owners hold **49,489** of them (**12.0%**). One owner holds **13,419**.

There are more than half a million live feedbacks. Almost nine in ten agents have none.

Validation is in the spec. It is not a mainnet contract. There is no production series to report.

## How it grew

The path from January to mid-August is not a straight line.

| Month (UTC) | New agents | Live feedbacks that month |
|-------------|----------:|--------------------------:|
| January 2026 | 22,695 | 504 |
| February | 38,477 | 29,643 |
| March | 74,806 | 80,101 |
| April | 35,725 | 63,120 |
| May | 56,206 | 40,832 |
| June | 39,289 | **186,389** |
| July | **112,688** | 103,233 |
| August (through the 19th) | 30,907 | 29,888 |

Identity peaked in July: that month minted **27.4%** of every agent in this index. Reputation peaked in June. The July mint did not come with a matching wave of feedback.

The geography of minting moved too. January was **100% Ethereum L1** (22,695 agents). February was led by Base (21,641; 56% of the month), then BNB and Ethereum. From March, BNB is where most new identities appear (March 47,549 / 63.6% of the month; July **90,803 / 80.6%**). August so far is slower — about 1.6k agents a day against ~3.6k in July — but August is not a full month, so that is not a forecast.

## Where identities live is not where reputation is written

| Chain | Agents | % of stock | Live feedbacks | % of feedbacks | Agents with ≥1 feedback | % of that chain |
|-------|------:|----------:|---------------:|---------------:|------------------------:|----------------:|
| BNB Chain | 269,734 | **65.7** | 29,507 | 5.5 | 4,336 | **1.6** |
| Base | 63,927 | **15.6** | 454,438 | **85.2** | 29,665 | **46.4** |
| Ethereum L1 | 50,251 | **12.2** | 3,211 | 0.6 | 1,665 | **3.3** |
| X Layer | 11,038 | 2.7 | 17,104 | 3.2 | 1,284 | 11.6 |
| Celo | 9,776 | 2.4 | 24,744 | 4.6 | 7,135 | **73.0** |
| Gnosis | 4,113 | 1.0 | 4,341 | 0.8 | 2,081 | 50.6 |
| Arbitrum | 1,335 | 0.3 | 122 | ~0 | 85 | 6.4 |
| Polygon | 619 | 0.2 | 243 | ~0 | 155 | 25.0 |
| **Total** | **410,793** | 100 | **533,710** | 100 | **46,406** | **11.3** |

Count agents and you describe **BNB**. Count live feedback and you describe **Base**. Ethereum L1 is a real third place for identity and barely shows up in reputation. Celo looks heavily used (73% of its agents have at least one live feedback) because the population is small.

The last 30 days (20 July → 19 August) make the split sharper:

- **76,893** new agents: BNB **70.5%**, Ethereum L1 **17.7%**, Base **5.9%**, X Layer **5.6%**.
- **64,225** live feedbacks: Base **82.4%**, X Layer **17.2%**. **BNB: 0. Ethereum L1: 18.**

BNB added tens of thousands of identities in that window — **54,200** of them — and no new Reputation events.

## What else is in the set

**149,339** agents (**36.4%**) share the same name, description, and URI with at least one other agent, across **4,025** clusters. The largest cluster is **115,168** agents — **28.0%** of the whole set. That is what templates and factories look like. It is not, by itself, a Sybil proof.

Ethereum L1 is still minting. It is about 12% of the set and about 18% of the last 30 days of new identities, but only about 3% of agents there have any live feedback. A large share of those L1 records also look like test or placeholder metadata (about **60%** on Ethereum L1; across the whole index, roughly **14%** test and **8%** dummy). That is a reading of metadata, not a verdict on the chain.

About one in three agents declare a service endpoint (**138,683 / 410,793 = 33.8%**). A filled field is not evidence that the endpoint answers.

Reputation tags are used. They are mostly product names. In a prior snapshot, tags were filled on about 97% of feedbacks; miner-vouch / botcoin accounted for about 56.5% of tagged mass; method-strength vocabulary was about 0.02%. Tags do not stand in for the Validation registry.

## What to take from this

Eight months in, ERC-8004 is an identity standard that scaled, joined to a reputation layer that did not follow it, and still missing the validation layer that was never deployed on mainnet.

That is the central fact.

### Different realities

The standard runs on different realities at once. BNB holds two-thirds of identities and almost none of the recent feedback. Base holds about one-sixth of identities and 85% of live feedback. Count agents and you are talking about BNB. Count reputation and you are talking about Base. Those are important nuances in a decentralized environment. They disappear when you fold agent totals and feedback totals into one headline — and they hide a split that anyone building in this ecosystem should notice.

### Minting an agent vs an agent economy

July created more than a quarter of every identity in this index, mostly on BNB. That did not come with a matching rise in feedback. Feedback had already peaked in a different month: June. In the following 30 days, BNB added 54,200 identities and zero new reputation events. A registration wave can be factories, airdrops, templates, or experiments. It is not, by itself, evidence that agents are discovering, hiring, or trusting each other.

### The diversity problem

410,793 identities sound like a large population. A closer look shows uncomfortable patterns. One metadata template is 28% of the set. 36% of agents share a complete name–description–URI triple. Ten owners hold 12% of the stock. The registry is in use — and it is also concentrated. Anyone using “number of agents” as a proxy for unique actors is reading the shallowest layer of the ecosystem, not the most informative one.

### Where is the trust?

At first glance, more than half a million reputation records suggest the standard is already doing the job. One layer down, the numbers tell a different story:

1. Only 11.3% of agents have any live feedback.
2. Only 33.8% even declare an endpoint.
3. On the chain with the most identities, 1.6% of agents have been reviewed at all.

That is normal for a standard this young. It is also a warning sign for the next few months: ERC-8004 still has a long road if the goal is a shared reputation record for agents that interact with each other.

### Newer chains

Recent months brought chains with a different profile. Celo has feedback on 73% of its agents; Gnosis, on about half. Those rates are high because the populations are small. That raises a question that may shape where this goes: are those percentages about size, or about tighter communities with more traction and better mentorship among participants? Do they point toward a more niche, chain-by-chain distribution of agents? Only time will tell. What the data show today is that coverage and reputation can move in opposite directions.

### Ethereum in no man’s land

The ecosystem started on Ethereum in January. By late summer it is a minority mint surface, with almost no feedback and a heavy share of test-like metadata. If Ethereum was meant to be the quality reference for ERC-8004 agents, that is not what the index shows.

### Where is validation?

The standard promised a third registry for third-party checks. Until that contract is on mainnet, “the ERC-8004 ecosystem” is identity plus whatever reputation a few chains bother to write. Product names in reputation tags do not close that gap. Without a centralized registry, each project where agents interact is building its own validation layer. That is not necessarily bad — but it confirms what ERC-8004 was meant to add: a shared record of the full agent interaction stack. That part is still missing.

### Conclusion

The first eight months produced a large, cheap-to-mint identity layer, a reputation layer geographically and temporally detached from that mint, and no production validation. The standard is real, and many projects already treat it as a starting point. The next question is not whether another 100,000 identities get minted. It is whether Reputation starts to follow new mints — especially on BNB — and whether Validation ever becomes a mainnet series.

## What this does not show

- That BNB is “the” ERC-8004 ecosystem, or that Base is “more real.” It shows two different activity surfaces on the same standard.
- That July was adoption. It was a mint spike.
- That 36% of agents are fake. Templates, clones, and factories share metadata.
- That feedback is honest, human, or useful. Volume can be automated.
- Anything about Validation. The contract is not on mainnet.
- Every ERC-8004 deploy — only the eight mainnets in this index.
- A full August. Do not annualize a partial month.

## How these numbers were cut

January 2026 through 19 August 2026, mainnet only, on eight EVM chains: Ethereum L1, Base, Polygon, BNB Chain, Arbitrum, Celo, Gnosis, and X Layer. Testnets are out. So is Validation. Other ERC-8004 deploys this index does not cover (Avalanche, Scroll, Linea in third-party explorers, for example) are also out. “Created” means the identity was minted, not that the agent did useful work.

Counts are Identity NFTs and non-revoked Reputation feedbacks. Snapshot: 19 August 2026. Related reads, not republished here: metadata duplicates; agents by chain; feedback tags; declared service endpoints.

This is a reading of the ERC-8004 mainnet registries, not a product scorecard.
