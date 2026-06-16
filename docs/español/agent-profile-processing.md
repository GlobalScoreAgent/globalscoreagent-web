# Procesamiento de Perfiles de Agentes

El **Procesamiento de Perfiles de Agentes** es el mecanismo que utiliza Global Score Agent para mantener actualizada y confiable la información de cada agente registrado en la plataforma.

A medida que los agentes crecen en cantidad y complejidad, es común que su metadata provenga de diferentes fuentes (on-chain, feedback de usuarios, sistemas externos, etc.). Estas fuentes pueden tener información contradictoria, desactualizada o incompleta. 

Este proceso resuelve ese problema de forma automática, asegurando que los usuarios siempre vean la **información más confiable y actualizada** de cada agente.

## El Problema que Resuelve

Cuando un agente tiene información registrada en múltiples lugares, puede ocurrir que:

- Una fuente tenga un nombre o descripción más actualizada que otra.
- Existan datos contradictorios entre diferentes orígenes.
- Algunas fuentes sean más confiables que otras.

Sin un sistema claro, los usuarios podrían ver información inconsistente o poco confiable. El Procesamiento de Perfiles evita esto al establecer reglas claras de qué información debe mostrarse.

## Fuentes de Metadata de un Agente

Los agentes pueden recibir metadata de diferentes orígenes. Cada fuente tiene un nivel de prioridad diferente. A continuación se describen las principales fuentes que considera el sistema:

| Fuente                    | Descripción                                                                 | Tipo de Origen     | Nivel de Prioridad |
|---------------------------|-----------------------------------------------------------------------------|--------------------|--------------------|
| `feedback_did`            | Documento DID registrado a través del sistema de feedback                   | Feedback           | Alta               |
| `feedback`                | Datos generales del agente enviados mediante feedback                       | Feedback           | Alta               |
| `feedback_railway`        | Información procesada y enriquecida por el sistema Railway                  | Feedback           | Media-Alta         |
| `feedback_invariant`      | Datos considerados invariantes (poco cambiantes) del agente                 | Feedback           | Media              |
| `feedback_claw`           | Datos provenientes de la infraestructura Claw                               | Feedback           | Media              |
| `agent_uri_did`           | URI on-chain que contiene un documento DID firmado                          | On-chain           | Media-Baja         |
| `agent_uri`               | Metadata cruda obtenida directamente desde la URI registrada on-chain       | On-chain           | Baja               |

El sistema asigna un **nivel de prioridad** a cada fuente. Las fuentes con mayor prioridad (números más bajos) tienen preferencia al momento de consolidar la información del agente.

## Cómo Funciona (de forma simple)

El proceso sigue estos pasos para cada agente:

1. **Identifica todas las fuentes** disponibles para un agente.
2. **Ordena las fuentes por prioridad**: Se da preferencia a las fuentes más confiables.
3. **Selecciona la mejor información**: Para cada campo (nombre, descripción, imagen, servicios, tecnologías, etc.), se elige el valor de la fuente con mayor prioridad que tenga información válida.
4. **Genera un perfil consolidado**: Crea una versión única y autoritativa del agente.
5. **Actualiza la metadata**: Este proceso se ejecuta de forma periódica para mantener la información fresca.

## Beneficios para la Plataforma y los Usuarios

- **Mayor confiabilidad**: Los usuarios ven siempre la información más autoritativa disponible.
- **Datos más actualizados**: El sistema incorpora automáticamente nueva información sin intervención manual.
- **Consistencia**: Todos los agentes siguen el mismo proceso de consolidación.
- **Escalabilidad**: Es fácil incorporar nuevas fuentes de metadata en el futuro.
- **Mejor experiencia**: Los agentes aparecen con perfiles más completos, profesionales y confiables.

## Diferencia con el Metadata Richness

Este proceso **no calcula** el puntaje de riqueza de metadata (Metadata Richness Score). 

El Procesamiento de Perfiles se enfoca en **consolidar y priorizar** la información. El cálculo de qué tan completa y profesional es la metadata de un agente se realiza en un proceso separado, documentado en [Metadata Richness Analysis](./agent-metadata-richness-analysis.md).

---

*Documento técnico - Junio 2026*
