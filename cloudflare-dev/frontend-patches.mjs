// Compatibility fixes for the independent Cloudflare copy only.
// Keep source files consumed by GitHub Pages unchanged.
export function patchBookings(source) {
  const before = "function renderResults(){const root=$b('rides');if(!root)return;renderPassengerFilters();";
  const after = "function renderResults(){const root=$b('rides');if(!root)return;" +
    "if(!catalogReady){root.innerHTML='<p class=\"market-empty\">'+esc(catalogError||'Conectando a las salidas publicadas…')+'</p>';return;}" +
    'renderPassengerFilters();';
  if (source.split(before).length !== 2) {
    throw new Error('Cloudflare catalog loading patch requires source review');
  }
  return source.replace(before, after);
}
