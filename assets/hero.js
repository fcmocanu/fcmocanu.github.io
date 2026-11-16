// Hero: a 2D crystal that melts locally where the cursor (or a slow wandering
// heat source) passes, and recrystallises as it cools. Decorative only.
(function () {
  const c = document.getElementById("hero");
  if (!c) return;
  const ctx = c.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const a = 15;                       // lattice spacing (px)
  let W, H, atoms = [], cols, rows, mouse = null, t = 0;

  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  let ink, cold, rule;
  function palette() { ink = css("--accent"); cold = css("--muted"); rule = css("--rule"); }

  function build() {
    const dpr = window.devicePixelRatio || 1;
    W = c.clientWidth; H = c.clientHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(W / a) + 1; rows = Math.ceil(H / (a * 0.866)) + 1;
    atoms = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const x = i * a + (j % 2) * a / 2, y = j * a * 0.866 + 4;
      atoms.push({ sx: x, sy: y, x, y, vx: 0, vy: 0, T: 0, kind: (i + j) % 3 === 0 });
    }
  }
  const at = (i, j) => (i >= 0 && j >= 0 && i < cols && j < rows) ? atoms[j * cols + i] : null;

  function step() {
    t += 1;
    // heat sources: the cursor, plus a slow ambient wanderer
    const src = [{ x: W * (0.5 + 0.42 * Math.sin(t / 260)), y: H * (0.5 + 0.35 * Math.sin(t / 170)), q: 0.07 }];
    if (mouse) src.push({ x: mouse.x, y: mouse.y, q: 0.35 });
    for (const p of atoms) {
      for (const s of src) {
        const d2 = (p.x - s.x) ** 2 + (p.y - s.y) ** 2;
        p.T += s.q * Math.exp(-d2 / 2600);
      }
      p.T = Math.min(p.T * 0.975, 2.5);
      const k = 0.05 * (1 - Math.min(p.T, 1) * 0.92);   // hot atoms lose their lattice site
      const kick = 0.9 * Math.sqrt(p.T);
      p.vx = (p.vx + (Math.random() - 0.5) * kick - (p.x - p.sx) * k) * 0.86;
      p.vy = (p.vy + (Math.random() - 0.5) * kick - (p.y - p.sy) * k) * 0.86;
      p.x += p.vx; p.y += p.vy;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1; ctx.strokeStyle = cold; ctx.globalAlpha = 0.35; ctx.beginPath();
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const p = at(i, j), o = j % 2;
      for (const q of [at(i + 1, j), at(i - 1 + o, j + 1), at(i + o, j + 1)]) {
        if (q && Math.hypot(p.x - q.x, p.y - q.y) < a * 1.18) { ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); }
      }
    }
    ctx.stroke(); ctx.globalAlpha = 1;
    for (const p of atoms) {
      const h = Math.min(p.T, 1);
      ctx.globalAlpha = 0.35 + 0.65 * h;
      ctx.fillStyle = h > 0.25 ? ink : cold;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.kind ? 3 : 2.2, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function loop() { step(); draw(); requestAnimationFrame(loop); }

  const pos = e => { const r = c.getBoundingClientRect(); const s = e.touches ? e.touches[0] : e; return { x: s.clientX - r.left, y: s.clientY - r.top }; };
  c.addEventListener("pointermove", e => { mouse = pos(e); });
  c.addEventListener("pointerleave", () => { mouse = null; });
  c.addEventListener("touchmove", e => { mouse = pos(e); }, { passive: true });
  c.addEventListener("touchend", () => { mouse = null; });
  window.addEventListener("resize", () => { build(); if (reduce) draw(); });
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", () => { palette(); if (reduce) draw(); });

  palette(); build();
  if (reduce) { draw(); return; }
  for (let i = 0; i < 400; i++) step();   // start with a little disorder already present
  loop();
})();
