# Ocho meses de ERC-8004 en mainnet

ERC-8004 salió con tres registros: Identity, Reputation y Validation. Ocho meses después de las primeras identidades en mainnet, hay dos en producción. El tercero no.

Y lo que hay no se parece a un solo ecosistema. Si contás agentes, estás mirando sobre todo BNB. Si contás quién escribe reputation, estás mirando sobre todo Base. Si mezclás las dos cosas en un solo “¿cómo va ERC-8004?”, el corte desaparece.

Esto es un mapa de los dos registros que existen en producción. No es un ranking. Tampoco es el argumento de que más identidades = mercado más sano.

## Dos registros, no tres

El 19 de agosto de 2026:

| Medida | Cantidad |
|--------|--------:|
| Agentes (NFTs de Identity) | 410.793 |
| Owners distintos | 280.492 |
| Feedbacks vivos (no revocados) | 533.710 |
| Agentes con al menos un feedback vivo | 46.406 (11,3%) |

Son unos **1,46** agentes por owner. Los diez owners más grandes tienen **49.489** (**12,0%**). Uno solo tiene **13.419**.

Hay más de medio millón de feedbacks vivos. Casi nueve de cada diez agentes no tienen ninguno.

Validation está en el spec. No es un contrato en mainnet. No hay una serie en producción para contar.

## Cómo creció

De enero a mediados de agosto no fue una línea recta.

| Mes (UTC) | Agentes nuevos | Feedbacks vivos ese mes |
|-----------|---------------:|------------------------:|
| Enero 2026 | 22.695 | 504 |
| Febrero | 38.477 | 29.643 |
| Marzo | 74.806 | 80.101 |
| Abril | 35.725 | 63.120 |
| Mayo | 56.206 | 40.832 |
| Junio | 39.289 | **186.389** |
| Julio | **112.688** | 103.233 |
| Agosto (hasta el 19) | 30.907 | 29.888 |

Identity hizo pico en julio: ese mes minteó el **27,4%** de todos los agentes de este índice. Reputation hizo pico en junio. La ola de julio no trajo una ola equivalente de feedback.

También se movió el mapa. Enero fue **100% Ethereum L1** (22.695 agentes). Febrero lo lideró Base (21.641; 56% del mes), después BNB y Ethereum. Desde marzo, la mayor parte de las identidades nuevas aparecen en BNB (marzo 47.549 / 63,6% del mes; julio **90.803 / 80,6%**). Agosto, por ahora, es más lento — unos 1,6k agentes por día contra ~3,6k en julio — pero agosto no está cerrado, así que eso no es un pronóstico.

## Dónde viven las identidades no es donde se escribe reputation

| Chain | Agentes | % del stock | Feedbacks vivos | % de feedbacks | Agentes con ≥1 feedback | % de esa chain |
|-------|--------:|------------:|----------------:|---------------:|------------------------:|---------------:|
| BNB Chain | 269.734 | **65,7** | 29.507 | 5,5 | 4.336 | **1,6** |
| Base | 63.927 | **15,6** | 454.438 | **85,2** | 29.665 | **46,4** |
| Ethereum L1 | 50.251 | **12,2** | 3.211 | 0,6 | 1.665 | **3,3** |
| X Layer | 11.038 | 2,7 | 17.104 | 3,2 | 1.284 | 11,6 |
| Celo | 9.776 | 2,4 | 24.744 | 4,6 | 7.135 | **73,0** |
| Gnosis | 4.113 | 1,0 | 4.341 | 0,8 | 2.081 | 50,6 |
| Arbitrum | 1.335 | 0,3 | 122 | ~0 | 85 | 6,4 |
| Polygon | 619 | 0,2 | 243 | ~0 | 155 | 25,0 |
| **Total** | **410.793** | 100 | **533.710** | 100 | **46.406** | **11,3** |

