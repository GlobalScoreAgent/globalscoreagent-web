# Índice HUMI – Especificación Técnica

**Versión 1.1**  
**Fecha:** 17 de julio de 2026  
**Tipo de Índice:** Puntaje de Reputación de Agente (0–100)

---

## Visión General

El **Índice HUMI** (Human-like Metrics Index) es un puntaje compuesto de reputación que va de **0 a 100** y evalúa la calidad general, legitimidad, madurez e inteligencia real de cualquier Agente en el ecosistema ERC-8004.

Se construye a partir de **cuatro pilares independientes**, cada uno diseñado con un máximo nominal de **25 puntos** (total 100 puntos).

Cada pilar se divide en tres secciones:
- **Básica** – Calidad fundamental
- **Intermedia** – Capacidad demostrada
- **Avanzada** – Madurez sofisticada

El puntaje final es la suma de los cuatro pilares.

---

## Análisis multichain de wallets transaccionales

Measure y Usage ya no tratan la actividad de wallet como una señal de una sola wallet o una sola chain. La actividad transaccional se consolida a través de **todas las wallets transaccionales válidas** asociadas al agente y de **todas las chains** donde esas wallets tienen actividad indexada.

El cálculo separa dos capas:

1. **Volumen de actividad** — nonce agregado y deltas de nonce a 7, 15 y 30 días.
2. **Calidad multichain** — actividad y balances significativos, pesos de calidad de chain, presencia en chains valiosas, presencia en chains de alto valor, dispersión superficial entre chains y concentración en la chain primaria.

### Agregación de volumen

`erc_8004.agent_summary_tx` agrupa los resúmenes de wallets transaccionales por agente. Su nonce es por tanto la suma a través de las wallets y chains del agente, no el nonce de una wallet seleccionada.

`erc_8004.agent_summary_general` expone:

- `nonce`
- `nonce_delta_7_days`
- `nonce_delta_15_days`
- `nonce_delta_30_days`
- `transactional_wallet_count`
- los campos de calidad multichain listados abajo

### Agregación de calidad multichain

`erc_8004.agent_multichain_stats` primero construye un registro por agente y chain a partir de asociaciones de wallets transaccionales válidas y no eliminadas. Luego agrega esos registros de chain por agente.

Las señales principales son:

- `active_chains_count`: chains con un balance actual significativo
- `chains_with_meaningful_activity_30d`: chains con actividad significativa a 30 días
- `weighted_multichain_balance_score`: suma de pesos de chain para balances significativos
- `weighted_multichain_activity_score`: suma de pesos de chain para actividad significativa
- `valuable_chains_count`: chains que combinan actividad significativa y peso de chain suficiente
- `has_high_value_chain_presence`: presencia en una chain de alto peso con balance o actividad significativa
- `shallow_multichain_spread`: actividad repartida en varias chains sin profundidad significativa
- `usage_concentration_ratio`: nonce de la chain primaria dividido por el nonce total del agente

### Umbrales de calidad por defecto

Los valores son configurables mediante `gsa.parameters`. Los defaults actuales son:

- Balance significativo: `>= 0.1`
- Actividad significativa a 30 días: `nonce_delta_30d >= 30`
- Actividad de chain valiosa: `nonce_delta_30d >= 30`
- Peso mínimo de chain para una chain valiosa: `>= 0.6`
- Peso de chain de alto valor: `>= 0.8`
- Dispersión superficial: al menos 4 chains superficiales
- Delta máximo a 30 días de una chain superficial: `<= 5`
- Peso de chain por defecto cuando está ausente: `0.30`

Simplemente aparecer en más chains **no** otorga más puntos. La presencia en chain debe tener profundidad y calidad significativas.

---

## Pilar 1 – Historia (25 puntos)

Evalúa la estabilidad de la propiedad y la reputación histórica del Agente.

### Sección Básica (10 puntos)
- Fortaleza y actividad de la wallet del owner: **5 puntos**
- Estabilidad de la propiedad a lo largo del tiempo (pocos o ningún cambio): **5 puntos**

### Sección Intermedia (9 puntos)
- Antigüedad y longevidad avanzada de la wallet del owner: **3 puntos**
- Calidad y nivel de actividad del portafolio general de Agentes del owner: **3 puntos**
- Presencia mínima de auditorías externas en el portafolio del owner: **1.5 puntos**
- Baja tasa de advertencias en el portafolio del owner: **1.5 puntos**

