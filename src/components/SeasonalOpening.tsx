type Dot = { x: number; y: number; radius: number; opacity: number; delay: number };

const stage = (
  count: number,
  startX: number,
  endX: number,
  spread: number,
  seed: number,
): Dot[] => Array.from({ length: count }, (_, index) => {
  const progress = count === 1 ? 1 : index / (count - 1);
  const lane = ((index * 37 + seed * 17) % 101) / 100 - 0.5;
  const wave = Math.sin((index + seed) * 1.73) * 0.16;
  return {
    x: startX + (endX - startX) * progress,
    y: 400 + (lane + wave) * spread,
    radius: 2.2 + ((index + seed) % 4) * 0.55,
    opacity: 0.2 + ((index * 11 + seed) % 7) * 0.08,
    delay: (index + seed) % 13,
  };
});

const dots = [
  ...stage(78, 80, 330, 430, 1),
  ...stage(46, 320, 590, 285, 3),
  ...stage(25, 580, 820, 165, 5),
  ...stage(12, 810, 1010, 82, 7),
  ...stage(5, 1000, 1115, 28, 11),
];

export function SeasonalOpening() {
  return <section className="seasonal-opening" aria-labelledby="seasonal-opening-title">
    <h1 id="seasonal-opening-title" className="sr-only">SPNC 理想营养</h1>
    <figure className="long-game-visual">
      <svg viewBox="0 0 1200 800" role="img" aria-labelledby="long-game-title long-game-desc">
        <title id="long-game-title">长期训练轨迹</title>
        <desc id="long-game-desc">大量起点逐渐收敛为少数持续前进的轨迹，表达健身和长跑中的长期坚持。</desc>
        <defs>
          <linearGradient id="route" x1="0" x2="1">
            <stop offset="0" stopColor="#d9dde3" stopOpacity="0" />
            <stop offset="0.58" stopColor="#c6d8ea" stopOpacity="0.55" />
            <stop offset="1" stopColor="#1688ee" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="arrival" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#1688ee" stopOpacity="0.28" />
            <stop offset="1" stopColor="#1688ee" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path className="long-game-route" d="M78 400 C350 400 420 400 590 400 S875 400 1120 400" />
        <ellipse cx="1118" cy="400" rx="112" ry="112" fill="url(#arrival)" />
        <line className="long-game-finish" x1="1132" y1="334" x2="1132" y2="466" />
        <g className="long-game-dots">
          {dots.map((dot, index) => <circle
            className={dot.x > 995 ? "long-game-dot long-game-dot-final" : "long-game-dot"}
            cx={dot.x}
            cy={dot.y}
            fill={dot.x > 995 ? "#0a84ff" : "#53606d"}
            key={`${dot.x}-${dot.y}-${index}`}
            opacity={dot.opacity}
            r={dot.radius}
            style={{ animationDelay: `${dot.delay * -0.37}s` }}
          />)}
        </g>
      </svg>
      <figcaption className="sr-only">2026 第三季度 SPNC 长期主义主题视觉。</figcaption>
    </figure>
    <span className="scroll-cue" aria-hidden="true" />
  </section>;
}
