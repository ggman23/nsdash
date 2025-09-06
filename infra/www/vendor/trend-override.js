(function(){
  const FAST = 10;  // double flèche si |delta| >= FAST
  const FLAT = 2;   // flèche → si |delta| < FLAT

  function arrowFromDelta(d){
    d = Number(d);
    if (!isFinite(d)) return "→";
    if (d >= FAST)   return "↑↑";
    if (d <= -FAST)  return "↓↓";
    if (d >= FLAT)   return "↑";
    if (d <= -FLAT)  return "↓";
    return "→";
  }

  const targets = [
    "#trend-arrow", "#trend", ".trend .value", ".tile.trend .value",
    "#delta-arrow", ".delta .arrow", ".arrow-delta", '[data-role="trend"]'
  ];

  async function updateArrow(){
    try{
      const params = new URLSearchParams(location.search);
      const nsBase = (params.get("ns") || "/ns").replace(/\/$/,'');
      const resp   = await fetch(nsBase + "/api/v1/entries/sgv.json?count=2", {cache:"no-store"});
      const rows   = await resp.json();
      if (!rows || !rows.length) return;

      let delta = rows[0].delta;
      if (delta == null && rows[1] && rows[0].sgv != null && rows[1].sgv != null) {
        delta = Number(rows[0].sgv) - Number(rows[1].sgv);
      }
      const mark = arrowFromDelta(delta);

      targets.forEach(sel=>{
        document.querySelectorAll(sel).forEach(el => { el.textContent = mark; });
      });
    }catch(e){ /* silencieux */ }
  }

  window.addEventListener("DOMContentLoaded", ()=>{
    // Laisse le temps au reste de s’initialiser
    setTimeout(updateArrow, 300);
    // Et on rafraîchit périodiquement
    setInterval(updateArrow, 60000);
  });
})();
