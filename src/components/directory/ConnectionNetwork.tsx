export function ConnectionNetwork() {
  return (
    <div className="connection-network" aria-hidden="true">
      <div className="network-glow" />
      <svg className="network-lines" viewBox="0 0 500 460" fill="none">
        <ellipse
          cx="250"
          cy="230"
          rx="194"
          ry="184"
          stroke="#BDC8E3"
          strokeDasharray="3 9"
        />
        <ellipse cx="250" cy="230" rx="150" ry="143" stroke="#D8DFF0" />
        <g stroke="#A2B4E3" strokeWidth="1.5">
          <path d="M250 230C180 230 130 150 104 110" />
          <path d="M250 230C285 170 345 130 391 126" />
          <path d="M250 230C160 230 140 307 104 332" />
          <path d="M250 230C310 240 333 321 393 329" />
          <path d="M250 230C265 310 248 366 250 406" />
        </g>
        <g
          className="connection-pulses"
          stroke="#326BFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 100"
          pathLength="100"
        >
          <path pathLength="100" d="M250 230C180 230 130 150 104 110" />
          <path pathLength="100" d="M250 230C310 240 333 321 393 329" />
          <path pathLength="100" d="M250 230C285 170 345 130 391 126" />
        </g>
        <circle cx="250" cy="46" r="5" fill="#8155F5" />
        <circle cx="58" cy="253" r="4" fill="#32C8E8" />
        <circle cx="437" cy="213" r="5" fill="#FF8469" />
        <path
          d="M427 381v14m-7-7h14M167 40v10m-5-5h10"
          stroke="#8155F5"
          strokeWidth="2"
        />
      </svg>
      <div className="network-hub">
        <svg
          width="52"
          height="52"
          viewBox="0 0 48 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m20 28 8-8m-11 5-4 4a8 8 0 0 0 11 11l8-8a8 8 0 0 0 0-11M31 23l4-4A8 8 0 0 0 24 8l-8 8a8 8 0 0 0 0 11" />
        </svg>
        <strong>GO-LINKING</strong>
        <span>Your digital gateway</span>
      </div>
      <div className="network-node node-discover">
        <span className="node-icon">✳</span>
        <span>
          <small>A LITTLE CURIOSITY</small>
          <strong>Discover more.</strong>
        </span>
      </div>
      <div className="network-node node-web">
        <span className="node-icon">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <circle cx="12" cy="12" r="9" />
            <ellipse cx="12" cy="12" rx="4" ry="9" />
            <path d="M3 12h18" />
          </svg>
        </span>
        <strong>Web & social</strong>
      </div>
      <div className="network-node node-brand">
        <span className="node-icon">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M4 10v10h16V10M3 10l2-6h14l2 6M3 10c0 3 4 3 4 0 0 3 5 3 5 0 0 3 5 3 5 0 0 3 4 3 4 0M9 20v-6h6v6" />
          </svg>
        </span>
        <strong>Brands you love</strong>
      </div>
      <div className="network-node node-explore">
        <span className="node-icon">↗</span>
        <span>
          <small>SOMETHING NEW</small>
          <strong>Beyond one click.</strong>
        </span>
      </div>
      <span className="network-caption">
        One smart link. A world within reach.
      </span>
    </div>
  );
}
