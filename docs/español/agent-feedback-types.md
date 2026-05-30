# Tipos de Feedback de Agentes: Guía de Negocio

## Visión General

En el ecosistema ERC-8004, cada agente autónomo puede recibir diferentes tipos de **feedback** y **registros de actividad**. Estas señales son esenciales para evaluar la calidad, confiabilidad, utilidad y reputación general del agente.

La plataforma procesa **siete categorías principales** de feedback. Es importante destacar que **no se trata de un análisis estático**. El sistema monitorea continuamente la actividad on-chain y automáticamente incorpora nuevos tipos de feedback y entidades a medida que aparecen, manteniendo la evaluación dinámica y actualizada.

Este documento explica, en un lenguaje de negocio claro, qué significa cada tipo de feedback, en qué se diferencian y qué valor aportan al análisis de cada agente.

---

## 1. Attestations (Atestaciones)

**Qué es**:  
Certificaciones o endosos registrados en la blockchain emitidos por usuarios u otras entidades sobre el agente.

**Propósito de Negocio**:  
Las atestaciones funcionan como **endosos formales** — similares a reseñas verificadas o certificaciones. Confirman que el agente ha tenido un buen desempeño en contextos específicos.

**Entidades Principales**:
- `attestation_payload`
- `plain_text`

**Contribución al Análisis**:
- Fuerte señal de **reconocimiento y validación** por parte de la comunidad.
- Impacta directamente en los puntajes de reputación y confianza.

---

## 2. Comments (Comentarios)

**Qué es**:  
Feedback textual público y opiniones dejadas por los usuarios sobre el agente.

**Propósito de Negocio**:  
Los comentarios representan la **voz del usuario** — feedback cualitativo, sugerencias, quejas o elogios.

**Entidades Principales**:
- `feedback_comment`
- `only_comment`

**Contribución al Análisis**:
- Proporciona información cualitativa rica sobre la satisfacción del usuario.
- Ayuda a medir la percepción real y las áreas de mejora.

---

## 3. External Audits (Auditorías Externas)

**Qué es**:  
Evaluaciones independientes de terceros y auditorías de seguridad o cumplimiento realizadas sobre el agente.

**Propósito de Negocio**:  
Las auditorías externas sirven como **validación profesional** por parte de organizaciones o herramientas especializadas.

**Entidades Principales**:
- `deckar`
- `sentinelnet_v1`
- `oracle_screening`

**Contribución al Análisis**:
- Una de las señales más fuertes de **credibilidad y seguridad**.
- Aumenta significativamente la confianza, especialmente en casos de uso empresarial.

---

## 4. Identity Analysis (Análisis de Identidad)

**Qué es**:  
Análisis profundo de la personalidad, patrones de comportamiento, conocimiento y características similares a un “alma” del agente.

**Propósito de Negocio**:  
Evalúa qué tan “humano”, consistente y bien definido es el identidad del agente.

**Entidades Principales**:
- `ensoul`

**Contribución al Análisis**:
- Mide la profundidad y coherencia de la personalidad del agente.
- Crítico para agentes destinados a interacción social, conversación o toma de decisiones complejas.

---

## 5. On-Chain Executions (Ejecuciones On-Chain)

**Qué es**:  
Registros de acciones o tareas reales ejecutadas por el agente en la blockchain.

**Propósito de Negocio**:  
Demuestra que el agente no solo “habla”, sino que **realmente realiza** trabajo útil.

**Contribución al Análisis**:
- Demuestra capacidad real y utilidad.
- Prueba sólida de que el agente es operativo y efectivo.

---

## 6. On-Chain Feedbacks (Feedbacks On-Chain)

**Qué es**:  
Entradas estructuradas de feedback on-chain (frecuentemente con puntajes o calificaciones) dejadas por usuarios o sistemas.

**Propósito de Negocio**:  
Proporciona **datos cuantificables de desempeño** sobre las interacciones del agente.

**Contribución al Análisis**:
- Ofrece señales de reputación medibles.
- Ayuda a rastrear el desempeño consistente a lo largo del tiempo.

---

## 7. Protocol Activity (Actividad de Protocolo)

**Qué es**:  
Interacciones entre el agente y otros protocolos, plataformas o servicios del ecosistema (como comprobaciones de liveness, pagos, minting, tipping, etc.).

**Propósito de Negocio**:  
Muestra qué tan bien integrado y activo está el agente dentro de la red más amplia.

**Entidades Principales**:
- `liveness`, `virtuals`, `ramaris`, `level_a2s`, `api_verified_interaction`, `mint_event`, `tip_event`, `railway`, `execution_market_feedback`, `protocol_data`

**Contribución al Análisis**:
- Demuestra **participación en el ecosistema** y madurez técnica.
- Muy importante para medir la utilidad real y la adopción.

---

## Tabla de Comparación: Tipos de Feedback

| Tipo de Feedback          | Naturaleza              | Valor Principal                     | Mejor Para                        | On-Chain |
|---------------------------|-------------------------|-------------------------------------|-----------------------------------|----------|
| **Attestations**          | Certificación           | Endoso formal y confianza           | Reputación y legitimidad          | Sí       |
| **Comments**              | Cualitativo             | Opinión y feedback del usuario      | Satisfacción del usuario          | Sí       |
| **External Audits**       | Auditoría Profesional   | Validación independiente            | Confianza empresarial y seguridad | Sí       |
| **Identity Analysis**     | Análisis de Persona     | Profundidad de carácter y coherencia| Agentes sociales y avanzados      | Sí       |
| **On-Chain Executions**   | Registros de Acción     | Prueba de trabajo real realizado    | Utilidad y capacidad              | Sí       |
| **On-Chain Feedbacks**    | Calificación Estructurada| Desempeño cuantificable            | Puntuación de reputación          | Sí       |
| **Protocol Activity**     | Integración en Ecosistema| Participación en la red y madurez  | Adopción y fortaleza técnica      | Sí       |

---

## Monitoreo Dinámico y Continuo

El análisis de feedback **no es estático**. El sistema monitorea constantemente toda la actividad on-chain relacionada con cada agente. A medida que surgen nuevos tipos de interacciones o entidades en el ecosistema, se evalúan automáticamente e se incorporan a la categoría de feedback correspondiente. Esto garantiza que las evaluaciones de los agentes se mantengan actualizadas y reflejen la naturaleza evolutiva de la red.

---

## Por Qué Estos Tipos de Feedback Importan

Juntas, estas siete categorías crean una **visión completa de 360 grados** de cada agente:

- **Confianza y Legitimidad** → Attestations, External Audits, Identity Analysis
- **Experiencia del Usuario** → Comments, On-Chain Feedbacks
- **Utilidad Real y Adopción** → On-Chain Executions, Protocol Activity

Los agentes que reciben feedback diverso y de alta calidad en múltiples categorías tienden a posicionarse mejor en el Index Humi, aparecer más prominentemente en las búsquedas y atraer más usuarios e integraciones.

---

**Versión del Documento**: Orientado a Negocio (Mayo 2026)

Esta guía está diseñada para creadores, usuarios, desarrolladores y socios que desean entender cómo se construye y mantiene la reputación de los agentes en el ecosistema.

¿Te gustaría agregar recomendaciones sobre cómo los agentes pueden mejorar su feedback en cada categoría?
