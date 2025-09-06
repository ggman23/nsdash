console.log('🚀 NSDASH-FIX DÉTECTION PRÉCISE DÉMARRÉ');

(function(){
  let dataHistory = [];
  let lastRealMeasureTime = null;
  let lastMajTimestamp = null;

  function parseTimestamp(majText) {
    const match = majText.match(/Maj:\s*(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/);
    if (!match) return null;
    const [_, dd, mm, yyyy, hh, min, ss] = match;
    return new Date(`${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}`);
  }

  function isRealCGMMeasurement(currentTimestamp, lastTimestamp) {
    if (!lastTimestamp) return true; // Première mesure
    
    const diffSeconds = (currentTimestamp - lastTimestamp) / 1000;
    const diffMinutes = diffSeconds / 60;
    
    // Vraie mesure CGM : ~5 minutes (280-320 secondes = 4min40s à 5min20s)
    // Rotation de fenêtre : ~1 minute (50-70 secondes)
    
    if (diffSeconds >= 280 && diffSeconds <= 320) {
      return true; // Vraie mesure CGM (~5 minutes)
    } else if (diffSeconds >= 50 && diffSeconds <= 70) {
      return false; // Rotation de fenêtre (~1 minute)
    } else {
      // Cas ambigus - on privilégie la sécurité
      console.log(`⚠️  Intervalle ambigu: ${Math.round(diffSeconds)}s (${Math.round(diffMinutes)}min)`);
      return diffSeconds > 200; // Seuil conservateur
    }
  }

  function logCurrentData(){
    try {
      const glucoseEl = [...document.querySelectorAll('*')].find(e => 
        e.children.length === 0 && 
        /^\d{2,3}$/.test(e.textContent) && 
        parseInt(e.textContent) >= 40 && parseInt(e.textContent) <= 400
      );
      
      const deltaEl = [...document.querySelectorAll('*')].find(e => 
        e.textContent && /Δ\s*[-+]?\d+/.test(e.textContent)
      );
      
      const majEl = [...document.querySelectorAll('*')].find(e => 
        e.children.length === 0 && 
        /^Maj:\s*\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(e.textContent.trim())
      );
      
      if (!glucoseEl || !deltaEl || !majEl) return;
      
      const glucose = parseInt(glucoseEl.textContent);
      const deltaMatch = deltaEl.textContent.match(/Δ\s*([-+]?\d+)/);
      const delta = deltaMatch ? parseInt(deltaMatch[1]) : null;
      const majTime = majEl.textContent.trim();
      const currentTimestamp = parseTimestamp(majTime);
      
      if (!currentTimestamp) return;
      
      // Vérifier si c'est une vraie nouvelle mesure CGM
      if (majTime !== lastMajTimestamp) {
        const isRealMeasure = isRealCGMMeasurement(currentTimestamp, lastRealMeasureTime);
        const diffSeconds = lastRealMeasureTime ? (currentTimestamp - lastRealMeasureTime) / 1000 : 0;
        
        if (isRealMeasure) {
          lastRealMeasureTime = currentTimestamp;
          lastMajTimestamp = majTime;
          
          const logEntry = {
            time: new Date().toLocaleTimeString(),
            glucose: glucose,
            delta: delta,
            majTime: majTime
          };
          
          dataHistory.push(logEntry);
          
          if (dataHistory.length > 10) {
            dataHistory.shift();
          }
          
          console.log('📊 VRAIE MESURE CGM DÉTECTÉE:');
          console.log(`   Glycémie: ${glucose} mg/dL (${delta >= 0 ? '+' : ''}${delta})`);
          console.log(`   Timestamp: ${majTime}`);
          console.log(`   Écart: ${Math.round(diffSeconds)}s depuis dernière mesure`);
          console.log(`   Timer redémarré pour 5 minutes`);
          console.log('');
        } else {
          console.log(`⏭️  Rotation fenêtre ignorée (écart: ${Math.round(diffSeconds)}s): ${majTime.split(' ')[1]}`);
        }
        
        lastMajTimestamp = majTime;
      }
      
    } catch(e){
      console.error('Erreur logCurrentData:', e);
    }
  }

  function updateArrows(){
    try {
      const allElements = [...document.querySelectorAll('*')];
      const deltaEl = allElements.find(e => 
        e.textContent && /Δ\s*[-+]?\d+/.test(e.textContent)
      );
      
      if (!deltaEl) return;
      
      const deltaMatch = deltaEl.textContent.match(/Δ\s*([-+]?\d+)/);
      if (!deltaMatch) return;
      
      const delta = parseInt(deltaMatch[1], 10);
      
      let arrow = "→";
      if (Math.abs(delta) >= 10) {
        arrow = delta > 0 ? "↑↑" : "↓↓";
      } else if (Math.abs(delta) >= 4) {
        arrow = delta > 0 ? "↑" : "↓";
      }
      
      allElements.forEach(el => {
        if (el.children.length === 0 && /^[↑↓→]+$/.test(el.textContent)) {
          if (el.textContent !== arrow) {
            el.textContent = arrow;
          }
        }
      });
      
    } catch(e){}
  }

  function updateClock(){
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    [...document.querySelectorAll('*')].forEach(el => {
      if (el.children.length === 0 && /^\d{2}:\d{2}$/.test(el.textContent)) {
        el.textContent = timeStr;
      }
    });
  }

  function updateCountdown(){
    try {
      if (!lastRealMeasureTime) return;
      
      const nextRealUpdateTime = new Date(lastRealMeasureTime.getTime() + 300000); // +5 minutes
      const timeUntilNext = nextRealUpdateTime.getTime() - Date.now();
      const secsRemaining = Math.max(0, Math.floor(timeUntilNext / 1000));
      const minsRemaining = Math.floor(secsRemaining / 60);
      const secsInMin = secsRemaining % 60;
      
      let newTimeText;
      if (secsRemaining <= 10) {
        newTimeText = "nouvelle mesure...";
      } else if (minsRemaining >= 1) {
        newTimeText = `dans ${minsRemaining}m${secsInMin.toString().padStart(2,'0')}s`;
      } else {
        newTimeText = `dans ${secsRemaining}s`;
      }
      
      const timeEl = [...document.querySelectorAll('*')].find(e => 
        e.children.length === 0 && 
        (e.textContent === "à l'instant" || 
         e.textContent === "mise à jour..." ||
         e.textContent === "nouvelle mesure..." ||
         /^dans \d+m\d{2}s$/.test(e.textContent) ||
         /^dans \d+s$/.test(e.textContent) ||
         /^dans 1m$/.test(e.textContent) ||
         /^il y a \d+m$/.test(e.textContent))
      );
      
      if (timeEl && timeEl.textContent !== newTimeText) {
        timeEl.textContent = newTimeText;
      }
      
    } catch(e){}
  }

  // Exécution
  setTimeout(() => {
    logCurrentData();
    updateCountdown();
    updateArrows();
  }, 1000);
  
  setInterval(updateCountdown, 1000);
  setInterval(logCurrentData, 5000);
  setInterval(() => {
    updateClock();
    updateArrows();
  }, 10000);

})();
