/* featured-tabs.js: <featured-tabs> filters the cards of the featured collection by product
   type (sections/featured-collection.liquid, show_tabs). No page reload.

   The chips are toggle buttons (aria-pressed), so Tab, Enter and Space work with no key
   handling here. Without this script the chip row stays hidden and every product shows.
   Each card carries data-type (the type's handle); "all" shows the first data-limit cards
   of the collection and a type shows the first data-limit cards of that type. After a change
   the number shown is announced through Mares.announce (core.js), once. */

class FeaturedTabs extends HTMLElement {
  connectedCallback() {
    this.tabs = this.querySelector('[data-tabs]');
    this.list = this.querySelector('[data-tabs-list]');
    if (!this.tabs || !this.list) return;

    this.items = Array.from(this.list.children);
    this.buttons = Array.from(this.tabs.querySelectorAll('[data-tab]'));
    this.limit = parseInt(this.dataset.limit, 10) || this.items.length;
    this.columns = parseInt(this.dataset.columns, 10) || 4;

    this.abort = new AbortController();
    this.tabs.addEventListener(
      'click',
      (event) => {
        const button = event.target.closest('[data-tab]');
        if (button) this.select(button.dataset.tab, true);
      },
      { signal: this.abort.signal }
    );

    this.select('all', false);
    this.tabs.hidden = false;
  }

  disconnectedCallback() {
    if (this.abort) this.abort.abort();
  }

  select(tab, announce) {
    let shown = 0;
    this.items.forEach((item) => {
      const show = (tab === 'all' || item.dataset.type === tab) && shown < this.limit;
      item.hidden = !show;
      if (show) shown += 1;
    });

    this.buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.tab === tab));
    });

    // Fewer cards than columns stay centered (section-featured-collection.css).
    this.list.style.setProperty('--fc-count', Math.min(shown, this.columns));
    // On a phone the row scrolls sideways: start again from the first card.
    this.list.scrollLeft = 0;

    if (announce && window.Mares) {
      const text = this.getAttribute(shown === 1 ? 'data-text-one' : 'data-text-other');
      if (text) window.Mares.announce(text.replace('[count]', shown));
    }
  }
}

if (!customElements.get('featured-tabs')) {
  customElements.define('featured-tabs', FeaturedTabs);
}