### Sección Avanzada (6 puntos)
- Alta calidad de metadatos y verificación de servicios en todo el portafolio: **1.5 puntos**
- Auditorías externas completas en todos los Agentes del portafolio: **2.0 puntos**
- Actividad general sostenida y participación en protocolos en todo el portafolio: **2.5 puntos**

---

## Pilar 2 – Información (25 puntos)

Mide la riqueza, profesionalismo y completitud de la identidad pública y los metadatos técnicos del Agente.

### Sección Básica (10 puntos)
- Calidad y claridad del nombre, descripción e imagen: **7.5 puntos**
- Presencia de fuentes de información básicas (on-chain + URI): **2.5 puntos**

### Sección Intermedia (9 puntos)
- Diversidad y profundidad de fuentes de información externas: **3.0 puntos**
- Disponibilidad de métodos de contacto web o email: **1.0 puntos**
- Presencia de endpoints programáticos/API: **1.5 puntos**
- Mecanismos de confianza soportados: **1.0 puntos**
- Métodos de verificación: **1.0 puntos**
- Metadatos técnicos básicos (skills, capabilities, domains): **1.5 puntos**

### Sección Avanzada (6 puntos)
- Endpoints MCP: **2.0 puntos**
- Endpoints A2A: **2.0 puntos**
- Configuración técnica avanzada (technology stack, pagos, tools, capabilities): **2.0 puntos**

---

## Pilar 3 – Measure (25 puntos)

Measure evalúa si un agente está representado de forma creíble, validado externamente y presente de forma operativa. La revisión multichain reduce el peso directo del volumen crudo de wallet y añade una dimensión de calidad de presencia.

### Sección Básica (máximo nominal 10)

#### Metadata Richness: 0 a 4

```text
(metadata_richness_score / 100) × 4
```

#### Basic Existence: 0 o 6

Se otorgan 6 puntos cuando el agente tiene al menos uno de:

- nonce agregado positivo
- una atestación válida
- una ejecución on-chain válida
- un feedback on-chain válido

En caso contrario se otorgan 0.

### Sección Intermedia (máximo nominal 9)

#### Wallet Transaction Quality: 0 a 1

Usa el `nonce_delta_30_days` agregado:

- `>= 900`: 1.0
- `>= 450`: 0.5
- `>= 120`: 0.25
- en otro caso: 0

#### External Audit: 0 a 3

Requiere al menos una auditoría válida:

- puntaje promedio `>= 70`: 3.0
- puntaje promedio `>= 50`: 2.0
- promedio no negativo menor: 1.0
- sin auditorías válidas: 0

#### Protocol Activity: 0 a 2.5

Aplica a 1–7 actividades de protocolo válidas:

- puntaje promedio `>= 60`: 2.5
- puntaje promedio `>= 40`: 1.5
- promedio no negativo menor: 0.75
- fuera de la condición de volumen intermedio: 0

#### Calidad de Presencia Multichain: −1 a +2.5

Orden de evaluación:

1. Presencia en chain de alto valor y `weighted_multichain_activity_score >= 1.5`: **+2.5**
2. Presencia en chain de alto valor: **+1.5**
3. Dispersión multichain superficial: **−1.0**
4. Al menos 3 chains activas pero actividad ponderada `< 1.0`: **−0.5**
5. Sin señal significativa: **0**

Esta dimensión recompensa la presencia significativa en chains valiosas e impide que un gran número de registros de baja calidad se interprete como madurez.

### Sección Avanzada (máximo 6)

#### Advanced External Audit: 0 a 3

Requiere al menos dos auditorías válidas:

- puntaje promedio `>= 90`: 3.0
- `>= 80`: 2.5
- `>= 70`: 2.0
- `>= 60`: 1.0
- en otro caso: 0

#### Identity Analysis: 0 a 2

```text
min(2, identity_score / 50)
```

#### Advanced Protocol Activity: 0 a 1

Aplica a al menos 10 actividades de protocolo válidas:

- puntaje promedio `>= 90`: 1.0
- `>= 80`: 0.75
- `>= 70`: 0.5
- en otro caso: 0

### Penalización y total de Measure

La penalización es la suma de `score_impact` de las advertencias del agente.

