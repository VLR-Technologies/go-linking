import QRCode from 'qrcode';
export function qrDataUrl(url: string, width = 1024) {
  return QRCode.toDataURL(url, {
    // qrcode floors a scale round-trip; one ULP prevents 1024 becoming 1023
    // for denser payloads such as the WhatsApp link with its message.
    width: width + Number.EPSILON * width,
    margin: 4,
    errorCorrectionLevel: 'M',
    color: { dark: '#000000', light: '#ffffff' },
  });
}