Si contás agentes, describís **BNB**. Si contás feedback vivo, describís **Base**. Ethereum L1 es un tercer lugar real para identidad y casi no aparece en reputation. Celo se ve muy usado (el 73% de sus agentes tiene al menos un feedback vivo) porque hay pocos.

Los últimos 30 días (20 de julio → 19 de agosto) lo dejan más claro:

- **76.893** agentes nuevos: BNB **70,5%**, Ethereum L1 **17,7%**, Base **5,9%**, X Layer **5,6%**.
- **64.225** feedbacks vivos: Base **82,4%**, X Layer **17,2%**. **BNB: 0. Ethereum L1: 18.**

En esa ventana BNB sumó decenas de miles de identidades — **54.200** — y ningún evento nuevo de Reputation.

## Qué más hay en el conjunto

**149.339** agentes (**36,4%**) comparten el mismo nombre, descripción y URI con al menos otro, en **4.025** grupos. El más grande son **115.168** agentes: el **28,0%** de todo el índice. Eso es lo que se ve cuando hay plantillas y factories. No es, por sí solo, una prueba de Sybil.

Ethereum L1 sigue minteando. Es cerca del 12% del conjunto y cerca del 18% de las identidades nuevas de los últimos 30 días, pero apenas un 3% de los agentes ahí tiene algún feedback vivo. Una parte grande de esos registros L1 también parece metadata de test o de relleno (cerca del **60%** en Ethereum L1; en todo el índice, unos **14%** test y **8%** dummy). Eso es una lectura de metadata, no un veredicto sobre la chain.

Uno de cada tres agentes declara un service endpoint (**138.683 / 410.793 = 33,8%**). Un campo lleno no prueba que el endpoint responda.

Los tags de Reputation se usan. En su mayoría son nombres de producto. En un recorte anterior, había tags en cerca del 97% de los feedbacks; miner-vouch / botcoin concentraban cerca del 56,5% de esa masa; el vocabulario de method-strength era cerca del 0,02%. Los tags no reemplazan al registro Validation.

## Qué se puede leer

A ocho meses, ERC-8004 es un estándar de identidad que escaló, unido a una capa de reputation que no lo siguió, y al cual todavía le falta la capa de validación que nunca se desplegó.

Ese es el hecho central.

### Realidades diversas

El estándar presenta realidades diversas. BNB tiene dos tercios de las identidades y casi nada del feedback reciente. Base tiene cerca de un sexto de las identidades y el 85% del feedback vivo. Si contás agentes, hablás de BNB. Si contás reputation, hablás de Base. Son matices importantes en un entorno descentralizado que se pierden al agrupar totales de agentes y feedbacks — y que esconde una realidad que debería llamar la atención de quienes integran el ecosistema.

### Mintear un agente vs economía de agentes

Aunque en julio se creó más de un cuarto de cada identidad de este índice, sobre todo en BNB, eso no vino acompañado de un crecimiento equivalente de feedbacks. Los propios feedbacks habían hecho pico en otro mes: junio. En los 30 días siguientes, BNB sumó 54.200 identidades y cero eventos nuevos de reputation. Una ola de registros puede ser factories, airdrops, plantillas o experimentos. No es, por sí sola, evidencia de que los agentes se descubran, se contraten o se confíen.

### El problema de la diversidad

410.793 identidades suenan a una población grande, pero un análisis más profundo muestra patrones preocupantes. Una sola plantilla de metadata explica el 28% del conjunto. El 36% de los agentes comparte un triple nombre–descripción–URI completo. Diez owners tienen el 12% del stock. El registro se está usando, sí — pero también está concentrado. Quien use “número de agentes” como proxy de actores únicos está leyendo la capa más superficial del ecosistema, no la que da más información.

### ¿Dónde está la confianza?

A simple vista, más de medio millón de registros de reputación darían la impresión de que el estándar ya sirve para registrar cómo se perciben los agentes. Un nivel más abajo, los datos cuentan otra cosa:

