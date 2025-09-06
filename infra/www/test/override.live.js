(function(){
  const THRESH_SINGLE = 2;   // |Δ| >=2 => flèche simple
  const THRESH_DOUBLE = 10;  // |Δ| >=10 => flèche double
  const ARROWS = {up:"↑", down:"↓", flat:"→"};

  const leafs = () => [...document.querySelectorAll('body *')].filter(e => e.children.length === 0);

  function arrowForDelta(d){
    if (isNaN(d)) return ARROWS.flat;
    if (d >= THRESH_DOUBLE) return ARROWS.up+ARROWS.up;
    if (d <= -THRESH_DOUBLE) return ARROWS.down+ARROWS.down;
    if (d >= THRESH_SINGLE)  return ARROWS.up;
    if (d <= -THRESH_SINGLE) return ARROWS.down;
    return ARROWS.flat;
  }

  function parseDelta(){
    const el = leafs().find(e => /Δ\s*[-+]?\d+/.test(e.textContent));
    if (!el) return null;
    const m = el.textContent.match(/Δ\s*([-+]?\d+)/);
    return m ? parseInt(m[1],10) : null;
  }

  function updateArrow(){
    try {
      const d = parseDelta();
      if (d == null) return;
      const want = arrowForDelta(d);
      const el = leafs().find(e => /[↑↓→]/.test(e.textContent));
      if (el) el.textContent = el.textContent.replace(/[↑↓→]+/g, want);
    } catch(e){}
  }

  function updateClock(){
    try {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2,'0');
      const mm = String(now.getMinutes()).padStart(2,'0');
      const el = leafs().find(e => /^\s*\d{2}:\d{2}\s*$/.test(e.textContent));
      if (el) el.textContent = `${hh}:${mm}`;
    } catch(e){}
  }

  let majDate = null;
  function findMaj(){
    const el = leafs().find(e => /Maj:\s*\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}/.test(e.textContent));
    if (!el) return null;
    const m = el.textContent.match(/(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (!m) return null;
    const [_, dd, MM, yyyy, hh, mm, ss] = m;
    return new Date(`${yyyy}-${MM}-${dd}T${hh}:${mm}:${ss}`);
  }

  function updateAgo(){
    try {
      if (!majDate) majDate = findMaj();
      if (!majDate) return;
      const secs = Math.max(0, Math.floor((Date.now()-majDate.getTime())/1000));
      const mins = Math.floor(secs/60);
      const txt  = mins >= 1 ? `il y a ${mins}m` : `à l’instant`;
      const el = leafs().find(e => /(il y a\s*\d+m|à l’instant)/.test(e.textContent));
      if (el) el.textContent = txt;
    } catch(e){}
  }

  function tick(){ updateArrow(); updateClock(); updateAgo(); }
  setTimeout(tick, 800);
  setInterval(tick, 10000);
})();
