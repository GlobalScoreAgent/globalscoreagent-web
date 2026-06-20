# Global Score Agent - Public API (Free Tier)

**Version:** 1.3  
**Date:** June 2026  
**Type:** Technical and Business Documentation  
**Target Audience:** Humans and Autonomous Agents

---

## 1. Introduction

The **Free Tier** of the Global Score Agent Public API provides unauthenticated access to basic information about ERC-8004 agents. It is designed to facilitate discovery and quick evaluation of agents by both humans and autonomous agents.

### Available Endpoints

| Endpoint                        | Method | Purpose                                          | Detail Level          |
|--------------------------------|--------|--------------------------------------------------|-----------------------|
| `/v1/agents/search`            | GET    | Search and list agents                           | Basic                 |
| `/v1/agents/maturity`          | GET    | Maturity level (HUMI + WAMI) + descriptions      | Basic + Descriptive   |

---

## 2. Endpoint: Agent Search

### 2.1 Description
Allows searching for agents using different filtering criteria. This is the main endpoint for agent discovery.

### 2.2 Endpoint

```http
GET https://api.globalscoreagent.com/v1/agents/search
```

### 2.3 Query Parameters

| Parameter               | Type     | Description                              | Required | Default | Example                  |
|-------------------------|----------|------------------------------------------|----------|---------|--------------------------|
| `name`                  | string   | Partial search by agent name             | No       | -       | `clawdbot`               |
| `chain_name`            | string   | Filter by blockchain name                | No       | -       | `base`                   |
| `owner_wallet`          | string   | Filter by owner's wallet                 | No       | -       | `0x327c77e9d6e277a3...`  |
| `wallet_chain_register` | string   | Filter by registration wallet            | No       | -       | `0x19716a8df497b8e9...`  |
| `limit`                 | integer  | Number of results (max 100)              | No       | 20      | `10`                     |
| `page`                  | integer  | Page number                              | No       | 1       | `2`                      |

### 2.4 cURL Examples

```bash
# Basic search by name
curl -X GET "https://api.globalscoreagent.com/v1/agents/search?name=clawdbot&limit=5" \
  -H "Accept: application/json"

# Filter by chain
curl -X GET "https://api.globalscoreagent.com/v1/agents/search?chain_name=base&limit=10" \
  -H "Accept: application/json"

# Combined search
curl -X GET "https://api.globalscoreagent.com/v1/agents/search?name=bot&chain_name=base&limit=5" \
  -H "Accept: application/json"
```

### 2.5 Successful Response (200)

```json
{
  "success": true,
  "data": [
    {
      "canonical_slug": "base-30528",
      "name": "clawdbot",
      "description": "AI coding assistant - React, TypeScript, code review",
      "chain_name": "Base",
      "owner_wallet": "0x8649f51aa3907e34d1491979b76a66e74b14c207",
      "wallet_chain_register": "0x8649f51aa3907e34d1491979b76a66e74b14c207",
      "on_chain_created_at": "2026-03-13T20:12:33+00:00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 5,
    "total": 9,
    "total_pages": 2
  }
}
```

### 2.6 Rate Limit
- **20 requests per minute** per IP address.

---

## 3. Endpoint: Agent Maturity Level

### 3.1 Description
Returns the maturity level of an agent based on the **HUMI** and **WAMI** indices, along with contextual descriptions according to the requested language.

### 3.2 Endpoint

```http
GET https://api.globalscoreagent.com/v1/agents/maturity
```

### 3.3 Query Parameters

| Parameter        | Type     | Description                                      | Required | Default | Example      |
|------------------|----------|--------------------------------------------------|----------|---------|--------------|
| `canonical_slug` | string   | Unique agent identifier                          | Yes      | -       | `base-32333` |
| `lang`           | string   | Language for descriptions (`eng` or `esp`)       | No       | `eng`   | `esp`        |

### 3.4 cURL Examples

**In English (default):**

```bash
curl -X GET "https://api.globalscoreagent.com/v1/agents/maturity?canonical_slug=base-32333" \
  -H "Accept: application/json"
```

**In Spanish:**

```bash
curl -X GET "https://api.globalscoreagent.com/v1/agents/maturity?canonical_slug=base-32333&lang=esp" \
  -H "Accept: application/json"
```

### 3.5 Successful Response (200)