1. Solo el 11,3% de los agentes tiene algún feedback vivo.
2. Solo el 33,8% declara siquiera un endpoint.
3. En la chain con más identidades, el 1,6% de los agentes fue reseñado.

Es normal en un estándar recién lanzado. También deja puntos de alerta para los próximos meses: ERC-8004 todavía tiene un largo recorrido si la meta es un registro compartido de reputación entre agentes que interactúan entre sí.

### Nuevas chains

En los últimos meses aparecieron chains con un perfil distinto. Celo tiene feedback en el 73% de sus agentes; Gnosis, en cerca de la mitad. Esas tasas son altas porque las poblaciones son chicas. Eso plantea una pregunta que puede definir el futuro del ecosistema: ¿esos porcentajes se deben al tamaño, o a comunidades más especializadas, con más tracción y mejor mentoria entre integrantes? ¿Apuntan a una distribución de agentes más nicho, chain por chain? Solo el tiempo lo dirá. Lo que estos datos sí muestran hoy es que cobertura y reputación pueden evolucionar en direcciones opuestas.

### Ethereum en tierra de nadie

El ecosistema nació en Ethereum en enero. A fines del verano es un venue minoritario de mint, casi sin feedback y con mucha metadata tipo test. Si Ethereum debía ser el sitio de referencia de calidad para agentes ERC-8004, ese objetivo no se está cumpliendo.

### ¿Dónde está la validación?

El estándar prometió un tercer registro para chequeos de terceros. Hasta que ese contrato esté en mainnet, “ecosistema ERC-8004” es identidad más la reputation que algunas chains se tomen el trabajo de escribir. Tags en los registros de reputation llenos con nombres de producto no cierran esa necesidad. Sin una herramienta centralizada, cada proyecto donde interactúan agentes está armando sus propias capas de validación. Eso no es necesariamente malo — pero confirma que ERC-8004 venía a ofrecer un registro compartido de todo el proceso de interacción entre agentes, y eso todavía no está.

### Conclusión

Los primeros ocho meses produjeron una capa de identidad grande y barata de mintear, una capa de reputation geográfica y temporalmente despegada de ese mint, y ninguna validación en producción. El estándar es real y ya es punto de partida para muchos proyectos. La pregunta que sigue no es si se mintean otras 100.000 identidades. Es si Reputation empieza a seguir a los mints nuevos — sobre todo en BNB — y si Validation llega a ser una serie de mainnet.

## Qué no muestra esto

- Que BNB sea “el” ecosistema ERC-8004, ni que Base sea “más real”. Muestra dos superficies distintas sobre el mismo estándar.
- Que julio haya sido adopción. Fue un pico de mint.
- Que el 36% de los agentes sean falsos. Plantillas, clones y factories comparten metadata.
- Que el feedback sea honesto, humano o útil. El volumen puede ser automático.
- Nada sobre Validation. El contrato no está en mainnet.
- Todos los deploys de ERC-8004: solo las ocho mainnets de este índice.
- Un agosto completo. No anualices un mes a medias.

## Cómo se cortaron estos números

De enero 2026 al 19 de agosto 2026, solo mainnet, en ocho chains EVM: Ethereum L1, Base, Polygon, BNB Chain, Arbitrum, Celo, Gnosis y X Layer. Afuera: testnets, Validation, y otros deploys que este índice no cubre (Avalanche, Scroll, Linea en exploradores de terceros, por ejemplo). “Creado” quiere decir que se minteó la identidad, no que el agente haya hecho trabajo útil.

Los conteos son NFTs de Identity y feedbacks de Reputation no revocados. Snapshot: 19 de agosto de 2026. Lecturas relacionadas, no republicadas acá: duplicados de metadata; agentes por chain; tags de feedback; service endpoints declarados.

Esta es una lectura de los registros ERC-8004 en mainnet, no un scorecard de producto.
