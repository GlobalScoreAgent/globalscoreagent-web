# Índice HUMI – Agent Human-like Intelligence Index

**Versión 1.1**  
**Fecha:** 17 de julio de 2026  
**Diseñado para:** Ecosistema GlobalScoreAgent (ERC-8004)

---

## ¿Qué es el Índice HUMI?

El **Índice HUMI** (Human-like Metrics Index) es un poderoso puntaje de reputación de un solo número que va de **0 a 100** y mide la calidad general, legitimidad, madurez e inteligencia real de cualquier Agente en el ecosistema ERC-8004.

Se calcula combinando **cuatro pilares independientes**, cada uno con un valor máximo de 25 puntos, para un total de 100 puntos. Cada punto se deriva de datos reales y verificables on-chain (metadatos, actividad, historial del owner, análisis externos y uso de protocolos).

HUMI ofrece una métrica clara, transparente y fácil de entender que responde a la pregunta clave:  
**“¿Qué tan confiable, maduro y humano-like es este Agente?”**

Es la capa central de reputación para cada Agente registrado en la red ERC-8004.

---

## Niveles de Madurez HUMI (Interpretación de Negocio)

El puntaje HUMI (0–100) se traduce en **5 claros niveles de madurez/confianza**. Estos niveles se utilizan en el dashboard para:
- Filtros y búsqueda avanzada
- Insignias y colores en las tarjetas de Agentes
- Ranking y recomendaciones
- Alertas de riesgo cuando se combina con WAMI

| Nivel           | Rango HUMI | Color UI       | Insignia / Etiqueta | Descripción para Usuarios (Dashboard)                                      | Nivel de Confianza de Negocio      | Riesgo Aprox. |
|-----------------|------------|----------------|---------------------|----------------------------------------------------------------------------|------------------------------------|---------------|
| **Unstable**    | 0 – 49     | 🔴 Rojo        | Unstable            | Agente de alto riesgo o muy baja madurez. Se requiere extrema precaución. | Muy bajo – No recomendado para producción | Alto          |
| **Developing**  | 50 – 64    | 🟠 Naranja     | Developing          | Agente básico. Tiene presencia mínima pero aún es inmaduro.               | Moderado – Monitorear de cerca     | Medio-Alto    |
| **Stable**      | 65 – 79    | 🟢 Verde Claro | Stable              | Agente confiable con madurez intermedia sólida. Recomendado para uso general. | Bueno – Nivel de confianza aceptable | Bajo          |
| **Very Stable** | 80 – 89    | 🟢 Verde       | Very Stable         | Agente maduro, consistente y de alta calidad. Alta confiabilidad.          | Alto – Adecuado para integraciones críticas | Muy Bajo      |
| **Elite**       | 90 – 100   | 🟢 Verde Oscuro| Elite               | Agente de referencia en el ecosistema. Máxima calidad y madurez.           | Muy Alto / Premium – Máxima confianza | Mínimo        |

---

## Cómo se Aplica el Índice HUMI en el Ecosistema ERC-8004

En el ecosistema ERC-8004, los Agentes son entidades autónomas que interactúan con usuarios, protocolos y entre sí. Su credibilidad es crítica para la adopción, gobernanza, staking y listados en marketplaces.

El Índice HUMI actúa como la **capa principal de confianza para los Agentes**, evaluando no solo características técnicas, sino el panorama completo de legitimidad y actividad real. Se calcula **diariamente** con el Graph oficial de Ormi Labs junto con la actividad de wallets transaccionales en las chains indexadas. Nonce, balance y deltas se calculan por wallet y chain, y luego se agregan por agente.

HUMI se aplica a **todos los Agentes** — nuevos o antiguos, de alta o baja actividad — garantizando que cada Agente registrado reciba un puntaje de reputación justo y actualizado.

Permite:
- Ranking automático y filtrado de Agentes en dashboards y marketplaces.
- Evaluación de riesgo en tiempo real antes de cualquier interacción (ejecuciones, atestaciones, pagos, etc.).
- Integración perfecta con Index WAMI para crear un sistema completo de reputación (Agente + Wallet del owner).

Con HUMI, toda la red ERC-8004 gana una forma estandarizada de distinguir Agentes de alta calidad y probados en batalla de aquellos de bajo esfuerzo o sospechosos.

---

## Beneficios de Usar el Índice HUMI

