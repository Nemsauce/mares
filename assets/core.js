/* core.js: the only shared code, under the single global window.Mares (docs/BUILD.md
   section 5). Loaded first, with defer, from sections/header.liquid.

   - Mares.routes     read from the JSON script #mares-routes in layout/theme.liquid.
   - Mares.fetchJson  fetch with an AbortController (caller signal + timeout) that throws
     Mares.fetchHtml  one normalized error shape: { name: 'MaresError', status, aborted }.
                      status 0 = network failure or timeout; aborted = the caller cancelled.
   - Mares.cart       Shopify Ajax Cart API: get, add, change, update. Pass `sections` in the
                      body to get server-rendered HTML back (Section Rendering API), so money
                      is never formatted here.
   - Mares.announce   writes to the polite live region #live-region in layout/theme.liquid.
   - Mares.events     the two document events: updated ({ cart }) and error ({ error }).
                      Components never talk to each other except through these.

   Also here: the small listener that keeps the header cart count (snippets/cart-count.liquid)
   in step with mares:cart:updated.

   Without this file every component stays un-upgraded and every form posts as it does
   without JavaScript. */

(() => {
  if (window.Mares) return;

  const EVENTS = { updated: 'mares:cart:updated', error: 'mares:cart:error' };
  const TIMEOUT = 15000;

  const readRoutes = () => {
    try {
      return JSON.parse(document.getElementById('mares-routes').textContent);
    } catch (error) {
      return {};
    }
  };

  const routes = Object.assign(
    { root: '/', cart: '/cart', cartAdd: '/cart/add', cartChange: '/cart/change', cartUpdate: '/cart/update' },
    readRoutes()
  );

  const failure = (status, data, aborted) => {
    const error = new Error((data && (data.description || data.message)) || 'Request failed');
    error.name = 'MaresError';
    error.status = status;
    error.aborted = Boolean(aborted);
    return error;
  };

  // One request path for JSON and HTML. The caller's signal and the timeout both abort.
  const request = async (url, options, read) => {
    const { signal, timeout = TIMEOUT, headers, ...init } = options || {};
    const controller = new AbortController();
    const cancel = () => controller.abort();
    if (signal) {
      if (signal.aborted) cancel();
      else signal.addEventListener('abort', cancel, { once: true });
    }
    const timer = setTimeout(cancel, timeout);
    try {
      const response = await fetch(url, {
        credentials: 'same-origin',
        ...init,
        headers: { 'X-Requested-With': 'XMLHttpRequest', ...headers },
        signal: controller.signal,
      });
      let data = null;
      try {
        data = await read(response);
      } catch (error) {
        if (response.ok) throw failure(response.status, null, false);
      }
      if (!response.ok) throw failure(response.status, data, false);
      return data;
    } catch (error) {
      if (error.name === 'MaresError') throw error;
      throw failure(0, null, Boolean(signal && signal.aborted));
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener('abort', cancel);
    }
  };

  const fetchJson = (url, options) =>
    request(url, { ...options, headers: { Accept: 'application/json', ...(options && options.headers) } }, (r) => r.json());

  const fetchHtml = (url, options) =>
    request(url, options, async (r) => new DOMParser().parseFromString(await r.text(), 'text/html'));

  // body: a FormData (sent as is, so properties[...] keep working) or a plain object (JSON).
  const post = (route, body, signal) => {
    const form = body instanceof FormData;
    return fetchJson(`${routes[route]}.js`, {
      method: 'POST',
      body: form ? body : JSON.stringify(body),
      headers: form ? {} : { 'Content-Type': 'application/json' },
      signal,
    });
  };

  const cart = {
    get: (signal) => fetchJson(`${routes.cart}.js`, { signal }),
    add: (body, signal) => post('cartAdd', body, signal),
    change: (body, signal) => post('cartChange', body, signal),
    update: (body, signal) => post('cartUpdate', body, signal),
  };

  // Clearing first and writing a moment later makes a repeated message speak again. A newer
  // message replaces a pending one, so a burst of changes is announced once.
  let announceTimer;
  const announce = (text) => {
    const region = document.getElementById('live-region');
    if (!region || !text) return;
    clearTimeout(announceTimer);
    region.textContent = '';
    announceTimer = setTimeout(() => {
      region.textContent = text;
    }, 100);
  };

  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

  window.Mares = { routes, fetchJson, fetchHtml, cart, announce, events: EVENTS, emit };

  // Header cart count (snippets/cart-count.liquid). Only the number is written here; the
  // sentence comes from the server with [count] in place of it. Not announced: whoever
  // changed the cart already did.
  const plural = window.Intl && Intl.PluralRules ? new Intl.PluralRules(document.documentElement.lang || 'es') : null;
  document.addEventListener(EVENTS.updated, (event) => {
    const count = event.detail && event.detail.cart && event.detail.cart.item_count;
    if (typeof count !== 'number') return;
    const form = (plural ? plural.select(count) : count === 1 ? 'one' : 'other') === 'one' ? 'one' : 'other';
    document.querySelectorAll('[data-cart-count-label]').forEach((label) => {
      const text = label.getAttribute(`data-text-${form}`);
      if (text) label.textContent = text.replace('[count]', count);
    });
    document.querySelectorAll('[data-cart-count]').forEach((number) => {
      number.textContent = count;
      number.hidden = count === 0;
    });
  });
})();
