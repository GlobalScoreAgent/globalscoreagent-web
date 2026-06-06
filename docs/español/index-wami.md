# Índice WAMI – Wallet Advanced Metrics Index

**Versión 1.0**  
**Fecha:** 19 de mayo de 2026 (Actualizado con Niveles de Madurez)  
**Diseñado para:** Ecosistema GlobalScoreAgent (ERC-8004)

---

## ¿Qué es el Índice WAMI?

El **Índice WAMI** (Wallet Advanced Metrics Index) es un poderoso puntaje de reputación de un solo número que va de **0 a 100** y mide la calidad general, legitimidad, nivel de riesgo y madurez de cualquier wallet on-chain.

Se calcula combinando **cuatro pilares independientes**, cada uno con un valor máximo de 25 puntos, para un total de 100 puntos. Cada punto se deriva de datos reales y verificables on-chain ya disponibles en el sistema.

WAMI ofrece una métrica clara, transparente y fácil de entender que responde a la pregunta clave:  
**“¿Qué tan confiable y de alta calidad es esta wallet?”**

Es especialmente valioso para wallets que poseen o registran Agentes en el ecosistema ERC-8004, pero funciona para cualquier dirección de wallet.

---

## Niveles de Madurez WAMI (Interpretación de Negocio)

El puntaje WAMI (0–100) se traduce en **5 claros niveles de madurez/confianza**. Estos niveles se utilizan en el dashboard para:
- Filtros y búsqueda avanzada
- Insignias y colores en las tarjetas de wallets / vistas de owners de Agentes
- Alertas de riesgo cuando se combina con HUMI
- Ranking y recomendaciones

| Nivel           | Rango WAMI | Color UI       | Insignia / Etiqueta | Descripción para Usuarios (Dashboard)                                      | Nivel de Confianza de Negocio      | Riesgo Aprox. |
|-----------------|------------|----------------|---------------------|----------------------------------------------------------------------------|------------------------------------|---------------|
| **Unstable**    | 0 – 49     | 🔴 Rojo        | Unstable            | Wallet de alto riesgo con orígenes sospechosos, baja actividad o baja calidad. Se requiere extrema precaución. | Muy bajo – No recomendado          | Alto          |
| **Developing**  | 50 – 64    | 🟠 Naranja     | Developing          | Wallet básica. Tiene presencia mínima pero aún es inmadura.               | Moderado – Monitorear de cerca     | Medio-Alto    |
| **Stable**      | 65 – 79    | 🟢 Verde Claro | Stable              | Wallet confiable con calidad y madurez sólida. Recomendada para uso general. | Bueno – Nivel de confianza aceptable | Bajo          |
| **Very Stable** | 80 – 89    | 🟢 Verde       | Very Stable         | Wallet madura, consistente y de alta calidad. Alta confiabilidad.          | Alto – Adecuada para uso crítico   | Muy Bajo      |
| **Elite**       | 90 – 100   | 🟢 Verde Oscuro| Elite               | Wallet excepcional en el ecosistema. Máxima calidad y madurez.             | Muy Alto / Premium – Máxima confianza | Mínimo        |

**Notas de Negocio:**
- El umbral para “**Stable**” se ha elevado a **65+** (anteriormente demasiado permisivo). Esto evita que wallets con debilidades estructurales (orígenes sospechosos, baja diversificación, señales de wash-trading, etc.) sean percibidas como confiables.
- Cualquier WAMI **< 65** debe mostrar siempre una advertencia visual cuando se combina con HUMI.
- Los niveles respetan la filosofía progresiva v2.0: las wallets nuevas pueden alcanzar rápidamente “Developing”, pero llegar a “Stable” requiere madurez real on-chain en los cuatro pilares.
- **Alineado con HUMI** – mismos rangos, mismos colores y mismas insignias para una consistencia perfecta entre Agentes y Wallets.

---

## Cómo se Aplica el Índice WAMI en el Ecosistema ERC-8004

En el ecosistema ERC-8004, cada Agente es controlado o registrado por una wallet. La calidad de esa wallet impacta directamente en la credibilidad del Agente.

El Índice WAMI actúa como una **capa de confianza para las wallets**, al igual que el Index Humi actúa como capa de confianza para los Agentes. Permite:
- Evaluación automática de los owners de Agentes antes de que interactúen con protocolos, gobernanza o marketplaces.
- Evaluación de riesgo en tiempo real para cualquier wallet que interactúe con Agentes (staking, pagos, atestaciones, etc.).
- Integración perfecta con el Index Humi existente para crear un sistema completo de reputación (Agente + Wallet del owner).