- **Decisión de Confianza Instantánea:** Un solo número (0–100) le dice a usuarios, plataformas y protocolos todo lo que necesitan saber sobre la calidad de un Agente.
- **Reducción de Riesgo:** Marca automáticamente Agentes con historial de ownership pobre, baja calidad de metadatos, actividad sospechosa o débil validación externa.
- **Sinergia de Reputación de Wallet:** Los Agentes con alto HUMI combinados con wallets de alto WAMI reciben las señales de confianza máximas.
- **Transparente y Auditable:** Cada punto está respaldado por datos on-chain y es completamente explicable (sin modelos de IA de caja negra).
- **Escalable y en Tiempo Real:** Se actualiza automáticamente con cada nueva actividad y registro de análisis del Agente.
- **Oportunidades de Negocio:** Permite funcionalidades premium como APIs de puntuación de Agentes, filtros de búsqueda avanzados, ponderación en gobernanza y curación de marketplaces.
- **Estandarización en Todo el Ecosistema:** Crea un lenguaje común de confianza entre todos los Agentes, owners y dApps en la red ERC-8004.

---

## Cómo el Índice HUMI Complementa al Index WAMI

El Índice HUMI y el Index WAMI trabajan juntos como un **paquete completo de reputación** para el ecosistema ERC-8004:

- **Index HUMI** evalúa el **Agente** en sí (calidad de metadatos, actividad, identidad, uso de protocolos, historial del owner, etc.).
- **Index WAMI** evalúa la **wallet** detrás del Agente (la wallet del owner o la que lo registró).

**Sinergia clave:**
- Un puntaje HUMI alto (ej. 85+) se fortalece aún más cuando la wallet del owner también tiene un puntaje WAMI alto, creando la señal de confianza más fuerte posible.
- Un puntaje HUMI bajo (ej. por debajo de 60) combinado con un WAMI bajo genera fuertes alertas rojas, incluso si uno de ellos parece aceptable por separado.
- Juntos ofrecen el panorama completo: **“¿Está bien construido el Agente Y está controlado por una wallet confiable?”**

Esta combinación crea el sistema de reputación más robusto del ecosistema ERC-8004 — mucho más fuerte que evaluar Agentes o wallets por separado.

---

## Comparación con Otros Índices y Oráculos de Reputación Externos

| Índice / Oráculo                | Proveedor         | Enfoque                        | Rango de Puntaje | Datos Utilizados              | Ventaja Clave de HUMI |
|---------------------------------|-------------------|--------------------------------|------------------|-------------------------------|-----------------------|
| **Nansen / Arkham Agent Scores**| Nansen / Arkham   | Etiquetado de wallets y entidades | 0–100            | Off-chain + on-chain analytics| HUMI está diseñado específicamente para Agentes ERC-8004 |
| **Chainalysis / TRM Labs**      | Chainalysis/TRM   | Scoring de riesgo y cumplimiento | Niveles de riesgo | On-chain + inteligencia off-chain | HUMI es público, transparente y específico para Agentes |
| **Dune / Dashboards Comunitarios** | Open-source    | Métricas on-chain personalizadas | Variable         | Consultas on-chain            | HUMI es estandarizado, en tiempo real e integrado con GSA |
| **EigenLayer / Reputación DeFi**| Varios DeFi       | Reputación de staking y protocolos | Variable         | Actividad específica de protocolo | HUMI evalúa el ciclo de vida completo del Agente con presencia multichain significativa |
| **General AI Agent Scores**     | Varias startups   | Métricas off-chain de IA       | Variable         | API + metadatos               | HUMI es completamente on-chain y ligado a registros ERC-8004 |

**Por qué HUMI destaca:**
- Está diseñado específicamente para el **ecosistema de Agentes ERC-8004** (la mayoría de las herramientas externas son de propósito general o solo para wallets).
- Totalmente on-chain y transparente (sin modelos de IA propietarios de caja negra).
- Integrado directamente con Index WAMI para un sistema completo de reputación Agente + Owner.
- Libre de dependencias externas — todos los datos provienen directamente de la blockchain (Graph ERC-8004 de Ormi Labs + actividad de wallets indexada vía Alchemy, Moralis y Zerion) y se almacenan en nuestras tablas ERC-8004 y walcert.

---

## Frescura de Datos y Estrategia de Evaluación de Agentes

El Índice HUMI está diseñado tanto para **precisión** como para **eficiencia**. Se **recalcula diariamente** utilizando el Graph oficial proporcionado por Ormi Labs junto con la actividad de wallets transaccionales, asegurando que cada Agente tenga datos frescos y confiables.

### ¿Qué Agentes se evalúan?
HUMI evalúa **todos los Agentes** del ecosistema sin excepción:
- Agentes nuevos y antiguos
- Agentes de alta y baja actividad
- Agentes cuya actividad transaccional se consolida a través de wallets válidas y chains indexadas

