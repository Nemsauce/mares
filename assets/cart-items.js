/* cart-items.js: <cart-items> upgrades the cart page forms of sections/main-cart.liquid
   (docs/BUILD.md section 5). Lines, subtotal and empty state always come back server
   rendered: every request carries `sections`, and the returned section HTML replaces the
   element's content. Money is never formatted here.

   - Quantity: on change (or the "Actualizar carrito" submit) the inputs that differ from
     what the server rendered go to /cart/update.js by line key. An input the browser
     considers invalid (min="1") is left for the native validation message, as without JS.
   - Remove: the remove link goes to /cart/change.js with quantity 0, by line key.
   Each change is announced once, naming the line. Focus returns to the same control on
   the same line, or to the line that took its place, or to the cart heading when the cart
   is empty. A typed but unsaved order note survives the re-render.

   A 422 or a network failure shows text on the line (next to its controls) and is
   announced. Any other failure falls back to what the link or form does without JS.
   Without this script (or window.Mares) the form posts to /cart and the remove link loads
   /cart/change, exactly as before. */

// Wrapped so nothing here becomes a global; the only global is window.Mares (core.js).
(() => {
  class CartItems extends HTMLElement {
    connectedCallback() {
      if (!window.Mares || !this.dataset.sectionId) return;
      this.abort = new AbortController();
      const { signal } = this.abort;

      this.addEventListener(
        'change',
        (event) => {
          if (event.target.matches('[data-line-quantity]')) this.updateQuantities();
        },
        { signal }
      );
      this.addEventListener(
        'submit',
        (event) => {
          if (!event.target.matches('[data-cart-update]')) return;
          event.preventDefault();
          this.updateQuantities();
        },
        { signal }
      );
      this.addEventListener(
        'click',
        (event) => {
          const link = event.target.closest('[data-line-remove]');
          if (!link) return;
          event.preventDefault();
          this.removeLine(link);
        },
        { signal }
      );
    }

    disconnectedCallback() {
      if (this.abort) this.abort.abort();
      if (this.pending) this.pending.abort();
    }

    updateQuantities() {
      const updates = {};
      const changed = [];
      this.querySelectorAll('[data-line-quantity]').forEach((input) => {
        const line = input.closest('[data-line-key]');
        if (!line || input.value === input.defaultValue || !input.checkValidity()) return;
        updates[line.dataset.lineKey] = Number(input.value);
        changed.push({ line, quantity: input.value });
      });
      if (!changed.length) return;

      const [first] = changed;
      const text =
        changed.length === 1
          ? this.text('quantityText', first.line).replace('[quantity]', first.quantity)
          : this.dataset.updatedText;
      const form = this.querySelector('[data-cart-update]');
      this.send('update', { updates }, first.line, text, () => HTMLFormElement.prototype.submit.call(form));
    }

    removeLine(link) {
      const line = link.closest('[data-line-key]');
      if (!line) return;
      const body = { id: line.dataset.lineKey, quantity: 0 };
      this.send('change', body, line, this.text('removedText', line), () => window.location.assign(link.href));
    }

    text(name, line) {
      return (this.dataset[name] || '').replace('[product]', line.dataset.lineTitle || '');
    }

    async send(method, body, line, text, fallback) {
      const { Mares } = window;
      const { sectionId } = this.dataset;
      if (this.pending) this.pending.abort();
      const request = new AbortController();
      this.pending = request;
      this.setAttribute('aria-busy', 'true');
      this.showError(null);

      let cart;
      try {
        cart = await Mares.cart[method](
          { ...body, sections: [sectionId], sections_url: window.location.pathname },
          request.signal
        );
      } catch (error) {
        if (error.aborted) return;
        if (error.status !== 422 && error.status !== 0) {
          fallback();
          return;
        }
        if (error.status === 422) this.resetQuantities();
        const message = error.status === 422 ? this.dataset.stockErrorText : this.dataset.errorText;
        this.showError(line, message);
        Mares.announce(message);
        Mares.emit(Mares.events.error, { error });
        return;
      } finally {
        if (this.pending === request) {
          this.pending = null;
          this.removeAttribute('aria-busy');
        }
      }

      const html = cart.sections && cart.sections[sectionId];
      const fresh = html && new DOMParser().parseFromString(html, 'text/html').querySelector('cart-items');
      const { sections, ...state } = cart;
      if (!fresh) {
        // The cart did change; only the HTML is missing. A reload shows the true state.
        window.location.reload();
        return;
      }

      this.render(fresh);
      Mares.announce(text);
      Mares.emit(Mares.events.updated, { cart: state });
    }

    render(fresh) {
      const active = document.activeElement;
      const focused = active && this.contains(active) ? this.locate(active) : null;
      const note = this.querySelector('textarea[name="note"]');
      const noteValue = note && note.value;

      this.replaceChildren(...fresh.childNodes);

      const nextNote = this.querySelector('textarea[name="note"]');
      if (nextNote && note) nextNote.value = noteValue;
      if (focused) this.restoreFocus(focused);
    }

    // Where focus was, described by line key, line position and the kind of control.
    locate(element) {
      const line = element.closest('[data-line-key]');
      const hooks = ['[data-line-quantity]', '[data-line-remove]', 'a[href]', '[type="submit"]', 'textarea'];
      return {
        key: line && line.dataset.lineKey,
        index: Array.from(this.querySelectorAll('[data-line-key]')).indexOf(line),
        hook: hooks.find((hook) => element.matches(hook)),
      };
    }

    restoreFocus({ key, index, hook }) {
      const lines = Array.from(this.querySelectorAll('[data-line-key]'));
      let target = null;
      if (index > -1) {
        const line = lines.find((item) => item.dataset.lineKey === key) || lines[Math.min(index, lines.length - 1)];
        target = line && hook && line.querySelector(hook);
      } else if (hook) {
        target = this.querySelector(hook);
      }
      target = target || document.querySelector('[data-cart-heading]');
      if (target) target.focus();
    }

    resetQuantities() {
      this.querySelectorAll('[data-line-quantity]').forEach((input) => {
        input.value = input.defaultValue;
      });
    }

    // Text on the line, next to its controls; never color alone. null clears every line.
    showError(line, message) {
      this.querySelectorAll('[data-line-error]').forEach((box) => {
        const show = Boolean(line && message && line.contains(box));
        box.hidden = !show;
        const slot = box.querySelector('[data-line-error-text]');
        if (slot) slot.textContent = show ? message : '';
      });
    }
  }

  if (!customElements.get('cart-items')) {
    customElements.define('cart-items', CartItems);
  }
})();
