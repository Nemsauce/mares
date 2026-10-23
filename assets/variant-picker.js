/* variant-picker.js: <variant-picker> upgrades the GET form of blocks/variant-picker.liquid
   (docs/THEME_PLAN.md section 5). A chip still submits the form; the script takes that
   submit, fetches the product section for the chosen variant through the Section Rendering
   API (?variant=ID&section_id=...) and swaps in the server-rendered parts:
     - the price block (all money stays server formatted),
     - the buy region [data-variant-region] (button, sold-out text, hidden variant id),
     - the picker's own form (selected chip, sold-out notes for the new combination),
     - the disabled state of the quantity input.
   Then it updates the address bar with replaceState, so reload and sharing keep the variant,
   puts focus back on the chosen chip and announces the change once.

   Without the script, without window.Mares, or in a browser without SubmitEvent.submitter,
   the form submits as before and the page reloads as ?variant=ID. If the fetch fails the
   script does that same navigation itself. */

// Wrapped so nothing here becomes a global; the only global is window.Mares (core.js).
(() => {
  // blocks/product-price.liquid has no data hook and was out of scope for this change, so its
  // block class is the selector. Replace with a data attribute when that block is next edited.
  const PRICE = '.product-price';

  class VariantPicker extends HTMLElement {
    connectedCallback() {
      this.section = this.closest('[data-section-id]');
      const submitter = typeof SubmitEvent === 'function' && 'submitter' in SubmitEvent.prototype;
      if (!this.section || !this.querySelector('form') || !window.Mares || !submitter) return;

      this.abort = new AbortController();
      // Listening on the element, not the form: the form is replaced on every change.
      this.addEventListener('submit', (event) => this.onSubmit(event), { signal: this.abort.signal });
    }

    disconnectedCallback() {
      if (this.abort) this.abort.abort();
      if (this.pending) this.pending.abort();
    }

    onSubmit(event) {
      const chip = event.submitter;
      if (!chip || chip.name !== 'variant' || !chip.value) return;
      event.preventDefault();
      this.select(chip);
    }

    async select(chip) {
      const { Mares } = window;
      const variant = chip.value;
      const index = Array.from(this.querySelectorAll('button')).indexOf(chip);
      const value = chip.textContent.trim();
      const form = this.querySelector('form');

      const page = new URL(form.action, window.location.href);
      page.searchParams.set('variant', variant);
      const url = new URL(page);
      url.searchParams.set('section_id', this.section.dataset.sectionId);

      if (this.pending) this.pending.abort();
      const request = new AbortController();
      this.pending = request;
      this.setAttribute('aria-busy', 'true');

      let fresh;
      try {
        const doc = await Mares.fetchHtml(url, { signal: request.signal });
        fresh = doc.querySelector('[data-section-id]');
        if (!fresh) throw new Error('Section not found');
      } catch (error) {
        if (error.aborted) return;
        window.location.assign(page);
        return;
      } finally {
        if (this.pending === request) {
          this.pending = null;
          this.removeAttribute('aria-busy');
        }
      }

      this.swap(fresh);

      const current = new URL(window.location.href);
      current.searchParams.set('variant', variant);
      window.history.replaceState(window.history.state, '', current);

      // Same product, same options: the chosen chip is at the same position in the new form.
      const target = this.querySelectorAll('button')[index];
      if (target) target.focus();

      Mares.announce(this.describe(value));
    }

    swap(fresh) {
      const replace = (selector) => {
        const old = this.section.querySelector(selector);
        const next = fresh.querySelector(selector);
        if (old && next) old.replaceWith(next);
      };

      replace(PRICE);
      this.section.querySelectorAll('[data-variant-region]').forEach((region) => {
        replace(`[data-variant-region="${region.dataset.variantRegion}"]`);
      });

      const nextForm = fresh.querySelector('variant-picker form');
      if (nextForm) this.querySelector('form').replaceWith(nextForm);

      this.section.querySelectorAll('input[name="quantity"]').forEach((input) => {
        const next = input.id && fresh.querySelector(`#${CSS.escape(input.id)}`);
        if (next) input.disabled = next.disabled;
      });
    }

    // "Seleccionaste M. Precio $89.900", plus "Agotado" when the new variant is sold out.
    // Read after the swap, from the server-rendered parts now on the page; never formatted here.
    describe(value) {
      const parts = [(this.dataset.selectedText || '').replace('[value]', value)];
      const price = this.section.querySelector(PRICE);
      if (price) parts.push(price.textContent.replace(/\s+/g, ' ').trim());
      const buy = this.section.querySelector('[data-variant-region] [type="submit"]');
      if (buy && buy.disabled && this.dataset.soldOutText) parts.push(this.dataset.soldOutText);
      return parts.filter(Boolean).join('. ');
    }
  }

  if (!customElements.get('variant-picker')) {
    customElements.define('variant-picker', VariantPicker);
  }
})();