Este enfoque universal garantiza que cada Agente registrado reciba un puntaje de reputación justo y actualizado.

### ¿Qué datos se actualizan diariamente?
- **Nonce, balance y deltas** calculados por wallet transaccional y chain, y luego agregados por agente.
- **Actividad on-chain** y datos de registro en las chains indexadas, con énfasis en la calidad de presencia y no simplemente en contar en cuántas chains aparece un agente.
- **Punteros off-chain** encontrados directamente en los registros ERC-8004, incluyendo:
  - URIs de metadatos y documentos DID
  - Feedbacks de más de **21 entidades externas** (procesados automáticamente)

El sistema decide inteligentemente qué módulos necesitan actualizarse según los datos más recientes del Graph y reglas de frescura basadas en tiempo. Este ciclo diario, combinado con banderas inteligentes de “does need”, mantiene el índice preciso sin recomputaciones innecesarias.

### Beneficios de este enfoque
- **Máxima frescura:** Los puntajes nunca tienen más de 24 horas de antigüedad.
- **Cobertura completa:** Todos los Agentes — independientemente de su antigüedad o nivel de actividad — están incluidos.
- **Profundidad de datos rica:** Combina datos on-chain del Graph con metadatos off-chain importados, feedbacks externos y agregación multichain de wallets transaccionales válidas.
- **Escalabilidad:** El procesamiento diario en las chains indexadas se mantiene eficiente gracias al filtrado inteligente.
- **Confianza a escala del ecosistema:** Usuarios y plataformas siempre ven la visión más actual y completa de la calidad de los Agentes.

Esta estrategia asegura que el Índice HUMI sea preciso y de alto rendimiento a escala del ecosistema.

---

## Pilares del Índice HUMI

Cada pilar está diseñado en torno a un máximo nominal de **25 puntos**. A continuación se detallan los aspectos específicos analizados y cómo contribuyen al puntaje.

### 1. Pilar Historia (25 puntos)
Evalúa la estabilidad de la propiedad y la reputación histórica del Agente.
- Fortaleza y actividad de la wallet del owner: **10 puntos**
- Estabilidad de la propiedad a lo largo del tiempo (pocos o ningún cambio): **5 puntos**
- Longevidad y antigüedad de la wallet del owner: **5 puntos**
- Calidad y actividad del portafolio general de Agentes del owner: **5 puntos**

### 2. Pilar Información (25 puntos)
Mide la riqueza, profesionalismo y completitud de la identidad pública y los metadatos técnicos del Agente.
- Calidad del nombre, descripción e imagen: **7.5 puntos**
- Diversidad y profundidad de las fuentes de información (Chain + URI + externas): **7.5 puntos**
- Disponibilidad de métodos de contacto y endpoints programáticos: **5 puntos**
- Madurez técnica avanzada (supported trust, verification methods, skills, etc.): **5 puntos**

### 3. Pilar Measure (25 puntos)
Evalúa si un agente está representado de forma creíble, validado externamente y presente de forma operativa.
- Riqueza de metadatos y existencia operativa (nonce agregado, atestaciones, ejecuciones o feedback)
- Validación externa, análisis de identidad y calidad de protocolos
- **Calidad de Presencia Multichain** — profundidad significativa en chains valiosas y de alto valor, no presencia superficial en más chains
- Penalizaciones por advertencias del agente

El volumen de wallets transaccionales sigue contribuyendo, pero con menor peso directo; la calidad de la presencia multichain es ahora una dimensión explícita del scoring.

### 4. Pilar Usage (25 puntos)
Evalúa la adopción operativa reciente a través de wallets y chains.
- Actividad reciente agregada de todas las wallets transaccionales válidas
- Calidad de canales on-chain (atestaciones, ejecuciones, feedbacks, actividad de protocolo)
- Comentarios y uso pagado de protocolos
- **Uso Valioso Multichain** — actividad significativa a través de chains valiosas
- **Consistencia Multichain de Alto Valor** — presencia en chains de alto valor sin concentración extrema en una sola chain
- Penalizaciones por revocaciones de actividad reciente

Aparecer en más chains por sí solo no se recompensa. Usage recompensa la actividad multichain valiosa y penaliza la dispersión superficial o la concentración extrema en la chain primaria.

---

**¿Listo para implementarlo?**  
Para la implementación técnica de la API y el acceso al Dashboard, te recomendamos visitar nuestro sitio web oficial:  
**https://www.globalscoreagent.com/**

Junto con Index WAMI, HUMI establece el nuevo estándar de confianza en el ecosistema ERC-8004.
