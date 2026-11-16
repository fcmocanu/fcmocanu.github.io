// A tiny crystal that melts into a glass on hover and recrystallises when you leave.
// A nod to phase-change materials and disordered solids. Purely decorative.
(function () {
  const c = document.getElementById("lattice");
  if (!c) return;
  const ctx = c.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const S = 44;
  c.width = S * dpr; c.height = S * dpr;
  c.style.width = S + "px"; c.style.height = S + "px";
  ctx.scale(dpr, dpr);

  const N = 4, pad = 8, step = (S - 2 * pad) / (N - 1);
  const atoms = [];
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x = pad + i * step, y = pad + j * step;
    atoms.push({ x0: x, y0: y, x, y, dx: 0, dy: 0 });
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let T = 0, target = 0, running = false;

  function colour(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  function draw() {
    const ink = colour("--accent"), bond = colour("--rule");
    ctx.clearRect(0, 0, S, S);
    ctx.strokeStyle = bond; ctx.lineWidth = 1;
    for (let a = 0; a < atoms.length; a++) for (let b = a + 1; b < atoms.length; b++) {
      const p = atoms[a], q = atoms[b];
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < step * 1.15) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
    }
    ctx.fillStyle = ink;
    for (const p of atoms) { ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, 2 * Math.PI); ctx.fill(); }
  }

  function tick() {
    T += (target - T) * 0.08;
    for (const p of atoms) {
      // random kicks scale with "temperature", a spring pulls back to the lattice site
      p.dx += (Math.random() - 0.5) * 1.6 * T - (p.x - p.x0) * 0.04;
      p.dy += (Math.random() - 0.5) * 1.6 * T - (p.y - p.y0) * 0.04;
      p.dx *= 0.85; p.dy *= 0.85;
      p.x = Math.min(S - 3, Math.max(3, p.x + p.dx));
      p.y = Math.min(S - 3, Math.max(3, p.y + p.dy));
    }
    draw();
    const settled = target === 0 && T < 0.01 &&
      atoms.every(p => Math.abs(p.x - p.x0) < 0.05 && Math.abs(p.y - p.y0) < 0.05);
    if (settled) { atoms.forEach(p => { p.x = p.x0; p.y = p.y0; }); draw(); running = false; return; }
    requestAnimationFrame(tick);
  }
  function start(t) { target = t; if (!running && !reduce) { running = true; requestAnimationFrame(tick); } }

  const brand = c.closest("a") || c;
  brand.addEventListener("mouseenter", () => start(1));
  brand.addEventListener("mouseleave", () => start(0));
  brand.addEventListener("focus", () => start(1));
  brand.addEventListener("blur", () => start(0));
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener?.("change", draw);
  draw();
})();
