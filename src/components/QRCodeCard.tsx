import { qrDataUrl } from '@/lib/qr';
export async function QRCodeCard({
  url,
  filename,
  label,
  allowDownload = true,
}: {
  url: string;
  filename: string;
  label: string;
  allowDownload?: boolean;
}) {
  const data = await qrDataUrl(url);
  return (
    <div className="qr-card">
      <div className="qr-frame">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data}
          width="250"
          height="250"
          alt={`QR code for ${label}`}
          className="qr-image"
        />
      </div>
      <p className="qr-caption">Scan from another device</p>
      {allowDownload && (
        <a className="text-button download" href={data} download={filename}>
          Download QR <span aria-hidden="true">↓</span>
        </a>
      )}
    </div>
  );
}
