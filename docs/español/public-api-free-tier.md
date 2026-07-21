# Global Score Agent - Public API (Free Tier)

**Versión:** 1.3  
**Fecha:** Junio 2026  
**Tipo:** Documentación Técnica y de Negocio  
**Público objetivo:** Humanos y Agentes Autónomos

---

## 1. Introducción

El **Free Tier** de la API pública de Global Score Agent permite el acceso sin autenticación a información básica de agentes ERC-8004. Está diseñado para facilitar el descubrimiento y la evaluación rápida de agentes por parte de humanos y agentes autónomos.

### Endpoints disponibles

| Endpoint                        | Método | Propósito                                      | Nivel de detalle          |
|--------------------------------|--------|------------------------------------------------|---------------------------|
| `/v1/agents/search`            | GET    | Búsqueda y listado de agentes                  | Básico                    |
| `/v1/agents/maturity`          | GET    | Nivel de madurez (HUMI + WAMI) + descripciones | Básico + Descriptivo      |

---

## 2. Endpoint: Búsqueda de Agentes

### 2.1 Descripción
Permite buscar agentes utilizando diferentes criterios de filtrado. Es el endpoint principal para descubrimiento de agentes.

### 2.2 Endpoint

```http
GET https://api.globalscoreagent.com/v1/agents/search
```

### 2.3 Parámetros de consulta

| Parámetro               | Tipo     | Descripción                              | Obligatorio | Default | Ejemplo                  |
|-------------------------|----------|------------------------------------------|-------------|---------|--------------------------|
| `name`                  | string   | Búsqueda parcial por nombre              | No          | -       | `clawdbot`               |
| `chain_name`            | string   | Filtrar por nombre de blockchain         | No          | -       | `base`                   |
| `owner_wallet`          | string   | Filtrar por wallet del owner             | No          | -       | `0x327c77e9d6e277a3...`  |
| `wallet_chain_register` | string   | Filtrar por wallet de registro           | No          | -       | `0x19716a8df497b8e9...`  |
| `limit`                 | integer  | Cantidad de resultados (máx. 100)        | No          | 20      | `10`                     |
| `page`                  | integer  | Número de página                         | No          | 1       | `2`                      |

### 2.4 Ejemplos de uso con cURL

```bash
# Búsqueda básica por nombre
curl -X GET "https://api.globalscoreagent.com/v1/agents/search?name=clawdbot&limit=5" \
  -H "Accept: application/json"

# Filtrado por cadena
curl -X GET "https://api.globalscoreagent.com/v1/agents/search?chain_name=base&limit=10" \
  -H "Accept: application/json"

# Búsqueda combinada
curl -X GET "https://api.globalscoreagent.com/v1/agents/search?name=bot&chain_name=base&limit=5" \
  -H "Accept: application/json"
```

### 2.5 Respuesta exitosa (200)

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
- **20 requests por minuto** por dirección IP.

---

## 3. Endpoint: Nivel de Madurez del Agente

### 3.1 Descripción
Devuelve el nivel de madurez de un agente según los índices **HUMI** y **WAMI**, junto con descripciones contextuales según el idioma solicitado.

### 3.2 Endpoint

```http
GET https://api.globalscoreagent.com/v1/agents/maturity
```

### 3.3 Parámetros de consulta

| Parámetro        | Tipo     | Descripción                                      | Obligatorio | Default | Ejemplo      |
|------------------|----------|--------------------------------------------------|-------------|---------|--------------|
| `canonical_slug` | string   | Identificador único del agente                   | Sí          | -       | `base-32333` |
| `lang`           | string   | Idioma de las descripciones (`eng` o `esp`)      | No          | `eng`   | `esp`        |

### 3.4 Ejemplos de uso con cURL

**En inglés (por defecto):**

```bash
curl -X GET "https://api.globalscoreagent.com/v1/agents/maturity?canonical_slug=base-32333" \
  -H "Accept: application/json"
```

**En español:**

```bash
curl -X GET "https://api.globalscoreagent.com/v1/agents/maturity?canonical_slug=base-32333&lang=esp" \
  -H "Accept: application/json"
```

### 3.5 Respuesta exitosa (200)

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
- **20 requests por minuto** por dirección IP.

---

## 4. Buenas Prácticas de Uso

Esta sección está pensada para que tanto **humanos** como **agentes autónomos** puedan usar los endpoints de forma eficiente y responsable.

### 4.1 Recomendaciones Generales

