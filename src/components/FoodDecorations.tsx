import type { CSSProperties } from 'react';

const pieces = [
  {
    food: 'pizza',
    side: 'left',
    size: '168px',
    duration: '21s',
    delay: '-5s',
    rest: '13svh',
    tilt: '-18deg',
  },
  {
    food: 'burger',
    side: 'left',
    size: '158px',
    duration: '22s',
    delay: '-16s',
    rest: '68svh',
    tilt: '10deg',
  },
  {
    food: 'basil',
    side: 'left',
    size: '76px',
    duration: '17s',
    delay: '-10s',
    rest: '44svh',
    tilt: '-28deg',
  },
  {
    food: 'fries',
    side: 'right',
    size: '144px',
    duration: '20s',
    delay: '-7s',
    rest: '20svh',
    tilt: '15deg',
  },
  {
    food: 'tomatoes',
    side: 'right',
    size: '112px',
    duration: '19s',
    delay: '-16s',
    rest: '73svh',
    tilt: '-12deg',
  },
  {
    food: 'basil',
    side: 'right',
    size: '80px',
    duration: '16s',
    delay: '-10s',
    rest: '47svh',
    tilt: '35deg',
  },
] as const;

export function FoodDecorations() {
  return (
    <div className="food-scene" aria-hidden="true">
      {pieces.map((piece, index) => (
        <div
          key={`${piece.food}-${piece.side}`}
          className={`food-piece food-${piece.side} food-${index + 1}`}
          style={
            {
              '--food-size': piece.size,
              '--float-duration': piece.duration,
              '--float-delay': piece.delay,
              '--rest-y': piece.rest,
              '--tilt': piece.tilt,
            } as CSSProperties
          }
        >
          {/* Original local SVG illustrations; no image optimizer or client runtime needed. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/brands/mozza-italia/food/${piece.food}.svg`}
            alt=""
            width="200"
            height="200"
            draggable="false"
          />
        </div>
      ))}
    </div>
  );
}
