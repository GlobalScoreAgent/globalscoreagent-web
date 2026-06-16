# Directorio de Agentes (Agents Directory)

La página **Directorio de Agentes** te permite buscar, filtrar y explorar todos los agentes registrados en la plataforma de forma visual y eficiente.

## Cómo funciona el Directorio de Agentes

Esta página muestra los agentes en formato de tarjetas. El listado **no carga todos los agentes de una sola vez**. 

Inicialmente se cargan entre **10 y 20 agentes**. A medida que el usuario se desplaza hacia abajo en la página, se van cargando automáticamente los siguientes grupos de agentes (carga por demanda o infinite scroll). Esto permite que la página cargue de forma rápida incluso cuando hay muchos agentes registrados.

![Agents Directory - Vista General](../../images/dashboard/agents-directory.png)

---

## Opciones de Búsqueda y Filtrado

En la parte superior tienes varias formas de buscar agentes:

### Búsqueda por Texto

Puedes buscar agentes utilizando los siguientes criterios:

| Tipo de búsqueda       | Dónde busca                                                                 | Cuándo usarlo |
|------------------------|-----------------------------------------------------------------------------|---------------|
| **General**            | Busca en nombre, descripción, capacidades, skills y servicios               | Búsqueda amplia y recomendada para empezar |
| **Name**               | Solo en el nombre del agente                                                | Cuando conoces el nombre exacto o parcial |
| **Wallet**             | En la dirección de la wallet del agente                                     | Para buscar agentes de una wallet específica |
| **Wallet Owner**       | En la wallet propietaria del agente                                         | Para ver todos los agentes de un owner |
| **Agent Identifier**   | En el ID del agente dentro de la chain                                      | Para buscar un agente por su ID on-chain |

### Filtros Avanzados

Además de la búsqueda por texto, puedes usar **Filtros Avanzados** para refinar tus resultados. Estos filtros incluyen categorías como:

- Dominios OASF (ámbitos temáticos del agente)
- Tags y categorías técnicas
- Habilidades específicas
- Tipos de servicios soportados
- Compatibilidad con protocolos (x402, MCP, A2A, etc.)
- Y muchas otras opciones avanzadas

Puedes combinar varios filtros al mismo tiempo para hacer búsquedas muy específicas.

**Tip**: Usa primero la búsqueda **General** y luego aplica filtros avanzados si necesitas mayor precisión.

---

## Tarjetas de Agentes

Cada agente se muestra en una tarjeta con la siguiente información:

- Imagen representativa del agente
- Nombre del agente
- Chain en la que está registrado (ej: Base, Arbitrum, etc.)
- Puntaje **HUMI**
- Badge de "STAR" (si aplica)

### Al hacer clic en una tarjeta

Al hacer clic sobre cualquier tarjeta, **la tarjeta se da vuelta** (efecto flip) y muestra un **resumen básico** del agente, que incluye:

- Información principal (nombre, chain, descripción corta)
- Puntaje HUMI actual
- Datos relevantes del agente

![Resumen Básico del Agente (Card Flip)](../../images/dashboard/agent-card-flip.png)

Si deseas ver **toda la información detallada** del agente (HUMI completo, WAMI, feedback, warnings, historial, etc.), haz clic en el botón **+** que aparece en el lateral de la tarjeta.

---

## Consejos de Uso

- Empieza siempre con la búsqueda **General** si no estás buscando algo muy específico.
- Usa los **filtros avanzados** cuando necesites encontrar agentes con características técnicas concretas.
- Los agentes con badge **STAR** suelen ser agentes destacados o de alta calidad.
- Puedes ordenar los resultados por **HUMI Index Score** (de mayor a menor) para ver primero los agentes con mejor reputación.
- El listado se carga de forma progresiva al desplazarte hacia abajo, por lo que no es necesario esperar a que carguen todos los agentes.

---

*Última actualización: Junio 2026*
