/* header-menu.js: <header-menu> opens a native <dialog> holding the header links, below
   1024px only (docs/THEME_PLAN.md section 5). The dialog gives focus handling and Escape
   for free, so there is no custom focus trap. Without this script the open button stays
   hidden and a <noscript> navigation is shown instead (see sections/header.liquid). */

class HeaderMenu extends HTMLElement {
  connectedCallback() {
    this.opener = this.querySelector('[data-menu-open]');
    this.closer = this.querySelector('[data-menu-close]');
    this.dialog = this.querySelector('dialog');
    if (!this.opener || !this.dialog || typeof this.dialog.showModal !== 'function') return;

    this.abort = new AbortController();
    const { signal } = this.abort;

    this.opener.addEventListener('click', () => this.open(), { signal });
    if (this.closer) this.closer.addEventListener('click', () => this.dialog.close(), { signal });
    this.dialog.addEventListener('close', () => this.handleClose(), { signal });

    // The dialog is mobile only: close it if the viewport grows to the desktop layout.
    this.desktop = window.matchMedia('(min-width: 1024px)');
    this.desktop.addEventListener(
      'change',
      (event) => {
        if (event.matches && this.dialog.open) this.dialog.close();
      },
      { signal }
    );

    this.opener.hidden = false;
  }

  disconnectedCallback() {
    if (this.abort) this.abort.abort();
  }

  open() {
    this.dialog.showModal();
    this.opener.setAttribute('aria-expanded', 'true');
  }

  // Runs for every way of closing: close button, Escape, or the viewport change above.
  // Some browsers do not focus a button on click, so focus is returned explicitly.
  handleClose() {
    this.opener.setAttribute('aria-expanded', 'false');
    this.opener.focus();
  }
}

if (!customElements.get('header-menu')) {
  customElements.define('header-menu', HeaderMenu);
}
