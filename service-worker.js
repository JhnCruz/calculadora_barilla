const CACHE_NAME = "calculadora-varilla-v9";
importScripts('./quantity.js');

const ASSETS = ['./', './index.html', './privacidad.html', './styles.css', './app.js', './manifest.json', './quantity.js', './widgets/column.json', './widgets/preview.png', './icons/icon.svg', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('calculadora-varilla-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method === 'POST' && url.href === new URL('./share-target', self.registration.scope).href) {
    event.respondWith(receiveCalculation(request));
    return;
  }
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.cache === 'no-store') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    if (request.mode === 'navigate') {
      try { const response = await fetch(request); if (response.ok && url.pathname === new URL('./', self.location).pathname) await cache.put('./', response.clone()); return response; }
      catch { return (await cache.match(request, {ignoreSearch:true})) || (await cache.match('./')) || (await cache.match('./index.html')); }
    }
    const cached = await cache.match(request);
    return cached || fetch(request);
  })());
});

const WIDGET_TAG = 'varilla-column';
const widgetState = new URL('./widgets/last-calculation', self.registration.scope);
const widgetTemplate = new URL('./widgets/column.json', self.registration.scope);
const widgetCache = 'varilla-widget-state-v1';

async function updateWidget(widget) {
  if (!self.widgets) return;
  widget ??= await self.widgets.getByTag(WIDGET_TAG);
  if (widget?.definition.tag !== WIDGET_TAG) return;
  const state = await (await caches.open(widgetCache)).match(widgetState);
  const data = state ? await state.text() : JSON.stringify({
    headline: 'Aún no hay cálculos',
    details: 'Guarda una estimación en Varilla para verla aquí.'
  });
  const template = await (await caches.open(CACHE_NAME)).match(widgetTemplate);
  if (template) await self.widgets.updateByTag(WIDGET_TAG, {template:await template.text(), data});
}

async function syncWidgetState(calculation) {
  const cache = await caches.open(widgetCache);
  if (calculation === null) {
    await cache.delete(widgetState);
  } else {
    const q = estimateColumn(calculation);
    const format = new Intl.NumberFormat('es-MX', {maximumFractionDigits: 4});
    await cache.put(widgetState, new Response(JSON.stringify({
      headline: `${format.format(q.steel)} cm² de acero`,
      details: `${q.width} × ${q.height} cm · cuantía ${q.percentage.toFixed(1)}%`
    })));
  }
  await updateWidget();
}

self.addEventListener('message', event => {
  if (event.data?.type !== 'varilla-widget-sync') return;
  event.waitUntil(syncWidgetState(event.data.calculation).catch(error => console.warn('Widget Varilla:', error)));
});
function refreshWidget(event) {
  event.waitUntil(updateWidget(event.widget).catch(error => console.warn('Widget Varilla:', error)));
}
self.addEventListener('activate', refreshWidget);
self.addEventListener('widgetinstall', refreshWidget);
self.addEventListener('widgetresume', refreshWidget);
self.addEventListener('widgetclick', event => {
  if (event.action === 'open-varilla') {
    event.waitUntil(self.clients.openWindow(new URL('#saved-calculations', self.registration.scope).href));
  }
});

async function receiveCalculation(request) {
  const destination = new URL('./', self.registration.scope);
  try {
    const form = await request.formData();
    const text = form.get('text');
    const file = form.get('calculation');
    let input = '';
    if (isColumnAction(form.get('url'))) {
      if (typeof text === 'string' && text.length <= 16384) {
        const payload = JSON.parse(text);
        input = payload?.medidas;
      }
    } else if (file && typeof file.text === 'function') {
      if (file.size <= 16384 && /\.txt$/i.test(file.name)) input = await file.text();
    } else {
      input = text;
    }
    const calculation = parseColumnText(input);
    if (!calculation) throw new Error('Formato de cálculo inválido');
    const {width,height,percentage} = calculation;
    // Solo las medidas validadas viajan en el fragmento; el texto nunca sale al servidor.
    destination.hash = new URLSearchParams({importar:'1',width,height,percentage}).toString();
  } catch {
    destination.hash = 'importar=error';
  }
  return Response.redirect(destination.href, 303);
}
