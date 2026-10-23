/* reveal.js: elements marked [data-reveal] fade in and rise a little the first time they
   enter the viewport (docs/design/README.md, "Profundidad y movimiento").

   Progressive enhancement: the CSS starting state is fully visible. This script opts an
   element in by adding .reveal (hidden and lowered, base.css) and adds .is-revealed when
   it scrolls into view, once; then the element is no longer watched. So without this
   script, without IntersectionObserver, or if it fails, every element simply shows.

   Never touched:
     - anything already on screen, or above it, when the script runs (above the fold, or
       a page restored mid-scroll). The hero sections carry no [data-reveal] at all.
     - everything, under prefers-reduced-motion: reduce (base.css also keeps .reveal
       visible there).
     - everything, in the theme editor, where sections are re-rendered while editing.

   Several sections load this file; it runs once per page. */

(() => {
  const root = document.documentElement;
  if (root.hasAttribute('data-reveal-ready')) return;
  root.setAttribute('data-reveal-ready', '');

  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.Shopify && window.Shopify.designMode) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    },
    // Start once the element is a little way in, so the movement is seen.
    { rootMargin: '0px 0px -8% 0px' }
  );

  const fold = window.innerHeight;
  document.querySelectorAll('[data-reveal]').forEach((element) => {
    if (element.getBoundingClientRect().top < fold) return;
    element.classList.add('reveal');
    observer.observe(element);
  });
})();
