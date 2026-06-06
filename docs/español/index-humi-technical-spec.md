# Índice HUMI – Especificación Técnica

**Versión 1.0**  
**Fecha:** 19 de mayo de 2026  
**Tipo de Índice:** Puntaje de Reputación de Agente (0–100)

---

## Visión General

El **Índice HUMI** (Human-like Metrics Index) es un puntaje compuesto de reputación que va de **0 a 100** y evalúa la calidad general, legitimidad, madurez e inteligencia real de cualquier Agente en el ecosistema ERC-8004.

Se construye a partir de **cuatro pilares independientes**, cada uno con un valor máximo de **25 puntos** (total 100 puntos).

Cada pilar se divide en tres secciones:
- **Básica** – Calidad fundamental
- **Intermedia** – Capacidad demostrada
- **Avanzada** – Madurez sofisticada

El puntaje final es la suma de los cuatro pilares.

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

Evalúa la validación externa, la riqueza de metadatos y el análisis especializado del Agente.

### Sección Básica (10 puntos)
- Riqueza y completitud de metadatos: **8 puntos**
- Existencia de auditorías externas o actividad de protocolo: **2 puntos**

### Sección Intermedia (9 puntos)
- Calidad de transacciones de wallet (nivel intermedio): **3 puntos**
- Auditorías externas básicas (al menos una con puntaje aceptable): **3 puntos**
- Actividad de protocolo a nivel intermedio: **3 puntos**

### Sección Avanzada (6 puntos)
- Auditorías externas avanzadas (múltiples con altos puntajes): **3 puntos**
- Calidad avanzada de transacciones de wallet: **1 punto**
- Análisis de identidad y evaluaciones especializadas: **1 punto**
- Actividad de protocolo avanzada con alta calidad: **1 punto**

**Ajustes Globales (aplicados al puntaje total del pilar)**
- Análisis de duplicación: **±2.0 puntos**
- Penalización por spam / advertencias: **-1.5 puntos**

---

## Pilar 4 – Usage (25 puntos)

Analiza la actividad real on-chain y el nivel de engagement del Agente.

### Sección Básica (10 puntos)
- Actividad reciente natural (wallet o on-chain): **10 puntos**

### Sección Intermedia (9 puntos)
- Volumen de actividad intermedia de wallet: **3 puntos**
- Calidad intermedia de actividad on-chain: **5 puntos**
- Presencia de comentarios válidos: **1 punto**

### Sección Avanzada (6 puntos)
- Actividad avanzada de wallet (alto volumen reciente): **1.5 puntos**
- Actividad on-chain avanzada con alta calidad: **3.0 puntos**
- Actividad de protocolo con pagos: **1.5 puntos**

**Ajustes Globales (aplicados al puntaje total del pilar)**
- Penalización por revocaciones / advertencias: **-1.5 puntos**

---

**Puntaje Final HUMI** = Pilar History (25) + Pilar Information (25) + Pilar Measure (25) + Pilar Usage (25)
