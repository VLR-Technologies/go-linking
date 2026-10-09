import QRCode from 'qrcode';
export function qrDataUrl(url: string, width = 1024) {
  return QRCode.toDataURL(url, {
    width,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });
}
