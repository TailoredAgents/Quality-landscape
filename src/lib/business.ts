export const business = {
  name: "Quality Landscape & More LLC",
  shortName: "Quality Landscape & More",
  location: "Vidalia, Georgia",
  phone: "(912) 585-3450",
  phoneHref: "tel:+19125853450",
  phoneVerified: false,
  servicesVerified: false,
  ownerStory: null as string | null,
  ownerPhoto: null as string | null,
  testimonials: [] as { quote: string; name: string }[],
  approvedForLaunch: false,
};

export const services = [
  {
    id: "lawn-maintenance",
    title: "Lawn Maintenance",
    short: "A fresh cut. A welcoming first impression.",
    image: "/images/lawn.jpg",
    alt: "A green residential lawn surrounding a white home",
    description:
      "A well-kept lawn brings the whole property together. Discuss grass cutting and routine lawn maintenance that suit your outdoor space, with attention to the finish that makes a yard feel cared for.",
    details: [
      "Grass cutting and lawn upkeep",
      "Care around borders and landscape features",
      "A maintenance plan discussed around your property",
    ],
  },
  {
    id: "trimming-edging",
    title: "Trimming & Edging",
    short: "Clean lines. A beautifully finished property.",
    image: "/images/trimming.jpg",
    alt: "Close-up of garden shears carefully trimming a hedge",
    description:
      "The finishing touches matter. Neatly trimmed greenery and defined lawn edges give outdoor spaces a more considered appearance, from the front walk to the garden border.",
    details: [
      "Trimming for a neat, balanced appearance",
      "Defined lawn edges",
      "Attention to the smaller details",
    ],
  },
  {
    id: "irrigation",
    title: "Irrigation Services",
    short: "Thoughtful care, right down to the roots.",
    image: "/images/irrigation.jpg",
    alt: "A lawn sprinkler watering grass in warm evening light",
    description:
      "Have a question about irrigation on your property? Share what you need and discuss the available irrigation-related services directly. The right scope begins with a conversation about your existing setup.",
    details: [
      "Discuss existing irrigation needs",
      "Describe coverage or watering concerns",
      "Confirm the available service scope before work begins",
    ],
  },
  {
    id: "property-care",
    title: "General Property Care",
    short: "A little more care, from corner to corner.",
    image: "/images/garden.jpg",
    alt: "An established garden with shaped shrubs and a green lawn",
    description:
      "Good property care looks beyond a single patch of grass. Tell us about the areas that need attention and discuss practical maintenance to keep your outdoor space looking tidy and inviting.",
    details: [
      "General outdoor property upkeep",
      "Care for a well-presented exterior",
      "An agreed scope tailored to your needs",
    ],
  },
];

// Illustrative photographs only. Replace this manifest with owner-approved work.
// Optional comparison pairs allow real before/after photography after approval.
export type GalleryItem = {
  src: string;
  alt: string;
  category: string;
  title: string;
  beforeSrc?: string;
};
export const gallery: GalleryItem[] = [
  {
    src: "/images/property.jpg",
    alt: "A residential property with an open green lawn and established trees",
    category: "Lawns",
    title: "A welcoming first impression",
  },
  {
    src: "/images/trimming.jpg",
    alt: "Shears shaping the edge of a green hedge",
    category: "Details",
    title: "Care in the finishing touches",
  },
  {
    src: "/images/irrigation.jpg",
    alt: "Sprinkler droplets catching golden light above grass",
    category: "Irrigation",
    title: "Care that goes below the surface",
  },
  {
    src: "/images/lawn.jpg",
    alt: "Fresh green lawn beside a white home and curved garden beds",
    category: "Lawns",
    title: "Room to enjoy the outdoors",
  },
  {
    src: "/images/garden.jpg",
    alt: "A landscaped garden with green lawn and neatly shaped shrubs",
    category: "Details",
    title: "A thoughtfully maintained space",
  },
  {
    src: "/images/hero.jpg",
    alt: "A suburban home with lawn and trimmed foundation shrubs",
    category: "Lawns",
    title: "The details around home",
  },
];