- **Usa paginación**: Siempre especifica `limit` y `page`. El máximo permitido es 100 resultados por página.
- **Respeta el Rate Limit**: El límite es de **20 requests por minuto por IP**. Si lo superas recibirás un error `429`.
- **Usa `canonical_slug` como identificador principal**: Es el campo más estable y recomendado.
- **Combina ambos endpoints**:
  1. Usa `/v1/agents/search` para encontrar agentes.
  2. Usa `/v1/agents/maturity` para verificar rápidamente el nivel de reputación.
- **Maneja errores correctamente**: Verifica siempre el campo `success` y maneja los códigos de error.
- **Usa el parámetro `lang`**: Agrega `lang=esp` cuando necesites las descripciones en español.

### 4.2 Recomendaciones para Agentes Autónomos

- **Evalúa antes de interactuar**: Usa el endpoint de madurez para verificar el nivel de riesgo antes de realizar transacciones o compartir información.
- **Cachea respuestas**: Los niveles de madurez no cambian frecuentemente. Considera guardar en caché la respuesta de madurez por varias horas.
- **No hagas polling agresivo**: Evita hacer muchas peticiones seguidas al mismo agente.
- **Usa filtros específicos**: Combina `name` + `chain_name` para obtener resultados más precisos.

### 4.3 Ejemplo de Flujo Recomendado para un Agente

```text
1. Buscar agentes relevantes
   GET /v1/agents/search?name=trading&chain_name=base&limit=10

2. Para cada agente encontrado, verificar madurez
   GET /v1/agents/maturity?canonical_slug=base-XXXXX&lang=eng

3. Tomar decisión basada en maturity_level y risk
   - Very Stable / Elite → Proceder con confianza
   - Stable → Proceder con precaución
   - Developing / Unstable → Evitar o requerir más validación
```

### 4.4 Ejemplo de Manejo de Errores (Python)

```python
import requests
import time

url = "https://api.globalscoreagent.com/v1/agents/search?name=clawdbot&limit=5"

try:
    response = requests.get(url)
    
    if response.status_code == 429:
        print("Rate limit alcanzado. Esperando...")
        time.sleep(60)
    elif response.status_code == 200:
        data = response.json()
        if data.get("success"):
            print("Agentes encontrados:", len(data["data"]))
except Exception as e:
    print("Error:", e)
```

---

## 5. Códigos de Error

| Código HTTP | Error                        | Descripción                              | Causa común                          |
|-------------|------------------------------|------------------------------------------|--------------------------------------|
| `400`       | Bad Request                  | Parámetros inválidos o faltantes         | Falta `canonical_slug`               |
| `404`       | Not Found                    | Agente no encontrado                     | `canonical_slug` incorrecto          |
| `429`       | Too Many Requests            | Límite de tasa excedido                  | Más de 20 requests/min por IP        |
| `500`       | Internal Server Error        | Error interno del servidor               | Problema temporal                    |

### Ejemplo de respuesta de error

```json
{
  "success": false,
  "error": "canonical_slug is required"
}
```

---

## 6. Consideraciones Técnicas

| Aspecto                    | Detalle                                              |
|---------------------------|------------------------------------------------------|
| **Autenticación**         | No requerida (público)                               |
| **Rate Limiting**         | 20 requests por minuto por IP                        |
| **Formato de respuesta**  | JSON                                                 |
| **Idioma por defecto**    | `eng`                                                | 

---

## 7. Consideraciones de Negocio

| Aspecto                    | Detalle                                              |
|---------------------------|------------------------------------------------------|
| **Objetivo**              | Facilitar descubrimiento y evaluación rápida         |
| **Público objetivo**      | Agentes autónomos, developers, explorers             |
| **Estrategia**            | Freemium                                             |
| **Próximos endpoints**    | API de pago con créditos (Básico / Análisis / GSA Index). Demo HUMI live: `GET /v1/agents/humi` (Bearer; ver `public-api-humi-demo.md`) |

---

## 8. Infraestructura

El host `api.globalscoreagent.com` lo sirve el Worker **`gsa-api-router`**, versionado y desplegado desde el repo **[GlobalScoreAgent/public-api](https://github.com/GlobalScoreAgent/public-api)** (Cloudflare Workers Builds). Este monorepo no contiene el código del Worker (solo un puntero en `docs/cloudflare/README.md`).

---

**Documento generado para uso público.**  
Cualquier persona o agente autónomo puede consultar esta documentación para integrar los endpoints del Free Tier de Global Score Agent.
