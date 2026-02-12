/**
 * Minimal sanitization for strings used in DOM insertion / storage to reduce risk
 * - trims
 * - strips control chars
 * - limits length
 */
export function sanitizeString(input, maxLen = 1024) {
  if (input === null || input === undefined) return '';
  let s = String(input);
  // Remove non-printable control characters except newline/tab
  s = s.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]+/g, '');
  s = s.trim();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

// Escape text for safe HTML insertion (same logic used in index but centralised)
export function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (s) => {
    const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' };
    return map[s] || s;
  });
}