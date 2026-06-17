// Proxy de cotizaciones (Yahoo Finance) como función serverless de Vercel.
//
// Por qué existe: Yahoo no envía cabeceras CORS, así que el navegador no puede llamarlo
// directamente. Antes se usaban proxies CORS públicos (corsproxy.io, allorigins.win), que
// son lentos, poco fiables, ven tus símbolos y pueden desaparecer. Esta función los sustituye:
//
//  • Fiabilidad: la controlas tú, no un tercero gratuito.
//  • Privacidad: las peticiones salen del servidor, no del navegador del usuario.
//  • Escalabilidad: con `Cache-Control: s-maxage` la respuesta se cachea en el edge de Vercel,
//    así UNA descarga a Yahoo sirve a miles de usuarios. El coste y la carga no crecen con
//    el número de usuarios → listo para vender a mucha gente sin tocar la arquitectura.

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }

  const { symbol, range = '1d', interval = '1d' } = req.query || {};
  if (!symbol || !/^[A-Za-z0-9.\-=^]{1,20}$/.test(symbol)) {
    res.status(400).json({ error: 'symbol invalido' });
    return;
  }
  const ok = { '1m':1,'2m':1,'5m':1,'15m':1,'30m':1,'60m':1,'90m':1,'1h':1,'1d':1,'5d':1,'1wk':1,'1mo':1,'3mo':1 };
  const rg = { '1d':1,'5d':1,'1mo':1,'3mo':1,'6mo':1,'1y':1,'2y':1,'5y':1,'10y':1,'ytd':1,'max':1 };
  const iv = ok[interval] ? interval : '1d';
  const rn = rg[range] ? range : '1d';

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${rn}&interval=${iv}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (PatrimonioUnificado)' } });
    if (!r.ok) { res.status(r.status).json({ error: 'upstream ' + r.status }); return; }
    const data = await r.json();
    // Caché compartida en el edge: 60 s fresca + 5 min sirviendo la anterior mientras revalida.
    // CDN-Cache-Control controla específicamente el edge de Vercel (no lo sobrescribe la
    // plataforma); Cache-Control "public" se añade como respaldo para cachés intermedias.
    res.setHeader('CDN-Cache-Control', 'max-age=60, stale-while-revalidate=300');
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (e) {
    res.status(502).json({ error: 'fetch_failed' });
  }
};
