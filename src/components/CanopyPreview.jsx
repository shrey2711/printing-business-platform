// Live 2D canopy preview. Reacts to the configurator's size, frame, print
// coverage and wall selections so the buyer can see what they are configuring
// before uploading artwork. Flat SVG — no photography or 3D dependency.

const BG = '#eef1f5';
const FRAME = { steel: '#8b95a6', aluminium: '#aeb7c4', hex: '#c3cbd6' };

// Printed surfaces use the brand palette; blank surfaces stay neutral canvas.
const PRINT = '#1f5fe0';
const PRINT_DARK = '#1848b0';
const BLANK = '#f2f4f7';
const BLANK_SHADE = '#e2e6ec';

// Width multipliers so a 10x20 visibly reads wider than a 10x10.
const SPAN = { '8x8': 0.84, '10x10': 1, '10x15': 1.24, '10x20': 1.46, '13x13': 1.12, '13x20': 1.5 };

export default function CanopyPreview({
  size = '10x10',
  frame = 'aluminium',
  print = 'top',
  walls = 0,
  label
}) {
  const span = SPAN[size] || 1;
  const halfW = Math.min(96 * span, 112);
  const cx = 120;
  const left = cx - halfW;
  const right = cx + halfW;

  const topPrinted = print !== 'blank';
  const valancePrinted = print === 'top-valance' || print === 'top-inside';
  const insidePrinted = print === 'top-inside';

  const canopyFill = topPrinted ? PRINT : BLANK;
  const canopyShade = topPrinted ? PRINT_DARK : BLANK_SHADE;
  const valanceFill = valancePrinted ? PRINT_DARK : BLANK_SHADE;
  const legColor = FRAME[frame] || FRAME.aluminium;

  const peakY = 30;
  const eaveY = 84;
  const valanceY = eaveY + 14;
  const groundY = 158;

  return (
    <svg
      viewBox="0 0 240 180"
      className="art-svg"
      role="img"
      aria-label={label || `${size} canopy, ${print} print coverage, ${walls} walls`}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{label || `${size} canopy preview`}</title>
      <rect width="240" height="180" fill={BG} />

      {/* Legs */}
      <rect x={left + 2} y={eaveY} width="4" height={groundY - eaveY} fill={legColor} />
      <rect x={right - 6} y={eaveY} width="4" height={groundY - eaveY} fill={legColor} />
      <rect x={cx - 2} y={eaveY + 6} width="4" height={groundY - eaveY - 6} fill={legColor} opacity="0.55" />

      {/* Walls behind the canopy */}
      {walls > 0 && (
        <rect
          x={left + 6}
          y={valanceY}
          width={right - left - 12}
          height={groundY - valanceY}
          fill={insidePrinted ? PRINT : BLANK}
          opacity={insidePrinted ? 0.55 : 0.9}
        />
      )}
      {walls > 1 && (
        <rect x={left + 6} y={valanceY} width={(right - left - 12) * 0.22} height={groundY - valanceY} fill={PRINT_DARK} opacity="0.35" />
      )}
      {walls > 2 && (
        <rect x={right - 6 - (right - left - 12) * 0.22} y={valanceY} width={(right - left - 12) * 0.22} height={groundY - valanceY} fill={PRINT_DARK} opacity="0.35" />
      )}

      {/* Canopy roof — two faces so the peak reads three-dimensional */}
      <path d={`M${cx} ${peakY} L${right} ${eaveY} L${left} ${eaveY} Z`} fill={canopyFill} />
      <path d={`M${cx} ${peakY} L${right} ${eaveY} L${cx} ${eaveY} Z`} fill={canopyShade} />

      {/* Valance skirt */}
      <path
        d={`M${left} ${eaveY} H${right} V${valanceY} L${right - 14} ${valanceY - 4} L${right - 28} ${valanceY}
            L${right - 42} ${valanceY - 4} L${cx} ${valanceY} L${left + 42} ${valanceY - 4}
            L${left + 28} ${valanceY} L${left + 14} ${valanceY - 4} L${left} ${valanceY} Z`}
        fill={valanceFill}
      />

      {/* Artwork stand-in on the printed roof */}
      {topPrinted && (
        <g opacity="0.9">
          <circle cx={cx - halfW * 0.34} cy={eaveY - 16} r="7" fill="#ffd34e" />
          <rect x={cx - halfW * 0.18} y={eaveY - 20} width={halfW * 0.5} height="5" rx="2.5" fill="#ffffff" />
          <rect x={cx - halfW * 0.18} y={eaveY - 11} width={halfW * 0.32} height="4" rx="2" fill="#ffffff" opacity="0.75" />
        </g>
      )}

      {/* Ground shadow */}
      <ellipse cx={cx} cy={groundY + 4} rx={halfW * 0.92} ry="6" fill="#d8dee6" />
    </svg>
  );
}
