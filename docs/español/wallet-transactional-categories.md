# Categorías Transaccionales de Wallets

## Guía de Explicación de Negocio

Este documento explica, en un lenguaje de negocio claro y accesible, cada **categoría de wallet** asignada por el sistema según su comportamiento transaccional (nonce = número total de transacciones realizadas por la wallet).

La clasificación analiza la actividad reciente (últimos 7 días) en comparación con el historial general de la wallet y se actualiza regularmente para las wallets que están bajo monitoreo activo (`status IN ('valid', 'monitoring')`).

Estas categorías ayudan a la plataforma a comprender rápidamente la **etapa de crecimiento, madurez y perfil de riesgo** de cada wallet, lo que influye directamente en su puntaje de calidad, confiabilidad y visibilidad dentro del ecosistema.

---

### 1. **Explosive** (Explosivo)
**Significado de Negocio**:  
La wallet está experimentando un **crecimiento extremadamente rápido y explosivo** en su actividad.

**Qué detecta el sistema**:
- El volumen de transacciones ha aumentado en **más del 200%** en los últimos 7 días.
- Se han ejecutado al menos **30 nuevas transacciones** en ese período.

**Implicaciones de Negocio**:
- Indica una adopción muy fuerte (lanzamiento exitoso, campaña viral, integración importante, etc.).
- Es una señal positiva de alto interés, pero también requiere revisión adicional por posible actividad coordinada o bots.

---

### 2. **Hyper_Growth** (Crecimiento Hiperacelerado)
**Significado de Negocio**:  
La wallet muestra un **crecimiento muy acelerado y sostenido** en el corto plazo.

**Qué detecta el sistema**:
- Crecimiento > **80%** en los últimos 7 días.
- Al menos **15 nuevas transacciones** en ese período.

**Implicaciones de Negocio**:
- Evidencia sólida de tracción rápida y expansión.
- Categoría altamente positiva: estas wallets están ganando relevancia de forma veloz.

---

### 3. **Sustained_Growth** (Crecimiento Sostenido)
**Significado de Negocio**:  
La wallet mantiene un **crecimiento sólido y constante** semana tras semana.

**Qué detecta el sistema**:
- Crecimiento > **40%** en los últimos 7 días.
- Al menos **8 nuevas transacciones** en ese período.

**Implicaciones de Negocio**:
- Evolución saludable y predecible.
- Típico de wallets que se utilizan de forma activa y progresiva.

---

### 4. **Steady_Active** (Actividad Estable)
**Significado de Negocio**:  
La wallet tiene una **actividad constante y predecible** — sin picos dramáticos, pero con uso regular.

**Qué detecta el sistema**:
- Crecimiento > **20%** en los últimos 7 días.
- Al menos **5 nuevas transacciones** en ese período.

**Implicaciones de Negocio**:
- Perfil clásico de wallets maduras y activamente utilizadas.
- Fuerte indicador de engagement genuino y estable.

---

### 5. **Dormant_HighNonce** (Inactiva con Alto Historial)
**Significado de Negocio**:  
La wallet tiene un **historial de actividad muy alto**, pero actualmente está inactiva (sin transacciones recientes).

**Qué detecta el sistema**:
- Sin crecimiento en los últimos 7 días.
- Total de transacciones históricas ≥ **500**.

**Implicaciones de Negocio**:
- Wallet “veterana” que demostró un uso significativo en el pasado.
- Puede estar en hibernación, esperando nueva actividad o temporalmente pausada. Requiere monitoreo para detectar reactivación.

---

## Wallets Nuevas (Sin historial de 2 meses)

Estas categorías aplican a wallets recién creadas que aún no tienen historial a largo plazo:

| Categoría            | Significado de Negocio                          | Total de Transacciones Actuales |
|----------------------|--------------------------------------------------|---------------------------------|
| **New_HighNonce**    | Wallet nueva con **alta actividad inicial**      | ≥ 300                           |
| **New_MediumNonce**  | Wallet nueva con **actividad moderada**          | ≥ 100                           |
| **New_LowNonce**     | Wallet nueva con **actividad baja**              | < 100                           |

**Nota de Negocio**: Un nonce inicial alto en wallets nuevas puede ser una señal positiva fuerte (uso intensivo desde el primer día) o requerir mayor escrutinio según el contexto.

---

## Wallets Antiguas que Están Actualmente Inactivas

Estas categorías identifican wallets que llevan tiempo en la red pero ya no están activas:

| Categoría                        | Significado de Negocio                                              | Total de Transacciones Actuales |
|----------------------------------|---------------------------------------------------------------------|---------------------------------|
| **Old_Inactive_HighNonce**       | Wallet antigua con **alto historial de actividad**, ahora inactiva  | ≥ 500                           |
| **Old_Inactive_MediumNonce**     | Wallet antigua con **historial moderado**, ahora inactiva          | ≥ 100                           |
| **Old_Inactive_LowNonce**        | Wallet antigua con **bajo historial**, ahora inactiva              | < 100                           |

**Nota de Negocio**: Estas categorías ayudan a distinguir entre wallets abandonadas, temporalmente pausadas o utilizadas para un propósito puntual.

---

## Por Qué Importan Estas Categorías

Esta categorización transaccional permite a la plataforma:
- Identificar wallets en **fases de crecimiento explosivo** (oportunidades o alertas).
- Reconocer wallets **maduras y estables**.
- Diferenciar wallets **nuevas** de wallets **antiguas inactivas**.
- Mejorar la evaluación general de riesgo, el puntaje de calidad y la confianza en el ecosistema.

Las categorías se recalculan automáticamente con cada nueva transacción, asegurando que el sistema siempre refleje el comportamiento actual de la wallet.

---

**Documento generado a partir de** la lógica oficial de categorización de wallets (Mayo 2026).

Para preguntas sobre cómo fue categorizada una wallet específica o cómo mejorar su categoría, consulta el dashboard de análisis de wallets de la plataforma.
