/* eslint-disable @next/next/no-img-element */
import type { Brand } from '@/config/brands';
export function BrandAnimation({ brand }: { brand: Brand }) {
  return (
    <div
      className={`brand-animation ${brand.experience}-scene`}
      aria-hidden="true"
    >
      {brand.decor?.map((asset) => (
        <img key={asset} src={asset} alt="" className="scene-art" />
      ))}
      {brand.experience === 'elevator' && (
        <svg className="elevator-motion" viewBox="0 0 320 300" fill="none">
          <path
            className="shaft-lines"
            d="M90 20v260M230 20v260M80 70h160M80 140h160M80 210h160"
            stroke="#66839E"
          />
          <g className="elevator-cabin">
            <rect
              x="112"
              y="112"
              width="96"
              height="114"
              rx="5"
              fill="#1D334C"
              stroke="#8EBBF0"
              strokeWidth="2"
            />
            <path d="M160 130v78M124 208v-78h72v78" stroke="#8EBBF0" />
            <path d="m153 120 7-5 7 5" stroke="#7CC3FF" />
          </g>
          <g className="floor-lights" fill="#7CC3FF">
            <circle cx="249" cy="70" r="4" />
            <circle cx="249" cy="140" r="4" />
            <circle cx="249" cy="210" r="4" />
          </g>
        </svg>
      )}
      {brand.experience === 'education' && (
        <svg className="education-motion" viewBox="0 0 320 260" fill="none">
          <g className="book-open">
            <path
              d="M160 204c-30-21-67-25-108-18V72c40-8 76-1 108 21 32-22 68-29 108-21v114c-41-7-78-3-108 18Z"
              fill="#FFF"
              stroke="#6241BB"
              strokeWidth="3"
            />
            <path
              d="M160 93v111M76 104l59 12M76 127l59 12M76 150l42 9M184 116l59-12M184 139l59-12M184 162l42-9"
              stroke="#B3A0E0"
              strokeWidth="3"
            />
          </g>
          <g className="academic-symbols" fill="#6241BB">
            <text x="35" y="45" fontSize="22">
              A+
            </text>
            <text x="231" y="40" fontSize="24">
              x²
            </text>
            <path
              d="m278 106 4 10 11 1-9 7 3 11-9-6-9 6 3-11-9-7 11-1Z"
              fill="#D99412"
            />
          </g>
          <path
            className="pencil-slide"
            d="m65 215 130-20 3 13-130 20-17-4Z"
            fill="#F4BD45"
            stroke="#98641A"
            strokeWidth="2"
          />
        </svg>
      )}
    </div>
  );
}
