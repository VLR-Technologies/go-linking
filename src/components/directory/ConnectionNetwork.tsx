import { AnimatedWords } from './AnimatedWords';
import { ConnectionMark } from './ConnectionMark';

const paths = [
  'M280 260C174 260 198 104 112 104',
  'M280 260C372 260 362 88 448 88',
  'M280 260C380 260 398 262 493 262',
  'M280 260C370 260 354 422 437 422',
  'M280 260C180 260 208 428 129 428',
  'M280 260C198 260 174 268 62 268',
];

export function ConnectionNetwork() {
  return (
    <div className="connection-network" aria-hidden="true">
      <div className="network-field" />
      <svg className="network-lines" viewBox="0 0 560 520" fill="none">
        <defs>
          <linearGradient
            id="connection-line"
            x1="90"
            y1="80"
            x2="480"
            y2="440"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#8caff5" />
            <stop offset=".5" stopColor="#70c6db" />
            <stop offset="1" stopColor="#baa9e9" />
          </linearGradient>
        </defs>
        <g className="network-orbits" stroke="#dce6f1">
          <circle cx="280" cy="260" r="205" />
          <circle cx="280" cy="260" r="145" strokeDasharray="2 7" />
          <circle cx="280" cy="260" r="88" />
          <path d="M280 32v456M28 260h504" strokeDasharray="2 7" />
        </g>
        <g stroke="url(#connection-line)" strokeWidth="1.4">
          {paths.map((path) => (
            <path key={path} d={path} />
          ))}
        </g>
        <g
          className="connection-pulses"
          stroke="#4287e7"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="3 97"
        >
          {paths.map((path, index) => (
            <path
              key={path}
              d={path}
              pathLength="100"
              style={{ animationDelay: `${index * -1.2}s` }}
            />
          ))}
        </g>
        <g fill="#fff" stroke="#9cb9dc" strokeWidth="1.5">
          <circle cx="280" cy="55" r="4" />
          <circle cx="280" cy="465" r="4" />
          <circle cx="88" cy="187" r="3" />
          <circle cx="468" cy="342" r="3" />
        </g>
      </svg>
      <div className="network-hub">
        <ConnectionMark />
        <AnimatedWords />
      </div>
      <div className="network-node node-people">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <circle cx="13" cy="10" r="4" />
          <path d="M5 26v-3a8 8 0 0 1 16 0v3M23 6a4 4 0 0 1 0 8m2 4a7 7 0 0 1 3 6" />
        </svg>
        <span>People</span>
      </div>
      <div className="network-node node-web">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="16" cy="16" r="12" />
          <ellipse cx="16" cy="16" rx="5" ry="12" />
          <path d="M4 16h24M6 10h20M6 22h20" />
        </svg>
        <span>Websites</span>
      </div>
      <div className="network-node node-social">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="5" y="5" width="22" height="22" rx="7" />
          <circle cx="16" cy="16" r="5" />
          <circle cx="23" cy="9" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>
      <div className="network-node node-qr">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        >
          <path d="M5 5h8v8H5zM19 5h8v8h-8zM5 19h8v8H5zM19 19h3v3h5v5h-8zM27 18v1M17 5v9M5 16h8" />
        </svg>
        <span>QR codes</span>
      </div>
      <div className="network-node node-brands">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M5 14v13h22V14M4 13l3-8h18l3 8M4 13c0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0 0 4 6 4 6 0M12 27v-8h8v8" />
        </svg>
        <span>Brands</span>
      </div>
      <div className="network-node node-message">
        <svg
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M27 15a11 11 0 0 1-16 10l-7 2 2-7a11 11 0 1 1 21-5Z" />
          <path d="M11 13h10M11 18h6" />
        </svg>
      </div>
    </div>
  );
}
