// A sequence view of the three exchanges that make embedded work. Inline SVG
// so it stays crisp and needs no dependency.
const LANES = [
  { x: 150, label: 'Your app', sub: 'browser' },
  { x: 470, label: 'Your backend', sub: 'holds the API key' },
  { x: 790, label: 'MindCloud', sub: 'stores the credentials' }
];

const ROWS = [
  {
    y: 140,
    step: '1',
    from: 150,
    title: 'Identify the customer',
    detail: 'POST /v1/users, then GET /v1/users/:id/token'
  },
  {
    y: 215,
    step: '2',
    from: 150,
    title: 'Customer connects their account',
    detail: 'The SDK dialog handles credentials and OAuth'
  },
  {
    y: 290,
    step: '3',
    from: 470,
    title: 'Use the connection',
    detail: 'POST /v2/universal/…/run + installationId'
  }
];

const ArchitectureDiagram = () => {
  return (
    <svg className="architecture-diagram" viewBox="0 0 940 340" role="img" aria-label="How the browser, your backend, and MindCloud exchange data">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#8a94a3" />
        </marker>
      </defs>

      {LANES.map((lane) => (
        <g key={lane.label}>
          <rect x={lane.x - 92} y={30} width={184} height={54} rx={10} fill="#101826" />
          <text x={lane.x} y={54} textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="600">
            {lane.label}
          </text>
          <text x={lane.x} y={72} textAnchor="middle" fill="#9aa5b4" fontSize="11">
            {lane.sub}
          </text>
          <line x1={lane.x} y1={84} x2={lane.x} y2={300} stroke="#dfe4ea" strokeWidth="1.5" strokeDasharray="4 5" />
        </g>
      ))}

      {ROWS.map((row) => (
        <g key={row.step}>
          <line x1={row.from} y1={row.y} x2={790} y2={row.y} stroke="#8a94a3" strokeWidth="1.5" markerEnd="url(#arrow)" />
          <circle cx={row.from} cy={row.y} r={4} fill="#2563eb" />
          <text x={row.from + 18} y={row.y - 26} fill="#1c2530" fontSize="13" fontWeight="600">
            <tspan fill="#2563eb">{row.step}.</tspan> {row.title}
          </text>
          <text x={row.from + 18} y={row.y - 9} fill="#5a6674" fontSize="11.5" fontFamily="Menlo, Monaco, monospace">
            {row.detail}
          </text>
        </g>
      ))}

      <text x={470} y={328} textAnchor="middle" fill="#8a94a3" fontSize="11">
        MindCloud calls the provider with the customer&apos;s own credentials
      </text>
    </svg>
  );
};

export default ArchitectureDiagram;
