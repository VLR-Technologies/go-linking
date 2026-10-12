import type { Destination } from '@/config/brands';

const icons: Record<Destination['kind'], string> = {
  review: 'google',
  website: 'website',
  instagram: 'instagram',
  whatsapp: 'whatsapp',
  phone: 'website',
  services: 'website',
  location: 'website',
  brochure: 'website',
  enquiry: 'website',
  courses: 'website',
  timings: 'website',
  youtube: 'website',
  results: 'website',
};

const paths: Record<Destination['kind'], string> = {
  website:
    'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3c-5 5-5 13 0 18 5-5 5-13 0-18Z',
  instagram:
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm9 9a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm1-5h.01',
  review:
    'm12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z',
  whatsapp:
    'M21 11.5a9 9 0 0 1-13 8L3 21l1.5-5a9 9 0 1 1 16.5-4.5ZM8 7c0 5 4 9 9 9l-1-3-2 1-4-4 1-2Z',
  phone:
    'm8 3 3 5-3 2c1 3 3 5 6 6l2-3 5 3c-1 4-3 6-7 4C7 17 3 12 3 6c0-2 2-3 5-3Z',
  services: 'M4 5h16M4 12h16M4 19h16M8 3v4M16 10v4M10 17v4',
  location:
    'M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Zm-4 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  brochure: 'M5 3h10l4 4v14H5ZM14 3v5h5M8 12h8M8 16h8',
  enquiry: 'M4 4h16v12H9l-5 4ZM8 8h8M8 12h5',
  courses:
    'M12 6C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 2Zm0 0v15',
  timings: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 6v6l4 2',
  youtube:
    'M5 5h14a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3Zm5 4v6l5-3Z',
  results: 'M4 20h16M7 16v-5M12 16V7M17 16V3',
};
export function Icon({
  kind,
  monochrome = false,
}: {
  kind: Destination['kind'];
  monochrome?: boolean;
}) {
  if (monochrome)
    return (
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={paths[kind]} />
      </svg>
    );
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
