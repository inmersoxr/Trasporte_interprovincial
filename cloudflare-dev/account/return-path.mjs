// Only return to application screens, never to an external URL or an API.
export function returnPath(value) {
  if (typeof value !== 'string' || value.length > 1024 || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return null;
  try {
    const base = 'https://rutasec.invalid', target = new URL(value, base);
    if (target.origin !== base || !/^\/(standard|premium|miniapp|company|business|pilot|join)\//.test(target.pathname)) return null;
    return target.pathname + target.search + target.hash;
  } catch { return null; }
}
