// authorsequitycatalog.com is a second custom domain on this SAME Cloudflare
// Pages project — bought specifically so the catalog could get its own URL
// without touching authorsequity.com's DNS (that domain also routes the
// business's email, so any DNS change there carries real risk). This
// middleware serves the catalog at this domain's own root — no /catalog/ in
// the visible URL.
//
// An internal rewrite (not a redirect), so the address bar stays clean. That
// means catalog/index.html's own load() — which derives its API call from
// location.pathname, by design, so it keeps working when reverse-proxied
// under /catalog/ elsewhere (see that function's comment) — computes its
// fetch as "/api/catalog" here, since location.pathname stays "/". So this
// rewrites THAT path into the /catalog namespace too, not just "/". Shared
// static assets (/assets/...) are explicitly exempt and pass through
// unrewritten, since those already live at the true project root, not under
// /catalog/assets/.
const CATALOG_HOSTS = new Set(['authorsequitycatalog.com', 'www.authorsequitycatalog.com']);
const PASSTHROUGH_PREFIXES = ['/assets/', '/favicon'];

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  if (!CATALOG_HOSTS.has(url.hostname)) return context.next();
  if (url.pathname === '/catalog' || url.pathname.startsWith('/catalog/')) return context.next();
  if (PASSTHROUGH_PREFIXES.some(p => url.pathname.startsWith(p))) return context.next();
  url.pathname = '/catalog' + (url.pathname === '/' ? '/' : url.pathname);
  return fetch(new Request(url, request));
}
