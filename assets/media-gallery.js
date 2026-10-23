/* media-gallery.js: <media-gallery> keeps gallery thumbnails in step with the scroll-snap
   strip of sections/main-product.liquid (docs/THEME_PLAN.md section 5). The strip scrolls
   and snaps with CSS alone; this script only marks the thumbnail of the visible slide with
   aria-current and scrolls the strip, not the page, when a thumbnail is chosen.

   Hooks: slides are [data-gallery-slide] with an id; a thumbnail is a link
   [data-gallery-thumb] whose href is "#" + that id, so without JS it is a plain in-page
   link to the slide. With no thumbnails, one slide, or no IntersectionObserver, the
   script does nothing and the gallery behaves exactly as without it. */

// Wrapped so nothing here becomes a global; the only global is window.Mares (core.js).
(() => {
  class MediaGallery extends HTMLElement {
    connectedCallback() {
      this.slides = Array.from(this.querySelectorAll('[data-gallery-slide]'));
      this.thumbs = Array.from(this.querySelectorAll('[data-gallery-thumb]'));
      if (this.slides.length < 2 || !this.thumbs.length || !('IntersectionObserver' in window)) return;

      this.observer = new IntersectionObserver((entries) => this.onIntersect(entries), {
        root: this.slides[0].parentElement,
        threshold: 0.6,
      });
      this.slides.forEach((slide) => this.observer.observe(slide));

      this.abort = new AbortController();
      this.addEventListener('click', (event) => this.onClick(event), { signal: this.abort.signal });
    }

    disconnectedCallback() {
      if (this.observer) this.observer.disconnect();
      if (this.abort) this.abort.abort();
    }

    onIntersect(entries) {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) this.setCurrent(visible.target.id);
    }

    onClick(event) {
      const thumb = event.target.closest('[data-gallery-thumb]');
      const slide = thumb && this.slideFor(thumb);
      if (!slide) return;
      event.preventDefault();
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      slide.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest', inline: 'start' });
      this.setCurrent(slide.id);
    }

    slideFor(thumb) {
      const id = decodeURIComponent((thumb.getAttribute('href') || '').slice(1));
      return this.slides.find((slide) => slide.id === id);
    }

    setCurrent(id) {
      this.thumbs.forEach((thumb) => {
        const slide = this.slideFor(thumb);
        if (slide && slide.id === id) thumb.setAttribute('aria-current', 'true');
        else thumb.removeAttribute('aria-current');
      });
    }
  }

  if (!customElements.get('media-gallery')) {
    customElements.define('media-gallery', MediaGallery);
  }
})();
