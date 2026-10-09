import localFont from 'next/font/local';

export const displayFont = localFont({
  src: './fonts/barlow-condensed-bold.ttf',
  weight: '700',
  style: 'normal',
  display: 'swap',
  variable: '--font-display',
});

export const uiFont = localFont({
  src: [
    { path: './fonts/manrope-regular.ttf', weight: '400', style: 'normal' },
    { path: './fonts/manrope-semibold.ttf', weight: '600', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-ui',
});
