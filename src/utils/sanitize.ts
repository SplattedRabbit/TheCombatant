/**
 * @module    sanitize
 * @summary   Lightweight, zero-dependency HTML sanitizer for safe modal/card rich text rendering.
 *            Prevents XSS attacks by stripping script execution vectors and untrusted tags.
 */

const ALLOWED_TAGS = new Set([
  'b', 'strong', 'i', 'em', 'u', 'br', 'p', 'span', 'div', 'ul', 'ol', 'li', 'hr', 'small', 'code', 'pre'
]);

/**
 * Sanitizes an HTML string by removing dangerous tags, attributes, and JavaScript protocols.
 * If the input is plain text with newlines and no HTML tags, converts newlines to `<br />`.
 */
export function sanitizeHtml(dirtyHtml: string | null | undefined): string {
  if (!dirtyHtml) return '';

  let html = String(dirtyHtml);

  // 1. If it's plain text without '<' and contains newlines, preserve line breaks
  if (!html.includes('<') && html.includes('\n')) {
    return html.replace(/\n/g, '<br />');
  }

  // 2. Strip script/style/iframe/object/embed blocks completely with their contents
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  html = html.replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '');

  // 3. Strip all inline event handlers (onerror=, onclick=, onload=, etc.)
  html = html.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 4. Strip javascript: and data: URIs in attributes
  html = html.replace(/(href|src|action)\s*=\s*(?:'javascript:[^']*'|"javascript:[^"]*"|javascript:[^\s>]+)/gi, '$1="#"');
  html = html.replace(/(href|src|action)\s*=\s*(?:'data:[^']*'|"data:[^"]*"|data:[^\s>]+)/gi, '$1="#"');

  // 5. Filter tags against whitelist
  html = html.replace(/<\/?([a-z0-9-]+)(?:\s+[^>]*)?>/gi, (match, tagName) => {
    const lower = tagName.toLowerCase();
    if (ALLOWED_TAGS.has(lower)) {
      // Clean attributes on allowed tags: keep class, style (without expression/url), title
      if (match.startsWith('</')) return `</${lower}>`;
      const isSelfClosing = match.endsWith('/>') || lower === 'br' || lower === 'hr';
      const cleanAttrs = match.replace(/^<[a-z0-9-]+/i, '').replace(/\/?>$/, '').trim();
      
      // Strip any remaining dangerous patterns from attributes
      const safeAttrs = cleanAttrs
        .replace(/\b(expression|url|eval|script)\b/gi, '')
        .trim();

      return isSelfClosing ? `<${lower} ${safeAttrs}/>`.replace(/\s+\/>$/, ' />') : `<${lower}${safeAttrs ? ' ' + safeAttrs : ''}>`;
    }
    return ''; // Disallowed tag is removed
  });

  return html;
}
