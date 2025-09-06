(function(){
  const THRESH_SINGLE = 2;   // >=2 ou <=-2 -> flèche simple
  const THRESH_DOUBLE = 10;  // >=10 ou <=-10 -> double flèche
  function deltaToArrow(delta) {
    if (delta == null || isNaN(delta)) return "→";
    const d = Number(delta);
    if (d >= THRESH_DOUBLE) return "↑↑";
    if (d <= -THRESH_DOUBLE) return "↓↓";
    if (d >= THRESH_SINGLE) return "↑";
    if (d <= -THRESH_SINGLE) return "↓";
    return "→";
  }
  window.deltaToArrow = deltaToArrow;
  window.trendArrowFromDelta = deltaToArrow;
  window.NSDASH = window.NSDASH || {};
  window.NSDASH.trendFromDelta = deltaToArrow;
})();
