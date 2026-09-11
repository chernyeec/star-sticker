// Shared kawaii-star artwork for icon.tsx and apple-icon.tsx.
// Not named "icon"/"apple-icon" so Next.js doesn't treat it as a route.

const OUTLINE = "#2B2438";
const STAR_SHADOW = "#F6A23A";
const STAR_FACE = "#FFE07E";
const EYE = "#241F2E";
const CHEEK = "#F9A8A0";
const SPARKLE = "#FFFFFF";
const BG = "#F5F1E8";

function starPoints(cx: number, cy: number, outerR: number, innerR: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
  }
  return pts.join(" ");
}

export function StarMascot({ size }: { size: number }) {
  const s = size / 512;
  const cx = 256 * s;
  const cy = 256 * s;
  const outerR = 172 * s;
  const innerR = 108 * s;

  const shadowPoints = starPoints(cx, cy, outerR, innerR);
  const facePoints = starPoints(cx, cy - 9 * s, outerR * 0.97, innerR * 0.97);

  const eyeDx = 46 * s;
  const eyeCy = cy - 4 * s;
  const eyeRx = 15 * s;
  const eyeRy = 19 * s;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        background: BG,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon
          points={shadowPoints}
          fill={STAR_SHADOW}
          stroke={OUTLINE}
          strokeWidth={15 * s}
          strokeLinejoin="round"
        />
        <polygon points={facePoints} fill={STAR_FACE} />

        {/* sparkles */}
        <circle cx={cx - 96 * s} cy={cy - 70 * s} r={7 * s} fill={SPARKLE} />
        <circle cx={cx - 118 * s} cy={cy + 4 * s} r={5 * s} fill={SPARKLE} />
        <circle cx={cx + 30 * s} cy={cy + 70 * s} r={6 * s} fill={SPARKLE} />

        {/* cheeks */}
        <ellipse cx={cx - eyeDx - 6 * s} cy={eyeCy + 30 * s} rx={17 * s} ry={11 * s} fill={CHEEK} />
        <ellipse cx={cx + eyeDx + 6 * s} cy={eyeCy + 30 * s} rx={17 * s} ry={11 * s} fill={CHEEK} />

        {/* eyes */}
        <ellipse cx={cx - eyeDx} cy={eyeCy} rx={eyeRx} ry={eyeRy} fill={EYE} />
        <ellipse cx={cx + eyeDx} cy={eyeCy} rx={eyeRx} ry={eyeRy} fill={EYE} />
        <circle cx={cx - eyeDx - 5 * s} cy={eyeCy - 7 * s} r={4.5 * s} fill={SPARKLE} />
        <circle cx={cx + eyeDx - 5 * s} cy={eyeCy - 7 * s} r={4.5 * s} fill={SPARKLE} />

        {/* smile */}
        <path
          d={`M ${cx - 28 * s} ${eyeCy + 34 * s} Q ${cx} ${eyeCy + 54 * s} ${cx + 28 * s} ${eyeCy + 34 * s}`}
          stroke={EYE}
          strokeWidth={7 * s}
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}
