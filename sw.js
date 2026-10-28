/* Service worker do Leads e Campanhas — Kássila Nasser
 *
 * Existe para o navegador oferecer "Instalar app" e para guardar ícones e manifest.
 * NÃO guarda o index.html nem as chamadas da API: dado de lead sempre vem da rede.
 *
 * Leads, Recall e KN Vendas moram no MESMO domínio do GitHub Pages, e o cache do
 * navegador é por domínio. Por isso a limpeza só alcança caches com o prefixo deste app.
 */
const CACHE = 'kassila-leads-estatico-v1';
const PREFIXO = 'kassila-leads-';
const ESTATICOS = ['./manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-512-maskable.png', './apple-touch-icon.png', './favicon-32.png'];

self.addEventListener('install', function (evt) {
  evt.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ESTATICOS); })
    .then(function () { return self.skipWaiting(); }).catch(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (evt) {
  evt.waitUntil(caches.keys().then(function (nomes) {
    return Promise.all(nomes.filter(function (n) { return n.indexOf(PREFIXO) === 0 && n !== CACHE; })
      .map(function (n) { return caches.delete(n); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (evt) {
  const req = evt.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('config.js')) return;
  evt.respondWith(caches.match(req).then(function (hit) { return hit || fetch(req); }));
});
