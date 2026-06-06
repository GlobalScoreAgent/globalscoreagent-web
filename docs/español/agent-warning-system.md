# Sistema de Advertencias de Agentes: Guía de Negocio

## Visión General

El **Sistema de Advertencias de Agentes** es un proceso de monitoreo diario que identifica automáticamente posibles problemas de calidad, confianza o riesgo en los agentes autónomos del ecosistema.

Su objetivo principal es proteger a los usuarios, desarrolladores y la red en general, marcando aquellos agentes que no cumplen con los estándares esperados de autenticidad, profesionalismo o comportamiento adecuado.

Cada advertencia tiene un nivel de severidad (Alta o Media) y contribuye a reducir el puntaje general de reputación del agente (Index Humi), especialmente en los pilares **Measure** y **Usage**.

---

## Propósito del Sistema de Advertencias

- Ayudar a los usuarios a identificar rápidamente agentes confiables y de alta calidad.
- Incentivar a los creadores a mantener agentes profesionales, únicos y bien gestionados.
- Detectar patrones sospechosos como duplicación, spam, control compartido o metadatos de baja calidad.
- Proporcionar transparencia sobre las razones por las que un agente puede tener menor reputación o visibilidad.

---

## Principales Tipos de Advertencias y su Significado de Negocio

### 1. Metadatos Duplicados
**Qué significa**:  
El agente comparte información central idéntica o extremadamente similar (nombre, descripción o URI de origen) con uno o más agentes diferentes.

**Evaluación de Negocio**:  
El sistema verifica coincidencias exactas en los datos de origen oficiales o combinaciones idénticas de nombre + descripción (excluyendo casos muy genéricos como “Unnamed Agent”). Esto ayuda a prevenir agentes clonados o copiados que reducen la confianza en el ecosistema.

**Impacto**: Alta severidad — afecta fuertemente la unicidad y credibilidad del agente.

---

### 2. Wallet Compartida (Multi-Agent Wallet)
**Qué significa**:  
La misma wallet se utiliza como propietaria de varios agentes distintos.

**Evaluación de Negocio**:  
El sistema verifica si una sola wallet controla varios agentes al mismo tiempo. Este patrón es común en operaciones coordinadas o posibles ataques Sybil (creación de muchas identidades falsas).

**Impacto**: Alta severidad — genera preocupación sobre control centralizado y autenticidad.

---

### 3. Metadatos de Baja Calidad / Dummy
**Qué significa**:  
El agente tiene metadatos pobres, incompletos, placeholders o sospechosos (por ejemplo, nombres de prueba, descripciones repetitivas o contenido genérico).

**Evaluación de Negocio**:  
La plataforma evalúa la calidad del nombre, descripción, imagen y perfiles externos. Los agentes con nombres tipo prueba, contenido muy corto o descripciones repetitivas/spam reciben esta advertencia.

**Impacto**: Severidad Media — indica que el agente carece de profesionalismo y seriedad.

---

### 4. Atestaciones Spam
**Qué significa**:  
El agente ha recibido múltiples atestaciones spam o de bajo valor en la blockchain.

**Evaluación de Negocio**:  
El sistema monitorea el feedback on-chain y marca agentes que reciben un alto volumen de reseñas positivas claramente manipuladoras o spam.

**Impacto**: Alta severidad — daña directamente la credibilidad y reputación del agente.

---

### 5. Auditoría Externa con Banderas de Riesgo
**Qué significa**:  
Una auditoría externa independiente del agente ha levantado banderas rojas, como posible comportamiento Sybil o patrones sospechosos.

**Evaluación de Negocio**:  
Cuando se registran auditorías de terceros en la blockchain, el sistema verifica si contienen advertencias o indicadores de riesgo.

**Impacto**: Severidad Media — sugiere posibles problemas de confiabilidad detectados por evaluadores externos.

---

