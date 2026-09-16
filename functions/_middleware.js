// authorsequitycatalog.com is a second custom domain on this SAME Cloudflare
// Pages project — bought specifically so the catalog could get its own URL
// without touching authorsequity.com's DNS (that domain also routes the
// business's email, so any DNS change there carries real risk). This
// middleware rewrites that domain's root request into /catalog/ internally
// (no redirect — the URL bar stays on the custom domain), so visiting it
// shows the catalog directly instead of this project's main marketing
// homepage. Only the exact root path is rewritten; every other path
// (/assets/..., /catalog/api/..., favicons, etc.) passes through completely
// unchanged, since those already resolve correctly regardless of hostname.
const CATALOG_HOSTS = new Set(['authorsequitycatalog.com', 'www.authorsequitycatalog.com']);

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (url.pathname !== '/' || !CATALOG_HOSTS.has(url.hostname)) return context.next();
  url.pathname = '/catalog/';
  return fetch(new Request(url, request));
}
