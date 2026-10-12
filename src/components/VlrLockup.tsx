import Image from 'next/image';

export const vlrTagline = 'ENGINEERING INTELLIGENCE FOR TOMORROW';

export function VlrLockup() {
  return (
    <span className="vlr-lockup">
      <Image
        src="/brands/vlr/logo.png"
        alt="VLR"
        width={880}
        height={305}
        unoptimized
      />
      <strong>TECHNOLOGIES</strong>
    </span>
  );
}
