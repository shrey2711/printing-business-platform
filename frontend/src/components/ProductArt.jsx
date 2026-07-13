// Flat SVG product mockups used as professional placeholders in place of photos.
// Swap these for real product photography later — same <ProductArt slug=... /> API.

const BG = '#eef1f5';

function Frame({ children }) {
  return (
    <svg viewBox="0 0 240 180" className="art-svg" role="img" preserveAspectRatio="xMidYMid meet">
      <rect width="240" height="180" fill={BG} />
      {children}
    </svg>
  );
}

// A little printed "sample design" reused inside several products.
function SampleGraphic({ x = 0, y = 0, w = 100, h = 60 }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={h} fill="#ffffff" />
      <rect width={w} height={h * 0.42} fill="#c8102e" />
      <circle cx={w * 0.22} cy={h * 0.21} r={h * 0.13} fill="#ffd34e" />
      <rect x={w * 0.4} y={h * 0.14} width={w * 0.45} height={h * 0.06} rx="2" fill="#ffffff" />
      <rect x={w * 0.4} y={h * 0.26} width={w * 0.3} height={h * 0.05} rx="2" fill="#ffd34e" />
      <rect x={w * 0.1} y={h * 0.56} width={w * 0.8} height={h * 0.06} rx="2" fill="#1f5fe0" />
      <rect x={w * 0.1} y={h * 0.7} width={w * 0.55} height={h * 0.06} rx="2" fill="#c9d2e0" />
      <rect x={w * 0.1} y={h * 0.84} width={w * 0.35} height={h * 0.06} rx="2" fill="#c9d2e0" />
    </g>
  );
}

function Banner({ mesh }) {
  return (
    <Frame>
      <rect x="30" y="34" width="180" height="112" fill="#fff" stroke="#c7cfdb" />
      <SampleGraphic x="42" y="46" w="156" h="88" />
      {mesh && (
        <g opacity="0.25">
          {Array.from({ length: 14 }).map((_, r) =>
            Array.from({ length: 26 }).map((_, c) => (
              <circle key={`${r}-${c}`} cx={42 + c * 6} cy={46 + r * 6.3} r="0.9" fill="#3a4658" />
            ))
          )}
        </g>
      )}
      {/* grommets */}
      {[[34, 38], [206, 38], [34, 142], [206, 142]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill="#c9d2e0" stroke="#8b95a6" />
      ))}
    </Frame>
  );
}

function FabricBanner() {
  return (
    <Frame>
      <rect x="34" y="30" width="172" height="120" rx="3" fill="#fff" stroke="#c7cfdb" />
      <SampleGraphic x="46" y="42" w="148" h="96" />
      <rect x="34" y="30" width="172" height="120" rx="3" fill="url(#sheen)" opacity="0.25" />
      <defs>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </Frame>
  );
}

function YardSign() {
  return (
    <Frame>
      {/* H-stake */}
      <rect x="66" y="118" width="4" height="46" fill="#9aa4b2" />
      <rect x="170" y="118" width="4" height="46" fill="#9aa4b2" />
      <rect x="66" y="140" width="108" height="4" fill="#9aa4b2" />
      {/* sign */}
      <rect x="46" y="40" width="148" height="88" fill="#fff" stroke="#c7cfdb" />
      <rect x="46" y="40" width="148" height="88" fill="#ffd34e" />
      <text x="120" y="82" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="26" fill="#16233b">555-5555</text>
      <text x="120" y="104" textAnchor="middle" fontFamily="Arial" fontSize="10" fill="#16233b">CALL TODAY</text>
      {/* corrugation edge */}
      <g stroke="#e4b400" strokeWidth="1">
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={i} x1={48 + i * 6} y1="124" x2={48 + i * 6} y2="128" />
        ))}
      </g>
    </Frame>
  );
}

function RigidSign() {
  return (
    <Frame>
      <rect x="42" y="36" width="156" height="108" rx="2" fill="#fff" stroke="#aeb7c4" strokeWidth="3" />
      <SampleGraphic x="54" y="48" w="132" h="84" />
      {[[52, 46], [188, 46], [52, 134], [188, 134]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="2.4" fill="#8b95a6" />
      ))}
    </Frame>
  );
}