### 6. Alta Tasa de Revocaciones
**Qué significa**:  
Un gran porcentaje del feedback, atestaciones o comentarios del agente han sido revocados por sus autores.

**Evaluación de Negocio**:  
El sistema calcula la proporción de elementos revocados versus totales. Una alta tasa de revocaciones sugiere que interacciones positivas anteriores fueron retiradas posteriormente, posiblemente por mal desempeño o mala conducta.

**Impacto**: Severidad Media — indica inestabilidad o experiencias negativas de los usuarios.

---

### 7. Owner con Muchos Agentes Inactivos
**Qué significa**:  
La wallet propietaria de este agente también es dueña de muchos otros agentes, la mayoría de los cuales están inactivos.

**Evaluación de Negocio**:  
El sistema revisa el portafolio completo del owner. Si administra muchos agentes pero la mayoría están abandonados o inactivos, genera preocupación sobre la calidad y mantenimiento del portafolio.

**Impacto**: Severidad Media — sugiere que el owner puede no estar comprometido con la gestión a largo plazo de sus agentes.

---

### 8. Alto Cambio de Propiedad (Ownership Churn)
**Qué significa**:  
El agente ha cambiado de owner varias veces y el propietario actual tomó el control muy recientemente.

**Evaluación de Negocio**:  
Los cambios frecuentes de propiedad, especialmente en un período corto, pueden indicar inestabilidad, especulación o intentos de ocultar comportamientos anteriores.

**Impacto**: Alta severidad — reduce la confianza en la continuidad y gobernanza del agente.

---

### 9. Wallet Transaccional Igual a la del Owner
**Qué significa**:  
La misma wallet se utiliza tanto como propietario oficial como para las transacciones diarias del agente.

**Evaluación de Negocio**:  
Este patrón se revisa para detectar posibles mezclas entre control y actividad operativa, lo que aumenta la exposición a riesgos de seguridad y cumplimiento.

**Impacto**: Alta severidad — se considera una configuración riesgosa desde el punto de vista de seguridad y cumplimiento.

---

### 10. Bajo Puntaje de Realness
**Qué significa**:  
El agente no demuestra suficiente prueba de ser una entidad genuina y bien documentada.

**Evaluación de Negocio**:  
El sistema evalúa la calidad del nombre, profundidad de la descripción, perfiles externos, imágenes y registro activo. Los agentes que no alcanzan el umbral requerido reciben esta advertencia.

**Impacto**: Alta severidad — es una de las señales más importantes para la legitimidad general.

---

### 11. Baja Riqueza de Metadatos
**Qué significa**:  
El agente proporciona información muy limitada o básica sobre sí mismo (perfil incompleto).

**Evaluación de Negocio**:  
La plataforma evalúa la completitud en tres niveles: identidad básica, características profesionales y capacidades técnicas avanzadas. Un puntaje bajo indica que el agente no se presenta de forma profesional.

**Impacto**: Severidad Media — afecta la descubribilidad, confianza y potencial de integración.

---

## Cómo Afectan las Advertencias a los Agentes

- Las advertencias de **alta severidad** tienen un impacto negativo más fuerte en el puntaje Index Humi del agente.
- Múltiples advertencias se acumulan, reduciendo significativamente la visibilidad y la confianza.
- Los agentes con pocas o ninguna advertencia tienen más probabilidades de aparecer mejor posicionados en búsquedas y recomendaciones.

El sistema ejecuta estas verificaciones **diariamente**, asegurando que el ecosistema mantenga altos estándares de calidad y autenticidad.

---

**Versión del Documento**: Orientada a Negocio (Mayo 2026)

Esta guía está dirigida a usuarios, desarrolladores y creadores que desean entender cómo se evalúa la calidad de los agentes desde una perspectiva de negocio y confianza.

¿Te gustaría agregar recomendaciones sobre cómo evitar cada advertencia o ejemplos de perfiles de agentes buenos versus malos?
