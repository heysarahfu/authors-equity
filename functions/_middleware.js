// authorsequitycatalog.com is a second custom domain on this SAME Cloudflare
// Pages project — bought specifically so the catalog could get its own URL
// without touching authorsequity.com's DNS (that domain also routes the
// business's email, so any DNS change there carries real risk). This
// middleware sends that domain's root request to /catalog/.
//
// A REAL redirect, not an internal rewrite: catalog/index.html's own load()
// deliberately derives its API call from location.pathname (see that
// function's comment) so it keeps working when reverse-proxied under
// /catalog/ elsewhere — an internal rewrite would serve the catalog's HTML
// at "/" while leaving the browser's location.pathname at "/", so that fetch
// would hit the wrong (nonexistent) path. Redirecting so the visible URL
// genuinely becomes /catalog/ keeps that assumption true, and means this
// middleware never has to know about the page's other relative requests
// (assets, the API, anything added later) — they all just resolve normally
// once the browser is actually sitting at /catalog/.
const CATALOG_HOSTS = new Set(['authorsequitycatalog.com', 'www.authorsequitycatalog.com']);

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.pathname !== '/' || !CATALOG_HOSTS.has(url.hostname)) return context.next();
  url.pathname = '/catalog/';
  return Response.redirect(url, 302);
}
