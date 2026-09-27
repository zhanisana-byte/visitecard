const cells = [
  [9,1],[11,1],[13,1],[15,1],[8,2],[10,2],[13,2],[16,2],[9,3],[11,3],[12,3],[15,3],
  [8,4],[10,4],[13,4],[15,4],[16,4],[9,5],[11,5],[14,5],[8,6],[10,6],[12,6],[15,6],
  [1,8],[3,8],[5,8],[7,8],[9,8],[10,8],[12,8],[14,8],[16,8],[18,8],[19,8],[2,9],[6,9],
  [8,9],[11,9],[13,9],[16,9],[18,9],[1,10],[4,10],[6,10],[9,10],[12,10],[14,10],[17,10],
  [19,10],[2,11],[5,11],[8,11],[10,11],[11,11],[15,11],[18,11],[1,12],[3,12],[6,12],
  [9,12],[13,12],[16,12],[19,12],[8,13],[10,13],[12,13],[15,13],[17,13],[1,14],[4,14],[6,14],
  [9,14],[11,14],[14,14],[18,14],[2,15],[5,15],[8,15],[10,15],[13,15],[16,15],[19,15],
  [1,16],[3,16],[6,16],[9,16],[12,16],[15,16],[17,16],[10,17],[13,17],[16,17],[18,17],
  [8,18],[11,18],[14,18],[19,18],[9,19],[12,19],[15,19],[17,19]
];

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" rx=".35" fill="#111" />
      <rect x="1" y="1" width="5" height="5" rx=".2" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" rx=".15" fill="#111" />
    </g>
  );
}

export default function QrVisual({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 21 21"
      className={`qrVisual ${className}`}
      role="img"
      aria-label="Aperçu du QR code"
      shapeRendering="crispEdges"
    >
      <rect width="21" height="21" rx="1.6" fill="#fff" />
      <Finder x={1} y={1} />
      <Finder x={13} y={1} />
      <Finder x={1} y={13} />
      {cells.map(([x, y], index) => (
        <rect key={index} x={x} y={y} width="1" height="1" rx=".08" fill="#111" />
      ))}
      <rect x="8.25" y="8.25" width="4.5" height="4.5" rx="1.2" fill="#ff4f1f" />
      <path d="M9.2 10.15h2.35l-1.2 1.55h2.45" fill="none" stroke="#fff" strokeWidth=".72" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
