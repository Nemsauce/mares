/* product-form.js: <product-form> upgrades the add to cart form in blocks/buy-buttons.liquid
   (docs/THEME_PLAN.md section 5). It posts the same form data to /cart/add.js instead of
   loading the cart page, announces the result once and dispatches mares:cart:updated.

   While the request is pending the button gets aria-disabled and the loading look of
   snippets/button.liquid; it stays in the tab order and a second activation is ignored.
   A 422 (not enough stock) and a network failure show text next to the button and are
   announced. Any other failure falls back to the native form post, so Shopify's own
   response takes over. Without this script (or without window.Mares) the form posts to
   /cart/add exactly as it does with no JavaScript. */

// Wrapped so nothing here becomes a global; the only global is window.Mares (core.js).
(() => {
  class ProductForm extends HTMLElement {
    connectedCallback() {
      this.form = this.querySelector('form');
      this.button = this.form && this.form.querySelector('[type="submit"]');
      this.message = this.querySelector('[data-form-error]');
      if (!this.form || !this.button || !window.Mares) return;

      this.abort = new AbortController();
      this.form.addEventListener('submit', (event) => this.onSubmit(event), { signal: this.abort.signal });
    }

    disconnectedCallback() {
      if (this.abort) this.abort.abort();
      if (this.pending) this.pending.abort();
    }

    onSubmit(event) {
      event.preventDefault();
      if (this.pending || this.button.disabled) return;
      this.add();
    }

    async add() {
      const { Mares } = window;
      const request = new AbortController();
      this.pending = request;
      this.setLoading(true);
      this.showError('');

      try {
        // FormData includes the quantity input that joins the form through form="...".
        await Mares.cart.add(new FormData(this.form), request.signal);
      } catch (error) {
        this.finish();
        if (error.aborted) return;
        if (error.status === 422 || error.status === 0) {
          const text = error.status === 422 ? this.dataset.stockErrorText : this.dataset.errorText;
          this.showError(text);
          Mares.announce(text);
          Mares.emit(Mares.events.error, { error });
          return;
        }
        HTMLFormElement.prototype.submit.call(this.form);
        return;
      }

      this.finish();
      Mares.announce(this.dataset.addedText);

      // /cart/add.js returns the added line, not the cart, so the cart is read once more.
      // If that read fails the item is still in the cart; only the header count waits.
      try {
        const cart = await Mares.cart.get();
        Mares.emit(Mares.events.updated, { cart });
      } catch (error) {
        Mares.emit(Mares.events.error, { error });
      }
    }

    finish() {
      this.pending = null;
      this.setLoading(false);
    }

    setLoading(loading) {
      this.button.classList.toggle('button--loading', loading);
      if (loading) {
        this.button.setAttribute('aria-disabled', 'true');
        this.button.insertAdjacentHTML(
          'beforeend',
          '<span class="button__spinner" aria-hidden="true" data-loading></span><span class="visually-hidden" data-loading></span>'
        );
        this.button.lastElementChild.textContent = this.dataset.loadingText || '';
      } else {
        this.button.removeAttribute('aria-disabled');
        this.button.querySelectorAll('[data-loading]').forEach((node) => node.remove());
      }
    }

    // The message is text next to the button, never color alone, and describes the button.
    showError(text) {
      if (!this.message) return;
      this.message.textContent = text;
      this.message.hidden = !text;
      if (text) this.button.setAttribute('aria-describedby', this.message.id);
      else this.button.removeAttribute('aria-describedby');
    }
  }

  if (!customElements.get('product-form')) {
    customElements.define('product-form', ProductForm);
  }
})();