Al agregar WAMI, toda la red ERC-8004 gana una forma estandarizada de distinguir wallets legítimas y probadas en batalla de aquellas nuevas, riesgosas o artificialmente infladas.

---

## Beneficios de Usar el Índice WAMI

- **Decisión de Confianza Instantánea:** Un solo número (0–100) le dice a usuarios, plataformas y protocolos todo lo que necesitan saber sobre la calidad de una wallet.
- **Reducción de Riesgo:** Marca automáticamente wallets con orígenes de fondos sospechosos, comportamiento de wash-trading o actividad no natural.
- **Mejor Reputación de Agentes:** Las wallets de owner con alto WAMI mejoran el puntaje general Index Humi de sus Agentes.
- **Transparente y Auditable:** Cada punto está respaldado por datos on-chain y es completamente explicable (sin modelos de IA de caja negra).
- **Escalable y en Tiempo Real:** Se actualiza automáticamente con cada nueva actividad de wallet procesada.
- **Oportunidades de Negocio:** Permite funcionalidades premium como APIs de puntuación de wallets, alertas de riesgo, filtros de búsqueda avanzados y onboarding tipo KYC-lite.
- **Estandarización en Todo el Ecosistema:** Crea un lenguaje común de confianza entre todos los Agentes, owners y dApps en la red ERC-8004.

---

## Cómo el Índice WAMI Complementa al Index Humi

El Índice WAMI y el Index Humi trabajan juntos como un **paquete completo de reputación** para el ecosistema ERC-8004:

- **Index Humi** evalúa el **Agente** en sí (calidad de metadatos, actividad, identidad, uso de protocolos, historial del owner, etc.).
- **Index WAMI** evalúa la **wallet** detrás del Agente (la wallet del owner o la que lo registró).

**Sinergia clave:**
- Un puntaje WAMI alto (ej. 85+) se fortalece aún más cuando la wallet del owner también tiene un puntaje HUMI alto, creando la señal de confianza más fuerte posible.
- Un puntaje WAMI bajo (ej. por debajo de 60) combinado con un HUMI bajo genera fuertes alertas rojas, incluso si uno de ellos parece aceptable por separado.
- Juntos ofrecen el panorama completo: **“¿Está bien construido el Agente Y está controlado por una wallet confiable?”**

Esta combinación crea el sistema de reputación más robusto del ecosistema ERC-8004 — mucho más fuerte que evaluar Agentes o wallets por separado.

---

## Comparación con Otros Índices y Oráculos de Reputación Externos

| Índice / Oráculo                | Proveedor         | Enfoque                        | Rango de Puntaje | Datos Utilizados              | Ventaja Clave de WAMI |
|---------------------------------|-------------------|--------------------------------|------------------|-------------------------------|-----------------------|
| **Nansen Wallet Score**         | Nansen            | Comportamiento y etiquetado de wallets | 0–100            | Off-chain + on-chain analytics| WAMI es completamente on-chain y nativo de ERC-8004 |
| **Arkham Intelligence**         | Arkham            | Etiquetado de entidades y flujos de fondos | Basado en riesgo | On-chain + base de datos de entidades | WAMI ofrece un puntaje simple y único de 0-100 con pilares |
| **Chainalysis / TRM Labs**      | Chainalysis/TRM   | Scoring de riesgo y cumplimiento | Niveles de riesgo | On-chain + inteligencia off-chain | WAMI es público, transparente y específico para Agentes |
| **Dune / Dashboards Comunitarios** | Open-source    | Métricas personalizadas de wallets | Variable         | Consultas on-chain            | WAMI es estandarizado, en tiempo real e integrado con GSA |
| **EigenLayer / Otras Rep. DeFi**| Varios DeFi       | Reputación de staking y restaking | Variable         | Actividad específica de protocolo | WAMI funciona en todas las cadenas y está enfocado en owners de Agentes |

**Por qué WAMI destaca:**
- Está diseñado específicamente para el **ecosistema de Agentes ERC-8004** (la mayoría de las herramientas externas son de propósito general).
- Totalmente on-chain y transparente (sin modelos de IA propietarios de caja negra).
- Integrado directamente con Index Humi para un sistema completo de reputación Agente + Owner.
- Libre de dependencias externas — todos los datos provienen directamente de la blockchain (actividad de wallets indexada vía Alchemy, Moralis y Zerion) y se almacenan en nuestras tablas walcert.

---

## Frescura de Datos y Estrategia de Evaluación de Wallets

El Índice WAMI está diseñado tanto para **precisión** como para **eficiencia**. En lugar de recalcular puntajes para cada wallet constantemente, el sistema selecciona inteligentemente qué wallets evaluar y con qué frecuencia actualizar cada módulo de datos.

