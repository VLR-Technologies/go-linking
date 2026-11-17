export function paletteFromPixels(pixels: Uint8ClampedArray) {
  const bins = new Map<string, number>();
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] < 180) continue;
    const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
    if (Math.max(...rgb) > 240 && Math.min(...rgb) > 230) continue;
    if (Math.max(...rgb) < 20) continue;
    const key = rgb
      .map((v) =>
        Math.min(255, Math.round(v / 32) * 32)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
    bins.set(key, (bins.get(key) || 0) + 1);
  }
  const colors = [...bins]
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => `#${hex}`);
  const primary = colors[0] || '#255C88';
  const secondary = colors.find((hex) => hex !== primary) || '#183047';
  const mix = (hex: string, amount: number) =>
    '#' +
    [1, 3, 5]
      .map((i) =>
        Math.round(
          parseInt(hex.slice(i, i + 2), 16) * (1 - amount) + 255 * amount,
        )
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  return {
    primaryColor: primary,
    secondaryColor: secondary,
    accentColor: colors[2] || '#CB6A24',
    backgroundColor: mix(primary, 0.95),
  };
}
export function filenameSuggestion(filename: string) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/\b(logo|final|image|copy|\d+)\b/gi, '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
