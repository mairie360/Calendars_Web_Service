const focusableSelector = 'a[href],button,input:not([type="hidden"]),select,textarea,[tabindex]';

/** Keep the published modal's changing contents inside one consumer-owned focus session. */
export function manageCalendarModalFocus(container: HTMLElement) {
  const doc = container.ownerDocument;
  const win = doc.defaultView;
  if (!win) return () => {};
  const opener = doc.activeElement instanceof win.HTMLElement ? doc.activeElement : null;
  const previousTabIndex = new Map<HTMLElement, string | null>();
  const dialog = () => container.querySelector<HTMLElement>('[role="dialog"]');
  const available = (element: HTMLElement) => {
    const style = win.getComputedStyle(element);
    return element.isConnected && !element.matches(':disabled') &&
      !element.closest('[hidden],[inert],[aria-hidden="true"]') &&
      style.display !== 'none' && style.visibility !== 'hidden' && element.getClientRects().length > 0;
  };
  const controls = (modal: HTMLElement) => Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector))
    .filter(element => element.tabIndex >= 0 && available(element));
  const prepare = (modal: HTMLElement) => {
    if (!previousTabIndex.has(modal)) previousTabIndex.set(modal, modal.getAttribute('tabindex'));
    modal.tabIndex = -1;
  };
  const focusInside = () => {
    const modal = dialog();
    if (!modal) return;
    prepare(modal);
    const active = doc.activeElement;
    if (active instanceof win.HTMLElement && modal.contains(active) && available(active)) return;
    (controls(modal)[0] ?? modal).focus();
  };
  const handleTab = (event: KeyboardEvent) => {
    if (event.defaultPrevented || event.isComposing || event.key !== 'Tab') return;
    const modal = dialog();
    if (!modal) return;
    const items = controls(modal);
    const first = items[0];
    const last = items[items.length - 1];
    const active = doc.activeElement;
    if (!first) {
      event.preventDefault();
      modal.focus();
    } else if (!modal.contains(active) || active === modal || (event.shiftKey && active === first)) {
      event.preventDefault();
      (event.shiftKey ? last : first).focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  };
  // Escape belongs to the existing modal callbacks, including their saving guard.
  const observer = new win.MutationObserver(focusInside);
  container.addEventListener('keydown', handleTab);
  doc.addEventListener('focusin', focusInside);
  observer.observe(container, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled', 'hidden', 'aria-hidden'] });
  focusInside();
  return () => {
    observer.disconnect();
    container.removeEventListener('keydown', handleTab);
    doc.removeEventListener('focusin', focusInside);
    for (const [modal, value] of previousTabIndex) {
      if (value === null) modal.removeAttribute('tabindex');
      else modal.setAttribute('tabindex', value);
    }
    // Do not steal focus from an intentional destination after navigation.
    if (doc.activeElement !== doc.body && !container.contains(doc.activeElement)) return;
    const target = opener && available(opener) ? opener :
      doc.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (target && available(target)) target.focus();
  };
}
