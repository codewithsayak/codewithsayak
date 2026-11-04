export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try { await navigator.clipboard.writeText(text); return; } catch { /* Try the fallback. */ }
  }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
  const container = document.querySelector('dialog[open]') || document.body;
  const previousFocus = document.activeElement;
  container.appendChild(area);
  area.select();
  const copied = document.execCommand('copy');
  area.remove();
  previousFocus?.focus({ preventScroll: true });
  if (!copied) throw new Error('Clipboard unavailable');
}

export function formatIndiaTime(date = new Date()) {
  return new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: true }).format(date).toUpperCase();
}
