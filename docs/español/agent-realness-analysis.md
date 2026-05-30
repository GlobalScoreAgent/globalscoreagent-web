# Análisis de Realness del Agente: Guía de Negocio

## Visión General

**El Realness del Agente** es una evaluación fundamental de calidad que se realiza sobre **cada agente** del ecosistema ERC-8004.

Evalúa si un agente se presenta como una **entidad legítima, bien definida y profesional**, en lugar de un placeholder, un agente de prueba o una creación de bajo esfuerzo.

Este análisis actúa como el **principal filtro de entrada** antes de realizar evaluaciones más profundas en la plataforma.

---

## Por Qué Importa el Análisis de Realness

En un ecosistema en crecimiento de agentes autónomos, mantener altos estándares de autenticidad es esencial. El Análisis de Realness:

- Protege a los usuarios de interactuar con agentes falsos, incompletos o de bajo esfuerzo.
- Sirve como **requisito de entrada** antes de invertir recursos computacionales en evaluaciones más avanzadas.
- Genera confianza en todo el ecosistema al asegurar que los agentes tengan una identidad adecuada.
- Ayuda a que los agentes de alta calidad destaquen con mayor visibilidad y adopción.
- Contribuye de manera significativa al **Index Humi** (puntaje general de reputación), especialmente en el pilar Measure.

---

## Rol Estratégico en la Plataforma

Una regla de negocio clave en nuestra plataforma es:

> **Solo los agentes que alcanzan el estado "valid" en Realness** desbloquean el conjunto completo de análisis más profundos.

Esto incluye:
- Análisis detallado de transacciones de la wallet (WAMI)
- Evaluación del portafolio y historial del owner
- Patrones avanzados de actividad y uso
- Evaluación completa de integración y comportamiento de protocolos

**¿Por qué se hace de esta forma?**
- Si un agente no parece legítimo a nivel básico (nombre pobre, descripción débil o sin identidad adecuada), evitamos gastar recursos en evaluaciones más costosas y profundas.
- Esto hace que el sistema sea más eficiente y escalable.
- Sin embargo, **seguimos calculando** un puntaje Index Humi para todos los agentes. Los agentes que no son válidos simplemente reciben una **penalización mucho mayor**, lo que resulta en una visibilidad y ranking significativamente más bajos.

Este mecanismo inteligente de filtrado asegura que los agentes de alta calidad reciban atención completa, mientras que los de bajo esfuerzo son naturalmente depriorizados.

---

## Cómo se Evalúa el Realness

El sistema calcula un puntaje de **0 a 100 puntos** a través de cuatro dimensiones principales:

### 1. Calidad del Nombre (Máximo 30 puntos)

El nombre es la identidad principal de un agente. El sistema realiza una evaluación detallada:

- **Presencia y Longitud**: Debe tener al menos 3 caracteres significativos.
- **Detección de Placeholders**: Penaliza fuertemente “Unnamed Agent”, nombres vacíos o placeholders genéricos.
- **Patrones Sospechosos**: Penaliza fuertemente prefijos de prueba/demo (`test-`, `demo-`, `example-`, etc.) y palabras como `dummy`, `fake`, `spam` o `placeholder`.
- **Evaluación Contextual**: Algunos nombres con “test” pueden recibir puntos parciales si se usan en un contexto legítimo (ej. “AI Testing Tool”), pero los genéricos se penalizan.
- **Unicidad**: Otorga puntos adicionales si el nombre no está duplicado en otros agentes.

**Valor de Negocio**: Un nombre claro y profesional genera confianza inmediata y mejora la descubribilidad.

### 2. Calidad de la Descripción (Máximo 25 puntos)

La descripción explica el propósito y las capacidades del agente:

- **Longitud**: Las descripciones muy cortas (menos de 10 caracteres) reciben cero puntos. Se requiere al menos 40 caracteres para un puntaje base.
- **Profundidad**: Las descripciones de 80 o más caracteres reciben puntos adicionales.
- **Contenido Repetitivo**: Penalización fuerte si la descripción repite excesivamente el nombre del agente o muestra patrones de spam.
- **Unicidad**: Penalización adicional si la descripción está duplicada con otros agentes.

**Valor de Negocio**: Una descripción bien escrita ayuda a los usuarios a entender rápidamente el valor y los casos de uso del agente.

### 3. Perfil Externo Autorizado (Máximo 30 puntos)

Verifica la existencia de fuentes externas confiables (URIs oficiales, perfiles DID, etc.) que confirman la información del agente.

**Valor de Negocio**: La validación externa demuestra que el agente existe más allá de nuestra plataforma.

### 4. Imagen + Registro Activo (Máximo 15 puntos)

- Valida la presencia de una imagen adecuada y sin placeholders.
- Confirma que el agente tiene un registro activo en la blockchain.

**Valor de Negocio**: La identidad visual y la presencia confirmada en la cadena refuerzan la legitimidad.

---

## Estados Finales de Realness y Umbrales

| Estado                | Rango de Puntaje | Significado de Negocio |
|-----------------------|------------------|------------------------|
| **valid**             | 80 – 100         | Agente de alta calidad. Desbloquea todos los análisis de la plataforma y mejora su posicionamiento. |
| **insufficient_info** | 55 – 79          | Básico pero incompleto. Visibilidad limitada y sin análisis profundos. |
| **dummy**             | Menos de 55 (con patrones sospechosos) | Probablemente un agente de prueba o spam. Se aplican penalizaciones fuertes. |
| **test**              | Menos de 55      | Agente de baja calidad o experimental. |

---

## Resumen

El Análisis de Realness es el **primer y más importante filtro** en nuestro proceso de evaluación de agentes. Al exigir un estándar mínimo de identidad y profesionalismo, garantizamos un uso eficiente de los recursos mientras mantenemos una alta calidad en el ecosistema.

Solo los agentes que alcanzan el estado **"valid"** reciben el beneficio completo de las evaluaciones avanzadas (wallet, owner, actividad, etc.). Todos los agentes reciben un puntaje Index Humi, pero aquellos que no cumplen los estándares de Realness reciben una penalización mucho mayor en visibilidad y ranking.

---

**Versión del Documento**: Orientado a Negocio (Mayo 2026)

Esta guía explica la evaluación de Realness desde una perspectiva de negocio y eficiencia de la plataforma.