### ¿Qué wallets se evalúan?
WAMI solo puntúa **wallets de alta relevancia** que están siendo monitoreadas activamente en el sistema:
- Wallets con estado **“valid”** o **“monitoring”**
- Wallets que tienen una **fecha de inicio de monitoreo** establecida
- Wallets categorizadas automáticamente según su nivel real de actividad (ej. Explosive Growth, Hyper Growth, Sustained Growth, Steady Active, New High-Nonce, Dormant High-Nonce, etc.)

Este enfoque enfocado asegura que solo las wallets con historial on-chain significativo y actividad continua reciban un puntaje WAMI, eliminando ruido de direcciones inactivas o irrelevantes.

### ¿Con qué frecuencia se actualiza cada módulo?
El sistema utiliza una lógica inteligente de **“does need”** para activar actualizaciones solo cuando es necesario:
- **Orígenes y Legitimidad (Fund Origins):** Se actualiza **una sola vez** cuando la wallet califica por primera vez como válida (es un análisis fundacional más pesado y único).
- **Flujos Recientes, Calidad del Portafolio y Presencia Multichain:** Se actualiza **cada 15 días** para wallets activas/válidas en crecimiento (o inmediatamente si los datos nunca se han calculado antes).

### Beneficios de este enfoque
- **Máxima eficiencia:** Los recursos computacionales se enfocan solo en las wallets que importan y solo cuando los datos están desactualizados.
- **Frescura garantizada:** Usuarios y plataformas siempre ven puntajes basados en datos con no más de 15 días de antigüedad para los módulos más dinámicos.
- **Priorización inteligente:** Las wallets de crecimiento rápido o muy activas se actualizan de forma más responsiva, mientras que las wallets estables no desperdician recursos.
- **Escalabilidad:** El sistema puede manejar miles de wallets sin recalculaciones completas constantes.
- **Rentable y sostenible:** Reduce la carga en la base de datos y el procesamiento mientras mantiene una alta calidad de datos.

Esta estrategia asegura que el Índice WAMI sea preciso y de alto rendimiento a escala del ecosistema.

---

## Pilares del Índice WAMI

Cada pilar vale exactamente **25 puntos**. A continuación se detallan los aspectos específicos analizados y los puntos máximos que cada uno puede contribuir.

### 1. Orígenes y Legitimidad (25 puntos)
Evalúa qué tan limpios y naturales son los orígenes de los fondos de la wallet.
- Calidad y legitimidad de los primeros fondos recibidos: **8 puntos**
- Bajo riesgo de servicios de mixing o fuentes de fondos sospechosas: **7 puntos**
- Ausencia de fuerte dependencia de ingresos desde exchanges centralizados (CEX): **5 puntos**
- Diversidad saludable de fuentes de fondos y remitentes: **5 puntos**

### 2. Calidad del Portafolio (25 puntos)
Mide la salud, liquidez y sofisticación de los activos que posee la wallet.
- Valor total del portafolio y salud general de los activos: **7 puntos**
- Alta proporción de activos líquidos (fácilmente negociables): **6 puntos**
- Fuerte diversificación entre diferentes tipos y categorías de tokens: **6 puntos**
- Exposición equilibrada a activos estables y verificados con mínima tenencia de baja calidad: **6 puntos**

### 3. Actividad y Comportamiento (25 puntos)
Analiza si la actividad reciente de la wallet parece natural y sostenible.
- Volumen natural y equilibrio entre ingresos y egresos: **7 puntos**
- Bajos indicios de wash-trading o ciclos de transacciones artificiales: **6 puntos**
- Alto número de contrapartes únicas y genuinas: **6 puntos**
- Patrones sospechosos limitados (wallets compartidas, concentración de timing, excesiva interacción con CEX): **6 puntos**

### 4. Presencia Multichain y Madurez (25 puntos)
Evalúa la longevidad, distribución geográfica y consistencia de la wallet a través de distintas blockchains.
- Largo historial de actividad consistente (edad y duración): **8 puntos**
- Presencia activa en múltiples redes blockchain: **7 puntos**
- Patrones de actividad equilibrados y coherentes entre cadenas: **5 puntos**
- Madurez general demostrada por engagement sostenido: **5 puntos**

---

**¿Listo para implementarlo?**  
Para la implementación técnica de la API y el acceso al Dashboard, te recomendamos visitar nuestro sitio web oficial:  
**https://www.globalscoreagent.com/**

Junto con Index HUMI, WAMI establece el nuevo estándar de confianza en el ecosistema ERC-8004.
