export type Destination = {
  id: string;
  kind:
    | 'website'
    | 'instagram'
    | 'review'
    | 'whatsapp'
    | 'phone'
    | 'services'
    | 'location'
    | 'brochure'
    | 'enquiry'
    | 'courses'
    | 'timings'
    | 'youtube'
    | 'results';
  title: string;
  description: string;
  url: string;
  cta: string;
  cardCta: string;
  handle?: string;
  disabled?: boolean;
};
export type Brand = {
  slug: string;
  name: string;
  tagline: string;
  logo: string;
  category: string;
  placeholder?: boolean;
  decor?: string[];
  experience: 'food' | 'elevator' | 'education';
  copy: {
    brandLine: string;
    heading: string;
    description: string;
  };
  theme: {
    red: string;
    darkRed: string;
    softRed: string;
    green: string;
    cream: string;
    ink: string;
    muted: string;
    surfaceAlt: string;
    border: string;
  };
  links: Destination[];
};
