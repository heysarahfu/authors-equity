// Cloudflare Pages Function — server-side proxy to the ae-onix-feed worker's
// /catalog.json, so the FEED_KEY never ships in this site's client-side JS
// (view-source on a fully public catalog page would otherwise expose it).
//
// This project is deliberately a SEPARATE Cloudflare Pages project from
// aempdash — aempdash sits behind Cloudflare Access for the whole domain, and
// this catalog needs to be reachable by the public (readers, retailers,
// authorsequity.com/catalog). Keeping it a separate project means a
// misconfigured Access policy on one can never accidentally expose the other.
//
// Requires a Pages secret: FEED_KEY (same value as ae-onix-feed's FEED_KEY —
// see ae-onix-feed/COLLEAGUE-ACCESS.md). Set with:
//   wrangler pages secret put FEED_KEY --project-name <this-project>

const FEED_BASE = 'https://ae-onix-feed.sarah-33d.workers.dev';

export async function onRequestGet(context) {
  const { env } = context;
  const cors = { 'Access-Control-Allow-Origin': '*' };

  if (!env.FEED_KEY) {
    return new Response(JSON.stringify({ error: 'FEED_KEY is not configured on this Pages project yet' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    const upstream = await fetch(`${FEED_BASE}/catalog.json?key=${encodeURIComponent(env.FEED_KEY)}`, {
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: `Upstream feed returned ${upstream.status}` }), {
        status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    const body = await upstream.text();
    return new Response(body, {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=300' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err && err.message || err) }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}