function Decals() {
  return (
    <Frame>
      <g>
        <circle cx="88" cy="78" r="34" fill="#c8102e" stroke="#fff" strokeWidth="4" />
        <text x="88" y="84" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="16" fill="#fff">SALE</text>
      </g>
      <g transform="rotate(-8 158 96)">
        <rect x="126" y="74" width="70" height="46" rx="6" fill="#1f5fe0" stroke="#fff" strokeWidth="4" />
        <rect x="136" y="86" width="50" height="6" rx="3" fill="#fff" />
        <rect x="136" y="98" width="34" height="6" rx="3" fill="#ffd34e" />
      </g>
      <g transform="rotate(10 78 128)">
        <rect x="52" y="112" width="52" height="34" rx="6" fill="#ffd34e" stroke="#fff" strokeWidth="4" />
        <circle cx="78" cy="129" r="10" fill="#16233b" />
      </g>
    </Frame>
  );
}

function FeatherFlag() {
  return (
    <Frame>
      {/* base */}
      <ellipse cx="150" cy="162" rx="26" ry="5" fill="#c3cbd6" />
      <rect x="147" y="150" width="6" height="14" fill="#9aa4b2" />
      {/* pole */}
      <rect x="149" y="22" width="3" height="130" fill="#8b95a6" />
      {/* flag */}
      <path d="M149 24 C 96 30, 70 60, 60 96 C 84 92, 120 96, 149 118 Z" fill="#1f5fe0" />
      <path d="M149 34 C 112 40, 92 62, 84 88 C 104 86, 128 90, 149 104 Z" fill="#ffffff" opacity="0.9" />
      <circle cx="112" cy="66" r="10" fill="#c8102e" />
      <rect x="96" y="82" width="44" height="5" rx="2" fill="#16233b" />
      <rect x="96" y="92" width="30" height="5" rx="2" fill="#ffd34e" />
    </Frame>
  );
}

function BannerStand() {
  return (
    <Frame>
      {/* banner */}
      <rect x="86" y="20" width="68" height="118" fill="#fff" stroke="#c7cfdb" />
      <SampleGraphic x="92" y="26" w="56" h="106" />
      {/* base */}
      <rect x="74" y="138" width="92" height="10" rx="3" fill="#c3cbd6" />
      <rect x="118" y="20" width="4" height="120" fill="#aeb7c4" opacity="0.6" />
      <ellipse cx="120" cy="156" rx="40" ry="5" fill="#e0e5ec" />
    </Frame>
  );
}

function TableCover() {
  return (
    <Frame>
      {/* table top */}
      <rect x="40" y="70" width="160" height="10" fill="#c3cbd6" />
      {/* drape */}
      <path d="M44 78 H196 V150 H44 Z" fill="#1f5fe0" />
      <path d="M44 78 H196 V150 H44 Z" fill="url(#drape)" opacity="0.15" />
      <rect x="92" y="96" width="56" height="30" rx="3" fill="#fff" />
      <circle cx="120" cy="107" r="8" fill="#c8102e" />
      <rect x="104" y="120" width="32" height="4" rx="2" fill="#16233b" />
      {/* legs */}
      <rect x="60" y="80" width="5" height="46" fill="#9aa4b2" opacity="0.5" />
      <rect x="176" y="80" width="5" height="46" fill="#9aa4b2" opacity="0.5" />
      <defs>
        <linearGradient id="drape" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
    </Frame>
  );
}

function Tent() {
  return (
    <Frame>
      {/* legs */}
      <rect x="52" y="86" width="4" height="70" fill="#9aa4b2" />
      <rect x="184" y="86" width="4" height="70" fill="#9aa4b2" />
      <rect x="118" y="92" width="4" height="64" fill="#b7bfca" />
      {/* canopy */}
      <path d="M120 34 L200 88 L40 88 Z" fill="#2f9e44" />
      <path d="M120 34 L200 88 L120 88 Z" fill="#2b8a3e" />
      {/* valance */}
      <path d="M40 88 H200 V100 L184 96 L168 100 L152 96 L136 100 L120 96 L104 100 L88 96 L72 100 L56 96 L40 100 Z" fill="#37b24d" />
      <text x="120" y="74" textAnchor="middle" fontFamily="Arial" fontWeight="800" fontSize="12" fill="#fff">YOUR BRAND</text>
    </Frame>
  );
}

const MAP = {
  'vinyl-banners': <Banner />,
  'mesh-banners': <Banner mesh />,
  'fabric-banners': <FabricBanner />,
  'yard-signs': <YardSign />,
  'rigid-signs': <RigidSign />,
  'decals-stickers': <Decals />,
  'feather-flags': <FeatherFlag />,
  'retractable-banner-stands': <BannerStand />,
  'table-covers': <TableCover />,
  'canopy-tents': <Tent />
};

export default function ProductArt({ slug }) {
  return MAP[slug] || <Frame><SampleGraphic x="60" y="50" w="120" h="80" /></Frame>;
}
