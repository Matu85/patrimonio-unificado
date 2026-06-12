# Patrimonio Unificado

Dashboard de patrimonio personal que unifica **broker (acciones/ETF) + fondos + cripto** en una sola vista, con precios en vivo, alertas de rebalanceo y resumen semanal.

🔗 **En vivo:** https://patrimonio-unificado.vercel.app

## Qué hace

- **Precios en vivo** — cripto vía CoinGecko, acciones/ETF vía Stooq, fondos por VNL manual (con *fallback* al último precio conocido).
- **Distribución** del patrimonio por clase (donut + leyenda).
- **Alertas de rebalanceo** — detecta cuándo una clase supera (vender) o queda por debajo (comprar) de su objetivo, con banda de tolerancia configurable.
- **Evolución semanal** — delta semana a semana del total y por clase.
- **Editor de cartera completo** — añade/elimina activos, define nombre, ticker, clase, fuente de precio y objetivos.
- **Vista previa del email semanal** con el delta.

## Privacidad / datos

No hay backend ni base de datos. **Cada visitante guarda su cartera en el `localStorage` de su propio navegador** — los datos nunca salen de tu dispositivo y nadie más los ve.

## Estructura

- `index.html` — la aplicación completa (HTML + CSS + JS, sin dependencias).
- `portfolio.json` *(local, no versionado — no se publica)* — configuración privada (incluye tu email) que usa una tarea local opcional para componer el resumen semanal.

## Tecnología

Sitio 100 % estático desplegado en Vercel. Sin build.
