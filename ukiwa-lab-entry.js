(() => {
  'use strict';

  const HOLD_MS = 1500;
  const brand = document.querySelector('.brand');
  if (!brand) return;

  let holdTimer = null;
  let consumed = false;
  let pointerDown = false;

  brand.style.webkitUserSelect = 'none';
  brand.style.userSelect = 'none';
  brand.style.webkitTouchCallout = 'none';

  function cancelHold() {
    pointerDown = false;
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  function openLab() {
    if (!pointerDown) return;
    consumed = true;
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }

    try {
      if (navigator.vibrate) navigator.vibrate([45, 35, 70]);
    } catch (_) {}

    const toast = document.createElement('div');
    toast.setAttribute('role', 'status');
    toast.textContent = '🛟 ひみつのうきわを見つけました';
    Object.assign(toast.style, {
      position: 'fixed',
      left: '50%',
      bottom: 'calc(84px + env(safe-area-inset-bottom, 0px))',
      transform: 'translateX(-50%) translateY(12px)',
      zIndex: '99999',
      maxWidth: 'calc(100vw - 32px)',
      padding: '12px 18px',
      borderRadius: '999px',
      background: 'rgba(4, 29, 53, .95)',
      color: '#fff',
      fontWeight: '900',
      fontSize: '14px',
      boxShadow: '0 16px 42px rgba(0,0,0,.28)',
      opacity: '0',
      transition: 'opacity .18s ease, transform .18s ease',
      pointerEvents: 'none',
      textAlign: 'center'
    });
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    setTimeout(() => {
      location.href = 'ukiwa-lab.html';
    }, 600);
  }

  brand.addEventListener('pointerdown', (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    pointerDown = true;
    consumed = false;
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = setTimeout(openLab, HOLD_MS);
  }, { passive: true });

  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
    brand.addEventListener(type, cancelHold, { passive: true });
  });

  brand.addEventListener('click', (event) => {
    if (!consumed) return;
    event.preventDefault();
    event.stopPropagation();
    consumed = false;
  }, true);

  brand.addEventListener('contextmenu', (event) => {
    if (pointerDown || holdTimer) event.preventDefault();
  });
})();
