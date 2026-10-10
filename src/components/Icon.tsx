import type { Destination } from '@/config/brands';

const icons: Record<Destination['kind'], string> = {
  review: 'google',
  website: 'website',
  instagram: 'instagram',
  whatsapp: 'whatsapp',
};

export function Icon({ kind }: { kind: Destination['kind'] }) {
  return (
    // Platform marks are decorative; the adjacent title supplies the link's name.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/${icons[kind]}.svg`}
      alt=""
      aria-hidden="true"
      width="30"
      height="30"
      draggable="false"
    />
  );
}