El total actual es:

```text
max(basic + intermediate + advanced + warning_penalty, 0)
```

Measure tiene un máximo teórico de 25 bajo los umbrales actuales. No existe una asignación separada de análisis de duplicación.

---

## Pilar 4 – Usage (25 puntos)

Usage evalúa la adopción operativa reciente. Combina volumen agregado de wallets, canales on-chain recientes, actividad de protocolo con pagos y si la actividad se distribuye de forma significativa a través de chains valiosas.

Usage está diseñado como un **pilar de 25 puntos**. Los puntajes de componentes siguientes describen exactamente la implementación actual.

### Sección Básica (máximo nominal 10)

#### Basic General Activity: 0 o 10

- Agente con menos de 30 días: un nonce agregado positivo otorga 10.
- Agente más antiguo: un delta de nonce a 30 días positivo o al menos dos tipos activos de actividad on-chain otorgan 10.
- En otro caso: 0.

Los tipos on-chain considerados son atestaciones, ejecuciones, feedbacks y actividad de protocolo.

### Sección Intermedia

#### Wallet Intermediate: 0 a 2.5

Para agentes con menos de 15 días, se usa el nonce agregado actual. Para agentes más antiguos, se usa el delta de nonce agregado a 15 días:

- `>= 301`: 2.5
- `>= 101`: 1.5
- `>= 1`: 0.75
- en otro caso: 0

#### On-Chain Activity Intermediate: 0 a 4

Requiere al menos dos tipos activos de actividad on-chain. Calidad promedio:

- `>= 90`: 4.0
- `>= 70`: 3.2
- `>= 50`: 2.4
- `>= 30`: 2.0
- `>= 10`: 1.2
- en otro caso: 0

#### Comments: 0 o 1

Al menos un comentario reciente válido y ningún comentario revocado otorga 1.

#### Uso Valioso Multichain: −1 a +2.5

Orden de evaluación:

1. Al menos 2 chains valiosas: **+2.5**
2. Exactamente 1 chain valiosa: **+1.5**
3. Dispersión multichain superficial: **−1.0**
4. Sin señal significativa: **0**

### Sección Avanzada

#### Wallet Advanced: 0 o 1

- Día de creación: nonce agregado actual `>= 500`
- Otros días: delta de nonce agregado a 7 días `>= 500`

Cualquiera de las dos condiciones otorga 1.

#### On-Chain Activity Advanced: 0 a 2.5

Requiere al menos tres tipos activos de actividad on-chain:

- calidad promedio `>= 80`: 2.5
- `>= 70`: 1.5
- `>= 60`: 0.75
- en otro caso: 0

#### Protocol Activity with Payments: 0 o 1.5

Al menos dos actividades de protocolo válidas y al menos un pago válido otorgan 1.5.

#### Consistencia Multichain de Alto Valor: −0.5 a +1.5

Orden de evaluación:

1. Presencia en chain de alto valor y al menos 2 chains valiosas: **+1.5**
2. Presencia en chain de alto valor: **+1.0**
3. Sin presencia de alto valor y `usage_concentration_ratio > 0.90`: **−0.5**
4. Sin señal significativa: **0**

### Penalización y total de Usage

Cualquier revoke en los resúmenes recientes de comentarios, ejecuciones, feedbacks, protocolos o atestaciones aplica **−1.5**.

La función actual suma directamente:

```text
basic + intermediate + advanced + revoke_penalty
```

### Nota técnica sobre el rango de Usage

El contrato público diseña Usage como un pilar de 25 puntos. El SQL de scoring actual **no** aplica un clamp superior o inferior después de añadir las dimensiones multichain:

- máximo positivo teórico: `10 + 10 + 6.5 = 26.5`
- mínimo negativo teórico: `−1 − 0.5 − 1.5 = −3`

`agent_index_humi_calculate` también suma los cuatro puntajes de pilar almacenados sin un clamp de 100 puntos. Las sumas crudas de componentes pueden por tanto exceder el rango nominal hasta que la implementación de scoring introduzca normalización o un hard cap. Esto es una preocupación del motor de scoring, no un cambio del diseño público de 25 puntos.

---

**Puntaje Final HUMI** = Pilar History (25) + Pilar Information (25) + Pilar Measure (25) + Pilar Usage (25)