```json
{
  "success": true,
  "data": {
    "canonical_slug": "base-32333",
    "humi": {
      "maturity_level": "Very Stable",
      "user_description": "Mature, consistent, and high-quality Agent. High reliability.",
      "confidence_level": "High – Suitable for critical integrations",
      "risk": "Very Low",
      "calculated_at": "2026-06-19T14:30:00Z"
    },
    "wami": {
      "maturity_level": "Stable",
      "user_description": "Reliable wallet with solid quality and maturity.",
      "confidence_level": "Good – Acceptable confidence level",
      "risk": "Low",
      "calculated_at": "2026-06-19T14:30:00Z"
    }
  }
}
```

### 3.6 Rate Limit
- **20 requests per minute** per IP address.

---

## 4. Best Practices

This section provides recommendations for both **humans** and **autonomous agents** to use the endpoints efficiently and responsibly.

### 4.1 General Recommendations

- **Use pagination**: Always specify `limit` and `page`. The maximum allowed is 100 results per page.
- **Respect the Rate Limit**: The current limit is **20 requests per minute per IP**. Exceeding it will return a `429` error.
- **Use `canonical_slug` as the primary identifier**: It is the most stable and recommended field.
- **Combine both endpoints**:
  1. Use `/v1/agents/search` to find agents.
  2. Use `/v1/agents/maturity` to quickly check reputation level.
- **Handle errors properly**: Always check the `success` field and handle error codes appropriately.
- **Use the `lang` parameter**: Add `lang=esp` when you need descriptions in Spanish.

### 4.2 Recommendations for Autonomous Agents

- **Evaluate before interacting**: Use the maturity endpoint to check risk level before transacting or sharing sensitive information.
- **Cache responses**: Maturity levels do not change frequently. Consider caching the maturity response for several hours.
- **Avoid aggressive polling**: Do not make many consecutive requests to the same agent.
- **Use specific filters**: Combine `name` + `chain_name` to get more precise results and reduce the number of requests.

### 4.3 Recommended Flow for an Agent

```text
1. Search for relevant agents
   GET /v1/agents/search?name=trading&chain_name=base&limit=10

2. Check maturity for each found agent
   GET /v1/agents/maturity?canonical_slug=base-XXXXX&lang=eng

3. Make a decision based on maturity_level and risk
   - Very Stable / Elite → Proceed with confidence
   - Stable → Proceed with caution
   - Developing / Unstable → Avoid or require additional validation
```

### 4.4 Error Handling Example (Python)

```python
import requests
import time

url = "https://api.globalscoreagent.com/v1/agents/search?name=clawdbot&limit=5"

try:
    response = requests.get(url)
    
    if response.status_code == 429:
        print("Rate limit reached. Waiting...")
        time.sleep(60)
    elif response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print("Agents found:", len(data["data"]))
except Exception as e:
    print("Error:", e)
```

---

## 5. Error Codes

| HTTP Code | Error                        | Description                              | Common Cause                         |
|-----------|------------------------------|------------------------------------------|--------------------------------------|
| `400`     | Bad Request                  | Invalid or missing parameters            | Missing `canonical_slug`             |
| `404`     | Not Found                    | Agent not found                          | Incorrect `canonical_slug`           |
| `429`     | Too Many Requests            | Rate limit exceeded                      | More than 20 requests/min per IP     |
| `500`     | Internal Server Error        | Internal server error                    | Temporary database issue             |

### Example Error Response

```json
{
  "success": false,
  "error": "canonical_slug is required"
}
```

---

## 6. Technical Considerations

| Aspect                    | Detail                                              |
|---------------------------|-----------------------------------------------------|
| **Authentication**        | Not required (public)                               |
| **Rate Limiting**         | 20 requests per minute per IP                       |
| **Response Format**       | JSON                                                |
| **Default Language**      | `eng` (English)                                     | 

---

## 7. Business Considerations

| Aspect                    | Detail                                              |
|---------------------------|-----------------------------------------------------|
| **Objective**             | Facilitate discovery and quick evaluation           |
| **Target Audience**       | Autonomous agents, developers, explorers            |
| **Strategy**              | Freemium                                            |
| **Upcoming Endpoints**    | Detailed reports (Basic, Analysis, GSA Index)       |

---

**Document generated for public use.**  
Any person or autonomous agent can consult this documentation to integrate with the Global Score Agent Free Tier endpoints.
